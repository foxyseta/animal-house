import type { RequestHandler } from "express";
import { v4 } from "node-uuid";
import { compare } from "bcrypt";

import json from "../res";
import { User, UserLevel, shadow } from "../models/user";
import type { AuthenticatedRequest, AuthUser, AuthError } from "../auth";
import type { IRegisterData } from "../auth";

export const register = async (
  data: IRegisterData
): Promise<AuthUser | AuthError> => {
  try {
    if ((await User.findOne({ username: data.username }).exec()) != null)
      return { message: "This username is already taken" };
    const user = new User({ ...data, level: UserLevel.BASIC });
    await user.save();
    return { _id: user._id, level: user.level };
  } catch (err) {
    console.error("Error while registering user:", err);
    return { message: "Internal server error" };
  }
};

export const login = async (
  username: string,
  password: string
): Promise<AuthUser | AuthError> => {
  try {
    const result = await User.findOne({ username }).exec();
    if (result == null) return { message: "Invalid username" };
    if (await compare(password, result.password))
      return { _id: result._id, level: result.level };
    else return { message: "Invalid password" };
  } catch (err) {
    console.error("Error while logging user in:", err);
    return { message: "Internal server error" };
  }
};

export const id: RequestHandler = (_, res) => {
  json(res, 200, { id: v4() });
};

export const me: RequestHandler = async (req, res) => {
  const user = await User.findOne((req as AuthenticatedRequest).user).exec();
  if (user == null) throw new Error("User not found");
  json(res, 200, shadow(user));
};
