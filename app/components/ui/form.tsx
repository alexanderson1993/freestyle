import { FormProvider, useField } from "@conform-to/react";
import {
  createContext,
  use,
  type PropsWithChildren,
  type PropsWithoutRef,
} from "react";
import { Form as RRForm, type FormProps } from "react-router";

type FormContext = Parameters<
  PropsWithoutRef<typeof FormProvider>
>["0"]["context"];

export function Form({
  context,
  ...props
}: FormProps & { context: FormContext }) {
  return (
    <FormProvider context={context}>
      <RRForm {...props} />
    </FormProvider>
  );
}

export const FormFieldContext = createContext<{
  name: string;
}>({} as { name: string });

export const useFormField = () => {
  const fieldContext = use(FormFieldContext);
  const [meta] = useField(fieldContext.name);

  if (!fieldContext) {
    throw new Error(
      "useFormField should be used within a form field component"
    );
  }

  const { id } = meta;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    error: meta.errors?.[0],
  };
};
