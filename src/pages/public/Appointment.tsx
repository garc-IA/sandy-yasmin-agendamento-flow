
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import ServiceSelection from "@/components/appointment/ServiceSelection";
import DateAndTimeSelector from "@/components/appointment/DateAndTimeSelector";
import CustomerForm from "@/components/appointment/CustomerForm";
import AppointmentSummary from "@/components/appointment/AppointmentSummary";
import Confirmation from "@/components/appointment/Confirmation";
import { useSystemAvailability } from "@/hooks/useSystemAvailability";
import { SystemMaintenanceMessage } from "@/components/appointment/SystemMaintenanceMessage";
import { Loader2 } from "lucide-react";

interface Customer {
  nome: string;
  telefone: string;
  email: string;
}

interface Servico {
  id: string;
  nome: string;
  valor: number;
  duracao_em_minutos: number;
  descricao?: string;
}

interface Professional {
  id: string;
  nome: string;
}

export default function Appointment() {
  const { isSystemActive, maintenanceMessage, isLoading } = useSystemAvailability();
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Servico | null>(null);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [customer, setCustomer] = useState<Customer>({
    nome: "",
    telefone: "",
    email: "",
  });
  const [appointmentId, setAppointmentId] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Se ainda está carregando o status do sistema
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Se o sistema não está ativo, mostrar mensagem de manutenção
  if (!isSystemActive) {
    return <SystemMaintenanceMessage message={maintenanceMessage} />;
  }

  const handleServiceSelect = (service: Servico) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateTimeSelect = (professional: Professional, date: Date, time: string) => {
    setSelectedProfessional(professional);
    setSelectedDate(date);
    setSelectedTime(time);
    setCurrentStep(3);
  };

  const handleCustomerSubmit = (customerData: Customer) => {
    setCustomer(customerData);
    setCurrentStep(4);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime) {
      toast({
        title: "Erro",
        description: "Dados do agendamento incompletos",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Criar ou buscar cliente
      const { data: clienteData, error: clienteError } = await supabase.rpc(
        'criar_cliente',
        {
          p_nome: customer.nome,
          p_telefone: customer.telefone,
          p_email: customer.email
        }
      );

      if (clienteError) throw clienteError;

      // Criar agendamento
      const dataFormatada = selectedDate.toISOString().split('T')[0];
      
      const { data: agendamentoData, error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert({
          cliente_id: clienteData,
          servico_id: selectedService.id,
          profissional_id: selectedProfessional.id,
          data: dataFormatada,
          hora: selectedTime,
          status: 'agendado'
        })
        .select()
        .single();

      if (agendamentoError) throw agendamentoError;

      setAppointmentId(agendamentoData.id);
      setCurrentStep(5);
      
      toast({
        title: "Sucesso!",
        description: "Agendamento realizado com sucesso",
      });
    } catch (error) {
      console.error('Erro ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNewAppointment = () => {
    setCurrentStep(1);
    setSelectedService(null);
    setSelectedProfessional(null);
    setSelectedDate(null);
    setSelectedTime("");
    setCustomer({ nome: "", telefone: "", email: "" });
    setAppointmentId("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="shadow-xl border-0">
          <CardHeader className="text-center bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-2xl font-bold">
              {currentStep === 5 ? "Agendamento Confirmado!" : "Agendar Horário"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {currentStep === 1 && (
              <ServiceSelection onServiceSelect={handleServiceSelect} />
            )}
            
            {currentStep === 2 && selectedService && (
              <DateAndTimeSelector
                service={selectedService}
                onDateTimeSelect={handleDateTimeSelect}
                onBack={handleBack}
              />
            )}
            
            {currentStep === 3 && (
              <CustomerForm
                onSubmit={handleCustomerSubmit}
                onBack={handleBack}
              />
            )}
            
            {currentStep === 4 && (
              <AppointmentSummary
                service={selectedService}
                professional={selectedProfessional}
                date={selectedDate}
                time={selectedTime}
                customer={customer}
                onConfirm={handleConfirmAppointment}
                onBack={handleBack}
                isSubmitting={isSubmitting}
              />
            )}
            
            {currentStep === 5 && (
              <Confirmation
                appointmentId={appointmentId}
                service={selectedService}
                professional={selectedProfessional}
                date={selectedDate}
                time={selectedTime}
                customer={customer}
                onNewAppointment={handleNewAppointment}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
