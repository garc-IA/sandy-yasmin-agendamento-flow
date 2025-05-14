
import { useState } from "react";
import { useAuth } from "@/context/auth-context";

export const useLoading = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isLoggedIn } = useAuth();
  
  // This hook now includes authentication state which can be used
  // for security checks throughout the application
  return { 
    isLoading, 
    setIsLoading,
    // Include authentication state to control access to sensitive operations
    isAuthenticated: isLoggedIn,
    // Helper function to check if user has permission for sensitive operations
    hasPermission: (operation: string) => {
      // In a more complex system, this would check specific permissions
      // For now, we just check if the user is authenticated
      return isLoggedIn;
    }
  };
};
