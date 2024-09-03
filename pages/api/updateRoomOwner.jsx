import { connectToDB } from "@/lib/database";
import Room from "../../models/room";

export default async function handler(req, res) {
  if (req.method === "POST") {
    await connectToDB();
    const { roomId, username } = req.body;

    try {
      const room = await Room.findOneAndUpdate(
        { roomId, "owner.username": null },
        { "owner.username": username },
        { new: true }
      );

      if (room) {
        res.status(200).json({ success: true });
      } else {
        res.status(404).json({ error: "Room not found or owner already set" });
      }
    } catch (error) {
      res.status(500).json({ error: "Failed to update room owner" });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
}
