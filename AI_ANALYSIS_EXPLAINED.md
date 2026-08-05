# AI Analysis for Homeopathic Repertory - Complete Technical Explanation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Frontend Flow](#frontend-flow)
4. [Backend Flow](#backend-flow)
5. [AI Models](#ai-models)
6. [Database Queries](#database-queries)
7. [Performance Optimization](#performance-optimization)

---

## Overview

The AI Analysis system matches **patient symptoms** to **homeopathic rubrics** (standardized symptom descriptions) and then ranks **medicines** based on how many rubrics they appear in.

**Example:**
- Patient says: "Headache worse in the morning with nausea"
- AI finds matching rubrics: "HEAD - PAIN - morning" and "STOMACH - NAUSEA - headache, with"
- Each rubric lists medicines with grades (1-4 scale)
- System calculates total scores and ranks medicines

---

## System Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌─────────────────┐
│   Frontend      │──1──>│   Backend API    │──2──>│   MongoDB       │
│ RubricAnalyzer  │      │ analysisController│      │ (Rubrics DB)    │
│                 │<─5───│                  │<─3───│                 │
└─────────────────┘      └──────────────────┘      └─────────────────┘
                                  │
                                  │ 4
                                  ▼
                         ┌──────────────────┐
                         │   AI Service     │
                         │ (Groq/Gemini)    │
                         └──────────────────┘
```

**Flow:**
1. Frontend sends symptoms + repertory ID
2. Backend queries MongoDB for candidate rubrics
3. MongoDB returns rubrics matching keywords
4. AI model matches symptoms to specific rubrics
5. Backend returns matched rubrics + medicine rankings


---

## Frontend Flow (RubricAnalyzer.jsx)

### Step 1: User Enters Symptoms

```javascript
// File: src/components/RubricAnalyzer.jsx
const [symptoms, setSymptoms] = useState(['', '', '', '', '', '', '', '', '']); // 9 slots
const [selectedRep, setSelectedRep] = useState(null); // Selected repertory
```

**What happens:**
- User fills in up to 9 symptom text boxes
- User selects a repertory (e.g., "Kent Repertory")
- Frontend validates that at least 1 symptom is filled

### Step 2: Clicking "Run AI Analysis"

```javascript
const handleRunAnalysis = async () => {
  console.log('🚀 Starting analysis...');
  const cleanSymptoms = symptoms.filter(s => s.trim()); // Remove empty
  
  if (!selectedRep || cleanSymptoms.length === 0) {
    return; // Cannot run
  }
  
  setAnalyzing(true); // Show loading spinner
  setStep(3); // Go to "AI Analysis" step
  
  try {
    // API call to backend
    const result = await runAnalysis({ 
      repertoryId: selectedRep._id, 
      symptoms: cleanSymptoms,
      patientName: patientNameInput || 'Patient'
    });
    
    setAnalysisResult(result); // Save results
    setStep(4); // Go to "Repertory Chart" step (show results)
  } catch (err) {
    setAnalysisError(err.message);
    setStep(2); // Go back to symptoms input
  } finally { 
    setAnalyzing(false); // Hide loading spinner
  }
};
```

**What the code does:**
1. Filters out empty symptom slots
2. Sets UI to "analyzing" state (shows spinner)
3. Calls backend API: `POST /api/analysis/run`
4. Waits for response (typically 1-3 seconds)
5. Displays results (matched rubrics + medicine chart)


---

## Backend Flow (analysisController.js)

### Step 1: API Endpoint Receives Request

```javascript
// File: server/controllers/analysisController.js
const runAnalysisHandler = async (req, res) => {
  const { repertoryId, symptoms } = req.body;
  const doctorId = req.user._id; // Current logged-in doctor
  
  // Validation
  if (!repertoryId) throw new Error('repertoryId is required');
  
  const cleanSymptoms = symptoms
    .map(s => String(s).trim().slice(0, 500)) // Max 500 chars per symptom
    .filter(Boolean) // Remove empty
    .slice(0, 9); // Max 9 symptoms
    
  if (cleanSymptoms.length === 0) {
    throw new Error('At least one symptom is required');
  }
```

**What this does:**
- Extracts `repertoryId` and `symptoms` from request
- Validates input (must have repertory + at least 1 symptom)
- Limits to 9 symptoms (prevents abuse)
- Trims whitespace and limits each symptom to 500 characters

### Step 2: Look Up Repertory Name

```javascript
  // Get repertory name from database
  const repertory = await Repertory.findById(repertoryId)
    .select('name') // Only get name field (faster)
    .lean(); // Return plain JS object (faster)
    
  if (!repertory) {
    throw new Error('Repertory not found');
  }
```

**What this does:**
- Queries MongoDB to get the repertory name
- Uses `.lean()` for performance (returns plain object, not Mongoose document)
- Example: `{ _id: '123', name: 'Kent Repertory' }`


### Step 3: Call AI Service

```javascript
  // Run the actual analysis (this is where AI happens)
  const { matchedRubrics, medicineDistribution, aiUsed, stats } = 
    await runAnalysis({
      symptoms: cleanSymptoms,
      repertoryId,
      repertoryName: repertory.name,
    });
    
  console.info('⏱️ [ANALYSIS] phase timings (ms):', stats.timingsMs);
  // Example output:
  // {
  //   candidates: 150,      // MongoDB search took 150ms
  //   matching: 800,        // AI matching took 800ms
  //   enrichmentAndScoring: 50,  // Medicine calculation took 50ms
  //   total: 1000          // Total = 1 second
  // }
```

**What this does:**
- Calls the main AI analysis function from `aiService.js`
- Returns:
  - `matchedRubrics`: Array of rubrics that match the symptoms
  - `medicineDistribution`: Ranked list of medicines with scores
  - `aiUsed`: Boolean (true if AI was used, false if keyword fallback)
  - `stats`: Performance timing data

### Step 4: Save Analysis to Database

```javascript
  // Save analysis record to database
  const analysis = await Analysis.create({
    doctorId,                // Who created this analysis
    patientName,             // Patient name
    repertoryId,             // Which repertory was used
    repertoryName: repertory.name,
    symptoms: cleanSymptoms, // Original symptoms
    matchedRubrics,          // Matched rubrics with medicines
    medicineDistribution,    // Ranked medicine list
    aiUsed,                  // Whether AI was used
    status: 'complete'
  });
```

**What this does:**
- Creates a new `Analysis` document in MongoDB
- Stores all the input (symptoms) and output (matched rubrics, medicine scores)
- Links to doctor who created it
- Can be viewed later in "Analysis History"


### Step 5: Return Results to Frontend

```javascript
  res.status(201).json({
    success: true,
    data: {
      analysisId: analysis._id,
      repertoryName: repertory.name,
      symptoms: cleanSymptoms,
      matchedRubrics,          // Array of matched rubrics
      medicineDistribution,    // Ranked medicine list
      aiUsed,                  // true/false
      stats                    // Performance timings
    }
  });
```

**Response structure:**
```json
{
  "success": true,
  "data": {
    "analysisId": "507f1f77bcf86cd799439011",
    "repertoryName": "Kent Repertory",
    "symptoms": ["Headache worse morning", "Nausea"],
    "matchedRubrics": [
      {
        "symptom": "Headache worse morning",
        "rubricId": "abc123",
        "chapter": { "en": "HEAD" },
        "rubric": { "en": "PAIN - morning - waking, on" },
        "medicines": { "Nux-v": 3, "Bry": 2, "Sulph": 1 },
        "confidence": 85
      }
    ],
    "medicineDistribution": [
      { "name": "Nux-v", "totalScore": 5, "rubricsCount": 2, "rank": 1 },
      { "name": "Bry", "totalScore": 3, "rubricsCount": 1, "rank": 2 }
    ],
    "aiUsed": true,
    "stats": { "timingsMs": { "total": 1200 } }
  }
}
```

---

## AI Service (aiService.js) - The Core Intelligence

This is where the magic happens! Let's break it down step by step.


### Phase 1: Get Candidate Rubrics (MongoDB Full-Text Search)

```javascript
// File: server/services/aiService.js
const getCandidateRubrics = async (symptoms, repertoryId) => {
  const candidateMap = new Map();
  
  // Extract search terms from each symptom
  const extractSearchTerms = (text) => {
    return text.toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, ' ')  // Keep only letters, spaces, Hindi
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 1 && !stopWords.has(w)); // Remove "the", "and", etc.
  };
  
  // For EACH symptom, search MongoDB
  const candidateGroups = await Promise.all(symptoms.map(async (symptom) => {
    const terms = extractSearchTerms(symptom);
    
    // If symptom is in Hindi, translate it
    if (/[\u0900-\u097F]/.test(symptom)) {
      terms.push(...extractSearchTerms(await translateSymptomToEnglish(symptom)));
    }
    
    const textQuery = [...new Set(terms)].join(' ');
    
    // MongoDB full-text search
    return await Rubric.find(
      { 
        repertoryId, 
        $text: { $search: textQuery } // Uses text index
      },
      { score: { $meta: 'textScore' } } // Return relevance score
    )
      .sort({ score: { $meta: 'textScore' } }) // Best matches first
      .limit(15) // Top 15 per symptom
      .lean();
  }));
  
  // Flatten and deduplicate
  candidateGroups.flat().forEach(rubric => {
    if (candidateMap.size < 75) { // Cap at 75 total candidates
      candidateMap.set(rubric._id.toString(), rubric);
    }
  });
  
  return Array.from(candidateMap.values());
};
```


**What this does:**

1. **Tokenize symptoms**: Splits "Headache worse morning" → ["headache", "worse", "morning"]
2. **Remove stop words**: Removes common words like "the", "and", "for"
3. **Hindi translation**: If symptom contains Hindi characters, translates using built-in dictionary
   - Example: "सिर दर्द" → ["head", "cephalalgia", "pain", "ache"]
4. **MongoDB text search**: Uses MongoDB's `$text` operator with text index
   - This searches the `searchText` field in each rubric
   - Returns rubrics sorted by relevance (best matches first)
5. **Limit results**: Takes top 15 rubrics per symptom (max 9 × 15 = 135 before dedup)
6. **Deduplicate**: Removes duplicate rubrics, caps at 75 total

**Why this is fast:**
- MongoDB text index is pre-built (like a book index)
- Instead of scanning all 50,000 rubrics, it looks up keywords instantly
- Typical execution: **50-150ms** for all symptoms

**Example:**

```
Input symptom: "Headache worse in morning"
Extracted terms: ["headache", "worse", "morning"]
MongoDB query: { $text: { $search: "headache worse morning" } }

Results (sorted by relevance):
1. HEAD - PAIN - morning - waking, on (score: 8.5)
2. HEAD - PAIN - morning (score: 7.2)
3. HEAD - PAIN - aggravated - morning (score: 6.8)
... (15 results total)
```


### Phase 2: AI Matching (Groq/Gemini)

Now we have 75 candidate rubrics. The AI's job is to pick the BEST match for each symptom.

```javascript
const matchWithAI = async (symptoms, rubrics, repertoryName) => {
  const model = getAnalysisModel(); // Get Groq or Gemini model
  const rubricSummaries = buildRubricSummary(rubrics); // Compact format
  
  // Build the AI prompt
  const prompt = `You are an expert homeopathic physician and repertory specialist.
Match patient symptoms to the most relevant rubrics from "${repertoryName}".

Consider: chapter, rubric name, subrubric, synonyms, aggravation, and amelioration.
Be clinically precise.

PATIENT SYMPTOMS:
${symptoms.map((s, i) => `${i + 1}. ${s}`).join('\n')}

AVAILABLE RUBRICS:
${JSON.stringify(rubricSummaries)}

Return ONLY a valid JSON object with this structure:
{ "matches": [
  {
    "symptom": "exact patient symptom text",
    "matched_rubric_id": "rubric_id or null",
    "confidence": 0-100,
    "reasoning": "brief clinical reason"
  }
] }`;

  // Call AI model
  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,           // Low = more focused, less creative
      responseMimeType: "application/json", // Force JSON response
      maxOutputTokens: 1500       // Enough for 9 matches
    }
  });
  
  // Extract JSON from response
  const responseText = result.response.candidates[0].content.parts[0].text;
  const parsed = JSON.parse(responseText);
  return parsed.matches;
};
```


**What this does:**

1. **Builds compact rubric summaries**: Instead of sending full rubric objects (with all fields), only sends:
   - Chapter (e.g., "HEAD")
   - Rubric text (e.g., "PAIN - morning - waking, on")
   - Subrubric
   - Synonyms
   - Modalities (aggravation/amelioration)
   
2. **Creates AI prompt**: Gives the AI:
   - Patient symptoms
   - Available rubrics to choose from
   - Instructions to return JSON

3. **Calls AI model**: 
   - **Groq (primary)**: Llama 3.3 70B model, responds in ~300-800ms
   - **Gemini (fallback)**: If Groq fails, uses Google Gemini (slower, 3-8s)
   - **OpenAI (backup)**: GPT-4o-mini if both fail

4. **Parses JSON response**:
```json
{
  "matches": [
    {
      "symptom": "Headache worse in morning",
      "matched_rubric_id": "507f1f77bcf86cd799439011",
      "confidence": 85,
      "reasoning": "Patient's morning aggravation matches HEAD - PAIN - morning rubric"
    },
    {
      "symptom": "Nausea",
      "matched_rubric_id": "507f1f77bcf86cd799439012",
      "confidence": 78,
      "reasoning": "Clear match with STOMACH - NAUSEA rubric"
    }
  ]
}
```

**Why Groq is primary:**
- Groq uses optimized hardware (LPUs - Language Processing Units)
- **10x faster** than Gemini for the same task
- Current Gemini API key doesn't work (needs to be replaced)
- Groq responses: 300-800ms vs Gemini: 3-8 seconds


### Phase 3: Keyword Fallback (When AI is Unavailable)

If no AI model is available (no API keys), the system uses keyword matching:

```javascript
const matchWithKeywords = (symptoms, rubrics) => {
  return symptoms.map(symptom => {
    // Extract keywords from symptom
    const terms = symptom
      .toLowerCase()
      .replace(/[^\w\s\u0900-\u097F]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 2);
    
    // Also expand Hindi terms
    const expandedTerms = new Set(terms);
    Object.entries(HINDI_TO_ENGLISH).forEach(([hindi, englishArr]) => {
      if (symptom.includes(hindi)) {
        englishArr.forEach(e => expandedTerms.add(e.toLowerCase()));
      }
    });
    
    // Find best matching rubric
    let bestMatch = null;
    let bestScore = 0;
    
    rubrics.forEach(rubric => {
      const text = rubric.searchText || '';
      const score = Array.from(expandedTerms)
        .filter(t => text.includes(t)).length;
      
      if (score > bestScore) {
        bestScore = score;
        bestMatch = rubric;
      }
    });
    
    return {
      symptom,
      matched_rubric_id: bestMatch ? bestMatch._id.toString() : null,
      confidence: bestMatch ? Math.min(bestScore * 15, 80) : 0,
      reasoning: 'Keyword match (AI not configured)'
    };
  });
};
```

**How it works:**
1. Counts how many keywords from symptom appear in each rubric's `searchText`
2. Picks rubric with highest keyword count
3. Confidence = (keyword_count × 15), capped at 80%

**Example:**
```
Symptom: "Headache worse morning"
Keywords: ["headache", "worse", "morning"]

