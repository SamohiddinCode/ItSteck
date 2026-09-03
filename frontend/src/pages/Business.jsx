import { useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowRight, BarChart3, Bot, BriefcaseBusiness, Building2, Check,
  ChevronDown, Clock3, Code2, FileCheck2, Headphones, Laptop2,
  LineChart, MessageSquareText, ShieldCheck, Sparkles, Users, Zap,
} from 'lucide-react'
import Button from '@/components/ui/Button'
import Input, { Select } from '@/components/ui/Input'
import PhoneInput from '@/components/ui/PhoneInput'
import { leadService } from '@/services/leadService'
import { isValidSubscriber, toE164 } from '@/utils/phone'
import { useI18n } from '@/i18n'

const copy = {
  ru: {
    badge: 'Корпоративное обучение IT-команд',
    title: 'Развивайте команду. Усиливайте бизнес.',
    sub: 'Практическое обучение под задачи вашей компании: от цифровой грамотности до разработки, кибербезопасности и AI-автоматизации.',
    discuss: 'Обсудить обучение', programs: 'Смотреть программы',
    facts: [['100%', 'живые занятия с менторами'], ['HR-дашборд', 'контроль посещаемости и прогресса'], ['Кастомный стек', 'программа под задачи компании'], ['от 5 чел.', 'скидки от объёма']],
    audienceTitle: 'Решения для трёх ключевых типов команд',
    audienceSub: 'Каждое направление сфокусировано на конкретной бизнес-задаче.',
    audiences: [
      { icon: Code2, tag: 'IT-команды и стартапы', title: 'Доучить и переквалифицировать Junior-сотрудников', text: 'Повышаем продуктивность новичков, синхронизируем стек технологий и сокращаем срок онбординга.', bullets: ['Frontend: React, TypeScript, Next.js', 'Backend: Node.js, Python', 'Code review, Git flow и CI/CD', 'QA и кибербезопасность'] },
      { icon: Building2, tag: 'Компании вне IT', title: 'Цифровая грамотность, AI-инструменты и кибергигиена', text: 'Обучаем маркетинг, продажи, логистику, финансы и HR практической работе с современными инструментами.', bullets: ['ChatGPT, Claude, Copilot', 'Автоматизация отчётов и презентаций', 'Работа с данными', 'Безопасная работа с информацией'] },
      { icon: Headphones, tag: 'Кол-центры и операционные отделы', title: 'Автоматизация через «вайб-кодинг» и no-code', text: 'Учим автоматизировать рутинные процессы без глубокого погружения в computer science.', bullets: ['Cursor, Claude Code и ChatGPT', 'Утилиты за часы', 'Telegram-боты и интеграции', 'Быстрее обработка запросов'] },
    ],
    formatTag: 'Что мы предлагаем', formatTitle: 'Корпоративный формат под ключ', formatSub: 'Всё необходимое для прозрачного, эффективного и измеримого обучения вашей команды.',
    benefits: [
      [Users, 'Корпоративные группы', 'Закрытый поток только для вашей команды с разбором реальных кейсов под NDA.'],
      [BarChart3, 'Отчётность для руководства', 'Посещаемость, успеваемость, домашние задания и срезы прогресса для HR.'],
      [Clock3, 'Гибкий график', 'Утром, днём, вечером или в выходные — без остановки рабочих процессов.'],
      [Sparkles, 'Скидки от объёма', 'Специальные условия для групп от 5, 15 и 30 сотрудников.'],
      [Zap, 'Кастомные программы', 'Адаптируем программу под стек, инструменты и реальные задачи компании.'],
      [FileCheck2, 'Официальный договор', 'Полный пакет закрывающих документов и счетов-фактур.'],
    ],
    programTag: 'Популярные направления B2B', programTitle: 'Готовые программы и кастомные треки', custom: 'Запросить программу под свой стек',
    programList: [
      ['AI-инструменты и вайб-кодинг для бизнеса', '1–2 месяца · 32 часа', ['Промпт-инжиниринг', 'Cursor и AI-кодинг', 'Автоматизация таблиц и CRM', 'Telegram-боты']],
      ['Upskilling Junior → Middle разработчиков', '2–4 месяца · 64 часа', ['TypeScript и React Architecture', 'Node.js / Python REST API', 'Clean Code & Patterns', 'Code Review и CI/CD']],
      ['Кибергигиена и цифровая безопасность', '2–4 недели · 16 часов', ['Защита от фишинга', 'Парольная политика и 2FA', 'Безопасная работа с данными', 'Инцидент-менеджмент']],
      ['Кастомный стек под запрос компании', 'Индивидуально', ['Анализ вашего стека', 'Авторская программа', 'Проект на кодовой базе компании', 'Финальная аттестация']],
    ],
    calcTag: 'Калькулятор обучения', calcTitle: 'Оцените параметры для вашей команды', calcSub: 'Выберите размер группы и направление — получите предварительную оценку условий.',
    employees: 'Количество сотрудников', direction: 'Направление обучения', schedule: 'График занятий',
    directions: ['AI-инструменты и вайб-кодинг', 'Junior → Middle Upskilling', 'Кибергигиена и безопасность', 'Кастомная программа'],
    schedules: ['Вечерний', 'Рабочие дни', 'Выходные', 'Экспресс-интенсив'],
    estimate: 'Ориентировочные параметры потока', discount: 'Скидка от объёма', hours: 'Объём занятий', duration: 'Срок обучения', report: 'Отчётность для руководства включена', requestCalc: 'Запросить детальный расчёт',
    stepsTag: 'Как мы работаем', stepsTitle: 'От заявки до измеримого результата',
    steps: [['01', 'Аудит и брифинг', 'Определяем стек, задачи и бизнес-KPI.'], ['02', 'Кастомизация программы', 'Методисты адаптируют трек под вашу команду.'], ['03', 'Входное тестирование', 'Оцениваем уровень и делим сотрудников на группы.'], ['04', 'Живые занятия и отчёты', 'Менторы ведут практику, HR получает аналитику.'], ['05', 'Защита проектов', 'Итоговый срез компетенций и сертификаты.']],
    formTag: 'Прямая связь', formTitle: 'Обсудить корпоративное обучение', formSub: 'Оставьте заявку — B2B-эксперт свяжется с вами и подготовит персональное предложение.', company: 'Название компании', companyPh: 'ООО «Ваша компания»', contact: 'Ваше имя и должность', contactPh: 'Имя, HR Director', team: 'Размер команды', phone: 'Рабочий телефон', wish: 'Направление', send: 'Запросить коммерческое предложение', sending: 'Отправляем…', success: 'Заявка отправлена. Мы свяжемся с вами в ближайшее время.', required: 'Заполните название компании, имя и корректный телефон.',
    faqTag: 'FAQ', faqTitle: 'Частые вопросы о корпоративном обучении', faqs: [
      ['Работаете ли вы по официальному договору и безналичному расчёту?', 'Да, работаем с юридическими лицами по официальному договору и предоставляем полный пакет закрывающих документов.'],
      ['Можно ли адаптировать программу под специфику нашего бизнеса?', 'Да. Перед стартом проводим аудит задач, стека и уровня команды, после чего адаптируем программу и практические проекты.'],
      ['Как руководство узнает о прогрессе?', 'Предоставляем регулярные отчёты по посещаемости, успеваемости, домашним заданиям и динамике навыков.'],
      ['На каком языке проходят занятия?', 'Занятия доступны на русском и узбекском языках.'],
      ['Что делать, если сотрудник пропустил занятие?', 'Предоставим материалы и запись, а при необходимости организуем отработку с куратором.'],
    ],
    cta: 'Готовы повысить продуктивность и IT-навыки вашей команды?', ctaSub: 'Обсудим задачи бизнеса и составим программу за один рабочий день.',
  },
  en: { nav: 'For Business' }, uz: { nav: 'Biznes uchun' },
}

