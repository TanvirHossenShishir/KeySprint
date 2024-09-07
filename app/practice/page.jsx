"use client";

import React, { useState, useEffect } from "react";
import { words } from "@/lib/words.json";

const Room = ({ roomID, socket, username }) => {
  const [room, setRoom] = useState(roomID);

  useEffect(() => {
    if (socket) {
      socket.on("receive-message", (messages) => {
        console.log("Received updated messages/caret positions:", messages);
        const extractedCaretPositions = Object.values(messages);
        setOtherCaretPositions(extractedCaretPositions);
      });
    }
  }, [socket]);

  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchingChars, setMatchingChars] = useState(0);
  const [matchingWords, setMatchingWords] = useState(0);
  const [isCharRight, setIsCharRight] = useState(true);
  const currentWord = words[currentIndex];
  const [otherCaretPositions, setOtherCaretPositions] = useState([
    [0, 0],
    [0, 0],
  ]);

  const sendMessage = () => {
    const Message = {
      userId: username,
      message: [currentIndex, matchingChars],
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

      setMatchingChars((prevMatchingChars) =>
        Math.max(0, prevMatchingChars - 1)
      );

      setUserInput((prevUserInput) => prevUserInput.slice(0, -1));

      setIsCharRight(true);
    }
    sendMessage();
  };

  const handleChange = (event) => {
    const value = event.target.value;

    if (value[matchingChars] === currentWord[matchingChars]) {
      setMatchingChars((prevMatchingChars) => prevMatchingChars + 1);
      setUserInput(value);
      setIsCharRight(true);
    } else {
      setIsCharRight(false);
      return;
    }

    if (value === currentWord) {
      setCurrentIndex((prevIndex) => prevIndex + 1);
      setUserInput("");
      setMatchingChars(0);
      setMatchingWords((prevMatchingWords) => prevMatchingWords + 1);
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

  return (
    <div className="flex justify-center items-start h-screen bg-neutral-200">
      <div className="flex flex-wrap py-44 w-10/12">
        {words.map((word, index) => {
          const isCurrentWord = index === currentIndex;
          const alreadyTyped = index < matchingWords;
          return (
            <div className="p-1 h-12 w-fit flex text-neutral-500" key={index}>
              {word.split("").map((char, charIndex) => {
                const isMatching = charIndex < matchingChars;
                const isCaret = isCurrentWord && charIndex === matchingChars;
                const charClassName = `relative flex items-center text-xl font-medium border-l-2 ${
                  isCurrentWord || alreadyTyped
                    ? isMatching || alreadyTyped
                      ? "text-neutral-900"
                      : ""
                    : ""
                } 
                  ${
                    isCaret
                      ? isCharRight
                        ? "border-yellow-500"
                        : "border-red-500"
                      : ""
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
          } w-10/12 h-72 absolute top-44 left-46 text-lg text-center placeholder-neutral-900`}
          type="text"
          value={userInput}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          placeholder="Click here to start typing"
        />
      </div>
    </div>
  );
};

export default Room;
