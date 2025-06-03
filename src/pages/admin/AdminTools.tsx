
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ActivityLogsList } from "@/components/admin/logs/ActivityLogsList";
import { BackupManager } from "@/components/admin/backup/BackupManager";
import { AdvancedAnalytics } from "@/components/admin/analytics/AdvancedAnalytics";
import { SystemSettings } from "@/components/admin/settings/SystemSettings";
import { History, Database, BarChart3, Settings } from "lucide-react";

const AdminTools = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Ferramentas Administrativas</h1>
      
      <Tabs defaultValue="analytics" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Logs
          </TabsTrigger>
          <TabsTrigger value="backup" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics">
          <AdvancedAnalytics />
        </TabsContent>

        <TabsContent value="logs">
          <ActivityLogsList />
        </TabsContent>

        <TabsContent value="backup">
          <BackupManager />
        </TabsContent>

        <TabsContent value="settings">
          <SystemSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTools;
