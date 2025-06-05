
import { useEffect, useState } from "react";
import { useAppointmentsData } from "@/hooks/appointment/useAppointmentsData";
import { useAppointmentLoadingState } from "@/hooks/appointment/useAppointmentLoadingState";
import { AdminAppointmentFilters } from "./AdminAppointmentFilters";
import { AdminAppointmentDialogs } from "./AdminAppointmentDialogs";
import { AdminAppointmentPageHeader } from "./components/AdminAppointmentPageHeader";
import { AdminAppointmentSections } from "./components/AdminAppointmentSections";
import { useAdminAppointmentDialogs } from "./hooks/useAdminAppointmentDialogs";

export function AdminAppointmentList() {
  const {
    // Filter state
    selectedDate,
    setSelectedDate,
    statusFilter,
    setStatusFilter,
    professionalFilter,
    setProfessionalFilter,
    searchQuery,
    setSearchQuery,
    
    // Data
    appointments,
    professionals,
    isLoading,
    error,
    
    // Actions
    refetch,
    handleAppointmentUpdated
  } = useAppointmentsData();

  // Dialog management
  const {
    selectedAppointment,
    showDetailsDialog,
    showCancelDialog,
    showRescheduleDialog,
    showDeleteDialog,
    setShowDetailsDialog,
    setShowCancelDialog,
    setShowRescheduleDialog,
    setShowDeleteDialog,
    handleSelectAppointment,
  } = useAdminAppointmentDialogs();

  // Selected tab state
  const [currentTab, setCurrentTab] = useState("all");
  
  // Manual refresh indicator
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Loading state management
  const { shouldShowSkeleton, shouldShowError } = useAppointmentLoadingState({
    isLoading: isLoading || isRefreshing,
    appointments,
    error
  });

  // When statusFilter changes, update the tab
  useEffect(() => {
    setCurrentTab(statusFilter);
  }, [statusFilter]);

  // When tab changes, update the statusFilter
  const handleTabChange = (value: string) => {
    setCurrentTab(value);
    setStatusFilter(value);
  };

  // Function to refresh the data
  const handleRefresh = async () => {
    setIsRefreshing(true);
    console.log("🔄 Manual refresh requested by user");
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <AdminAppointmentPageHeader
        selectedDate={selectedDate}
        isLoading={isLoading}
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
      />

      {/* Filters */}
      <AdminAppointmentFilters
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        professionalFilter={professionalFilter}
        setProfessionalFilter={setProfessionalFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        professionals={professionals}
      />
      
      {/* Appointment Sections */}
      <AdminAppointmentSections
        appointments={appointments}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        onSelectAppointment={handleSelectAppointment}
        shouldShowError={shouldShowError}
        shouldShowSkeleton={shouldShowSkeleton}
      />
      
      {/* Dialogs */}
      <AdminAppointmentDialogs
        appointment={selectedAppointment}
        showDetailsDialog={showDetailsDialog}
        setShowDetailsDialog={setShowDetailsDialog}
        showCancelDialog={showCancelDialog}
        setShowCancelDialog={setShowCancelDialog}
        showRescheduleDialog={showRescheduleDialog}
        setShowRescheduleDialog={setShowRescheduleDialog}
        showDeleteDialog={showDeleteDialog}
        setShowDeleteDialog={setShowDeleteDialog}
        onAppointmentUpdated={handleAppointmentUpdated}
      />
    </div>
  );
}
