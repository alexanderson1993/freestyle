import { getInputProps } from "@conform-to/react";
import type { DB } from "kysely-codegen";
import { FieldError, FormDescription, Label } from "~/components/ui/field";
import { Switch } from "~/components/ui/switch";
import { Input, TextArea, TextField } from "~/components/ui/textfield";

type Field = Pick<
  DB["freestyle_field"],
  "field" | "interface" | "name" | "note" | "required"
> & { options: Record<string, unknown> };

export function DynamicField({
  field,
  interface: editInterface,
  name,
  note,
  options,
  required,
  conformField,
}: // biome-ignore lint/suspicious/noExplicitAny: <explanation>
Field & { conformField: any }) {
  switch (field) {
    case "string":
      return (
        <TextField {...getInputProps(conformField, { type: "text" })}>
          <Label>{name}</Label>
          <Input />
          {note ? <FormDescription>{note}</FormDescription> : null}
          <FieldError />
        </TextField>
      );
    case "richText":
      return (
        <TextField {...getInputProps(conformField, { type: "text" })}>
          <Label>{name}</Label>
          <TextArea rows={10} />
          <FormDescription>{note}</FormDescription>
          <FieldError />
        </TextField>
      );
    case "boolean":
      return (
        <div>
          <Switch
            {...getInputProps(conformField, { type: "checkbox" })}
            defaultSelected={conformField.initialValue === "1"}
            className="flex-auto"
          >
            {name}
          </Switch>
        </div>
      );
  }
}
