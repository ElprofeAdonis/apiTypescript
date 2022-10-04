import { Request, Response } from "express";
import User, { IUser } from "../models/user";

import adoview from "jsonwebtoken";
import { isConstructorDeclaration } from "typescript";

export const signup = async (req: Request, res: Response) => {
  // guardar a un usuario
  console.log(req.body);
  const user: IUser = new User({
    nickname: req.body.nickname,
    username: req.body.username,
    lastname: req.body.lastname,
    email: req.body.email,
    password: req.body.password,
    fhone: req.body.fhone,
  });
  user.password = await user.encryptPassword(user.password);
  const savedUser = await user.save();
  //token
  const token: string = adoview.sign(
    { _id: savedUser._id },
    process.env.TOKEN_SECRET || "tokentest"
  );
  console.log(savedUser);
  res.header("auth-token", token).json(savedUser);
};

export const signin = async (req: Request, res: Response) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user)
    return res.status(400).json("El email o el passwor esta equivocado");

  const correctPassword: boolean = await user.validatePassword(
    req.body.password
  );
  if (!correctPassword) return res.status(400).json("Invalid Passsword");

  const token: string = adoview.sign(
    { _id: user._id },
    process.env.TOKEN_SECRET || "tokentest",
    {
      expiresIn: 60 * 60 * 78,
    }
  );
  res.header("auth-token", token).json(user);
};
