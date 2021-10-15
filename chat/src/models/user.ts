import mongoose, { Schema } from "mongoose";

const UserSchema = new Schema({
  firstName: String,
  referenceId: String,
});

const userModel = mongoose.model("user", UserSchema);

export default userModel;
