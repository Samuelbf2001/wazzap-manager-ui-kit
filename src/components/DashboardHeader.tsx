
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onConnectClick: () => void;
}

export function DashboardHeader({ onConnectClick }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Sub-Cuenta WhatsFull</h1>
        <p className="text-gray-600 mt-1">Administra tus conexiones de WhatsApp</p>
      </div>
    </header>
  );
}
