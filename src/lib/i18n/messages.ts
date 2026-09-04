/**
 * The organisation overview, in every language the platform offers.
 *
 * WHAT NEEDS DOING BEFORE LAUNCH
 *
 * Every non-English block below was written without a native speaker. The
 * meaning is right and the register is close, but nobody who speaks Gaelic,
 * Punjabi, Urdu or Scots as a first language has read them. Treat this as a
 * first draft and get each one looked at by somebody who speaks it.
 *
 * The two hardest to get right without help: Gaelic, where register varies a
 * lot by region and mine is likely too formal, and Scots, where the line
 * between written Scots and English with Scots spellings is an editorial
 * decision a Scots speaker should make rather than me.
 *
 * Only the overview is translated. The rest of the portal — the profile form,
 * the solution form, every hint that explains a consequence — is still
 * English, and translating it badly would be worse than leaving it. What an
 * organisation writes about itself also stays in whatever language they wrote
 * it, because nothing here machine-translates their words.
 *
 * Nothing is interpolated. Where a name or a number goes, the component
 * assembles it, so no translator has to handle placeholder syntax.
 */

export type MessageKey =
  | "language.label"
  | "nav.overview"
  | "stats.posted.one"
  | "stats.posted.many"
  | "stats.reached"
  | "stats.profileViews"
  | "period.week"
  | "period.month"
  | "period.all"
  | "verify.pendingTitle"
  | "verify.pendingBody"
  | "profile.title"
  | "profile.start"
  | "profile.finish"
  | "empty.title"
  | "empty.body"
  | "empty.cta"
  | "seeAll";

type Catalogue = Partial<Record<MessageKey, string>>;

const en: Record<MessageKey, string> = {
  "language.label": "Language",
  "nav.overview": "Overview",
  "stats.posted.one": "solution posted",
  "stats.posted.many": "solutions posted",
  "stats.reached": "women reached",
  "stats.profileViews": "profile visits",
  "period.week": "This week",
  "period.month": "This month",
  "period.all": "All time",
  "verify.pendingTitle": "Verification in progress",
  "verify.pendingBody":
    "We check every organisation before its listings can reach women. Posting and inviting colleagues open as soon as that is done.",
  "profile.title": "Tell us about your organisation",
  "profile.start": "Start",
  "profile.finish": "Finish it",
  "empty.title": "Nothing posted yet",
  "empty.body":
    "A solution is one thing a woman can act on: a course, a grant, a drop-in, a mentoring place. Your figures start here once the first one is live.",
  "empty.cta": "Post your first solution",
  seeAll: "See all your solutions",
};

const gd: Catalogue = {
  "language.label": "Cànan",
  "nav.overview": "Sealladh farsaing",
  "stats.posted.one": "fuasgladh air a phostadh",
  "stats.posted.many": "fuasglaidhean air am postadh",
  "stats.reached": "boireannaich air an ruigsinn",
  "stats.profileViews": "tadhalan pròifil",
  "period.week": "An t-seachdain seo",
  "period.month": "Am mìos seo",
  "period.all": "Fad na h-ùine",
  "verify.pendingTitle": "Dearbhadh a’ dol air adhart",
  "verify.pendingBody":
    "Bidh sinn a’ dearbhadh gach buidheann mus ruig na liostaichean aca boireannaich. Fosglaidh postadh agus cuireadh do cho-obraichean cho luath ’s a bhios sin deiseil.",
  "profile.title": "Innis dhuinn mun bhuidheann agaibh",
  "profile.start": "Tòisich",
  "profile.finish": "Crìochnaich e",
  "empty.title": "Cha deach dad a phostadh fhathast",
  "empty.body":
    "Is e fuasgladh aon rud as urrainn do bhoireannach gnìomh a ghabhail air: cùrsa, tabhartas, àite tadhail, no àite mentoraidh. Tòisichidh na figearan agaibh an seo cho luath ’s a bhios a’ chiad fhear beò.",
  "empty.cta": "Postaich a’ chiad fhuasgladh agaibh",
  seeAll: "Faic na fuasglaidhean agaibh uile",
};

const sco: Catalogue = {
  "language.label": "Leid",
  "nav.overview": "Owerview",
  "stats.posted.one": "solution postit",
  "stats.posted.many": "solutions postit",
  "stats.reached": "weemen raxed",
  "stats.profileViews": "profile veesits",
  "period.week": "This ouk",
  "period.month": "This month",
  "period.all": "Aw time",
  "verify.pendingTitle": "Verification in haund",
  "verify.pendingBody":
    "We check ilka organisation afore its listins can rax weemen. Postin an invitin colleagues open as suin as that’s duin.",
  "profile.title": "Tell us aboot yer organisation",
  "profile.start": "Stert",
  "profile.finish": "Feenish it",
  "empty.title": "Naethin postit yet",
  "empty.body":
    "A solution is ae thing a wumman can act on: a coorse, a grant, a drap-in, a mentorin place. Yer figures stert here aince the first ane is live.",
  "empty.cta": "Post yer first solution",
  seeAll: "See aw yer solutions",
};

