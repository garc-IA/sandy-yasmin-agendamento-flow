
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
    console.log("Serviço selecionado:", service);
    setSelectedService(service);
    setCurrentStep(2);
  };

  const handleDateTimeSelect = (data: any) => {
    console.log("Dados recebidos no handleDateTimeSelect:", data);
    
    if (data.date) {
      console.log("Definindo data:", data.date);
      setSelectedDate(data.date);
    }
    
    if (data.time) {
      console.log("Definindo horário:", data.time);
      setSelectedTime(data.time);
    }
    
    if (data.professional_id && data.professional_name) {
      const professional = {
        id: data.professional_id,
        nome: data.professional_name
      };
      console.log("Definindo profissional:", professional);
      setSelectedProfessional(professional);
    }
  };

  const handleCustomerSubmit = (clientData: Client) => {
    console.log("Cliente definido:", clientData);
    setClient(clientData);
    setCurrentStep(4);
  };

  const handleConfirmAppointment = async () => {
    console.log("=== INICIANDO CONFIRMAÇÃO DE AGENDAMENTO ===");
    console.log("Dados do agendamento:", {
      selectedService: selectedService?.nome,
      selectedProfessional: selectedProfessional?.nome,
      selectedDate,
      selectedTime,
      client: client?.nome
    });

    // Validação rigorosa de todos os dados necessários
    const missingData = [];
    if (!selectedService) missingData.push("serviço");
    if (!selectedProfessional) missingData.push("profissional");
    if (!selectedDate) missingData.push("data");
    if (!selectedTime) missingData.push("horário");
    if (!client) missingData.push("dados do cliente");

    if (missingData.length > 0) {
      console.error("ERRO: Dados faltando:", missingData);
      toast({
        title: "Dados incompletos",
        description: `Faltam os seguintes dados: ${missingData.join(", ")}`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Buscar admin ID
      console.log("Buscando admin...");
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("id")
        .eq("email", "admin@studio.com")
        .single();

      if (adminError || !adminData?.id) {
        console.error("Erro ao buscar admin:", adminError);
        throw new Error("Admin não encontrado");
      }

      console.log("Admin encontrado:", adminData.id);

      // Criar ou buscar cliente usando a função do banco
      console.log("Criando/buscando cliente...");
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
        console.error("Erro ao criar/buscar cliente:", clienteError);
        throw clienteError;
      }

      console.log("Cliente ID:", clienteId);

      // Criar agendamento
      const dataFormatada = selectedDate.toISOString().split('T')[0];
      
      console.log("Criando agendamento com dados:", {
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
        console.error("Erro ao criar agendamento:", agendamentoError);
        throw agendamentoError;
      }

      console.log("Agendamento criado com sucesso:", agendamentoData);

      setAppointmentId(agendamentoData.id);
      setIsComplete(true);
      
      toast({
        title: "Sucesso!",
        description: "Agendamento realizado com sucesso!",
      });

    } catch (error) {
      console.error('ERRO FATAL ao criar agendamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível realizar o agendamento. Tente novamente.",
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
