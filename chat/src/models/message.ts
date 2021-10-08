import mongoose from "mongoose";
import * as bcrypt from "bcrypt";

const MessageSchema = new mongoose.Schema({
  content: String,
  user_id: String,
});

const messageModel = mongoose.model("message", MessageSchema);

export default messageModel;
