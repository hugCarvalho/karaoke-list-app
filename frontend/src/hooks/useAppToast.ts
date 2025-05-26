// src/hooks/useAppToast.ts
import { useToast, UseToastOptions } from "@chakra-ui/react";

type ToastType = 'success' | 'error' | 'info' | 'warning';

const useAppToast = () => {
  const toast = useToast();

  const showToast = (
    type: ToastType,
    title: string,
    description: string,
    options?: UseToastOptions
  ) => {
    toast({
      title,
      description,
      status: type,
      duration: type === 'error' ? 5000 : (options?.duration || 3000),
      isClosable: true,
      ...options,

    });
  };

  return {
    showSuccessToast: (title: string, description: string, options?: UseToastOptions) =>
      showToast('success', title, description, options),
    showErrorToast: (title: string, description: string, options?: UseToastOptions) =>
      showToast('error', title, description, options),
    showInfoToast: (title: string, description: string, options?: UseToastOptions) =>
      showToast('info', title, description, options),
    showWarningToast: (title: string, description: string, options?: UseToastOptions) =>
      showToast('warning', title, description, options),
  };
};

export default useAppToast;
