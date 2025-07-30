import { useState, memo } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { User } from "lucide-react";

export const WhatsIAStatsPanel = memo(function WhatsIAStatsPanel() {
  const [showDetail, setShowDetail] = useState(false);
  const [hourRate, setHourRate] = useState<{ [agent: string]: number }>({
    "Agente 1": 12,
    "Agente 2": 15,
    "Agente 3": 10,
  });

  const hoursSaved = {
    "Agente 1": 10,
    "Agente 2": 14,
    "Agente 3": 12,
  };

  const totalIAExpense = 72.5;
  const previousMonthExpense = 64.5;

  const agentCost = {
    "Agente 1": 24,
    "Agente 2": 30,
    "Agente 3": 18,
  };

  const COLORS = ["#34d399", "#60a5fa", "#fbbf24"];

  const agentExpense = Object.entries(agentCost).map(([agent, value]) => ({
    agent,
    value,
  }));

  const totalSaved = Object.entries(hoursSaved).reduce(
    (sum, [agent, hours]) => sum + hours * (hourRate[agent] || 0),
    0
  );

  return (
    <section className="bg-white p-6 border rounded shadow-sm space-y-6">
      <h2 className="text-xl font-semibold">WhatsIA: Inteligencia Artificial</h2>
      <p className="text-gray-600">Gasto mensual en IA basado en uso de agentes:</p>
      <div className="text-green-700 font-bold text-2xl">${totalIAExpense.toFixed(2)} USD / mes</div>
      <p className="text-sm text-gray-500">Comparado con el mes anterior: <span className="text-red-500">+{((totalIAExpense - previousMonthExpense) / previousMonthExpense * 100).toFixed(1)}%</span></p>
      <p className="text-sm text-gray-500">Horas ahorradas: <strong>{Object.values(hoursSaved).reduce((a, b) => a + b, 0)}h</strong></p>
      <p className="text-sm text-gray-500">Valor estimado ahorrado: <strong>${totalSaved.toFixed(2)} USD</strong></p>

      <div className="w-full h-64">
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={agentExpense}
              dataKey="value"
              nameKey="agent"
              cx="50%"
              cy="50%"
              outerRadius={80}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {agentExpense.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Object.keys(hoursSaved).map((agent, idx) => {
          const hhCost = hourRate[agent] * hoursSaved[agent];
          const iaCost = agentCost[agent];
          const ahorro = hhCost - iaCost;
          const roi = iaCost > 0 ? (ahorro / iaCost) * 100 : 0;
          return (
            <div key={agent} className="border p-4 rounded flex items-start space-x-4 bg-gray-50">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div className="text-sm text-gray-700">
                <p className="font-medium text-gray-800">{agent}</p>
                <p>Gasto IA: ${iaCost.toFixed(2)}</p>
                <p>Simulado Humano: ${hhCost.toFixed(2)}</p>
                <p>Ahorro: ${ahorro.toFixed(2)}</p>
                <p className="text-green-600 font-semibold">ROI: {roi.toFixed(0)}%</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4">
        <Button variant="outline" onClick={() => setShowDetail(true)}>Configurar ROI</Button>
      </div>

      <Dialog open={showDetail} onOpenChange={setShowDetail}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Configurar ROI por agente</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500 mb-4">
            Ingresa el valor por hora (HH) que le pagarías a una persona por hacer el trabajo realizado por cada agente IA.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(hoursSaved).map(([agent, hours]) => (
              <div key={agent} className="space-y-2">
                <Label>{agent} - {hours}h</Label>
                <Input
                  type="number"
                  value={hourRate[agent] || 0}
                  onChange={(e) => setHourRate({ ...hourRate, [agent]: parseFloat(e.target.value) })}
                  placeholder="Costo HH (USD)"
                />
              </div>
            ))}
          </div>

          <Button onClick={() => setShowDetail(false)}>Cerrar</Button>
        </DialogContent>
      </Dialog>
    </section>
  );
});

WhatsIAStatsPanel.displayName = 'WhatsIAStatsPanel';
