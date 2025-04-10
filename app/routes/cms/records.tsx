import type { DB } from "kysely-codegen";
import type { Route } from "./+types/records";
import type { SortDescriptor } from "react-aria-components";
import {
  href,
  Link,
  redirect,
  useNavigate,
  useSearchParams,
} from "react-router";
import { Button, buttonVariants } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Icon } from "~/components/ui/icon";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "~/components/ui/pagination";
import {
  Cell,
  Column,
  ResizableTableContainer,
  Row,
  Table,
  TableBody,
  TableHeader,
} from "~/components/ui/table";
import { IconForFieldType } from "~/routes/cms/collectionNew";
import { adapterContext } from "~/utils/adapterContext";
import {
  Select,
  SelectItem,
  SelectListBox,
  SelectPopover,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/utils/cn";

const PAGE_LIMIT = 25;
export async function loader({ params, context, request }: Route.LoaderArgs) {
  const env = context.get(adapterContext);

  const searchParams = new URL(request.url).searchParams;
  const page = Number(searchParams.get("page")) || 1;
  const sort = searchParams.get("sort");

  let recordsQuery = env.db
    .selectFrom(params.collection as keyof DB)
    .selectAll()
    .offset((page - 1) * PAGE_LIMIT)
    .limit(PAGE_LIMIT);

  if (sort) {
    console.log(sort);
    recordsQuery = recordsQuery.orderBy(
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
      sort.replace("-", "") as any,
      sort.startsWith("-") ? "desc" : "asc"
    );
  }

  const [collection, fields, records, [{ count }]] = await Promise.all([
    env.db
      .selectFrom("freestyle_collection")
      .select(["freestyle_collection.name", "freestyle_collection.singleton"])
      .where("name", "==", params.collection)
      .executeTakeFirst(),
    env.db
      .selectFrom("freestyle_field")
      .select(["freestyle_field.field", "freestyle_field.name"])
      .where("collection", "==", params.collection)
      .where("name", "!=", "id")
      .where("hidden", "!=", 1)
      .orderBy("sort")
      .execute(),
    recordsQuery.execute() as Promise<Record<string, unknown>[]>,
    env.db
      .selectFrom(params.collection as keyof DB)
      .select(({ fn }) => [fn.count<number>("id").as("count")])
      .execute(),
  ]);
  if (!collection) throw redirect("/collections");

  return { collection, fields, records, count, page };
}

export default function CollectionItems({
  loaderData: { collection, fields, records, count, page },
}: Route.ComponentProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get("sort");
  const navigate = useNavigate();

  let sortDescriptor: SortDescriptor | undefined = undefined;
  if (sortParam) {
    sortDescriptor = {
      direction: sortParam.startsWith("-") ? "descending" : "ascending",
      column: sortParam.startsWith("-") ? sortParam.slice(1) : sortParam,
    };
  }

  return (
    <>
      <div className="px-6">
        {count === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <h2 className="text-3xl font-medium">No Records Found</h2>
            <Link className={buttonVariants({})} to="new">
              <Icon name="Plus" className="size-4 mr-2" />
              New Record
            </Link>
          </div>
        ) : (
          <ResizableTableContainer className="relative w-full overflow-auto rounded-md border border-input mb-4">
            <Table
              aria-label={collection.name}
              selectionMode="multiple"
              onSortChange={(descriptor) => {
                setSearchParams((prev) => {
                  if (descriptor.direction === "ascending" && sortDescriptor) {
                    prev.delete("sort");
                    return prev;
                  }
                  prev.set(
                    "sort",
                    `${descriptor.direction === "descending" ? "-" : ""}${
                      descriptor.column
                    }`
                  );
                  return prev;
                });
              }}
              onRowAction={(recordId) =>
                navigate(
                  href("/collections/:collection/:recordId", {
                    collection: collection.name,
                    recordId: recordId as string,
                  })
                )
              }
              sortDescriptor={sortDescriptor}
            >
              <TableHeader>
                <Column id="selection" width={40} minWidth={40}>
                  <Checkbox slot="selection" />
                </Column>
                {fields.map(({ field, name }, i) => (
                  <Column
                    key={name}
                    id={name}
                    isResizable
                    isRowHeader={i === 0}
                    allowsSorting
                  >
                    <IconForFieldType className="size-4 inline" type={field} />{" "}
                    {name}
                  </Column>
                ))}
              </TableHeader>
              <TableBody>
                {records.map((r) => (
                  <Row key={r.id} id={r.id}>
                    <Cell>
                      <Checkbox slot="selection" />
                    </Cell>
                    {fields.map(({ name, field }) => (
                      <Cell key={`${r.id}-${name}`}>
                        <CellValue value={r[name]} field={field} />
                      </Cell>
                    ))}
                  </Row>
                ))}
              </TableBody>
            </Table>
          </ResizableTableContainer>
        )}
      </div>
      <div className="flex-auto" />
      <div className="flex items-center justify-between text-muted-foreground bg-muted text-sm sticky bottom-0 w-full px-6 py-2 h-12">
        <p className="flex-auto">Total Found: {count}</p>
        {count > PAGE_LIMIT ? (
          count / PAGE_LIMIT <= 5 ? (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious />
                </PaginationItem>
                {Array.from({ length: Math.ceil(count / PAGE_LIMIT) }).map(
                  (_, i) => (
                    // biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
                    <PaginationItem key={i}>
                      <PaginationLink page={i + 1} />
                    </PaginationItem>
                  )
                )}
                <PaginationItem>
                  <PaginationNext />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          ) : (
            <Select
              aria-label="Page Number"
              className="w-[200px]"
              defaultSelectedKey={page}
              onSelectionChange={(page) =>
                setSearchParams((prev) => {
                  if (page === 1) {
                    prev.delete("page");
                  } else {
                    prev.set("page", page.toString());
                  }
                  return prev;
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectPopover>
                <SelectListBox
                  items={Array.from({
                    length: Math.ceil(count / PAGE_LIMIT),
                  }).map((_, i) => ({ id: i + 1 }))}
                >
                  {(item) => (
                    <SelectItem id={item.id} textValue={`Page ${item.id}`}>
                      Page {item.id}
                    </SelectItem>
                  )}
                </SelectListBox>
              </SelectPopover>
            </Select>
          )
        ) : null}
      </div>
    </>
  );
}

function CellValue({ value, field }: { value: unknown; field: string }) {
  switch (field) {
    case "string":
    case "richText":
      return (
        <span className="line-clamp-1 text-ellipsis">{value as string}</span>
      );
    case "boolean":
      return (
        <span
          className={cn("px-2 py-0.5 rounded-full bg-purple-700 text-white", {
            "bg-green-700": value === 1,
          })}
        >
          {value === 1 ? "True" : "False"}
        </span>
      );
  }
  return value as string;
}
