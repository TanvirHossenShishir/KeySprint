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


// import { NextApiResponseServerIO } from "@/types/next";
// import { NextApiRequest } from "next";

// // Create a Map to store userId to caret position
// const userCaretPositions = new Map<string, string>();

// const server = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
//   if (req.method === "POST") {
//     const { userId, message } = req.body;

//     // Update the caret position map with the received data
//     userCaretPositions.set(userId, message);

//     // You can also emit the updated userCaretPositions map to the client if needed
//     // res?.socket?.server?.io?.emit("caretPositionsUpdate", Array.from(userCaretPositions.entries()));

//     res.status(201).json({ status: "Caret position updated successfully." });
//   }
// };

// export default server;

