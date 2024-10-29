import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AppWithVersions } from "@/types/types";
import { usePathname } from "next/navigation";

export function NavBreadcrumb({
  app,
  updateApp,
}: {
  app: AppWithVersions | null;
  updateApp: (app: AppWithVersions) => void;
}) {
  const pathname = usePathname();

  const sortedVersions = app?.versions.sort((a, b) => {
    const [aMajor, aMinor] = a.version.split(".").map(Number);
    const [bMajor, bMinor] = b.version.split(".").map(Number);
    if (bMajor !== aMajor) return bMajor - aMajor;
    return bMinor - aMinor;
  });

  const currentVersion = sortedVersions?.find(
    (version) => version.version === app?.selectedVersion,
  );

  // If we're in an app route and have app data, show the full app breadcrumb
  if (pathname.startsWith("/apps/") && app) {
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/apps">Apps</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/apps/${app.appSlug}`}>
              {currentVersion?.title}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbPage>
            <Select
              value={app.selectedVersion}
              onValueChange={(version) =>
                updateApp({
                  ...app,
                  selectedVersion: version,
                } as AppWithVersions)
              }
            >
              <SelectTrigger className="border-none p-0 focus:ring-0">
                <SelectValue placeholder="Select version" />
              </SelectTrigger>
              <SelectContent>
                {sortedVersions?.map((version) => (
                  <SelectItem key={version.version} value={version.version}>
                    {version.version}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>
    );
  }

  // For all other routes, display the route name dynamically
  const routeName =
    pathname === "/"
      ? "Home"
      : pathname.slice(1).charAt(0).toUpperCase() + pathname.slice(2);

  return (
    <Breadcrumb>
      <BreadcrumbList className="py-2">
        <BreadcrumbItem>
          <BreadcrumbPage>{routeName}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
