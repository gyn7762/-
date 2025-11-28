import React, { useState, useEffect } from 'react';
// @ts-ignore
import { Solar } from 'lunar-javascript';
import { PalaceConfig, ChartConfig, ChartMode, BirthData, Gender, TaiJiState } from '../types';
import { EARTHLY_BRANCHES } from '../constants';
import { Sparkles, Loader2, RefreshCcw, Calendar, ChevronRight, ArrowRight, Clock, Layers, ChevronDown, ChevronUp, Maximize2, X, Eraser, Compass } from 'lucide-react';

interface Props {
  selectedPalace: PalaceConfig | null;
  allPalaces: PalaceConfig[];
  interpretation: string | null;
  loading: boolean;
  onInterpret: () => void;
  config: ChartConfig;
  onSetConfig: (mode: ChartMode, branch: string) => void;
  onResetLifePalace: () => void;
  onResetLimits: () => void;
  onGenerateChart: (data: BirthData) => void;
  onStartTaiJi: () => void;
  onCancelTaiJi: () => void;
  taiJiState: TaiJiState;
}

type ViewMode = 'birth' | 'info' | 'limits';

const CenterPanel: React.FC<Props> = ({ 
  selectedPalace,
  allPalaces, 
  interpretation, 
  loading, 
  onInterpret,
  config,
  onSetConfig,
  onResetLifePalace,
  onResetLimits,
  onGenerateChart,
  onStartTaiJi,
  onCancelTaiJi,
  taiJiState
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('birth');
  const [isStackingExpanded, setIsStackingExpanded] = useState(false);
  const [isInterpretationExpanded, setIsInterpretationExpanded] = useState(false);
  
  const [activeLimitType, setActiveLimitType] = useState<ChartMode>('decade');

  // Calendar Type State
  const [calendarType, setCalendarType] = useState<'lunar' | 'solar'>('lunar');

  const [birthYear, setBirthYear] = useState<string>('2024');
  const [birthMonth, setBirthMonth] = useState<string>('1');
  const [birthDay, setBirthDay] = useState<string>('1');
  const [birthHour, setBirthHour] = useState<string>('子'); // For Lunar
  const [birthHourSolar, setBirthHourSolar] = useState<string>('12'); // For Solar (0-23)
  const [gender, setGender] = useState<Gender>('M');

  useEffect(() => {
    if (config.life) {
      setViewMode('info');
    }
  }, [config.life]);

  const handleBirthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let year = parseInt(birthYear);
    let month = parseInt(birthMonth);
    let day = parseInt(birthDay);
    let hourBranch = birthHour;
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return;

    if (calendarType === 'solar') {
      try {
        // Convert Solar to Lunar
        const solar = Solar.fromYmd(year, month, day);
        const lunar = solar.getLunar();
        
        year = lunar.getYear();
        month = lunar.getMonth();
        day = lunar.getDay();
        
        // Convert Solar Hour (0-23) to Earthly Branch
        const solarHourInt = parseInt(birthHourSolar);
        const branchIndex = Math.floor((solarHourInt + 1) / 2) % 12;
        hourBranch = EARTHLY_BRANCHES[branchIndex];

      } catch (error) {
        alert("日期格式錯誤，請檢查輸入");
        return;
      }
    }

    onGenerateChart({
      year,
      month,
      day,
      hourBranch: hourBranch,
      gender
    });
  };

  const renderStackingInfo = () => {
    if (!selectedPalace) return null;
    
    const layers = [];
    if (selectedPalace.name) layers.push(`本命${selectedPalace.name}`);
    if (selectedPalace.layerLabels.decade) layers.push(selectedPalace.layerLabels.decade.replace('大', '大限'));
    if (selectedPalace.layerLabels.year) layers.push(selectedPalace.layerLabels.year.replace('流', '流年'));
    if (selectedPalace.layerLabels.small) layers.push(selectedPalace.layerLabels.small.replace('小', '小限'));
    
    if (layers.length === 0) {
       return <div className="text-slate-400 text-xs italic mb-4 text-center font-serif">無疊宮資訊</div>;
    }

    const hasMultipleLayers = layers.length > 1;
    const hasLimits = config.decade || config.year || config.small;

    return (
       <div className={`bg-indigo-50 border border-indigo-100 rounded-lg mb-4 shadow-sm transition-all duration-300 ${isStackingExpanded ? 'p-0' : 'p-0 hover:bg-indigo-100'}`}>
          <div className="flex items-center justify-between p-2.5">
            <button 
                onClick={() => hasMultipleLayers && setIsStackingExpanded(!isStackingExpanded)}
                disabled={!hasMultipleLayers}
                className="flex items-center gap-2 outline-none text-left flex-1"
            >
                <div className="flex items-center gap-2 text-xs text-indigo-800 font-bold uppercase tracking-wider font-serif">
                <Layers className="w-3 h-3" />
                疊宮資訊
                {!isStackingExpanded && hasMultipleLayers && (
                    <div className="flex items-center gap-2 ml-2">
                        <span className="px-2 py-0.5 bg-white rounded border border-indigo-200 text-indigo-700 text-xs font-serif shadow-sm">
                            {layers[0]}
                        </span>
                        <span className="text-white text-[10px] font-bold bg-indigo-500 px-1.5 py-0.5 rounded-full font-serif">
                        +{layers.length - 1}
                        </span>
                    </div>
                )}
                {!hasMultipleLayers && (
                    <span className="px-2 py-0.5 bg-white rounded border border-indigo-200 text-indigo-700 text-xs font-serif shadow-sm ml-2">
                        {layers[0]}
                    </span>
                )}
                </div>
            </button>

            <div className="flex items-center gap-2">
                {hasLimits && (
                    <button 
                        onClick={(e) => {
                            e.stopPropagation();
                            onResetLimits();
                        }}
                        className="p-1 rounded bg-white border border-indigo-200 text-indigo-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-colors"
                        title="清空選取 (保留本命)"
                    >
                        <Eraser className="w-3.5 h-3.5" />
                    </button>
                )}
                
                {hasMultipleLayers && (
                <button
                    onClick={() => setIsStackingExpanded(!isStackingExpanded)}
                    className="text-indigo-400 hover:text-indigo-600"
                >
                    {isStackingExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
                )}
            </div>
          </div>

          {(isStackingExpanded || (!hasMultipleLayers && false)) && ( 
            <div className="px-2.5 pb-2.5 pt-0 animate-in slide-in-from-top-1 duration-200 border-t border-indigo-100/50 mt-1">
                <div className="text-sm font-serif text-indigo-900 flex flex-wrap items-center gap-2 pt-2">
                  {layers.map((layer, idx) => (
                      <React.Fragment key={idx}>
                        {idx > 0 && <ArrowRight className="w-3 h-3 text-indigo-400" />}
                        <span className="px-2 py-0.5 bg-white rounded border border-indigo-200 shadow-sm whitespace-nowrap">
                            {layer}
                        </span>
                      </React.Fragment>
                  ))}
                </div>
            </div>
          )}
       </div>
    );
  };

  const renderLimitSettings = () => {
    return (
      <div className="flex-1 flex flex-col h-full animate-in fade-in duration-300">
        <div className="text-center mb-4">
          <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center mb-2 text-blue-600">
            <Clock className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 font-serif">運限設定</h3>
          <p className="text-xs text-slate-500 font-serif">
             {activeLimitType === 'decade' ? '選擇大限年份區間' : '選擇流年地支 (自動計算小限)'}
          </p>
        </div>

        <div className="flex p-1 bg-slate-100 rounded-lg mb-4 border border-slate-200">
          {(['decade', 'year'] as ChartMode[]).map((mode) => {
            const labelMap: Record<string, string> = { decade: '大限', year: '流年' };
            const isActive = activeLimitType === mode;
            return (
              <button
                key={mode}
                onClick={() => setActiveLimitType(mode)}
                className={`flex-1 py-1.5 text-xs font-bold font-serif rounded transition-all ${
                  isActive 
                    ? 'bg-white text-blue-600 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {labelMap[mode]}
              </button>
            );
          })}
        </div>

        <div className="text-center mb-2 text-sm text-slate-600 font-serif">
          設定 <span className="text-blue-600 font-bold">{
            activeLimitType === 'decade' ? '大限命宮' : '流年命宮'
          }</span> 於：
          <span className="ml-2 font-bold text-yellow-600 text-lg font-serif">
             {activeLimitType === 'decade' 
                ? (allPalaces.find(p => p.branch === config.decade)?.decadeRange || '未設定')
                : (config.year || '未設定')}
          </span>
          {activeLimitType === 'year' && config.small && (
             <div className="text-xs text-slate-500 mt-1 font-serif">
                 (小限自動設於: <span className="text-emerald-600 font-bold">{config.small}</span>)
             </div>
          )}
        </div>

        {/* Dynamic Grid based on Limit Type */}
        <div className={`
             grid gap-2 flex-1 overflow-y-auto content-start p-1 custom-scrollbar
             ${activeLimitType === 'decade' ? 'grid-cols-2' : 'grid-cols-6'}
        `}>
          {activeLimitType === 'decade' ? (
            // Decade: Render by Palaces (for date ranges)
            allPalaces.map((palace) => {
                const label = palace.decadeRange || palace.branch;
                const value = palace.branch;
                const isSelected = config.decade === value;
                return (
                  <button
                    key={palace.id}
                    onClick={() => onSetConfig('decade', value)}
                    className={`
                      rounded border font-serif font-bold transition-all flex items-center justify-center py-3 text-sm
                      ${isSelected 
                        ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-md' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300'}
                    `}
                  >
                    {label}
                  </button>
                );
            })
          ) : (
             // Year: Render standard Earthly Branches (Zi to Hai)
             EARTHLY_BRANCHES.map((branch) => {
                const isSelected = config.year === branch;
                return (
                  <button
                    key={branch}
                    onClick={() => onSetConfig('year', branch)}
                    className={`
                      rounded border font-serif font-bold transition-all flex items-center justify-center aspect-square text-sm
                      ${isSelected 
                        ? 'bg-blue-50 border-blue-500 text-blue-600 shadow-md' 
                        : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-800 hover:border-slate-300'}
                    `}
                  >
                    {branch}
                  </button>
                );
             })
          )}
        </div>
      </div>
    );
  };

  const renderInterpretationContent = () => {
    if (!selectedPalace) return null;

    if (!interpretation) {
      return (
        <div className="h-full flex items-center justify-center text-slate-400 text-sm italic text-center px-4 font-serif">
          {loading ? "正在推演星象與氣數..." : `點擊「大師解讀」獲取${selectedPalace.name}的詳細分析`}
        </div>
      );
    }

    return (
      <div className="prose prose-sm max-w-none text-slate-700">
        <h4 className="text-yellow-600 font-bold mb-2 font-serif">
          {selectedPalace.name}（{selectedPalace.stem}{selectedPalace.branch}）解析：
        </h4>
        <p className="leading-relaxed text-justify font-serif whitespace-pre-wrap">
          {interpretation}
        </p>
      </div>
    );
  };

  return (
    <>
      <div className="col-start-2 col-end-4 row-start-2 row-end-4 bg-white/90 border border-slate-200 shadow-xl rounded-lg p-4 flex flex-col relative overflow-hidden backdrop-blur-sm transition-all z-40">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
        
        {/* Header Navigation */}
        <div className="flex justify-between items-center mb-3 relative z-20">
          <div className="flex gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
            <button
                onClick={() => setViewMode('birth')}
                className={`
                  px-3 py-1 text-xs rounded transition-all font-medium font-serif whitespace-nowrap flex items-center gap-1
                  ${viewMode === 'birth'
                    ? 'bg-white text-yellow-700 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                `}
              >
                <Calendar className="w-3 h-3" /> 輸入生辰
              </button>
              <button
                onClick={() => setViewMode('limits')}
                className={`
                  px-3 py-1 text-xs rounded transition-all font-medium font-serif whitespace-nowrap flex items-center gap-1
                  ${viewMode === 'limits'
                    ? 'bg-white text-blue-700 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}
                `}
              >
                <Clock className="w-3 h-3" /> 運限
              </button>
              <button
                onClick={() => setViewMode('info')}
                disabled={!config.life}
                className={`
                  px-3 py-1 text-xs rounded transition-all font-medium font-serif whitespace-nowrap flex items-center gap-1
                  ${viewMode === 'info'
                    ? 'bg-white text-indigo-700 shadow-sm border border-slate-200' 
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 disabled:opacity-30 disabled:hover:bg-transparent'}
                `}
              >
                <Sparkles className="w-3 h-3" /> 解析
              </button>
          </div>

          {config.life && (
            <button 
              onClick={() => {
                onResetLifePalace();
                setViewMode('birth');
              }}
              className="ml-2 p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded transition-colors shrink-0"
              title="重設全部"
            >
              <RefreshCcw className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Main Content Area */}
        {viewMode === 'limits' ? (
          renderLimitSettings()
        ) : viewMode === 'info' && config.life ? (
          // INFO VIEW
          selectedPalace ? (
            <div className="flex-1 flex flex-col h-full overflow-hidden animate-in fade-in zoom-in duration-300">
              <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-3">
                <div>
                  <span className="text-yellow-600 text-xs uppercase tracking-widest font-bold font-serif">已選宮位</span>
                  <h2 className="text-2xl font-bold text-slate-800 font-serif flex items-center gap-2 mt-1">
                    <span className="text-slate-900 mr-1">{selectedPalace.name}</span>
                    <div className="flex items-center transform scale-75 origin-left shadow-sm">
                      <span className="w-8 h-8 flex items-center justify-center bg-indigo-600 rounded-l-md text-base text-white border border-indigo-600 z-10 font-serif">
                        {selectedPalace.stem}
                      </span>
                      <span className="w-8 h-8 flex items-center justify-center bg-white rounded-r-md text-base border-y border-r border-slate-300 text-slate-600 font-serif">
                        {selectedPalace.branch}
                      </span>
                    </div>
                  </h2>
                </div>
              </div>

              {renderStackingInfo()}

              {/* Tai Ji Active Status Bar */}
              {taiJiState.isActive && (
                <div className="bg-amber-50 border border-amber-200 rounded p-2 mb-2 flex items-center justify-between animate-in slide-in-from-top-2">
                    <span className="text-xs text-amber-800 font-bold font-serif flex items-center gap-1">
                        <Compass className="w-3 h-3 animate-spin-slow" />
                        {taiJiState.step === 'base' ? '請選擇：基準宮位（體）' : '請選擇：目標宮位（用）'}
                    </span>
                    <button onClick={onCancelTaiJi} className="text-xs text-slate-400 hover:text-slate-600 underline">
                        取消
                    </button>
                </div>
              )}

              {/* AI Interpretation Section */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {!interpretation && !taiJiState.isActive && (
                  <div className="flex flex-col gap-2 mb-4">
                      <button
                        onClick={onInterpret}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-white text-sm rounded-md flex items-center justify-center gap-2 transition-colors shadow-lg shadow-indigo-200 font-serif"
                      >
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                        大師解讀此宮位
                      </button>

                      <button
                        onClick={onStartTaiJi}
                        className="w-full px-4 py-2 bg-white border border-amber-200 text-amber-700 hover:bg-amber-50 text-sm rounded-md flex items-center justify-center gap-2 transition-colors font-serif"
                      >
                        <Compass className="w-4 h-4" />
                        立太極（轉宮分析）
                      </button>
                  </div>
                )}
                
                {taiJiState.isActive && !interpretation && (
                    <div className="flex-1 flex items-center justify-center text-amber-600/50 text-sm font-serif italic">
                        {taiJiState.step === 'base' ? '點擊宮位設定太極點...' : '點擊另一宮位進行分析...'}
                    </div>
                )}

                <div className="flex-1 bg-slate-50 rounded-lg border border-slate-200 relative overflow-hidden flex flex-col">
                  {/* Expand Button (Only show if there is content) */}
                  {interpretation && (
                    <button
                      onClick={() => setIsInterpretationExpanded(true)}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow border border-slate-200 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-all z-10"
                      title="放大觀看"
                    >
                      <Maximize2 className="w-4 h-4" />
                    </button>
                  )}
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-4">
                     {renderInterpretationContent()}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // NOTHING SELECTED
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 text-center p-6 animate-in fade-in">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 border border-slate-200">
                <Sparkles className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-xl font-serif text-slate-700 mb-2">點擊宮位</h3>
              <p className="text-sm opacity-80 font-serif">查看四化飛星路徑與 AI 解讀</p>
            </div>
          )
        ) : (
          // BIRTH INPUT FORM (Default)
          <div className="flex-1 flex flex-col items-center justify-center animate-in fade-in duration-300 w-full max-w-xs mx-auto">
            <div className="text-center mb-4">
              <div className="w-10 h-10 mx-auto rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center mb-2 text-yellow-600">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-serif">輸入生辰</h3>
              <p className="text-xs text-slate-500 font-serif">系統將自動計算天干與命宮</p>
            </div>

            {/* Calendar Type Toggle */}
            <div className="flex w-full bg-slate-100 p-1 rounded-lg mb-4 border border-slate-200">
              <button
                type="button"
                onClick={() => setCalendarType('lunar')}
                className={`flex-1 py-1 text-xs font-bold rounded transition-all font-serif ${
                   calendarType === 'lunar' ? 'bg-white text-yellow-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                農曆日期
              </button>
              <button
                type="button"
                onClick={() => setCalendarType('solar')}
                className={`flex-1 py-1 text-xs font-bold rounded transition-all font-serif ${
                   calendarType === 'solar' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                國曆日期 (西元)
              </button>
            </div>

            <form onSubmit={handleBirthSubmit} className="w-full space-y-3">
              {/* Gender Selector */}
              <div className="flex gap-2">
                 <label className="flex-1 cursor-pointer">
                    <input type="radio" name="gender" value="M" checked={gender === 'M'} onChange={() => setGender('M')} className="hidden peer" />
                    <div className="text-center py-1.5 text-sm border border-slate-300 rounded peer-checked:bg-blue-600 peer-checked:text-white peer-checked:border-blue-600 transition-all text-slate-600 bg-white font-serif">
                       男
                    </div>
                 </label>
                 <label className="flex-1 cursor-pointer">
                    <input type="radio" name="gender" value="F" checked={gender === 'F'} onChange={() => setGender('F')} className="hidden peer" />
                    <div className="text-center py-1.5 text-sm border border-slate-300 rounded peer-checked:bg-pink-600 peer-checked:text-white peer-checked:border-pink-600 transition-all text-slate-600 bg-white font-serif">
                       女
                    </div>
                 </label>
              </div>

              <div className="grid grid-cols-2 gap-2">
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1 font-serif">
                      {calendarType === 'lunar' ? '農曆年份' : '西元年份'}
                    </label>
                    <input 
                      type="number" 
                      value={birthYear}
                      onChange={(e) => setBirthYear(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none font-serif"
                      placeholder="年份"
                    />
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1 font-serif">
                       {calendarType === 'lunar' ? '農曆月份' : '月份'}
                    </label>
                    <select 
                      value={birthMonth}
                      onChange={(e) => setBirthMonth(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 focus:border-yellow-500 outline-none appearance-none font-serif"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(m => (
                        <option key={m} value={m}>{m}月</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1 font-serif">
                      {calendarType === 'lunar' ? '農曆日期' : '日期'}
                    </label>
                    <select 
                      value={birthDay}
                      onChange={(e) => setBirthDay(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 focus:border-yellow-500 outline-none appearance-none font-serif"
                    >
                      {Array.from({length: calendarType === 'lunar' ? 30 : 31}, (_, i) => i + 1).map(d => (
                        <option key={d} value={d}>{d}日</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-span-1">
                    <label className="block text-xs text-slate-500 mb-1 font-serif">
                      {calendarType === 'lunar' ? '出生時辰' : '出生時間'}
                    </label>
                    {calendarType === 'lunar' ? (
                      <select 
                        value={birthHour}
                        onChange={(e) => setBirthHour(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 focus:border-yellow-500 outline-none appearance-none font-serif"
                      >
                        {EARTHLY_BRANCHES.map((b) => (
                          <option key={b} value={b}>{b}時</option>
                        ))}
                      </select>
                    ) : (
                      <select 
                        value={birthHourSolar}
                        onChange={(e) => setBirthHourSolar(e.target.value)}
                        className="w-full bg-white border border-slate-300 rounded px-2 py-1.5 text-sm text-slate-900 focus:border-yellow-500 outline-none appearance-none font-serif"
                      >
                         {Array.from({length: 24}, (_, i) => i).map(h => (
                          <option key={h} value={h}>{h}:00 - {h}:59</option>
                         ))}
                      </select>
                    )}
                  </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white text-sm font-bold py-2 rounded shadow-md flex items-center justify-center gap-2 transition-all mt-2 font-serif"
              >
                生成命盤 <ChevronRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}
        
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-500/50 to-transparent"></div>
      </div>

      {/* EXPANDED INTERPRETATION MODAL OVERLAY */}
      {isInterpretationExpanded && selectedPalace && interpretation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
           <div className="bg-white w-full max-w-2xl max-h-[85vh] rounded-xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-4 border-b border-slate-200 bg-slate-50">
                 <h3 className="text-lg font-bold text-slate-800 font-serif flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    大師解讀：{selectedPalace.name} {taiJiState.isActive && '(立太極)'}
                 </h3>
                 <button 
                   onClick={() => setIsInterpretationExpanded(false)}
                   className="p-1.5 rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
                 >
                    <X className="w-6 h-6" />
                 </button>
              </div>
              
              {/* Modal Content - Scrollable */}
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
                 <div className="prose prose-lg max-w-none text-slate-700 font-serif leading-relaxed">
                    <p className="whitespace-pre-wrap">{interpretation}</p>
                 </div>
              </div>
              
              {/* Modal Footer */}
              <div className="p-4 border-t border-slate-200 bg-slate-50 flex justify-end">
                 <button
                    onClick={() => setIsInterpretationExpanded(false)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md font-medium text-sm transition-colors font-serif"
                 >
                    關閉
                 </button>
              </div>
           </div>
        </div>
      )}
    </>
  );
};

export default CenterPanel;