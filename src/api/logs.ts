import { NextApiRequest, NextApiResponse } from 'next';

interface LogEntry {
  type: string;
  sessionName: string;
  phoneNumber: string;
  timestamp: string;
  message: string;
}

// En una implementación real, esto se conectaría a una base de datos
const logs: LogEntry[] = [];

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const logEntry: LogEntry = req.body;
      
      // Validar los datos requeridos
      if (!logEntry.type || !logEntry.sessionName || !logEntry.phoneNumber || !logEntry.message) {
        return res.status(400).json({ error: 'Faltan campos requeridos' });
      }

      // Agregar timestamp si no viene en la petición
      if (!logEntry.timestamp) {
        logEntry.timestamp = new Date().toISOString();
      }

      // Agregar el log
      logs.push(logEntry);

      // En una implementación real, aquí se guardaría en la base de datos
      console.log('Nuevo log:', logEntry);

      return res.status(200).json({ success: true, log: logEntry });
    } catch (error) {
      console.error('Error al guardar log:', error);
      return res.status(500).json({ error: 'Error al guardar el log' });
    }
  } else if (req.method === 'GET') {
    try {
      const { sessionName, type, startDate, endDate } = req.query;

      let filteredLogs = [...logs];

      // Filtrar por sesión si se especifica
      if (sessionName) {
        filteredLogs = filteredLogs.filter(log => log.sessionName === sessionName);
      }

      // Filtrar por tipo si se especifica
      if (type) {
        filteredLogs = filteredLogs.filter(log => log.type === type);
      }

      // Filtrar por rango de fechas si se especifica
      if (startDate && endDate) {
        const start = new Date(startDate as string);
        const end = new Date(endDate as string);
        filteredLogs = filteredLogs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= start && logDate <= end;
        });
      }

      return res.status(200).json({ logs: filteredLogs });
    } catch (error) {
      console.error('Error al obtener logs:', error);
      return res.status(500).json({ error: 'Error al obtener los logs' });
    }
  } else {
    return res.status(405).json({ error: 'Método no permitido' });
  }
} 