import { connectToDB } from "@/lib/database";
import Room from '../../models/room';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    await connectToDB();
    const roomId = Math.floor(1000 + Math.random() * 9000).toString();
    const room = new Room({ roomId });

    try {
      await room.save();
      res.status(200).json({ roomId });
    } catch (error) {
      res.status(500).json({ error: 'Failed to create room' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
