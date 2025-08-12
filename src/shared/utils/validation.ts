export const validateRequired = (value: any, fieldName: string): string | null => {
    if (!value || (typeof value === 'string' && !value.trim())) {
      return `${fieldName} est requis`;
    }
    return null;
  };
  
  export const validateEmail = (email: string): string | null => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Format d\'email invalide';
    }
    return null;
  };
  
  export const validateNumber = (
    value: number, 
    fieldName: string, 
    min?: number, 
    max?: number
  ): string | null => {
    if (isNaN(value)) {
      return `${fieldName} doit être un nombre`;
    }
    if (min !== undefined && value < min) {
      return `${fieldName} doit être supérieur ou égal à ${min}`;
    }
    if (max !== undefined && value > max) {
      return `${fieldName} doit être inférieur ou égal à ${max}`;
    }
    return null;
  };
  
  export const validateRange = (
    value: number, 
    min: number, 
    max: number, 
    fieldName: string
  ): string | null => {
    if (value < min || value > max) {
      return `${fieldName} doit être entre ${min} et ${max}`;
    }
    return null;
  };