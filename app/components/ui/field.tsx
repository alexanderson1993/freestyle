"use client";

import { cva, type VariantProps } from "class-variance-authority";
import {
  FieldError as AriaFieldError,
  type FieldErrorProps as AriaFieldErrorProps,
  Group as AriaGroup,
  type GroupProps as AriaGroupProps,
  Label as AriaLabel,
  type LabelProps as AriaLabelProps,
  Text as AriaText,
  type TextProps as AriaTextProps,
  composeRenderProps,
} from "react-aria-components";
import { useFormField } from "~/components/ui/form";

import { cn } from "~/utils/cn";

const labelVariants = cva([
  "text-sm font-medium leading-none",
  /* Disabled */
  "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-70",
  /* Invalid */
  "group-data-[invalid]:text-destructive",
]);

const Label = ({ className, ...props }: AriaLabelProps) => {
  const { formItemId } = useFormField();
  return (
    <AriaLabel
      className={cn(labelVariants(), className)}
      htmlFor={formItemId}
      {...props}
    />
  );
};

function FormDescription({ className, ...props }: AriaTextProps) {
  const { formDescriptionId } = useFormField();
  return (
    <AriaText
      id={formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
      slot="description"
    />
  );
}

function FieldError({ className, children, ...props }: AriaFieldErrorProps) {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error ?? "") : children;

  if (!body) {
    return null;
  }
  return (
    <AriaFieldError
      id={formMessageId}
      className={cn("text-sm font-medium text-destructive", className)}
      {...props}
    >
      {body}
    </AriaFieldError>
  );
}

const fieldGroupVariants = cva("", {
  variants: {
    variant: {
      default: [
        "relative flex h-10 w-full items-center overflow-hidden rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background",
        /* Focus Within */
        "data-[focus-within]:outline-none data-[focus-within]:ring-2 data-[focus-within]:ring-ring data-[focus-within]:ring-offset-2",
        /* Disabled */
        "data-[disabled]:opacity-50",
      ],
      ghost: "",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

interface GroupProps
  extends AriaGroupProps,
    VariantProps<typeof fieldGroupVariants> {}

function FieldGroup({ className, variant, ...props }: GroupProps) {
  return (
    <AriaGroup
      className={composeRenderProps(className, (className) =>
        cn(fieldGroupVariants({ variant }), className)
      )}
      {...props}
    />
  );
}

export {
  Label,
  labelVariants,
  FieldGroup,
  fieldGroupVariants,
  FieldError,
  FormDescription,
};
