
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Download, Upload, Database, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface BackupRecord {
  id: string;
  name: string;
  size: string;
  created_at: string;
  status: 'completed' | 'in_progress' | 'failed';
  type: 'manual' | 'automatic';
}

// Mock data
const mockBackups: BackupRecord[] = [
  {
    id: "1",
    name: "backup_completo_2024_01_15.json",
    size: "2.4 MB",
    created_at: new Date().toISOString(),
    status: 'completed',
    type: 'manual'
  },
  {
    id: "2",
    name: "backup_automatico_2024_01_14.json",
    size: "2.1 MB",
    created_at: new Date(Date.now() - 86400000).toISOString(),
    status: 'completed',
    type: 'automatic'
  },
];

export function BackupManager() {
  const [backups] = useState<BackupRecord[]>(mockBackups);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();

  const handleExportData = async () => {
    setIsExporting(true);
    try {
      // Simulate backup process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0",
        data: {
          agendamentos: [],
          clientes: [],
          profissionais: [],
          servicos: []
        }
      };
      
      const blob = new Blob([JSON.stringify(backupData, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `backup_studio_${format(new Date(), 'yyyy_MM_dd_HHmm')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Backup criado com sucesso",
        description: "Seus dados foram exportados para download.",
      });
    } catch (error) {
      toast({
        title: "Erro ao criar backup",
        description: "Ocorreu um erro durante a exportação dos dados.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      // Validate backup structure
      if (!data.data || !data.timestamp) {
        throw new Error('Formato de backup inválido');
      }
      
      // Simulate import process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      toast({
        title: "Dados importados com sucesso",
        description: "O backup foi restaurado com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro na importação",
        description: "Verifique se o arquivo é um backup válido.",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
      // Reset input
      event.target.value = '';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Backup e Restauração
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Recomendamos fazer backup dos dados regularmente. 
              A restauração substitui todos os dados atuais.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              onClick={handleExportData}
              disabled={isExporting}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exportando..." : "Exportar Dados"}
            </Button>
            
            <div className="relative">
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isImporting}
              />
              <Button 
                variant="outline"
                disabled={isImporting}
                className="flex items-center gap-2 w-full"
              >
                <Upload className="h-4 w-4" />
                {isImporting ? "Importando..." : "Importar Backup"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Histórico de Backups
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {backups.map((backup) => (
              <div 
                key={backup.id}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(backup.status)}
                  <div>
                    <p className="font-medium">{backup.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(backup.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })} 
                      • {backup.size}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(backup.status)}>
                    {backup.status === 'completed' ? 'Concluído' : 
                     backup.status === 'in_progress' ? 'Em andamento' : 'Falhou'}
                  </Badge>
                  <Badge variant="outline">
                    {backup.type === 'manual' ? 'Manual' : 'Automático'}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
