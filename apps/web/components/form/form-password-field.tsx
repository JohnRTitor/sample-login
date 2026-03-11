"use client";

import { useState } from "react";
import { cn } from "@workspace/ui/lib/utils";
import { useFieldContext } from "@/lib/form";
import { Button } from "@workspace/ui/components/button";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@workspace/ui/components/input-group";

interface FormPasswordFieldProps extends Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "onBlur" | "type"
> {
  label?: React.ReactNode;
  description?: string;
  className?: string;
  labelClassName?: string;
}

export function FormPasswordField({
  label = "Password",
  description,
  className,
  labelClassName,
  ...rest
}: FormPasswordFieldProps) {
  const field = useFieldContext<string>();
  const [showPassword, setShowPassword] = useState(false);

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className={cn("", className)} data-invalid={isInvalid}>
      {label && (
        <FieldLabel htmlFor={field.name} className={cn(labelClassName)}>
          {label}
        </FieldLabel>
      )}

      <InputGroup>
        <InputGroupInput
          id={field.name}
          type={showPassword ? "text" : "password"}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          className="pr-9"
          {...rest}
        />

        <InputGroupAddon align="inline-end">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute inset-y-0 right-0 h-full w-8 rounded-l-none text-muted-foreground hover:text-foreground"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            tabIndex={-1}
          >
            {showPassword ? (
              <EyeOffIcon className="size-4" />
            ) : (
              <EyeIcon className="size-4" />
            )}
          </Button>
        </InputGroupAddon>
      </InputGroup>

      {!isInvalid && description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
