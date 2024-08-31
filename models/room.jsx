import mongoose from "mongoose";

const roomSchema = new mongoose.Schema({
  roomId: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  users: [
    {
      username: {
        type: String,
        required: true,
      },
      joinedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  // Add any other fields relevant to your application
});

// Use the existing compiled model if it exists, otherwise create a new one
const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default Room;
