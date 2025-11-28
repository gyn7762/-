import React, { useState, useMemo, useEffect } from 'react';
import { 
  getPalaceData, 
  PALACE_LAYOUT, 
  PALACE_NAMES, 
  PALACE_ABBREVIATIONS, 
  EARTHLY_BRANCHES, 
  getHeavenlyStem,
  getFiveTigersStems,
  calculateLifePalaceBranch,
  assignStars,
  calculateSmallLimitIndex,
  USER_STEM_SEQUENCE,
  SI_HUA_MAP,
  TYPE_LABELS
} from './constants';
import { PalaceConfig, ChartConfig, ChartMode, BirthData, TransformationType, TaiJiState } from './types';
import { interpretPalace, interpretTaiJi } from './services/geminiService';
import PalaceGridItem from './components/PalaceGridItem';
import CenterPanel from './components/CenterPanel';

const App: React.FC = () => {
  // State to hold the current Sequence of Stems
  const [currentStems, setCurrentStems] = useState<string[]>(USER_STEM_SEQUENCE);
  // Hold birth data for star calculation
  const [currentBirthData, setCurrentBirthData] = useState<BirthData | null>(null);
  
  // Base palaces (Stems & basic info)
  const basePalaces = useMemo(() => getPalaceData(currentStems), [currentStems]);
  
  const [palaces, setPalaces] = useState<PalaceConfig[]>(basePalaces);
  const [selectedPalace, setSelectedPalace] = useState<PalaceConfig | null>(null);
  const [interpretation, setInterpretation] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Tai Ji State
  const [taiJiState, setTaiJiState] = useState<TaiJiState>({
    isActive: false,
    step: 'base',
    basePalaceId: null
  });

  const [config, setConfig] = useState<ChartConfig>({
    life: null,
    decade: null,
    year: null,
    small: null
  });

  // Calculate Flying Si Hua Destinations for the selected palace
  const flyingHighlights = useMemo(() => {
    if (!selectedPalace) return {};

    const map: Record<number, { starName: string, type: TransformationType }> = {};
    const stem = selectedPalace.stem;
    const starNames = SI_HUA_MAP[stem]; // e.g. ['廉貞', '破軍', '武曲', '太陽']
    const types: TransformationType[] = ['Lu', 'Quan', 'Ke', 'Ji'];

    if (!starNames) return {};

    starNames.forEach((starName, index) => {
      const targetPalace = palaces.find(p => 
        p.majorStars.some(s => s.name === starName) || 
        p.minorStars.some(s => s.name === starName)
      );

      if (targetPalace) {
        map[targetPalace.id] = {
          starName: starName,
          type: types[index]
        };
      }
    });

    return map;
  }, [selectedPalace, palaces]);

  // Calculate San Fang Si Zheng (Three Parties and Four Pillars) highlighting
  const relatedPalaces = useMemo(() => {
    if (!selectedPalace) return {};
    const branchIdx = EARTHLY_BRANCHES.indexOf(selectedPalace.branch);
    if (branchIdx === -1) return {};

    // Opposite (6 steps away)
    const oppIdx = (branchIdx + 6) % 12;
    // Trines (4 and 8 steps away)
    const trine1Idx = (branchIdx + 4) % 12;
    const trine2Idx = (branchIdx + 8) % 12;
    
    const oppBranch = EARTHLY_BRANCHES[oppIdx];
    const trine1Branch = EARTHLY_BRANCHES[trine1Idx];
    const trine2Branch = EARTHLY_BRANCHES[trine2Idx];

    const map: Record<number, 'opposite' | 'trine'> = {};
    
    palaces.forEach(p => {
        if (p.branch === oppBranch) map[p.id] = 'opposite';
        else if (p.branch === trine1Branch) map[p.id] = 'trine';
        else if (p.branch === trine2Branch) map[p.id] = 'trine';
    });
    return map;
  }, [selectedPalace, palaces]);

  // Calculate Flying Paths for all palaces to display directly on grid
  const getFlyingPaths = (currentPalace: PalaceConfig, allPalaces: PalaceConfig[]) => {
      const stem = currentPalace.stem;
      const stars = SI_HUA_MAP[stem];
      const types: TransformationType[] = ['Lu', 'Quan', 'Ke', 'Ji'];
      
      return stars.map((star, idx) => {
        const typeKey = types[idx];
        const label = TYPE_LABELS[typeKey];
        const target = allPalaces.find(p => 
           p.majorStars.some(s => s.name === star) || 
           p.minorStars.some(s => s.name === star)
        );
        
        if (!target) return { text: `${star}${label}(未定)`, type: typeKey };
        
        if (target.id === currentPalace.id) {
           // Self Transformation
           return { text: `${star}自化${label}`, type: typeKey, isSelf: true };
        }
        
        const destName = target.name?.replace('宮', '') || target.branch;
        const oppBranchIdx = (EARTHLY_BRANCHES.indexOf(target.branch) + 6) % 12;
        const oppPalace = allPalaces.find(p => p.branch === EARTHLY_BRANCHES[oppBranchIdx]);
        const oppName = oppPalace?.name?.replace('宮', '') || oppPalace?.branch;
        
        return {
           text: `${star}${label}→${destName}→${oppName}`,
           type: typeKey,
           isSelf: false
        };
      });
  };

  // Update palaces when config, stems, or birth data changes
  useEffect(() => {
    const lifeBranchIndex = config.life ? EARTHLY_BRANCHES.indexOf(config.life) : -1;
    const decadeBranchIndex = config.decade ? EARTHLY_BRANCHES.indexOf(config.decade) : -1;
    const yearBranchIndex = config.year ? EARTHLY_BRANCHES.indexOf(config.year) : -1;
    const smallBranchIndex = config.small ? EARTHLY_BRANCHES.indexOf(config.small) : -1;

    let updatedPalaces: PalaceConfig[] = basePalaces.map((palace) => {
      const layout = PALACE_LAYOUT[palace.id];
      const currentBranchIndex = layout.branchIndex;

      // 1. Primary Life Palace Names
      let mainName: string | undefined = undefined;
      if (lifeBranchIndex !== -1) {
        const nameIndex = (lifeBranchIndex - currentBranchIndex + 12) % 12;
        mainName = PALACE_NAMES[nameIndex];
      }

      // 2. Decade Limit
      let decadeLabel: string | null = null;
      if (decadeBranchIndex !== -1) {
        const idx = (decadeBranchIndex - currentBranchIndex + 12) % 12;
        decadeLabel = "大" + PALACE_ABBREVIATIONS[idx];
      }

      // 3. Year Limit
      let yearLabel: string | null = null;
      if (yearBranchIndex !== -1) {
        const idx = (yearBranchIndex - currentBranchIndex + 12) % 12;
        yearLabel = "流" + PALACE_ABBREVIATIONS[idx];
      }

      // 4. Small Limit
      let smallLabel: string | null = null;
      if (smallBranchIndex !== -1) {
        const idx = (smallBranchIndex - currentBranchIndex + 12) % 12;
        smallLabel = "小" + PALACE_ABBREVIATIONS[idx];
      }

      return {
        ...palace,
        name: mainName,
        layerLabels: {
          decade: decadeLabel,
          year: yearLabel,
          small: smallLabel
        }
      };
    });

    // 5. Assign Stars and Decade Ranges if Birth Data and Life Palace are present
    const lifePalaceObj = updatedPalaces.find(p => p.branch === config.life);
    if (currentBirthData && lifePalaceObj) {
      updatedPalaces = assignStars(updatedPalaces, currentBirthData, lifePalaceObj.id);
    }

    setPalaces(updatedPalaces);
  }, [config, basePalaces, currentBirthData]);

  // Sync selectedPalace with updated palaces
  useEffect(() => {
    if (selectedPalace) {
      const updated = palaces.find(p => p.id === selectedPalace.id);
      if (updated && updated !== selectedPalace) {
        setSelectedPalace(updated);
      }
    }
  }, [palaces, selectedPalace]);


  const handlePalaceSelect = async (palace: PalaceConfig) => {
    if (!config.life) return;

    // TAI JI INTERACTION LOGIC
    if (taiJiState.isActive) {
        if (taiJiState.step === 'base') {
            setTaiJiState(prev => ({ ...prev, step: 'target', basePalaceId: palace.id }));
            setSelectedPalace(palace);
            setInterpretation(null);
        } else if (taiJiState.step === 'target') {
            // Selected Target, trigger interpretation
            if (taiJiState.basePalaceId !== null) {
                const basePalace = palaces.find(p => p.id === taiJiState.basePalaceId);
                if (basePalace) {
                   setSelectedPalace(palace); // Highlight Target
                   setLoading(true);
                   const result = await interpretTaiJi(basePalace, palace, palaces);
                   setInterpretation(result);
                   setLoading(false);
                   // Optionally reset or keep state? Let's keep state active so user can re-select target or cancel
                }
            }
        }
        return;
    }

    // Normal Selection
    if (selectedPalace?.id === palace.id) return;
    setSelectedPalace(palace);
    setInterpretation(null);
  };

  const handleStartTaiJi = () => {
    setTaiJiState({
        isActive: true,
        step: 'base',
        basePalaceId: selectedPalace ? selectedPalace.id : null
    });
    setInterpretation(null);
  };

  const handleCancelTaiJi = () => {
    setTaiJiState({
        isActive: false,
        step: 'base',
        basePalaceId: null
    });
    setInterpretation(null);
    setSelectedPalace(null); // Clear selected palace to return to main view
  };

  const handleSetConfig = (mode: ChartMode, branch: string) => {
    let newSmall = config.small;

    // Auto-calculate Small Limit if Year Limit is set
    if (mode === 'year' && currentBirthData) {
       // Find the year within the current Decade that matches this Branch?
       // OR simplified: assume standard age calculation logic.
       // We need an "Age" to calculate Small Limit.
       // Problem: "Flow Year Branch" repeats every 12 years.
       // Solution: Check if we have a Decade set. If so, find the year in that Decade matching the branch.
       
       let targetAge = 0;
       
       if (config.decade) {
           // Find the palace for this decade
           const decadePalace = palaces.find(p => p.branch === config.decade);
           if (decadePalace && decadePalace.decadeRange) {
               // Parse range "2024-2033"
               const [startStr, endStr] = decadePalace.decadeRange.split('-');
               const startYear = parseInt(startStr);
               const endYear = parseInt(endStr);
               
               // Find the year in this range with the matching branch
               for(let y = startYear; y <= endYear; y++) {
                   // Calculate branch for year y
                   // Year 4 = Zi(0)? No, 1984=Zi(0). (Year - 4) % 12 = branch index
                   const branchIdx = (y - 4) % 12; // 0=Zi
                   const yBranch = EARTHLY_BRANCHES[branchIdx >= 0 ? branchIdx : branchIdx + 12];
                   if (yBranch === branch) {
                       // Found the year!
                       targetAge = y - currentBirthData.year + 1; // Nominal Age
                       break;
                   }
               }
           }
       }
       
       // Fallback: Calculate for current calendar year if branch matches, otherwise generic?
       // If no decade is set or matching year found, we can't accurately know the Age.
       // However, for the user experience "Click Flow Year -> Auto Small Limit",
       // we should probably default to the nearest year or current cycle.
       
       if (targetAge > 0) {
           const smallIndex = calculateSmallLimitIndex(
              EARTHLY_BRANCHES[(currentBirthData.year - 4) % 12 >= 0 ? (currentBirthData.year - 4) % 12 : (currentBirthData.year - 4) % 12 + 12],
              currentBirthData.gender,
              targetAge
           );
           const smallBranch = EARTHLY_BRANCHES[smallIndex]; // PALACE_LAYOUT maps visual index, but we need Branch name. 
           // Wait, calculateSmallLimitIndex returns 0-11 index of BRANCH list (Zi=0), NOT grid index.
           // Verify getSmallLimitStartIndex returns branch index. Yes.
           newSmall = EARTHLY_BRANCHES[smallIndex];
       }
    }

    setConfig(prev => ({
      ...prev,
      [mode]: branch,
      small: mode === 'year' ? newSmall : prev.small
    }));
  };

  const handleResetLifePalace = () => {
    setConfig({ life: null, decade: null, year: null, small: null });
    setSelectedPalace(null);
    setInterpretation(null);
    setCurrentStems(USER_STEM_SEQUENCE);
    setCurrentBirthData(null);
    handleCancelTaiJi(); // Reset Tai Ji mode if active
  };

  const handleResetLimits = () => {
    setConfig(prev => ({
      ...prev,
      decade: null,
      year: null,
      small: null
    }));
    // Deselect the active palace to clear the view
    setSelectedPalace(null);
    setInterpretation(null);
    handleCancelTaiJi();
  };

  const handleInterpret = async () => {
    if (!selectedPalace) return;
    setLoading(true);
    const result = await interpretPalace(selectedPalace, palaces);
    setInterpretation(result);
    setLoading(false);
  };

  const handleGenerateChart = (data: BirthData) => {
    const yearStem = getHeavenlyStem(data.year);
    const newStems = getFiveTigersStems(yearStem);
    setCurrentStems(newStems);

    const lifeBranch = calculateLifePalaceBranch(data.month, data.hourBranch);

    setCurrentBirthData(data);

    setConfig(prev => ({
      ...prev,
      life: lifeBranch,
      decade: null,
      year: null,
      small: null
    }));
    
    setSelectedPalace(null);
    setInterpretation(null);
    handleCancelTaiJi();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 font-serif">
      <header className="mb-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-700 via-yellow-600 to-yellow-700 mb-2 tracking-widest drop-shadow-sm">
          紫微天干四化
        </h1>
        <p className="text-slate-500 text-sm">
          {config.life ? "點擊宮位查看詳細解析與飛星軌跡" : "請輸入生辰或手動設定命宮"}
        </p>
      </header>

      <div className="w-full max-w-4xl aspect-square max-h-[800px]">
        {/* Main Grid Container: Light Gray background for grid lines */}
        <div className="grid grid-cols-4 grid-rows-4 gap-1 w-full h-full bg-slate-200 p-1 rounded-xl shadow-2xl border border-slate-300">
          <CenterPanel 
            selectedPalace={selectedPalace}
            allPalaces={palaces} 
            interpretation={interpretation}
            loading={loading}
            onInterpret={handleInterpret}
            config={config}
            onSetConfig={handleSetConfig}
            onResetLifePalace={handleResetLifePalace}
            onResetLimits={handleResetLimits}
            onGenerateChart={handleGenerateChart}
            onStartTaiJi={handleStartTaiJi}
            onCancelTaiJi={handleCancelTaiJi}
            taiJiState={taiJiState}
          />
          {palaces.map((palace) => (
            <PalaceGridItem 
              key={palace.id} 
              palace={palace} 
              isSelected={selectedPalace?.id === palace.id}
              isTaiJiBase={taiJiState.isActive && taiJiState.basePalaceId === palace.id}
              relationship={relatedPalaces[palace.id]}
              flyingStarData={flyingHighlights[palace.id]} 
              flyingPaths={getFlyingPaths(palace, palaces)}
              onSelect={handlePalaceSelect}
              config={config}
            />
          ))}
        </div>
      </div>

      <footer className="mt-8 text-slate-500 text-xs flex flex-col items-center gap-2">
        <div className="flex gap-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-600"></span> 天干</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-700"></span> 地支</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> 化祿</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> 化權</span>
        </div>
        <p className="opacity-50">© 2024 AI 紫微斗數排盤</p>
      </footer>
    </div>
  );
};

export default App;