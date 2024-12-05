import { logger } from "@/app/lib/logger";

interface PageHeaderProps {
  heading: string;
  description?: string;
}

export function PageHeader({ heading, description }: PageHeaderProps) {
  logger.info(
    "page-header.tsx",
    10,
    "PageHeader",
    "props",
    heading,
    description,
  );

  return (
    <div className="flex flex-col gap-2">
      <h1 className="text-3xl font-bold tracking-tight" data-testid="page-heading">
        {heading}
      </h1>
      {description && (
        <p 
          className="text-muted-foreground"
          data-testid="page-description"
        >
          {description}
        </p>
      )}
    </div>
  );
}
