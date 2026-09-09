// i18n 사전. (CLAUDE.md §6.3)
// 로케일 추가 = ① Locale 유니온에 코드 추가 ② LOCALES 배열에 추가 ③ dict에 사전 객체 추가.
//   → 컴포넌트는 t.<key>만 참조하므로 수정 불필요.

export type Locale = 'en' | 'ko';

export const LOCALES: readonly Locale[] = ['en', 'ko'];
export const DEFAULT_LOCALE: Locale = 'en';

/** 로케일 선택 UI에 쓰는 표기 (각 언어의 자기이름) */
export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
};

/** 사전 형태 — en을 기준 타입으로 삼아 다른 로케일이 같은 키를 갖도록 강제 */
export interface Dictionary {
  landing: {
    eyebrow: string;
    title: string;
    subtitle: string;
    gender: string;
    /** 성별 이분 선택에 대한 문화적 설명 툴팁 (다양성 배려) — genderWhy=아이콘 라벨, genderNote=본문 */
    genderWhy: string;
    genderNote: string;
    female: string;
    male: string;
    dob: string;
    /** 태어난 시간 (선택) — §7.2: 모름 = 일급 경로(date-based reading) */
    tob: string;
    unknownTime: string;
    dateBasedNote: string;
    year: string;
    month: string;
    day: string;
    cta: string;
    /** 개인정보 마이크로카피 (§7.2 — 생년월일 필드 직하단 필수) */
    privacy: string;
    dateError: string;
  };
  elements: Record<'wood' | 'fire' | 'earth' | 'metal' | 'water', string>;
  result: {
    eyebrow: string;
    deficient: string;
    excess: string;
    back: string;
    loading: string;
    error: string;
    retry: string;
    /** 분포 차트 인라인 태그 (중복 문구 제거 — PO 피드백 #4) */
    lowestTag: string;
    strongestTag: string;
    /** 헤더 좌측 — 홈(입력)으로 돌아가 수정 (라벨=동작 일치, 휴리스틱 #8) */
    editBirth: string;
    /** 결과 하단 추천 직노출 (PO 피드백 #5) */
    recsTitle: string;
    seeAll: string;
    /** 추천 후보가 0건일 때 — 막다른 길 방지 (탐색 CTA는 항상 노출) */
    recsEmpty: string;
  };
  saju: {
    chartTitle: string;
    /** KASI 음양력 변환 결과 — 음력 생일 표기 ({date} 치환) */
    lunar: string;
    /** 윤달 표기 */
    lunarLeap: string;
    year: string;
    month: string;
    day: string;
    hour: string;
    stem: string;
    branch: string;
    /** {element} 자리에 원소명 삽입 (§5.8 공명 톤) */
    resonance: string;
  };
  /** 원소별 상세 가이드 (PDP OTA식 모듈): actions=여기서 하는 것 3개, strengthens=이 기운이 키워주는 것 3개.
   *  §5.8 문화적 해석 톤 — "~로 읽혀요/여겨져요", 효과 단정 금지 */
  elementGuide: Record<'wood' | 'fire' | 'earth' | 'metal' | 'water', {
    actions: { title: string; desc: string }[];
    strengthens: string[];
  }>;
  /** 과잉(가장 강한) 원소 기준 캐릭터 한마디 — 성격 규정형(FAQ Q3, 공유 욕구↑). label=수식어, desc=한 문장 */
  character: Record<'wood' | 'fire' | 'earth' | 'metal' | 'water', { label: string; desc: string }>;
  kstar: {
    title: string;
    forFun: string;
    soulmate: string;
    soulmateDesc: string;
    twin: string;
    twinDesc: string;
    seeAll: string;
  };
  kstarsPage: {
    title: string;
    soulTab: string;
    twinTab: string;
    best: string;
    match: string;
    back: string;
    photoCredit: string;
  };
  explore: {
    cta: string;
    title: string;
    /** {element} 치환 */
    fill: string;
    echo: string;
    empty: string;
    back: string;
  };
  pdp: {
    /** {element} 치환 (§5.8) */
    resonance: string;
    matchTitle: string;
    fillMatch: string;
    /** {element} 치환 */
    fillMatchDesc: string;
    echoMatch: string;
    echoMatchDesc: string;
    balanceMatch: string;
    balanceMatchDesc: string;
    /** 차트 진단 줄 — "{prefix}: 金 0/6 · lowest — {boost}". 불변 서술 대신 보강 동기 카피 */
    chartPrefix: string;
    chartBoostFill: string;
    chartBoostEcho: string;
    /** {element} 치환 — OTA식 상세 모듈 제목 */
    howTitle: string;
    strengthTitle: string;
    /** {element} 치환 — 수집 게이지 라벨 (주어 = 이번 여행, 차트 아님) */
    tripLevel: string;
    afterVisit: string;
    /** {element} 치환 — 문화적 근거(§5.8, 효과 단정 금지). basisFill=결핍 매치 전용(곁에 두기, 리프레이밍 B) */
    basis: string;
    basisFill: string;
    /** 여행자 영상 (YouTube 외부 링크) */
    videosTitle: string;
    videosNote: string;
    /** {name} 치환 — 키 미설정/결과 없음 폴백 링크 */
    videosSearch: string;
    /** 장소별 실데이터 섹션 (detailCommon2/detailIntro2) */
    aboutTitle: string;
    goodToKnow: string;
    hoursLabel: string;
    restLabel: string;
    programLabel: string;
    more: string;
    less: string;
    quiet: string;
    /** 요일별 혼잡 그래프 출처·집계기간 ({period} 치환) */
    crowdSource: string;
    /** 가장 한산한 요일 안내 ({day} 치환) */
    quietDay: string;
    /** 요일 축 라벨 (월~일 7개) */
    days: [string, string, string, string, string, string, string];
    book: string;
    bookNote: string;
    addPlan: string;
    added: string;
    addedToast: string;
    datePrompt: string;
    dateConfirm: string;
    viewPlan: string;
    bookmark: string;
    back: string;
    notFound: string;
  };
  plan: {
    title: string;
    target: string;
    locked: string;
    dates: string;
    start: string;
    end: string;
    day: string;
    empty: string;
    remove: string;
    nearby: string;
    related: string;
    finish: string;
    back: string;
  };
  share: {
    title: string;
    /** {element} 치환 */
    headline: string;
    collected: string;
    save: string;
    share: string;
    /** {element} 치환 */
    shareText: string;
    back: string;
  };
  nav: { saju: string; plan: string; search: string; my: string };
  search: {
    title: string;
    placeholder: string;
    recent: string;
    recentChips: string[];
    /** 오행 태그 검색 (PRD 검색 필드: 장소명·지역명·오행 태그) */
    byElement: string;
    festivals: string;
    festivalsNote: string;
    empty: string;
    back: string;
  };
  my: {
    title: string;
    collected: string;
    resonatesWith: string;
    birth: string;
    savedTrip: string;
    savedTripDesc: string;
    bookmarks: string;
    noBookmarks: string;
    signUp: string;
    editProfile: string;
    settings: string;
    language: string;
    /** {name} 치환 — 로그인 상태 인사 */
    signedInAs: string;
    /** 단수 단위 (1곳/1 place) */
    placeOne: string;
    back: string;
  };
  signup: {
    title: string;
    subtitle: string;
    prefill: string;
    nickname: string;
    nicknameHint: string;
    agree: string;
    privacy: string;
    terms: string;
    aiGen: string;
    create: string;
    later: string;
    back: string;
  };
  checkin: { title: string; done: string; hint: string };
  notFound: { title: string; desc: string; home: string };
  legal: {
    privacyTitle: string;
    termsTitle: string;
    updated: string;
    aiNote: string;
    back: string;
    privacyBody: string[];
    termsBody: string[];
  };
}

