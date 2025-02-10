import { toast } from 'react-hot-toast';

export function useToast() {
  return {
    success: (message) => toast.success(message),
    error: (message) => toast.error(message),
    loading: (message) => toast.loading(message),
    dismiss: toast.dismiss
  };
} 