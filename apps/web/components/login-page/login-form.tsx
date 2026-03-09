"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Spinner } from "@workspace/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { loginSchema } from "@/lib/schema/auth";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@workspace/ui/components/field";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();

  const form = useForm({
    formId: "login-form",

    defaultValues: {
      email: "",
      password: "",
    },

    validators: {
      onSubmit: loginSchema,
    },

    onSubmit: async ({ value }) => {
      const { email, password } = value;

      const { data, error } = await signIn.email({
        email,
        password,
      });

      if (error) {
        toast.error(error.message ?? "Something went wrong. Please try again.");
        return;
      }

      router.push("/dashboard");
    },
  });

  return (
    <form
      id={form.formId}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field name="email">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  type="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="you@example.com"
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>

        <form.Field name="password">
          {(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                <Input
                  id={field.name}
                  type="password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  aria-invalid={isInvalid}
                  placeholder="••••••••"
                />

                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        </form.Field>
      </FieldGroup>

      <Button type="submit" className="mt-4 w-full">
        {form.state.isSubmitting ? (
          <>
            <Spinner /> Signing in...
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
