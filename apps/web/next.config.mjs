import path from "node:path";
import { config } from "dotenv";

// Load .env from the monorepo root so all env vars are available to Next.js
config({ path: path.resolve(import.meta.dirname, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@workspace/ui", "@workspace/database"],
};

export default nextConfig;
