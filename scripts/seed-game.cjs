// seed-game.cjs — seeds all Practice (Game) content
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");

const DIRECT_URL = "postgresql://neondb_owner:npg_xMFI9z3GVuRD@ep-little-thunder-ap5zcku5.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

const pool = new Pool({ connectionString: DIRECT_URL, ssl: { rejectUnauthorized: false }, max: 2 });
const adapter = new PrismaPg(pool);
const db = new PrismaClient({ adapter });

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function mcq(q, correct, wrongs, order) {
  return {
    type: "mcq",
    question: q,
    options: shuffle([correct, ...wrongs.slice(0, 3)]),
    answer: correct,
    order,
  };
}

function fill(sentence, answer, options, order) {
  return {
    type: "fill",
    question: sentence,
    options: shuffle([answer, ...options.slice(0, 3)]),
    answer,
    order,
  };
}

// ─── VOCABULARY CONTENT ───────────────────────────────────────────────────────

const ADVSCI = [
  { w: "adventure",   def: "an exciting and sometimes dangerous experience" },
  { w: "approach",    def: "to come near to; a method of dealing with something" },
  { w: "carefully",   def: "with great attention to avoid mistakes or damage" },
  { w: "chemical",    def: "a substance produced by or used in chemistry" },
  { w: "create",      def: "to make or produce something new" },
  { w: "evil",        def: "morally very bad; wicked" },
  { w: "experiment",  def: "a scientific test done to discover or prove something" },
  { w: "kill",        def: "to cause the death of a living thing" },
  { w: "laboratory",  def: "a room or building equipped for scientific experiments" },
  { w: "laugh",       def: "to make sounds showing you find something funny" },
  { w: "loud",        def: "making a lot of noise; easy to hear" },
  { w: "nervous",     def: "anxious or worried about something" },
  { w: "noise",       def: "an unpleasant or unwanted sound" },
  { w: "project",     def: "a planned piece of work or research with a clear goal" },
  { w: "scare",       def: "to make someone feel frightened" },
  { w: "secret",      def: "something known only to a few people; kept hidden" },
  { w: "shout",       def: "to speak very loudly" },
  { w: "smell",       def: "to have a particular scent or odour" },
  { w: "terrible",    def: "extremely bad or unpleasant" },
  { w: "worse",       def: "of lower quality or more unpleasant than something else" },
];

const LEISURE = [
  { w: "birdwatching",  def: "watching birds in nature as a hobby" },
  { w: "camping",       def: "staying overnight in a tent in the countryside" },
  { w: "collecting",    def: "gathering objects of a particular type as a hobby" },
  { w: "cycling",       def: "riding a bicycle for sport or pleasure" },
  { w: "dancing",       def: "moving your body to music in a rhythmic way" },
  { w: "fishing",       def: "catching fish as a sport or hobby" },
  { w: "gardening",     def: "growing and taking care of plants as a hobby" },
  { w: "hiking",        def: "walking long distances especially in the countryside" },
  { w: "jogging",       def: "running slowly as a form of exercise" },
  { w: "kayaking",      def: "travelling in a small narrow boat using a paddle" },
  { w: "knitting",      def: "making clothes by connecting loops of wool with needles" },
  { w: "painting",      def: "creating pictures using paint as a hobby" },
  { w: "photography",   def: "taking photographs as a hobby or art form" },
  { w: "reading",       def: "looking at and understanding written text for pleasure" },
  { w: "sailing",       def: "travelling on water in a boat with sails" },
  { w: "skateboarding", def: "riding a skateboard as a sport or hobby" },
  { w: "skiing",        def: "moving on skis across snow for sport or pleasure" },
  { w: "swimming",      def: "moving through water using your arms and legs" },
  { w: "yoga",          def: "a set of exercises for the body and mind" },
  { w: "volunteering",  def: "working for no payment in order to help others" },
];

