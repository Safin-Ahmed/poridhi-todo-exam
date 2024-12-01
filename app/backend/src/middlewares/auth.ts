import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { Action } from "routing-controllers";

// Middleware to secure routes
const authMiddleware = (action: Action, roles: string[]): any => {
  const token = action.request.headers.authorization?.split(" ")[1];
  if (!token) {
    return false;
  }
  try {
    const decoded = jwt.verify(token, "secretKey") as { id: number };
    action.request.userId = decoded.id;
    return true;
  } catch (error) {
    console.error("Invalid token: ", error);
    return false;
  }
};

export default authMiddleware;