const en: Dictionary = {
  landing: {
    eyebrow: 'Eastern astrology · Saju',
    title: 'Travel Korea by the elements you’re missing.',
    subtitle:
      'Your birth chart maps five energies — wood, fire, earth, metal, water. We route your trip toward the ones you lack.',
    gender: 'Gender',
    genderWhy: 'Why only two options?',
    genderNote: 'Traditional saju works in yin\u2013yang pairs, so it uses the female/male distinction recorded at birth. Gender sets the direction of the ten-year luck cycles read from your chart; the element profile shown here comes from your birth date alone. It is not a statement about who you are.',
    female: 'Female',
    male: 'Male',
    dob: 'Date of birth',
    tob: 'Time of birth · optional',
    unknownTime: 'Not sure of your birth time?',
    dateBasedNote: 'No problem — we\u2019ll read from your date alone. A date-based reading is a complete, traditional mode.',
    year: 'Year',
    month: 'Month',
    day: 'Day',
    cta: 'Read my elements',
    privacy: 'We use this only to calculate your elements. It is not shared, and you can delete it anytime in Settings.',
    dateError: "That date doesn't look right — check the day and month.",
  },
  elements: { wood: 'Wood', fire: 'Fire', earth: 'Earth', metal: 'Metal', water: 'Water' },
  result: {
    eyebrow: 'Your five-element balance',
    deficient: 'Lowest · fill it',
    excess: 'Strongest · echo it',
    back: 'Back',
    loading: 'Reading your chart…',
    error: 'Could not read your chart. Please try again.',
    retry: 'Try again',
    lowestTag: 'lowest',
    strongestTag: 'strongest',
    editBirth: 'Edit birth info',
    recsTitle: 'Places that resonate',
    seeAll: 'See all',
    recsEmpty: 'No matches to show right now. Browse everything instead.',
  },
  saju: {
    chartTitle: 'Your saju chart',
    lunar: 'Lunar calendar: {date}',
    lunarLeap: 'leap month',
    year: 'Year',
    month: 'Month',
    day: 'Day',
    hour: 'Hour',
    stem: 'Heavenly stem',
    branch: 'Earthly branch',
    resonance: 'In the five-element tradition, places rich in {element} energy are said to resonate with a chart like yours.',
  },
  elementGuide: {
    wood: {
      actions: [
        { title: 'Walk among the trees', desc: 'A slow 30-minute forest walk is the classic way to keep Wood close.' },
        { title: 'Breathe the green air', desc: 'Deep, unhurried breaths — Wood is read as the energy of growth and renewal.' },
        { title: 'Touch what grows', desc: 'Bark, moss, leaves. Direct contact is said to keep the element near.' },
      ],
      strengthens: ['Growth & new beginnings', 'Flexibility of mind', 'Steady patience'],
    },
    fire: {
      actions: [
        { title: 'Take in the heat', desc: 'Jjimjilbang, kiln, warm springs — warmth is the most direct way to sit with Fire.' },
        { title: 'Stay in the sun', desc: 'A bright hour outdoors; Fire is read as vitality and presence.' },
        { title: 'Join the energy', desc: 'Markets, performances, lively streets — Fire gathers where people do.' },
      ],
      strengthens: ['Vitality & drive', 'Expression', 'Social warmth'],
    },
    earth: {
      actions: [
        { title: 'Get your hands in clay', desc: 'Pottery and mud experiences are the classic Earth practices.' },
        { title: 'Stand on bare ground', desc: 'Slow steps on soil or tidal flats — Earth is read as stability.' },
        { title: 'Eat slowly, locally', desc: 'A grounded meal is part of the practice, not a break from it.' },
      ],
      strengthens: ['Stability & trust', 'Groundedness', 'Steadiness under stress'],
    },
    metal: {
      actions: [
        { title: 'Listen for the bell', desc: 'Temple bells and wind chimes — clear sound is the classic Metal signal.' },
        { title: 'Work with your hands', desc: 'Crafts that reward precision are said to keep the element close.' },
        { title: 'Clear one thing out', desc: 'Metal is read as order — even a tidy pause counts.' },
      ],
      strengthens: ['Focus & decisiveness', 'Clarity', 'Quiet discipline'],
    },
    water: {
      actions: [
        { title: 'Walk by the water', desc: 'Rivers, coasts, lakes — staying near flowing water is the classic Water practice.' },
        { title: 'Soak, don\u2019t rush', desc: 'Hot springs and foot baths; Water is read as recovery.' },
        { title: 'Listen to it move', desc: 'A quiet minute with the sound of water is said to keep the element near.' },
      ],
      strengthens: ['Wisdom & intuition', 'Recovery & calm', 'Going with the flow'],
    },
  },
  character: {
    wood: { label: 'The Grower', desc: 'Wood runs strongest in you — a warm, growing spirit who reaches upward and helps others rise.' },
    fire: { label: 'The Spark', desc: 'Fire runs strongest in you — bright, passionate, the one who lights up any room.' },
    earth: { label: 'The Anchor', desc: 'Earth runs strongest in you — grounded and steady, the person everyone leans on.' },
    metal: { label: 'The Blade', desc: 'Metal runs strongest in you — sharp, principled, clear about what matters.' },
    water: { label: 'The Flow', desc: 'Water runs strongest in you — deep and adaptable, moving wisely around every obstacle.' },
  },
  kstar: {
    title: 'Your K-star matches',
    forFun: 'for fun',
    soulmate: 'Soulmate K-star',
    soulmateDesc: 'Strong where you run low',
    twin: 'Same energy as you',
    twinDesc: 'Shares your strongest element',
    seeAll: 'See all',
  },
  kstarsPage: {
    title: 'Your K-star matches',
    soulTab: 'Best chemistry',
    twinTab: 'Same energy',
    best: 'Top match',
    match: 'match',
    back: 'Back',
    photoCredit: 'Photos: Wikipedia / Wikimedia Commons (CC)',
  },
  explore: {
    cta: 'Find places that resonate',
    title: 'Places that resonate',
    fill: 'Fill · {element}',
    echo: 'Echo · {element}',
    empty: 'No places yet for this element.',
    back: 'Back',
  },
  pdp: {
    resonance: 'A {element}-rich place — said to resonate with a chart like yours.',
    matchTitle: 'Why this fits you',
    fillMatch: 'Fill match',
    fillMatchDesc: 'Your chart runs low on {element} — so this stop surrounds you with it.',
    echoMatch: 'Echo match',
    echoMatchDesc: 'Resonates with {element} — your strongest element.',
    balanceMatch: 'Balance stop',
    balanceMatchDesc: 'Adds a touch of {element} to round out your balance.',
    chartPrefix: 'Your chart',
    chartBoostFill: 'reinforce it here',
    chartBoostEcho: 'amplify it here',
    howTitle: 'How to soak in {element}',
    strengthTitle: 'What {element} strengthens in you',
    tripLevel: '{element} on this trip',
    afterVisit: 'when you check in',
    basis: 'In the five-element tradition, places like this are considered rich in {element} energy.',
    basisFill: "In saju tradition, you don't rewrite your chart — you keep the missing element close. Places like this are where {element} runs strongest.",
    videosTitle: 'Traveler videos',
    videosNote: 'Opens YouTube in a new tab',
    videosSearch: 'Search \u201c{name}\u201d on YouTube',
    aboutTitle: 'About this place',
    goodToKnow: 'Good to know',
    hoursLabel: 'Hours',
    restLabel: 'Closed',
    programLabel: 'Programs here',
    more: 'More',
    less: 'Less',
    quiet: 'When it is quiet',
    crowdSource: 'Korea Tourism Data Lab · regional visitors, {period}',
    quietDay: 'Quietest around {day}',
    days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    book: 'Book',
    bookNote: 'Opens a Yeogi Attae search in a new tab',
    addPlan: 'Add to itinerary',
    added: 'Added to itinerary',
    addedToast: 'Added to your itinerary',
    datePrompt: 'When is your trip?',
    dateConfirm: 'Save & add',
    viewPlan: 'View itinerary',
    bookmark: 'Save this place',
    back: 'Back',
    notFound: 'Place not found.',
  },
  plan: {
    title: 'My itinerary',
    target: 'Filling',
    locked: 'locked',
    dates: 'Trip dates',
    start: 'Start',
    end: 'End',
    day: 'Day',
    empty: 'No places yet. Add some from a place page.',
    remove: 'Remove',
    nearby: 'Nearby stay & food will be added automatically (with live data).',
    related: 'Popular nearby',
    finish: 'Finish & make share card',
    back: 'Back',
  },
  share: {
    title: 'Trip summary',
    headline: 'I filled my {element} in Korea',
    collected: 'collected',
    save: 'Save image',
    share: 'Share',
    shareText: 'My SajuTrip — I filled my {element} in Korea.',
    back: 'Back',
  },
  nav: { saju: 'Saju', plan: 'Trips', search: 'Search', my: 'My' },
  search: {
    title: 'Search',
    placeholder: 'Search places, regions',
    recent: 'Recent',
    recentChips: ['Hot springs', 'Temple stay', 'Forest healing'],
    byElement: 'Browse by element',
    festivals: 'Festivals this week',
    festivalsNote: 'Festival feed coming soon.',
    empty: 'No results.',
    back: 'Back',
  },
  my: {
    title: 'My page',
    collected: 'Elements',
    resonatesWith: 'Resonates with',
    birth: 'Birth',
    savedTrip: 'Saved itinerary',
    savedTripDesc: 'places',
    bookmarks: 'Saved',
    noBookmarks: 'Tap the bookmark on a place to keep it here.',
    signUp: 'Sign up to save everything',
    editProfile: 'Edit profile',
    settings: 'Settings',
    language: 'Language',
    signedInAs: 'Signed in as {name}',
    placeOne: 'place',
    back: 'Back',
  },
  signup: {
    title: 'Create your account',
    subtitle: 'So your reading, saved places and trips are here next time.',
    prefill: 'Gender / birth · pre-filled',
    nickname: 'Nickname · optional',
    nicknameHint: 'e.g. Fire Traveler',
    agree: 'I agree to the',
    privacy: 'Privacy Policy',
    terms: 'Terms',
    aiGen: 'AI-generated',
    create: 'Create account',
    later: 'Maybe later',
    back: 'Back',
  },
  checkin: {
    title: 'While traveling · check in',
    done: "Today's activity done — auto-prompt at 8 PM",
    hint: 'Check off elements as you collect them.',
  },
  notFound: {
    title: 'This path isn\u2019t on the map',
    desc: 'The page moved or never existed. Start again from your reading.',
    home: 'Back to home',
  },
  legal: {
    privacyTitle: 'Privacy policy',
    termsTitle: 'Terms of service',
    updated: 'Last updated: Aug 2026',
    aiNote: 'This document was drafted with AI assistance and is provided for the SajuTrip proof of concept.',
    back: 'Back',
    privacyBody: [
      'SajuTrip collects only the minimum information needed to generate your element reading: gender and date of birth. We do not ask for your name, email, phone number, or precise location.',
      'During this proof-of-concept phase, your inputs and saved itineraries are stored only in your browser (localStorage). They are not transmitted to or stored on our servers, and clearing your browser data removes them completely.',
      'Your birth date is sent to the Korea Astronomy and Space Science Institute (KASI) open API solely to calculate your traditional calendar pillars. It is not stored by SajuTrip after the calculation.',
      'Anonymous usage events (page views, funnel steps) may be logged without any personal identifier to improve the service.',
      'Your reading is a cultural interpretation based on traditional Five Elements thought, offered for enjoyment — it is not medical, financial, or life advice.',
      'For questions about this policy, contact the SajuTrip team.',
    ],
    termsBody: [
      'SajuTrip is a web service that suggests travel destinations in Korea framed by the traditional Five Elements (Saju) reading derived from your gender and date of birth.',
      'Readings and recommendations are cultural and entertainment content. In traditional Five Elements thought certain places are considered to resonate with certain energies; SajuTrip presents this as playful interpretation, not as verified effect.',
      'Place information (names, images, congestion, festivals) comes from Korea Tourism Organization open APIs and may change or contain errors. Always confirm details with the venue before visiting.',
      'Booking links may lead to third-party services (e.g. OTA partners). Reservations and payments are handled entirely by those services under their own terms; SajuTrip may earn an affiliate commission.',
      'The service is provided as is during the proof-of-concept period and may change or be discontinued without notice.',
      'By using SajuTrip you agree to use it lawfully and accept these terms.',
    ],
  },
};