Rubric 1: "HEAD - PAIN - morning - waking" (searchText contains all 3)
Score: 3 keywords × 15 = 45% confidence

Rubric 2: "HEAD - PAIN - evening" (searchText contains 1)
Score: 1 keyword × 15 = 15% confidence

Winner: Rubric 1 ✓
```


### Phase 4: Enrich Matches with Full Rubric Data

```javascript
// Convert AI matches to full rubric objects
const rubricMap = {};
rubrics.forEach(r => { 
  rubricMap[r._id.toString()] = r; 
});

const matchedRubrics = aiMatches
  .filter(m => m.matched_rubric_id) // Remove null matches
  .map(m => {
    const rubric = rubricMap[m.matched_rubric_id];
    if (!rubric) return null;
    
    return {
      symptom: m.symptom,
      rubricId: rubric._id,
      chapter: rubric.chapter,       // e.g., { en: "HEAD", hi: "सिर" }
      rubric: rubric.rubric,          // e.g., { en: "PAIN - morning" }
      subrubric: rubric.subrubric,    // Additional details
      modalities: rubric.modalities,  // Aggravation/amelioration
      medicines: rubric.medicines,    // { "Nux-v": 3, "Bry": 2 }
      confidence: m.confidence,       // 0-100
      reasoning: m.reasoning          // Why it matched
    };
  })
  .filter(Boolean); // Remove nulls
