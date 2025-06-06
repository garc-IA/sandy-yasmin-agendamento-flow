
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Service, Professional, Client } from "@/types/appointment.types";

interface UseAppointmentHandlersProps {
  setCurrentStep: (step: number) => void;
  setSelectedService: (service: Service | null) => void;
  setSelectedProfessional: (professional: Professional | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string) => void;
  setClient: (client: Client | null) => void;
  setAppointmentId: (id: string) => void;
  setIsSubmitting: (submitting: boolean) => void;
  setIsComplete: (complete: boolean) => void;
  selectedService: Service | null;
  selectedProfessional: Professional | null;
  selectedDate: Date | null;
  selectedTime: string;
  client: Client | null;
  currentStep: number;
}

export const useAppointmentHandlers = ({
  setCurrentStep,
  setSelectedService,
  setSelectedProfessional,
  setSelectedDate,
  setSelectedTime,
  setClient,
  setAppointmentId,
  setIsSubmitting,
  setIsComplete,
  selectedService,
  selectedProfessional,
  selectedDate,
  selectedTime,
  client,
  currentStep,
}: UseAppointmentHandlersProps) => {
  const { toast } = useToast();

  const handleServiceSelect = (service: Service) => {
    console.log("✅ Serviço selecionado:", service);
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateTimeSelect = (data: {
    date?: Date;
    time?: string;
    professional?: Professional;
  }) => {
    console.log("✅ Dados de data/hora recebidos:", data);
    
    if (data.date) {
      console.log("📅 Definindo data:", data.date);
      setSelectedDate(data.date);
    }
    
    if (data.time) {
      console.log("⏰ Definindo horário:", data.time);
      setSelectedTime(data.time);
    }
    
    if (data.professional) {
      console.log("👨‍💼 Definindo profissional:", data.professional);
      setSelectedProfessional(data.professional);
    }
  };

  const handleCustomerSubmit = (clientData: Client) => {
    console.log("✅ Cliente definido:", clientData);
    setClient(clientData);
    setCurrentStep(4);
  };

  const handleConfirmAppointment = async () => {
    console.log("=== INICIANDO CONFIRMAÇÃO DE AGENDAMENTO ===");
    
    // Validação rigorosa antes de prosseguir
    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !client) {
      const missing = [];
      if (!selectedService) missing.push("serviço");
      if (!selectedProfessional) missing.push("profissional");
      if (!selectedDate) missing.push("data");
      if (!selectedTime) missing.push("horário");
      if (!client) missing.push("dados do cliente");
      
      console.error("❌ DADOS FALTANDO:", missing);
      toast({
        title: "Dados incompletos",
        description: `Faltam: ${missing.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      console.log("🔍 Buscando admin...");
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("id")
        .eq("email", "admin@studio.com")
        .single();

      if (adminError || !adminData?.id) {
        console.error("❌ Erro ao buscar admin:", adminError);
        throw new Error("Admin não encontrado");
      }

      console.log("✅ Admin encontrado:", adminData.id);

      console.log("👤 Criando/buscando cliente...");
      const { data: clienteId, error: clienteError } = await supabase.rpc(
        'criar_cliente',
        {
          p_nome: client.nome,
          p_telefone: client.telefone,
          p_email: client.email,
          p_admin_id: adminData.id
        }
      );

      if (clienteError) {
        console.error("❌ Erro ao criar cliente:", clienteError);
        throw clienteError;
      }

      console.log("✅ Cliente ID:", clienteId);

      const dataFormatada = selectedDate.toISOString().split('T')[0];
      
      console.log("📝 Criando agendamento:", {
        cliente_id: clienteId,
        servico_id: selectedService.id,
        profissional_id: selectedProfessional.id,
        data: dataFormatada,
        hora: selectedTime,
        status: 'agendado'
      });
      
      const { data: agendamentoData, error: agendamentoError } = await supabase
        .from('agendamentos')
        .insert({
          cliente_id: clienteId,
          servico_id: selectedService.id,
          profissional_id: selectedProfessional.id,
          data: dataFormatada,
          hora: selectedTime,
          status: 'agendado'
        })
        .select()
        .single();

      if (agendamentoError) {
        console.error("❌ Erro ao criar agendamento:", agendamentoError);
        throw agendamentoError;
      }

      console.log("✅ Agendamento criado:", agendamentoData);

      setAppointmentId(agendamentoData.id);
      setIsComplete(true);
      
      toast({
        title: "Sucesso!",
        description: "Agendamento realizado com sucesso!",
      });

    } catch (error) {
      console.error('❌ ERRO FATAL:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
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

  return {
    handleServiceSelect,
    handleDateTimeSelect,
    handleCustomerSubmit,
    handleConfirmAppointment,
    handleBack,
  };
};
