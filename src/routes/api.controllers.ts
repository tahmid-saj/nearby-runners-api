import { Request, Response } from "express";

export const subscribe = async (req: Request, res: Response): Promise<void> => {
  res.status(400).json({ error: "Use WebSocket to send messages." });
}

export const sendLocationUpdate = async (req: Request, res: Response) => {
  res.status(400).json({ error: "Use WebSocket to send messages." });
}

export const unsubscribe = async (req: Request, res: Response) => {
  res.status(400).json({ error: "Use WebSocket to send messages." });
}