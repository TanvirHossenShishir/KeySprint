"use client";

import React, { useState, useEffect, ChangeEvent } from "react";
import { io as ClientIO } from "socket.io-client";

interface IServerMessage {
  userName: string;
  message: string;
}

const Home = () => {

  const [connected, setConnected] = useState<boolean>(false);

  const [input, setInput] = useState("");

  // dispatch message to other users by server 
  const sendApiSocket = async (
    Message: IServerMessage
  ): Promise<Response> => {
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
      userName: "User",
      message: input,
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
    socket.on("message", (message: IServerMessage) => {
      console.log(message);
    });

    // socket disconnet onUnmount if exists
    if (socket) return () => socket.disconnect();
  }, []);

  const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    sendMessage();
  };

  return (
    <>
      <input
      placeholder="Type something"
      value={input}
      onChange={onChangeHandler}
      />
    </>
  );
};

export default Home;
