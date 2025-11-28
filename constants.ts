
import { PalaceConfig, StarTransformation, Star, BirthData, TransformationType, Gender } from './types';

// Standard Heavenly Stems
export const HEAVENLY_STEMS = [
  '甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'
];

// The user's original custom sequence (fallback)
export const USER_STEM_SEQUENCE = [
  '甲', '乙', '丙', '丁', '戊', '己', '戊', '己', '庚', '辛', '壬', '癸'
];

// Standard Earthly Branches ordered 0-11 (Zi to Hai)
export const EARTHLY_BRANCHES = [
  '子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'
];

// Standard Zi Wei Palace Sequence (Counter-Clockwise from Life Palace)
export const PALACE_NAMES = [
  '命宮',     // Life
  '兄弟宮',   // Siblings
  '夫妻宮',   // Spouse
  '子女宮',   // Children
  '財帛宮',   // Wealth
  '疾厄宮',   // Health
  '遷移宮',   // Travel
  '僕役宮',   // Friends
  '官祿宮',   // Career
  '田宅宮',   // Property
  '福德宮',   // Virtue
  '父母宮'    // Parents
];

export const PALACE_ABBREVIATIONS = [
  '命', '兄', '夫', '子', '財', '疾', '遷', '僕', '官', '田', '福', '父'
];

// Mapping Stems to Si Hua (Star Transformations)
export const SI_HUA_MAP: Record<string, string[]> = {
  '甲': ['廉貞', '破軍', '武曲', '太陽'],
  '乙': ['天機', '天梁', '紫微', '太陰'],
  '丙': ['天同', '天機', '文昌', '廉貞'],
  '丁': ['太陰', '天同', '天機', '巨門'],
  '戊': ['貪狼', '太陰', '右弼', '天機'],
  '己': ['武曲', '貪狼', '天梁', '文曲'],
  '庚': ['太陽', '武曲', '太陰', '天同'],
  '辛': ['巨門', '太陽', '文曲', '文昌'],
  '壬': ['天梁', '紫微', '左輔', '武曲'],
  '癸': ['破軍', '巨門', '太陰', '貪狼'],
};

export const TYPE_LABELS: Record<string, string> = {
  'Lu': '祿',
  'Quan': '權',
  'Ke': '科',
  'Ji': '忌'
};

// Colors adapted for Light Mode (Darker text, lighter backgrounds)
export const TYPE_COLORS: Record<string, string> = {
  'Lu': 'text-green-600',
  'Quan': 'text-blue-600',
  'Ke': 'text-purple-600',
  'Ji': 'text-red-600'
};

export const BG_COLORS: Record<string, string> = {
  'Lu': 'bg-green-100 border-green-200',
  'Quan': 'bg-blue-100 border-blue-200',
  'Ke': 'bg-purple-100 border-purple-200',
  'Ji': 'bg-red-100 border-red-200'
};

/**
 * Grid Positions (Clockwise starting from Top-Right)
 */
export const PALACE_LAYOUT: { stemIndex: number; colStart: number; rowStart: number; label: string; branchIndex: number }[] = [
  { stemIndex: 0, colStart: 4, rowStart: 1, label: '申', branchIndex: 8 }, // Top Right
  { stemIndex: 1, colStart: 4, rowStart: 2, label: '酉', branchIndex: 9 },
  { stemIndex: 2, colStart: 4, rowStart: 3, label: '戌', branchIndex: 10 },
  { stemIndex: 3, colStart: 4, rowStart: 4, label: '亥', branchIndex: 11 }, // Bottom Right
  { stemIndex: 4, colStart: 3, rowStart: 4, label: '子', branchIndex: 0 },
  { stemIndex: 5, colStart: 2, rowStart: 4, label: '丑', branchIndex: 1 },
  { stemIndex: 6, colStart: 1, rowStart: 4, label: '寅', branchIndex: 2 }, // Bottom Left
  { stemIndex: 7, colStart: 1, rowStart: 3, label: '卯', branchIndex: 3 },
  { stemIndex: 8, colStart: 1, rowStart: 2, label: '辰', branchIndex: 4 },
  { stemIndex: 9, colStart: 1, rowStart: 1, label: '巳', branchIndex: 5 }, // Top Left
  { stemIndex: 10, colStart: 2, rowStart: 1, label: '午', branchIndex: 6 },
  { stemIndex: 11, colStart: 3, rowStart: 1, label: '未', branchIndex: 7 },
];