const fadeUp = (delay = 0) => ({ initial: { opacity: 0, y: 22 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, amount: 0.15 }, transition: { duration: 0.5, delay } })

function SectionHead({ tag, title, sub }) {
  return <motion.div {...fadeUp()} className="text-center max-w-3xl mx-auto mb-12">
    {tag && <p className="text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-3">{tag}</p>}
    <h2 className="section-title mb-4">{title}</h2>
    {sub && <p className="text-muted text-lg leading-relaxed">{sub}</p>}
  </motion.div>
}

export default function Business() {
  const { lang } = useI18n()
  const c = copy[lang]?.title ? copy[lang] : copy.ru
  const [people, setPeople] = useState(8)
  const [direction, setDirection] = useState(c.directions[0])
  const [schedule, setSchedule] = useState(c.schedules[0])
  const [faq, setFaq] = useState(0)
  const [form, setForm] = useState({ company: '', contact: '', phone: '', team: '5–10', wish: c.directions[0] })
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)
  const estimate = useMemo(() => ({ discount: people >= 30 ? '25%' : people >= 15 ? '20%' : people >= 8 ? '15%' : '10%', hours: direction.includes('Junior') ? 64 : direction.includes('безопас') ? 16 : 32, duration: direction.includes('Junior') ? '2–4 месяца' : direction.includes('безопас') ? '2–4 недели' : '1–2 месяца' }), [people, direction])
  const scrollTo = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  const submit = async () => {
    if (!form.company.trim() || !form.contact.trim() || !isValidSubscriber(form.phone)) return setStatus('error')
    setLoading(true); setStatus('')
    try {
      await leadService.create({ name: `${form.contact.trim()} — B2B: ${form.company.trim()} · ${form.team} · ${form.wish}`, phone: toE164(form.phone) })
      setStatus('success')
    } catch { setStatus('failed') } finally { setLoading(false) }
  }

  return <div className="overflow-hidden">
    <section className="relative px-6 py-24 md:py-32">
      <div className="absolute inset-0 pointer-events-none"><div className="absolute w-[700px] h-[430px] bg-primary/10 blur-[130px] rounded-full left-1/2 top-1/3 -translate-x-1/2" /></div>
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div {...fadeUp()} className="inline-flex items-center gap-2 border border-primary/30 bg-primary/5 rounded-full px-4 py-1.5 text-primary text-sm font-medium mb-7"><BriefcaseBusiness className="w-4 h-4" />{c.badge}</motion.div>
        <motion.h1 {...fadeUp(.1)} className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">{c.title}</motion.h1>
        <motion.p {...fadeUp(.2)} className="text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-9">{c.sub}</motion.p>
        <motion.div {...fadeUp(.3)} className="flex flex-col sm:flex-row gap-3 justify-center"><button onClick={() => scrollTo('b2b-form')} className="btn bg-primary hover:bg-primary-hover text-white h-12 px-7 shadow-glow">{c.discuss}<ArrowRight className="w-4 h-4" /></button><button onClick={() => scrollTo('b2b-programs')} className="btn bg-surface-2 hover:bg-border border border-border h-12 px-7">{c.programs}</button></motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-16">{c.facts.map(([v,l],i)=><motion.div key={v} {...fadeUp(.35+i*.06)} className="card p-5"><div className="font-display text-xl md:text-2xl font-bold text-primary">{v}</div><div className="text-muted text-xs mt-1">{l}</div></motion.div>)}</div>
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-6 py-24"><SectionHead tag="Кому мы помогаем" title={c.audienceTitle} sub={c.audienceSub}/><div className="grid lg:grid-cols-3 gap-6">{c.audiences.map(({icon:Icon,tag,title,text,bullets},i)=><motion.article key={title} {...fadeUp(i*.08)} className="card p-7 flex flex-col hover:border-primary/30 transition-colors"><div className="flex items-center gap-3 text-xs text-primary font-semibold mb-5"><span className="w-10 h-10 bg-primary/10 border border-primary/20 rounded-xl grid place-items-center"><Icon className="w-5 h-5"/></span>{tag}</div><h3 className="font-display text-xl font-bold mb-3">{title}</h3><p className="text-muted text-sm leading-relaxed mb-6">{text}</p><ul className="space-y-3 mt-auto">{bullets.map(x=><li key={x} className="flex gap-2 text-sm text-muted"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"/>{x}</li>)}</ul><button onClick={() => scrollTo('b2b-form')} className="btn bg-surface-2 hover:bg-border h-10 mt-7 text-sm">{c.custom}<ArrowRight className="w-4 h-4"/></button></motion.article>)}</div></section>

    <section className="border-y border-border/40 bg-surface/30"><div className="max-w-7xl mx-auto px-6 py-24"><SectionHead tag={c.formatTag} title={c.formatTitle} sub={c.formatSub}/><div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{c.benefits.map(([Icon,title,text],i)=><motion.div key={title} {...fadeUp(i*.05)} className="card p-6"><Icon className="w-5 h-5 text-primary mb-4"/><h3 className="font-display font-semibold mb-2">{title}</h3><p className="text-muted text-sm leading-relaxed">{text}</p></motion.div>)}</div></div></section>

    <section id="b2b-programs" className="max-w-7xl mx-auto px-6 py-24 scroll-mt-24"><SectionHead tag={c.programTag} title={c.programTitle}/><div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">{c.programList.map(([title,meta,items],i)=><motion.article key={title} {...fadeUp(i*.07)} className="card p-6 flex flex-col"><div className="w-9 h-9 rounded-lg bg-primary/10 text-primary grid place-items-center mb-5">{i===0?<Bot/>:i===1?<Laptop2/>:i===2?<ShieldCheck/>:<Sparkles/>}</div><h3 className="font-display font-bold text-lg min-h-14">{title}</h3><p className="text-primary text-xs font-semibold mt-3 mb-5">{meta}</p><ul className="space-y-2.5 flex-1">{items.map(x=><li key={x} className="flex gap-2 text-muted text-sm"><Check className="w-4 h-4 text-primary shrink-0"/>{x}</li>)}</ul><button onClick={() => scrollTo('b2b-form')} className="btn bg-primary hover:bg-primary-hover text-white h-10 mt-6 text-sm">{c.discuss}</button></motion.article>)}</div></section>

    <section className="border-y border-border/40 bg-surface/30"><div className="max-w-6xl mx-auto px-6 py-24"><SectionHead tag={c.calcTag} title={c.calcTitle} sub={c.calcSub}/><div className="grid lg:grid-cols-2 gap-6"><motion.div {...fadeUp()} className="card p-7 space-y-7"><div><label className="label">{c.employees}: <span className="text-text">{people}</span></label><input type="range" min="5" max="60" value={people} onChange={e=>setPeople(+e.target.value)} className="w-full accent-violet-600"/><div className="flex justify-between text-xs text-muted mt-2"><span>5</span><span>15</span><span>30</span><span>60+</span></div></div><Select label={c.direction} value={direction} onChange={e=>setDirection(e.target.value)}>{c.directions.map(x=><option key={x}>{x}</option>)}</Select><Select label={c.schedule} value={schedule} onChange={e=>setSchedule(e.target.value)}>{c.schedules.map(x=><option key={x}>{x}</option>)}</Select></motion.div><motion.div {...fadeUp(.1)} className="card p-7 glow-border"><p className="text-xs uppercase tracking-widest text-muted mb-5">{c.estimate}</p><h3 className="font-display text-xl font-bold mb-6">{direction}</h3><div className="space-y-4">{[[c.employees,`${people} чел.`],[c.hours,`${estimate.hours} часов`],[c.duration,estimate.duration],[c.discount,estimate.discount],[c.schedule,schedule]].map(([l,v])=><div key={l} className="flex justify-between gap-4 border-b border-border/50 pb-3 text-sm"><span className="text-muted">{l}</span><strong>{v}</strong></div>)}</div><p className="flex gap-2 text-sm text-emerald-400 mt-5"><Check className="w-4 h-4"/>{c.report}</p><button onClick={() => scrollTo('b2b-form')} className="btn bg-primary hover:bg-primary-hover text-white h-11 w-full mt-7">{c.requestCalc}</button></motion.div></div></div></section>

    <section className="max-w-7xl mx-auto px-6 py-24"><SectionHead tag={c.stepsTag} title={c.stepsTitle}/><div className="grid md:grid-cols-5 gap-4">{c.steps.map(([n,title,text],i)=><motion.div key={n} {...fadeUp(i*.06)} className="card p-5"><span className="font-display text-2xl font-bold text-primary/70">{n}</span><h3 className="font-display font-semibold mt-4 mb-2">{title}</h3><p className="text-muted text-sm leading-relaxed">{text}</p></motion.div>)}</div></section>

    <section id="b2b-form" className="max-w-6xl mx-auto px-6 py-24 scroll-mt-24"><div className="grid lg:grid-cols-[.8fr_1.2fr] gap-10 items-start"><motion.div {...fadeUp()}><p className="text-primary text-xs uppercase tracking-[.2em] font-semibold mb-3">{c.formTag}</p><h2 className="section-title mb-5">{c.formTitle}</h2><p className="text-muted text-lg leading-relaxed">{c.formSub}</p><div className="mt-8 space-y-3 text-sm text-muted"><p className="flex gap-3"><MessageSquareText className="w-5 h-5 text-primary"/>Ответим и уточним задачи команды</p><p className="flex gap-3"><LineChart className="w-5 h-5 text-primary"/>Подготовим программу и расчёт</p><p className="flex gap-3"><ShieldCheck className="w-5 h-5 text-primary"/>Конфиденциальность и NDA</p></div></motion.div><motion.div {...fadeUp(.1)} className="card p-7 md:p-8 grid sm:grid-cols-2 gap-5"><Input label={c.company} placeholder={c.companyPh} value={form.company} onChange={e=>setForm({...form,company:e.target.value})}/><Input label={c.contact} placeholder={c.contactPh} value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})}/><Select label={c.team} value={form.team} onChange={e=>setForm({...form,team:e.target.value})}>{['5–10','11–25','26–50','50+'].map(x=><option key={x}>{x}</option>)}</Select><PhoneInput label={c.phone} value={form.phone} onChange={phone=>setForm({...form,phone})}/><div className="sm:col-span-2"><Select label={c.wish} value={form.wish} onChange={e=>setForm({...form,wish:e.target.value})}>{c.directions.map(x=><option key={x}>{x}</option>)}</Select></div>{status && <p className={`sm:col-span-2 text-sm ${status==='success'?'text-emerald-400':'text-danger'}`}>{status==='success'?c.success:status==='error'?c.required:'Что-то пошло не так. Попробуйте ещё раз.'}</p>}<Button onClick={submit} loading={loading} size="lg" className="sm:col-span-2 w-full">{c.send}<ArrowRight className="w-4 h-4"/></Button></motion.div></div></section>

    <section className="max-w-4xl mx-auto px-6 py-24"><SectionHead tag={c.faqTag} title={c.faqTitle}/><div className="space-y-3">{c.faqs.map(([q,a],i)=><div key={q} className="card overflow-hidden"><button onClick={()=>setFaq(faq===i?-1:i)} className="w-full flex justify-between gap-4 text-left p-5 font-medium">{q}<ChevronDown className={`w-5 h-5 text-primary shrink-0 transition-transform ${faq===i?'rotate-180':''}`}/></button>{faq===i&&<motion.p initial={{opacity:0,height:0}} animate={{opacity:1,height:'auto'}} className="px-5 pb-5 text-muted text-sm leading-relaxed">{a}</motion.p>}</div>)}</div></section>

    <section className="max-w-6xl mx-auto px-6 pb-16"><motion.div {...fadeUp()} className="card glow-border p-10 md:p-14 text-center bg-gradient-to-br from-primary/10 to-surface"><h2 className="font-display text-3xl md:text-4xl font-bold max-w-3xl mx-auto">{c.cta}</h2><p className="text-muted mt-4 mb-7">{c.ctaSub}</p><button onClick={() => scrollTo('b2b-form')} className="btn bg-primary hover:bg-primary-hover text-white h-12 px-8 shadow-glow">{c.discuss}<ArrowRight className="w-4 h-4"/></button></motion.div></section>
  </div>
}
