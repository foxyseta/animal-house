import type { Document } from "mongoose";
import type { IPet } from "./pet";

export enum UserLevel {
  BASIC,
  VIP,
  MANAGER,
}

export interface IUser extends Document {
  username: string;
  password: string;
  level: UserLevel;
  firstName: string;
  lastName?: string;
  city?: string;
  avatar?: string;

  pets: IPet[];
}
