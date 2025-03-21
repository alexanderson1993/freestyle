import { Button } from "react-aria-components";
import { useSearchParams } from "react-router";
import { buttonVariants, type ButtonProps } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";
import { cn } from "~/utils/cn";

const Pagination = ({ className, ...props }: React.ComponentProps<"nav">) => (
  <nav
    aria-label="pagination"
    className={cn("mx-auto flex justify-center", className)}
    {...props}
  />
);
Pagination.displayName = "Pagination";

const PaginationContent = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"ul">) => (
  <ul
    ref={ref}
    className={cn("flex flex-row items-center gap-1", className)}
    {...props}
  />
);
PaginationContent.displayName = "PaginationContent";

const PaginationItem = ({
  className,
  ref,
  ...props
}: React.ComponentProps<"li">) => (
  <li ref={ref} className={cn("", className)} {...props} />
);
PaginationItem.displayName = "PaginationItem";

type PaginationLinkProps = {
  isActive?: boolean;
  page: number | "prev" | "next";
} & ButtonProps;

const PaginationLink = ({
  className,
  size = "icon",
  page = 1,
  ...props
}: PaginationLinkProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = Number(searchParams.get("page") || 1);
  const isActive = page === currentPage;

  return (
    <Button
      aria-current={isActive ? "page" : undefined}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className
      )}
      onPress={() => {
        setSearchParams((params) => {
          const nextPage = Math.max(
            1,
            page === "next"
              ? currentPage + 1
              : page === "prev"
              ? currentPage - 1
              : page
          );
          if (nextPage === 1) params.delete("page");
          else params.set("page", nextPage.toString());
          return params;
        });
      }}
    >
      {page}
    </Button>
  );
};
PaginationLink.displayName = "PaginationLink";

const PaginationPrevious = ({
  className,
  ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "page">) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={cn("gap-1 pl-2.5", className)}
    {...props}
    page="prev"
  >
    <Icon name="ChevronLeft" className="h-4 w-4" />
  </PaginationLink>
);
PaginationPrevious.displayName = "PaginationPrevious";

const PaginationNext = ({
  className,
  ...props
}: Omit<React.ComponentProps<typeof PaginationLink>, "page">) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={cn("gap-1 pr-2.5", className)}
    {...props}
    page="next"
  >
    <Icon name="ChevronRight" className="h-4 w-4" />
  </PaginationLink>
);
PaginationNext.displayName = "PaginationNext";

const PaginationEllipsis = ({
  className,
  ...props
}: React.ComponentProps<"span">) => (
  <span
    aria-hidden
    className={cn("flex h-9 w-9 items-center justify-center", className)}
    {...props}
  >
    <Icon name="Ellipsis" className="h-4 w-4" />
    <span className="sr-only">More pages</span>
  </span>
);
PaginationEllipsis.displayName = "PaginationEllipsis";

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
};