export const getHeavenlyStem = (year: number): string => {
  const offset = (year - 4) % 10;
  const index = offset >= 0 ? offset : offset + 10;
  return HEAVENLY_STEMS[index];
};

export const getFiveTigersStems = (yearStem: string): string[] => {
  const yearStemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  let startStemIndex = ((yearStemIndex % 5) * 2 + 2) % 10;
  
  const branchToStemMap: Record<number, string> = {};
  for (let i = 0; i < 12; i++) {
    const currentBranchIndex = (2 + i) % 12;
    const currentStemIndex = (startStemIndex + i) % 10;
    branchToStemMap[currentBranchIndex] = HEAVENLY_STEMS[currentStemIndex];
  }
  return PALACE_LAYOUT.map(layout => branchToStemMap[layout.branchIndex]);
};

export const calculateLifePalaceBranch = (month: number, hourBranch: string): string => {
  const hourIndex = EARTHLY_BRANCHES.indexOf(hourBranch);
  const yinIndex = 2;
  let resultIndex = (yinIndex + (month - 1) - hourIndex) % 12;
  if (resultIndex < 0) resultIndex += 12;
  return EARTHLY_BRANCHES[resultIndex];
};

// ==========================================
// Advanced Star Placement & Limits Logic
// ==========================================

// Five Element Bureau Map
const NA_YIN_BUREAU = [
  // Jia (0) & Yi (1)
  { branches: [0, 1], value: 4 }, // Zi/Chou -> Metal 4
  { branches: [2, 3], value: 2 }, // Yin/Mao -> Water 2
  { branches: [4, 5], value: 6 }, // Chen/Si -> Fire 6
  { branches: [6, 7], value: 4 }, // Wu/Wei -> Metal 4
  { branches: [8, 9], value: 2 }, // Shen/You -> Water 2
  { branches: [10, 11], value: 6 }, // Xu/Hai -> Fire 6
  
  // Bing (2) & Ding (3)
  { branches: [0, 1], value: 2 }, // Zi/Chou -> Water 2
  { branches: [2, 3], value: 6 }, // Yin/Mao -> Fire 6
  { branches: [4, 5], value: 5 }, // Chen/Si -> Earth 5
  { branches: [6, 7], value: 2 }, // Wu/Wei -> Water 2
  { branches: [8, 9], value: 6 }, // Shen/You -> Fire 6
  { branches: [10, 11], value: 5 }, // Xu/Hai -> Earth 5

  // Wu (4) & Ji (5)
  { branches: [0, 1], value: 6 }, // Zi/Chou -> Fire 6
  { branches: [2, 3], value: 5 }, // Yin/Mao -> Earth 5
  { branches: [4, 5], value: 3 }, // Chen/Si -> Wood 3
  { branches: [6, 7], value: 6 }, // Wu/Wei -> Fire 6
  { branches: [8, 9], value: 5 }, // Shen/You -> Earth 5
  { branches: [10, 11], value: 3 }, // Xu/Hai -> Wood 3

  // Geng (6) & Xin (7)
  { branches: [0, 1], value: 5 }, // Zi/Chou -> Earth 5
  { branches: [2, 3], value: 3 }, // Yin/Mao -> Wood 3
  { branches: [4, 5], value: 4 }, // Chen/Si -> Metal 4
  { branches: [6, 7], value: 5 }, // Wu/Wei -> Earth 5
  { branches: [8, 9], value: 3 }, // Shen/You -> Wood 3
  { branches: [10, 11], value: 4 }, // Xu/Hai -> Metal 4

  // Ren (8) & Gui (9)
  { branches: [0, 1], value: 3 }, // Zi/Chou -> Wood 3
  { branches: [2, 3], value: 4 }, // Yin/Mao -> Metal 4
  { branches: [4, 5], value: 2 }, // Chen/Si -> Water 2
  { branches: [6, 7], value: 3 }, // Wu/Wei -> Wood 3
  { branches: [8, 9], value: 4 }, // Shen/You -> Metal 4
  { branches: [10, 11], value: 2 }, // Xu/Hai -> Water 2
];

