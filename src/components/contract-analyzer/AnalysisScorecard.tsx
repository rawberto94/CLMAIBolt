import React from 'react';
import { BarChart3 } from 'lucide-react';
import { AnalysisResult } from '@/types';

interface GaugeProps {
  score: number;
  label: string;
  colorClass: string;
}

const Gauge = ({ score, label, colorClass }: GaugeProps) => (
    <div className="flex flex-col items-center justify-center gap-1">
        <div className="relative h-20 w-40">
            {/* Background Arc */}
            <svg className="w-full h-full" viewBox="0 0 100 50">
                <path d="M 10 50 A 40 40 0 0 1 90 50" stroke="#e5e7eb" strokeWidth="8" fill="none" />
                {/* Foreground Arc */}
                <path
                    d="M 10 50 A 40 40 0 0 1 90 50"
                    className={colorClass}
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="none"
                    strokeDasharray="125.6"
                    strokeDashoffset={125.6 - (score / 100) * 125.6}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 0.5s ease-in-out' }}
                />
            </svg>
            <div className={`absolute bottom-0 w-full text-center text-3xl font-bold ${colorClass}`} style={{ color: 'currentColor' }}>{score}</div>
        </div>
        <div className="text-sm font-medium text-gray-600">{label}</div>
    </div>
);


export const AnalysisScorecard = ({ score }: { score: AnalysisResult['score'] }) => {
    const getScoreColor = (s: number) => (s >= 80 ? 'text-green-600' : s >= 60 ? 'text-yellow-500' : 'text-red-600');
    // For risk, a lower number is better. Invert the logic.
    const getRiskColor = (s: number) => (s <= 20 ? 'text-green-600' : s <= 40 ? 'text-yellow-500' : 'text-red-600');

    return (
        <div className="p-4 bg-white rounded-lg border">
            <h3 className="text-lg font-medium mb-2 flex items-center gap-2"><BarChart3/> Contract Scorecard</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Gauge score={score.overall} label="Overall" colorClass={getScoreColor(score.overall)} />
                <Gauge score={score.risk} label="Risk Score" colorClass={getRiskColor(score.risk)} />
                <Gauge score={score.compliance} label="Compliance" colorClass={getScoreColor(score.compliance)} />
                <Gauge score={score.clarity} label="Clarity" colorClass={getScoreColor(score.clarity)} />
            </div>
        </div>
    );
};
