import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema({
  content: String,
  userId: String,
  roomId: String,
});

const messageModel = mongoose.model("message", MessageSchema);

export default messageModel;
