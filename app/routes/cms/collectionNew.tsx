import { parseWithZod } from "@conform-to/zod";
import type { Route } from "./+types/collectionNew";
import {
  Form,
  href,
  redirect,
  useMatch,
  useMatches,
  useSubmit,
} from "react-router";
import { z } from "zod";
import {
  BreadcrumbItem,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumbs";
import { Button } from "~/components/ui/button";
import { FieldError, Label } from "~/components/ui/field";
import { Icon } from "~/components/ui/icon";
import { Menu, MenuItem, MenuPopover, MenuTrigger } from "~/components/ui/menu";
import { Switch } from "~/components/ui/switch";
import { Input, TextArea, TextField } from "~/components/ui/textfield";
import {
  Disclosure,
  DisclosureGroup,
  DisclosureHeader,
  DisclosurePanel,
  type DisclosureHeaderProps,
} from "~/components/ui/disclosure";
import { composeRenderProps, Heading } from "react-aria-components";
import { cn } from "~/utils/cn";
import { getFormProps, useForm } from "@conform-to/react";
import { useRef, useState } from "react";
import { produce } from "immer";
import { Checkbox, JollyCheckboxGroup } from "~/components/ui/checkbox";
import { JollyDatePicker } from "~/components/ui/date-picker";
import { adapterContext } from "~/utils/adapterContext";
import { sql } from "kysely";
export const handle = {
  breadcrumb: () => ({ label: "New" }),
};

const fieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  field: z.string(),
  interface: z.string().optional(),
  options: z.record(z.string()).optional(),
  note: z.string().optional(),
  required: z.coerce.boolean(),
  hidden: z.coerce.boolean(),
});

const schema = z.object({
  name: z.string(),
  note: z.string().optional(),
  hidden: z.coerce.boolean(),
  singleton: z.coerce.boolean(),
  fields: z.array(fieldSchema),
});

const directusFields = [
  "input",
  "autocomplete",
  "code",
  "textarea",
  "wysiwyg",
  "markdown",
  "tags",
  "list",
  "slug",
  // Selection
  "toggle",
  "datetime",
  "repeater",
  "color",
  "dropdown",
  "checkboxes",
  "checkboxes tree",
  "dropdown multiple",
  "radio buttons",
  // Relational
  "file",
  "image",
  "files",
  "many to many",
  "one to many",
  "tree view",
  "many to one",
  // Presentational
  "divider",
  "button links",
  "notice",
  // Other
  "hash",
  "slider",
];

