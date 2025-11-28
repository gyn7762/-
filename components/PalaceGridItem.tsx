
import React from 'react';
import { PalaceConfig, ChartConfig, Star, TransformationType } from '../types';
import { TYPE_LABELS, TYPE_COLORS } from '../constants';

interface Props {
  palace: PalaceConfig;
  isSelected: boolean;
  isTaiJiBase?: boolean;
  relationship?: 'opposite' | 'trine';
  onSelect: (palace: PalaceConfig) => void;
  config: ChartConfig;
  flyingStarData?: { starName: string, type: TransformationType };
  flyingPaths?: { text: string, type: TransformationType, isSelf?: boolean }[];
}

const PalaceGridItem: React.FC<Props> = ({ palace, isSelected, isTaiJiBase, relationship, onSelect, config, flyingStarData, flyingPaths }) => {
  
  const renderStar = (star: Star, isMajor: boolean) => {
    // Check if this star is the flying target from the selected palace
    const isFlyingTarget = flyingStarData && flyingStarData.starName === star.name;
    const flyingType = isFlyingTarget ? flyingStarData.type : null;

    // Define styles based on normal state or flying state
    let starTextClass = "";
    let containerClass = "mb-3 px-0.5 rounded transition-all duration-300";

    if (flyingType) {
        // Highlighting for Flying Star (Background Block)
        switch(flyingType) {
            case 'Lu':
                containerClass += " bg-green-100 shadow-sm ring-1 ring-green-200";
                starTextClass = "text-green-700 font-bold text-lg tracking-widest font-serif";
                break;
            case 'Quan':
                containerClass += " bg-blue-100 shadow-sm ring-1 ring-blue-200";
                starTextClass = "text-blue-700 font-bold text-lg tracking-widest font-serif";
                break;
            case 'Ke':
                containerClass += " bg-purple-100 shadow-sm ring-1 ring-purple-200";
                starTextClass = "text-purple-700 font-bold text-lg tracking-widest font-serif";
                break;
            case 'Ji':
                containerClass += " bg-red-100 shadow-sm ring-1 ring-red-200";
                starTextClass = "text-red-700 font-bold text-lg tracking-widest font-serif";
                break;
        }
    } else {
        // Default Styles
        starTextClass = isMajor 
          ? "text-red-700 font-bold text-lg tracking-widest drop-shadow-sm font-serif" 
          : "text-slate-600 text-xs font-medium font-serif";
        
        if (star.type === 'bad') {
            starTextClass = "text-slate-500 text-xs font-medium font-serif";
        }
    }

    return (
      <div key={star.name} className={`flex flex-col items-center gap-0.5 ${containerClass}`}>
        <span className={`${starTextClass} vertical-writing`}>
          {star.name}
        </span>
        {/* Existing Birth Si Hua Badge */}
        {star.transformation && (
          <span className={`
            text-[10px] font-bold px-1 py-0.5 rounded border shadow-sm backdrop-blur-sm bg-white/80 font-serif
            ${TYPE_COLORS[star.transformation]} border-current leading-none mt-1
          `}>
             {TYPE_LABELS[star.transformation]}
          </span>
        )}
      </div>
    );
  };

  let containerStyles = "bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 hover:shadow-sm"; // Default
  
  if (isSelected) {
     containerStyles = "bg-amber-50 border-2 border-yellow-500 shadow-md z-20 scale-[1.01]";
  } else if (isTaiJiBase) {
     // Highlight Tai Ji Base (The "Body" Reference)
     containerStyles = "bg-red-50 border-2 border-dashed border-red-400 shadow-md z-20";
  } else if (relationship) {
     // Highlight San Fang Si Zheng (Three Parties and Four Pillars)
     if (relationship === 'opposite') {
        // Opposite Palace (Dui Gong)
        containerStyles = "bg-orange-50/40 border-2 border-dashed border-orange-300 z-10 shadow-sm";
     } else {
        // Trine Palace (San He)
        containerStyles = "bg-yellow-50/40 border-2 border-dashed border-yellow-300 z-10";
     }
  }

  return (
    <div
      onClick={() => onSelect(palace)}
      className={`
        ${palace.gridPosition}
        relative p-1 transition-all duration-300 cursor-pointer group overflow-hidden
        flex flex-col
        ${containerStyles}
      `}
    >
      {/* Top Left: Palace Name & Layer Labels */}
      <div className="absolute top-2 left-2 z-20 pointer-events-none flex flex-col items-start gap-1">
        <div className={`
          font-serif font-bold text-base vertical-writing tracking-widest
          ${isSelected ? 'text-yellow-800' : (isTaiJiBase ? 'text-red-700' : (relationship ? 'text-slate-800' : 'text-slate-700 group-hover:text-slate-900'))}
        `}>
          {palace.name || ''}
        </div>
        
        {/* Tai Ji Label */}
        {isTaiJiBase && (
            <span className="text-[10px] font-bold text-white bg-red-500 px-1 py-0.5 rounded shadow-sm font-serif animate-pulse">
                太極點
            </span>
        )}

        {/* Layer Labels - Horizontal Layout to save vertical space */}
        <div className="flex flex-row flex-wrap gap-1 mt-1 items-start max-w-[120px]">
          {palace.layerLabels.decade && (
            <span className={`
              font-bold px-1 py-0.5 rounded border shadow-sm whitespace-nowrap transition-all font-serif
              ${palace.layerLabels.decade === '大命' 
                ? 'text-xs text-red-600 bg-blue-100 border-blue-300 ring-1 ring-red-100 scale-105 origin-left z-10' 
                : 'text-[10px] text-blue-800 bg-blue-100 border-blue-200'}
            `}>
              {palace.layerLabels.decade}
            </span>
          )}
          {palace.layerLabels.year && (
            <span className={`
              font-bold px-1 py-0.5 rounded border shadow-sm whitespace-nowrap transition-all font-serif
              ${palace.layerLabels.year === '流命' 
                ? 'text-xs text-red-600 bg-orange-100 border-orange-300 ring-1 ring-red-100 scale-105 origin-left z-10' 
                : 'text-[10px] text-orange-800 bg-orange-100 border-orange-200'}
            `}>
              {palace.layerLabels.year}
            </span>
          )}
          {palace.layerLabels.small && (
            <span className={`
              font-bold px-1 py-0.5 rounded border shadow-sm whitespace-nowrap transition-all font-serif
              ${palace.layerLabels.small === '小命' 
                ? 'text-xs text-red-600 bg-emerald-100 border-emerald-300 ring-1 ring-red-100 scale-105 origin-left z-10' 
                : 'text-[10px] text-emerald-800 bg-emerald-100 border-emerald-200'}
            `}>
              {palace.layerLabels.small}
            </span>
          )}
        </div>
      </div>

      {/* Top Right: Stars (Major & Minor) */}
      <div className="absolute top-2 right-2 bottom-12 flex flex-row-reverse items-start gap-3 pointer-events-none z-10">
         
         {/* Major Stars Column (Rightmost) */}
         {palace.majorStars.length > 0 && (
            <div className="flex flex-col items-center">
              {palace.majorStars.map(star => renderStar(star, true))}
            </div>
         )}

         {/* Minor Stars Column (Left of Major) */}
         {palace.minorStars.length > 0 && (
            <div className="flex flex-col items-center pt-1">
              {palace.minorStars.map(star => renderStar(star, false))}
            </div>
         )}
      </div>

      {/* Bottom Left: Flying Star Paths */}
      <div className="absolute bottom-1 left-1 flex flex-col items-start z-10 opacity-90 group-hover:opacity-100 transition-opacity">
        {flyingPaths && flyingPaths.map((path, idx) => (
          <div key={idx} className={`text-[11px] leading-snug font-serif whitespace-nowrap font-medium ${TYPE_COLORS[path.type]}`}>
            {path.text}
          </div>
        ))}
      </div>

      {/* Bottom Right: Stem, Branch, and Decade Range */}
      <div className="absolute bottom-1 right-2 flex flex-col items-center select-none pointer-events-none">
        
        {/* Decade Range (New) - Explicitly Font Serif */}
        {palace.decadeRange && (
           <span className="text-[10px] font-bold text-blue-600/70 mb-1 font-serif">
              {palace.decadeRange}
           </span>
        )}

        <span className={`
          font-serif font-bold text-lg leading-none mb-0.5
          ${isSelected ? 'text-red-600' : 'text-red-500 group-hover:text-red-600'}
        `}>
          {palace.stem}
        </span>
        <span className={`
          font-serif font-bold text-2xl leading-none transition-colors
          ${isSelected ? 'text-slate-800' : 'text-slate-600 group-hover:text-slate-800'}
        `}>
          {palace.branch}
        </span>
      </div>
      
      {isSelected && (
        <div className="absolute inset-0 rounded border-2 border-yellow-500 pointer-events-none"></div>
      )}
    </div>
  );
};

export default PalaceGridItem;
