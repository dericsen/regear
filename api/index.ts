// api/index.ts
// Entry point for Vercel Serverless Functions
import { app } from "../server";
import type { Request, Response } from "express";

export default function handler(req: Request, res: Response) {
  // Normalize URL prefix so Express routes (/api/*) match regardless of Vercel rewrite stripping
  if (req.url) {
    if (!req.url.startsWith("/api") && !req.url.startsWith("/_")) {
      req.url = `/api${req.url.startsWith("/") ? "" : "/"}${req.url}`;
    }
  }
  return app(req, res);
}
