import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: number;
  className?: string;
}

export function StatsCard({ label, value, icon: Icon, trend, className }: StatsCardProps) {
  const trendPositive = trend !== undefined && trend > 0;
  const trendNegative = trend !== undefined && trend < 0;

  return (
    <Card className={cn("bg-card", className)}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="flex flex-col gap-1.5">
          <span className="font-sans text-xs uppercase tracking-widest text-muted-foreground">
            {label}
          </span>
          <span className="font-serif text-3xl text-foreground">{value}</span>
          {trend !== undefined && (
            <div
              className={cn(
                "flex items-center gap-1 font-sans text-xs",
                trendPositive && "text-success",
                trendNegative && "text-destructive",
                !trendPositive && !trendNegative && "text-muted-foreground",
              )}
            >
              {trendPositive && <TrendingUp className="h-3 w-3" />}
              {trendNegative && <TrendingDown className="h-3 w-3" />}
              {!trendPositive && !trendNegative && <Minus className="h-3 w-3" />}
              {trend > 0 ? "+" : ""}
              {trend}%
            </div>
          )}
        </div>
        <div className="rounded-lg bg-primary/10 p-2.5 text-primary">
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
