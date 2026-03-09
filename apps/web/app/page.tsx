import Link from "next/link";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";

export default function HomePage() {
  return (
    <div className="flex h-screen items-center justify-center">
      <Card>
        <CardHeader>
          <CardTitle className="text-4xl">
            Start by creating accounts and logging in!
          </CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Button>
            <Link href="/login">Sign in</Link>
          </Button>

          <Button variant="outline" className="truncate">
            <Link href="/register">Create account</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
