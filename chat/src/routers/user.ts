import express from "express";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import userModel from "../models/user";
import middleware from "../middleware";

const router = express.Router();

router.get("/api/users", async function (req: any, res: any) {
  const users = await userModel.find({});
  res.json(users);
});

router.get("/api/user", middleware, function (req: any, res: any) {
  res.json(req.user);
});

router.post("/api/signin", async function (req: any, res: any, next: any) {
  const { username, password } = req.body;

  const user = await userModel.findOne({ username });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return next({ message: "INVALID_USER" });
  }

  const token = jwt.sign({ _id: user._id }, "JWT_KEY");

  res.json({ user, token });
});

router.post("/api/signup", async function (req: any, res: any, next: any) {
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

export default router;
