
import { AppointmentCardSkeleton } from "./AppointmentCardSkeleton";

interface AppointmentListSkeletonProps {
  count?: number;
}

export function AppointmentListSkeleton({ count = 3 }: AppointmentListSkeletonProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }, (_, index) => (
        <AppointmentCardSkeleton key={index} />
      ))}
    </div>
  );
}
