import { Schema, model } from "mongoose";

import { natsWrapper } from "../nats-wrapper";

const UserSchema = new Schema({
  firstName: String,
  phoneNuber: String,
  email: { type: String },
  username: String,
  password: String,
  googleId: String,
  facebookId: String,
});

UserSchema.post("save", function (user, next) {
  natsWrapper.client.publish("user:updated", JSON.stringify(user), () => {
    console.log("Event user:updated published");
  });
  next();
});

const User = model("User", UserSchema);

export default User;
