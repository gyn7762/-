
export type TransformationType = 'Lu' | 'Quan' | 'Ke' | 'Ji';

export interface StarTransformation {
  starName: string;
  type: TransformationType;
}

export interface Star {
  name: string;
  type: 'major' | 'minor' | 'bad'; // major=甲級, minor=乙級/吉, bad=煞
  transformation?: TransformationType; // Birth Year Si Hua attached to this star
}

export interface PalaceConfig {
  id: number;
  name?: string; // The calculated name (e.g., 命宮, 財帛宮)
  stem: string; // Heavenly Stem (e.g., 甲)
  branch: string; // Earthly Branch (e.g., 巳)
  gridPosition: string; // Tailwind grid area classes
  transformations: StarTransformation[]; // Palace Stem Transformations (Self)
  majorStars: Star[]; // 14 Major Stars
  minorStars: Star[]; // Auxiliary Stars (Left/Right, Chang/Qu, etc.)
  layerLabels: {
    decade: string | null; // e.g. "大命", "大財"
    year: string | null;   // e.g. "流命", "流兄"
    small: string | null;  // e.g. "小命", "小夫"
  };
  decadeRange?: string; // e.g. "2024 - 2033"
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ChartMode = 'life' | 'decade' | 'year' | 'small';

export interface ChartConfig {
  life: string | null;
  decade: string | null;
  year: string | null;
  small: string | null;
}

export type Gender = 'M' | 'F';

export interface BirthData {
  year: number; // Gregorian Year
  month: number; // Lunar Month (1-12)
  day: number; // Lunar Day (1-30)
  hourBranch: string; // Earthly Branch of birth hour
  gender: Gender;
}

export interface TaiJiState {
  isActive: boolean;
  step: 'base' | 'target';
  basePalaceId: number | null;
}
