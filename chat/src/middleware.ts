import express, { NextFunction, Response } from "express";
import { json } from "body-parser";
import { createServer } from "http";
import cors from "cors";
import mongoose from "mongoose";
import * as bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";

import { initSocketIO } from "./socket-io";
import userModel from "./models/user";
import messageModel from "./models/message";
import roomModel from "./models/room";

import roomRouter from "./routers/room";

import config from "./config";
const middleware = async (req: any, res: Response, next: NextFunction) => {
  try {
    const token: any = req.headers["authorization"]?.split(" ")[1];
    const payload: any = jwt.verify(token, config.jwtKey);

    const user = await userModel.findById(payload._id);
    if (!user) {
      throw { message: "Not Found", status: 404 };
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).send(error);
  }
};

export default middleware;
