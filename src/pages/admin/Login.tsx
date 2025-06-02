
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/auth-context";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      console.log('Tentando fazer login com:', email);
      const { error } = await signIn(email, password);
      
      if (error) {
        console.error('Erro de login:', error);
        toast({
          title: "Erro de autenticação",
          description: "Email ou senha inválidos. Use: admin@studio.com / admin123",
          variant: "destructive"
        });
      } else {
        console.log('Login realizado com sucesso');
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo ao painel administrativo."
        });
        navigate("/admin");
      }
    } catch (error) {
      console.error('Erro no processo de login:', error);
      toast({
        title: "Erro ao fazer login",
        description: "Ocorreu um erro durante o login. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Studio Sandy Yasmin</CardTitle>
          <CardDescription>
            Acesso ao painel administrativo
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@studio.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Senha
              </label>
              <Input
                id="password"
                type="password"
                placeholder="admin123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
              <strong>Credenciais de teste:</strong><br />
              Email: admin@studio.com<br />
              Senha: admin123
            </div>
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                  Entrando...
                </>
              ) : (
                "Entrar"
              )}
            </Button>
          </CardFooter>
        </form>
        <div className="text-center text-sm text-gray-500 pb-4">
          <Link to="/agendar" className="text-primary hover:underline">
            Voltar para a página de agendamentos
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default AdminLogin;
