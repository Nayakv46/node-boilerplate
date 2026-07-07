import { Router, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { hash, verify } from "argon2";
import { PrismaClient } from "../prismaClient";
import { authenticateUser } from "../utils/authMiddleware";

const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const REFRESH_SECRET = process.env.REFRESH_SECRET || "your-refresh-secret";
const TOKEN_EXPIRY = "15m";
const REFRESH_TOKEN_EXPIRY = "7d";

interface TokenPayload {
  id: string;
  email: string;
}

interface TokenPair {
  access_token: string;
  refresh_token: string;
}

/**
 * Generate JWT access and refresh tokens
 */
const generateTokens = (payload: TokenPayload): TokenPair => {
  const access_token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: TOKEN_EXPIRY,
  });
  const refresh_token = jwt.sign(payload, REFRESH_SECRET, {
    expiresIn: REFRESH_TOKEN_EXPIRY,
  });
  return { access_token, refresh_token };
};

/**
 * POST /auth/signup
 * Create a new user and return tokens
 */
authRouter.post("/signup", async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user already exists
    const existingUser = await PrismaClient.users.findUnique({
      where: { email },
    });
    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    // Hash password
    const passwordHash = await hash(password);

    // Create user
    const user = await PrismaClient.users.create({
      data: {
        email,
        password_hash: passwordHash,
        first_name: firstName || null,
        last_name: lastName || null,
      },
    });

    // Generate tokens
    const tokens = generateTokens({ id: user.id, email: user.email });

    return res.status(201).json(tokens);
  } catch (err) {
    console.error("Signup error:", err);
    return res.status(500).json({ message: "Failed to create user" });
  }
});

/**
 * POST /auth/login
 * Authenticate user and return tokens
 */
authRouter.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Find user by email
    const user = await PrismaClient.users.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Verify password
    const passwordValid = await verify(user.password_hash, password);
    if (!passwordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens (include token_type via frontend expectation)
    const tokens = generateTokens({ id: user.id, email: user.email });

    return res.json({ ...tokens, token_type: "bearer" });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Login failed" });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token using refresh token
 */
authRouter.post("/refresh", async (req: Request, res: Response) => {
  try {
    const { refresh_token } = req.body;

    if (!refresh_token) {
      return res.status(400).json({ message: "Refresh token is required" });
    }

    // Verify refresh token
    let payload: any;
    try {
      payload = jwt.verify(refresh_token, REFRESH_SECRET);
    } catch (err) {
      return res.status(401).json({ detail: "Invalid token" });
    }

    // Verify user still exists
    const user = await PrismaClient.users.findUnique({
      where: { id: payload.id },
    });
    if (!user) {
      return res.status(401).json({ detail: "Not authenticated" });
    }

    // Generate new tokens
    const tokens = generateTokens({ id: user.id, email: user.email });

    return res.json({ ...tokens, token_type: "bearer" });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ message: "Token refresh failed" });
  }
});

/**
 * POST /auth/logout
 * Logout endpoint (primarily for audit/logging purposes)
 */
authRouter.post("/logout", async (req: Request, res: Response) => {
  // JWT tokens are stateless, so logout is mainly client-side
  // This endpoint can be used for audit trails or token blacklisting if needed
  return res.status(204).send();
});

/**
 * GET /auth/me
 * Return current authenticated user
 */
// authRouter.get("/me", async (req: Request, res: Response) => {
//   try {
//     const auth = req.headers["authorization"] as string | undefined;
//     if (!auth || !auth.startsWith("Bearer "))
//       return res.status(401).json({ detail: "Not authenticated" });

//     const token = auth.slice("Bearer ".length);
//     let payload: any;
//     try {
//       payload = jwt.verify(token, JWT_SECRET);
//     } catch (err) {
//       return res.status(401).json({ detail: "Invalid token" });
//     }

//     const user = await PrismaClient.users.findUnique({
//       where: { id: payload.id },
//     });
//     if (!user) return res.status(401).json({ detail: "Not authenticated" });

//     return res.json({
//       id: user.id,
//       email: user.email,
//       is_active: true,
//       is_admin: user.is_admin,
//     });
//   } catch (err) {
//     console.error("Me error:", err);
//     return res.status(500).json({ message: "Failed to fetch user" });
//   }
// });

authRouter.get("/me", authenticateUser, async (req, res) => {
  const user = await PrismaClient.users.findUnique({
    where: { id: req.userId },
  });

  if (!user) {
    return res.status(401).json({ detail: "Not authenticated" });
  }

  return res.json({
    id: user.id,
    email: user.email,
    is_admin: user.is_admin,
  });
});

export default authRouter;
