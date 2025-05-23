
import { useState } from "react";

interface Connection {
  id: string;
  number: string;
  name: string;
  status: 'connected' | 'disconnected';
  features: {
    bot: boolean;
    webhook: boolean;
    variables: boolean;
    logs: boolean;
  };
}

export function ConnectionsTable() {
  const [connections] = useState<Connection[]>([
    {
      id: '1',
      number: '+34535636325',
      name: 'Nair España',
      status: 'disconnected',
      features: { bot: true, webhook: false, variables: true, logs: true }
    },
    {
      id: '2',
      number: '+525534394325',
      name: 'Tickets',
      status: 'connected',
      features: { bot: true, webhook: true, variables: false, logs: true }
    },
    {
      id: '3',
      number: '+34917944735',
      name: 'Osim - 8min',
      status: 'connected',
      features: { bot: false, webhook: true, variables: true, logs: false }
    },
    {
      id: '4',
      number: '+5219888585',
      name: 'Clínica Dental',
      status: 'connected',
      features: { bot: true, webhook: true, variables: true, logs: true }
    },
    {
      id: '5',
      number: '+41498501598',
      name: 'Inglewood Tech',
      status: 'connected',
      features: { bot: false, webhook: false, variables: true, logs: true }
    }
  ]);

  const getStatusColor = (status: string) => {
    return status === 'connected' ? 'bg-green-500' : 'bg-red-500';
  };

  const getStatusText = (status: string) => {
    return status === 'connected' ? 'Conectado' : 'No conectado';
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Números de WhatsApp Conectados</h2>
        <p className="text-gray-600">Administra tus conexiones de WhatsApp y su estado actual.</p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Número</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Nombre</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Características</th>
              <th className="text-left py-3 px-4 font-medium text-gray-600">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {connections.map((connection) => (
              <tr key={connection.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                <td className="py-4 px-4">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(connection.status)} mr-2`}></div>
                    <span className="text-sm text-gray-600">{getStatusText(connection.status)}</span>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span className="font-medium text-gray-900">{connection.number}</span>
                </td>
                <td className="py-4 px-4">
                  <span className="text-gray-900">{connection.name}</span>
                </td>
                <td className="py-4 px-4">
                  <div className="flex space-x-2">
                    {connection.features.bot && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        🤖 Bot
                      </span>
                    )}
                    {connection.features.webhook && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        🔗 Webhook
                      </span>
                    )}
                    {connection.features.variables && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        🧩 Variables
                      </span>
                    )}
                    {connection.features.logs && (
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        📈 Logs
                      </span>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex space-x-2">
                    <button className="text-blue-600 hover:text-blue-800 text-sm">Editar</button>
                    <button className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {connection.status === 'disconnected' && (
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-yellow-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <span className="text-sm text-yellow-800">
              <strong>Número Sin conectar:</strong> no está conectado actualmente.
            </span>
          </div>
          <button className="mt-2 px-4 py-2 bg-yellow-600 text-white text-sm rounded-lg hover:bg-yellow-700 transition-colors">
            Conectar
          </button>
        </div>
      )}
    </div>
  );
}
