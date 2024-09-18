import mongoose from "mongoose";
import { Server } from "socket.io";

await mongoose.connect(process.env.MONGODB_URI, {
  dbName: "keysprintdb",
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const userSchema = new mongoose.Schema({
  username: String,
  socketId: String,
  room: String,
  serial: Number,
  wpm: Number,
  accuracy: Number,
});

const Participants = mongoose.model("Participants", userSchema);

const allMessage = {};

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

    socket.on("join-room", async (room, username) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room} as ${username}`);

      if (!allMessage[room]) {
        allMessage[room] = { users: [], messages: {} };
      }

      const serial = allMessage[room].users.length;
      console.log(serial);

      const wpm = 0;
      const accuracy = 100;

      const user = new Participants({
        username,
        socketId: socket.id,
        room,
        serial,
        wpm,
        accuracy,
      });
      await user.save();

      const usersInRoom = await Participants.find({ room });
      console.log(usersInRoom);

      allMessage[room].users.push({ username, socketId: socket.id, serial, wpm, accuracy });

      io.to(room).emit("room-users", allMessage[room].users);
      console.log(allMessage[room].users);
      io.to(room).emit("user-joined", username);
    });

    socket.on("send-message", async (obj) => {
      const { room } = obj;
      console.log("Received send-message event:", obj);

      if (obj.Message) {
        const { userId, message, wpm, accuracy } = obj.Message;

        if (!allMessage[room]) {
          console.warn(`Room ${room} does not exist.`);
          return;
        }

        const existingUser = allMessage[room].users.find(
          (user) => String(user.username) === String(userId)
        );

        if (!existingUser) {
          console.log(`User with userId ${userId} not found in room ${room}.`);
          return;
        }

        allMessage[room].messages[userId] = message;

        existingUser.wpm = wpm;
        existingUser.accuracy = accuracy;

        console.log(
          `Updated user ${userId} in room ${room} with WPM: ${wpm}, Accuracy: ${accuracy}`
        );
        console.log(
          `Updated messages/caret positions for room ${room}:`,
          allMessage[room].messages
        );

        io.to(room).emit("room-users", allMessage[room].users);
        io.to(room).emit("receive-message", allMessage[room].messages);
      } 
      else {
        console.log("Received message does not contain expected structure:", obj);
      }
    });

    socket.on("start-countdown", (roomId) => {
      io.to(roomId).emit("start-countdown", { countdown: 3 });
    });

    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);

      const user = await Participants.findOneAndDelete({
        socketId: socket.id,
      });

      if (user) {
        if (allMessage[user.room]) {
          allMessage[user.room].users = allMessage[user.room].users.filter(
            (u) => u.socketId !== socket.id
          );
        }

        // const usersInRoom = await Participants.find({ room: user.room });

        io.to(user.room).emit("room-users", allMessage[user.room].users);
        io.to(user.room).emit("user-left", user.username);
      }
    });
  });

  console.log("Socket.io server set up");
  res.end();
}


