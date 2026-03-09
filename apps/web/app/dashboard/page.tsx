"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle className="text-xl">Welcome</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one to get started.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Button className="w-full">
              <Link href="/login">Sign in</Link>
            </Button>

            <Button variant="outline" className="w-full truncate">
              <Link href="/register">Create account</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">Hello, {session.user.name}</CardTitle>
          <CardDescription>
            Welcome! You have now been logged in.
            <br />
            Your email: {session.user.email} <br />
            Account created at: {session.user.createdAt.toDateString()} <br />
            Last details updated at: {session.user.updatedAt.toDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            variant="outline"
            className="w-full"
            onClick={async () => {
              await signOut();
              router.push("/login");
            }}
          >
            Sign out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
