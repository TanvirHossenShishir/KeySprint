"use client";

import { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Room from "../../../components/room";

const Deck = ({ params }) => {
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [isCountdownActive, setIsCountdownActive] = useState(false);
  const [countdown, setCountdown] = useState(8); // Initial countdown value
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState(generateRandomUsername());
  const [inputValue, setInputValue] = useState("");
  const [roomJoined, setRoomJoined] = useState(false);
  const [userActivity, setUserActivity] = useState([]);
  const [isPuncOn, setIsPuncOn] = useState(false);
  const [isNumbOn, setIsNumbOn] = useState(false);
  const [users, setUsers] = useState([]);
  const [isValidRoom, setIsValidRoom] = useState(null);
  const [owner, setOwner] = useState(null);
  const [isOwner, setIsOwner] = useState(false);

  const socketInitialized = useRef(false);

  function generateRandomUsername() {
    const adjectives = [
      "Bold",
      "Swift",
      "Wise",
      "Cute",
      "Fierce",
      "Neat",
      "Calm",
      "Keen",
      "Brave",
      "Bright",
    ];
    const nouns = [
      "Star",
      "Wave",
      "Fire",
      "Lion",
      "Moon",
      "Rock",
      "Bird",
      "Tree",
      "Cat",
      "Wolf",
    ];
    return `${adjectives[Math.floor(Math.random() * adjectives.length)]}${
      nouns[Math.floor(Math.random() * nouns.length)]
    }`;
  }

  const addActivity = (newActivity) =>
    setUserActivity((prev) => [...prev, newActivity]);

  const findOwner = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}`);
      const data = await response.json();
      if (data.exists) {
        setIsOwner(data.owner.username === username);
        setOwner(data.owner.username);
      }
    } catch (error) {
      console.error("Failed to find owner:", error);
    }
  };

  const initializeRoom = async () => {
    try {
      const response = await fetch(`/api/rooms/${params.id}`);
      const data = await response.json();
      setIsValidRoom(data.exists);
    } catch (error) {
      console.error("Failed to check room validity:", error);
      setIsValidRoom(false);
    }
  };

  const updateRoomOwner = async () => {
    try {
      const response = await fetch("/api/updateRoomOwner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roomId: params.id, username }),
      });
      const data = await response.json();
      findOwner();
      if (data.success) console.log("Owner Updated");
      else console.error("Failed to update room owner:", data.error);
    } catch (error) {
      console.error("Failed to update room owner:", error);
    }
  };

  const socketInitializer = async () => {
    await fetch("/api/socket/ioserver");
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on("connect", () =>
      console.log("Socket connected:", newSocket.id)
    );
    newSocket.on("room-users", setUsers);
    newSocket.on("user-joined", (newUser) => addActivity([newUser, "joined"]));
    newSocket.on("user-left", (leftUser) => addActivity([leftUser, "left"]));
    newSocket.on("disconnect", () => console.log("Socket disconnected"));

    // Listen for the start countdown event
    newSocket.on("start-countdown", ({ countdown }) => {
      setCountdown(countdown);
      setIsCountdownActive(true);
    });

    return newSocket;
  };

  useEffect(() => {
    initializeRoom();

    if (!socketInitialized.current && isValidRoom) {
      socketInitializer();
      socketInitialized.current = true;
    }

    return () => socket && socket.disconnect();
  }, [params.id, isValidRoom]);

  useEffect(() => {
    if (socket && !roomJoined && isValidRoom) {
      socket.emit("join-room", params.id, username);
      setRoomJoined(true);
      updateRoomOwner();
    }
  }, [socket, params.id, username, roomJoined, isValidRoom]);

  useEffect(() => {
    let countdownInterval;
    if (isCountdownActive && countdown > 0) {
      countdownInterval = setInterval(() => {
        setCountdown((prevCountdown) => prevCountdown - 1);
      }, 1000);
    } else if (countdown === 0) {
      clearInterval(countdownInterval);
      setIsCountdownActive(false);
      setIsGameStarted(true); // Start the game after countdown
    }
    return () => clearInterval(countdownInterval);
  }, [isCountdownActive, countdown]);

  const handleInputChange = (event) => setInputValue(event.target.value);

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && inputValue.trim())
      setUsername(inputValue.trim());
  };

  const handlePunctuation = () => setIsPuncOn(!isPuncOn);
  const handleNumber = () => setIsNumbOn(!isNumbOn);

  const handleStartGame = () => {
    if (isOwner && socket) {
      socket.emit("start-countdown", params.id);
    }
  };

  return (
    <div className="bg_dark h-full px-28 py-5">
      {isGameStarted ? (
        <Room roomID={params.id} socket={socket} username={username} />
      ) : (
        <>
          {isValidRoom === null ? (
            <p className="text-2xl text-center text-white h-screen p-36">
              Checking room validity...
            </p>
          ) : isValidRoom ? (
            <div className="flex text-white gap-5">
              <div className="rounded-3xl p-5 bg_light w-2/5">
                <div className="flex justify-center">
                  <p className="cl_gray text-lg pl-1 pr-3 py-1">You: </p>
                  <input
                    placeholder={username}
                    className="text-lg bg-zinc-800 rounded-lg px-3 py-1 w-full focus:outline-none"
                    value={inputValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div className="flex mt-2 gap-3">
                  <p className="cl_gray text-lg pl-1 py-1">Mode: </p>
                  <button
                    onClick={handlePunctuation}
                    className={`zoom bg-zinc-800 text-xs px-2 rounded-lg ${
                      isPuncOn ? "bg_blue" : "bg-zinc-800 cl_gray"
                    }`}
                  >
                    PUNCTUATION
                  </button>
                  <button
                    onClick={handleNumber}
                    className={`zoom bg-zinc-800 text-xs px-2 rounded-lg ${
                      isNumbOn ? "bg_blue" : "bg-zinc-800 cl_gray"
                    }`}
                  >
                    NUMBER
                  </button>
                </div>
              </div>
              <div className="text-center rounded-3xl p-5 bg_light w-1/5">
                <p className="text-3xl text-center font-medium pb-2 cl_gray">
                  {users.length} / 8
                </p>
                {isCountdownActive ? (
                  <div className="flex items-center justify-center gap-2 text-zinc-300"><p>Starts in </p><p className="cl_pink text-3xl text-center font-bold">{countdown}</p></div>
                ) : isOwner ? (
                  <button
                    onClick={handleStartGame}
                    className="zoom text-xl text-center cl_pink font-bold bg_dark rounded-lg py-1 px-3"
                  >
                    START GAME
                  </button>
                ) : (
                  <p className="text-[16px] py-1 text-zinc-300">
                    Wait for the host to start.
                  </p>
                )}
              </div>
              <div className="rounded-3xl p-5 bg_light w-2/5">
                <p className="text-sm font-normal mt-3 cl_gray">
                  Share this link to invite your friends:
                </p>
                <p className="text-xl">
                  http://localhost:3000/room/{params.id}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-2xl text-center text-white h-screen p-36">
              This is not a valid room.
            </p>
          )}
          <div className="flex text-white gap-5">
            <div className="rounded-3xl mt-5 px-5 py-3 bg_light w-full h-72">
              <p className="text-2xl mb-2 font-medium text-white">Chat</p>
              <div className="border mb-2 px-3 py-2 rounded-lg h-44 border-zinc-600">
                {userActivity.map((pair, index) => (
                  <p key={index} className="text-zinc-300">
                    {pair[0]} has {pair[1]} the room.
                  </p>
                ))}
              </div>
              <input
                placeholder="Write a message..."
                className="text-lg bg-zinc-800 rounded-lg px-3 py-1 w-full focus:outline-none"
              />
            </div>
            <div className="rounded-3xl mt-5 px-5 py-3 bg_light w-full h-72">
              <p className="text-2xl mb-3 font-medium text-white">
                Players detail
              </p>
              <div className="grid grid-cols-2 gap-2">
                {users.map((user, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center bg-zinc-800 px-3 py-2 rounded-lg h-12"
                  >
                    <p className="truncate">
                      {owner === user.username
                        ? `${user.username}*`
                        : user.username}
                    </p>
                    <div className="flex gap-2 justify-between w-20">
                      <div className="text-center">
                        <p className="text-[12px] text-zinc-400">WPM</p>
                        <p className="text-sm text-white">{user.wpm || 0}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-[12px] text-zinc-400">ACC</p>
                        <p className="text-sm text-white">
                          {user.accuracy || 0}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Deck;
