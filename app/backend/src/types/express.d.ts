import "express";

declare global {
  namespace Express {
    export interface Request {
      userId?: number; // Add your custom property here
    }
  }
}
