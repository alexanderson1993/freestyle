import type { getDb } from "~/utils/db";

export async function fetchCollectionFields(
  db: ReturnType<typeof getDb>,
  collection: string
) {
  return db
    .selectFrom("freestyle_field")
    .select([
      "freestyle_field.field",
      "freestyle_field.name",
      "freestyle_field.interface",
      "freestyle_field.note",
      "freestyle_field.options",
      "freestyle_field.required",
    ])
    .where("collection", "==", collection)
    .where("name", "!=", "id")
    .where("hidden", "!=", 1)
    .orderBy("sort")
    .execute()
    .then((res) =>
      res.map((field) => ({
        ...field,
        options: JSON.parse(field.options || "{}"),
      }))
    );
}