```

**What this does:**
- Takes AI's matched rubric IDs
- Looks up full rubric data from the candidate list
- Includes the **medicines** field (most important!)
- Each rubric has medicines with grades (1-4 scale)

**Example rubric medicines:**
```javascript
{
  "Nux-v": 3,    // Nux Vomica, grade 3 (high priority)
  "Bry": 2,      // Bryonia, grade 2 (medium)
  "Sulph": 1,    // Sulphur, grade 1 (low)
  "Puls": 4      // Pulsatilla, grade 4 (highest!)
}
```

**Grading system (Kent):**
- **Grade 4**: Medicine is HIGHLY indicated (bold in Kent)
- **Grade 3**: Strongly indicated (italic in Kent)
- **Grade 2**: Indicated (regular text)
- **Grade 1**: Weakly indicated (smallest text)


### Phase 5: Calculate Medicine Distribution (Ranking)

This is the FINAL step - computing which medicines are best for the patient.

```javascript
const computeMedicineDistribution = (matchedRubrics) => {
  const medicineMap = {};
  
  // For each matched rubric...
  matchedRubrics.forEach(rubric => {
    if (!rubric.medicines) return; // Skip if no medicines
    
    // For each medicine in that rubric...
    Object.entries(rubric.medicines).forEach(([medName, grade]) => {
      if (!medicineMap[medName]) {
        medicineMap[medName] = { 
          totalScore: 0,      // Sum of all grades
          rubricsCount: 0,    // How many rubrics it appears in
          grades: []          // Individual grades
        };
      }
      medicineMap[medName].totalScore += grade;
      medicineMap[medName].rubricsCount += 1;
      medicineMap[medName].grades.push(grade);
    });
  });
  
  // Convert to array and sort
  return Object.entries(medicineMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => 
      b.totalScore - a.totalScore ||         // Primary: Total score
      b.rubricsCount - a.rubricsCount        // Tiebreaker: Rubric count
    )
    .map((m, idx) => ({ ...m, rank: idx + 1 })); // Add rank
};
```

**Example calculation:**

Assume we matched 3 rubrics:

1. **HEAD - PAIN - morning**: { "Nux-v": 3, "Bry": 2, "Sulph": 1 }
2. **STOMACH - NAUSEA**: { "Nux-v": 4, "Puls": 2 }
3. **MIND - IRRITABILITY**: { "Nux-v": 2, "Sulph": 3 }

**Medicine scores:**
- **Nux-v**: Appears in 3 rubrics, grades [3, 4, 2] → Total = 9 ✅ **RANK 1**
- **Sulph**: Appears in 2 rubrics, grades [1, 3] → Total = 4
- **Bry**: Appears in 1 rubric, grades [2] → Total = 2
- **Puls**: Appears in 1 rubric, grades [2] → Total = 2


**Final medicine distribution:**
```javascript
[
  { 
    name: "Nux-v", 
    totalScore: 9, 
    rubricsCount: 3, 
    grades: [3, 4, 2], 
    rank: 1 
  },
  { 
    name: "Sulph", 
    totalScore: 4, 
    rubricsCount: 2, 
    grades: [1, 3], 
    rank: 2 
  },
  { 
    name: "Bry", 
    totalScore: 2, 
    rubricsCount: 1, 
    grades: [2], 
    rank: 3 
  },
  { 
    name: "Puls", 
    totalScore: 2, 
    rubricsCount: 1, 
    grades: [2], 
    rank: 4 
  }
]
```

**Sorting rules:**
1. **Primary**: Highest total score wins
2. **Tiebreaker**: If scores are equal, medicine appearing in more rubrics wins
3. **Example**: "Bry" and "Puls" both have score 2, but "Bry" is ranked 3rd (listed first)

---

## AI Models Configuration (aiConfig.js)

### Model Priority

```javascript
// File: server/config/aiConfig.js