const ko: Dictionary = {
  landing: {
    eyebrow: '동양 사주 · 오행',
    title: '당신에게 부족한 기운을 채우는 한국 여행',
    subtitle:
      '사주는 다섯 기운(목·화·토·금·수)의 분포예요. 당신에게 부족한 기운으로 여행을 안내합니다.',
    gender: '성별',
    genderWhy: '왜 두 가지만 있나요?',
    genderNote: '전통 사주는 음양 체계라 출생 시 기록된 여자·남자 구분을 씁니다. 성별은 명식에서 읽는 대운(10년 단위 운의 흐름)의 방향을 정하는 데 쓰이고, 지금 보시는 오행 프로필은 생년월일만으로 나와요. 당신이 어떤 사람인지에 대한 판단은 아니에요.',
    female: '여성',
    male: '남성',
    dob: '생년월일',
    tob: '태어난 시간 · 선택',
    unknownTime: '태어난 시간을 잘 모르나요?',
    dateBasedNote: '괜찮아요 — 날짜만으로 읽어드려요. 날짜 기반 리딩도 완전한 전통 방식이에요.',
    year: '년',
    month: '월',
    day: '일',
    cta: '내 오행 보기',
    privacy: '입력한 생년월일은 오행 계산에만 사용해요. 외부에 공유되지 않으며 설정에서 언제든 삭제할 수 있어요.',
    dateError: '날짜가 맞지 않아요 — 일과 월을 확인해 주세요.',
  },
  elements: { wood: '목 木', fire: '화 火', earth: '토 土', metal: '금 金', water: '수 水' },
  result: {
    eyebrow: '나의 오행 분포',
    deficient: '가장 부족 · 채우기',
    excess: '가장 넘침 · 공명',
    back: '뒤로',
    loading: '사주를 읽는 중…',
    error: '사주를 불러오지 못했어요. 다시 시도해 주세요.',
    retry: '다시 시도',
    lowestTag: '가장 부족',
    strongestTag: '가장 강함',
    editBirth: '입력 수정',
    recsTitle: '공명하는 장소',
    seeAll: '전체 보기',
    recsEmpty: '지금 보여드릴 장소를 못 찾았어요. 전체 목록에서 골라보세요.',
  },
  saju: {
    chartTitle: '나의 사주 명식',
    lunar: '음력 {date}',
    lunarLeap: '윤달',
    year: '연주',
    month: '월주',
    day: '일주',
    hour: '시주',
    stem: '천간',
    branch: '지지',
    resonance: '전통 오행에서는 {element} 기운이 강한 곳이 당신과 공명한다고 여겨져요.',
  },
  elementGuide: {
    wood: {
      actions: [
        { title: '나무 사이를 걷기', desc: '숲길을 30분쯤 천천히 — 걷기는 木을 곁에 두는 가장 고전적인 방법이에요.' },
        { title: '초록 공기 깊게 마시기', desc: '서두르지 않는 깊은 호흡. 木은 성장과 재생의 기운으로 읽혀요.' },
        { title: '자라는 것을 만져보기', desc: '나무껍질·이끼·잎. 직접 닿는 것이 기운을 곁에 둔다고 여겨져요.' },
      ],
      strengthens: ['성장과 새 시작', '유연한 마음', '꾸준한 인내'],
    },
    fire: {
      actions: [
        { title: '열기 쬐기', desc: '찜질방·가마·온열 체험 — 따뜻함은 火를 가장 직접 느끼는 방법이에요.' },
        { title: '햇볕 아래 머물기', desc: '밝은 야외에서 한 시간. 火는 활력과 존재감의 기운으로 읽혀요.' },
        { title: '활기에 섞이기', desc: '시장·공연·북적이는 거리 — 火는 사람이 모이는 곳에 모여요.' },
      ],
      strengthens: ['활력과 추진력', '표현력', '사람을 데우는 온기'],
    },
    earth: {
      actions: [
        { title: '흙 만지기', desc: '도예·머드 체험은 土의 가장 고전적인 수련이에요.' },
        { title: '맨땅 딛기', desc: '흙길·갯벌 위 느린 걸음. 土는 안정의 기운으로 읽혀요.' },
        { title: '천천히, 그 지역의 식사', desc: '든든한 한 끼도 수련의 일부예요.' },
      ],
      strengthens: ['안정과 신뢰', '중심 잡기', '흔들리지 않는 꾸준함'],
    },
    metal: {
      actions: [
        { title: '종소리에 귀 기울이기', desc: '사찰 범종·풍경 — 맑은 소리는 金의 고전적 신호예요.' },
        { title: '손끝을 쓰는 작업', desc: '정교함이 필요한 공방 체험이 기운을 곁에 둔다고 여겨져요.' },
        { title: '하나 정리하기', desc: '金은 질서의 기운 — 단정한 멈춤도 수련이에요.' },
      ],
      strengthens: ['집중과 결단', '명료함', '조용한 절제'],
    },
    water: {
      actions: [
        { title: '물가를 걷기', desc: '강·바다·호수 — 흐르는 물 곁이 水의 고전적 수련이에요.' },
        { title: '서두르지 않고 몸 담그기', desc: '온천·족욕. 水는 회복의 기운으로 읽혀요.' },
        { title: '물소리 듣기', desc: '물 흐르는 소리에 잠시 머무는 것만으로 기운을 곁에 둔다고 여겨져요.' },
      ],
      strengthens: ['지혜와 직관', '회복과 평온', '유연하게 흐르기'],
    },
  },
  character: {
    wood: { label: '자라나는 사람', desc: '당신은 목(木) 기운이 가장 강해요 — 위로 뻗고 주변을 함께 키우는 따뜻한 성장형.' },
    fire: { label: '빛나는 사람', desc: '당신은 화(火) 기운이 가장 강해요 — 밝고 열정적이며 어디서든 분위기를 밝히는 사람.' },
    earth: { label: '든든한 사람', desc: '당신은 토(土) 기운이 가장 강해요 — 안정적이고 믿음직해 모두가 기대는 중심.' },
    metal: { label: '벼려진 사람', desc: '당신은 금(金) 기운이 가장 강해요 — 예리하고 원칙 있으며 중요한 걸 분명히 아는 사람.' },
    water: { label: '흐르는 사람', desc: '당신은 수(水) 기운이 가장 강해요 — 깊고 유연해 어떤 장애물도 지혜롭게 돌아가는 사람.' },
  },
  kstar: {
    title: '나의 K-star',
    forFun: '재미로',
    soulmate: '소울메이트 K스타',
    soulmateDesc: '내게 부족한 기운이 강한 별',
    twin: '나와 닮은 K스타',
    twinDesc: '나와 같은 강한 기운',
    seeAll: '더보기',
  },
  kstarsPage: {
    title: '나의 K스타 매칭',
    soulTab: '궁합 잘 맞는',
    twinTab: '같은 기운',
    best: '최고 매치',
    match: '궁합',
    back: '뒤로',
    photoCredit: '사진: 위키피디아 / 위키미디어 커먼즈 (CC)',
  },
  explore: {
    cta: '공명하는 장소 찾기',
    title: '공명하는 장소',
    fill: '채우기 · {element}',
    echo: '공명 · {element}',
    empty: '이 원소의 장소가 아직 없어요.',
    back: '뒤로',
  },
  pdp: {
    resonance: '{element} 기운이 강한 곳 — 당신의 사주와 공명한다고 여겨져요.',
    matchTitle: '나와 잘 맞을까',
    fillMatch: '채우기 매칭',
    fillMatchDesc: '명식에 {element} 기운이 적은 당신 — 이곳이 그 기운을 곁에 채워줘요.',
    echoMatch: '공명 매칭',
    echoMatchDesc: '가장 강한 {element} 기운과 공명하는 곳이에요.',
    balanceMatch: '균형 스팟',
    balanceMatchDesc: '{element} 기운을 더해 오행 균형을 잡아줘요.',
    chartPrefix: '내 명식',
    chartBoostFill: '이곳에서 보강해요',
    chartBoostEcho: '이곳에서 증폭해요',
    howTitle: '{element} 기운, 이렇게 채워요',
    strengthTitle: '{element} 기운이 키워주는 것',
    tripLevel: '이번 여행의 {element}',
    afterVisit: '체크인하면',
    basis: '전통 오행에서 이런 곳은 {element} 기운이 깃든 곳으로 여겨져요.',
    basisFill: '전통 명리에서도 사주를 바꾸는 게 아니라, 부족한 기운을 곁에 두는 것으로 풀어요. 이곳은 {element} 기운이 가장 진하게 흐르는 곳.',
    videosTitle: '여행자 영상 후기',
    videosNote: '유튜브 새 탭으로 열려요',
    videosSearch: '유튜브에서 \u201c{name}\u201d 검색',
    aboutTitle: '이곳 소개',
    goodToKnow: '알아두면 좋아요',
    hoursLabel: '이용시간',
    restLabel: '휴무',
    programLabel: '체험 프로그램',
    more: '더보기',
    less: '접기',
    quiet: '여유로운 시간',
    crowdSource: '한국관광 데이터랩 · 지역 방문자수 {period}',
    quietDay: '{day} 무렵이 가장 한산해요',
    days: ['월', '화', '수', '목', '금', '토', '일'],
    book: '예약하기',
    bookNote: '여기어때 검색 결과로 연결돼요 (새 탭)',
    addPlan: '일정에 담기',
    added: '일정에 담겼어요',
    addedToast: '일정에 담았어요',
    datePrompt: '여행 일자를 알려주세요',
    dateConfirm: '저장하고 담기',
    viewPlan: '일정 보기',
    bookmark: '이 장소 찜하기',
    back: '뒤로',
    notFound: '장소를 찾을 수 없어요.',
  },
  plan: {
    title: '내 일정',
    target: '채우는 기운',
    locked: '고정',
    dates: '여행 일자',
    start: '시작일',
    end: '종료일',
    day: '일차',
    empty: '담은 장소가 없어요. 장소 상세에서 담아보세요.',
    remove: '빼기',
    nearby: '주변 숙박·음식 동선은 자동 확장 예정(실데이터 연동 시).',
    related: '주변 인기 관광지',
    finish: '완성하고 공유 카드 만들기',
    back: '뒤로',
  },
  share: {
    title: '여행 요약',
    headline: '한국에서 {element} 기운을 채웠어요',
    collected: '수집',
    save: '이미지 저장',
    share: '공유',
    shareText: '사주트립 — 한국에서 {element} 기운을 채웠어요.',
    back: '뒤로',
  },
  nav: { saju: '사주', plan: '내 일정', search: '검색', my: '마이' },
  search: {
    title: '검색',
    placeholder: '장소·지역 검색',
    recent: '최근 검색',
    recentChips: ['온천', '템플스테이', '숲치유'],
    byElement: '오행으로 찾기',
    festivals: '이번 주 축제',
    festivalsNote: '축제 API 연동 예정.',
    empty: '결과가 없어요.',
    back: '뒤로',
  },
  my: {
    title: '마이페이지',
    collected: '내 오행',
    resonatesWith: '공명하는 기운',
    birth: '생년월일',
    savedTrip: '저장한 일정',
    savedTripDesc: '곳',
    bookmarks: '찜',
    noBookmarks: '장소의 북마크를 누르면 여기에 담겨요.',
    signUp: '회원가입하고 전부 저장하기',
    editProfile: '프로필 수정',
    settings: '설정',
    language: '언어',
    signedInAs: '{name} 님',
    placeOne: '곳',
    back: '뒤로',
  },
  signup: {
    title: '회원가입',
    subtitle: '사주 결과·찜·일정을 다음에도 볼 수 있게 저장해요.',
    prefill: '성별 / 생년월일 · 자동 입력됨',
    nickname: '닉네임 · 선택',
    nicknameHint: '예: Fire Traveler',
    agree: '동의합니다:',
    privacy: '개인정보처리방침',
    terms: '이용약관',
    aiGen: 'AI 생성',
    create: '가입하기',
    later: '나중에',
    back: '뒤로',
  },
  checkin: {
    title: '여행 중 · 체크인',
    done: '오늘 활동 완료 — 오후 8시 자동 알림',
    hint: '기운을 채울 때마다 체크하세요.',
  },
  notFound: {
    title: '이 길은 지도에 없어요',
    desc: '주소가 바뀌었거나 없는 페이지예요. 처음부터 다시 시작해 보세요.',
    home: '홈으로',
  },
  legal: {
    privacyTitle: '개인정보처리방침',
    termsTitle: '이용약관',
    updated: '최종 수정: 2026년 8월',
    aiNote: '이 문서는 AI의 도움으로 작성되었으며, 사주트립 POC를 위해 제공됩니다.',
    back: '뒤로',
    privacyBody: [
      '사주트립은 오행 프로필 산출에 필요한 최소 정보인 성별과 생년월일만 수집합니다. 이름·이메일·전화번호·정밀 위치 정보는 요구하지 않습니다.',
      'POC 기간 동안 입력값과 저장한 일정은 이용자의 브라우저(localStorage)에만 저장되며, 서버로 전송·보관되지 않습니다. 브라우저 데이터를 삭제하면 완전히 제거됩니다.',
      '생년월일은 전통 역법 기둥(간지) 계산을 위해 한국천문연구원(KASI) 공공 API로만 전송되며, 계산 후 사주트립이 별도로 저장하지 않습니다.',
      '서비스 개선을 위해 개인 식별자 없는 익명 사용 이벤트(페이지 조회, 퍼널 단계)가 기록될 수 있습니다.',
      '사주 결과는 전통 오행 사상에 기반한 문화적 해석으로 재미를 위해 제공되며, 의료·재정·인생에 대한 조언이 아닙니다.',
      '본 방침에 대한 문의는 사주트립 팀으로 연락해 주세요.',
    ],
    termsBody: [
      '사주트립은 성별·생년월일로 산출한 전통 오행(사주) 프로필을 바탕으로 한국 여행지를 제안하는 웹 서비스입니다.',
      '사주 풀이와 추천은 문화·오락 콘텐츠입니다. 전통 오행 사상에서 특정 공간이 특정 기운과 공명한다고 여겨지는 해석을 놀이로 제공하는 것이며, 검증된 효과를 주장하지 않습니다.',
      '장소 정보(명칭·이미지·혼잡도·축제)는 한국관광공사 공공 API에서 제공받으며 변경되거나 오류가 있을 수 있습니다. 방문 전 반드시 현장 정보를 확인해 주세요.',
      '예약 링크는 제3자 서비스(OTA 제휴사 등)로 연결될 수 있습니다. 예약·결제는 해당 서비스의 약관에 따라 전적으로 그 서비스에서 처리되며, 사주트립은 제휴 커미션을 받을 수 있습니다.',
      'POC 기간 동안 서비스는 있는 그대로 제공되며, 사전 고지 없이 변경·중단될 수 있습니다.',
      '사주트립을 이용함으로써 적법한 이용과 본 약관에 동의하는 것으로 간주됩니다.',
    ],
  },
};

export const dict: Record<Locale, Dictionary> = { en, ko };
