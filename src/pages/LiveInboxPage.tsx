import React from 'react';
import { LiveInbox } from '@/components/LiveInbox';
import { PageHeader } from '@/components/PageHeader';

export function LiveInboxPage() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <PageHeader 
        title="Bandeja de Entrada"
        subtitle="Conversaciones en vivo y chat en tiempo real"
      />
      <div className="flex-1 overflow-hidden">
        <LiveInbox />
      </div>
    </div>
  );
} 