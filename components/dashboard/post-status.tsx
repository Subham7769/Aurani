import { cn } from "@/lib/utils";

type Platform = "WHATSAPP_CATALOG" | "WHATSAPP_GROUP";
type Status = "PENDING" | "SUCCESS" | "FAILED";

interface PostStatusProps {
  platform: Platform;
  status: Status;
  errorMessage?: string;
  className?: string;
}

const PLATFORM_LABELS: Record<Platform, string> = {
  WHATSAPP_CATALOG: "WhatsApp Catalog",
  WHATSAPP_GROUP: "WhatsApp Group",
};

export function PostStatus({ platform, status, errorMessage, className }: PostStatusProps) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <StatusDot status={status} errorMessage={errorMessage} />
      <span className="font-sans text-sm text-foreground">{PLATFORM_LABELS[platform]}</span>
      <span
        className={cn(
          "ml-auto font-sans text-xs",
          status === "PENDING" && "text-muted-foreground",
          status === "SUCCESS" && "text-success",
          status === "FAILED" && "text-destructive",
        )}
      >
        {status === "PENDING" && "Pending"}
        {status === "SUCCESS" && "Posted"}
        {status === "FAILED" && "Failed"}
      </span>
    </div>
  );
}

function StatusDot({ status, errorMessage }: { status: Status; errorMessage?: string }) {
  const dot = (
    <span
      className={cn(
        "inline-block h-2.5 w-2.5 shrink-0 rounded-full",
        status === "PENDING" && "bg-yellow-400",
        status === "SUCCESS" && "bg-success",
        status === "FAILED" && "bg-destructive",
      )}
    />
  );

  if (status === "FAILED" && errorMessage) {
    return (
      <span
        title={errorMessage}
        className="cursor-help"
        aria-label={`Error: ${errorMessage}`}
      >
        {dot}
      </span>
    );
  }

  return dot;
}