const SPACE = [
  { w: "alien",       def: "a creature from another planet" },
  { w: "astronaut",   def: "a person trained to travel in spacecraft" },
  { w: "atmosphere",  def: "the layer of gases surrounding a planet" },
  { w: "comet",       def: "an object in space made of ice and dust with a bright tail" },
  { w: "galaxy",      def: "a system of millions of stars held together by gravity" },
  { w: "gravity",     def: "the force that pulls objects towards Earth or another body" },
  { w: "launch",      def: "to send a rocket or spacecraft into space" },
  { w: "meteor",      def: "a piece of rock from space that enters Earth's atmosphere" },
  { w: "orbit",       def: "the curved path of a planet or spacecraft around a star" },
  { w: "planet",      def: "a large body in space that orbits a star" },
  { w: "rocket",      def: "a vehicle propelled by engines used to travel to space" },
  { w: "satellite",   def: "an object that orbits a planet or moon" },
  { w: "solar",       def: "relating to the sun" },
  { w: "telescope",   def: "an instrument used to see very distant objects in space" },
  { w: "revise",      def: "to study material again in preparation for an exam" },
  { w: "schedule",    def: "a plan showing times and activities to be done" },
  { w: "subject",     def: "an area of study in school, such as maths or science" },
  { w: "compete",     def: "to try to win something against others" },
  { w: "assignment",  def: "a piece of school work given to a student to complete" },
  { w: "deadline",    def: "the time or date by which work must be finished" },
];

function buildVocabLessons(words) {
  // Split 20 words into 2 groups of 10
  const half1 = words.slice(0, 10);
  const half2 = words.slice(10, 20);
  const all   = words;

  // Lesson 1: MCQ "What does X mean?" — first 10 words
  const lesson1 = half1.map((item, i) => {
    const wrongs = all.filter(x => x.w !== item.w).map(x => x.def);
    const distract = shuffle(wrongs).slice(0, 3);
    return mcq(`What does "${item.w}" mean?`, item.def, distract, i + 1);
  });

  // Lesson 2: MCQ "What does X mean?" — last 10 words
  const lesson2 = half2.map((item, i) => {
    const wrongs = all.filter(x => x.w !== item.w).map(x => x.def);
    const distract = shuffle(wrongs).slice(0, 3);
    return mcq(`What does "${item.w}" mean?`, item.def, distract, i + 1);
  });

  // Lesson 3: Match "Which word means Y?" — first 10
  const lesson3 = half1.map((item, i) => {
    const wrongs = all.filter(x => x.w !== item.w).map(x => x.w);
    const distract = shuffle(wrongs).slice(0, 3);
    return mcq(`Which word means: "${item.def}"?`, item.w, distract, i + 1);
  });

  // Lesson 4: Match "Which word means Y?" — last 10
  const lesson4 = half2.map((item, i) => {
    const wrongs = all.filter(x => x.w !== item.w).map(x => x.w);
    const distract = shuffle(wrongs).slice(0, 3);
    return mcq(`Which word means: "${item.def}"?`, item.w, distract, i + 1);
  });

  return [
    { title: "Lesson 1 · What does it mean?", order: 1, xpReward: 10, questions: lesson1 },
    { title: "Lesson 2 · What does it mean?", order: 2, xpReward: 10, questions: lesson2 },
    { title: "Lesson 3 · Match the word",     order: 3, xpReward: 15, questions: lesson3 },
    { title: "Lesson 4 · Match the word",     order: 4, xpReward: 15, questions: lesson4 },
  ];
}

// ─── GRAMMAR CONTENT ──────────────────────────────────────────────────────────

