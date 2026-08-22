import React, { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

interface TelemetryChartProps {
  telemetryType: string;
  unit: string;
  currentValue: string;
  verifier: string;
  accentColor?: string;
}

export const TelemetryChart: React.FC<TelemetryChartProps> = ({
  telemetryType,
  unit,
  currentValue,
  verifier,
  accentColor = "#00F2FE"
}) => {
  const [data, setData] = useState<{ time: string; value: number }[]>([]);

  useEffect(() => {
    // Generate initial 12 data points
    const baseValue = parseFloat(currentValue.replace(/,/g, '')) || 90;
    const initialData = Array.from({ length: 12 }, (_, i) => {
      const timeStr = `${12 - i}m ago`;
      const variance = (Math.random() - 0.48) * (baseValue * 0.05);
      return {
        time: timeStr,
        value: parseFloat(Math.max(10, baseValue + variance).toFixed(1))
      };
    }).reverse();

    setData(initialData);

    // Live update stream every 3 seconds
    const interval = setInterval(() => {
      setData((prev) => {
        const lastVal = prev[prev.length - 1]?.value || baseValue;
        const nextVal = parseFloat(Math.max(10, lastVal + (Math.random() - 0.48) * (baseValue * 0.04)).toFixed(1));
        const now = new Date();
        const timeStr = `${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`;
        return [...prev.slice(1), { time: timeStr, value: nextVal }];
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [currentValue]);

  return (
    <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-4 font-mono text-xs shadow-sm">
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-neutral-200">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
          <span className="text-neutral-900 font-bold uppercase tracking-wider">{telemetryType}</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[11px] text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-300 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
          <span>Live Oracle Stream</span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-white rounded-xl p-3 border border-neutral-200">
          <div className="text-[10px] text-neutral-500 font-semibold uppercase">Current Reading</div>
          <div className="text-lg font-bold text-neutral-900 mt-0.5">
            {data[data.length - 1]?.value.toLocaleString() || currentValue} <span className="text-xs text-emerald-600 font-normal">{unit}</span>
          </div>
        </div>
        <div className="bg-white rounded-xl p-3 border border-neutral-200">
          <div className="text-[10px] text-neutral-500 font-semibold uppercase">Oracle Verifier</div>
          <div className="text-xs font-semibold text-neutral-800 truncate mt-1 flex items-center space-x-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{verifier}</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-32 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="telemetryGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <XAxis dataKey="time" stroke="#9CA3AF" tick={{ fontSize: 9 }} tickLine={false} />
            <YAxis stroke="#9CA3AF" tick={{ fontSize: 9 }} tickLine={false} domain={['dataMin - 5', 'dataMax + 5']} />
            <Tooltip
              contentStyle={{ backgroundColor: '#FFFFFF', borderColor: '#E5E7EB', borderRadius: '12px', fontSize: '11px', color: '#111827', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}
              labelStyle={{ color: '#6B7280' }}
            />
            <Area type="monotone" dataKey="value" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#telemetryGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
