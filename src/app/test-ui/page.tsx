"use client";

import { useState } from "react";
import { ManageSlotModal } from "@/components/matches/manage-slot-modal";
import { Button } from "@/components/ui/button";
import { ToastProvider } from "@/components/toast/toast-provider";
import { useToast } from "@/components/toast/use-toast";
import appSettings from "@/config/app-settings.json";

function TestUIContent() {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  async function handleShare(name: string) {
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(`${appSettings.share.inviteTitle}\nSumate al partido como ${name}\n${appSettings.baseUrl}`);
        showToast("¡Enlace copiado al portapapeles!");
      } catch {
        showToast("No se pudo copiar el enlace.");
      }
    }
  }

  return (
    <div className="p-10 space-y-4">
      <h1 className="text-2xl font-bold">UI Test Page</h1>
      <p>This page is for testing components that are normally behind authentication.</p>

      <Button onClick={() => setOpen(true)}>Open Manage Slot Modal</Button>

      <ManageSlotModal
        open={open}
        slot={null}
        placeholderName="Jugador 2"
        onSave={(name) => {
          console.log("Saved:", name);
          setOpen(false);
        }}
        onShare={handleShare}
        onClose={() => setOpen(false)}
      />
    </div>
  );
}

/**
 * UI Test Page (Public)
 *
 * PROPÓSITO:
 * Esta página permite visualizar y testear componentes que normalmente están protegidos
 * por autenticación (Google Login). Es una herramienta para el desarrollo y verificación
 * visual (screenshots/videos) sin depender de una sesión activa.
 *
 * CÓMO USAR:
 * 1. Importa el componente que deseas testear.
 * 2. Envuélvelo en los proveedores necesarios (ToastProvider, etc.).
 * 3. Define estados mock para simular la interactividad.
 *
 * NOTA: Esta ruta debe ser removida o protegida antes de pasar a producción si
 * expone datos sensibles, aunque actualmente solo usa datos mock.
 */

export default function TestUIPage() {
  return (
    <ToastProvider>
      <TestUIContent />
    </ToastProvider>
  );
}
