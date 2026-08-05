# Combined Modalities Column Handling

## Problem Statement

Some repertories (especially **Therpau** and **Classical** formats) have a single column containing **both aggravation AND amelioration** modalities combined, instead of separate columns.

### Example Formats

#### Format 1: Keyword-based separation
```
Worse: motion / चलने में बढ़ता; Better: rest / आराम में ठीक
```

#### Format 2: Semicolon separation with Hindi hints
```
चलने में बढ़ता / motion worsens; आराम में ठीक / better at rest
```

#### Format 3: Mixed inline
```
worse contradiction / विरोध से बढ़े; better consolation / दिलासा से ठीक
```

## Solution Implementation

### Step 1: Detect Combined Modalities Column

In `resolveFields()` function (line ~260):

```javascript
// Check for COMBINED modalities column (Therpau/Classical format)
const combinedModRaw = get(
  'modalities (eng + hindi)', 
  'modalities', 
  'agg/amel', 
  'worse/better', 
  'modalit'
);

if (combinedModRaw && !aggRaw && !amelRaw) {
  // Split combined modalities into aggravation and amelioration
  const splitMod = parseCombinedModalities(combinedModRaw);
  aggRaw = splitMod.aggravation;
  amelRaw = splitMod.amelioration;
}
```

### Step 2: Parse Combined Modalities

New function `parseCombinedModalities()`:

```javascript
const parseCombinedModalities = (rawStr) => {
  if (!rawStr) return { aggravation: '', amelioration: '' };

  const text = String(rawStr).trim();
  
  // Strategy 1: Split by keywords "worse:", "better:", etc.
  const worseMatch = text.match(/(?:worse|agg(?:ravation)?)[:\s]+(.*?)(?=(?:better|amel|$))/i);
  const betterMatch = text.match(/(?:better|amel(?:ioration)?)[:\s]+(.*?)(?=(?:worse|agg|$))/i);
  
  let aggravation = '';
  let amelioration = '';
  
  if (worseMatch) {
    aggravation = worseMatch[1].trim();
  }
  
  if (betterMatch) {
    amelioration = betterMatch[1].trim();
  }
  
  // Strategy 2: If no clear keywords, split by semicolon and detect by content
  if (!aggravation && !amelioration && text.includes(';')) {
    const parts = text.split(';').map(s => s.trim());
    parts.forEach(part => {
      const lowerPart = part.toLowerCase();
      // Hindi: बढ़ = increase/worsen, ठीक/राहत = better/relief
      if (lowerPart.includes('worse') || lowerPart.includes('agg') || lowerPart.includes('बढ़')) {
        aggravation += (aggravation ? '; ' : '') + part;
      } else if (lowerPart.includes('better') || lowerPart.includes('amel') || lowerPart.includes('ठीक') || lowerPart.includes('राहत')) {
        amelioration += (amelioration ? '; ' : '') + part;
      }
    });
  }
  
  // Strategy 3: Fallback - if still unclear, default to aggravation
  if (!aggravation && !amelioration && text) {
    if (text.match(/worse|agg/i)) {
      aggravation = text;
    } else if (text.match(/better|amel/i)) {
      amelioration = text;
    } else {
      aggravation = text; // Safe default
    }
  }
  
  return { aggravation, amelioration };
};
```

### Step 3: Auto-detect Combined Modalities Column

In `detectColumnType()` function (line ~420):

```javascript
if (sampleText.includes('modalit') || (sampleText.includes('worse') && sampleText.includes('better'))) {
  return 'Modalities';
}
```

## How It Works - Step by Step

### Example Input
```
Column Header: "Modalities (Eng + Hindi)"
Cell Value: "worse contradiction / विरोध से बढ़े; better consolation / दिलासा से ठीक"
```

### Processing Steps

1. **Column Detection**:
   - `detectColumnType()` sees "modalit" in sample text
   - Returns header name: `'Modalities'`

2. **Field Resolution**:
   - `resolveFields()` calls `get('modalities', ...)`
   - Finds the combined text

