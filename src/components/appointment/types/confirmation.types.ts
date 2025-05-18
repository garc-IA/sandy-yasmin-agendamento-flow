
import { Service, Client } from "@/lib/supabase";

export interface AppointmentData {
  service: Service;
  date: string;
  time: string;
  client: Client;
  professional_id: string;
  professionalId?: string | null; // Added for compatibility
  professional_name?: string;
}

export interface ConfirmationProps {
  appointmentData: AppointmentData;
  isSubmitting: boolean;
  isComplete: boolean;
  setIsSubmitting: React.Dispatch<React.SetStateAction<boolean>>;
  setIsComplete: React.Dispatch<React.SetStateAction<boolean>>;
  prevStep: () => void;
}
