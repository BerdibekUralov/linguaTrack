// ─── FRAMEWORK & LEVEL CONFIG ─────────────────────────────────────────────────

export type Framework = "IELTS" | "CEFR" | "TOEFL" | "CAMBRIDGE" | "DUOLINGO" | "GENERAL";

export const FRAMEWORK_LABELS: Record<Framework, string> = {
  IELTS:     "IELTS",
  CEFR:      "CEFR",
  TOEFL:     "TOEFL",
  CAMBRIDGE: "Cambridge",
  DUOLINGO:  "Duolingo English Test",
  GENERAL:   "General / Course",
};

export const FRAMEWORK_LEVELS: Record<Framework, { value: string; label: string }[]> = {
  IELTS: [
    { value: "4.0", label: "Band 4.0" }, { value: "4.5", label: "Band 4.5" },
    { value: "5.0", label: "Band 5.0" }, { value: "5.5", label: "Band 5.5" },
    { value: "6.0", label: "Band 6.0" }, { value: "6.5", label: "Band 6.5" },
    { value: "7.0", label: "Band 7.0" }, { value: "7.5", label: "Band 7.5" },
    { value: "8.0", label: "Band 8.0" }, { value: "8.5", label: "Band 8.5" },
    { value: "9.0", label: "Band 9.0" },
  ],
  CEFR: [
    { value: "A1", label: "A1 — Beginner" },
    { value: "A2", label: "A2 — Elementary" },
    { value: "B1", label: "B1 — Intermediate" },
    { value: "B2", label: "B2 — Upper-Intermediate" },
    { value: "C1", label: "C1 — Advanced" },
    { value: "C2", label: "C2 — Proficiency" },
  ],
  TOEFL: [
    { value: "0-31",   label: "0–31 (Below B1)" },
    { value: "32-42",  label: "32–42 (B1)" },
    { value: "43-51",  label: "43–51 (B1+)" },
    { value: "52-59",  label: "52–59 (B2)" },
    { value: "60-78",  label: "60–78 (B2+)" },
    { value: "79-93",  label: "79–93 (C1)" },
    { value: "94-114", label: "94–114 (C1+)" },
    { value: "115-120",label: "115–120 (C2)" },
  ],
  CAMBRIDGE: [
    { value: "A2_KEY",  label: "A2 Key (KET)" },
    { value: "B1_PET",  label: "B1 Preliminary (PET)" },
    { value: "B2_FCE",  label: "B2 First (FCE)" },
    { value: "C1_CAE",  label: "C1 Advanced (CAE)" },
    { value: "C2_CPE",  label: "C2 Proficiency (CPE)" },
  ],
  DUOLINGO: [
    { value: "10-59",  label: "10–59 (A1-A2)" },
    { value: "60-85",  label: "60–85 (B1)" },
    { value: "86-105", label: "86–105 (B2)" },
    { value: "106-120",label: "106–120 (C1)" },
    { value: "121-160",label: "121–160 (C2)" },
  ],
  GENERAL: [
    { value: "Beginner",          label: "Beginner" },
    { value: "Elementary",        label: "Elementary" },
    { value: "Pre-Intermediate",  label: "Pre-Intermediate" },
    { value: "Intermediate",      label: "Intermediate" },
    { value: "Upper-Intermediate",label: "Upper-Intermediate" },
    { value: "Advanced",          label: "Advanced" },
  ],
};

// Skills available per framework
export const FRAMEWORK_SKILLS: Record<Framework, string[]> = {
  IELTS:     ["WRITING", "SPEAKING", "READING", "LISTENING", "VOCABULARY"],
  CEFR:      ["WRITING", "SPEAKING", "READING", "LISTENING", "GRAMMAR", "VOCABULARY", "MIXED"],
  TOEFL:     ["WRITING", "SPEAKING", "READING", "LISTENING"],
  CAMBRIDGE: ["WRITING", "SPEAKING", "READING", "LISTENING", "USE_OF_ENGLISH"],
  DUOLINGO:  ["WRITING", "SPEAKING", "READING", "LISTENING", "VOCABULARY"],
  GENERAL:   ["WRITING", "SPEAKING", "READING", "LISTENING", "GRAMMAR", "VOCABULARY", "MIXED"],
};

export const SKILL_LABELS: Record<string, string> = {
  WRITING:        "✍️ Writing",
  SPEAKING:       "🎤 Speaking",
  READING:        "📖 Reading",
  LISTENING:      "🎧 Listening",
  GRAMMAR:        "📝 Grammar",
  VOCABULARY:     "📚 Vocabulary",
  MIXED:          "🔀 Mixed",
  USE_OF_ENGLISH: "🔤 Use of English",
};

// ─── COMMON QUESTION TYPES ────────────────────────────────────────────────────

