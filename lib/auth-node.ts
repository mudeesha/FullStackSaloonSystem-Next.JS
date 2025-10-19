// lib/auth-node.ts
import { sign } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export function signJwt(payload: object, expiresIn = "7d") {
  return sign(payload, JWT_SECRET, { expiresIn });
}
