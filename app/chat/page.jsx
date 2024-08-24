"use client";

import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

let socket;

const Chat = () => {
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [room, setRoom] = useState("");
  const [allMessages, setAllMessages] = useState([]);
  const socketInitialized = useRef(false);

  useEffect(() => {
    if (!socketInitialized.current) {
      socketInitializer();
      socketInitialized.current = true;
    }

    return () => {
      if (socket) socket.disconnect();
    };
  }, []);

  async function socketInitializer() {
    if (socket) return;

    await fetch("/api/socket");
    socket = io();

    socket.on("receive-message", (data) => {
      setAllMessages((prev) => [...prev, data]);
    });
  }

  function handleJoinRoom() {
    if (room) {
      socket.emit("join-room", room);
      setAllMessages([]); 
    }
  }

  function handleSubmit(e) {
    e.preventDefault();

    socket.emit("send-message", {
      username,
      message,
      room, // Include room in the emitted message
    });

    setMessage("");
  }

  return (
    <div>
      <h1>Keysprint Group Chat</h1>
      <h2>Enter a username and room</h2>
      <input
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Enter your username"
      />
      <input
        value={room}
        onChange={(e) => setRoom(e.target.value)}
        placeholder="Enter room name"
      />
      <button onClick={handleJoinRoom}>Join Room</button>
      <br />
      <br />
      <form onSubmit={handleSubmit}>
        <input
          name="message"
          placeholder="Enter your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          autoComplete="off"
        />
        <button type="submit">Send</button>
      </form>
      <div>
        {allMessages
          .filter((msg) => msg.room === room)
          .map(({ username, message }, index) => (
            <div key={index}>
              <strong>{username}</strong>: {message}
            </div>
          ))}
      </div>
    </div>
  );
};

export default Chat;
