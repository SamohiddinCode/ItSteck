/**
 * Career-orientation quiz content. Everything the director may want to reword
 * lives here — the page itself has no copy of its own.
 *
 * Each option adds weight to one or more directions; the heaviest direction at
 * the end is what gets recommended. `keywords` is how a direction finds real
 * courses in the catalogue (matched against title and description).
 */

export const DIRECTIONS = {
  frontend: {
    title: { ru: 'Фронтенд-разработка', en: 'Frontend development', uz: 'Frontend dasturlash' },
    summary: {
      ru: 'Вам близко то, что видно на экране: интерфейсы, анимации, удобство. Начните с вёрстки и JavaScript.',
      en: 'You gravitate to what people actually see: interfaces, animation, usability. Start with markup and JavaScript.',
      uz: 'Sizga ekranda ko‘rinadigan narsa yaqin: interfeys, animatsiya, qulaylik. Verstka va JavaScript bilan boshlang.',
    },
    keywords: ['front', 'react', 'vue', 'javascript', 'js', 'html', 'css', 'верст', 'вёрст'],
  },
  backend: {
    title: { ru: 'Бэкенд-разработка', en: 'Backend development', uz: 'Backend dasturlash' },
    summary: {
      ru: 'Вам интереснее логика и данные, чем внешний вид. Ваш путь — серверы, базы данных и API.',
      en: 'Logic and data interest you more than looks. Your path is servers, databases and APIs.',
      uz: 'Sizga tashqi ko‘rinishdan ko‘ra mantiq va ma’lumot qiziq. Yo‘lingiz — server, ma’lumotlar bazasi va API.',
    },
    keywords: ['back', 'python', 'node', 'django', 'fastapi', 'php', 'java', 'sql', 'сервер', 'api'],
  },
  design: {
    title: { ru: 'UI/UX-дизайн', en: 'UI/UX design', uz: 'UI/UX dizayn' },
    summary: {
      ru: 'Вы замечаете, когда что-то выглядит и работает неудобно. Дизайн интерфейсов — ваша сильная сторона.',
      en: 'You notice when something looks or feels wrong. Interface design plays to your strengths.',
      uz: 'Nimadir noqulay ko‘rinsa yoki ishlasa, siz buni sezasiz. Interfeys dizayni — kuchli tomoningiz.',
    },
    keywords: ['дизайн', 'design', 'ui', 'ux', 'figma', 'графи', 'grafik'],
  },
  data: {
    title: { ru: 'Данные и аналитика', en: 'Data & analytics', uz: 'Ma’lumot va tahlil' },
    summary: {
      ru: 'Вы любите искать закономерности и делать выводы из цифр. Аналитика данных — про вас.',
      en: 'You like finding patterns and drawing conclusions from numbers. Data analytics fits you.',
      uz: 'Siz qonuniyat topishni va raqamlardan xulosa chiqarishni yoqtirasiz. Ma’lumot tahlili — bu siz.',
    },
    keywords: ['data', 'данн', 'анали', 'analy', 'machine', 'ml', 'sql', 'excel', 'python'],
  },
  mobile: {
    title: { ru: 'Мобильная разработка', en: 'Mobile development', uz: 'Mobil dasturlash' },
    summary: {
      ru: 'Вы хотите делать то, что люди носят в кармане. Мобильные приложения — хороший старт.',
      en: 'You want to build what people carry in their pocket. Mobile apps are a good start.',
      uz: 'Siz odamlar cho‘ntagida olib yuradigan narsani yaratmoqchisiz. Mobil ilovalar — yaxshi boshlanish.',
    },
    keywords: ['mobile', 'мобиль', 'android', 'ios', 'flutter', 'kotlin', 'swift', 'mobil'],
  },
}

