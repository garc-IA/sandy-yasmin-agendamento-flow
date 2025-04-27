
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: number;
    positive: boolean;
  };
  loading?: boolean;
  className?: string;
}

export const StatCard = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
}: StatCardProps) => {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold animate-fade-in">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {trend && (
          <div className="flex items-center text-xs mt-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 font-medium",
                trend.positive
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              )}
            >
              {trend.positive ? "+" : "-"}
              {trend.value}%
            </span>
            <span className="ml-1 text-muted-foreground">
              em relação ao último período
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
