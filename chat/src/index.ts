import express from "express";
import { json } from "body-parser";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";
import jwt from "jsonwebtoken";
import { createAdapter } from "socket.io-redis";
import { RedisClient } from "redis";
import mongoose from "mongoose";

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
} as any);

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

app.get("/shutdown", (req, res) => {
  // res.sendStatus(200);
  process.exit(0);
});

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    // @ts-ignore
    transports: ["websocket", "polling"],
    credentials: true,
  },
  allowEIO3: true,
  path: "/socket",
});

// @ts-ignore
const pubClient = new RedisClient({
  host: process.env.REDIS_URI!,
  port: 6379,
});

const subClient = pubClient.duplicate();

io.adapter(createAdapter({ pubClient, subClient }));

io.use(async (socket: any, next) => {
  if (socket.handshake.query && socket.handshake.query.token) {
    const token = socket.handshake.query.token;
    const payload: any = jwt.verify(token, process.env.JWT_KEY!);
    if (payload) {
      const user = { id: "" };
      socket.personal_room = user.id;
      socket.join(user.id);
      socket.user = user;
      next();
    }
  } else {
    next(new Error("Authentication error"));
  }
}).on("connection", (socket: any) => {
  socket.typing = false;
  socket.chat_room = false;

  socket.on("channel.join", async (data: any) => {
    const { id } = data;
    socket.chat_room = id;
    socket.join(id);
    socket.emit("notification", {
      message: "You joined the Chat",
      status: true,
    });
  });

  socket.on("channel.leave", async (data: any) => {
    const { id } = data;
    socket.leave(id);
  });

  socket.on("channel.message", async (data: any) => {
    const { id, type, content } = data;
    const user = socket.user;
    socket.to(id).emit("channel.message", { id, type, content, user });
    socket.to(socket.personal_room).emit("channel.list.reload");
  });

  socket.on("channel.typing.start", async (data: any) => {
    const user = socket.user;
    socket.typing = true;
    socket.broadcast.emit("channel.typing.processing", user);
  });

  socket.on("channel.typing.stop", async (data: any) => {
    const user = socket.user;
    socket.typing = false;
    socket.broadcast.emit("channel.typing.stop", user);
  });

  socket.on("channel.seen", async () => {
    const user = socket.user;
    socket.to(socket.chat_room).emit("channel.seen", {});
  });

  socket.on("channel.delete", async (data: any) => {
    const { id } = data;
    const user = socket.user;
  });
});

server.listen(4000, () => {
  console.log("Communication Service is listening on port 4000");
});
