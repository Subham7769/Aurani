const required = [
  "DATABASE_URL",
  "REDIS_URL",
  "CLERK_SECRET_KEY",
  "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
  "CLERK_WEBHOOK_SECRET",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "RAZORPAY_KEY_ID",
  "RAZORPAY_KEY_SECRET",
  "RAZORPAY_WEBHOOK_SECRET",
  "ENCRYPTION_KEY",
] as const;

export function validateEnv() {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables:\n${missing.map((k) => `  • ${k}`).join("\n")}\n\nCopy .env.example to .env.local and fill in all values.`,
    );
  }
}

export const env = {
  databaseUrl: process.env.DATABASE_URL!,
  redisUrl: process.env.REDIS_URL!,
  clerkSecretKey: process.env.CLERK_SECRET_KEY!,
  clerkWebhookSecret: process.env.CLERK_WEBHOOK_SECRET!,
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME!,
  cloudinaryApiKey: process.env.CLOUDINARY_API_KEY!,
  cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET!,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID!,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET!,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET!,
  encryptionKey: process.env.ENCRYPTION_KEY!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
