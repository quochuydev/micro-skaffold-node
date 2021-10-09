import mongoose from "mongoose";

const RoomSchema = new mongoose.Schema({
  userIds: [],
});

const roomModel = mongoose.model("room", RoomSchema);

export default roomModel;