export const QUESTIONS = [
  {
    id: 'q1',
    text: {
      ru: 'Что вам интереснее всего в готовом сайте или приложении?',
      en: 'What interests you most about a finished site or app?',
      uz: 'Tayyor sayt yoki ilovada sizga nima eng qiziq?',
    },
    options: [
      {
        text: { ru: 'Как он выглядит и ощущается', en: 'How it looks and feels', uz: 'Qanday ko‘rinishi va his qilinishi' },
        weights: { design: 2, frontend: 1 },
      },
      {
        text: { ru: 'Что происходит «под капотом»', en: 'What happens under the hood', uz: '«Ichkarida» nima sodir bo‘lishi' },
        weights: { backend: 2, data: 1 },
      },
      {
        text: { ru: 'Как быстро он работает на телефоне', en: 'How fast it runs on a phone', uz: 'Telefonda qanchalik tez ishlashi' },
        weights: { mobile: 2, frontend: 1 },
      },
      {
        text: { ru: 'Сколько людей им пользуются и почему', en: 'How many people use it and why', uz: 'Qancha odam foydalanishi va nega' },
        weights: { data: 2 },
      },
    ],
  },
  {
    id: 'q2',
    text: {
      ru: 'Какая задача покажется вам приятной?',
      en: 'Which task sounds enjoyable to you?',
      uz: 'Qaysi vazifa sizga yoqimli tuyuladi?',
    },
    options: [
      {
        text: { ru: 'Подобрать цвета и шрифты так, чтобы всё сошлось', en: 'Pick colours and type until it all clicks', uz: 'Rang va shriftni bir-biriga mos qilib tanlash' },
        weights: { design: 2 },
      },
      {
        text: { ru: 'Собрать страницу по макету, до пикселя', en: 'Build a page from a mockup, pixel by pixel', uz: 'Maketdan sahifani piksel aniqligida yig‘ish' },
        weights: { frontend: 2 },
      },
      {
        text: { ru: 'Разложить большую таблицу и найти в ней закономерность', en: 'Untangle a big table and spot the pattern', uz: 'Katta jadvalni tahlil qilib, qonuniyat topish' },
        weights: { data: 2 },
      },
      {
        text: { ru: 'Написать логику, которая считает и проверяет данные', en: 'Write the logic that computes and validates data', uz: 'Ma’lumotni hisoblaydigan va tekshiradigan mantiq yozish' },
        weights: { backend: 2 },
      },
    ],
  },
  {
    id: 'q3',
    text: {
      ru: 'Как вы относитесь к математике и логическим задачам?',
      en: 'How do you feel about maths and logic puzzles?',
      uz: 'Matematika va mantiqiy masalalarga munosabatingiz qanday?',
    },
    options: [
      {
        text: { ru: 'Очень нравятся — это моё', en: 'Love them — that is my thing', uz: 'Juda yoqadi — bu mening yo‘lim' },
        weights: { data: 2, backend: 2 },
      },
      {
        text: { ru: 'Нормально, если есть понятная цель', en: 'Fine, as long as there is a clear goal', uz: 'Aniq maqsad bo‘lsa, yaxshi' },
        weights: { backend: 1, mobile: 1, frontend: 1 },
      },
      {
        text: { ru: 'Предпочитаю визуальные задачи', en: 'I prefer visual problems', uz: 'Vizual masalalarni afzal ko‘raman' },
        weights: { design: 2, frontend: 1 },
      },
      {
        text: { ru: 'Пока не знаю — хочу попробовать', en: 'Not sure yet — I want to try', uz: 'Hali bilmayman — sinab ko‘rmoqchiman' },
        weights: { frontend: 1, design: 1 },
      },
    ],
  },
  {
    id: 'q4',
    text: {
      ru: 'На каком устройстве вы проводите больше времени?',
      en: 'Which device do you spend more time on?',
      uz: 'Qaysi qurilmada ko‘proq vaqt o‘tkazasiz?',
    },
    options: [
      {
        text: { ru: 'Телефон — почти всё делаю с него', en: 'Phone — I do almost everything on it', uz: 'Telefon — deyarli hamma ishni undan qilaman' },
        weights: { mobile: 2 },
      },
      {
        text: { ru: 'Компьютер — люблю большой экран', en: 'Computer — I like a big screen', uz: 'Kompyuter — katta ekranni yoqtiraman' },
        weights: { backend: 1, frontend: 1, data: 1 },
      },
      {
        text: { ru: 'Планшет — рисую и смотрю', en: 'Tablet — I draw and watch', uz: 'Planshet — chizaman va tomosha qilaman' },
        weights: { design: 2 },
      },
      {
        text: { ru: 'Поровну', en: 'About equally', uz: 'Teng darajada' },
        weights: { frontend: 1, mobile: 1 },
      },
    ],
  },
  {
    id: 'q5',
    text: {
      ru: 'Какой результат работы порадует вас больше?',
      en: 'Which outcome would please you most?',
      uz: 'Qaysi natija sizni ko‘proq quvontiradi?',
    },
    options: [
      {
        text: { ru: 'Красивый экран, которым приятно пользоваться', en: 'A beautiful screen that is a pleasure to use', uz: 'Foydalanish yoqimli bo‘lgan chiroyli ekran' },
        weights: { design: 2, frontend: 1 },
      },
      {
        text: { ru: 'Сервис, который выдерживает тысячи пользователей', en: 'A service that holds up under thousands of users', uz: 'Minglab foydalanuvchiga bardosh beradigan xizmat' },
        weights: { backend: 2 },
      },
      {
        text: { ru: 'Приложение, которое установили друзья', en: 'An app your friends installed', uz: 'Do‘stlaringiz o‘rnatgan ilova' },
        weights: { mobile: 2 },
      },
      {
        text: { ru: 'Отчёт, который помог принять решение', en: 'A report that drove a decision', uz: 'Qaror qabul qilishga yordam bergan hisobot' },
        weights: { data: 2 },
      },
    ],
  },
]

/** Sums the weights of the chosen options and returns the leading direction. */
export function scoreAnswers(answers) {
  const totals = {}
  QUESTIONS.forEach((question, index) => {
    const option = question.options[answers[index]]
    if (!option) return
    for (const [direction, weight] of Object.entries(option.weights)) {
      totals[direction] = (totals[direction] || 0) + weight
    }
  })

  const ranked = Object.entries(totals).sort((a, b) => b[1] - a[1])
  return {
    // A quiz nobody answered still has to return something sensible.
    top: ranked[0]?.[0] || 'frontend',
    totals,
  }
}

/** Courses whose title or description mentions the direction's keywords. */
export function matchCourses(courses, direction) {
  const keywords = DIRECTIONS[direction]?.keywords || []
  const matched = courses.filter((course) => {
    const haystack = `${course.title} ${course.description || ''}`.toLowerCase()
    return keywords.some((keyword) => haystack.includes(keyword))
  })
  // No keyword hit is not a dead end — show the catalogue instead of nothing.
  return matched.length ? matched : courses.slice(0, 3)
}
