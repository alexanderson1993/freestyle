import type * as React from "react";
import {
  Input as AriaInput,
  type InputProps as AriaInputProps,
  TextArea as AriaTextArea,
  type TextAreaProps as AriaTextAreaProps,
  TextField as AriaTextField,
  type TextFieldProps as AriaTextFieldProps,
  type ValidationResult as AriaValidationResult,
  composeRenderProps,
  Text,
} from "react-aria-components";

import { cn } from "~/utils/cn";

import { FieldError, Label } from "./field";
import { FormFieldContext, useFormField } from "~/components/ui/form";

const TextField = (props: AriaTextFieldProps & { name: string }) => (
  <FormFieldContext value={{ name: props.name }}>
    <TextFieldWrapper {...props} />
  </FormFieldContext>
);
const TextFieldWrapper = (props: AriaTextFieldProps) => {
  const { error } = useFormField();
  return (
    <AriaTextField
      {...props}
      isInvalid={!!error}
      className={cn("group", props.className)}
    />
  );
};

const Input = ({
  className,
  ...props
}: AriaInputProps & { ref?: React.Ref<HTMLInputElement> }) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();
  return (
    <AriaInput
      className={composeRenderProps(className, (className) =>
        cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground",
          /* Disabled */
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          /* Focused */
          "data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-ring data-[focused]:ring-offset-2",
          /* Resets */
          "focus-visible:outline-none",
          className
        )
      )}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
};

const TextArea = ({ className, ...props }: AriaTextAreaProps) => {
  const { error, formItemId, formDescriptionId, formMessageId } =
    useFormField();
  return (
    <AriaTextArea
      className={composeRenderProps(className, (className) =>
        cn(
          "flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground",
          /* Focused */
          "data-[focused]:outline-none data-[focused]:ring-2 data-[focused]:ring-ring data-[focused]:ring-offset-2",
          /* Disabled */
          "data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
          /* Resets */
          "focus-visible:outline-none",
          className
        )
      )}
      id={formItemId}
      aria-describedby={
        !error
          ? `${formDescriptionId}`
          : `${formDescriptionId} ${formMessageId}`
      }
      aria-invalid={!!error}
      {...props}
    />
  );
};

interface JollyTextFieldProps extends AriaTextFieldProps {
  name: string;
  label?: string;
  description?: string;
  errorMessage?: string | ((validation: AriaValidationResult) => string);
  textArea?: boolean;
}

function JollyTextField({
  label,
  description,
  errorMessage,
  textArea,
  className,
  ...props
}: JollyTextFieldProps) {
  return (
    <TextField
      className={composeRenderProps(className, (className) =>
        cn("group flex flex-col gap-2", className)
      )}
      {...props}
    >
      <Label>{label}</Label>
      {textArea ? <TextArea /> : <Input />}
      {description && (
        <Text className="text-sm text-muted-foreground" slot="description">
          {description}
        </Text>
      )}
      <FieldError>{errorMessage}</FieldError>
    </TextField>
  );
}

export { Input, TextField, JollyTextField, TextArea };
export type { JollyTextFieldProps };
