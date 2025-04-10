import { adapterContext } from "~/utils/adapterContext";
import type { Route } from "./+types/recordDetails";
import {
  href,
  isRouteErrorResponse,
  redirect,
  useNavigation,
} from "react-router";
import { Form } from "~/components/ui/form";
import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { useMemo } from "react";
import { Button } from "~/components/ui/button";
import { fieldsToZod } from "~/utils/schemas";
import { DynamicField } from "~/components/DynamicField";
import { fetchCollectionFields } from "~/utils/fetchCollectionFields";
import { Icon } from "~/components/ui/icon";

export const handle = {
  breadcrumb: (match: {
    data: {
      collection: { display_template: string };
      record: Record<string, unknown>;
    };
  }) => {
    return {
      label: match.data.collection.display_template
        ? render(match.data.collection.display_template, match.data.record)
        : match.data.record.id,
    };
  },
};

/**
 * Renders a template string by replacing placeholders with provided values
 * @param template - The template string with placeholders in the format {{key}}
 * @param scope - An object containing key-value pairs to replace the placeholders
 * @returns The interpolated string with all placeholders replaced
 */
function render(template: string, scope: Record<string, unknown>): string {
  return template.replace(/\{\{\s?(\w+)\s?\}\}/g, (_, key) => {
    // Check if the key exists in the scope
    if (Object.prototype.hasOwnProperty.call(scope, key)) {
      return String(scope[key]);
    }
    // Return the original placeholder if the key doesn't exist
    return `{{${key}}}`;
  });
}

export async function loader({ context, params }: Route.LoaderArgs) {
  const env = context.get(adapterContext);

  const [collection, fields, record] = await Promise.all([
    env.db
      .selectFrom("freestyle_collection")
      .select([
        "freestyle_collection.name",
        "freestyle_collection.singleton",
        "freestyle_collection.display_template",
      ])
      .where("name", "==", params.collection)
      .executeTakeFirst(),
    fetchCollectionFields(env.db, params.collection),
    env.db
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      .selectFrom(params.collection as any)
      .selectAll()
      .where("id", "==", params.recordId)
      .executeTakeFirst(),
  ]);
  if (!collection) throw redirect("/collections");
  if (!record) throw new Response("", { status: 404 });

  return { collection, fields, record };
}

export async function action({ context, request, params }: Route.ActionArgs) {
  const env = context.get(adapterContext);

  const fields = await fetchCollectionFields(env.db, params.collection);

  const schema = fieldsToZod(fields);
  const formData = await request.formData();
  const submission = parseWithZod(formData, { schema });

  if (submission.status === "success") {
    await env.db
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      .updateTable(params.collection as any)
      .set(submission.value)
      .execute();

    throw redirect(
      href("/collections/:collection", { collection: params.collection })
    );
  }

  return submission.reply();
}

export default function EditRecord({
  params,
  loaderData: { fields, record },
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const schema = useMemo(() => fieldsToZod(fields), [fields]);
  const [form, conformFields] = useForm({
    lastResult: navigation.state === "idle" ? actionData : null,

    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
    defaultValue: record,
  });
  return (
    <div className="px-6">
      <h1 className="text-xl font-medium">
        Edit <span className="font-bold">{params.collection}</span> Record
      </h1>
      <Form
        context={form.context}
        method="POST"
        {...getFormProps(form)}
        className="max-w-md space-y-4"
      >
        {fields.map((field) => (
          <DynamicField
            key={field.name}
            {...field}
            conformField={conformFields[field.name]}
          />
        ))}
        <Button type="submit" isPending={navigation.state !== "idle"}>
          {navigation.state !== "idle" && navigation.formAction ? (
            <Icon name="LoaderCircle" className="animate-spin" />
          ) : (
            "Update"
          )}
        </Button>
      </Form>
    </div>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    return (
      <div className="px-6">
        <h1 className="text-xl font-medium">Record Not Found</h1>
      </div>
    );
  }

  throw error;
}
