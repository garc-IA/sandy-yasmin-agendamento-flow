
import { Plus } from "lucide-react";
import ProfessionalTable from "./components/ProfessionalTable";
import { useToast } from "@/hooks/use-toast";
import ProfessionalFormDialog from "./profissionais/ProfessionalFormDialog";
import ProfessionalDeleteDialog from "./profissionais/ProfessionalDeleteDialog";
import { Button } from "@/components/ui/button";
import { useProfessionals } from "./profissionais/useProfessionals";
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

const PAGE_SIZE = 10;

const Professionals = () => {
  const { toast } = useToast();
  const { isLoggedIn } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const professionalState = useProfessionals({ 
    page: currentPage, 
    pageSize: PAGE_SIZE 
  });

  const totalPages = professionalState.professionals 
    ? Math.ceil(professionalState.professionals.total / PAGE_SIZE)
    : 0;

  // Função para exibir abreviatura dos dias de atendimento
  const formatDiasAtendimento = (dias: string[]) => {
    if (!Array.isArray(dias)) {
      console.warn("dias_atendimento não é um array:", dias);
      return "Formato inválido";
    }
    
    const abrev: Record<string, string> = {
      segunda: "Seg",
      terca: "Ter",
      quarta: "Qua",
      quinta: "Qui",
      sexta: "Sex",
      sabado: "Sáb",
      domingo: "Dom",
    };
    
    if (!dias || dias.length === 0) return "Sem dias definidos";
    if (dias.length === 7) return "Todos os dias";
    return dias.map((dia) => abrev[dia] || dia).join(", ");
  };

  // Check if user has permission to manage professionals
  // In this simplified version, we just check if they're logged in
  const canManageProfessionals = isLoggedIn;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center flex-wrap gap-y-4">
        <div>
          <h1 className="text-3xl font-semibold mb-2">Profissionais</h1>
          <p className="text-muted-foreground">
            Gerencie os profissionais do salão
          </p>
        </div>
        {canManageProfessionals && (
          <Button 
            onClick={professionalState.openNewProfessionalDialog} 
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> Novo Profissional
          </Button>
        )}
      </div>
      
      <div className="bg-white rounded-lg shadow">
        <ProfessionalTable
          professionals={professionalState.professionals?.data || []}
          isLoading={professionalState.isLoading}
          onEdit={canManageProfessionals ? professionalState.handleEdit : undefined}
          onDelete={canManageProfessionals ? professionalState.handleDelete : undefined}
          formatDiasAtendimento={formatDiasAtendimento}
          onAddProfessional={canManageProfessionals ? professionalState.openNewProfessionalDialog : undefined}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          isAdminView={canManageProfessionals}
        />
      </div>

      {canManageProfessionals && (
        <>
          <ProfessionalFormDialog
            open={professionalState.isDialogOpen}
            isEditing={professionalState.isEditing}
            form={professionalState.formData}
            errors={professionalState.errors}
            onChange={professionalState.handleChange}
            onToggleDay={professionalState.toggleDay}
            onClose={() => {
              professionalState.setIsDialogOpen(false);
              professionalState.resetForm();
            }}
            onSubmit={professionalState.handleSubmit}
          />

          <ProfessionalDeleteDialog
            open={professionalState.isDeleteDialogOpen}
            professional={professionalState.currentProfessional}
            onCancel={() => professionalState.setIsDeleteDialogOpen(false)}
            onDelete={() => {
              if (professionalState.currentProfessional) {
                professionalState.deleteProfessionalMutation.mutate(
                  professionalState.currentProfessional.id
                );
              }
            }}
          />
        </>
      )}
    </div>
  );
};

export default Professionals;