const getBureau = (stem: string, branch: string): number => {
  const sIdx = HEAVENLY_STEMS.indexOf(stem);
  const bIdx = EARTHLY_BRANCHES.indexOf(branch);
  const pairIdx = Math.floor(sIdx / 2); // 0-4
  
  // Offset in the big array
  const start = pairIdx * 6; 
  for(let i = start; i < start + 6; i++) {
    if (NA_YIN_BUREAU[i].branches.includes(bIdx)) {
      return NA_YIN_BUREAU[i].value;
    }
  }
  return 2; // Default Water 2
};

// Check direction for Decade/Small Limits
// Yang Male/Yin Female: Clockwise (1)
// Yin Male/Yang Female: Counter-Clockwise (-1)
const getDirection = (gender: Gender, yearStem: string): number => {
  const stemIndex = HEAVENLY_STEMS.indexOf(yearStem);
  const isYangStem = stemIndex % 2 === 0;
  
  if ((isYangStem && gender === 'M') || (!isYangStem && gender === 'F')) {
    return 1; // Clockwise
  } else {
    return -1; // Counter-Clockwise
  }
};

// Calculate Small Limit Start Palace Index (Age 1)
const getSmallLimitStartIndex = (birthBranch: string): number => {
    // 寅午戌 (Fire) -> 辰 (4)
    // 申子辰 (Water) -> 戌 (10)
    // 巳酉丑 (Metal) -> 未 (7)
    // 亥卯未 (Wood) -> 丑 (1)
    const branchIdx = EARTHLY_BRANCHES.indexOf(birthBranch);
    const mod = branchIdx % 4;
    
    // Pattern based on Trine groups
    if ([2, 6, 10].includes(branchIdx)) return 4; // Fire Trine -> Chen
    if ([8, 0, 4].includes(branchIdx)) return 10; // Water Trine -> Xu
    if ([5, 9, 1].includes(branchIdx)) return 7; // Metal Trine -> Wei
    if ([11, 3, 7].includes(branchIdx)) return 1; // Wood Trine -> Chou
    
    return 0; // Fallback
};

// Find Zi Wei Branch Index (0-11)
const getZiWeiBranchIndex = (bureau: number, day: number): number => {
  let x = 0;
  let remainder = 0;
  
  if (day % bureau === 0) {
    x = day / bureau;
    remainder = 0;
  } else {
    x = Math.floor(day / bureau) + 1;
    remainder = (bureau * x) - day;
  }
  
  let pos = 0;
  if (remainder % 2 === 0) {
    pos = (x + remainder + 2 - 1) % 12;
  } else {
    pos = (x - remainder + 2 - 1) % 12;
  }
  if (pos < 0) pos += 12;
  return pos;
};

/**
 * Assigns stars to palaces based on birth data and configured palaces.
 */
