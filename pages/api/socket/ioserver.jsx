// import mongoose from "mongoose";
// import { Server } from "socket.io";

// await mongoose.connect(process.env.MONGODB_URI, {
//   dbName: "keysprintdb",
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const userSchema = new mongoose.Schema({
//   username: String,
//   socketId: String,
//   room: String,
// });

// const Participants = mongoose.model("Participants", userSchema);

// const allMessage = {};

// export default function SocketHandler(req, res) {
//   if (res.socket.server.io) {
//     console.log("Socket.io server already running");
//     res.end();
//     return;
//   }

//   const io = new Server(res.socket.server);
//   res.socket.server.io = io;

//   io.on("connection", (socket) => {
//     console.log(`New client connected: ${socket.id}`);

//     socket.on("join-room", async (room, username) => {
//       socket.join(room);
//       console.log(`Socket ${socket.id} joined room ${room} as ${username}`);

//       const user = new Participants({ username, socketId: socket.id, room });
//       await user.save();

//       const usersInRoom = await Participants.find({ room });
//       console.log(usersInRoom);

//       io.to(room).emit("room-users", usersInRoom);
//       io.to(room).emit("user-joined", username);
//     });


//     socket.on("send-message", async (obj) => {
//       const { room } = obj;
//       console.log("Received send-message event:", obj);

//       if (obj.Message) {
//         const { userId, message } = obj.Message;

        

//         if (!allMessage[room]) {
//           allMessage[room] = { users: [], messages: {} };
//         }

//         if (!allMessage[room].messages) {
//           allMessage[room].messages = {};
//         }

//         allMessage[room].messages[userId] = message;

//         console.log(allMessage[room].users);

//         console.log(
//           `Updated messages/caret positions for room ${room}:`,
//           allMessage[room].messages
//         );

//         io.to(room).emit("receive-message", allMessage[room].messages);
//       } else {
//         console.warn(
//           "Received message does not contain expected structure:",
//           obj
//         );
//       }
//     });

//     socket.on("start-countdown", (roomId) => {
//       io.to(roomId).emit("start-countdown", { countdown: 3 });
//     });

//     socket.on("disconnect", async () => {
//       console.log(`Client disconnected: ${socket.id}`);

//       const user = await Participants.findOneAndDelete({
//         socketId: socket.id,
//       });
//       if (user) {
//         const usersInRoom = await Participants.find({ room: user.room });
//         io.to(user.room).emit("room-users", usersInRoom);
//         io.to(user.room).emit("user-left", user.username);
//       }
//     });
//   });

//   console.log("Socket.io server set up");
//   res.end();
// }




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

      const user = new Participants({ username, socketId: socket.id, room });
      await user.save();

      const usersInRoom = await Participants.find({ room });
      console.log(usersInRoom);

      // Initialize room in allMessage if not already present
      if (!allMessage[room]) {
        allMessage[room] = { users: [], messages: {} };
      }

      // Add the user to the list of users in the room
      allMessage[room].users.push({ username, socketId: socket.id });

      // Emit updated user list to the room
      io.to(room).emit("room-users", allMessage[room].users);
      io.to(room).emit("user-joined", username);
    });

    socket.on("send-message", async (obj) => {
      const { room } = obj;
      console.log("Received send-message event:", obj);

      if (obj.Message) {
        const { userId, message } = obj.Message;

        // Initialize room in allMessage if not already present
        if (!allMessage[room]) {
          allMessage[room] = { users: [], messages: {} };
        }

        // Add/update the message for the user
        allMessage[room].messages[userId] = message;

        console.log(
          `Updated messages/caret positions for room ${room}:`,
          allMessage[room].messages
        );

        console.log(allMessage[room].users);

        io.to(room).emit("room-users", allMessage[room].users);

        // Emit updated messages to the room
        io.to(room).emit("receive-message", allMessage[room].messages);
      } else {
        console.warn(
          "Received message does not contain expected structure:",
          obj
        );
      }
    });

    socket.on("start-countdown", (roomId) => {
      io.to(roomId).emit("start-countdown", { countdown: 3 });
    });

    socket.on("disconnect", async () => {
      console.log(`Client disconnected: ${socket.id}`);

      // Find and remove the disconnected user from the database
      const user = await Participants.findOneAndDelete({
        socketId: socket.id,
      });

      if (user) {
        // Remove the user from the allMessage[room].users list
        if (allMessage[user.room]) {
          allMessage[user.room].users = allMessage[user.room].users.filter(
            (u) => u.socketId !== socket.id
          );
        }

        // Fetch updated users in the room
        const usersInRoom = await Participants.find({ room: user.room });

        // Emit updated user list to the room
        io.to(user.room).emit("room-users", usersInRoom);
        io.to(user.room).emit("user-left", user.username);
      }
    });
  });

  console.log("Socket.io server set up");
  res.end();
}
