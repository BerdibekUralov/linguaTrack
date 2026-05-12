"use client";

import { useState } from "react";
import {
  BookOpen, GraduationCap, Download, ChevronDown, ChevronRight,
  LayoutDashboard, FileText, Mic, Headphones, PenLine, BookMarked,
  Trophy, TrendingUp, Video, MessageSquare, Bell, Users,
  CheckCircle, Star, Layers, Settings, RotateCcw, Upload,
} from "lucide-react";

/* ────────────────────────────────────────────────────────── */
/*  TYPES                                                     */
/* ────────────────────────────────────────────────────────── */
interface Step { text: string; note?: string }
interface Section {
  id: string;
  icon: React.ReactNode;
  title: string;
  intro?: string;
  steps?: Step[];
  sub?: { title: string; steps: Step[] }[];
  tip?: string;
}

/* ────────────────────────────────────────────────────────── */
/*  ACCORDION SECTION                                         */
/* ────────────────────────────────────────────────────────── */
function AccordionSection({ section }: { section: Section }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid var(--border)" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 w-full px-5 py-4 text-left transition-colors hover:opacity-90"
        style={{ background: open ? "var(--primary-bg)" : "var(--surface)" }}
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
          style={{ background: open ? "var(--primary)" : "var(--surface-2)" }}
        >
          <span style={{ color: open ? "#fff" : "var(--text-3)" }}>
            {section.icon}
          </span>
        </span>
        <span className="flex-1 font-semibold text-sm" style={{ color: "var(--text)" }}>
          {section.title}
        </span>
        {open
          ? <ChevronDown className="h-4 w-4 shrink-0" style={{ color: "var(--primary)" }} />
          : <ChevronRight className="h-4 w-4 shrink-0" style={{ color: "var(--text-3)" }} />}
      </button>

      {open && (
        <div className="px-5 pb-5 pt-3 space-y-4" style={{ background: "var(--surface)" }}>
          {section.intro && (
            <p className="text-sm leading-relaxed" style={{ color: "var(--text-2)" }}>
              {section.intro}
            </p>
          )}

          {section.steps && (
            <ol className="space-y-2">
              {section.steps.map((s, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                    style={{ background: "var(--primary)" }}
                  >
                    {i + 1}
                  </span>
                  <div>
                    <span className="text-sm" style={{ color: "var(--text)" }}>{s.text}</span>
                    {s.note && (
                      <p className="text-[11px] mt-0.5 italic" style={{ color: "var(--text-3)" }}>{s.note}</p>
                    )}
                  </div>
                </li>
              ))}
            </ol>
          )}

          {section.sub?.map((sub, si) => (
            <div key={si}>
              <p className="text-xs font-semibold uppercase tracking-wide mb-2" style={{ color: "var(--text-3)" }}>
                {sub.title}
              </p>
              <ol className="space-y-2">
                {sub.steps.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white mt-0.5"
                      style={{ background: "var(--accent)" }}
                    >
                      {i + 1}
                    </span>
                    <div>
                      <span className="text-sm" style={{ color: "var(--text)" }}>{s.text}</span>
                      {s.note && (
                        <p className="text-[11px] mt-0.5 italic" style={{ color: "var(--text-3)" }}>{s.note}</p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}

          {section.tip && (
            <div
              className="flex items-start gap-2 rounded-xl px-4 py-3"
              style={{ background: "var(--success-bg)", border: "1px solid var(--success)" }}
            >
              <Star className="h-4 w-4 shrink-0 mt-0.5" style={{ color: "var(--success)" }} />
              <p className="text-xs leading-relaxed" style={{ color: "var(--success)" }}>
                <strong>Maslahat:</strong> {section.tip}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────── */
/*  DATA — STUDENT                                            */
/* ────────────────────────────────────────────────────────── */
const STUDENT_SECTIONS: Section[] = [
  {
    id: "intro",
    icon: <GraduationCap className="h-4 w-4" />,
    title: "LinguaTrack nima?",
    intro: "LinguaTrack — ingliz tilini o'rganuvchilar uchun mo'ljallangan onlayn platforma. Bu yerda o'qituvchi siz uchun turli ko'nikmalar bo'yicha vazifalar beradi: yozish (Writing), o'qish (Reading), tinglash (Listening), grammatika (Grammar), gapirish (Speaking) va lug'at (Vocabulary). Siz ularni bajarasiz, o'qituvchi tekshirib baho qo'yadi.",
    tip: "Har kuni platformaga kirib, yangi vazifalarni vaqtida topshiring — bu XP ball va reyting jadvalidagi o'rningizni oshiradi.",
  },
  {
    id: "login",
    icon: <Settings className="h-4 w-4" />,
    title: "Tizimga kirish",
    steps: [
      { text: "Brauzerda platformaning manzilini oching." },
      { text: "\"Kirish\" (Login) sahifasida email va parolingizni kiriting." },
      { text: "\"Sign in\" tugmasini bosing." },
      { text: "Birinchi marta kirsangiz, o'qituvchingiz sizga hisob yaratib beradi yoki ro'yxatdan o'tish sahifasiga yo'naltiradi." },
    ],
  },
  {
    id: "dashboard",
    icon: <LayoutDashboard className="h-4 w-4" />,
    title: "Dashboard — asosiy sahifa",
    intro: "Tizimga kirgach, dashboard (bosh sahifa) ochiladi. Bu yerda siz quyidagilarni ko'rasiz:",
    steps: [
      { text: "XP ballaringiz va darajangiz (Level)" },
      { text: "So'nggi vazifalar — yangi va baholanmagan ishlar" },
      { text: "Topshirilgan va baholangan ishlar soni" },
      { text: "Streak — ketma-ket necha kun faol bo'lganingiz" },
    ],
    tip: "Chap tomondagi menyu (sidebar) orqali barcha bo'limlarga o'tishingiz mumkin.",
  },
  {
    id: "assignments",
    icon: <BookOpen className="h-4 w-4" />,
    title: "Vazifalar (Assignments)",
    intro: "Assignments bo'limida o'qituvchi bergan barcha vazifalarni ko'rasiz.",
    steps: [
      { text: "Chap menyudan \"Assignments\" ni bosing." },
      { text: "Vazifa kartasiga bosib, vazifa sahifasini oching." },
      { text: "Sahifada topshiriq tavsifi, ko'rsatmalar, topshirish muddati ko'rsatilgan." },
      { text: "Pastroqda \"Submit your work\" bo'limida javoblaringizni yozib yuboring." },
    ],
    tip: "Muddati o'tgan vazifalar qizil rangda \"Overdue\" belgisi bilan ko'rinadi. Vaqtida topshiring!",
  },
  {
    id: "writing",
    icon: <PenLine className="h-4 w-4" />,
    title: "Writing (Yozish) vazifasini topshirish",
    steps: [
      { text: "Vazifa sahifasida matn maydonini oching." },
      { text: "So'z chegarasiga (word limit) e'tibor bering — ko'k badge yozilgan so'z sonini ko'rsatadi." },
      { text: "Matnni yozib bo'lgach, \"Submit\" tugmasini bosing." },
      { text: "Topshirilgandan so'ng o'qituvchi tekshirib baho qo'yadi." },
    ],
    tip: "150 so'zdan ortiq bo'lsa badge yashil rangga o'tadi — bu yaxshi belgi.",
  },
  {
    id: "reading",
    icon: <BookMarked className="h-4 w-4" />,
    title: "Reading (O'qish) vazifasini topshirish",
    steps: [
      { text: "Matnni diqqat bilan o'qing." },
      { text: "Har bir savol uchun to'g'ri javobni tanlang yoki yozing:" },
      { text: "MCQ — to'rtta variantdan birini bosing.", note: "Ko'k chegara bilan belgilanadi." },
      { text: "True/False/Not Given — T, F yoki NG ni tanlang." },
      { text: "Fill in the blank — bo'sh joyga javob yozing." },
      { text: "Barcha savollarga javob berib, \"Submit\" tugmasini bosing." },
    ],
  },
  {
    id: "listening",
    icon: <Headphones className="h-4 w-4" />,
    title: "Listening (Tinglash) vazifasini topshirish",
    steps: [
      { text: "Sahifada audio pleyer ko'rinadi. \"Play\" tugmasini bosing va tinglang." },
      { text: "Ayrim vazifalarda har bir bo'lim uchun alohida audio bo'lishi mumkin." },
      { text: "Savollarni o'qing va javoblaringizni kiriting (MCQ yoki matn)." },
      { text: "Hamma savollarga javob berib, \"Submit\" tugmasini bosing." },
    ],
    tip: "Audiolarni qayta-qayta tinglashingiz mumkin — cheklov yo'q.",
  },
  {
    id: "grammar",
    icon: <FileText className="h-4 w-4" />,
    title: "Grammar (Grammatika) vazifasini topshirish",
    intro: "Grammar vazifalari bir nechta bo'limdan (A, B, C...) iborat bo'lishi mumkin:",
    sub: [
      {
        title: "Bo'lim turlari",
        steps: [
          { text: "Fill in blanks — bo'sh joyga to'g'ri so'zni yozing. So'z banki berilgan bo'lsa undan foydalaning." },
          { text: "Word choice — jumlada [so'z1/so'z2] ko'rinishida ikkita variant beriladi. To'g'ri varianti bosing." },
          { text: "Question formation — berilgan bo'laklardan savol tuzing, keyin qisqa javob bering." },
          { text: "MCQ — to'g'ri javobni tanlang." },
          { text: "Short answer — o'z javobingizni yozing." },
        ],
      },
    ],
    steps: [
      { text: "Har bir bo'limni to'ldiring." },
      { text: "Pastdagi sanog'ni ko'ring (masalan: 12/48 answered)." },
      { text: "Hamma bo'lim to'ldirilgach \"Submit\" ni bosing." },
    ],
    tip: "Grammar vazifalari avtomatik tekshiriladi va darhol foiz ko'rsatiladi.",
  },
  {
    id: "speaking",
    icon: <Mic className="h-4 w-4" />,
    title: "Speaking (Gapirish) vazifasini topshirish",
    sub: [
      {
        title: "Async rejim (yozma + audio javob)",
        steps: [
          { text: "Har bir savol ko'rinadi. Javobni matn maydoniga yozing (ixtiyoriy)." },
          { text: "\"Record audio\" tugmasini bosib, mikrofon ruxsatini bering." },
          { text: "Gapiring — maksimal 3 daqiqa. \"Stop\" bilan to'xtating." },
          { text: "Yozilgan audio tinglab ko'rishingiz yoki o'chirib qaytadan yozishingiz mumkin." },
          { text: "Barcha savollarga javob berib \"Submit\" ni bosing — audio serverga yuklanadi." },
        ],
      },
      {
        title: "Live rejim (video dars)",
        steps: [
          { text: "O'qituvchi video dars tashkil qiladi. Siz \"Ready to attend\" tugmasini bosasiz." },
          { text: "Dars vaqtida \"Join video call\" tugmasi chiqadi — shu orqali kiring." },
          { text: "Video muloqot to'g'ridan-to'g'ri o'qituvchi bilan bo'ladi." },
        ],
      },
    ],
    tip: "Mikrofon ruxsatini brauzer so'raganda albatta \"Ruxsat berish\" ni bosing, aks holda audio yozib bo'lmaydi.",
  },
  {
    id: "vocab",
    icon: <BookOpen className="h-4 w-4" />,
    title: "Vocabulary (Lug'at) vazifasini topshirish",
    steps: [
      { text: "O'yin formatida so'zlar ko'rsatiladi. Ta'rif beriladi — siz to'g'ri so'zni tanlashingiz kerak." },
      { text: "Har bir savol uchun variantlardan birini bosing." },
      { text: "O'yin tugagach natija ko'rsatiladi: necha foiz to'g'ri, qancha vaqt sarflandi." },
      { text: "\"Submit\" bosib natijani saqlang." },
    ],
  },
  {
    id: "review",
    icon: <CheckCircle className="h-4 w-4" />,
    title: "Javoblaringizni ko'rish (Self-review)",
    intro: "Vazifani topshirgandan so'ng o'z javoblaringizni ko'rishingiz mumkin:",
    steps: [
      { text: "Vazifa sahifasiga kiring." },
      { text: "\"Your submitted answers\" bo'limi ko'rinadi." },
      { text: "Reading/Grammar/Listening uchun: to'g'ri javoblar yashil, xatolar qizil ranglarda belgilangan." },
      { text: "Speaking uchun: yozgan matnlar va yozilgan audiolar ko'rsatiladi." },
      { text: "Vocabulary uchun: qaysi so'zlarni to'g'ri/xato topganingiz ko'rsatiladi." },
    ],
  },
  {
    id: "grade",
    icon: <Star className="h-4 w-4" />,
    title: "Baholar va feedback",
    steps: [
      { text: "O'qituvchi ishingizni ko'rib chiqqandan so'ng baho va feedback qoldirishlari mumkin." },
      { text: "Vazifa sahifasida \"Grade result\" bo'limida: ball, foiz, progress bar va feedback ko'rinadi." },
      { text: "Bildirish notifikatsiya (qo'ng'iroq belgisi) orqali ham xabar olasiz." },
    ],
  },
  {
    id: "returned",
    icon: <RotateCcw className="h-4 w-4" />,
    title: "Ish qaytarilsa nima qilish kerak?",
    intro: "Ba'zida o'qituvchi ishingizni ko'rib chiqib, qayta topshirishingizni so'rashi mumkin.",
    steps: [
      { text: "Vazifa sahifasida sariq rang bilan \"Ishingiz qaytarildi\" ogohlantirmasi ko'rinadi." },
      { text: "Pastda \"Submit your work\" formasi yana ochilgan bo'ladi." },
      { text: "Javoblaringizni to'g'rilab qayta yuboring." },
      { text: "O'qituvchi qayta ko'rib, yangi baho qo'yadi." },
    ],
    tip: "Qaytarilgan ish — bu yaxshi imkoniyat! O'qituvchi sizga yaxshilanish uchun imkon bermoqda.",
  },
  {
    id: "progress",
    icon: <TrendingUp className="h-4 w-4" />,
    title: "Progress (Taraqqiyot) va Leaderboard",
    steps: [
      { text: "\"Progress\" bo'limida ko'nikma bo'yicha statistikangiz ko'rinadi." },
      { text: "\"Leaderboard\" da sinfdoshlar orasidagi o'rningizni ko'rasiz." },
      { text: "XP ball topshirilgan vazifalar, vaqtida topshirish va to'g'ri javoblar uchun beriladi." },
      { text: "Yuqori o'rin va ko'p XP uchun mukofotlar (badgelar) beriladi." },
    ],
    tip: "Har kuni faol bo'ling — streak (ketma-ket kunlar) uchun qo'shimcha XP olasiz!",
  },
  {
    id: "lessons",
    icon: <Video className="h-4 w-4" />,
    title: "Lessons (Jonli darslar)",
    steps: [
      { text: "\"Lessons\" bo'limida o'qituvchi tashkil qilgan video darslar ro'yxatini ko'rasiz." },
      { text: "Dars vaqtida \"Join video call\" tugmasi aktiv bo'ladi." },
      { text: "Tugmani bosib, video darsga qo'shiling." },
    ],
  },
  {
    id: "messages",
    icon: <MessageSquare className="h-4 w-4" />,
    title: "Xabarlar va Bildirishnomalar",
    steps: [
      { text: "\"Messages\" bo'limida o'qituvchi bilan yozishasiz." },
      { text: "Qo'ng'iroq belgisini bosib, barcha bildirishnomalarni ko'rasiz." },
      { text: "Yangi vazifa, baho va dars haqida avtomatik xabarnomalar keladi." },
    ],
  },
];

/* ────────────────────────────────────────────────────────── */
/*  DATA — TEACHER                                            */
/* ────────────────────────────────────────────────────────── */
const TEACHER_SECTIONS: Section[] = [
  {
    id: "intro",
    icon: <GraduationCap className="h-4 w-4" />,
    title: "LinguaTrack — o'qituvchi paneli",
    intro: "LinguaTrack orqali siz studentlar uchun turli ko'nikmalar bo'yicha vazifalar yaratasiz, natijalarni kuzatasiz, baholaysiz va feedback berasiz. Platforma avtomatik tekshirish, audio yozib yuborish va jonli video dars imkoniyatlarini beradi.",
    tip: "Barcha funksiyalarga chap menyudan osongina kirishingiz mumkin.",
  },
  {
    id: "create-assignment",
    icon: <FileText className="h-4 w-4" />,
    title: "Yangi vazifa yaratish (umumiy qadamlar)",
    steps: [
      { text: "Chap menyudan \"Assignments\" → \"+ New Assignment\" tugmasini bosing." },
      { text: "Sarlavha, tavsif va ko'rsatmalar yozing." },
      { text: "Vazifa turini tanlang: Homework, Test, Project yoki Reading." },
      { text: "Ko'nikma turini tanlang (Writing, Reading, Listening, Grammar, Speaking, Vocabulary)." },
      { text: "Framework (IELTS, CEFR va h.k.) va darajani belgilang." },
      { text: "Topshirish muddatini (due date) va maksimal ballni kiriting." },
      { text: "Kontentni to'ldiring (har bir ko'nikma uchun quyida batafsil)." },
      { text: "\"Save as Draft\" bilan saqlang yoki darhol \"Publish\" qiling." },
    ],
    tip: "Draft holatida vazifa studentlarga ko'rinmaydi. Tayyor bo'lgach, vazifa sahifasida \"Publish\" tugmasini bosing.",
  },
  {
    id: "writing-create",
    icon: <PenLine className="h-4 w-4" />,
    title: "Writing vazifasi yaratish",
    steps: [
      { text: "Ko'nikma: \"Writing\" ni tanlang." },
      { text: "\"Instructions\" maydoniga nima yozish kerakligini kiriting." },
      { text: "Ixtiyoriy: so'z chegarasi (Word limit) va vaqt chegarasi belgilang." },
      { text: "Namunaviy javob (Sample answer) qo'shishingiz mumkin." },
      { text: "Vazifani saqlang." },
    ],
    tip: "Student matn yozib topshiradi. Ko'k/yashil badge so'z sonini ko'rsatadi (150+ yashil).",
  },
  {
    id: "reading-create",
    icon: <BookMarked className="h-4 w-4" />,
    title: "Reading vazifasi yaratish",
    steps: [
      { text: "Ko'nikma: \"Reading\" ni tanlang." },
      { text: "\"+ Add passage\" — matn qo'shing (sarlavha va asosiy matn)." },
      { text: "\"+ Add task\" — vazifa bo'limi qo'shing (MCQ, True/False/NG, Fill in blanks, Short answer)." },
      { text: "Har bir bo'lim uchun savollar va to'g'ri javoblar kiriting." },
      { text: "Bir nechta bo'lim qo'shishingiz mumkin." },
    ],
    tip: "MCQ, TFNG va Fill savollari avtomatik tekshiriladi va AutoScore foizi ko'rsatiladi.",
  },
  {
    id: "listening-create",
    icon: <Headphones className="h-4 w-4" />,
    title: "Listening vazifasi yaratish",
    sub: [
      {
        title: "Bitta umumiy audio",
        steps: [
          { text: "Audio rejimi: \"One shared audio\" ni tanlang." },
          { text: "YouTube, SoundCloud yoki to'g'ridan-to'g'ri audio URL kiriting." },
          { text: "Savollar bo'limini qo'shing va savollarni kiriting." },
        ],
      },
      {
        title: "Har bir bo'lim uchun alohida audio",
        steps: [
          { text: "Audio rejimi: \"Per-task audio\" ni tanlang." },
          { text: "Har bir task/bo'lim uchun alohida audio URL kiriting." },
          { text: "Savollarni kiriting." },
        ],
      },
    ],
    tip: "YouTube va SoundCloud linklari avtomatik embed sifatida ko'rsatiladi.",
  },
  {
    id: "grammar-create",
    icon: <Layers className="h-4 w-4" />,
    title: "Grammar vazifasi yaratish",
    intro: "Grammar vazifalari bir nechta turda bo'lishi mumkin:",
    sub: [
      {
        title: "Fill in blanks (bo'sh joy to'ldirish)",
        steps: [
          { text: "Task turi: \"Fill in blanks\" ni tanlang." },
          { text: "Jumlaga bo'sh joy qo'yish uchun ___ (uch pastki chiziq) ishlating." },
          { text: "Word bank (so'z banki) qo'shish uchun so'zlarni vergul bilan kiriting." },
          { text: "Har bir savol uchun to'g'ri javobni kiriting." },
        ],
      },
      {
        title: "Word choice (so'z tanlash)",
        steps: [
          { text: "Task turi: \"Word choice\" ni tanlang." },
          { text: "Jumlada tanlov joyiga [so'z1/so'z2] formatida yozing, masalan: arrived [last/ago]." },
          { text: "To'g'ri variantni belgilang." },
        ],
      },
      {
        title: "Question formation (savol tuzish)",
        steps: [
          { text: "Task turi: \"Question & answer\" ni tanlang." },
          { text: "Prompt kiriting: \"Suzy / listen / to your new song?\"" },
          { text: "Kutilayotgan javob turini belgilang: yes yoki no." },
        ],
      },
      {
        title: "MCQ (test savol)",
        steps: [
          { text: "Task turi: \"Multiple choice\" ni tanlang." },
          { text: "Savol, variantlar va to'g'ri javobni kiriting." },
        ],
      },
    ],
    tip: "Grammar vazifalari avtomatik tekshiriladi. Har bir studentning AutoScore foizi ko'rsatiladi.",
  },
  {
    id: "speaking-create",
    icon: <Mic className="h-4 w-4" />,
    title: "Speaking vazifasi yaratish",
    sub: [
      {
        title: "Async rejim",
        steps: [
          { text: "Rejim: \"Async\" ni tanlang." },
          { text: "Savollar qo'shing — student har biriga matn va/yoki audio yozib yuboradi." },
          { text: "Har bir savolga vaqt chegarasi va maslahat qo'shishingiz mumkin." },
        ],
      },
      {
        title: "Live rejim (video dars)",
        steps: [
          { text: "Rejim: \"Live\" ni tanlang." },
          { text: "Mavzu (cue card) yoki savollar qo'shing — ular dars vaqtida foydalaniladi." },
          { text: "Dars bo'limi orqali video xona yarating va havolani student bilan ulashing." },
        ],
      },
    ],
    tip: "Async rejimda studentning audio va matn javoblari saqlangan bo'ladi — siz ularni qulay vaqtda ko'rib baholaysiz.",
  },
  {
    id: "vocab-create",
    icon: <BookOpen className="h-4 w-4" />,
    title: "Vocabulary vazifasi yaratish",
    steps: [
      { text: "Ko'nikma: \"Vocabulary\" ni tanlang." },
      { text: "\"+ Add word\" bilan so'zlar qo'shing." },
      { text: "Har bir so'z uchun: so'z (word), ta'rif (definition), misol gap (example sentence), so'z turkumi (POS: noun, verb, adj...) kiriting." },
      { text: "Talaffuz (pronunciation) ham qo'shishingiz mumkin." },
      { text: "Vazifani saqlang — student so'zlarni o'yin shaklida o'rganadi." },
    ],
    tip: "Vocabulary vazifalari avtomatik baholanadi — student yuborgan zahoti ball hisoblanadi.",
  },
  {
    id: "grading",
    icon: <Star className="h-4 w-4" />,
    title: "Javoblarni ko'rish va baholash",
    steps: [
      { text: "Vazifa sahifasida pastga scrolling qiling — \"Submissions\" bo'limi ko'rinadi." },
      { text: "Har bir studentning javobi \"Student answers\" panelida ko'rsatiladi." },
      { text: "Writing — to'liq matn va so'z soni ko'rsatiladi." },
      { text: "Reading/Grammar/Listening — har bir savol, student javobi va to'g'ri javob (yashil/qizil rangda) ko'rsatiladi." },
      { text: "Speaking — yozma matn va audio pleyerlar ko'rsatiladi." },
      { text: "Vocabulary — qaysi so'zlarni to'g'ri/xato topgani statistika bilan ko'rsatiladi." },
      { text: "\"Grade\" tugmasini bosing, ball va feedback kiriting, \"Save\" ni bosing." },
    ],
    tip: "Grammar, Reading va Listening uchun AutoScore avtomatik hisoblanadi — siz uni tasdiqlashingiz yoki o'zgartirishingiz mumkin.",
  },
  {
    id: "return",
    icon: <RotateCcw className="h-4 w-4" />,
    title: "Ishni studentga qaytarish",
    intro: "Agar student ishini qayta bajarishini istasangiz, \"Return\" funksiyasidan foydalaning:",
    steps: [
      { text: "Submission yonidagi \"Qaytarish\" tugmasini bosing." },
      { text: "Ixtiyoriy izoh yozing — student nima o'zgartirishi kerakligini tushunadigan qilib." },
      { text: "\"Qaytarish\" ni tasdiqlang." },
      { text: "Student \"Ishingiz qaytarildi\" xabari bilan forma qayta ochilgan holda ko'radi." },
      { text: "Student qayta topshirgach, siz yana baholaysiz." },
    ],
    tip: "Baholangan ishni ham qaytarish mumkin — eski baho o'chirilib, yangi baho berish imkoni paydo bo'ladi.",
  },
  {
    id: "lessons",
    icon: <Video className="h-4 w-4" />,
    title: "Jonli darslar (Lessons)",
    steps: [
      { text: "Chap menyudan \"Lessons\" → \"+ New Lesson\" ni bosing." },
      { text: "Dars sarlavhasi, tavsifi, vaqti va davomiyligini kiriting." },
      { text: "\"Create Lesson\" ni bosing." },
      { text: "Dars sahifasida \"Create Room\" tugmasi bilan video xona yarating." },
      { text: "\"Start\" tugmasi bilan darsni boshlang (status: LIVE)." },
      { text: "\"Join video call\" tugmasi bilan video darsga kiring." },
      { text: "Dars tugagach \"End Lesson\" ni bosing." },
    ],
    tip: "Dars LIVE rejimida bo'lganda studentlar ham \"Join\" tugmasini ko'radi va qo'shila oladi.",
  },
  {
    id: "students",
    icon: <Users className="h-4 w-4" />,
    title: "Students boshqarish",
    steps: [
      { text: "\"Students\" bo'limida barcha studentlar ro'yxatini ko'rasiz." },
      { text: "Har bir student kartasida: baho o'rtacha, topshirilgan ishlar soni, so'nggi faollik ko'rinadi." },
      { text: "Studentga bosib, batafsil ma'lumot va taraqqiyotini ko'rasiz." },
    ],
  },
  {
    id: "notifications",
    icon: <Bell className="h-4 w-4" />,
    title: "Bildirishnomalar",
    steps: [
      { text: "Qo'ng'iroq belgisi orqali bildirishnomalarni oching." },
      { text: "Student yangi ish topshirganda avtomatik xabar keladi." },
      { text: "Barcha bildirishnomalarni \"Notifications\" sahifasida ko'rasiz." },
    ],
  },
];

/* ────────────────────────────────────────────────────────── */
/*  MAIN COMPONENT                                            */
/* ────────────────────────────────────────────────────────── */
export function HelpPageClient({ defaultRole }: { defaultRole: "student" | "teacher" }) {
  const [tab, setTab] = useState<"student" | "teacher">(defaultRole);
  const sections = tab === "student" ? STUDENT_SECTIONS : TEACHER_SECTIONS;

  const docUrl = tab === "student"
    ? "/docs/student-guide.docx"
    : "/docs/teacher-guide.docx";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-2xl"
          style={{ background: "var(--primary)" }}
        >
          <GraduationCap className="h-5 w-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-xl" style={{ color: "var(--text)" }}>Yoriqnoma</h1>
          <p className="text-xs" style={{ color: "var(--text-3)" }}>LinguaTrack platformasidan foydalanish qo'llanmasi</p>
        </div>
        {/* PDF download */}
        <a
          href={docUrl}
          download
          className="ml-auto flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition hover:opacity-80"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--text-2)" }}
        >
          <Download className="h-4 w-4" style={{ color: "var(--primary)" }} />
          Yuklash (.docx)
        </a>
      </div>

      {/* Tab switcher */}
      <div
        className="flex rounded-2xl p-1 gap-1"
        style={{ background: "var(--surface-2)", border: "1px solid var(--border)" }}
      >
        {(["student", "teacher"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
            style={{
              background: tab === t ? "var(--primary)" : "transparent",
              color: tab === t ? "#fff" : "var(--text-3)",
            }}
          >
            {t === "student"
              ? <><BookOpen className="h-4 w-4" /> Student qo'llanmasi</>
              : <><Users className="h-4 w-4" /> O'qituvchi qo'llanmasi</>}
          </button>
        ))}
      </div>

      {/* Intro banner */}
      <div
        className="flex items-start gap-4 rounded-2xl px-5 py-4"
        style={{ background: "var(--primary-bg)", border: "1px solid var(--border)" }}
      >
        {tab === "student"
          ? <BookOpen className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />
          : <Trophy className="h-5 w-5 mt-0.5 shrink-0" style={{ color: "var(--primary)" }} />}
        <div>
          <p className="font-semibold text-sm" style={{ color: "var(--text)" }}>
            {tab === "student"
              ? "Student sifatida platformadan qanday foydalanish kerak?"
              : "O'qituvchi sifatida platformani qanday boshqarish kerak?"}
          </p>
          <p className="text-xs mt-0.5" style={{ color: "var(--text-2)" }}>
            Har bir bo'limni bosib, batafsil ko'rsatmalarni o'qing.
            {" "}PDF formatda yuklab, offline ko'rishingiz mumkin.
          </p>
        </div>
      </div>

      {/* Sections accordion */}
      <div className="space-y-2">
        {sections.map((section) => (
          <AccordionSection key={section.id} section={section} />
        ))}
      </div>

      {/* Footer */}
      <div
        className="rounded-2xl px-5 py-4 text-center text-xs space-y-1"
        style={{ background: "var(--surface-2)", color: "var(--text-3)" }}
      >
        <p className="font-semibold" style={{ color: "var(--text-2)" }}>Savol yoki muammo bo'lsa?</p>
        <p>O'qituvchingiz bilan <strong>Messages</strong> bo'limida bog'laning yoki bildirishnomalarni tekshiring.</p>
      </div>
    </div>
  );
}
