import { useToastContext } from "./toast-provider";

export function useToast() {
  const { showToast } = useToastContext();
  return { showToast };
}
