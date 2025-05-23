
import { useState } from "react";

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'success' | 'warning' | 'error';
  message: string;
  number?: string;
}

export function LogsPanel() {
  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '2024-01-15 14:30:25',
      level: 'success',
      message: 'Mensaje enviado correctamente a +34535636325',
      number: '+34535636325'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:29:18',
      level: 'warning',
      message: 'Límite de mensajes cerca del máximo (90%)',
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:28:45',
      level: 'error',
      message: 'Error al conectar con WhatsApp API',
      number: '+525534394325'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:27:12',
      level: 'success',
      message: 'Webhook configurado correctamente',
    },
    {
      id: '5',
      timestamp: '2024-01-15 14:25:33',
      level: 'success',
      message: 'Número +41498501598 conectado exitosamente',
      number: '+41498501598'
    },
    {
      id: '6',
      timestamp: '2024-01-15 14:23:01',
      level: 'warning',
      message: 'Conexión inestable detectada en +34917944735',
      number: '+34917944735'
    }
  ]);

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800';
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return '✅';
      case 'warning':
        return '⚠️';
      case 'error':
        return '❌';
      default:
        return 'ℹ️';
    }
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Registros del Sistema</h2>
        <p className="text-gray-600">Monitorea la actividad y eventos de tu cuenta.</p>
      </div>

      {/* Filters */}
      <div className="mb-4 flex space-x-4">
        <select className="px-3 py-2 border border-gray-300 rounded-lg text-sm">
          <option>Todos los niveles</option>
          <option>Éxito</option>
          <option>Advertencia</option>
          <option>Error</option>
        </select>
        <input
          type="date"
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
          defaultValue="2024-01-15"
        />
        <input
          type="text"
          placeholder="Filtrar por número..."
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm flex-1"
        />
      </div>

      {/* Logs List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {logs.map((log) => (
          <div
            key={log.id}
            className={`p-4 rounded-lg border ${getLevelColor(log.level)}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <span className="text-lg">{getLevelIcon(log.level)}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{log.message}</p>
                  {log.number && (
                    <p className="text-xs mt-1 opacity-75">Número: {log.number}</p>
                  )}
                </div>
              </div>
              <span className="text-xs opacity-75">{log.timestamp}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Auto-refresh indicator */}
      <div className="mt-4 flex items-center justify-center text-sm text-gray-500">
        <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
        Actualización automática activa
      </div>
    </div>
  );
}