export type TFNGAnswer = "TRUE" | "FALSE" | "NOT GIVEN";

export interface MCQQuestion   { id: string; text: string; options: string[]; answer: string }
export interface TFNGQuestion  { id: string; text: string; answer: TFNGAnswer }
export interface FillQuestion  { id: string; sentence: string; answer: string; hint?: string }
export interface ShortQuestion { id: string; text: string; answer: string; wordLimit?: number }
export interface TransformQuestion { id: string; sentence: string; keyword?: string; answer: string }

export type TaskType = "mcq" | "tfng" | "fill" | "short" | "transform" | "match";

export interface Task {
  id:        string;
  type:      TaskType;
  title:     string;
  questions: (MCQQuestion | TFNGQuestion | FillQuestion | ShortQuestion | TransformQuestion)[];
}

// ─── WRITING CONTENT ──────────────────────────────────────────────────────────

// General / CEFR Writing
export interface WritingContent {
  instructions?: string;
  // IELTS specific
  taskType?:    "task1_academic" | "task1_general" | "task2";
  imageUrl?:    string;   // Task 1 Academic: chart/graph/diagram
  wordLimit?:   number;
  timeLimit?:   number;   // minutes
  sampleAnswer?: string;
  // CEFR / Cambridge specific
  writingType?: "email" | "essay" | "report" | "review" | "story" | "letter" | "article" | "proposal";
  keyPhrases?:  string[];
  format?:      string;   // formatting guidelines
  // TOEFL specific
  toeflType?:   "integrated" | "independent";
  readingPassage?: string;
  audioUrl?:    string;
  audioScript?: string;
}

// ─── SPEAKING CONTENT ─────────────────────────────────────────────────────────

export interface SpeakingContent {
  mode:         "live" | "async";
  meetLink?:    string;
  scheduledAt?: string;
  questions?:   { id: string; text: string; hint?: string; timeLimitSec?: number; part?: number }[];
  // IELTS specific
  ieltsParts?:  boolean;   // show Part 1/2/3 structure
  cueCard?:     string;    // Part 2 cue card text
  // TOEFL specific
  toeflType?:   "integrated" | "independent";
  readingPassage?: string;
  audioUrl?:    string;
}

// ─── READING CONTENT ──────────────────────────────────────────────────────────

export interface ReadingContent {
  passages: {
    id:      string;
    title?:  string;
    text:    string;
    source?: string;
  }[];
  tasks:   Task[];
}

// ─── LISTENING CONTENT ────────────────────────────────────────────────────────

export interface ListeningContent {
  audioUrl:            string;
  transcript?:         string;
  showTranscriptAfter: boolean;
  tasks:               Task[];
  // IELTS: Section number (1-4), TOEFL: lecture/conversation
  sectionType?:        "conversation" | "monologue" | "lecture" | "section1" | "section2" | "section3" | "section4";
}

// ─── GRAMMAR CONTENT ──────────────────────────────────────────────────────────

export interface GrammarContent {
  explanation?: string;
  tasks:        Task[];
  // CEFR level-specific grammar point label
  grammarPoint?: string;
}

// ─── USE OF ENGLISH (Cambridge) ───────────────────────────────────────────────

export interface UseOfEnglishContent {
  type:  "multiple_choice_cloze" | "open_cloze" | "word_formation" | "key_word_transformation" | "multiple_matching";
  text?: string;
  title?: string;
  tasks: Task[];
}

// ─── VOCABULARY CONTENT ───────────────────────────────────────────────────────

export interface VocabWord {
  id:            string;
  word:          string;
  definition:    string;
  example?:      string;
  pos?:          string;
  pronunciation?: string;
  // IELTS Academic Word List / CEFR level tag
  awl?:          boolean;
  cefrLevel?:    string;
}

export interface VocabularyContent {
  words: VocabWord[];
}

// ─── MIXED (combination tasks) ────────────────────────────────────────────────

export interface MixedContent {
  sections: Array<{
    id:        string;
    skillType: string;
    title:     string;
    content:   WritingContent | ReadingContent | ListeningContent | GrammarContent | VocabularyContent;
  }>;
}

// ─── UNION TYPE ───────────────────────────────────────────────────────────────

export type SkillContent =
  | WritingContent
  | SpeakingContent
  | ReadingContent
  | ListeningContent
  | GrammarContent
  | UseOfEnglishContent
  | VocabularyContent
  | MixedContent;

// ─── STUDENT ANSWERS (submission.answers JSON) ───────────────────────────────

export interface TaskAnswers     { [questionId: string]: string }
export interface StructuredAnswers { [taskId: string]: TaskAnswers }

export interface VocabResult {
  wordId:  string;
  correct: boolean;
  chosen:  string;
}

export interface VocabAnswers {
  results: VocabResult[];
  score:   number;
  timeMs?: number;
}
