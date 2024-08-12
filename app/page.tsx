"use client";

import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { io as ClientIO } from "socket.io-client";
import { words } from "./words.json";

interface IServerMessage {
  userId: string;
  message: [number, number];
}

const Home = () => {
  const [connected, setConnected] = useState<boolean>(false);
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchingChars, setMatchingChars] = useState<number>(0);
  const [matchingWords, setMatchingWords] = useState<number>(0);
  const [isCharRight, setIsCharRight] = useState(true);
  const currentWord = words[currentIndex];
  const [currentCaretPosition, setCurrentCaretPosition] = useState([0, 0]);
  const [otherCaretPositions, setOtherCaretPositions] = useState([
    [0, 0],
    [0, 0],
  ]);

  const [username, setUsername] = useState("");

  useEffect(() => {
    const adjectives = ["Happy", "Funny", "Sunny", "Silly", "Clever", "Brave"];
    const nouns = ["Cat", "Dog", "Tiger", "Lion", "Elephant", "Kangaroo"];

    const randomAdjective =
      adjectives[Math.floor(Math.random() * adjectives.length)];
    const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
    const randomUsername = `${randomAdjective}${randomNoun}`;
    setUsername(randomUsername);
  }, []);

  

  const [input, setInput] = useState("");

  // dispatch message to other users by server
  const sendApiSocket = async (Message: IServerMessage): Promise<Response> => {
    return await fetch("/api/socket/server", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(Message),
    });
  };

  const sendMessage = async () => {
    const Message: IServerMessage = {
      userId: username,
      message: [currentIndex, matchingChars],
    };

    const resp = await sendApiSocket(Message);
    if (!resp.ok) {
      setTimeout(() => {
        sendMessage();
      }, 500);
    }
  };

  useEffect((): any => {
    const socket = new (ClientIO as any)(process.env.BASE_URL, {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    // log socket connection
    socket.on("connect", () => {
      console.log("SOCKET CONNECTED!", socket.id);
      setConnected(true);
    });

    // update client on new message dispatched from server
    socket.on("message", (message: Record<string, [number, number]>) => {
      console.log("Received message:", message);

      // Extract the array of caret positions from the message object
      const extractedCaretPositions = Object.values(message);
      console.log("Extracted:", extractedCaretPositions);


      // Update the otherCaretPositions state
      setOtherCaretPositions(extractedCaretPositions);
    });



    

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendMessage();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === "Backspace") {
      event.preventDefault();

      // setCurrentCaretPosition(([row, col]) => [row, Math.max(0, col - 1)]);

      setMatchingChars((prevMatchingChars) =>
        Math.max(0, prevMatchingChars - 1)
      );

      setUserInput((prevUserInput) => prevUserInput.slice(0, -1));

      setIsCharRight(true);
    }
    sendMessage();
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
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
                  otherCaretPositions.find(
                    ([row, col]) => row === index && col === charIndex
                  ) !== undefined;

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
          // className={`${
          //   isInputFocused ? "opacity-0" : "opacity-80 bg-neutral-200 blur-4xl"
          // } w-10/12 h-36 absolute top-44 left-46 text-lg text-center placeholder-neutral-900`}
          className={`${
            isInputFocused ? "opacity-0" : "opacity-0"
          } w-10/12 h-36 absolute top-44 left-46 text-lg text-center placeholder-neutral-900`}
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

export default Home;
