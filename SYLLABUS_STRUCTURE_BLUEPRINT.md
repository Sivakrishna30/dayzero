# DayZero Syllabus Structure Blueprint

## Overview
This document defines the exact configuration pattern for syllabus data in DayZero. All syllabus data follows this structure to ensure consistency across the app.

---

## Top-Level Structure

```javascript
export const syllabusData = {
  group1: { ... },  // Combined Civil Services – I
  group2: { ... },  // Combined Civil Services – II / IIA
  group4: [ ... ]   // Combined Civil Services – IV
};
```

---

## Exam Group Configurations

### 1. Group 1 (group1) - Object Structure

```javascript
group1: {
  prelims: [ ... ],  // Array of units
  mains: { ... }     // Object containing papers
}
```

**Key Points:**
- `prelims`: Array of unit objects (single-stage exam structure)
- `mains`: Object with detailed paper structure (multi-stage exam)

---

### 2. Group 2 (group2) - Object Structure

```javascript
group2: {
  prelims: [ ... ],  // Array of units (Part A, B, C)
  mains: [ ... ]     // Array of paper objects
}
```

**Key Points:**
- `prelims`: Array with Part A (General Studies), Part B (Aptitude), Part C (Language)
- `mains`: Array of paper objects (Descriptive + Objective papers)
- Supports both Group 2 (Interview) and Group 2A (Non-Interview)

---

### 3. Group 4 (group4) - Array Structure

```javascript
group4: [
  { ... },  // Unit 1
  { ... },  // Unit 2
  ...
]
```

**Key Points:**
- Direct array (no prelims/mains separation)
- Single-stage exam with all units at same level
- Includes Aptitude and Tamil sections

---

## Unit Object Structure

### Basic Unit Template

```javascript
{
  id: 'unique_unit_id',           // REQUIRED: Unique identifier
  title: 'Unit Title',            // REQUIRED: Display name
  weightage: '10 Questions',      // REQUIRED: For prelims
  topics: [                       // REQUIRED: Array of topic strings
    'Topic 1',
    'Topic 2',
    ...
  ]
}
```

### Unit with Part Classification (Group 2 Prelims)

```javascript
{
  id: 'g2p_partA_unit1',
  part: 'Part A',                 // REQUIRED: Part classification
  lang: 'english',                // OPTIONAL: For Part C language-specific units
  title: 'Unit I: General Science',
  weightage: '5 Questions',
  topics: [ ... ]
}
```

**Part Values:**
- `Part A` - General Studies
- `Part B` - Aptitude & Reasoning
- `Part C` - Language (English/Tamil)

---

## Mains Paper Structure (Group 1 & 2)

### Paper Object Template

```javascript
{
  id: 'g1m_p1',                   // REQUIRED: Unique paper ID
  title: 'Paper I: Tamil Eligibility Test',
  marks: '100 Marks',             // REQUIRED: Total marks
  qualifyingOnly: true,           // OPTIONAL: If paper is qualifying only
  minimumQualifyingMarks: 40,     // OPTIONAL: Min marks to qualify
  marksCountedForFinalRanking: false, // OPTIONAL: If marks count for ranking
  examType: 'Descriptive',        // OPTIONAL: Descriptive/Objective
  standard: '10th Standard',      // OPTIONAL: Required qualification
  duration: '3 Hours',            // OPTIONAL: Exam duration
  topics: [ ... ]                 // REQUIRED: Array of topics OR units
}
```

### Paper with Units (Group 1 Mains)

```javascript
{
  id: 'g1m_p2',
  title: 'Paper II: General Studies I',
  marks: '250 Marks',
  units: [                        // Array of unit objects
    {
      id: 'g1m_p2_unit1',
      title: 'Unit I: Modern History',
      weightage: '100 Marks',
      topics: [ ... ]
    }
  ]
}
```

---

## Complete Examples

### Example 1: Group 1 Prelims Unit

```javascript
{
  id: 'g1p_unit4',
  title: 'Unit IV: Indian Polity',
  weightage: '40 Questions',
  topics: [
    'Constitution of India',
    'Preamble to the Constitution',
    'Salient features of the Constitution',
    // ... more topics
  ]
}
```