export const fieldTypes = [
  {
    icon: "Type",
    label: "Plain Text",
    name: "string",
    config: (fieldPath: string) => (
      <div className="space-y-2">
        <div className="flex gap-2">
          <TextField
            name={`${fieldPath}.options.minLength`}
            className="flex-auto"
          >
            <Label>Min Length</Label>
            <Input type="number" />
            <FieldError />
          </TextField>
          <TextField
            name={`${fieldPath}.options.maxLength`}
            className="flex-auto"
          >
            <Label>Max Length</Label>
            <Input type="number" />
            <FieldError />
          </TextField>
        </div>
        <TextField name={`${fieldPath}.options.placeholder`}>
          <Label>Placeholder</Label>
          <Input />
          <FieldError />
        </TextField>
        <TextField name={`${fieldPath}.options.defaultValue`}>
          <Label>Default Value</Label>
          <Input />
          <FieldError />
        </TextField>
        <TextField name={`${fieldPath}.options.validationPattern`}>
          <Label>Validation Pattern</Label>
          <Input />
          <small>
            ex. <code>^[a-z0-9]+$</code>
          </small>
          <FieldError />
        </TextField>
        <div className="flex">
          <Switch name={`${fieldPath}.required`} className="flex-auto">
            Required
          </Switch>
          <Switch name={`${fieldPath}.hidden`} className="flex-auto">
            Hidden
          </Switch>
        </div>
      </div>
    ),
  },
  {
    icon: "PencilLine",
    label: "Rich Text",
    name: "richText",
    config: (fieldPath: string) => (
      <div className="flex">
        <Switch name={`${fieldPath}.required`} className="flex-auto">
          Required
        </Switch>
        <Switch name={`${fieldPath}.hidden`} className="flex-auto">
          Hidden
        </Switch>
      </div>
    ),
  },
  {
    icon: "Hash",
    label: "Number",
    name: "number",
    config: (fieldPath: string) => (
      <div className="space-y-2">
        <div className="flex gap-2">
          <TextField name={`${fieldPath}.options.min`} className="flex-auto">
            <Label>Min</Label>
            <Input type="number" />
            <FieldError />
          </TextField>
          <TextField name={`${fieldPath}.options.min`} className="flex-auto">
            <Label>Max</Label>
            <Input type="number" />
            <FieldError />
          </TextField>
        </div>
        <div className="flex">
          <Switch name={`${fieldPath}.hidden`} className="flex-auto">
            Hidden
          </Switch>
          <Switch name={`${fieldPath}.required`} className="flex-auto">
            Required
          </Switch>
          <Switch name={`${fieldPath}.options.integer`} className="flex-auto">
            Integer
          </Switch>
        </div>
      </div>
    ),
  },
  {
    icon: "ToggleLeft",
    label: "Boolean",
    name: "boolean",
    config: (fieldPath: string) => (
      <div className="space-y-2">
        <Switch name={`${fieldPath}.hidden`} className="flex-auto">
          Hidden
        </Switch>
      </div>
    ),
  },
  {
    icon: "Calendar",
    label: "DateTime",
    name: "datetime",
    config: (fieldPath: string) => (
      <div className="space-y-2">
        <div className="flex gap-2">
          <JollyDatePicker
            label="Min Date"
            name={`${fieldPath}.minDate`}
            className="flex-auto"
          />
          <JollyDatePicker
            label="Max Date"
            name={`${fieldPath}.maxDate`}
            className="flex-auto"
          />
        </div>
        <JollyCheckboxGroup label="Auto-date" orientation="horizontal">
          <Checkbox name={`${fieldPath}.auto-create`} value="create">
            Create
          </Checkbox>
          <Checkbox name={`${fieldPath}.auto-update`} value="update">
            Update
          </Checkbox>
        </JollyCheckboxGroup>
        <div className="flex">
          <Switch name={`${fieldPath}.required`} className="flex-auto">
            Required
          </Switch>
          <Switch name={`${fieldPath}.hidden`} className="flex-auto">
            Hidden
          </Switch>
        </div>
      </div>
    ),
  },
  // TODO
  {
    icon: "List",
    name: "select",
    label: "Select",
    config: (fieldPath: string) => <div />,
  },
  {
    icon: "FileImage",
    name: "file",
    label: "File",
    config: (fieldPath: string) => <div />,
  },
  {
    icon: "GitBranch",
    label: "Relation",
    name: "relation",
    config: (fieldPath: string) => <div />,
  },
  {
    icon: "Braces",
    name: "json",
    label: "JSON",
    config: (fieldPath: string) => <div />,
  },
] as const;

function mapToDataTypes(field: z.infer<typeof fieldSchema>) {
  switch (field.field) {
    case "json":
      return "json";
    case "select":
      if (
        field.options &&
        "multiple" in field.options &&
        field.options.multiple
      ) {
        return "json";
      }
      return "text";

    case "datetime":
    case "file":
    case "richText":
    case "string":
      return "text";
    case "boolean":
      return "integer";
    case "number":
      if (
        field.options &&
        "integer" in field.options &&
        field.options.integer
      ) {
        return "integer";
      }
      return "real";

    case "relation":
      // TODO: This might need to be JSON
      // for MANY to ONE relations
      return "text";
    default:
      return "blob";
  }
}
export async function action({ request, context }: Route.ActionArgs) {
  const env = context.get(adapterContext);
  const formData = await request.formData();

  const result = parseWithZod(formData, { schema });

  if (result.status === "success") {
    const value = result.value;

    // Actually create the table
    let command = env.db.schema.createTable(value.name);
    for (const field of value.fields) {
      command = command.addColumn(
        field.name,
        mapToDataTypes(field),
        (builder) => {
          // TODO: Add auto-dates
          let output = builder;
          if (field.name === "id") {
            output = output
              .primaryKey()
              .defaultTo(sql`('r'||lower(hex(randomblob(7))))`);
          }
          if (field.required) output = output.notNull();
          // TODO: Add references
          return output;
        }
      );
    }
    await command.execute();

    await env.db
      .insertInto("freestyle_collection")
      .values({
        name: value.name,
        hidden: value.hidden ? 1 : 0,
        note: value.note,
        singleton: value.singleton ? 1 : 0,
      })
      .execute();

    await env.db
      .insertInto("freestyle_field")
      .columns([])
      .values(
        value.fields.map((field, i) => ({
          collection: value.name,
          name: field.name,
          field: field.field,
          hidden: field.hidden ? 1 : 0,
          required: field.required ? 1 : 0,
          note: field.note,
          options: JSON.stringify(field.options),
          interface: field.interface,
          sort: i,
        }))
      )
      .execute();

    throw redirect(
      href("/collections/:collection", { collection: value.name })
    );
  }
  return result.reply();
}

