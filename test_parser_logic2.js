const mainChapter = ''; // NOT SET
let activeMainRubric = 'PAIN';
const seenKeys = new Set();
const allResults = [];

const cleanRubricPath = (rubricStr, chapterName) => {
    if (!rubricStr) return '';
    let clean = rubricStr.trim();
    if (chapterName) {
      const chapRegex = new RegExp(`^${chapterName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*-\\s*`, 'i');
      clean = clean.replace(chapRegex, '');
    }
    clean = clean.replace(/^(?:\[CHAPTER\]|CHAPTER)\s*-\s*/i, '');
    return clean.trim();
  };

  const extractMainRubricWord = (segment) => {
    if (!segment) return '';
    const bare = segment.split(/[,.(]/)[0].trim();
    if (bare.length >= 3 && bare === bare.toUpperCase() && /^[A-Z]/.test(bare)) {
      return bare;
    }
    return '';
  };

const addResults = (rows, detectedChapter) => {
    const currentChapter = mainChapter || detectedChapter || 'UNKNOWN';

    for (const group of (rows || [])) {
      let rubric_en = cleanRubricPath(group.rubric_en || '', currentChapter);
      let rubric_hi = '';

      const parts = rubric_en.split(/\s*-\s*/).map(p => p.trim()).filter(Boolean);
      const firstPart = parts[0] || '';

      let detectedMainRubric = '';
      for (const seg of parts) {
        const word = extractMainRubricWord(seg);
        if (word) { detectedMainRubric = word; break; }
      }

      if (detectedMainRubric) {
        activeMainRubric = detectedMainRubric;
      } else if (firstPart && activeMainRubric) {
        if (firstPart.toUpperCase() === activeMainRubric.toUpperCase()) {
          parts[0] = activeMainRubric;
          rubric_en = parts.join(' - ');
        } else {
          rubric_en = `${activeMainRubric} - ${rubric_en}`;
        }
      }

      allResults.push({
        rubric_en: rubric_en,
      });
    }
}

addResults([
  { rubric_en: 'HEAD - wine, from' },
  { rubric_en: 'amel.' },
  { rubric_en: 'lead, containing' },
], 'UNKNOWN');

console.log(allResults);
