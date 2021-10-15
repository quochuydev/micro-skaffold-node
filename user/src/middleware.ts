import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";

import userModel from "./models/user";
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
