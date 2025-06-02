
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock,
  MoreHorizontal 
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { AppointmentWithDetails } from "@/types/appointment.types";
import { cn } from "@/lib/utils";

interface QuickActionsProps {
  appointment: AppointmentWithDetails;
  onReschedule: () => void;
  onComplete: () => void;
  onCancel: () => void;
  onViewDetails: () => void;
  isLoading?: boolean;
  compact?: boolean;
}

export function QuickActions({
  appointment,
  onReschedule,
  onComplete,
  onCancel,
  onViewDetails,
  isLoading = false,
  compact = false
}: QuickActionsProps) {
  const isActive = appointment.status === "agendado";
  const isCompleted = appointment.status === "concluido";
  const isCanceled = appointment.status === "cancelado";

  if (compact) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm" 
            disabled={isLoading}
            className="h-8 w-8 p-0 transition-all duration-200 hover:scale-110"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 animate-scale-in">
          <DropdownMenuItem onClick={onViewDetails} className="transition-colors duration-200">
            <Clock className="h-4 w-4 mr-2" />
            Ver Detalhes
          </DropdownMenuItem>
          
          {isActive && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={onReschedule} 
                disabled={isLoading}
                className="transition-colors duration-200"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Reagendar
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onComplete} 
                disabled={isLoading}
                className="text-green-600 transition-colors duration-200 hover:text-green-700"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Concluir
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={onCancel} 
                disabled={isLoading}
                className="text-red-600 transition-colors duration-200 hover:text-red-700"
              >
                <XCircle className="h-4 w-4 mr-2" />
                Cancelar
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="flex gap-2 animate-fade-in">
      <Button
        variant="outline"
        size="sm"
        onClick={onViewDetails}
        className="transition-all duration-200 hover:scale-105"
      >
        <Clock className="h-4 w-4 mr-1" />
        Detalhes
      </Button>
      
      {isActive && (
        <>
          <Button
            variant="outline"
            size="sm"
            onClick={onReschedule}
            disabled={isLoading}
            className="transition-all duration-200 hover:scale-105 hover:border-blue-300"
          >
            <Calendar className="h-4 w-4 mr-1" />
            Reagendar
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onComplete}
            disabled={isLoading}
            className="transition-all duration-200 hover:scale-105 hover:border-green-300 hover:text-green-600"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Concluir
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="transition-all duration-200 hover:scale-105 hover:border-red-300 hover:text-red-600"
          >
            <XCircle className="h-4 w-4 mr-1" />
            Cancelar
          </Button>
        </>
      )}
      
      {isCompleted && (
        <div className="flex items-center text-green-600 text-sm font-medium animate-fade-in">
          <CheckCircle className="h-4 w-4 mr-1" />
          Concluído
        </div>
      )}
      
      {isCanceled && (
        <div className="flex items-center text-red-600 text-sm font-medium animate-fade-in">
          <XCircle className="h-4 w-4 mr-1" />
          Cancelado
        </div>
      )}
    </div>
  );
}
