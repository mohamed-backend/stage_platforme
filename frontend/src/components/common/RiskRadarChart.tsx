import { useMemo } from 'react'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts'

export interface RiskDriverMetric {
  subject: string
  score: number
  fullMark: number
}

interface RiskRadarChartProps {
  data?: RiskDriverMetric[]
  targetAmountScore?: number
  durationScore?: number
  sectorRiskScore?: number
  expectedReturnScore?: number
  ownerExperienceScore?: number
  className?: string
  height?: number
}

export function RiskRadarChart({
  data: customData,
  targetAmountScore = 65,
  durationScore = 50,
  sectorRiskScore = 70,
  expectedReturnScore = 80,
  ownerExperienceScore = 85,
  className = '',
  height = 320,
}: RiskRadarChartProps) {
  const chartData: RiskDriverMetric[] = useMemo(() => {
    if (customData && customData.length > 0) {
      return customData
    }
    return [
      { subject: 'Target Amount', score: targetAmountScore, fullMark: 100 },
      { subject: 'Duration', score: durationScore, fullMark: 100 },
      { subject: 'Sector Risk', score: sectorRiskScore, fullMark: 100 },
      { subject: 'Expected Return', score: expectedReturnScore, fullMark: 100 },
      { subject: 'Owner Experience', score: ownerExperienceScore, fullMark: 100 },
    ]
  }, [
    customData,
    targetAmountScore,
    durationScore,
    sectorRiskScore,
    expectedReturnScore,
    ownerExperienceScore,
  ])

  return (
    <div className={`w-full flex flex-col items-center ${className}`}>
      <div style={{ height: `${height}px`, width: '100%' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData}>
            <PolarGrid stroke="var(--border-subtle, #334155)" opacity={0.6} />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: 'var(--text-primary, #f8fafc)', fontSize: 11, fontWeight: 600 }}
            />
            <PolarRadiusAxis
              angle={30}
              domain={[0, 100]}
              tick={{ fill: 'var(--text-muted, #94a3b8)', fontSize: 9 }}
            />
            <Radar
              name="Risk Driver Score"
              dataKey="score"
              stroke="var(--accent, #ec4899)"
              fill="var(--accent, #ec4899)"
              fillOpacity={0.4}
              strokeWidth={2}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                background: 'var(--surface-elevated, #0f172a)',
                border: '1px solid var(--border-default, #334155)',
                color: 'var(--text-primary, #f8fafc)',
                fontSize: '12px',
                padding: '8px 12px',
              }}
              formatter={(val?: any) => [val != null ? `${val} / 100` : '', 'Score']}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-wrap justify-center gap-3 mt-2 text-xs font-semibold text-[var(--text-secondary)]">
        {chartData.map((driver) => (
          <div key={driver.subject} className="flex items-center gap-1.5 bg-white/5 dark:bg-black/20 border border-[var(--border-subtle)] px-2.5 py-1 rounded-full">
            <span className="h-2 w-2 rounded-full bg-[var(--accent)]" />
            <span>{driver.subject}:</span>
            <span className="font-bold text-[var(--text-primary)]">{driver.score}/100</span>
          </div>
        ))}
      </div>
    </div>
  )
}
