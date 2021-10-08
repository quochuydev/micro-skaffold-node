import express from "express";
import { json } from "body-parser";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { initSocketIO } from "./socket-io";
import userModel from "./models/user";
import messageModel from "./models/message";

console.log(process.env.REDIS_URI);
console.log(process.env.MONGO_URI);

const app = express();

app.use(json());
app.use(cors());

const server = createServer(app);

mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/chat", {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

initSocketIO(server);

app.get("/", function (req: any, res: any) {
  res.send("hello world, test in /api");
});

app.get("/api", async function (req: any, res: any) {
  await messageModel.create({ content: Date.now() });
  const messages = await messageModel.find({}, null, { limit: 20 });
  res.json(messages);
});

app.get("/api/messages", async function (req, res: any) {
  const messages = await messageModel.find({});
  res.json(messages);
});

app.get("/api/user", async function (req, res: any) {
  const token: any = req.headers["authorization"]?.split(" ")[1];
  const payload: any = jwt.verify(token, "JWT_KEY");
  const user = await userModel.findById(payload._id);
  res.json(user);
});

app.post("/signin", async function (req: any, res: any, next: any) {
  const { username, password } = req.body;

  const user = await userModel.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next({ message: "INVALID_USER" });
  }

  const token = jwt.sign({ _id: user._id }, "JWT_KEY");
  res.json({ user, token });
});

app.post("/signup", async function (req: any, res: any, next: any) {
  const { username, password } = req.body;

  const userExisted = await userModel.count({ username });
  if (userExisted) {
    return next({ message: "USER_EXISTED" });
  }

  const newUser = new userModel({ username, password });
  const user: any = await newUser.save();

  const token = jwt.sign({ _id: user._id }, "JWT_KEY");
  res.json({ token });
});

app.use(function (err: any, req: any, res: any, next: any) {
  if (!err) {
    return next();
  }
  res.status(err.status || 400).send(err);
});

server.listen(4000, () => {
  console.log("Communication Service is listening on port 4000");
});
