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
  owner: {
    username: {
      type: String,
      default: null, 
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
});

const Room = mongoose.models.Room || mongoose.model("Room", roomSchema);

export default Room;
