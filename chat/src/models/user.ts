import mongoose from "mongoose";
import * as bcrypt from "bcrypt";

const UserSchema = new mongoose.Schema({
  username: String,
  password: String,
  googleId: String,
  facebookId: String,
});

UserSchema.pre("save", async function (done) {
  const hashed = await bcrypt.hash(this.get("password"), 10);
  this.set("password", hashed);
  done();
});

const userModel = mongoose.model("user", UserSchema);

export default userModel;
