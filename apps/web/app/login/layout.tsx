import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login Page",
  description:
    "A simple user authentication demo built with Next.js, Better Auth, and PostgreSQL (with Prisma).",
};

export default function LoginLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div>{children}</div>;
}
