import { Schema, model } from "mongoose";
import * as bcrypt from "bcrypt";

import { natsWrapper } from "../nats-wrapper";

const UserSchema = new Schema({
  firstName: String,
  phoneNuber: String,
  email: { type: String },
  username: String,
  password: String,
  googleId: String,
  facebookId: String,
  createdAt: Date,
  updatedAt: Date,
  deletedAt: { type: Date, default: null },
});

UserSchema.pre("save", async function (done) {
  const hashed = await bcrypt.hash(this.get("password"), 10);
  this.set("password", hashed);
  done();
});

UserSchema.post("save", function (user, next) {
  natsWrapper.client.publish("user:updated", JSON.stringify(user), () => {
    console.log("Event user:updated published");
  });
  next();
});

UserSchema.post("findOneAndUpdate", function (user, next) {
  natsWrapper.client.publish("user:updated", JSON.stringify(user), () => {
    console.log("Event user:updated published");
  });
  next();
});

const User = model("User", UserSchema);

export default User;
