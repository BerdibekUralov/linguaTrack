/**
 * Seed script — Past Simple Grammar Assignment
 * Run: npx tsx scripts/seed-grammar-past-simple.ts
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

const uid = () => Math.random().toString(36).slice(2, 10);

async function main() {
  const teacher = await db.user.findFirst({ where: { role: "TEACHER" } });
  if (!teacher) throw new Error("No teacher found in DB. Create a teacher account first.");

  console.log(`Creating assignment for teacher: ${teacher.name} (${teacher.id})`);

  const content = {
    grammarPoint: "Past Simple",
    explanation:
      "Past Simple ifodalash uchun ishlatiladi:\n" +
      "• O'tgan vaqtda tugallangan harakatlar: I visited London last year.\n" +
      "• Affirmative: verb + -ed (regular verbs): play → played, tidy → tidied\n" +
      "• Negative: didn't + base verb: She didn't come.\n" +
      "• Question: Did + subject + base verb?: Did you go?\n" +
      "• Short answer: Yes, I did. / No, I didn't.",
    tasks: [
      /* ── A ── Fill in blanks — affirmative past simple ───────── */
      {
        id: uid(),
        type: "fill",
        title: "A — Fill in the blanks (past simple, affirmative)",
        wordBank: ["carry", "collect", "help", "invite", "love", "stay", "tidy", "travel"],
        questions: [
          { id: uid(), sentence: "My dad ___ coins and stamps when he was little.",                        answer: "collected" },
          { id: uid(), sentence: "We ___ the boxes of CDs and put them on the stage for the DJ.",          answer: "carried"   },
          { id: uid(), sentence: "David ___ us to his house for dinner.",                                  answer: "invited"   },
          { id: uid(), sentence: "They ___ up late playing a computer game.",                              answer: "stayed"    },
          { id: uid(), sentence: "She ___ the room before the guests arrived.",                            answer: "tidied"    },
          { id: uid(), sentence: "I ___ to Rome on a school trip last summer.",                            answer: "travelled" },
          { id: uid(), sentence: "The drama group ___ to make the scenery for the play.",                  answer: "helped"    },
          { id: uid(), sentence: "Tanya ___ the clothes in the fashion show.",                             answer: "loved"     },
        ],
      },

      /* ── B ── Fill in blanks — negative past simple ──────────── */
      {
        id: uid(),
        type: "fill",
        title: "B — Fill in the blanks (past simple, negative)",
        wordBank: ["cook", "enjoy", "invite", "like", "open", "perform", "want", "watch"],
        questions: [
          { id: uid(), sentence: "Lucy ___ any TV last night.",                        answer: "didn't watch"   },
          { id: uid(), sentence: "Paul ___ me to go to his party.",                    answer: "didn't invite"  },
          { id: uid(), sentence: "We ___ ourselves at the concert on Saturday.",        answer: "didn't enjoy"   },
          { id: uid(), sentence: "I ___ the horror film we watched.",                  answer: "didn't like"    },
          { id: uid(), sentence: "They ___ to go to the art gallery.",                 answer: "didn't want"    },
          { id: uid(), sentence: "The band ___ my favourite song.",                    answer: "didn't perform" },
          { id: uid(), sentence: "Paul ___ any of his presents!",                      answer: "didn't open"    },
          { id: uid(), sentence: "I ___ dinner for my parents.",                       answer: "didn't cook"    },
        ],
      },

      /* ── C ── Question formation ──────────────────────────────── */
      {
        id: uid(),
        type: "question_answer",
        title: "C — Make questions and give short answers",
        questions: [
          { id: uid(), prompt: "Suzy / listen / to your new song?",                   answerYesNo: "yes" },
          { id: uid(), prompt: "you / order / pizza for lunch?",                      answerYesNo: "yes" },
          { id: uid(), prompt: "Simon / ask / you to come out with us?",              answerYesNo: "no"  },
          { id: uid(), prompt: "they / visit / the new shopping centre in town?",     answerYesNo: "yes" },
          { id: uid(), prompt: "your mum / bake / this cake for your birthday?",      answerYesNo: "no"  },
          { id: uid(), prompt: "he / dance / at the rock festival?",                  answerYesNo: "no"  },
          { id: uid(), prompt: "Rachel / paint / that picture of you?",               answerYesNo: "yes" },
          { id: uid(), prompt: "the school / organise / the trip to the adventure park?", answerYesNo: "no" },
        ],
      },

      /* ── D ── Word choice ─────────────────────────────────────── */
      {
        id: uid(),
        type: "word_choice",
        title: "D — Circle the correct option",
        questions: [
          { id: uid(), sentence: "Did Jessie help you make the costumes [Monday/yesterday]?",               answer: "yesterday" },
          { id: uid(), sentence: "I didn't act in the school play this [night/year], unfortunately.",       answer: "year"      },
          { id: uid(), sentence: "My cousins arrived from London a week [last/ago].",                       answer: "ago"       },
          { id: uid(), sentence: "The new burger bar opened [in/on] January.",                              answer: "in"        },
          { id: uid(), sentence: "Did the concert start [on/at] 8 pm yesterday?",                          answer: "at"        },
          { id: uid(), sentence: "He first started learning to play the guitar [in/at] 2012.",              answer: "in"        },
          { id: uid(), sentence: "Michael didn't want to come to the cinema yesterday [night/evening].",    answer: "evening"   },
          { id: uid(), sentence: "I go to photography classes [on/at] Fridays.",                            answer: "on"        },
        ],
      },

      /* ── E ── Open cloze — past simple paragraph ─────────────── */
      {
        id: uid(),
        type: "fill",
        title: "E — Open the brackets (past simple)",
        questions: [
          { id: uid(), sentence: "I (1) ___ (realise) it was going to be a great night as soon as I (2) ___ (arrive).",                                   answer: "realised / arrived"     },
          { id: uid(), sentence: "The club owners (3) ___ (decorate) the club with lots of balloons and bright lights,",                                   answer: "decorated"              },
          { id: uid(), sentence: "which really (4) ___ (create) a good atmosphere.",                                                                       answer: "created"                },
          { id: uid(), sentence: "It (5) ___ (not surprise) some of us when the band, Joy Tent, (6) ___ (appear) on stage an hour late",                  answer: "didn't surprise / appeared" },
          { id: uid(), sentence: "but no one really (7) ___ (care) because they're a wonderful band and they (8) ___ (play) such great music.",            answer: "cared / played"         },
          { id: uid(), sentence: "When they (9) ___ (pick) up their guitars, everyone in the club (10) ___ (start) dancing",                               answer: "picked / started"       },
          { id: uid(), sentence: "and, I'm glad to say, they (11) ___ (not stop) all night.",                                                              answer: "didn't stop"            },
          { id: uid(), sentence: "At the end of the evening the lead singer (12) ___ (shout), '(13) ___ (you / enjoy) yourselves?'",                      answer: "shouted / Did you enjoy"},
          { id: uid(), sentence: "and everybody (14) ___ (answer) with a loud 'Yes!'",                                                                     answer: "answered"               },
        ],
      },

      /* ── F ── Sentence construction ──────────────────────────── */
      {
        id: uid(),
        type: "short",
        title: "F — Make sentences using past simple",
        questions: [
          { id: uid(), text: "Bella / cook dinner / and wash up / every day / last week",                        answer: "Bella cooked dinner and washed up every day last week."                               },
          { id: uid(), text: "you / stay / at home / last night?",                                               answer: "Did you stay at home last night?"                                                     },
          { id: uid(), text: "I / post / a letter / and then / I / walk / to the shops / after lunch",           answer: "I posted a letter and then walked to the shops after lunch."                          },
          { id: uid(), text: "the band / not play / at the concert because / they / not want / to perform",      answer: "The band didn't play at the concert because they didn't want to perform."             },
          { id: uid(), text: "we / talk / about the evening / and / we / laugh / about it",                      answer: "We talked about the evening and laughed about it."                                    },
          { id: uid(), text: "Andy / not fix / my bike / yesterday",                                             answer: "Andy didn't fix my bike yesterday."                                                   },
          { id: uid(), text: "Paul / wash / the car / after / he / finish / work?",                              answer: "Did Paul wash the car after he finished work?"                                        },
          { id: uid(), text: "last month / they / play / video games / and watch / films / every weekend",       answer: "Last month they played video games and watched films every weekend."                  },
        ],
      },
    ],
  };

  const assignment = await db.assignment.create({
    data: {
      teacherId:   teacher.id,
      title:       "Past Simple — Complete Practice (A–F)",
      description: "6 ta mashq: fill-in (affirmative & negative), question formation, word choice, open cloze va sentence construction.",
      instructions:
        "A: So'z bankidan to'g'ri fe'lni past simple shaklida qo'ying.\n" +
        "B: Manfiy shaklda yozing (didn't + base verb).\n" +
        "C: Savol tuzing va qisqa javob bering.\n" +
        "D: To'g'ri variantni tanlang.\n" +
        "E: Qavslarni oching, fe'lni past simple'ga qo'ying.\n" +
        "F: Berilgan bo'laklardan to'liq gap tuzing.",
      type:        "HOMEWORK",
      skillType:   "GRAMMAR",
      framework:   "GENERAL",
      level:       "Intermediate",
      maxScore:    100,
      status:      "DRAFT",
      skillContent: content,
    },
  });

  console.log(`✅ Assignment created! ID: ${assignment.id}`);
  console.log(`   Title: ${assignment.title}`);
  console.log(`   Status: DRAFT — publish it from the Assignments page.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
