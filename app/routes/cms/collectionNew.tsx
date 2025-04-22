import { parseWithZod } from "@conform-to/zod";
import type { Route } from "./+types/collectionNew";
import { href, redirect, useNavigation } from "react-router";
import { flushSync } from "react-dom";
import type { z } from "zod";
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
  DisclosurePanel,
  type DisclosureHeaderProps,
} from "~/components/ui/disclosure";
import { composeRenderProps, Heading } from "react-aria-components";
import { cn } from "~/utils/cn";
import {
  getFormProps,
  getInputProps,
  getTextareaProps,
  useForm,
  type FormMetadata,
} from "@conform-to/react";
import { adapterContext } from "~/utils/adapterContext";
import { sql } from "kysely";
import { Form } from "~/components/ui/form";
import { fieldTypes } from "~/utils/fieldTypes";
import { collectionSchema, type fieldSchema } from "~/utils/schemas";
export const handle = {
  breadcrumb: () => ({ label: "New" }),
};

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

  const result = parseWithZod(formData, { schema: collectionSchema });

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
  const navigation = useNavigation();

  const formProps = useForm({
    lastResult: navigation.state === "idle" ? actionData : null,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: collectionSchema });
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
        <CollectionForm formProps={formProps} />
      </div>
    </div>
  );
}

export function CollectionForm({
  formProps: [form, fields],
  edit,
}: {
  formProps: [
    FormMetadata<z.infer<typeof collectionSchema>, string[]>,
    ReturnType<
      FormMetadata<z.infer<typeof collectionSchema>, string[]>["getFieldset"]
    >
  ];
  edit?: boolean;
}) {
  const navigation = useNavigation();
  return (
    <Form
      context={form.context}
      method="POST"
      className="max-w-md space-y-4"
      {...getFormProps(form)}
    >
      <TextField
        {...getInputProps(fields.name, { type: "text" })}
        isReadOnly={edit}
      >
        <Label>Collection Name</Label>
        <Input placeholder="eg. posts" />
        <FieldError />
      </TextField>
      <TextField {...getTextareaProps(fields.note)}>
        <Label>Note</Label>
        <TextArea />
        <FieldError />
      </TextField>
      <div className="flex gap-4">
        <Switch
          className="flex-auto"
          {...getInputProps(fields.hidden, { type: "checkbox" })}
        >
          Hidden
        </Switch>
        <Switch
          className="flex-auto"
          {...getInputProps(fields.singleton, { type: "checkbox" })}
          isReadOnly={edit}
        >
          Singleton
        </Switch>
      </div>
      <h2 className="text-lg my-2">Fields</h2>
      <DisclosureGroup defaultExpandedKeys={["personal"]}>
        {fields.fields.getFieldList().map((field, i) => {
          const fieldSet = field.getFieldset();
          const fieldType = fieldTypes.find(
            (f) => f.name === fieldSet.field.initialValue
          );
          if (!fieldType) return null;

          const inputProps = getInputProps(fieldSet.name, { type: "text" });
          return (
            <Disclosure
              id={field.id}
              key={field.id}
              className="border border-input rounded-lg"
            >
              <FieldDisclosureHeader hasConfig={"config" in fieldType}>
                <Icon name={fieldType.icon} className="size-4 mr-2" />
                <Input
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  className="py-1 h-8"
                  placeholder={`field${0}`}
                  readOnly={fieldSet.field.initialValue === "uuid"}
                  {...inputProps}
                  key={inputProps.key}
                />
                <input
                  {...getInputProps(fieldSet.id, { type: "hidden" })}
                  key="id"
                />
                <input
                  {...getInputProps(fieldSet.field, { type: "hidden" })}
                  key="field"
                />
              </FieldDisclosureHeader>
              <DisclosurePanel className="p-4">
                {"config" in fieldType && (
                  <fieldType.config
                    fieldSet={fieldSet}
                    extra={
                      <MenuTrigger>
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="More Options"
                          className="rounded-full"
                        >
                          <Icon name="Ellipsis" className="size-4" />
                        </Button>
                        <MenuPopover>
                          <Menu>
                            <MenuItem
                              onAction={() =>
                                form.remove({
                                  name: fields.fields.name,
                                  index: i,
                                })
                              }
                            >
                              Remove
                            </MenuItem>
                          </Menu>
                        </MenuPopover>
                      </MenuTrigger>
                    }
                  />
                )}
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
                  flushSync(() => {
                    form.insert({
                      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                      name: fields.fields.name as any,
                      defaultValue: {
                        id: crypto.randomUUID(),
                        name: `field${fields.fields.getFieldList().length + 1}`,
                        field: name,
                        required: false,
                        hidden: false,

                        // biome-ignore lint/suspicious/noExplicitAny: <explanation>
                      } as any,
                    });
                  });
                  const newInput = document.getElementById(
                    fields.fields.getFieldList().at(-1)?.getFieldset().name
                      .id || ""
                  ) as HTMLInputElement;
                  console.log(newInput);
                  requestAnimationFrame(() => {
                    newInput?.focus();
                    newInput?.select?.();
                  });
                }}
              >
                <Icon name={icon} className="size-3" />
                {label}
              </MenuItem>
            ))}
          </Menu>
        </MenuPopover>
      </MenuTrigger>

      <Button type="submit">
        {navigation.state !== "idle" && navigation.formAction ? (
          <Icon name="LoaderCircle" className="animate-spin" />
        ) : edit ? (
          "Update"
        ) : (
          "Create"
        )}
      </Button>
    </Form>
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

function FieldDisclosureHeader({
  children,
  className,
  hasConfig = true,
}: DisclosureHeaderProps & { hasConfig?: boolean }) {
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
        {hasConfig ? (
          <Icon
            name="Settings"
            aria-hidden
            className={cn(
              "size-4 ml-4 shrink-0 transition-transform duration-200",
              "group-data-[expanded]:rotate-180",
              "group-data-[disabled]:opacity-50"
            )}
          />
        ) : null}
      </Button>
    </Heading>
  );
}
