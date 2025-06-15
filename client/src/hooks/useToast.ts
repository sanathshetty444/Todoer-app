import { toast as reactToastify } from "react-toastify";

interface ToastOptions {
    position?:
        | "top-right"
        | "top-left"
        | "top-center"
        | "bottom-right"
        | "bottom-left"
        | "bottom-center";
    autoClose?: number;
    hideProgressBar?: boolean;
    closeOnClick?: boolean;
    pauseOnHover?: boolean;
    draggable?: boolean;
}

interface UseToastReturn {
    toast: {
        success: (message: string, options?: ToastOptions) => void;
        error: (message: string, options?: ToastOptions) => void;
        warning: (message: string, options?: ToastOptions) => void;
        info: (message: string, options?: ToastOptions) => void;
    };
}

export const useToast = (): UseToastReturn => {
    const defaultOptions: ToastOptions = {
        position: "bottom-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
    };

    const toast = {
        success: (message: string, options?: ToastOptions) => {
            reactToastify.success(message, { ...defaultOptions, ...options });
        },
        error: (message: string, options?: ToastOptions) => {
            reactToastify.error(message, {
                ...defaultOptions,
                autoClose: 5000,
                ...options,
            });
        },
        warning: (message: string, options?: ToastOptions) => {
            reactToastify.warning(message, { ...defaultOptions, ...options });
        },
        info: (message: string, options?: ToastOptions) => {
            reactToastify.info(message, { ...defaultOptions, ...options });
        },
    };

    return { toast };
};

export default useToast;
