import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL ?? "",
}) as ReturnType<typeof createAuthClient>;

export const { signIn, signUp, signOut, useSession } = authClient;
