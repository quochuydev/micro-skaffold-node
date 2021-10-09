import express, { NextFunction, Response } from "express";
import { json } from "body-parser";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { initSocketIO } from "./socket-io";
import userModel from "./models/user";
import messageModel from "./models/message";
import roomModel from "./models/room";
import config from "./config";

console.log("**********");
console.log("redis", process.env.REDIS_URI);
console.log("mongo", process.env.MONGO_URI);
console.log("jwt secret", config.jwtKey);

console.log("**********");

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

app.get("/api/rooms", async function (req, res: any) {
  const rooms = await roomModel.find({});
  res.json(rooms);
});

const middleware = async (req: any, res: Response, next: NextFunction) => {
  const token: any = req.headers["authorization"]?.split(" ")[1];
  const payload: any = jwt.verify(token, config.jwtKey);

  const user = await userModel.findById(payload._id);
  if (!user) {
    throw { message: "Not Found", status: 404 };
  }

  req.user = user;
  next();
};

app.post("/api/rooms", middleware, async function (req: any, res: any) {
  const { partnerId } = req.body;
  const userId = req.user._id;

  if (partnerId === userId) {
    throw { message: "Invalid data" };
  }
  const partner = await userModel.findById(partnerId);
  if (!partner) {
    throw { message: "Invalid partner" };
  }

  let room = await roomModel.findOne({
    userIds: { $all: [userId, partnerId] },
  });

  if (!room) {
    console.log("create room");
    room = await roomModel.create({ userIds: [userId, partnerId] });
  }

  res.json(room);
});

app.get("/api/rooms/:roomId/messages", async function (req, res: any) {
  const messages = await messageModel.find({ roomId: req.params.roomId });
  res.json(messages);
});

app.get("/api/users", async function (req: any, res: any) {
  const users = await userModel.find({});
  res.json(users);
});

app.get("/api/user", middleware, function (req: any, res: any) {
  res.json(req.user);
});

app.post("/api/signin", async function (req: any, res: any, next: any) {
  const { username, password } = req.body;

  const user = await userModel.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next({ message: "INVALID_USER" });
  }

  const token = jwt.sign({ _id: user._id }, "JWT_KEY");

  res.json({ user, token });
});

app.post("/api/signup", async function (req: any, res: any, next: any) {
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
  console.log("Service is listening on port 4000");
});