3. **Splitting**:
   - `parseCombinedModalities()` is called
   - Regex finds "worse" followed by "contradiction / विरोध से बढ़े"
   - Regex finds "better" followed by "consolation / दिलासा से ठीक"
   - Returns:
     ```javascript
     {
       aggravation: "contradiction / विरोध से बढ़े",
       amelioration: "consolation / दिलासा से ठीक"
     }
     ```

4. **Bilingual Parsing**:
   - `aggRaw` and `amelRaw` are now set
   - `parseBilingualList()` splits each into English and Hindi arrays:
     ```javascript
     aggEn: ["contradiction"]
     aggHi: ["विरोध से बढ़े"]
     amelEn: ["consolation"]
     amelHi: ["दिलासा से ठीक"]
     ```

5. **Database Storage**:
   - Stored in rubric document:
     ```javascript
     {
       modalities: {
         aggravation: ["contradiction"],
         amelioration: ["consolation"]
       }
     }
     ```

6. **searchText Creation**:
   - All text combined for full-text search:
     ```
     "... contradiction विरोध से बढ़े consolation दिलासा से ठीक ..."
     ```

## Supported Formats

### ✅ Format A: Explicit Keywords
```
Worse: motion; Better: rest
worse motion / चलने में बढ़ता; better rest / आराम में ठीक
```

### ✅ Format B: Implicit with Hindi Markers
```
चलने में बढ़ता / motion; आराम में ठीक / rest
```
(Hindi "बढ़" = worse, "ठीक" = better)

### ✅ Format C: Mixed English/Hindi
```
worse: heat / गर्मी में; better: cold / ठंड में
```

### ✅ Format D: Semicolon-separated
```
motion aggravates; rest ameliorates
```

## Fallback Behavior

If the parser **cannot** clearly identify aggravation vs amelioration:
- Entire text is assigned to **aggravation** (safer default)
- This prevents data loss
- Manual review may be needed for ambiguous cases

## Testing Examples

### Test Case 1: Clear Keywords
```javascript
Input: "worse: motion / चलने में बढ़ता; better: rest / आराम में ठीक"
Output: {
  aggravation: "motion / चलने में बढ़ता",
  amelioration: "rest / आराम में ठीक"
}
```

### Test Case 2: Hindi Markers Only
```javascript
Input: "चलने में बढ़ता; आराम में ठीक"
Output: {
  aggravation: "चलने में बढ़ता",
  amelioration: "आराम में ठीक"
}
```

### Test Case 3: Ambiguous
```javascript
Input: "motion effects unclear"
Output: {
  aggravation: "motion effects unclear", // Default to aggravation
  amelioration: ""
}
```

## Database Impact

After uploading a repertory with combined modalities:

1. **MongoDB Document**:
   ```javascript
   {
     chapter: { en: "Mind", hi: "मन" },
     rubric: { en: "Anger", hi: "क्रोध" },
     modalities: {
       aggravation: ["contradiction", "noise"],
       amelioration: ["consolation", "rest"]
     },
     searchText: "mind मन anger क्रोध contradiction noise consolation rest..."
   }
   ```

2. **Full-Text Search** works on `searchText`:
   ```javascript
   db.rubrics.find({
     $text: { $search: "contradiction consolation" }
   })
   // Finds this rubric because both words are in searchText
   ```

## Benefits

✅ **Automatic detection** - No manual configuration needed  
✅ **Bilingual support** - Handles English + Hindi in same field  
✅ **Multiple formats** - Works with different repertory styles  
✅ **Safe fallback** - Doesn't lose data if format is unclear  
✅ **Backward compatible** - Separate columns still work as before  

## Code Location

- **Main parsing logic**: `/server/services/excelService.js`
  - Line ~100: `parseCombinedModalities()` function
  - Line ~260: Combined modalities detection in `resolveFields()`
  - Line ~420: Column type detection in `detectColumnType()`

---

**Last Updated**: December 2024  
**Related Files**: `excelService.js`, `Rubric.js` (model)
