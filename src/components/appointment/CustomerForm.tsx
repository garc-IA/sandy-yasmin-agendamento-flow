
import { useState } from "react";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { Client } from "@/types/appointment.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { formatPhoneNumber, validateEmail, validatePhone } from "@/lib/phoneUtils";
import { useToast } from "@/hooks/use-toast";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface CustomerFormProps {
  client: Client | null;
  updateAppointmentData: (data: { client: Client | null }) => void;
  nextStep: () => void;
  prevStep: () => void;
  salonId?: string;
}

interface ClientForm {
  nome: string;
  telefone: string;
  email: string;
}

const CustomerForm = ({
  client,
  updateAppointmentData,
  nextStep,
  prevStep,
  salonId,
}: CustomerFormProps) => {
  const [isCheckingClient, setIsCheckingClient] = useState(false);
  const { toast } = useToast();

  const form = useForm<ClientForm>({
    defaultValues: {
      nome: client?.nome || "",
      telefone: client?.telefone || "",
      email: client?.email || "",
    },
    mode: "onBlur",
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    field.onChange(formatPhoneNumber(value));
  };

  const handleContinue = async (data: ClientForm) => {
    setIsCheckingClient(true);
    
    try {
      // Obtenha o ID do admin padrão primeiro
      const { data: adminData, error: adminError } = await supabase
        .from("admins")
        .select("id")
        .eq("email", "admin@studio.com")
        .single();
      
      if (adminError || !adminData?.id) {
        console.error("Erro ao buscar admin:", adminError);
        throw new Error("Admin não encontrado");
      }
      
      const adminId = adminData.id;
      
      // Check by phone first since this is causing the primary error
      const formattedPhone = data.telefone;
      const { data: clientsByPhone, error: phoneError } = await supabase
        .from("clientes")
        .select("*")
        .eq("telefone", formattedPhone);
      
      if (phoneError) {
        console.error("Erro ao verificar telefone:", phoneError);
        toast({
          title: "Erro na verificação",
          description: "Ocorreu um erro ao verificar seu telefone. Tente novamente.",
          variant: "destructive",
        });
        throw phoneError;
      }
      
      if (clientsByPhone && clientsByPhone.length > 0) {
        // Ensure the client has all required fields
        const existingClient: Client = {
          id: clientsByPhone[0].id,
          nome: clientsByPhone[0].nome,
          telefone: clientsByPhone[0].telefone,
          email: clientsByPhone[0].email,
          created_at: clientsByPhone[0].created_at || new Date().toISOString(),
          admin_id: clientsByPhone[0].admin_id || adminId
        };
        
        updateAppointmentData({ client: existingClient });
        toast({
          title: "Cliente encontrado",
          description: "Utilizaremos seus dados já cadastrados.",
          duration: 3000,
        });
        nextStep();
        return;
      }
      
      // If not found by phone, check by email
      const { data: clientsByEmail, error: emailError } = await supabase
        .from("clientes")
        .select("*")
        .eq("email", data.email.trim().toLowerCase());
      
      if (emailError) {
        console.error("Erro ao verificar email:", emailError);
        toast({
          title: "Erro na verificação",
          description: "Ocorreu um erro ao verificar seu email. Tente novamente.",
          variant: "destructive",
        });
        throw emailError;
      }
      
      if (clientsByEmail && clientsByEmail.length > 0) {
        // Ensure the client has all required fields
        const existingClient: Client = {
          id: clientsByEmail[0].id,
          nome: clientsByEmail[0].nome,
          telefone: clientsByEmail[0].telefone,
          email: clientsByEmail[0].email,
          created_at: clientsByEmail[0].created_at || new Date().toISOString(),
          admin_id: clientsByEmail[0].admin_id || adminId
        };
        
        updateAppointmentData({ client: existingClient });
        toast({
          title: "Cliente encontrado",
          description: "Utilizaremos seus dados já cadastrados.",
          duration: 3000,
        });
        nextStep();
        return;
      }
      
      // Se não encontrado, criar um objeto cliente temporário com dados necessários
      const newClient: Client = {
        id: "", // Será preenchido no momento da criação no banco
        nome: data.nome.trim(),
        telefone: formattedPhone,
        email: data.email.trim().toLowerCase(),
        created_at: new Date().toISOString(),
        admin_id: adminId
      };
      
      if (salonId) {
        (newClient as any).salao_id = salonId;
      }
      
      updateAppointmentData({ client: newClient });
      toast({
        title: "Dados validados",
        description: "Seus dados foram validados com sucesso.",
      });
      nextStep();
    } catch (error: any) {
      console.error("Erro ao verificar cliente:", error);
      toast({
        title: "Erro ao verificar dados",
        description: "Ocorreu um erro ao verificar seus dados. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCheckingClient(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-playfair font-semibold mb-6">
        Seus dados
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleContinue)} className="space-y-4">
          <FormField
            control={form.control}
            name="nome"
            rules={{ 
              required: "O nome é obrigatório",
              minLength: {
                value: 3,
                message: "O nome deve ter pelo menos 3 caracteres"
              }
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="name">Nome completo</FormLabel>
                <FormControl>
                  <Input
                    id="name"
                    placeholder="Digite seu nome completo"
                    aria-label="Nome completo"
                    aria-required="true"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="telefone"
            rules={{ 
              required: "O telefone é obrigatório",
              validate: value => validatePhone(value) || "Formato de telefone inválido. Use (DDD) XXXXX-XXXX"
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="phone">Telefone com DDD</FormLabel>
                <FormControl>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    aria-label="Telefone com DDD"
                    aria-required="true"
                    value={field.value}
                    onChange={(e) => handlePhoneChange(e, field)}
                    onBlur={field.onBlur}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            rules={{ 
              required: "O e-mail é obrigatório",
              validate: value => validateEmail(value) || "Formato de e-mail inválido"
            }}
            render={({ field }) => (
              <FormItem>
                <FormLabel htmlFor="email">E-mail</FormLabel>
                <FormControl>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    aria-label="E-mail"
                    aria-required="true"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="mt-8 flex justify-between">
            <Button variant="outline" onClick={prevStep} type="button">
              <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
            </Button>
            <Button type="submit" disabled={isCheckingClient}>
              {isCheckingClient ? "Verificando..." : "Continuar"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default CustomerForm;