### Example 2: Group 2 Prelims Part C (Language-Specific)

```javascript
{
  id: 'g2p_partC_english_unit1',
  part: 'Part C',
  lang: 'english',  // Critical for language filtering
  title: 'Unit I: Grammar',
  weightage: '25 Questions',
  topics: [
    'Parts of speech, Concord, Tense',
    // ... more topics
  ]
}
```

### Example 3: Group 4 Unit (Direct Array)

```javascript
{
  id: 'g4_unit1',
  title: 'Unit I: General Science',
  weightage: '5 Questions',
  topics: [
    'Nature of Universe',
    // ... more topics
  ]
}
```

### Example 4: Group 1 Mains Paper with Units

```javascript
{
  id: 'g1m_p4',
  title: 'Paper IV: General Studies III',
  marks: '250 Marks',
  units: [
    {
      id: 'g1m_p4_unit1',
      title: 'Unit I: General Geography',
      weightage: '75 Marks',
      topics: [
        'Earth and Universe: Solar System',
        // ... more topics
      ]
    },
    {
      id: 'g1m_p4_unit2',
      title: 'Unit II: Environment',
      weightage: '75 Marks',
      topics: [ ... ]
    }
  ]
}
```

---

## Field Reference

### Required Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier (format: `gXp_unitY` or `gXm_pY`) |
| `title` | string | Display title for the unit/paper |
| `topics` | array | Array of topic strings |

### Optional Fields

| Field | Type | Description | Used In |
|-------|------|-------------|---------|
| `weightage` | string | Question count or marks (e.g., "40 Questions") | Prelims units |
| `marks` | string | Total marks for paper (e.g., "250 Marks") | Mains papers |
| `part` | string | Part classification (Part A/B/C) | Group 2 prelims |
| `lang` | string | Language filter ('english' or 'tamil') | Part C units |
| `qualifyingOnly` | boolean | If paper is qualifying only | Mains papers |
| `minimumQualifyingMarks` | number | Minimum marks to qualify | Qualifying papers |
| `marksCountedForFinalRanking` | boolean | If marks count for final ranking | Mains papers |
| `examType` | string | 'Descriptive' or 'Objective' | Mains papers |
| `standard` | string | Required education level | Mains papers |
| `duration` | string | Exam duration | Mains papers |
| `units` | array | Array of unit objects | Mains papers |
| `code` | string | Paper code (e.g., '498') | Group 1 mains |
| `interview` | object | Interview details | Group 1 mains |
| `totalWrittenMarks` | number | Total written exam marks | Group 1 mains |
| `totalMarksIncludingInterview` | number | Total including interview | Group 1 mains |

---

## ID Naming Convention

### Prelims Units
```
g1p_unit1      - Group 1, Prelims, Unit 1
g2p_partA_unit1 - Group 2, Prelims, Part A, Unit 1
g2p_partC_english_unit1 - Group 2, Prelims, Part C, English, Unit 1
g4_unit1       - Group 4, Unit 1
```

### Mains Papers
```
g1m_p1         - Group 1, Mains, Paper 1
g1m_p2_unit1   - Group 1, Mains, Paper 2, Unit 1
g2m_p1         - Group 2, Mains, Paper 1
g2m_p2         - Group 2, Mains, Paper 2
```

---

## Data Organization Rules

### 1. Group 1 Structure
```
group1: {
  prelims: [        // Single array of units
    { id, title, weightage, topics }
  ],
  mains: {           // Object with papers array
    papers: [
      { id, title, marks, topics/units }
    ]
  }
}
```

### 2. Group 2 Structure
```
group2: {
  prelims: [        // Array with Part A, B, C units
    { id, part, title, weightage, topics }
  ],
  mains: [           // Array of paper objects
    { id, title, marks, topics/units }
  ]
}
```

### 3. Group 4 Structure
```
group4: [            // Direct array of units
  { id, title, weightage, topics }
]
```

---

## Topic Guidelines

