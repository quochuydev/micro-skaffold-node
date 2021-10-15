import express from "express";
import { json } from "body-parser";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { Message } from "node-nats-streaming";

import { initSocketIO } from "./socket";
import roomRouter from "./routers/room";
import userRouter from "./routers/user";
import userModel from "./models/user";

import config from "./config";
import { natsWrapper } from "./nats-wrapper";

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

natsWrapper.connect("unichat", "chat", "http://localhost:4222").then(() => {
  const options = natsWrapper.client
    .subscriptionOptions()
    .setManualAckMode(true)
    .setDeliverAllAvailable()
    .setDurableName("chatService");

  natsWrapper.client.on("close", () => {
    console.log("NATS connection closed");
    process.exit();
  });

  process.on("SIGINT", () => natsWrapper.client.close());
  process.on("SIGTERM", () => natsWrapper.client.close());

  const userUpdatedSubscriber = natsWrapper.client.subscribe(
    "user:updated",
    "chatServiceQueueGroup",
    options
  );

  userUpdatedSubscriber.on("message", async (msg: Message) => {
    const eventData = JSON.parse(msg.getData().toString());
    console.log(eventData);
    msg.ack();
  });
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
