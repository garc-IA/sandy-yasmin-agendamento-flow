
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { AppointmentDialogProvider } from "@/components/appointment/context/AppointmentDialogContext";
import { AppointmentList } from "@/components/appointment/AppointmentList";
import { AppointmentPageHeader } from "./components/AppointmentPageHeader";
import { AppointmentFilters } from "./components/AppointmentFilters";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader } from "lucide-react";

export default function NewAppointmentPage() {
  // State for filters
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [professionalFilter, setProfessionalFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch appointments with proper error handling
  const { 
    data: appointments = [], 
    isLoading, 
    refetch,
    error
  } = useQuery({
    queryKey: ["appointments", selectedDate, statusFilter, professionalFilter, searchQuery],
    queryFn: async () => {
      try {
        let query = supabase
          .from("agendamentos")
          .select(`
            *,
            cliente:clientes(*),
            servico:servicos(*),
            profissional:profissionais(*)
          `);
        
        // Apply date filter
        if (selectedDate) {
          query = query.eq("data", format(selectedDate, "yyyy-MM-dd"));
        }
        
        // Apply status filter
        if (statusFilter !== "all") {
          query = query.eq("status", statusFilter);
        }
        
        // Apply professional filter
        if (professionalFilter !== "all") {
          query = query.eq("profissional_id", professionalFilter);
        }
        
        console.log("Executing appointments query...");
        const { data, error } = await query.order("hora");
        
        if (error) {
          console.error("Error fetching appointments:", error);
          throw error;
        }
        
        console.log(`Retrieved ${data?.length || 0} appointments`);
        
        // Apply search filter on client side
        if (searchQuery && data) {
          const lowerQuery = searchQuery.toLowerCase();
          return data.filter((appt: any) => 
            appt.cliente.nome.toLowerCase().includes(lowerQuery) ||
            appt.cliente.telefone.includes(searchQuery) ||
            appt.cliente.email?.toLowerCase().includes(lowerQuery) ||
            appt.servico.nome.toLowerCase().includes(lowerQuery)
          );
        }
        
        return data || [];
      } catch (err) {
        console.error("Failed to fetch appointments:", err);
        throw err;
      }
    },
  });

  // Fetch professionals for filter
  const { data: professionals = [] } = useQuery({
    queryKey: ["professionals"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("profissionais")
          .select("*")
          .order("nome");
        
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Failed to fetch professionals:", err);
        return [];
      }
    },
  });

  // Handle appointment update with proper logging
  const handleAppointmentUpdated = () => {
    console.log("Appointment updated, refreshing data...");
    refetch();
  };

  return (
    <div className="space-y-6">
      <AppointmentPageHeader 
        title="Gerenciamento de Agendamentos"
        description="Visualize e gerencie todos os agendamentos do salão"
      />
      
      <AppointmentFilters 
        selectedDate={selectedDate}
        setSelectedDate={setSelectedDate}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        professionalFilter={professionalFilter}
        setProfessionalFilter={setProfessionalFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        professionals={professionals}
        isLoading={isLoading}
      />
      
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="text-center py-8 text-red-500">
              Erro ao carregar agendamentos. Por favor, tente novamente.
            </div>
          ) : isLoading ? (
            <div className="flex justify-center py-12">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <AppointmentDialogProvider onAppointmentUpdated={handleAppointmentUpdated}>
              <AppointmentList 
                appointments={appointments as AppointmentWithDetails[]}
                onAppointmentUpdated={handleAppointmentUpdated}
                showAll={statusFilter === "all" || statusFilter === "cancelado"}
              />
            </AppointmentDialogProvider>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
