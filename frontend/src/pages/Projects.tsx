import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useProject } from "@/hooks/use-projects";
import PageContentHeader from "@/layouts/PageContentHeader";
import { extractIdFromSlug } from "@shiva200701/todotypes";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function Projects() {
  const location = useLocation();

  const id = useMemo(() => {
    return extractIdFromSlug(location.pathname.split("/").at(-1) ?? "");
  }, [location.pathname.split("/").at(-1)]);

  const { data: project } = useProject(id);

  const navigate = useNavigate();

  return (
    <div>
      {/*Need to implement a bread crumb like structure for this titlte of the PageContentHeader */}
      <PageContentHeader
        title={
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink
                  onClick={() => {
                    navigate("/app/projects");
                  }}
                >
                  My Projects
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{project?.name}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        }
      />
    </div>
  );
}
