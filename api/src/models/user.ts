import { Schema, model } from "mongoose";
import { v4 } from "node-uuid";
import { hash } from "bcrypt";
import { PASSWORD_SALT_ROUNDS } from "shared/endpoints";
import { IUser, IUserPet, UserLevel } from "shared/models/user";

const UserPet = new Schema<IUserPet>({
  name: { type: String, required: true },
  type: { type: String, required: true }
})

const UserSchema = new Schema<IUser>({
  _id: { type: String, default: v4 },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  level: {
    type: Number,
    required: true,
    enum: [UserLevel.BASIC, UserLevel.MANAGER],
  },
  firstName: { type: String, required: true },
  lastName: String,
  city: String,
  avatar: String,

  pets: [{ type: UserPet }],
});
UserSchema.pre("save", async function() {
  let password = "";
  try {
    password = (await User.findOne({ _id: this._id }))?.password || "";
  } catch (_) { }
  if (password != this.password)
    this.password = await hash(this.password, PASSWORD_SALT_ROUNDS);
});

export const User = model<IUser>("User", UserSchema);

export const shadow = ({
  _id,
  username,
  avatar,
  level,
  firstName,
  lastName,
  city,
  pets,
}: IUser) => ({ _id, username, avatar, level, firstName, lastName, city, pets });
