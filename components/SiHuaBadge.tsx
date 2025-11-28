import React from 'react';
import { StarTransformation } from '../types';
import { TYPE_COLORS, TYPE_LABELS, BG_COLORS } from '../constants';

interface Props {
  transformation: StarTransformation;
  minimal?: boolean;
}

const SiHuaBadge: React.FC<Props> = ({ transformation, minimal = false }) => {
  const { starName, type } = transformation;
  const colorClass = TYPE_COLORS[type];
  const bgClass = BG_COLORS[type];
  const label = TYPE_LABELS[type];

  if (minimal) {
    return (
      <div className={`flex items-center justify-between text-xs px-1 py-0.5 rounded border ${bgClass} mb-1`}>
        <span className="text-slate-700 font-medium">{starName}</span>
        <span className={`${colorClass} font-bold ml-1`}>{label}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-between px-3 py-2 rounded-lg border ${bgClass} shadow-sm bg-white`}>
      <span className="text-slate-700 font-serif text-lg">{starName}</span>
      <div className={`flex items-center justify-center w-6 h-6 rounded-full bg-white border border-current ${colorClass}`}>
        <span className="text-xs font-bold">{label}</span>
      </div>
    </div>
  );
};

export default SiHuaBadge;