// 1. Primary: Groq (Llama 3.3 70B) - FASTEST
const groqKey = process.env.GROQ_API_KEY;
if (groqKey) {
  const aiClient = new Groq({ apiKey: groqKey });
  groqAdapter = new UnifiedModelAdapter(aiClient, 'llama-3.3-70b-versatile', 'groq');
  defaultAdapter = groqAdapter; // Set as default
  console.log('✅ Groq AI (Llama 3.3 70B) initialized');
}

// 2. Fallback: Gemini (Google)
const geminiKey = process.env.GEMINI_API_KEY;
if (geminiKey) {
  const aiClient = new GoogleGenerativeAI(geminiKey);
  geminiAdapter = new UnifiedModelAdapter(aiClient, 'gemini-2.0-flash', 'gemini');
  console.log('✅ Google Gemini initialized');
}

// 3. Backup: OpenAI (GPT-4o-mini)
const openaiKey = process.env.OPENAI_API_KEY;
if (openaiKey) {
  const aiClient = new OpenAI({ apiKey: openaiKey });
  openaiAdapter = new UnifiedModelAdapter(aiClient, 'gpt-4o-mini', 'openai');
  console.log('✅ OpenAI (GPT-4o-mini) initialized');
}
```


**Model comparison:**

| Model | Provider | Speed | Cost | Quality |
|-------|----------|-------|------|---------|
| **Llama 3.3 70B** | Groq | ⚡ 300-800ms | 💰 Free tier | ⭐⭐⭐⭐ Excellent |
| **Gemini 2.0 Flash** | Google | 🐌 3-8 seconds | 💰 Free tier | ⭐⭐⭐⭐⭐ Best |
| **GPT-4o-mini** | OpenAI | ⚡ 1-2 seconds | 💰💰 Paid | ⭐⭐⭐⭐ Excellent |

**Why Groq is primary:**
- **10x faster** than Gemini
- Custom LPU (Language Processing Unit) hardware
- Same quality for this specific task
- Current Gemini API key doesn't work (needs replacement)

### Unified Model Adapter

All models use the same interface:

```javascript
class UnifiedModelAdapter {
  async generateContent({ contents, generationConfig }) {
    if (this.provider === 'groq') {
      // Convert Gemini format to Groq format
      const messages = contents.map(c => ({
        role: c.role === 'model' ? 'assistant' : 'user',
        content: c.parts.map(p => p.text).join('\n')
      }));
      
      // Call Groq API
      const completion = await this.client.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages,
        temperature: 0.3,
        response_format: { type: 'json_object' }
      });
      