const pl: Catalogue = {
  "language.label": "Język",
  "nav.overview": "Przegląd",
  "stats.posted.one": "opublikowana propozycja",
  "stats.posted.many": "opublikowanych propozycji",
  "stats.reached": "kobiet dotarło do was",
  "stats.profileViews": "odsłon profilu",
  "period.week": "W tym tygodniu",
  "period.month": "W tym miesiącu",
  "period.all": "Od początku",
  "verify.pendingTitle": "Weryfikacja w toku",
  "verify.pendingBody":
    "Sprawdzamy każdą organizację, zanim jej ogłoszenia dotrą do kobiet. Publikowanie i zapraszanie współpracowników odblokują się zaraz po zakończeniu.",
  "profile.title": "Opowiedzcie nam o swojej organizacji",
  "profile.start": "Zacznij",
  "profile.finish": "Dokończ",
  "empty.title": "Nic jeszcze nie opublikowano",
  "empty.body":
    "Propozycja to jedna rzecz, na którą kobieta może zareagować: kurs, dotacja, dyżur, miejsce w mentoringu. Wasze statystyki zaczną się tutaj, gdy pierwsza z nich będzie aktywna.",
  "empty.cta": "Opublikuj pierwszą propozycję",
  seeAll: "Zobacz wszystkie swoje propozycje",
};

const uk: Catalogue = {
  "language.label": "Мова",
  "nav.overview": "Огляд",
  "stats.posted.one": "опублікована пропозиція",
  "stats.posted.many": "опублікованих пропозицій",
  "stats.reached": "жінок дійшли до вас",
  "stats.profileViews": "переглядів профілю",
  "period.week": "Цього тижня",
  "period.month": "Цього місяця",
  "period.all": "За весь час",
  "verify.pendingTitle": "Перевірка триває",
  "verify.pendingBody":
    "Ми перевіряємо кожну організацію, перш ніж її пропозиції дійдуть до жінок. Публікація та запрошення колег відкриються, щойно це буде завершено.",
  "profile.title": "Розкажіть нам про вашу організацію",
  "profile.start": "Почати",
  "profile.finish": "Завершити",
  "empty.title": "Поки нічого не опубліковано",
  "empty.body":
    "Пропозицією може бути курс, грант, відкритий прийом або місце в менторстві: одна річ, на яку жінка може відгукнутися. Ваші показники почнуться тут, щойно перша стане активною.",
  "empty.cta": "Опублікуйте першу пропозицію",
  seeAll: "Переглянути всі ваші пропозиції",
};

const ar: Catalogue = {
  "language.label": "اللغة",
  "nav.overview": "نظرة عامة",
  "stats.posted.one": "خدمة منشورة",
  "stats.posted.many": "خدمات منشورة",
  "stats.reached": "امرأة وصلت إليكم",
  "stats.profileViews": "زيارة للملف",
  "period.week": "هذا الأسبوع",
  "period.month": "هذا الشهر",
  "period.all": "منذ البداية",
  "verify.pendingTitle": "التحقق جارٍ",
  "verify.pendingBody":
    "نتحقق من كل منظمة قبل أن تصل إعلاناتها إلى النساء. سيُفتح النشر ودعوة الزملاء فور الانتهاء من ذلك.",
  "profile.title": "أخبرونا عن منظمتكم",
  "profile.start": "ابدأوا",
  "profile.finish": "أكملوها",
  "empty.title": "لم يُنشر شيء بعد",
  "empty.body":
    "الخدمة شيء واحد يمكن للمرأة أن تتصرف بناءً عليه: دورة، أو منحة، أو موعد مفتوح، أو مكان في برنامج إرشاد. تبدأ أرقامكم هنا بمجرد أن يصبح أولها متاحًا.",
  "empty.cta": "انشروا أول خدمة لكم",
  seeAll: "عرض كل خدماتكم",
};

const ur: Catalogue = {
  "language.label": "زبان",
  "nav.overview": "مجموعی جائزہ",
  "stats.posted.one": "شائع شدہ خدمت",
  "stats.posted.many": "شائع شدہ خدمات",
  "stats.reached": "خواتین تک رسائی",
  "stats.profileViews": "پروفائل وزٹ",
  "period.week": "اس ہفتے",
  "period.month": "اس مہینے",
  "period.all": "شروع سے اب تک",
  "verify.pendingTitle": "تصدیق جاری ہے",
  "verify.pendingBody":
    "ہم ہر ادارے کی جانچ کرتے ہیں اس سے پہلے کہ اس کے اندراجات خواتین تک پہنچیں۔ اشاعت اور ساتھیوں کو مدعو کرنا اس کے مکمل ہوتے ہی کھل جائے گا۔",
  "profile.title": "ہمیں اپنے ادارے کے بارے میں بتائیں",
  "profile.start": "شروع کریں",
  "profile.finish": "مکمل کریں",
  "empty.title": "ابھی تک کچھ شائع نہیں ہوا",
  "empty.body":
    "خدمت ایک ایسی چیز ہے جس پر ایک عورت عمل کر سکتی ہے: کوئی کورس، گرانٹ، کھلی نشست، یا رہنمائی کی جگہ۔ آپ کے اعداد و شمار یہیں سے شروع ہوں گے جب پہلی خدمت فعال ہو جائے گی۔",
  "empty.cta": "اپنی پہلی خدمت شائع کریں",
  seeAll: "اپنی تمام خدمات دیکھیں",
};

