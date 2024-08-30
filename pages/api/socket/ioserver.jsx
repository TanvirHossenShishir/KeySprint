import { Server } from "socket.io";

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

    socket.on("join-room", (room, username) => {
      socket.join(room);
      console.log(`Socket ${socket.id} joined room ${room} as ${username}`);

      if (!allMessage[room]) {
        allMessage[room] = { users: [] };
      }

      
      allMessage[room].users.push({ username, socketId: socket.id });
      console.log(
        `User ${username} with Socket ID ${socket.id} joined room ${room}`
      );

      
      io.to(room).emit("room-users", allMessage[room].users);
      console.log(`Users in room ${room}:`, allMessage[room].users);
    });

    socket.on("send-message", (obj) => {
      const { room } = obj;
      console.log("Received send-message event:", obj);

      if (obj.Message) {
        const { userId, message } = obj.Message;

        
        if (!allMessage[room]) {
          allMessage[room] = { users: [], messages: {} };
        }

        if (!allMessage[room].messages) {
          allMessage[room].messages = {};
        }

        allMessage[room].messages[userId] = message;

        console.log(
          `Updated messages/caret positions for room ${room}:`,
          allMessage[room].messages
        );

        io.to(room).emit("receive-message", allMessage[room].messages);
      } else {
        console.warn(
          "Received message does not contain expected structure:",
          obj
        );
      }
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);

      for (const room in allMessage) {
        if (allMessage.hasOwnProperty(room)) {
          const userIndex = allMessage[room].users.findIndex(
            (user) => user.socketId === socket.id
          );

          if (userIndex !== -1) {
            const [removedUser] = allMessage[room].users.splice(userIndex, 1);
            console.log(
              `Removed user ${removedUser.username} with Socket ID ${socket.id} from room ${room}`
            );

            io.to(room).emit("room-users", allMessage[room].users);
          }
        }
      }
    });
  });

  console.log("Socket.io server set up");
  res.end();
}

