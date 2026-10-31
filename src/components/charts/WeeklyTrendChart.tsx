import React from 'react';

interface WeeklyTrendChartProps {
  trends?: any[];
}

export const WeeklyTrendChart: React.FC<WeeklyTrendChartProps> = ({ trends }) => {
  const data = trends && trends.length > 0 ? trends : [
    { week: 'W40', critical: 6, high: 14, resolved: 32 },
    { week: 'W41', critical: 4, high: 12, resolved: 28 },
    { week: 'W42', critical: 5, high: 9, resolved: 34 },
    { week: 'W43', critical: 3, high: 7, resolved: 26 },
    { week: 'W44', critical: 2, high: 4, resolved: 18 },
  ];

  const maxVal = Math.max(...data.map((d) => (d.resolved || 0) + (d.critical || 0) + (d.high || 0)), 35);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" />
            <span>Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
            <span>High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
            <span>Resolved</span>
          </div>
        </div>
        <span className="text-[11px] font-mono">Last 5 Weeks</span>
      </div>

      <div className="h-44 flex items-end gap-3 pt-6 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        {data.map((item, i) => {
          const critH = Math.round(((item.critical || 0) / maxVal) * 120);
          const highH = Math.round(((item.high || 0) / maxVal) * 120);
          const resH = Math.round(((item.resolved || 0) / maxVal) * 120);

          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <div className="w-full max-w-[32px] flex items-end justify-center gap-1 h-32">
                <div
                  style={{ height: `${Math.max(critH, 4)}px` }}
                  className="w-2 rounded-t bg-rose-500 hover:opacity-80 transition-all"
                  title={`Critical: ${item.critical}`}
                />
                <div
                  style={{ height: `${Math.max(highH, 4)}px` }}
                  className="w-2 rounded-t bg-amber-500 hover:opacity-80 transition-all"
                  title={`High: ${item.high}`}
                />
                <div
                  style={{ height: `${Math.max(resH, 4)}px` }}
                  className="w-2 rounded-t bg-indigo-500 hover:opacity-80 transition-all"
                  title={`Resolved: ${item.resolved}`}
                />
              </div>
              <span className="text-[11px] font-mono text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                {item.week}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