export const assignStars = (
  palaces: PalaceConfig[],
  birthData: BirthData,
  lifePalaceId: number
): PalaceConfig[] => {
  const lifePalace = palaces[lifePalaceId];
  const bureau = getBureau(lifePalace.stem, lifePalace.branch);
  const ziWeiIndex = getZiWeiBranchIndex(bureau, birthData.day);
  const tianFuIndex = (4 - ziWeiIndex + 12) % 12;

  // Determine Limit Direction
  const yearStem = getHeavenlyStem(birthData.year);
  const direction = getDirection(birthData.gender, yearStem);

  const starMap: Record<number, { major: Star[], minor: Star[] }> = {};
  for(let i=0; i<12; i++) starMap[i] = { major: [], minor: [] };

  const zwGroup = [
    { name: '紫微', offset: 0 },
    { name: '天機', offset: -1 },
    { name: '太陽', offset: -3 },
    { name: '武曲', offset: -4 },
    { name: '天同', offset: -5 },
    { name: '廉貞', offset: -8 },
  ];
  zwGroup.forEach(s => {
    let idx = (ziWeiIndex + s.offset) % 12;
    if (idx < 0) idx += 12;
    starMap[idx].major.push({ name: s.name, type: 'major' });
  });

  const tfGroup = [
    { name: '天府', offset: 0 },
    { name: '太陰', offset: 1 },
    { name: '貪狼', offset: 2 },
    { name: '巨門', offset: 3 },
    { name: '天相', offset: 4 },
    { name: '天梁', offset: 5 },
    { name: '七殺', offset: 6 },
    { name: '破軍', offset: 10 },
  ];
  tfGroup.forEach(s => {
    let idx = (tianFuIndex + s.offset) % 12;
    if (idx < 0) idx += 12;
    starMap[idx].major.push({ name: s.name, type: 'major' });
  });

  // Minor Stars
  const zuoFuIdx = (4 + birthData.month - 1) % 12;
  const youBiIdx = (10 - (birthData.month - 1)) % 12;
  starMap[zuoFuIdx < 0 ? zuoFuIdx+12 : zuoFuIdx].minor.push({ name: '左輔', type: 'minor' });
  starMap[youBiIdx < 0 ? youBiIdx+12 : youBiIdx].minor.push({ name: '右弼', type: 'minor' });

  const hourIdx = EARTHLY_BRANCHES.indexOf(birthData.hourBranch);
  const wenChangIdx = (10 - hourIdx + 12) % 12;
  const wenQuIdx = (4 + hourIdx) % 12;
  const diJieIdx = (11 + hourIdx) % 12;
  const diKongIdx = (11 - hourIdx + 12) % 12;

  starMap[wenChangIdx].minor.push({ name: '文昌', type: 'minor' });
  starMap[wenQuIdx].minor.push({ name: '文曲', type: 'minor' });
  starMap[diJieIdx].minor.push({ name: '地劫', type: 'bad' });
  starMap[diKongIdx].minor.push({ name: '地空', type: 'bad' });

  const luCunMap: Record<string, number> = {
    '甲': 2, '乙': 3, '丙': 5, '丁': 6, '戊': 5, 
    '己': 6, '庚': 8, '辛': 9, '壬': 11, '癸': 0
  };
  
  const luCunIdx = luCunMap[yearStem];
  if (luCunIdx !== undefined) {
    starMap[luCunIdx].minor.push({ name: '祿存', type: 'minor' });
    const qingYangIdx = (luCunIdx + 1) % 12;
    starMap[qingYangIdx].minor.push({ name: '擎羊', type: 'bad' });
    const tuoLuoIdx = (luCunIdx - 1 + 12) % 12;
    starMap[tuoLuoIdx].minor.push({ name: '陀羅', type: 'bad' });
  }

  const tianKuiIdx = {
    '甲': 1, '戊': 1, '庚': 1, '乙': 0, '己': 0, '丙': 11, '丁': 11, '辛': 6, '壬': 3, '癸': 3
  }[yearStem];
  const tianYueIdx = {
    '甲': 7, '戊': 7, '庚': 7, '乙': 8, '己': 8, '丙': 9, '丁': 9, '辛': 2, '壬': 5, '癸': 5
  }[yearStem];

  if (tianKuiIdx !== undefined) starMap[tianKuiIdx].minor.push({ name: '天魁', type: 'minor' });
  if (tianYueIdx !== undefined) starMap[tianYueIdx].minor.push({ name: '天鉞', type: 'minor' });

  const birthSiHua = SI_HUA_MAP[yearStem]; 
  const types: TransformationType[] = ['Lu', 'Quan', 'Ke', 'Ji'];
  
  const tagStars = (stars: Star[]) => {
    return stars.map(s => {
      const idx = birthSiHua.indexOf(s.name);
      if (idx !== -1) {
        return { ...s, transformation: types[idx] };
      }
      return s;
    });
  };

  return palaces.map(p => {
    const layout = PALACE_LAYOUT[p.id];
    const branchIdx = layout.branchIndex;
    
    const major = tagStars(starMap[branchIdx].major);
    const minor = tagStars(starMap[branchIdx].minor);
    
    // Calculate Decade Range
    // Start Age = Bureau
    // Movement = Direction * Steps from Life Palace
    // Life Palace Index (0-11) is the visual position or branch?
    // It's cleaner to calculate based on steps from Life Palace.
    
    // Calculate steps from Life Palace
    let stepsFromLife = 0;
    // Current Palace Branch Index
    const currentBranchIndex = layout.branchIndex;
    const lifeBranchIndex = PALACE_LAYOUT[lifePalaceId].branchIndex;
    
    // Find distance in grid slots (not branches per se, but grid order is counter-clockwise)
    // However, Decade movement is based on Direction.
    // If Clockwise: Life -> Parents -> Virtue ... (branch index +1)
    // If Counter-Clockwise: Life -> Siblings -> Spouse ... (branch index -1)
    // Wait, the PALACE_NAMES are counter-clockwise.
    // Let's use branch indices.
    
    // Distance from Life Branch based on Direction
    let dist = 0;
    if (direction === 1) { // Clockwise
        dist = (currentBranchIndex - lifeBranchIndex + 12) % 12;
    } else { // Counter-Clockwise
        dist = (lifeBranchIndex - currentBranchIndex + 12) % 12;
    }

    // Decade Start Age = Bureau + (dist * 10)
    const startAge = bureau + (dist * 10);
    const endAge = startAge + 9;
    
    // Convert Age to Year
    // Year = BirthYear + (Age - 1)
    const startYear = birthData.year + (startAge - 1);
    const endYear = birthData.year + (endAge - 1);
    
    const decadeRange = `${startYear}-${endYear}`;

    return {
      ...p,
      majorStars: major,
      minorStars: minor,
      decadeRange: decadeRange
    };
  });
};

