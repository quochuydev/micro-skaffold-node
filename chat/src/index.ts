import express from "express";
import { json } from "body-parser";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import { initSocketIO } from "./socket-io";

console.log(process.env.REDIS_URI);
console.log(process.env.MONGO_URI);

if (!process.env.REDIS_URI) {
  throw new Error("REDIS_URI must be defined");
}

if (!process.env.MONGO_URI) {
  throw new Error("MONGO_URI must be defined");
}

const app = express();

app.use(json());
app.use(cors());

const server = createServer(app);

mongoose.connect(process.env.MONGO_URI, {
  useFindAndModify: false,
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.get("/", function (req: any, res: any) {
  res.send("hello world, test in /api");
});

const MessageSchema = new mongoose.Schema({
  content: String,
});

const messageModel = mongoose.model("message", MessageSchema);

app.get("/api", async function (req: any, res: any) {
  await messageModel.create({ content: Date.now() });
  const messages = await messageModel.find({});
  res.json(messages);
});

initSocketIO(server);

server.listen(4000, () => {
  console.log("Communication Service is listening on port 4000");
});
