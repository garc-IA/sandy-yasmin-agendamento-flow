
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { Client } from "@/lib/supabase";

interface Servico {
  id: string;
  nome: string;
  valor: number;
  duracao_em_minutos: number;
  descricao: string;
  created_at: string;
  ativo: boolean;
  categoria_id: string | null;
  imagem_url: string | null;
  admin_id: string | null;
}

interface Professional {
  id: string;
  nome: string;
}

interface UseAppointmentHandlersProps {
  setCurrentStep: (step: number) => void;
  setSelectedService: (service: Servico | null) => void;
  setSelectedProfessional: (professional: Professional | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTime: (time: string) => void;
  setClient: (client: Client | null) => void;
  setAppointmentId: (id: string) => void;
  setIsComplete: (complete: boolean) => void;
  selectedService: Servico | null;
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
  setIsComplete,
  selectedService,
  selectedProfessional,
  selectedDate,
  selectedTime,
  client,
  currentStep,
}: UseAppointmentHandlersProps) => {
  const { toast } = useToast();

  const handleServiceSelect = (service: Servico) => {
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateTimeSelect = (data: any) => {
    console.log("Dados recebidos no handleDateTimeSelect:", data);
    
    if (data.date) {
      setSelectedDate(data.date);
    }
    
    if (data.time) {
      setSelectedTime(data.time);
    }
    
    if (data.professional_id && data.professional_name) {
      setSelectedProfessional({
        id: data.professional_id,
        nome: data.professional_name
      });
      
      console.log("Profissional definido:", {
        id: data.professional_id,
        nome: data.professional_name
      });
    }
  };

  const handleCustomerSubmit = (clientData: Client) => {
    setClient(clientData);
    setCurrentStep(4);
  };

  const handleConfirmAppointment = async () => {
    console.log("Iniciando confirmação com dados:", {
      selectedService,
      selectedProfessional,
      selectedDate,
      selectedTime,
      client
    });

    if (!selectedService || !selectedProfessional || !selectedDate || !selectedTime || !client) {
      const missingData = [];
      if (!selectedService) missingData.push("serviço");
      if (!selectedProfessional) missingData.push("profissional");
      if (!selectedDate) missingData.push("data");
      if (!selectedTime) missingData.push("horário");
      if (!client) missingData.push("dados do cliente");

      toast({
        title: "Dados incompletos",
        description: `Faltam os seguintes dados: ${missingData.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Criar ou buscar cliente
      const { data: clienteData, error: clienteError } = await supabase.rpc(
        'criar_cliente',
        {
          p_nome: client.nome,
          p_telefone: client.telefone,
          p_email: client.email
        }
      );

      if (clienteError) throw clienteError;

      // Criar agendamento
      const dataFormatada = selectedDate.toISOString().split('T')[0];
      
      console.log("Criando agendamento com:", {
        cliente_id: clienteData,
        servico_id: selectedService.id,
        profissional_id: selectedProfessional.id,
        data: dataFormatada,
        hora: selectedTime,
        status: 'agendado'
      });
      
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
      setIsComplete(true);
      
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
