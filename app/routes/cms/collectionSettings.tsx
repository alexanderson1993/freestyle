import { adapterContext } from "~/utils/adapterContext";
import type { Route } from "./+types/collectionSettings";
import { Form, href, redirect, useNavigation } from "react-router";
import { useState } from "react";
import type { z } from "zod";
import { collectionSchema, type fieldSchema } from "~/utils/schemas";
import { fetchCollectionFields } from "~/utils/fetchCollectionFields";
import { CollectionForm } from "~/routes/cms/collectionNew";
import { getFormProps, useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod";
import { Button } from "~/components/ui/button";

export const handle = {
  breadcrumb: () => ({ label: "Settings" }),
};
/**
 * TODO:
 * - Rename fields/columns - maybe they should have unique IDs in the database?
 * - Delete fields/columns
 * - Add fields/columns
 * - Sort/Reorder columns
 */

export async function loader({ context, params }: Route.LoaderArgs) {
  const env = context.get(adapterContext);

  const [collection, fields] = await Promise.all([
    env.db
      .selectFrom("freestyle_collection")
      .select([
        "freestyle_collection.name",
        "freestyle_collection.note",
        "freestyle_collection.singleton",
        "freestyle_collection.display_template",
        "freestyle_collection.hidden",
      ])
      .where("name", "==", params.collection)
      .executeTakeFirst(),
    fetchCollectionFields(env.db, params.collection),
  ]);

  if (!collection) throw redirect("/collections");

  return {
    collection: {
      ...collection,
      hidden: collection.hidden === 1,
      singleton: collection.singleton === 1,
      fields: fields.map((field) => ({
        ...field,
        id: crypto.randomUUID() as string,
        options: field.options,
        hidden: field.hidden === 1,
        required: field.required === 1,
      })),
    },
  };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const env = context.get(adapterContext);
  const formData = await request.formData();
  const result = parseWithZod(formData, { schema: collectionSchema });
  if (result.status === "success") {
    const fields = await fetchCollectionFields(env.db, params.collection);
    const newFields = [];
    // Remove the fields that are no longer present
    const removedFields = [];
    const command = env.db.schema.alterTable(params.collection);
    for (const field of fields) {
      if (!result.value.fields.some((f) => f.name === field.name)) {
        removedFields.push(field.name);
      }
    }
    for (const field of result.value.fields) {
      if (
        fields.some(
          (f) =>
            f.name === field.name &&
            // If the field changed, but the name didn't
            // we need to drop and recreate that column
            f.field === field.field
        )
      ) {
        // Update existing fields
        await env.db
          .updateTable("freestyle_field")
          .set({
            interface: field.interface,
            note: field.note,
            options: JSON.stringify(field.options),
            hidden: field.hidden ? 1 : 0,
            required: field.required ? 1 : 0,
          })
          .where("collection", "==", params.collection)
          .where("name", "==", field.name)
          .execute();
      } else {
        // Insert new fields
        newFields.push({
          collection: params.collection,
          name: field.name,
          field: field.field,
          hidden: field.hidden ? 1 : 0,
          required: field.required ? 1 : 0,
          note: field.note,
          options: JSON.stringify(field.options),
          interface: field.interface,
          sort: fields.length + result.value.fields.indexOf(field) + 1,
        });
      }
    }
    if (newFields.length > 0) {
      await env.db
        .insertInto("freestyle_field")
        .columns([])
        .values(newFields)
        .execute();
    }

    if (removedFields.length > 0) {
      await env.db
        .deleteFrom("freestyle_field")
        .where("collection", "==", params.collection)
        .where("name", "in", removedFields)
        .execute();
    }

    // Update the collection itself
    await env.db
      .updateTable("freestyle_collection")
      .set({
        note: result.value.note,
        hidden: result.value.hidden ? 1 : 0,
        display_template: result.value.display_template,
      })
      .where("name", "==", params.collection)
      .execute();

    throw redirect(href("/collections/:collection", params));
  }
  return result.reply();
}
export default function CollectionSettings({
  loaderData: { collection },
  actionData,
}: Route.ComponentProps) {
  const navigation = useNavigation();

  const formProps = useForm({
    lastResult: navigation.state === "idle" ? actionData : null,
    onValidate({ formData }) {
      return parseWithZod(formData, { schema: collectionSchema });
    },
    defaultValue: collection as z.infer<typeof collectionSchema>,
  });

  return (
    <div className="px-6">
      <h1 className="text-xl font-medium">
        <span className="font-bold">{collection.name}</span> Settings
      </h1>
      <CollectionForm formProps={formProps} edit />
    </div>
  );
}
