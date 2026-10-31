import React from 'react';

interface CategoryBreakdownChartProps {
  categories?: Record<string, number>;
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ categories }) => {
  const data = categories || {
    security: 4,
    correctness: 2,
    performance: 1,
    maintainability: 1,
    architecture: 1,
  };

  const total = Object.values(data).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-3 pt-2">
      {Object.entries(data).map(([cat, count]) => {
        const pct = Math.round((count / total) * 100);
        return (
          <div key={cat} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="capitalize font-medium text-zinc-800 dark:text-zinc-200">
                {cat}
              </span>
              <div className="flex items-center gap-2 font-mono text-[11px] text-zinc-400">
                <span>{count}</span>
                <span>({pct}%)</span>
              </div>
            </div>
            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-2 rounded-full overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  cat === 'security'
                    ? 'bg-rose-500'
                    : cat === 'correctness'
                    ? 'bg-amber-500'
                    : cat === 'performance'
                    ? 'bg-indigo-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.max(pct, 5)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};
