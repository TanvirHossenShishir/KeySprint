"use client";

import React, { useState, useEffect, KeyboardEvent, ChangeEvent } from "react";
import { words } from "./words.json";

const Dashboard = () => {
  


  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matchingChars, setMatchingChars] = useState<number>(0);
  const [matchingWords, setMatchingWords] = useState<number>(0);
  const [isCharRight, setIsCharRight] = useState(true);
  const currentWord = words[currentIndex];


  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      event.preventDefault();

      setMatchingChars((prevMatchingChars) =>
        Math.max(0, prevMatchingChars - 1)
      );

      setUserInput((prevUserInput) => prevUserInput.slice(0, -1));

      setIsCharRight(true);
    }
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

  const [otherCaretPositions, setOtherCaretPositions] = useState<number[][]>([
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
    [0, 0],
  ]);
  

  useEffect(() => {
    const increaseCaretPositionsRandomly = () => {
      const newCaretPositions = otherCaretPositions.map(([row, col]) => {
        const newRow = Math.min(
          row + Math.floor(Math.random() * 3),
          words.length - 1
        );
        const newCol = Math.min(
          col + Math.floor(Math.random() * 3),
          words[newRow].length - 1
        );
        return [newRow, newCol];
      });
      setOtherCaretPositions(newCaretPositions);
    };

    const interval = setInterval(increaseCaretPositionsRandomly, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [otherCaretPositions]);

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
                        ? "border-blue-500"
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
                    {/* {isCaret && (
                      <div className="text-blue-500 text-3xl absolute -top-2 -left-1">
                        *
                      </div>
                    )} */}

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
            isInputFocused ? "opacity-0" : "opacity-80 bg-neutral-200 blur-4xl"
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

export default Dashboard;
