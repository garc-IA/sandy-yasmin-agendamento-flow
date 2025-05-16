import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase, Service } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";
import ServiceTable from "./services/ServiceTable";
import ServiceDialog from "./services/ServiceDialog";
import DeleteServiceDialog from "./services/DeleteServiceDialog";
import { formatCurrency } from "@/lib/utils";
import { useAppointmentCache } from "@/hooks/appointment/useAppointmentCache";

const Services = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { invalidateAppointmentQueries } = useAppointmentCache();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentService, setCurrentService] = useState<Service | null>(null);

  const { data: services, isLoading } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      try {
        console.log("Fetching services...");
        const { data, error } = await supabase
          .from("servicos")
          .select(`
            *,
            categorias_servico (
              id,
              nome
            )
          `)
          .order('nome');

        if (error) {
          console.error("Error fetching services:", error);
          toast({
            title: "Erro ao carregar serviços",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        
        console.log(`Successfully fetched ${data?.length || 0} services`);
        return data as Service[];
      } catch (error: any) {
        console.error("Error in services query:", error);
        throw error;
      }
    },
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("categorias_servico")
          .select("*")
          .order('ordem');

        if (error) {
          toast({
            title: "Erro ao carregar categorias",
            description: error.message,
            variant: "destructive",
          });
          throw error;
        }
        return data;
      } catch (error: any) {
        console.error("Erro ao buscar categorias:", error);
        throw error;
      }
    },
  });

  const createServiceMutation = useMutation({
    mutationFn: async (service: Omit<Service, "id" | "created_at">) => {
      console.log("Creating new service with data:", service);
      try {
        const { data, error } = await supabase
          .from("servicos")
          .insert(service)
          .select()
          .single();

        if (error) {
          console.error("Error creating service:", error);
          throw error;
        }
        
        console.log("Service created successfully:", data);
        return data;
      } catch (error: any) {
        console.error("Error in create service mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("CreateService mutation succeeded, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      invalidateAppointmentQueries();
      
      toast({
        title: "Serviço cadastrado",
        description: "O serviço foi adicionado com sucesso.",
      });
      
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("CreateService mutation failed:", error);
      toast({
        title: "Erro ao cadastrar serviço",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const updateServiceMutation = useMutation({
    mutationFn: async ({ id, service }: { id: string; service: Partial<Service> }) => {
      console.log(`Updating service ${id} with data:`, service);
      try {
        const { data, error } = await supabase
          .from("servicos")
          .update(service)
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Error updating service:", error);
          throw error;
        }
        
        console.log("Service updated successfully:", data);
        return data;
      } catch (error: any) {
        console.error("Error in update service mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("UpdateService mutation succeeded, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      invalidateAppointmentQueries();
      
      toast({
        title: "Serviço atualizado",
        description: "O serviço foi atualizado com sucesso.",
      });
      
      setIsDialogOpen(false);
      resetForm();
    },
    onError: (error) => {
      console.error("UpdateService mutation failed:", error);
      toast({
        title: "Erro ao atualizar serviço",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const deleteServiceMutation = useMutation({
    mutationFn: async (id: string) => {
      console.log(`Deleting service ${id}`);
      try {
        const { error } = await supabase.from("servicos").delete().eq("id", id);

        if (error) {
          console.error("Error deleting service:", error);
          throw error;
        }
        
        console.log("Service deleted successfully");
        return id;
      } catch (error: any) {
        console.error("Error in delete service mutation:", error);
        throw error;
      }
    },
    onSuccess: () => {
      console.log("DeleteService mutation succeeded, invalidating queries");
      queryClient.invalidateQueries({ queryKey: ["services"] });
      invalidateAppointmentQueries();
      
      toast({
        title: "Serviço excluído",
        description: "O serviço foi excluído com sucesso.",
      });
      
      setIsDeleteDialogOpen(false);
      setCurrentService(null);
    },
    onError: (error) => {
      console.error("DeleteService mutation failed:", error);
      toast({
        title: "Erro ao excluir serviço",
        description: String(error),
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (formData: any) => {
    console.log("Processing service form submission:", formData);

    // Get admin ID
    const { data: adminData, error: adminError } = await supabase
      .from("admins")
      .select("id")
      .eq("email", "admin@studio.com")
      .single();
    
    if (adminError || !adminData?.id) {
      console.error("Error fetching admin ID:", adminError);
      toast({
        title: "Erro ao processar serviço",
        description: "Não foi possível identificar o administrador.",
        variant: "destructive",
      });
      return;
    }

    const serviceData = {
      nome: formData.nome,
      descricao: formData.descricao || null,
      valor: Number(formData.valor.replace(",", ".")),
      duracao_em_minutos: Number(formData.duracao_em_minutos),
      categoria_id: formData.categoria_id || null,
      imagem_url: formData.imagem_url || null,
      ativo: true,
      admin_id: adminData.id // Adicionando o admin_id que estava faltando
    };

    if (isEditing && currentService) {
      console.log("Updating existing service");
      updateServiceMutation.mutate({
        id: currentService.id,
        service: serviceData,
      });
    } else {
      console.log("Creating new service");
      createServiceMutation.mutate(serviceData);
    }
  };

  const handleEdit = (service: Service) => {
    console.log("Editing service:", service);
    setCurrentService(service);
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDelete = (service: Service) => {
    console.log("Preparing to delete service:", service);
    setCurrentService(service);
    setIsDeleteDialogOpen(true);
  };

  const resetForm = () => {
    console.log("Resetting service form");
    setIsEditing(false);
    setCurrentService(null);
  };

  const openNewServiceDialog = () => {
    console.log("Opening new service dialog");
    resetForm();
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Serviços</h1>
          <p className="text-muted-foreground">
            Gerencie os serviços oferecidos pelo salão
          </p>
        </div>
        <Button onClick={openNewServiceDialog} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="h-4 w-4" /> Novo Serviço
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Gerenciamento de Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceTable
            services={services}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDelete}
            openNewServiceDialog={openNewServiceDialog}
            formatCurrency={formatCurrency}
          />
        </CardContent>
      </Card>

      <ServiceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        isEditing={isEditing}
        currentService={currentService}
        onSubmit={handleSubmit}
        resetForm={resetForm}
        categories={categories || []}
        isSubmitting={createServiceMutation.isPending || updateServiceMutation.isPending}
      />

      <DeleteServiceDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        currentService={currentService}
        onDelete={() => {
          if (currentService) deleteServiceMutation.mutate(currentService.id);
        }}
        onCancel={() => setCurrentService(null)}
      />
    </div>
  );
};

export default Services;
