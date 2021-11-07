import express from "express";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import userModel from "../models/user";
import middleware from "../middleware";

const router = express.Router();

router.get("/api/users/getList", async function (req: any, res: any) {
  const users = await userModel.find({});
  res.json(users);
});

router.get("/api/users/current", middleware, function (req: any, res: any) {
  res.json(req.user);
});

router.put("/api/users/:id", async function (req: any, res: any) {
  const user = await userModel.findOne({ _id: req.params.id });
  Object.assign(user, req.body);
  await user.save();
  res.json(user);
});

router.delete("/api/users/:id", async function (req: any, res: any) {
  const user = await userModel.findOne({ _id: req.params.id });
  Object.assign(user, { deletedAt: new Date() });
  await user.save();
  res.json(user);
});

router.post(
  "/api/users/signin",
  async function (req: any, res: any, next: any) {
    const { username, password } = req.body;

    const user = await userModel.findOne({ username, deletedAt: null });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return next({ message: "INVALID_USER" });
    }

    const token = jwt.sign({ _id: user._id }, "JWT_KEY");

    res.json({ user, token });
  }
);

router.post(
  "/api/users/signup",
  async function (req: any, res: any, next: any) {
    const { username, password } = req.body;

    const userExisted = await userModel.count({ username, deletedAt: null });
    if (userExisted) {
      return next({ message: "USER_EXISTED" });
    }

    const newUser = new userModel({ username, password });
    const user: any = await newUser.save();

    const token = jwt.sign({ _id: user._id }, "JWT_KEY");

    res.json({ token });
  }
);

export default router;
