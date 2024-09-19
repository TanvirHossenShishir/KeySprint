"use client";

import React, { useState, useEffect, useRef } from "react";
import { words } from "@/lib/words.json";

const Room = ({ roomID, socket, username }) => {
  const [room, setRoom] = useState(roomID);
  const [timer, setTimer] = useState(0);
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [users, setUsers] = useState([]);
  const timerRef = useRef(0);
  const currentIndexRef = useRef(0);
  const matchingCharsRef = useRef(0);
  const correctCharCntRef = useRef(0);
  const wrongCharCntRef = useRef(0);
  const matchingWordsRef = useRef(0);
  const userInputRef = useRef("");

  useEffect(() => {
    setIsTimerStarted(true);
    if (socket) {
      socket.on("receive-message", (messages) => {
        console.log("Received updated messages/caret positions:", messages);
        const extractedCaretPositions = Object.values(messages);
        setOtherCaretPositions(extractedCaretPositions);
      });
      socket.on("room-users", setUsers);
    }
  }, [socket]);

  const [userInput, setUserInput] = useState("");
  const [isCharRight, setIsCharRight] = useState(true);
  const currentWord = words[currentIndexRef.current];
  const [otherCaretPositions, setOtherCaretPositions] = useState([
    [0, 0],
    [0, 0],
  ]);

  const calculateWPM = () => {
    const minutes = timerRef.current / 60;
    return minutes > 0 ? (matchingWordsRef.current / minutes).toFixed(2) : 0;
  };

  const calculateAccuracy = () => {
    const totalCharsTyped = correctCharCntRef.current + wrongCharCntRef.current;
    return totalCharsTyped > 0
      ? ((correctCharCntRef.current / totalCharsTyped) * 100).toFixed(0)
      : 100;
  };

  const sendMessage = () => {
    const Message = {
      userId: username,
      message: [currentIndexRef.current, matchingCharsRef.current],
      wpm: calculateWPM(),
      accuracy: calculateAccuracy(),
    };

    if (socket) {
      socket.emit("send-message", {
        Message,
        room,
      });
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      matchingCharsRef.current = Math.max(0, matchingCharsRef.current - 1);
      userInputRef.current = userInputRef.current.slice(0, -1);
      setUserInput(userInputRef.current); 
      setIsCharRight(true);
    }
    sendMessage(); 
  };

  const handleChange = (event) => {
    const value = event.target.value;

    if (
      value[matchingCharsRef.current] ===
      words[currentIndexRef.current][matchingCharsRef.current]
    ) {
      matchingCharsRef.current += 1;
      correctCharCntRef.current += 1;
      userInputRef.current = value;
      setUserInput(userInputRef.current); 
      setIsCharRight(true);
    } 
    else {
      setIsCharRight(false);
      wrongCharCntRef.current += 1;
      return;
    }

    if (value === words[currentIndexRef.current]) {
      currentIndexRef.current += 1;
      matchingWordsRef.current += 1;
      matchingCharsRef.current = 0;
      userInputRef.current = "";
      setUserInput(""); 
    }

    sendMessage(); 
  };

  const [isInputFocused, setIsInputFocused] = useState(false);

  const handleInputFocus = () => {
    setIsInputFocused(true);
  };

  const handleInputBlur = () => {
    setIsInputFocused(false);
  };

  useEffect(() => {
    if (isTimerStarted) {
      const timerInterval = setInterval(() => {
        timerRef.current += 1;
        setTimer(timerRef.current); 
        sendMessage();
      }, 1000);

      return () => clearInterval(timerInterval);
    }
  }, [isTimerStarted, socket, room, username]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  function sumOfAsciiChars(str) {
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i);
    }
    return sum;
  }

  return (
    <div className="flex flex-col items-center h-screen">
      <div className="flex bg_light mb-5 h-12 w-4/5 rounded-2xl justify-center items-center">
        <div className="flex justify-center items-center p-4 h-full text-white text-4xl">
          {formatTime(timer)}
        </div>
      </div>
      <div className="flex flex-wrap w-full p-3 rounded-3xl h-52 bg-[#303034]">
        {words.map((word, index) => {
          const isCurrentWord = index === currentIndexRef.current;
          const alreadyTyped = index < matchingWordsRef.current;
          return (
            <div className="p-1  w-fit flex text-zinc-500" key={index}>
              {word.split("").map((char, charIndex) => {
                const isMatching = charIndex < matchingCharsRef.current;
                const isCaret = isCurrentWord && charIndex === matchingCharsRef.current;
                const charClassName = `relative flex items-center text-xl font-medium border-l-2  ${
                  isCurrentWord || alreadyTyped
                    ? isMatching || alreadyTyped
                      ? "text-zinc-300"
                      : ""
                    : ""
                } 
                  ${
                    isCaret
                      ? isCharRight
                        ? "border-yellow-500"
                        : "border-red-500"
                      : "border-[#303034]"
                  }
                `;

                const hasOtherCaret =
                  otherCaretPositions.find((pos) => {
                    if (Array.isArray(pos) && pos.length === 2) {
                      const [row, col] = pos;
                      return row === index && col === charIndex;
                    }
                    return false;
                  }) !== undefined;

                return (
                  <div className={charClassName} key={charIndex}>
                    {hasOtherCaret && (
                      <div className="text-red-500 text-2xl absolute -top-3 -left-2 rotate-180">
                        ^
                      </div>
                    )}

                    {char}
                  </div>
                );
              })}
            </div>
          );
        })}

        <input
          className={`${
            isInputFocused ? "opacity-0" : "opacity-0"
          } w-10/12 h-96 absolute top-44 left-44 text-lg text-center placeholder-neutral-900`}
          type="text"
          value={userInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Click here to start typing"
        />
      </div>
      <div className="mt-5 bg_dark w-full h-36">
        <div className="grid grid-cols-4 gap-4">
          {users.map((user, index) => (
            <div
              key={index}
              className="flex justify-between items-center bg_light pr-3 rounded-lg h-12"
            >
              <div className="flex items-center gap-2">
                <p
                  className={`flex justify-center items-center rounded-tl-lg rounded-bl-lg cl_${
                    (sumOfAsciiChars(roomID) + user.serial) % 8
                  } text-white text-2xl h-12 w-8`}
                >
                  {index + 1}
                </p>
                <p className="truncate text-white">{user.username}</p>
              </div>
              <div className="flex gap-2 justify-between w-20">
                <div className="text-center">
                  <p className="text-[12px] text-zinc-400">WPM</p>
                  <p className="text-sm text-white">{user.wpm}</p>
                </div>
                <div className="text-center">
                  <p className="text-[12px] text-zinc-400">ACC</p>
                  <p className="text-sm text-white">{user.accuracy}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Room;