export const getPalaceData = (customStems?: string[]): PalaceConfig[] => {
  return PALACE_LAYOUT.map((layout, index) => {
    const stem = customStems ? customStems[index] : USER_STEM_SEQUENCE[index];
    const stars = SI_HUA_MAP[stem];
    const transformations: StarTransformation[] = [
      { starName: stars[0], type: 'Lu' },
      { starName: stars[1], type: 'Quan' },
      { starName: stars[2], type: 'Ke' },
      { starName: stars[3], type: 'Ji' },
    ];

    const gridPosition = `col-start-${layout.colStart} row-start-${layout.rowStart}`;

    return {
      id: index,
      stem,
      branch: layout.label,
      gridPosition,
      transformations,
      majorStars: [],
      minorStars: [],
      layerLabels: {
        decade: null,
        year: null,
        small: null
      }
    };
  });
};

export const calculateSmallLimitIndex = (birthYearBranch: string, gender: Gender, currentAge: number): number => {
   const startIndex = getSmallLimitStartIndex(birthYearBranch);
   const direction = (gender === 'M') ? 1 : -1; // Male Clockwise, Female Counter
   
   // Formula: Start + ((Age - 1) * Direction)
   let index = (startIndex + ((currentAge - 1) * direction)) % 12;
   if (index < 0) index += 12;
   return index;
};
