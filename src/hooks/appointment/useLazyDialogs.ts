
import { lazy, ComponentType } from 'react';

// Lazy load heavy dialog components
const LazyAppointmentDialog = lazy(() => 
  import('@/components/appointment/AppointmentDialog').then(module => ({
    default: module.AppointmentDialog
  }))
);

const LazyRescheduleDialog = lazy(() =>
  import('@/components/appointment/RescheduleDialog').then(module => ({
    default: module.RescheduleDialog
  }))
);

const LazyStatusUpdateDialog = lazy(() =>
  import('@/components/appointment/StatusUpdateDialog').then(module => ({
    default: module.StatusUpdateDialog
  }))
);

export function useLazyDialogs() {
  return {
    AppointmentDialog: LazyAppointmentDialog,
    RescheduleDialog: LazyRescheduleDialog,
    StatusUpdateDialog: LazyStatusUpdateDialog,
  };
}
