
import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface SystemMaintenanceMessageProps {
  message: string;
}

export function SystemMaintenanceMessage({ message }: SystemMaintenanceMessageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md border-amber-200 shadow-lg">
        <CardContent className="p-8 text-center space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <AlertTriangle className="h-16 w-16 text-amber-500" />
              <Clock className="h-6 w-6 text-amber-600 absolute -bottom-1 -right-1 bg-white rounded-full p-1" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-amber-800">
              Sistema em Manutenção
            </h1>
            <p className="text-amber-700 leading-relaxed">
              {message}
            </p>
          </div>
          
          <div className="bg-amber-100 rounded-lg p-4 border border-amber-200">
            <p className="text-sm text-amber-800">
              <strong>Em caso de urgência:</strong><br />
              Entre em contato diretamente pelo WhatsApp
            </p>
          </div>
          
          <p className="text-xs text-amber-600">
            Agradecemos a compreensão!
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
