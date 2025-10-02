"use client";

import * as React from "react";
import { Toast, ToastClose, ToastDescription, ToastTitle, ToastViewport, ToastProvider } from "./toast";

export type ToastItem = {
  id: string;
  title?: string;
  description?: string;
  action?: React.ReactNode;
  duration?: number;
  variant?: "default" | "destructive";
};

const ToastContext = React.createContext<{
  toasts: ToastItem[];
  push: (toast: Omit<ToastItem, "id">) => void;
  dismiss: (id: string) => void;
} | null>(null);

export function ToastProviderScoped({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  const push = React.useCallback((toast: Omit<ToastItem, "id">) => {
    setToasts((current) => [...current, { ...toast, id: crypto.randomUUID() }]);
  }, []);

  const dismiss = React.useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, push, dismiss }}>
      <ToastProvider>
        {children}
        <ToastViewport />
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            open
            onOpenChange={(open) => !open && dismiss(toast.id)}
            duration={toast.duration ?? 4000}
            variant={toast.variant}
          >
            <div className="flex flex-1 flex-col gap-1">
              {toast.title ? <ToastTitle>{toast.title}</ToastTitle> : null}
              {toast.description ? <ToastDescription>{toast.description}</ToastDescription> : null}
            </div>
            {toast.action}
            <ToastClose />
          </Toast>
        ))}
      </ToastProvider>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProviderScoped");
  }
  return context;
}
