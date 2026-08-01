import { useState, useEffect, useCallback } from "react";

export function useAuthCooldown(actionKey: string, cooldownSeconds: number = 600) { // 600s = 10 minutos
  const storageKey = `storely_cooldown_${actionKey}`;
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    const lastAction = localStorage.getItem(storageKey);
    if (lastAction) {
      const elapsed = Math.floor((Date.now() - parseInt(lastAction, 10)) / 1000);
      if (elapsed < cooldownSeconds) {
        setCooldown(cooldownSeconds - elapsed);
      }
    }
  }, [storageKey, cooldownSeconds]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const triggerCooldown = useCallback(() => {
    localStorage.setItem(storageKey, Date.now().toString());
    setCooldown(cooldownSeconds);
  }, [storageKey, cooldownSeconds]);

  return { cooldown, triggerCooldown };
}