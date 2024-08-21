const allMessage = {};

const server = async (req, res) => {
  if (req.method === "POST") {
    // get message
    const message = req.body;

    allMessage[message.userId] = message.message;

    // log all messages
    for (const userId in allMessage) {
      console.log(`${userId}: ${allMessage[userId]}`);
    }

    // dispatch to channel "message"
    res?.socket?.server?.io?.emit("message", allMessage);

    // return message
    res.status(201).json(message);
  }
};

export default server;
