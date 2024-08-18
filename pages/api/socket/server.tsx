import { NextApiResponseServerIO } from "@/types/next";
import { NextApiRequest } from "next";

const allMessage: Record<string, number> = {};

const server = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (req.method === "POST") {
    // get message
    const message = req.body;

    allMessage[message.userId] = message.message;

    // console.log(allMessage["SunnyDog"]);
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