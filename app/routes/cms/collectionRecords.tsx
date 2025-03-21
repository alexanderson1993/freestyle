import type { SortDescriptor } from "react-aria-components";
import { useSearchParams } from "react-router";
import { Button } from "~/components/ui/button";
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
export default function CollectionItems() {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortParam = searchParams.get("sort");
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
        <ResizableTableContainer className="relative w-full overflow-auto rounded-md border border-input mb-4">
          <Table
            aria-label="Files"
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
            sortDescriptor={sortDescriptor}
          >
            <TableHeader>
              <Column id="selection" width={40} minWidth={40}>
                <Checkbox slot="selection" />
              </Column>
              <Column id="name" isResizable isRowHeader allowsSorting>
                Name
              </Column>
              <Column id="type" isResizable allowsSorting>
                Type
              </Column>
              <Column id="dateModified" allowsSorting>
                Date Modified
              </Column>
            </TableHeader>
            <TableBody>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>Games</Cell>
                <Cell>File folder</Cell>
                <Cell>6/7/2020</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>Program Files</Cell>
                <Cell>File folder</Cell>
                <Cell>4/7/2021</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>bootmgr</Cell>
                <Cell>System file</Cell>
                <Cell>11/20/2010</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
              <Row>
                <Cell>
                  <Checkbox slot="selection" />
                </Cell>
                <Cell>log.txt</Cell>
                <Cell>Text Document</Cell>
                <Cell>1/18/2016</Cell>
              </Row>
            </TableBody>
          </Table>
        </ResizableTableContainer>
      </div>
      <div className="flex-auto" />
      <div className="flex items-center justify-between text-muted-foreground bg-muted text-sm sticky bottom-0 w-full px-6 py-2">
        <p className="flex-auto">Total Found: 4</p>
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink page={1} />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink page={2} />
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationNext />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </>
  );
}
