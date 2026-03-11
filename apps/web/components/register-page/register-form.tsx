"use client";

import { useRouter } from "next/navigation";
import { signUp } from "@/lib/auth-client";
import { useAppForm } from "@/lib/form";
import { registerSchema } from "@/lib/schema/auth";
import { FieldGroup } from "@workspace/ui/components/field";
import { toast } from "sonner";

export default function RegisterForm() {
  const router = useRouter();

  const form = useAppForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },

    validators: {
      onSubmit: registerSchema,
    },

    onSubmit: async ({ value }) => {
      const { name, email, password } = value;

      const { error } = await signUp.email({
        name,
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
        <form.AppField name="name">
          {(field) => (
            <field.FormInputField
              label="Name"
              placeholder="John Doe"
              required
            />
          )}
        </form.AppField>

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
          loadingText="Creating account..."
        >
          Sign Up
        </form.LoadingButton>
      </FieldGroup>
    </form>
  );
}
