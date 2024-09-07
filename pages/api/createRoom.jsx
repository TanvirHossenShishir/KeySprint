import { connectToDB } from "@/lib/database";
import Room from "../../models/room";

function generateRandomRoomId(length = 4) {
  const characters =
    "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export default async function handler(req, res) {
  if (req.method === "POST") {
    await connectToDB();

    let roomId = generateRandomRoomId();
    let ex = await Room.findOne({ roomId: roomId });

    while (ex !== null) {
      roomId = generateRandomRoomId();
      ex = await Room.findOne({ roomId: roomId });
      console.log(ex);
    }

    const room = new Room({ roomId });

    try {
      await room.save();
      res.status(200).json({ roomId });
    } catch (error) {
      res.status(500).json({ error: "Failed to create room" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