      return { response: { /* formatted response */ } };
    }
    // ... similar for Gemini and OpenAI
  }
}
```

This allows switching between models without changing analysis code!


---

## Database Queries & Indexes

### MongoDB Collections

**1. Rubrics Collection**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  repertoryId: ObjectId("507f1f77bcf86cd799439010"),
  chapter: { en: "HEAD", hi: "सिर" },
  rubric: { en: "PAIN - morning - waking, on", hi: "दर्द - सुबह - जागने पर" },
  subrubric: { en: "", hi: "" },
  medicines: {
    "Nux-v": 3,
    "Bry": 2,
    "Lach": 2,
    "Sulph": 1
  },
  searchText: "head pain morning waking cephalalgia...",
  synonyms: { en: ["cephalalgia", "headache"], hi: ["सिरदर्द"] },
  modalities: {
    aggravation: ["morning", "waking"],
    amelioration: ["rest", "quiet"]
  }
}
```

**2. Analysis Collection**
```javascript
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  doctorId: ObjectId("507f1f77bcf86cd799439009"),
  patientName: "Amit Kumar",
  repertoryId: ObjectId("507f1f77bcf86cd799439010"),
  repertoryName: "Kent Repertory",
  symptoms: ["Headache worse morning", "Nausea"],
  matchedRubrics: [ /* array of matched rubrics */ ],
  medicineDistribution: [ /* ranked medicine list */ ],
  aiUsed: true,
  status: "complete",
  createdAt: ISODate("2025-08-05T10:30:00Z")
}
```

### Critical Indexes

**Text index on Rubrics (for fast symptom search):**
```javascript
db.rubrics.createIndex({ 
  searchText: "text",
  "chapter.en": "text",
  "rubric.en": "text",
  "subrubric.en": "text"
});
```

This index enables the fast `$text` search:
```javascript
db.rubrics.find({ 
  $text: { $search: "headache morning" } 
}, { 
  score: { $meta: "textScore" } 
}).sort({ 
  score: { $meta: "textScore" } 
});
```

**Compound index for repertory filtering:**
```javascript
db.rubrics.createIndex({ 
  repertoryId: 1, 
  _id: 1 
});
```


---

## Performance Optimization

### Timing Breakdown (Typical Analysis)

```
Total: 1,200ms (1.2 seconds)
├─ Candidate Search (MongoDB):     150ms  (12.5%)
├─ AI Matching (Groq):             800ms  (66.7%)
└─ Medicine Calculation:            50ms  ( 4.2%)
   Extra (network, etc.):          200ms  (16.6%)
```

### Optimization Techniques

**1. Pre-filtering with MongoDB**
- Instead of sending 50,000 rubrics to AI, send only 75 candidates
- Reduces AI prompt size from ~10MB to ~50KB
- **10x faster AI responses**

**2. Lean queries**
```javascript
await Rubric.find(query).lean(); // Returns plain objects
// vs
await Rubric.find(query); // Returns Mongoose documents (slower)
```
**Benefit**: 30-50% faster queries

**3. Parallel processing**
```javascript
// BAD: Sequential (slow)
for (const symptom of symptoms) {
  const rubrics = await searchRubrics(symptom);
}

// GOOD: Parallel (fast)
const candidateGroups = await Promise.all(
  symptoms.map(symptom => searchRubrics(symptom))
);
```
**Benefit**: 9 symptoms searched in parallel = 9x faster

**4. Deduplication**
```javascript
const candidateMap = new Map();
rubrics.forEach(r => {
  if (!candidateMap.has(r._id.toString())) {
    candidateMap.set(r._id.toString(), r);
  }
});
```
**Benefit**: Prevents AI from seeing duplicate rubrics

**5. Capping results**
```javascript
.limit(15)  // Per symptom (MongoDB)
if (candidateMap.size < 75) // Total candidates
```
**Benefit**: Keeps AI prompt size manageable, ensures fast response


### Memory Management

**Problem**: Large PDF uploads for repertory creation could crash server

**Solution**: 
```javascript
// Check file size before AI processing
const stats = fs.statSync(filePath);
const sizeInMB = stats.size / (1024 * 1024);

if (sizeInMB > 15) {
  console.warn(`PDF is large (${sizeInMB.toFixed(2)} MB). Skipping AI extraction.`);
  return {}; // Fall back to manual mapping
}
```

