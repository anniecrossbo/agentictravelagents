import { type ReactNode, createContext, useCallback, useContext, useRef, useState } from 'react';

const ToastContext = createContext<(message: string) => void>(() => undefined);

export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  const show = useCallback((text: string) => {
    setMessage(text);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setMessage(null), 3200);
  }, []);

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-28 z-[70] flex justify-center px-4">
        {message && <div className="rounded-pill bg-fg px-5 py-3 text-sm font-medium text-fg-inverse shadow-pop">{message}</div>}
      </div>
    </ToastContext.Provider>
  );
}