const grammarUnits = [
  {
    title: "Past Simple · Regular Verbs",
    icon: "✍️",
    color: "#2563eb",
    order: 1,
    lessons: [
      {
        title: "Lesson 1 · Positive sentences",
        order: 1,
        xpReward: 10,
        questions: [
          fill('She ___ to school yesterday. (walk)',        'walked',   ['walk','walking','walks'], 1),
          fill('They ___ football last week. (play)',        'played',   ['play','playing','plays'], 2),
          fill('He ___ all night. (study)',                  'studied',  ['study','studying','studies'], 3),
          fill('We ___ a film last night. (watch)',          'watched',  ['watch','watching','watches'], 4),
          fill('I ___ my grandmother. (visit)',              'visited',  ['visit','visiting','visits'], 5),
          fill('She ___ the door carefully. (close)',        'closed',   ['close','closing','closes'], 6),
          fill('They ___ in London. (live)',                 'lived',    ['live','living','lives'], 7),
          fill('He ___ to music all morning. (listen)',      'listened', ['listen','listening','listens'], 8),
          fill('We ___ our homework on time. (finish)',      'finished', ['finish','finishing','finishes'], 9),
          fill('She ___ a message to her friend. (send)',    'sended',   ['send','sending','sends'], 10),
        ].map((q, i) => ({ ...q, order: i + 1 })),
      },
      {
        title: "Lesson 2 · Negative sentences",
        order: 2,
        xpReward: 10,
        questions: [
          fill("She ___ watch TV yesterday.",              "didn't",  ["don't","doesn't","wasn't"], 1),
          fill("He ___ go to school last Monday.",         "didn't",  ["don't","doesn't","wasn't"], 2),
          fill("They ___ play football last week.",        "didn't",  ["don't","doesn't","weren't"], 3),
          fill("I ___ finish my homework in time.",        "didn't",  ["don't","doesn't","wasn't"], 4),
          fill("We ___ see her at the party.",             "didn't",  ["don't","doesn't","weren't"], 5),
          mcq("He ___ eat breakfast this morning.",        "didn't",  ["don't","doesn't","wasn't"], 6),
          mcq("She ___ like the film.",                   "didn't",  ["don't","doesn't","wasn't"], 7),
          mcq("They ___ arrive on time.",                 "didn't",  ["don't","doesn't","weren't"], 8),
          mcq("I ___ understand the question.",           "didn't",  ["don't","doesn't","wasn't"], 9),
          mcq("We ___ visit the museum.",                 "didn't",  ["don't","doesn't","weren't"], 10),
        ],
      },
      {
        title: "Lesson 3 · Questions",
        order: 3,
        xpReward: 15,
        questions: [
          mcq("___ she go to the market?",               "Did",  ["Does","Was","Were"], 1),
          mcq("___ they arrive early?",                  "Did",  ["Does","Was","Were"], 2),
          mcq("___ he study last night?",                "Did",  ["Does","Was","Were"], 3),
          mcq("___ you see the film?",                   "Did",  ["Does","Was","Were"], 4),
          mcq("___ we finish on time?",                  "Did",  ["Does","Was","Were"], 5),
          fill("___ she ___ the homework? (do)",        "Did … do",   ["Does … do","Was … do","Did … does"], 6),
          mcq("A: Did he go? B: Yes, he ___.",          "did",  ["do","does","was"], 7),
          mcq("A: Did they arrive? B: No, they ___.",   "didn't", ["don't","weren't","doesn't"], 8),
          mcq("Which is correct?", "Did you eat lunch?", ["Did you ate lunch?","Do you ate lunch?","Were you eat lunch?"], 9),
          mcq("Which is correct?", "She didn't come.", ["She didn't came.","She not come.","She don't come."], 10),
        ],
      },
    ],
  },
  {
    title: "Past Simple · Irregular Verbs",
    icon: "🔤",
    color: "#7c3aed",
    order: 2,
    lessons: [
      {
        title: "Lesson 1 · Common irregulars",
        order: 1,
        xpReward: 10,
        questions: [
          mcq("go → past simple",   "went",   ["goed","gone","goes"], 1),
          mcq("eat → past simple",  "ate",    ["eated","eaten","eats"], 2),
          mcq("buy → past simple",  "bought", ["buyed","buys","bough"], 3),
          mcq("see → past simple",  "saw",    ["seed","seen","sees"], 4),
          mcq("take → past simple", "took",   ["taked","taken","takes"], 5),
          mcq("give → past simple", "gave",   ["gived","given","gives"], 6),
          mcq("come → past simple", "came",   ["comed","come","comes"], 7),
          mcq("get → past simple",  "got",    ["getted","gotten","gets"], 8),
          mcq("make → past simple", "made",   ["maked","making","makes"], 9),
          mcq("have → past simple", "had",    ["haved","has","having"], 10),
        ],
      },
      {
        title: "Lesson 2 · More irregulars",
        order: 2,
        xpReward: 10,
        questions: [
          mcq("write → past simple",  "wrote",  ["writed","written","writes"], 1),
          mcq("read → past simple",   "read",   ["readed","red","reads"], 2),
          mcq("know → past simple",   "knew",   ["knowed","known","knows"], 3),
          mcq("think → past simple",  "thought",["thinked","think","thinks"], 4),
          mcq("say → past simple",    "said",   ["sayed","say","says"], 5),
          mcq("find → past simple",   "found",  ["finded","find","finds"], 6),
          mcq("tell → past simple",   "told",   ["telled","tell","tells"], 7),
          mcq("feel → past simple",   "felt",   ["feeled","feel","feels"], 8),
          mcq("leave → past simple",  "left",   ["leaved","leave","leaves"], 9),
          mcq("run → past simple",    "ran",    ["runned","run","runs"], 10),
        ],
      },
      {
        title: "Lesson 3 · Mixed sentences",
        order: 3,
        xpReward: 15,
        questions: [
          fill("She ___ to the shop. (go)",       "went",   ["goed","gone","goes"], 1),
          fill("We ___ pizza for dinner. (eat)",  "ate",    ["eated","eaten","eats"], 2),
          fill("He ___ a new book. (buy)",        "bought", ["buyed","buys","bough"], 3),
          fill("I ___ the bus. (take)",           "took",   ["taked","taken","takes"], 4),
          fill("They ___ a great film. (see)",    "saw",    ["seed","seen","sees"], 5),
          fill("She ___ me a present. (give)",    "gave",   ["gived","given","gives"], 6),
          fill("He ___ home late. (come)",        "came",   ["comed","come","comes"], 7),
          fill("I ___ a good mark. (get)",        "got",    ["getted","gotten","gets"], 8),
          fill("We ___ a plan. (make)",           "made",   ["maked","making","makes"], 9),
          fill("She ___ a lot of friends. (have)","had",    ["haved","has","having"], 10),
        ],
      },
    ],
  },
  {
    title: "Past Continuous",
    icon: "⏱️",
    color: "#059669",
    order: 3,
    lessons: [
      {
        title: "Lesson 1 · Was / Were + -ing",
        order: 1,
        xpReward: 10,
        questions: [
          mcq("She ___ reading when I called.",       "was",   ["were","is","did"], 1),
          mcq("They ___ studying at 8pm.",            "were",  ["was","are","did"], 2),
          mcq("He ___ not listening to the teacher.", "was",   ["were","is","did"], 3),
          mcq("We ___ waiting for the bus.",          "were",  ["was","are","did"], 4),
          mcq("I ___ cooking when she arrived.",      "was",   ["were","is","did"], 5),
          fill("She ___ (read) a book.",              "was reading",  ["read","is reading","were reading"], 6),
          fill("They ___ (play) football.",           "were playing", ["played","are playing","was playing"], 7),
          fill("He ___ (not sleep) at midnight.",     "wasn't sleeping", ["didn't sleep","weren't sleeping","don't sleep"], 8),
          fill("We ___ (watch) TV at 7pm.",           "were watching", ["watched","was watching","are watching"], 9),
          fill("I ___ (write) an email.",             "was writing", ["wrote","is writing","were writing"], 10),
        ],
      },
      {
        title: "Lesson 2 · While & When",
        order: 2,
        xpReward: 10,
        questions: [
          mcq("While she was cooking, the phone ___.", "rang",   ["was ringing","ringed","ring"], 1),
          mcq("He fell asleep while he ___ TV.",        "was watching", ["watched","watches","did watch"], 2),
          mcq("When I arrived, she ___ in the garden.", "was working", ["worked","works","did work"], 3),
          mcq("They were sleeping when the alarm ___.", "rang",   ["was ringing","ringed","ring"], 4),
          mcq("I saw her while I ___ to work.",         "was walking", ["walked","walks","did walk"], 5),
          fill("While I ___ (cook), he set the table.",       "was cooking", ["cooked","is cooking","were cooking"], 6),
          fill("She was reading ___ he was writing.",         "while",  ["when","because","although"], 7),
          fill("They ___ (talk) when the teacher came in.",   "were talking", ["talked","are talking","was talking"], 8),
          fill("___ were you doing at 9pm? I was studying.",  "What",   ["Who","Where","When"], 9),
          mcq("Which is correct?", "She was reading while he was writing.", ["She reading while he writing.","She was read while he write.","She did reading while he was write."], 10),
        ],
      },
      {
        title: "Lesson 3 · Past Simple vs Continuous",
        order: 3,
        xpReward: 15,
        questions: [
          mcq("I ___ my keys while I was cleaning. (find)", "found", ["was finding","find","did find"], 1),
          mcq("She was sleeping when I ___. (arrive)",       "arrived", ["was arriving","arrive","did arrive"], 2),
          mcq("We ___ football when it started to rain. (play)", "were playing", ["played","play","did play"], 3),
          mcq("He ___ the TV and sat down. (turn off)",      "turned off", ["was turning off","turns off","turn off"], 4),
          mcq("While they ___ dinner, the lights went out. (eat)", "were eating", ["ate","eat","did eat"], 5),
          fill("I ___ (study) when my phone ___ (ring).",    "was studying … rang", ["studied … rang","was studying … was ringing","study … ring"], 6),
          fill("She ___ (not watch) TV; she ___ (read).",   "wasn't watching … was reading", ["didn't watch … read","not watch … reading","wasn't watch … was reading"], 7),
          mcq("Which uses Past Continuous?",    "I was eating lunch at noon.", ["I ate lunch at noon.","I eat lunch at noon.","I did eat lunch at noon."], 8),
          mcq("Which uses Past Simple?",        "She finished her homework.", ["She was finishing her homework.","She finish her homework.","She did finishing her homework."], 9),
          mcq("Correct form of 'write' in: 'He ___ a letter when she called.'", "was writing", ["wrote","writes","did write"], 10),
        ],
      },
    ],
  },
];

