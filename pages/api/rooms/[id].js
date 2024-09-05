// pages/api/rooms/[id].js
import mongoose from "mongoose";
import Room from "../../../models/room";

export default async function handler(req, res) {
  const { id } = req.query;

  await mongoose.connect(process.env.MONGODB_URI, {
    dbName: "keysprintdb",
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  const room = await Room.findOne({ roomId: id });

  if (room) {
    res.status(200).json({ exists: true, owner: room.owner });
  } else {
    res.status(404).json({ exists: false });
  }
}
