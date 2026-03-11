"use client";

import { useRouter } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { useAppForm } from "@/lib/form";
import { loginSchema } from "@/lib/schema/auth";
import { FieldGroup } from "@workspace/ui/components/field";
import { toast } from "sonner";

export default function LoginForm() {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      email: "",
      password: "",
    },

    validators: {
      onSubmit: loginSchema,
    },

    onSubmit: async ({ value }) => {
      const { email, password } = value;

      const { error } = await signIn.email({
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
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.AppField name="email">
          {(field) => (
            <field.FormInputField
              label="Email"
              type="email"
              placeholder="you@example.com"
            />
          )}
        </form.AppField>

        <form.AppField name="password">
          {(field) => <field.FormPasswordField label="Password" />}
        </form.AppField>

        <form.LoadingButton
          type="submit"
          loading={form.state.isSubmitting}
          loadingText="Signing in..."
        >
          Sign In
        </form.LoadingButton>
      </FieldGroup>
    </form>
  );
}
