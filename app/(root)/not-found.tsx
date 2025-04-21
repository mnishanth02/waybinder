"use client";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/card";
import { ArrowLeft, Compass, MapPin } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";

export default function NotFound(): ReactNode {
  const [countdown, setCountdown] = useState(5);
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);

    if (countdown === 0) {
      router.push("/");
    }

    return () => clearInterval(interval);
  }, [countdown, router]);

  return (
    <div className="relative flex h-full w-full flex-1 flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        <Card className="border-border shadow-lg">
          <CardHeader className="flex flex-col items-center pb-4">
            <div className="mb-4 flex items-center justify-center rounded-full bg-muted p-4">
              <Compass className="h-12 w-12 animate-pulse text-primary" />
            </div>
            <CardTitle className="text-center font-bold text-3xl text-foreground">
              Page not found
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            <p className="mb-6 text-muted-foreground">
              The page you are searching for is not available.
            </p>
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              <MapPin className="h-5 w-5" />
              <span className="text-sm">Redirecting you back home in {countdown} seconds</span>
            </div>
          </CardContent>

          <CardFooter className="flex justify-center pt-2 pb-6">
            <Link
              href="/"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "relative h-12 w-full max-w-[200px] items-center overflow-hidden rounded-full font-bold transition-all hover:scale-105"
              )}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Go back home
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
