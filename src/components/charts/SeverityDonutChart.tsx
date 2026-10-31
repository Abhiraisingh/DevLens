import React from 'react';

export interface SeverityDonutChartProps {
  data?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  breakdown?: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    informational: number;
  };
  onSelectSeverity?: (sev: string) => void;
}

export const SeverityDonutChart: React.FC<SeverityDonutChartProps> = ({ data, breakdown }) => {
  const chartData = data || breakdown || { critical: 0, high: 0, medium: 0, low: 0, informational: 0 };
  const total = chartData.critical + chartData.high + chartData.medium + chartData.low + chartData.informational;

  const segments = [
    { label: 'Critical', value: chartData.critical, color: '#f85149' },
    { label: 'High', value: chartData.high, color: '#f0883e' },
    { label: 'Medium', value: chartData.medium, color: '#d29922' },
    { label: 'Low', value: chartData.low, color: '#58a6ff' },
    { label: 'Info', value: chartData.informational, color: '#8b949e' },
  ];

  let cumulativeAngle = 0;
  const radius = 64;
  const strokeWidth = 18;
  const circumference = 2 * Math.PI * radius;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6 justify-center">
      {/* SVG Donut */}
      <div className="relative w-44 h-44 shrink-0 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="transparent"
            stroke="#21262d"
            strokeWidth={strokeWidth}
          />
          {total > 0 &&
            segments.map((seg, i) => {
              const strokeDasharray = `${(seg.value / total) * circumference} ${circumference}`;
              const strokeDashoffset = -cumulativeAngle;
              cumulativeAngle += (seg.value / total) * circumference;

              return (
                <circle
                  key={i}
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  className="transition-all duration-500 ease-out hover:opacity-80"
                />
              );
            })}
        </svg>

        <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none">
          <span className="text-2xl font-black text-white font-mono">{total}</span>
          <span className="text-[10px] uppercase font-semibold text-gray-400 tracking-wider">
            Findings
          </span>
        </div>
      </div>

      {/* Legend */}
      <div className="space-y-1.5 min-w-[140px] text-xs">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-gray-300 font-medium">{seg.label}</span>
            </div>
            <div className="flex items-center gap-1.5 font-mono">
              <span className="text-white font-bold">{seg.value}</span>
              <span className="text-gray-500 text-[10px]">
                ({total ? Math.round((seg.value / total) * 100) : 0}%)
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