**Middleware**: Memory guard
```javascript
// server/middleware/memoryGuard.js
const memoryGuard = (req, res, next) => {
  const memUsage = process.memoryUsage();
  const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
  
  if (heapUsedMB > 450) { // 450MB threshold
    return res.status(503).json({
      error: 'Server memory high, try again later'
    });
  }
  next();
};
```

---

## Hindi Translation Support

### Built-in Dictionary

Instead of calling translation APIs (slow, costs money), we use a built-in dictionary:

```javascript
const HINDI_TO_ENGLISH = {
  // Body parts
  'सिर': ['head', 'cephalalgia'],
  'पेट': ['abdomen', 'stomach', 'belly'],
  'आंख': ['eye', 'eyes', 'vision'],
  
  // Symptoms
  'दर्द': ['pain', 'ache', 'aching'],
  'बुखार': ['fever', 'pyrexia'],
  'खांसी': ['cough', 'tussis'],
  
  // Modalities
  'ठंडा': ['cold', 'chilly'],
  'गर्म': ['hot', 'warm', 'heat'],
  'रात': ['night', 'evening'],
  
  // ... 50+ entries
};
```

**Usage:**
```javascript
const translateSymptomToEnglish = async (symptom) => {
  const englishTerms = translateHindiTerms(symptom);
  return englishTerms.join(' ');
};

// Example:
translateSymptomToEnglish("सिर में दर्द")
// Returns: "head cephalalgia pain ache aching"
```


**Benefits:**
- ⚡ **Instant**: No API calls
- 💰 **Free**: No translation costs
- 🔒 **Private**: No data sent to external services
- 📴 **Offline**: Works without internet

---

## Error Handling & Fallbacks

### Multi-layer Fallback System

```
┌─────────────────────────────────────────┐
│ 1. Try Groq AI (Primary)                │
│    ↓ If fails...                        │
├─────────────────────────────────────────┤
│ 2. Try Gemini AI (Fallback)             │
│    ↓ If fails...                        │
├─────────────────────────────────────────┤
│ 3. Try OpenAI (Backup)                  │
│    ↓ If fails...                        │
├─────────────────────────────────────────┤
│ 4. Use Keyword Matching (Always works)  │
└─────────────────────────────────────────┘
```

**Code:**
```javascript
try {
  console.log('🤖 Starting AI matching with Groq...');
  aiMatches = await matchWithAI(symptoms, rubrics, repertoryName);
  aiUsed = true;
} catch (err) {
  console.error('AI error, falling back to keyword logic:', err.message);
  aiMatches = matchWithKeywords(symptoms, rubrics);
  aiUsed = false;
}
```

### Timeout Protection

```javascript
const aiCall = model.generateContent({ /* ... */ });

// Add 15-second timeout
const timeout = new Promise((_, reject) =>
  setTimeout(() => reject(new Error('AI timeout after 15s')), 15000)
);

const result = await Promise.race([aiCall, timeout]);
```

**Why 15 seconds?**
- Groq typically responds in <1 second
- Gemini can take 3-8 seconds
- 15s is generous safety margin
- Prevents hanging requests


### Retry Logic (Frontend)

```javascript
// File: src/components/RubricAnalyzer.jsx
useEffect(() => {
  const loadRepertoriesWithRetry = async (retryCount = 0) => {
    const maxRetries = 3;
    
    try {
      const data = await getRepertories({ type: 'Repertory' });
      setRepertories(data);
      setRepError('');
      console.log(`✅ Loaded ${data.length} repertories`);
    } catch (error) {
      const isNetworkError = !error.response;
      
      // Retry on network errors
      if (retryCount < maxRetries && isNetworkError) {
        console.log(`🔁 Retrying in ${(retryCount + 1) * 2} seconds...`);
        setTimeout(() => loadRepertoriesWithRetry(retryCount + 1), 
                   (retryCount + 1) * 2000);
        return;
      }
      
      // Final failure
      setRepError('Could not load repertories. Check server connection.');
      setLoadingReps(false);
    }
  };
  
  loadRepertoriesWithRetry();
}, []);
```

**Retry schedule:**
- Attempt 1: Immediate
- Attempt 2: After 2 seconds
- Attempt 3: After 4 seconds  
- Attempt 4: After 6 seconds
- Give up: Show error

---

## Complete Flow Diagram

```
┌────────────────────────────────────────────────────────────────┐
│                          FRONTEND                              │
│                                                                │
│  1. User enters symptoms: ["Headache worse morning", "Nausea"]│
│  2. Clicks "Run AI Analysis" button                           │
│  3. Shows loading spinner                                     │
└────────────────────┬───────────────────────────────────────────┘
                     │ HTTP POST
                     │ /api/analysis/run
                     ▼
┌────────────────────────────────────────────────────────────────┐
│                      BACKEND API                               │
│                                                                │
│  4. Validate inputs (symptoms, repertoryId)                   │
│  5. Look up repertory name from DB                            │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────────────────┐
│                     AI SERVICE                                 │
│                                                                │
│  6. Get candidate rubrics (MongoDB $text search)              │
│     - 75 candidates in ~150ms                                 │
│                                                                │
│  7. Match with AI (Groq/Gemini)                               │
│     - Send symptoms + candidates to AI                        │
│     - AI returns matched rubrics in ~800ms                    │
│                                                                │
│  8. Enrich with full rubric data                              │
│     - Add medicines, modalities, etc.                         │
│                                                                │
│  9. Calculate medicine distribution                           │
│     - Sum grades, count rubrics, sort by score                │
└────────────────────┬───────────────────────────────────────────┘
                     │
                     ▼

┌────────────────────────────────────────────────────────────────┐
│                    BACKEND API (continued)                     │
│                                                                │
│  10. Save analysis to MongoDB                                 │
│      - Store symptoms, matches, medicine scores               │
│                                                                │
│  11. Return JSON response                                     │
└────────────────────┬───────────────────────────────────────────┘
                     │ HTTP 201 Created
                     │ JSON response
                     ▼
┌────────────────────────────────────────────────────────────────┐
│                         FRONTEND                               │
│                                                                │
│  12. Receive results                                          │
│  13. Display repertory chart (matched rubrics)                │
│  14. Display medicine distribution (ranked medicines)         │
│  15. Doctor can create prescription from top medicines        │
└────────────────────────────────────────────────────────────────┘
```

