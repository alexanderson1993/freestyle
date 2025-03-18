import { useLocation, useNavigation, useRevalidator } from "react-router";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  Breadcrumbs,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumbs";
import { Button } from "~/components/ui/button";
import { Icon } from "~/components/ui/icon";

export default function Collections() {
  const pathname = useLocation().pathname;
  const navigation = useNavigation();
  const { revalidate } = useRevalidator();
  return (
    <div className="py-4 px-6">
      <div className="flex gap-4 items-center">
        <Breadcrumbs>
          <BreadcrumbItem>
            <BreadcrumbPage>Collections</BreadcrumbPage>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink to={pathname}>Docs</BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
          {/* <BreadcrumbItem>
        <BreadcrumbPage>Breadcrumbs</BreadcrumbPage>
      </BreadcrumbItem> */}
        </Breadcrumbs>
        <Button variant="ghost" size="icon" aria-label="Collection Settings">
          <Icon name="Settings" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Collection Settings"
          onPress={() => revalidate()}
        >
          <Icon
            name="RefreshCw"
            className={navigation.state === "loading" ? "animate-spin" : ""}
          />
        </Button>
      </div>
    </div>
  );
}
