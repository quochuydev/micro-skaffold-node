import express from "express";

import roomModel from "../models/room";
import userModel from "../models/user";
import messageModel from "../models/message";
import middleware from "../middleware";

const router = express.Router();

router.get("/api/chat/rooms", async function (req, res: any) {
  const rooms = await roomModel.find({});
  res.json(rooms);
});

router.post("/api/chat/rooms", middleware, async (req: any, res: any) => {
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

router.get("/api/chat/rooms/:roomId/messages", async function (req, res: any) {
  const messages = await messageModel.find({ roomId: req.params.roomId });
  res.json(messages);
});

export default router;