---

## Example: Complete Analysis Run

### Input
```json
{
  "repertoryId": "507f1f77bcf86cd799439010",
  "symptoms": [
    "Headache worse in the morning on waking",
    "Nausea with headache",
    "Irritability and anger"
  ],
  "patientName": "Amit Kumar"
}
```

### Step-by-Step Processing

**1. MongoDB Candidate Search (150ms)**
```
Symptom 1: "Headache worse in the morning on waking"
Keywords: [headache, worse, morning, waking]
Found 15 candidates:
  - HEAD - PAIN - morning - waking, on (score: 8.5)
  - HEAD - PAIN - morning (score: 7.2)
  - HEAD - PAIN - aggravated - morning (score: 6.8)
  - ... (12 more)

Symptom 2: "Nausea with headache"
Keywords: [nausea, headache]
Found 15 candidates:
  - STOMACH - NAUSEA - headache, with (score: 9.2)
  - STOMACH - NAUSEA (score: 6.5)
  - ... (13 more)

Symptom 3: "Irritability and anger"
Keywords: [irritability, anger]
Found 15 candidates:
  - MIND - IRRITABILITY (score: 8.0)
  - MIND - ANGER (score: 7.8)
  - ... (13 more)

Total: 45 candidates, 38 unique after dedup
```


**2. AI Matching (800ms)**

AI Prompt:
```
You are an expert homeopathic physician and repertory specialist.
Match patient symptoms to the most relevant rubrics from "Kent Repertory".

PATIENT SYMPTOMS:
1. Headache worse in the morning on waking
2. Nausea with headache
3. Irritability and anger

AVAILABLE RUBRICS:
[38 rubric summaries with chapter, rubric text, synonyms, modalities]

Return JSON with matches...
```

AI Response (Groq Llama 3.3):
```json
{
  "matches": [
    {
      "symptom": "Headache worse in the morning on waking",
      "matched_rubric_id": "507f1f77bcf86cd799439011",
      "confidence": 92,
      "reasoning": "Exact match - morning aggravation with waking qualifier"
    },
    {
      "symptom": "Nausea with headache",
      "matched_rubric_id": "507f1f77bcf86cd799439012",
      "confidence": 88,
      "reasoning": "Direct match with concomitant symptom"
    },
    {
      "symptom": "Irritability and anger",
      "matched_rubric_id": "507f1f77bcf86cd799439013",
      "confidence": 85,
      "reasoning": "Mental symptom clearly maps to MIND - IRRITABILITY"
    }
  ]
}
```

**3. Enrich Matches (10ms)**

Look up full rubric data:
```javascript
Rubric 1: HEAD - PAIN - morning - waking, on
  Medicines: { "Nux-v": 3, "Bry": 2, "Lach": 2, "Sulph": 1 }

Rubric 2: STOMACH - NAUSEA - headache, with
  Medicines: { "Nux-v": 4, "Puls": 2, "Sep": 1 }

Rubric 3: MIND - IRRITABILITY
  Medicines: { "Nux-v": 4, "Sulph": 3, "Lyc": 2, "Puls": 2 }
```


**4. Calculate Medicine Distribution (40ms)**

Medicine score calculation:
```
Nux-v:
  - Rubric 1: grade 3
  - Rubric 2: grade 4
  - Rubric 3: grade 4
  Total: 11, appears in 3 rubrics → RANK 1 🏆

Sulph:
  - Rubric 1: grade 1
  - Rubric 3: grade 3
  Total: 4, appears in 2 rubrics → RANK 2

Puls:
  - Rubric 2: grade 2
  - Rubric 3: grade 2
  Total: 4, appears in 2 rubrics → RANK 3 (same score as Sulph)

Bry:
  - Rubric 1: grade 2
  Total: 2, appears in 1 rubric → RANK 4

Lach:
  - Rubric 1: grade 2
  Total: 2, appears in 1 rubric → RANK 5

Lyc:
  - Rubric 3: grade 2
  Total: 2, appears in 1 rubric → RANK 6

Sep:
  - Rubric 2: grade 1
  Total: 1, appears in 1 rubric → RANK 7
```

### Final Output

