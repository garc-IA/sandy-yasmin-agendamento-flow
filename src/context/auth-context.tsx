
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from "@/hooks/use-toast";
import { clearSensitiveData } from '@/lib/securityUtils';

// Simplified User type for single-tenant admin
interface User {
  email: string;
}

interface AuthContextProps {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => void;
  signUp: (email: string, password: string, userData?: any) => Promise<{ error: string | null, user: User | null }>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Fixed credentials for Studio Sandy Yasmin
  const VALID_EMAIL = 'admin@studio.com';
  const VALID_PASSWORD = 'admin123';

  // Initialize authentication state from localStorage
  useEffect(() => {
    try {
      console.log('Verificando sessão salva...');
      const savedUser = localStorage.getItem('user');
      
      if (savedUser) {
        const parsedUser = JSON.parse(savedUser);
        console.log('Sessão encontrada:', parsedUser.email);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } else {
        console.log('Nenhuma sessão encontrada');
        // Redirect to login if current path requires authentication
        const currentPath = window.location.pathname;
        if (currentPath.startsWith('/admin') && currentPath !== '/admin/login') {
          console.log('Redirecionando para login - rota protegida acessada sem autenticação');
          navigate('/admin/login');
        }
      }
    } catch (error) {
      console.error('Erro ao verificar sessão salva:', error);
      // If there's an error parsing the saved user, clear it
      localStorage.removeItem('user');
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      console.log('Tentativa de login:', email);
      setIsLoading(true);
      
      // Validate credentials
      if (email === VALID_EMAIL && password === VALID_PASSWORD) {
        const userData: User = { email };
        
        setUser(userData);
        setIsLoggedIn(true);
        localStorage.setItem('user', JSON.stringify(userData));
        
        console.log('Login bem-sucedido:', email);
        
        return { error: null };
      }
      
      console.error('Credenciais inválidas');
      return { error: 'Credenciais inválidas' };
    } catch (error) {
      console.error('Erro no login:', error);
      return { error: 'Erro no sistema' };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = () => {
    console.log('Fazendo logout do usuário');
    // Clean up sensitive data before logging out
    clearSensitiveData();
    setUser(null);
    setIsLoggedIn(false);
    localStorage.removeItem('user');
    navigate('/admin/login');
    
    toast({
      title: "Logout realizado com sucesso",
      description: "Você saiu do painel administrativo com segurança",
    });
  };

  // Added signUp function to satisfy the Register.tsx requirements
  // For a single-tenant app, this function will always return an error
  const signUp = async (email: string, password: string, userData?: any) => {
    console.log('Tentativa de registro bloqueada');
    toast({
      title: "Registro não permitido",
      description: "Este é um aplicativo exclusivo para o Studio Sandy Yasmin.",
      variant: "destructive",
    });
    
    return { 
      error: "Registro não permitido. Este é um aplicativo exclusivo para o Studio Sandy Yasmin.", 
      user: null 
    };
  };

  const value: AuthContextProps = {
    user,
    isLoggedIn,
    isLoading,
    signIn,
    signOut,
    signUp,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
