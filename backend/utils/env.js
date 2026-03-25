import "dotenv/config";
import { z } from "zod";

const mongoUriSchema = z
  .string()
  .min(1, "MONGODB_URI is required")
  .refine((value) => value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"), {
    message: "MONGODB_URI must start with mongodb:// or mongodb+srv://",
  });

const envSchema = z.object({
  NODE_ENV: z.string().default("development"),
  PORT: z.coerce.number().int().positive().max(65535).default(4000),
  JWT_SECRET: z.string().min(10, "JWT_SECRET must be at least 10 characters"),
  JWT_EXPIRES_IN: z.string().default("1h"),
  MONGODB_URI: mongoUriSchema,
  MONGODB_DB_NAME: z.string().default("prescripto"),
  CLOUDINARY_NAME: z.string().min(1, "CLOUDINARY_NAME is required"),
  CLOUDINARY_API_KEY: z.string().min(1, "CLOUDINARY_API_KEY is required"),
  CLOUDINARY_SECRET_KEY: z.string().min(1, "CLOUDINARY_SECRET_KEY is required"),
  ALLOWED_ORIGINS: z.string().default(""),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().optional(),
  RATE_LIMIT_MAX: z.coerce.number().optional(),
  RATE_LIMIT_AUTH_WINDOW_MS: z.coerce.number().optional(),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().optional(),
  BODY_LIMIT: z.string().default("1mb"),
});

export const env = envSchema.parse(process.env);

if (env.NODE_ENV === "production" && !env.ALLOWED_ORIGINS.trim()) {
  throw new Error("ALLOWED_ORIGINS is required in production");
}
