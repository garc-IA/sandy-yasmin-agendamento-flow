
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { formatDate } from "@/lib/dateUtils";
import { Loader2 } from "lucide-react";

interface HistoryEntry {
  id: string;
  created_at: string;
  agendamento_id: string;
  tipo: string;
  descricao: string;
  novo_valor?: string;
}

interface AppointmentHistoryProps {
  appointmentId: string;
}

export function AppointmentHistory({ appointmentId }: AppointmentHistoryProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      setIsLoading(true);
      try {
        console.log("🔍 Buscando histórico para agendamento:", appointmentId);
        
        const { data, error } = await supabase
          .from("agendamento_historico")
          .select("*")
          .eq("agendamento_id", appointmentId)
          .order("created_at", { ascending: false });

        if (error) {
          console.error("❌ Erro ao buscar histórico:", error);
          throw error;
        }

        console.log("✅ Histórico carregado:", data?.length || 0, "entradas");
        setHistory(data || []);
      } catch (error) {
        console.error("❌ Erro ao buscar histórico:", error);
        setHistory([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (appointmentId) {
      fetchHistory();
    }
  }, [appointmentId]);

  // Helper to format status
  const formatStatus = (status: string) => {
    switch (status) {
      case "agendado":
        return "Agendado";
      case "concluido":
        return "Concluído";
      case "cancelado":
        return "Cancelado";
      case "reagendado":
        return "Reagendado";
      case "auto_complete":
        return "Auto-concluído";
      default:
        return status;
    }
  };

  // Helper to get icon for status
  const getStatusIcon = (tipo: string) => {
    switch (tipo) {
      case "agendado":
        return "📅";
      case "concluido":
        return "✅";
      case "cancelado":
        return "❌";
      case "reagendado":
        return "🔄";
      case "auto_complete":
        return "🤖";
      default:
        return "📝";
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground">
        <p>Nenhum histórico disponível para este agendamento.</p>
        <p className="text-sm mt-2">
          As alterações feitas neste agendamento aparecerão aqui.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground mb-2">
        Mostrando histórico de alterações ({history.length} entradas)
      </div>
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {history.map((entry) => (
          <div
            key={entry.id}
            className="border rounded-md p-4 space-y-2 bg-white shadow-sm"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getStatusIcon(entry.tipo)}</span>
                <span className="font-medium">
                  {formatStatus(entry.tipo)}
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                {new Date(entry.created_at).toLocaleString("pt-BR")}
              </div>
            </div>
            
            {entry.descricao && (
              <div className="text-sm">
                <span className="text-muted-foreground">Descrição: </span>
                <span>{entry.descricao}</span>
              </div>
            )}
            
            {entry.novo_valor && (
              <div className="text-sm">
                <span className="text-muted-foreground">Novo valor: </span>
                <span className="font-medium">{entry.novo_valor}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
