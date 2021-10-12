import express, { NextFunction, Response } from "express";
import { json } from "body-parser";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { initSocketIO } from "./socket";

import roomRouter from "./routers/room";
import userRouter from "./routers/user";

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

app.use(roomRouter);
app.use(userRouter);

app.use("/", express.static(path.resolve("client")));
app.get("/*", (req, res) => {
  res.sendFile(path.resolve("client", "index.html"));
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
