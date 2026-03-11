import { useFieldContext } from "@/lib/form";
import { Input } from "@workspace/ui/components/input";
import { Field, FieldError, FieldLabel } from "@workspace/ui/components/field";
import { cn } from "@workspace/ui/lib/utils";

type FormInputFieldProps = Omit<
  React.ComponentProps<"input">,
  "value" | "onChange" | "onBlur"
> & {
  label?: React.ReactNode;
  description?: string;
  className?: string;
  labelClassName?: string;
};

export function FormInputField({
  label,
  description,
  className,
  labelClassName,
  ...rest
}: FormInputFieldProps) {
  const field = useFieldContext<string>();

  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field className={cn("", className)} data-invalid={isInvalid}>
      {label && (
        <FieldLabel htmlFor={field.name} className={cn(labelClassName)}>
          {label}
        </FieldLabel>
      )}

      <Input
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        {...rest}
      />

      {!isInvalid && description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}

      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}