```json
{
  "success": true,
  "data": {
    "analysisId": "507f1f77bcf86cd799439014",
    "repertoryName": "Kent Repertory",
    "symptoms": [
      "Headache worse in the morning on waking",
      "Nausea with headache",
      "Irritability and anger"
    ],
    "matchedRubrics": [
      {
        "symptom": "Headache worse in the morning on waking",
        "rubricId": "507f1f77bcf86cd799439011",
        "chapter": { "en": "HEAD", "hi": "सिर" },
        "rubric": { "en": "PAIN - morning - waking, on" },
        "medicines": { "Nux-v": 3, "Bry": 2, "Lach": 2, "Sulph": 1 },
        "confidence": 92,
        "reasoning": "Exact match - morning aggravation with waking qualifier"
      }
      // ... 2 more rubrics
    ],
    "medicineDistribution": [
      { "name": "Nux-v", "totalScore": 11, "rubricsCount": 3, "rank": 1 },
      { "name": "Sulph", "totalScore": 4, "rubricsCount": 2, "rank": 2 },
      { "name": "Puls", "totalScore": 4, "rubricsCount": 2, "rank": 3 }
      // ... 4 more medicines
    ],
    "aiUsed": true,
    "stats": {
      "timingsMs": {
        "candidates": 150,
        "matching": 800,
        "enrichmentAndScoring": 50,
        "total": 1000
      }
    }
  }
}
```


**Frontend Display:**

The doctor sees:

**Repertory Chart:**
```
┌─────────────────────────────────────────────────────────────┐
│ Matched Rubrics (3)                                         │
├─────────────────────────────────────────────────────────────┤
│ 1. HEAD - PAIN - morning - waking, on                       │
│    Confidence: 92%                                          │
│    Medicines: Nux-v (3), Bry (2), Lach (2), Sulph (1)      │
│                                                             │
│ 2. STOMACH - NAUSEA - headache, with                       │
│    Confidence: 88%                                          │
│    Medicines: Nux-v (4), Puls (2), Sep (1)                 │
│                                                             │
│ 3. MIND - IRRITABILITY                                     │
│    Confidence: 85%                                          │
│    Medicines: Nux-v (4), Sulph (3), Lyc (2), Puls (2)      │
└─────────────────────────────────────────────────────────────┘
```

**Medicine Distribution Chart:**
```
┌──────┬─────────────┬───────┬─────────┐
│ Rank │ Medicine    │ Score │ Rubrics │
├──────┼─────────────┼───────┼─────────┤
│  1   │ 🏆 Nux-v    │  11   │    3    │
│  2   │    Sulph    │   4   │    2    │
│  3   │    Puls     │   4   │    2    │
│  4   │    Bry      │   2   │    1    │
│  5   │    Lach     │   2   │    1    │
│  6   │    Lyc      │   2   │    1    │
│  7   │    Sep      │   1   │    1    │
└──────┴─────────────┴───────┴─────────┘
```

Doctor's decision: **Prescribe Nux Vomica** (highest score, appears in all 3 rubrics)

---

## Key Takeaways

### What Makes This System Fast?

1. **MongoDB Text Index**: Pre-indexed search (50-150ms vs 5-10 seconds scanning)
2. **Pre-filtering**: 75 candidates instead of 50,000 rubrics to AI
3. **Groq LPU**: Custom hardware for LLMs (10x faster than Gemini)
4. **Parallel Processing**: All symptoms searched simultaneously
5. **Lean Queries**: Plain objects instead of Mongoose documents


### What Makes This System Accurate?

1. **AI Understanding**: LLMs understand context ("worse in morning" vs "better in morning")
2. **Synonym Matching**: AI knows "cephalalgia" = "headache"
3. **Clinical Reasoning**: AI considers modalities (aggravation/amelioration)
4. **Multi-rubric Validation**: Medicines appearing in multiple rubrics rank higher
5. **Grade Weighting**: Grade 4 medicines prioritized over grade 1

### What Makes This System Reliable?

1. **Multi-layer Fallbacks**: Groq → Gemini → OpenAI → Keywords
2. **Timeout Protection**: 15-second limit prevents hanging
3. **Retry Logic**: 3 automatic retries on network errors
4. **Memory Guards**: Prevents server crashes on large files
5. **Error Logging**: Detailed logs for debugging

### What Makes This System Scalable?

1. **Efficient Queries**: Indexed lookups instead of full scans
2. **Deduplication**: Prevents redundant AI processing
3. **Capped Results**: Limits memory usage (75 candidates max)
4. **Async Operations**: Non-blocking I/O throughout
5. **Stateless API**: Can handle multiple concurrent requests

---

## Future Improvements

### Potential Optimizations

1. **Caching**: Cache frequent symptom-rubric matches
2. **Batch Processing**: Analyze multiple patients in one AI call
3. **Vector Search**: Use embeddings for semantic search
4. **Result Ranking**: Train model on doctor feedback
5. **Streaming**: Stream AI responses as they're generated

### Feature Enhancements

1. **Confidence Threshold**: Auto-flag low-confidence matches
2. **Alternative Suggestions**: Show 2nd/3rd best rubric matches
3. **Rubric Explanations**: AI explains why each rubric matched
4. **Patient History**: Consider previous prescriptions
5. **Contraindications**: Warn about medicine interactions

---

## Glossary

**Repertory**: A homeopathic index book that lists symptoms and their corresponding medicines
**Rubric**: A standardized symptom description in a repertory (e.g., "HEAD - PAIN - morning")
**Medicine/Remedy**: Homeopathic treatment (e.g., Nux Vomica, Bryonia, Sulphur)
**Grade**: Importance rating (1-4) of a medicine for a specific rubric
**Modality**: Factors that make symptoms better or worse (e.g., cold, heat, rest)
**Repertorization**: Process of matching patient symptoms to rubrics and ranking medicines
**Materia Medica**: Detailed descriptions of homeopathic medicines and their effects

---

**Document created**: August 5, 2026  
**System version**: HomeoAI v1.0  
**AI Models**: Groq (Llama 3.3 70B), Gemini 2.0 Flash, OpenAI GPT-4o-mini
