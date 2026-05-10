// ─── TEACHER DEFINES (skillContent JSON) ────────────────────────────────────

export type TFNGAnswer = "TRUE" | "FALSE" | "NOT GIVEN";

export interface MCQQuestion  { id: string; text: string; options: string[]; answer: string }
export interface TFNGQuestion { id: string; text: string; answer: TFNGAnswer }
export interface FillQuestion { id: string; sentence: string; answer: string; hint?: string }
export interface ShortQuestion{ id: string; text: string; answer: string; wordLimit?: number }

export type TaskType = "mcq" | "tfng" | "fill" | "short" | "transform";

export interface Task {
  id:        string;
  type:      TaskType;
  title:     string;
  questions: (MCQQuestion | TFNGQuestion | FillQuestion | ShortQuestion)[];
}

// WRITING — no skillContent needed, plain text submission
export interface WritingContent { instructions?: string }

// SPEAKING
export interface SpeakingContent {
  mode:         "live" | "async";
  meetLink?:    string;
  scheduledAt?: string; // ISO
  questions?:   { id: string; text: string; hint?: string; timeLimitSec?: number }[];
}

// READING
export interface ReadingContent {
  passage: string;
  tasks:   Task[];
}

// LISTENING
export interface ListeningContent {
  audioUrl:             string;
  transcript?:          string; // shown after submission
  showTranscriptAfter:  boolean;
  tasks:                Task[];
}

// GRAMMAR
export interface GrammarContent {
  explanation?: string;
  tasks:        Task[];
}

// VOCABULARY
export interface VocabWord {
  id:           string;
  word:         string;
  definition:   string;
  example?:     string;
  pos?:         string; // noun, verb, adj, adv…
  pronunciation?: string;
}
export interface VocabularyContent {
  words: VocabWord[];
}

export type SkillContent =
  | WritingContent
  | SpeakingContent
  | ReadingContent
  | ListeningContent
  | GrammarContent
  | VocabularyContent;

// ─── STUDENT ANSWERS (submission.answers JSON) ───────────────────────────────

export interface TaskAnswers { [questionId: string]: string }

export interface StructuredAnswers {
  [taskId: string]: TaskAnswers;
}

// Vocabulary quiz result
export interface VocabResult {
  wordId:    string;
  correct:   boolean;
  chosen:    string;
}

export interface VocabAnswers {
  results:   VocabResult[];
  score:     number;   // 0-100
  timeMs?:   number;
}
