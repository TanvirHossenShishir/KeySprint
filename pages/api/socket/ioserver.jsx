import { Server } from "socket.io";

const allMessage = {}; // Now it's a 2D object, organized by rooms

export default function SocketHandler(req, res) {
  if (res.socket.server.io) {
    console.log("Socket.io server already running");
    res.end();
    return;
  }

  const io = new Server(res.socket.server);
  res.socket.server.io = io;

  io.on("connection", (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on("join-room", (room) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room}`);

      // Initialize the room's message storage if it doesn't exist
      if (!allMessage[room]) {
        allMessage[room] = {};
      }
    });

    socket.on("send-message", (obj) => {
      const { room } = obj;
      console.log(obj);

      if (obj.Message) {
        const { userId, message } = obj.Message;

        // Ensure the room exists in allMessage
        if (!allMessage[room]) {
          allMessage[room] = {};
        }

        // Store the message by userId within the specific room
        allMessage[room][userId] = message;

        console.log(`Messages for room ${room}:`, allMessage[room]);

        // Emit only the messages relevant to the specific room
        io.to(room).emit("receive-message", allMessage[room]);
      } else {
        console.warn(
          "Received message does not contain expected structure:",
          obj
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });

  console.log("Socket.io server set up");
  res.end();
}
