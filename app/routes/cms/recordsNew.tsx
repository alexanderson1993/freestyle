import { adapterContext } from "~/utils/adapterContext";
import type { Route } from "./+types/recordsNew";
import { href, redirect, useNavigation } from "react-router";
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
  breadcrumb: () => ({ label: "New" }),
};

export async function loader({ context, params }: Route.LoaderArgs) {
  const env = context.get(adapterContext);

  const [collection, fields] = await Promise.all([
    env.db
      .selectFrom("freestyle_collection")
      .select(["freestyle_collection.name", "freestyle_collection.singleton"])
      .where("name", "==", params.collection)
      .executeTakeFirst(),
    fetchCollectionFields(env.db, params.collection),
  ]);
  if (!collection) throw redirect("/collections");

  return { collection, fields };
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
      .insertInto(params.collection as any)
      .values(submission.value)
      .execute();

    throw redirect(
      href("/collections/:collection", { collection: params.collection })
    );
  }

  return submission.reply();
}

export default function NewRecord({
  params,
  loaderData: { fields },
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();
  const schema = useMemo(() => fieldsToZod(fields), [fields]);
  const [form, conformFields] = useForm({
    lastResult: navigation.state === "idle" ? actionData : null,

    onValidate({ formData }) {
      return parseWithZod(formData, { schema });
    },
  });
  return (
    <div className="px-6">
      <h1 className="text-xl font-medium">
        New <span className="font-bold">{params.collection}</span> Record
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
            "Create"
          )}
        </Button>
      </Form>
    </div>
  );
}
