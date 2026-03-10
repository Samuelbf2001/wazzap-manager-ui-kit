import React from 'react';
import { LiveInbox } from '@/components/LiveInbox';
import { PageHeader } from '@/components/PageHeader';

export function LiveInboxPage() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <PageHeader 
        title="Bandeja de Entrada"
        subtitle="Conversaciones en vivo y chat en tiempo real"
      />
      <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="h-full">
          <LiveInbox />
        </div>
      </div>
    </div>
  );
} 