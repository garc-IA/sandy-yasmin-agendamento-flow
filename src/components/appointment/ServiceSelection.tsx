
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Service } from "@/types/appointment.types";
import { supabase } from "@/lib/supabase";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface ServiceSelectionProps {
  selectedService: Service | null;
  updateAppointmentData: (data: { service: Service | null }) => void;
  nextStep: () => void;
}

const ServiceSelection: React.FC<ServiceSelectionProps> = ({
  selectedService,
  updateAppointmentData,
  nextStep
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      console.log("🔍 Buscando serviços...");
      
      const { data, error } = await supabase
        .from("servicos")
        .select("*")
        .eq("ativo", true)
        .order("nome");

      if (error) {
        console.error("❌ Erro ao buscar serviços:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os serviços",
          variant: "destructive",
        });
      } else {
        console.log("✅ Serviços carregados:", data?.length);
        setServices(data || []);
      }
      setLoading(false);
    };

    fetchServices();
  }, [toast]);

  const handleServiceSelect = (service: Service) => {
    console.log("✅ Serviço selecionado:", service.nome);
    updateAppointmentData({ service });
  };

  const handleContinue = () => {
    if (selectedService) {
      console.log("➡️ Avançando para próximo step com serviço:", selectedService.nome);
      nextStep();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold font-playfair mb-2">
          Escolha um Serviço
        </h2>
        <p className="text-gray-500">Selecione o serviço que deseja agendar</p>
      </div>

      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
            <p className="mt-2 text-gray-500">Carregando serviços...</p>
          </div>
        ) : services.length > 0 ? (
          services.map((service) => (
            <div
              key={service.id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                selectedService?.id === service.id
                  ? "border-primary bg-primary/5"
                  : "hover:border-gray-400"
              }`}
              onClick={() => handleServiceSelect(service)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-lg">{service.nome}</h3>
                  <p className="text-gray-600">
                    {service.duracao_em_minutos} minutos
                  </p>
                  {service.descricao && (
                    <p className="text-sm text-gray-500 mt-1">{service.descricao}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">
                    {formatCurrency(service.valor)}
                  </p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Nenhum serviço disponível no momento.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end mt-6">
        <Button
          onClick={handleContinue}
          disabled={!selectedService}
          className="min-w-[120px]"
        >
          {selectedService ? "Continuar" : "Selecione um serviço"}
        </Button>
      </div>
    </div>
  );
};

export default ServiceSelection;