### Topic String Format
- **Single topic**: `'Constitution of India'`
- **Multiple related topics**: Can be comma-separated in single string
- **Sub-topics**: Use separate array elements for better tracking

### Example:
```javascript
topics: [
  'Simplification',
  'Percentage',
  'Highest Common Factor (HCF)',
  'Lowest Common Multiple (LCM)'
]
```

---

## Special Configurations

### Language Filtering (Group 2 Part C)
```javascript
{
  id: 'g2p_partC_english_unit1',
  part: 'Part C',
  lang: 'english',  // Enables language toggle in app
  title: 'Unit I: Grammar',
  topics: [ ... ]
}
```

**App Behavior:**
- When `lang: 'english'` is present, app shows language toggle (Tamil/English)
- Only units matching selected language are displayed
- Part A and B are always shown (no language filter)

### Qualifying Papers (Group 1 Paper I)
```javascript
{
  id: 'g1m_p1',
  title: 'Paper I: Tamil Eligibility Test',
  marks: '100 Marks',
  qualifyingOnly: true,              // Must pass but marks don't count
  minimumQualifyingMarks: 40,        // Minimum 40% required
  marksCountedForFinalRanking: false // Excluded from final ranking
}
```

---

## Usage in App.js

### Accessing Syllabus Data

```javascript
// Get all prelims units for selected exam
const prelimsUnits = syllabusData[selectedExam]?.prelims || 
                     syllabusData[selectedExam]; // Group 4

// Get specific unit
const unit = prelimsUnits.find(u => u.id === 'g1p_unit4');

// Get all topics for progress tracking
const allTopics = prelimsUnits.flatMap(unit => unit.topics);

// Filter by language (Group 2 Part C)
const englishUnits = prelimsUnits.filter(
  unit => unit.part === 'Part C' && unit.lang === 'english'
);
```

---

## Adding New Syllabus Data

### Step 1: Choose Correct Structure
- Group 1: Object with `prelims` array + `mains` object
- Group 2: Object with `prelims` array + `mains` array
- Group 4: Direct array

### Step 2: Create Units with Proper IDs
Follow naming convention:
- Prelims: `gXp_unitY` or `gXp_partX_unitY`
- Mains: `gXm_pY` or `gXm_pY_unitZ`

### Step 3: Add Required Fields
- `id`: Unique identifier
- `title`: Display name
- `topics`: Array of topic strings
- `weightage`: For prelims units
- `marks`: For mains papers

### Step 4: Add Optional Fields
- `part`: For Group 2 classification
- `lang`: For language-specific content
- Paper-specific fields for mains

### Step 5: Test in App
```javascript
// Verify data loads correctly
console.log(syllabusData.group1.prelims[0].title);
console.log(syllabusData.group2.prelims.filter(u => u.part === 'Part C'));
```

---

## Validation Checklist

- [ ] All units have unique `id`
- [ ] All units have `title` and `topics`
- [ ] Prelims units have `weightage`
- [ ] Mains papers have `marks`
- [ ] Group 2 Part C units have `lang` field
- [ ] IDs follow naming convention
- [ ] No duplicate topics within a unit
- [ ] Nested structure matches exam pattern

---

## Common Mistakes to Avoid

1. **Missing closing brackets**: Always verify array/object closure
2. **Wrong structure for Group 4**: Must be array, not object
3. **Missing `part` field**: Required for Group 2 Part C filtering
4. **Duplicate IDs**: Each unit/paper must have unique ID
5. **Incorrect nesting**: Group 1 mains uses `papers` array inside object

---

## File Location
- **Current file**: `syllabus.js`
- **Export name**: `syllabusData`
- **Import in App.js**: `import { syllabusData } from './syllabus';`

---

## Next Steps for RAG Integration

When implementing RAG pipeline:

1. **Use `id` as metadata key** for vector DB
2. **Use `topics` array** for chunking and embedding
3. **Use `part` and `lang`** for filtering search results
4. **Use `weightage`** for ranking relevance
5. **Store full unit object** as metadata in vector DB

This ensures exact mapping between syllabus topics and study materials.