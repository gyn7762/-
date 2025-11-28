
import { GoogleGenAI } from "@google/genai";
// Fix: Import PalaceConfig from types.ts as it is not exported from constants.ts
import { PalaceConfig } from "../types";
import { TYPE_LABELS, EARTHLY_BRANCHES, PALACE_NAMES, SI_HUA_MAP } from "../constants";

// Initialize the GenAI client
// IMPORTANT: Accessing process.env.API_KEY as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getStarsDescription = (p: PalaceConfig | undefined): string => {
  if (!p) return '無';
  const majors = p.majorStars.map(s => s.name + (s.transformation ? `(${TYPE_LABELS[s.transformation]})` : '')).join('');
  const minors = p.minorStars.map(s => s.name).join('、');
  if (!majors && !minors) return '無主星';
  return `${majors}${majors && minors ? '、' : ''}${minors}`;
};

export const interpretPalace = async (palace: PalaceConfig, allPalaces: PalaceConfig[]): Promise<string> => {
  const model = 'gemini-2.5-flash';
  
  // 1. Prepare Basic Info
  const transformationsStr = palace.transformations
    .map(t => `${t.starName}化${TYPE_LABELS[t.type]}`)
    .join('、');

  // 2. Prepare Flying Star Paths Info (New)
  const stem = palace.stem;
  const flyingStars = SI_HUA_MAP[stem]; // ['廉貞', '破軍', ...]
  const types = ['Lu', 'Quan', 'Ke', 'Ji']; // 祿, 權, 科, 忌
  
  const flyingPathsInfo = flyingStars.map((starName, idx) => {
      const typeLabel = TYPE_LABELS[types[idx]]; // 祿
      // Find destination palace
      const targetPalace = allPalaces.find(p => 
          p.majorStars.some(s => s.name === starName) || 
          p.minorStars.some(s => s.name === starName)
      );
      
      if (!targetPalace) return null;
      
      const destName = targetPalace.name || targetPalace.branch;
      
      // Find Opposite Palace (Clashed)
      const targetBranchIdx = EARTHLY_BRANCHES.indexOf(targetPalace.branch);
      const oppBranchIdx = (targetBranchIdx + 6) % 12;
      const oppPalace = allPalaces.find(p => p.branch === EARTHLY_BRANCHES[oppBranchIdx]);
      const oppName = oppPalace?.name || oppPalace?.branch || '對宮';

      return {
          star: starName,
          type: typeLabel,
          dest: destName,
          opp: oppName,
          isSelf: targetPalace.id === palace.id
      };
  }).filter(Boolean);

  const flyingPromptStr = flyingPathsInfo.map(path => {
      if (path?.isSelf) return `- ${path.star}自化${path.type}（在本宮）`;
      return `- ${path?.star}化${path?.type} 入 ${path?.dest}，沖 ${path?.opp}`;
  }).join('\n    ');


  // 3. Prepare Stacking Info
  const layers = [
    palace.name ? `本命${palace.name}` : null,
    palace.layerLabels.decade ? `${palace.layerLabels.decade.replace('大', '大限')}` : null,
    palace.layerLabels.year ? `${palace.layerLabels.year.replace('流', '流年')}` : null,
    palace.layerLabels.small ? `${palace.layerLabels.small.replace('小', '小限')}` : null
  ].filter(Boolean).join('、');

  // 4. Prepare San Fang Si Zheng (Three Parties and Four Pillars) Info
  const targetBranchIdx = EARTHLY_BRANCHES.indexOf(palace.branch);
  
  // Opposite (Dui Gong)
  const oppositeBranchIdx = (targetBranchIdx + 6) % 12;
  const oppositePalace = allPalaces.find(p => p.branch === EARTHLY_BRANCHES[oppositeBranchIdx]);
  
  // Trine 1 (San He)
  const trine1BranchIdx = (targetBranchIdx + 4) % 12;
  const trine1Palace = allPalaces.find(p => p.branch === EARTHLY_BRANCHES[trine1BranchIdx]);
  
  // Trine 2 (San He)
  const trine2BranchIdx = (targetBranchIdx + 8) % 12;
  const trine2Palace = allPalaces.find(p => p.branch === EARTHLY_BRANCHES[trine2BranchIdx]);

  const sanFangInfo = `
    - 本宮（${palace.branch}）：${getStarsDescription(palace)}
    - 對宮（${EARTHLY_BRANCHES[oppositeBranchIdx]}）：${getStarsDescription(oppositePalace)}
    - 三合宮（${EARTHLY_BRANCHES[trine1BranchIdx]}）：${getStarsDescription(trine1Palace)}
    - 三合宮（${EARTHLY_BRANCHES[trine2BranchIdx]}）：${getStarsDescription(trine2Palace)}
  `;

  const prompt = `
    作為一位專業的紫微斗數大師，請為使用者分析以下命盤宮位。
    
    【基本資訊】
    宮位疊宮：${layers}
    干支：${palace.stem}${palace.branch}
    
    【四化飛星路徑（重點分析）】
    ${flyingPromptStr}
    
    【三方四正星曜（先天格局參考）】
    ${sanFangInfo}
    
    【分析指令】
    請用簡潔、現代且富有哲理的語言（約 400 字），進行以下四個層次的分析：

    1. **本命盤格局解析**：
       綜合參考三方四正的星曜組合，分析先天格局的強弱吉凶。

    2. **疊宮效應（時空環境）**：
       分析「${layers}」重疊的意義。說明大限、流年命盤如何引動本命盤的吉凶（如流年財帛重疊本命夫妻）。

    3. **四化飛星影響（核心重點）**：
       請詳細解析上述「四化飛星路徑」。
       - **坐入影響**：解釋四化星（祿權科忌）飛入目標宮位後，會產生什麼具體現象（例如：化祿入財帛代表財源廣進，化忌入福德代表自尋煩惱）。
       - **對沖影響**：解釋該飛星「沖」擊對宮的後果（例如：化忌入福德，則沖財帛，代表思想導致破財，或為享受而損財）。
       - 請特別針對 **化忌** 與 **化祿** 的路徑做深入的吉凶判斷。

    4. **生活實例與建議**：
       將上述飛星現象轉化為現代生活實例（例如投資、職場、感情），並給予正向建議。
    
    請以溫暖、正向且具引導性的語氣撰寫。
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    
    return response.text || "無法生成解釋，請稍後再試。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "分析服務目前無法使用，請檢查 API Key 或稍後再試。";
  }
};

export const interpretTaiJi = async (basePalace: PalaceConfig, targetPalace: PalaceConfig, allPalaces: PalaceConfig[]): Promise<string> => {
  const model = 'gemini-2.5-flash';

  const baseBranchIdx = EARTHLY_BRANCHES.indexOf(basePalace.branch);
  const targetBranchIdx = EARTHLY_BRANCHES.indexOf(targetPalace.branch);
  
  // Calculate relative steps Counter-Clockwise (Standard Palace Sequence)
  // Step 0 = Self, 1 = Siblings, ... 11 = Parents
  const relativeStep = (baseBranchIdx - targetBranchIdx + 12) % 12;
  const relativeRelationship = PALACE_NAMES[relativeStep]; // e.g. "官祿宮" (9th step usually? No. Sequence is 12 names)
  // Wait, PALACE_NAMES index: 0=Life, 1=Sib, 2=Spouse...
  // Relative Step logic:
  // Base (Zi) -> Target (Hai) = Siblings. Zi=0, Hai=11. (0-11+12)%12 = 1. PALACE_NAMES[1] = Siblings. Correct.
  
  const baseName = basePalace.name || `${basePalace.stem}${basePalace.branch}`;
  const targetName = targetPalace.name || `${targetPalace.stem}${targetPalace.branch}`;

  const prompt = `
    作為一位專業的紫微斗數大師，請進行「立太極（轉宮）」的高階分析。

    【太極設定】
    - 基準點（體）：${baseName}（${basePalace.stem}${basePalace.branch}）
    - 目標點（用）：${targetName}（${targetPalace.stem}${targetPalace.branch}）
    - 相對關係：目標點是基準點的「${relativeRelationship}」

    【星曜資訊】
    - 基準宮位星曜：${getStarsDescription(basePalace)}
    - 目標宮位星曜：${getStarsDescription(targetPalace)}

    【分析指令】
    請解釋以此基準點立太極後，目標宮位所代表的深層意涵。
    例如：若以「子女宮」為太極點（體），則「疾厄宮」為子女之夫妻（媳婦/女婿）或合夥之資金位。
    
    請具體分析：
    1. **關係定義**：說明 ${targetName} 作為 ${baseName} 的 ${relativeRelationship}，在命理上代表什麼人、事、物（例如：辦公室風水、配偶的財運、朋友的事業等）。
    2. **吉凶分析**：結合兩宮位的星曜與四化，分析此關係的吉凶互動。
    3. **生活應用**：給予使用者在實際生活中的觀察重點或建議。

    字數約 300 字，語氣專業且具啟發性。
  `;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
    });
    return response.text || "無法生成太極解釋。";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "分析服務暫時無法使用。";
  }
};