export default function NewCollection({ actionData }: Route.ComponentProps) {
  const [fieldList, setFieldList] = useState<z.infer<typeof fieldSchema>[]>([
    {
      id: crypto.randomUUID(),
      field: "string",
      name: "id",
      required: true,
      hidden: false,
    },
  ]);
  const [form, fields] = useForm({
    lastResult: actionData,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });
  return (
    <div className="flex-auto flex flex-col">
      <div className="pt-4 px-6 flex w-full gap-4 items-center mb-2 min-h-14">
        <Breadcrumbs>
          <BreadcrumbItem>
            <BreadcrumbPage>Collections</BreadcrumbPage>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbPage>New</BreadcrumbPage>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        </Breadcrumbs>
      </div>
      <div className="px-6 flex-auto">
        <h1 className="text-xl mb-2">New Collection</h1>
        <Form
          method="POST"
          className="max-w-md space-y-4"
          {...getFormProps(form)}
        >
          <TextField name="name">
            <Label>Collection Name</Label>
            <Input placeholder="eg. posts" />
            <FieldError />
          </TextField>
          <TextField name="note">
            <Label>Note</Label>
            <TextArea />
            <FieldError />
          </TextField>
          <div className="flex gap-4">
            <Switch name="hidden" className="flex-auto">
              Hidden
            </Switch>
            <Switch name="singleton" className="flex-auto">
              Singleton
            </Switch>
          </div>
          <h2 className="text-lg my-2">Fields</h2>
          <DisclosureGroup defaultExpandedKeys={["personal"]}>
            {fieldList.map((field, i) => {
              const fieldType = fieldTypes.find((f) => f.name === field.field);
              if (!fieldType) return null;

              return (
                <Disclosure
                  id={field.id}
                  key={field.id}
                  className="border border-input rounded-lg"
                >
                  <FieldDisclosureHeader>
                    <Icon name={fieldType.icon} className="size-4 mr-2" />
                    <Input
                      type="text"
                      onPointerDown={(e) => {
                        e.stopPropagation();
                      }}
                      autoFocus
                      className="py-1 h-8"
                      name={`fields[${i}].name`}
                      placeholder={`field${0}`}
                      defaultValue={field.name}
                      readOnly={field.name === "id"}
                    />
                    <input
                      type="hidden"
                      name={`fields[${i}].id`}
                      value={field.id}
                    />
                    <input
                      type="hidden"
                      name={`fields[${i}].field`}
                      value={field.field}
                    />
                  </FieldDisclosureHeader>
                  <DisclosurePanel className="p-4">
                    {fieldType.config(`fields[${i}]`)}
                  </DisclosurePanel>
                </Disclosure>
              );
            })}
          </DisclosureGroup>
          <MenuTrigger>
            <Button className="w-full">
              <Icon name="Plus" className="mr-2 size-5" /> Add Field
            </Button>
            <MenuPopover className="w-md">
              <Menu className="grid grid-cols-3">
                {fieldTypes.map(({ icon, name, label }) => (
                  <MenuItem
                    key={name}
                    onAction={() => {
                      setFieldList((items) => [
                        ...items,
                        {
                          id: crypto.randomUUID(),
                          name: `field${fieldList.length + 1}`,
                          field: name,
                          required: false,
                          hidden: false,
                        },
                      ]);
                    }}
                  >
                    <Icon name={icon} className="size-3" />
                    {label}
                  </MenuItem>
                ))}
              </Menu>
            </MenuPopover>
          </MenuTrigger>
          <Button type="submit">Create</Button>
        </Form>
      </div>
      <div className="sticky bottom-0 flex justify-end gap-4 border-t border-t-input px-4 py-4 bg-background mt-4">
        <Button variant="destructive">Cancel</Button>
        <Button>Create</Button>
      </div>
    </div>
  );
}

export function IconForFieldType({
  type,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  type: string;
}) {
  const fieldType = fieldTypes.find((t) => t.name === type);
  if (!fieldType) return null;

  return <Icon {...props} name={fieldType?.icon} />;
}

function FieldDisclosureHeader({ children, className }: DisclosureHeaderProps) {
  return (
    <Heading className="flex">
      <Button
        variant="ghost"
        slot="trigger"
        className={composeRenderProps(className, (className) => {
          return cn(
            "group flex flex-1 items-center justify-between rounded-md py-4 font-medium ring-offset-background transition-all",
            "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            "data-[focus-visible]:outline-none data-[focus-visible]:ring-2 data-[focus-visible]:ring-ring data-[focus-visible]:ring-offset-2",
            "outline-none",
            className
          );
        })}
      >
        {children}
        <Icon
          name="Settings"
          aria-hidden
          className={cn(
            "size-4 ml-4 shrink-0 transition-transform duration-200",
            "group-data-[expanded]:rotate-180",
            "group-data-[disabled]:opacity-50"
          )}
        />
      </Button>
    </Heading>
  );
}
