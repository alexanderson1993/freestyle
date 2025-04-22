import { getInputProps, type FieldMetadata } from "@conform-to/react";
import { CalendarDate, parseDate } from "@internationalized/date";
import type { ReactNode } from "react";
import type { z } from "zod";
import { Checkbox, JollyCheckboxGroup } from "~/components/ui/checkbox";
import { JollyDatePicker } from "~/components/ui/date-picker";
import { FieldError, Label } from "~/components/ui/field";
import { Switch } from "~/components/ui/switch";
import { Input, TextField } from "~/components/ui/textfield";
import type { collectionSchema, fieldSchema } from "~/utils/schemas";

type FieldSet = Required<{
  [Key in keyof z.infer<typeof fieldSchema>]: FieldMetadata<
    z.infer<typeof fieldSchema>[Key],
    z.infer<typeof collectionSchema>,
    string[]
  >;
}>;

export const fieldTypes = [
  {
    icon: "IdCard",
    label: "ID",
    name: "uuid",
  },
  {
    icon: "Type",
    label: "Plain Text",
    name: "string",
    config: ({ fieldSet, extra }: { fieldSet: FieldSet; extra: ReactNode }) => (
      <div className="space-y-2">
        <div className="flex gap-2">
          <TextField
            {...getInputProps(fieldSet.options.getFieldset().minLength, {
              type: "number",
            })}
            key="min-length"
            className="flex-auto"
          >
            <Label>Min Length</Label>
            <Input type="number" />
            <FieldError />
          </TextField>
          <TextField
            {...getInputProps(fieldSet.options.getFieldset().maxLength, {
              type: "number",
            })}
            className="flex-auto"
            key="max-length"
          >
            <Label>Max Length</Label>
            <Input type="number" />
            <FieldError />
          </TextField>
        </div>
        <TextField
          {...getInputProps(fieldSet.options.getFieldset().placeholder, {
            type: "text",
          })}
          key="placeholder"
        >
          <Label>Placeholder</Label>
          <Input />
          <FieldError />
        </TextField>
        <TextField
          {...getInputProps(fieldSet.options.getFieldset().defaultValue, {
            type: "text",
          })}
          key="default-value"
        >
          <Label>Default Value</Label>
          <Input />
          <FieldError />
        </TextField>
        <TextField
          {...getInputProps(fieldSet.options.getFieldset().validationPattern, {
            type: "text",
          })}
          key="validation-pattern"
        >
          <Label>Validation Pattern</Label>
          <Input />
          <small>
            ex. <code>^[a-z0-9]+$</code>
          </small>
          <FieldError />
        </TextField>
        <div className="flex">
          <Switch
            {...getInputProps(fieldSet.required, { type: "checkbox" })}
            className="flex-auto"
            key="required"
          >
            Required
          </Switch>
          <Switch
            {...getInputProps(fieldSet.hidden, { type: "checkbox" })}
            className="flex-auto"
            key="hidden"
          >
            Hidden
          </Switch>
          {extra}
        </div>
      </div>
    ),
  },
  {
    icon: "PencilLine",
    label: "Rich Text",
    name: "richText",
    config: ({ fieldSet, extra }: { fieldSet: FieldSet; extra: ReactNode }) => (
      <div className="flex">
        <Switch
          {...getInputProps(fieldSet.required, { type: "checkbox" })}
          className="flex-auto"
          key="required"
        >
          Required
        </Switch>
        <Switch
          {...getInputProps(fieldSet.hidden, { type: "checkbox" })}
          className="flex-auto"
          key="hidden"
        >
          Hidden
        </Switch>
        {extra}
      </div>
    ),
  },
  {
    icon: "Hash",
    label: "Number",
    name: "number",
    config: ({ fieldSet, extra }: { fieldSet: FieldSet; extra: ReactNode }) => (
      <div className="space-y-2">
        <div className="flex gap-2">
          <TextField
            {...getInputProps(fieldSet.options.getFieldset().min, {
              type: "number",
            })}
            key="min"
            className="flex-auto"
          >
            <Label>Min</Label>
            <Input type="number" />
            <FieldError />
          </TextField>
          <TextField
            {...getInputProps(fieldSet.options.getFieldset().max, {
              type: "number",
            })}
            key="max"
            className="flex-auto"
          >
            <Label>Max</Label>
            <Input type="number" />
            <FieldError />
          </TextField>
        </div>
        <div className="flex">
          <Switch
            {...getInputProps(fieldSet.required, { type: "checkbox" })}
            className="flex-auto"
            key="required"
          >
            Required
          </Switch>
          <Switch
            {...getInputProps(fieldSet.hidden, { type: "checkbox" })}
            className="flex-auto"
            key="hidden"
          >
            Hidden
          </Switch>
          <Switch
            {...getInputProps(fieldSet.options.getFieldset().integer, {
              type: "checkbox",
            })}
            className="flex-auto"
            key="integer"
          >
            Integer
          </Switch>
          {extra}
        </div>
      </div>
    ),
  },
  {
    icon: "ToggleLeft",
    label: "Boolean",
    name: "boolean",
    config: ({ fieldSet, extra }: { fieldSet: FieldSet; extra: ReactNode }) => (
      <div className="space-y-2">
        <div className="flex">
          <Switch
            {...getInputProps(fieldSet.hidden, { type: "checkbox" })}
            className="flex-auto"
            key="hidden"
          >
            Hidden
          </Switch>
          {extra}
        </div>
      </div>
    ),
  },
  {
    icon: "Calendar",
    label: "DateTime",
    name: "datetime",
    config: ({ fieldSet, extra }: { fieldSet: FieldSet; extra: ReactNode }) => {
      const minProps = getInputProps(fieldSet.options.getFieldset().minDate, {
        type: "text",
      });
      const maxProps = getInputProps(fieldSet.options.getFieldset().maxDate, {
        type: "text",
      });
      return (
        <div className="space-y-2">
          <div className="flex gap-2">
            <JollyDatePicker
              label="Min Date"
              className="flex-auto"
              id={minProps.id}
              name={minProps.name}
              isRequired={minProps.required}
              isInvalid={minProps["aria-invalid"]}
              defaultValue={
                minProps.defaultValue
                  ? parseDate(minProps.defaultValue)
                  : undefined
              }
            />
            <JollyDatePicker
              label="Max Date"
              className="flex-auto"
              id={maxProps.id}
              name={maxProps.name}
              isRequired={maxProps.required}
              isInvalid={maxProps["aria-invalid"]}
              defaultValue={
                maxProps.defaultValue
                  ? parseDate(maxProps.defaultValue)
                  : undefined
              }
            />
          </div>
          <JollyCheckboxGroup label="Auto-date" orientation="horizontal">
            <Checkbox
              {...getInputProps(fieldSet.options.getFieldset().auto_create, {
                type: "checkbox",
              })}
              value="create"
              key="create"
            >
              Create
            </Checkbox>
            <Checkbox
              {...getInputProps(fieldSet.options.getFieldset().auto_update, {
                type: "checkbox",
              })}
              value="update"
              key="update"
            >
              Update
            </Checkbox>
          </JollyCheckboxGroup>
          <div className="flex">
            <Switch
              {...getInputProps(fieldSet.required, { type: "checkbox" })}
              className="flex-auto"
              key="required"
            >
              Required
            </Switch>
            <Switch
              {...getInputProps(fieldSet.hidden, { type: "checkbox" })}
              key="hidden"
              className="flex-auto"
            >
              Hidden
            </Switch>
            {extra}
          </div>
        </div>
      );
    },
  },
  // TODO
  {
    icon: "List",
    name: "select",
    label: "Select",
    config: ({ fieldSet, extra }: { fieldSet: FieldSet; extra: ReactNode }) => (
      <div />
    ),
  },
  {
    icon: "FileImage",
    name: "file",
    label: "File",
    config: ({ fieldSet, extra }: { fieldSet: FieldSet; extra: ReactNode }) => (
      <div />
    ),
  },
  {
    icon: "GitBranch",
    label: "Relation",
    name: "relation",
    config: ({ fieldSet, extra }: { fieldSet: FieldSet; extra: ReactNode }) => (
      <div />
    ),
  },
  {
    icon: "Braces",
    name: "json",
    label: "JSON",
    config: ({ fieldSet, extra }: { fieldSet: FieldSet; extra: ReactNode }) => (
      <div />
    ),
  },
] as const;
