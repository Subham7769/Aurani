import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}

export function PageContainer({ children, className, narrow }: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        narrow ? "max-w-4xl" : "max-w-7xl",
        className,
      )}
    >
      {children}
    </div>
  );
}
