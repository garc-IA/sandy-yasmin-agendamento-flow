
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export function AppointmentCardSkeleton() {
  return (
    <Card className="p-4 border rounded-lg shadow-sm animate-pulse">
      <div className="flex flex-col sm:flex-row justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <Skeleton className="h-5 w-32 animate-pulse" />
            <Skeleton className="h-5 w-16 animate-pulse" />
          </div>
          
          <Skeleton className="h-4 w-28 mb-2 animate-pulse" />
          
          <div className="mt-2">
            <Skeleton className="h-4 w-24 mb-1 animate-pulse" />
            <Skeleton className="h-4 w-36 animate-pulse" />
          </div>
        </div>

        <div className="mt-4 sm:mt-0 text-right">
          <div className="space-y-1">
            <Skeleton className="h-4 w-20 ml-auto animate-pulse" />
            <Skeleton className="h-6 w-16 ml-auto animate-pulse" />
            <Skeleton className="h-3 w-24 ml-auto animate-pulse" />
          </div>
          
          <div className="mt-3 flex justify-end gap-2">
            <Skeleton className="h-8 w-20 animate-pulse" />
            <Skeleton className="h-8 w-20 animate-pulse" />
            <Skeleton className="h-8 w-16 animate-pulse" />
          </div>
        </div>
      </div>
    </Card>
  );
}
