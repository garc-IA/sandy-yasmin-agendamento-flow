
import { 
  Calendar, 
  Users, 
  Scissors, 
  User,
  Settings
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/auth-context";

interface AdminSidebarProps {
  onItemClick?: () => void;
}

const AdminSidebar = ({ onItemClick }: AdminSidebarProps) => {
  const { signOut } = useAuth();
  
  const menuItems = [
    {
      title: "Agendamentos",
      icon: <Calendar size={20} />,
      path: "/admin/agendamentos",
    },
    {
      title: "Clientes",
      icon: <Users size={20} />,
      path: "/admin/clientes",
    },
    {
      title: "Profissionais",
      icon: <Users size={20} />,
      path: "/admin/profissionais",
    },
    {
      title: "Serviços",
      icon: <Scissors size={20} />,
      path: "/admin/servicos",
    },
    {
      title: "Perfil",
      icon: <User size={20} />,
      path: "/admin/perfil",
    },
    {
      title: "Ferramentas",
      icon: <Settings size={20} />,
      path: "/admin/ferramentas",
    },
  ];

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="p-4 border-b">
        <h1 className="text-xl font-bold">Sandy Yasmin</h1>
        <p className="text-sm text-muted-foreground">Painel Admin</p>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) =>
                cn(
                  "flex items-center px-3 py-2 rounded-md text-sm transition-colors",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                )
              }
              end={item.path === "/admin"}
            >
              <span className="mr-2">{item.icon}</span>
              {item.title}
            </NavLink>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar;
