
/**
 * Utility functions for data security and privacy
 */

/**
 * Masks a phone number, showing only the last 4 digits
 * @param phone The phone number to mask
 * @returns Masked phone number
 */
export const maskPhone = (phone: string): string => {
  if (!phone) return '';
  
  // Remove non-numeric characters for consistent formatting
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If it's a short number, apply simple masking
  if (digitsOnly.length <= 4) {
    return '*'.repeat(digitsOnly.length);
  }
  
  // Show only last 4 digits for standard phone numbers
  return '*'.repeat(digitsOnly.length - 4) + digitsOnly.slice(-4);
};

/**
 * Masks an email address, showing only first character and domain
 * @param email The email to mask
 * @returns Masked email
 */
export const maskEmail = (email: string): string => {
  if (!email || !email.includes('@')) return '';
  
  const [username, domain] = email.split('@');
  
  // Show only first character of username + *** + domain
  return `${username.charAt(0)}${'*'.repeat(Math.max(2, username.length - 1))}@${domain}`;
};

/**
 * Cleans sensitive data from the browser (localStorage)
 */
export const clearSensitiveData = (): void => {
  // Clear any client data from localStorage
  localStorage.removeItem('clientData');
  localStorage.removeItem('lastViewedClient');
  localStorage.removeItem('appointmentDetails');
  
  // Clear any cached form data
  localStorage.removeItem('appointmentForm');
  localStorage.removeItem('clientForm');
  
  console.log('Sensitive data cleared from browser storage');
};

/**
 * Sanitizes professional data to remove or mask sensitive information
 * @param professional The professional object to sanitize
 * @param isAdminView Whether this is being viewed by an admin with proper permissions
 * @returns Sanitized professional object
 */
export const sanitizeProfessionalData = <T extends { id: string }>(
  professional: T, 
  isAdminView = false
): T => {
  if (!professional) return professional;
  
  // If admin view, return the full data
  if (isAdminView) return professional;
  
  // Create a safe copy with only the allowed fields
  // Use type assertion to handle the generic constraints correctly
  const safeObject = {
    id: professional.id,
    // Type check for each property before adding it
    ...(('nome' in professional) ? { nome: professional.nome } : {}),
    ...(('dias_atendimento' in professional) ? { dias_atendimento: professional.dias_atendimento } : {}),
    ...(('horario_inicio' in professional) ? { horario_inicio: professional.horario_inicio } : {}),
    ...(('horario_fim' in professional) ? { horario_fim: professional.horario_fim } : {})
  } as unknown as T;
  
  return safeObject;
};

/**
 * Sanitizes a list of professional data objects
 * @param professionals Array of professional objects to sanitize
 * @param isAdminView Whether this is being viewed by an admin with proper permissions
 * @returns Array of sanitized professional objects
 */
export const sanitizeProfessionalsData = <T extends { id: string }>(
  professionals: T[], 
  isAdminView = false
): T[] => {
  if (!professionals || !Array.isArray(professionals)) return [];
  
  return professionals.map(professional => sanitizeProfessionalData(professional, isAdminView));
};