// ─── MAIN SEED ────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding game content…");

  // Clear existing
  await db.gameProgress.deleteMany();
  await db.gameQuestion.deleteMany();
  await db.gameLesson.deleteMany();
  await db.gameUnit.deleteMany();
  await db.gameModule.deleteMany();
  console.log("  ✓ Cleared old game data");

  // ── Vocabulary Module ─────────────────────────────────────────────────────
  const vocabModule = await db.gameModule.create({
    data: { slug: "vocabulary", name: "Vocabulary", icon: "📚", order: 1 },
  });

  const vocabUnitsData = [
    { title: "Adventure & Science", icon: "🔬", color: "#6366f1", order: 1, words: ADVSCI },
    { title: "Leisure Time",        icon: "🎯", color: "#f59e0b", order: 2, words: LEISURE },
    { title: "Space & School",      icon: "🚀", color: "#06b6d4", order: 3, words: SPACE },
  ];

  for (const uData of vocabUnitsData) {
    const unit = await db.gameUnit.create({
      data: {
        moduleId: vocabModule.id,
        title: uData.title,
        icon: uData.icon,
        color: uData.color,
        order: uData.order,
      },
    });

    const lessons = buildVocabLessons(uData.words);
    for (const lData of lessons) {
      const lesson = await db.gameLesson.create({
        data: { unitId: unit.id, title: lData.title, order: lData.order, xpReward: lData.xpReward },
      });
      for (const q of lData.questions) {
        await db.gameQuestion.create({
          data: {
            lessonId: lesson.id,
            type: q.type,
            question: q.question,
            options: q.options,
            answer: q.answer,
            hint: q.hint ?? null,
            order: q.order,
          },
        });
      }
    }
    console.log(`  ✓ Vocab unit: ${uData.title} (${lessons.length} lessons)`);
  }

  // ── Grammar Module ────────────────────────────────────────────────────────
  const grammarModule = await db.gameModule.create({
    data: { slug: "grammar", name: "Grammar", icon: "📝", order: 2 },
  });

  for (const uData of grammarUnits) {
    const unit = await db.gameUnit.create({
      data: {
        moduleId: grammarModule.id,
        title: uData.title,
        icon: uData.icon,
        color: uData.color,
        order: uData.order,
      },
    });

    for (const lData of uData.lessons) {
      const lesson = await db.gameLesson.create({
        data: { unitId: unit.id, title: lData.title, order: lData.order, xpReward: lData.xpReward },
      });
      for (const q of lData.questions) {
        await db.gameQuestion.create({
          data: {
            lessonId: lesson.id,
            type: q.type,
            question: q.question,
            options: q.options,
            answer: q.answer,
            hint: q.hint ?? null,
            order: q.order,
          },
        });
      }
    }
    console.log(`  ✓ Grammar unit: ${uData.title} (${uData.lessons.length} lessons)`);
  }

  console.log("\n✅ Game content seeded successfully!");
  const totalLessons = await db.gameLesson.count();
  const totalQs = await db.gameQuestion.count();
  console.log(`   Modules: 2 | Lessons: ${totalLessons} | Questions: ${totalQs}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
