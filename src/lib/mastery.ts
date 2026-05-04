export interface StrengthMap {
  [key: string]: number; // key format: "Subject:Chapter" -> score (0-100)
}

export const getMasteryData = (): StrengthMap => {
  const data = localStorage.getItem('akshara_strength_map');
  return data ? JSON.parse(data) : {};
};

export const updateMastery = (subject: string, chapter: string, sessionScore: number, totalMarks: number) => {
  const map = getMasteryData();
  const key = `${subject}:${chapter}`;
  const percentage = (sessionScore / totalMarks) * 100;
  
  const currentMastery = map[key] || 0;
  
  // Scoring Algorithm: Exponential Moving Average or Weighted update
  // Let's use a weight of 0.3 for new results to allow for gradual progress/regression
  const newMastery = Math.round(currentMastery * 0.7 + percentage * 0.3);
  
  map[key] = Math.min(100, Math.max(0, newMastery));
  
  localStorage.setItem('akshara_strength_map', JSON.stringify(map));
  return map;
};

export const getSubjectMastery = (subject: string): number => {
  const map = getMasteryData();
  const chapters = Object.keys(map).filter(k => k.startsWith(`${subject}:`));
  if (chapters.length === 0) return 0;
  
  const sum = chapters.reduce((acc, k) => acc + map[k], 0);
  return Math.round(sum / chapters.length);
};

export const getWeakestTopics = (subject?: string, count: number = 3): { chapter: string, score: number }[] => {
  const map = getMasteryData();
  let entries = Object.entries(map).map(([key, score]) => ({
    chapter: key.split(':')[1],
    subject: key.split(':')[0],
    score
  }));
  
  if (subject) {
    entries = entries.filter(e => e.subject === subject);
  }
  
  return entries.sort((a, b) => a.score - b.score).slice(0, count);
};
