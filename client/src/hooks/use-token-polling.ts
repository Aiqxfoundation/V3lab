import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

export function useTokenPolling(enabled: boolean = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      queryClient.invalidateQueries({ queryKey: ["/api/tokens"] });
    }, 5000);

    return () => clearInterval(interval);
  }, [enabled, queryClient]);
}