const pa: Catalogue = {
  "language.label": "ਭਾਸ਼ਾ",
  "nav.overview": "ਸੰਖੇਪ ਝਾਤ",
  "stats.posted.one": "ਪ੍ਰਕਾਸ਼ਿਤ ਸੇਵਾ",
  "stats.posted.many": "ਪ੍ਰਕਾਸ਼ਿਤ ਸੇਵਾਵਾਂ",
  "stats.reached": "ਔਰਤਾਂ ਤੱਕ ਪਹੁੰਚ",
  "stats.profileViews": "ਪ੍ਰੋਫਾਈਲ ਵੇਖੇ ਗਏ",
  "period.week": "ਇਸ ਹਫ਼ਤੇ",
  "period.month": "ਇਸ ਮਹੀਨੇ",
  "period.all": "ਹੁਣ ਤੱਕ",
  "verify.pendingTitle": "ਪੁਸ਼ਟੀ ਜਾਰੀ ਹੈ",
  "verify.pendingBody":
    "ਅਸੀਂ ਹਰ ਸੰਸਥਾ ਦੀ ਜਾਂਚ ਕਰਦੇ ਹਾਂ, ਇਸ ਤੋਂ ਪਹਿਲਾਂ ਕਿ ਉਸ ਦੇ ਇੰਦਰਾਜ਼ ਔਰਤਾਂ ਤੱਕ ਪਹੁੰਚਣ। ਪ੍ਰਕਾਸ਼ਿਤ ਕਰਨਾ ਅਤੇ ਸਾਥੀਆਂ ਨੂੰ ਸੱਦਾ ਦੇਣਾ ਇਸ ਦੇ ਪੂਰਾ ਹੁੰਦੇ ਹੀ ਖੁੱਲ੍ਹ ਜਾਵੇਗਾ।",
  "profile.title": "ਸਾਨੂੰ ਆਪਣੀ ਸੰਸਥਾ ਬਾਰੇ ਦੱਸੋ",
  "profile.start": "ਸ਼ੁਰੂ ਕਰੋ",
  "profile.finish": "ਪੂਰਾ ਕਰੋ",
  "empty.title": "ਅਜੇ ਕੁਝ ਪ੍ਰਕਾਸ਼ਿਤ ਨਹੀਂ ਹੋਇਆ",
  "empty.body":
    "ਸੇਵਾ ਇੱਕ ਅਜਿਹੀ ਚੀਜ਼ ਹੈ ਜਿਸ ’ਤੇ ਔਰਤ ਅਮਲ ਕਰ ਸਕਦੀ ਹੈ: ਕੋਈ ਕੋਰਸ, ਗ੍ਰਾਂਟ, ਖੁੱਲ੍ਹੀ ਬੈਠਕ, ਜਾਂ ਮਾਰਗਦਰਸ਼ਨ ਦੀ ਥਾਂ। ਤੁਹਾਡੇ ਅੰਕੜੇ ਇੱਥੋਂ ਸ਼ੁਰੂ ਹੋਣਗੇ ਜਦੋਂ ਪਹਿਲੀ ਸੇਵਾ ਚਾਲੂ ਹੋ ਜਾਵੇਗੀ।",
  "empty.cta": "ਆਪਣੀ ਪਹਿਲੀ ਸੇਵਾ ਪ੍ਰਕਾਸ਼ਿਤ ਕਰੋ",
  seeAll: "ਆਪਣੀਆਂ ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ ਵੇਖੋ",
};

const zh: Catalogue = {
  "language.label": "语言",
  "nav.overview": "总览",
  "stats.posted.one": "条已发布的服务",
  "stats.posted.many": "条已发布的服务",
  "stats.reached": "位女性触达",
  "stats.profileViews": "次主页访问",
  "period.week": "本周",
  "period.month": "本月",
  "period.all": "全部时间",
  "verify.pendingTitle": "审核进行中",
  "verify.pendingBody":
    "在机构的信息能够触达女性之前，我们会先对其进行核实。审核完成后，发布与邀请同事的功能即会开放。",
  "profile.title": "介绍一下你们的机构",
  "profile.start": "开始",
  "profile.finish": "补充完整",
  "empty.title": "尚未发布任何内容",
  "empty.body":
    "一项服务是女性可以实际采取行动的一件事：一门课程、一笔资助、一次开放接待，或一个辅导名额。第一项上线后，你们的数据就会从这里开始。",
  "empty.cta": "发布你们的第一项服务",
  seeAll: "查看你们的全部服务",
};

export const MESSAGES: Record<string, Catalogue> & { en: Record<MessageKey, string> } = {
  en,
  gd,
  sco,
  pl,
  uk,
  ar,
  ur,
  pa,
  zh,
};
