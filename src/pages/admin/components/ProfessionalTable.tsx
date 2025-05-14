
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2 } from "lucide-react";
import { Professional } from "@/lib/supabase";
import React from "react";
import { Badge } from "@/components/ui/badge";
import { DataTablePagination } from "@/components/common/DataTablePagination";

interface ProfessionalTableProps {
  professionals: Professional[];
  isLoading: boolean;
  onEdit?: (professional: Professional) => void;
  onDelete?: (professional: Professional) => void;
  formatDiasAtendimento: (dias: string[]) => string;
  onAddProfessional?: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isAdminView?: boolean;
}

const ProfessionalTable: React.FC<ProfessionalTableProps> = ({
  professionals,
  isLoading,
  onEdit,
  onDelete,
  formatDiasAtendimento,
  onAddProfessional,
  currentPage,
  totalPages,
  onPageChange,
  isAdminView = false,
}) => {
  // Lista completa dos dias da semana para verificar disponibilidade
  const diasSemana = ["domingo", "segunda", "terca", "quarta", "quinta", "sexta", "sabado"];
  const diasSemanaCompletos = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  // Função para renderizar badges dos dias de atendimento
  const renderDiasBadges = (dias: string[]) => {
    if (!dias || !Array.isArray(dias)) return null;
    
    return (
      <div className="flex flex-wrap gap-1">
        {diasSemana.map((dia, index) => (
          <Badge 
            key={dia}
            variant={dias.includes(dia) ? "default" : "outline"} 
            className={!dias.includes(dia) ? "opacity-40 text-xs" : "text-xs"}
          >
            {window.innerWidth < 640 ? diasSemanaCompletos[index].substring(0, 1) : diasSemanaCompletos[index]}
          </Badge>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : professionals && professionals.length > 0 ? (
        <>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Nome</TableHead>
                  <TableHead className="w-[40%]">Dias</TableHead>
                  <TableHead className="w-[20%]">Horários</TableHead>
                  {isAdminView && onEdit && onDelete && (
                    <TableHead className="w-[10%]">Ações</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {professionals.map((professional) => (
                  <TableRow key={professional.id}>
                    <TableCell className="font-medium">
                      {professional.nome}
                    </TableCell>
                    <TableCell>
                      {renderDiasBadges(professional.dias_atendimento)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {professional.horario_inicio} às {professional.horario_fim}
                    </TableCell>
                    {isAdminView && onEdit && onDelete && (
                      <TableCell>
                        <div className="flex space-x-1">
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(professional)}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onDelete(professional)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DataTablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      ) : (
        <div className="text-center py-8">
          <p className="text-muted-foreground mb-4">
            Não há profissionais cadastradas.
          </p>
          {onAddProfessional && (
            <Button onClick={onAddProfessional}>
              Adicionar Profissional
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default ProfessionalTable;
