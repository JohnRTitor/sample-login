"use client";

import * as React from "react";
import { Button, buttonVariants } from "@workspace/ui/components/button";
import { Spinner } from "@workspace/ui/components/spinner";
import { cn } from "@workspace/ui/lib/utils";
import { type VariantProps } from "class-variance-authority";

type LoadingButtonProps = React.ComponentProps<typeof Button> &
  VariantProps<typeof buttonVariants> & {
    loading?: boolean;
    loadingText?: string;
  };

export function LoadingButton({
  loading = false,
  loadingText,
  children,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  return (
    <Button
      disabled={loading || disabled}
      className={cn("gap-2", className)}
      {...props}
    >
      {loading && <Spinner data-icon="inline-start" />}
      {loading ? (loadingText ?? children) : children}
    </Button>
  );
}
