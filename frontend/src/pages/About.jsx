import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ArrowRight, Award, Compass, Eye, GraduationCap, Handshake, Heart, Lightbulb, ShieldCheck, Sparkles, Target, Users } from 'lucide-react'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 22 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.15 },
  transition: { duration: 0.5, delay },
})

const values = [
  [Heart, 'Живой формат', 'Только живые уроки — преподаватель всегда в эфире со студентами.'],
  [Compass, 'Честный отбор', 'Тест помогает понять, с чего начать, а не просто продать курс.'],
  [Lightbulb, 'Практика с первого дня', 'С первого занятия студенты работают над реальными задачами.'],
  [Target, 'Доводим до результата', 'Сопровождаем студента до первой работы и зарплаты в IT.'],
]

const timeline = [
  ['2026', 'Старт академии', 'Первый набор студентов. Запуск направлений: программирование, дизайн, кибербезопасность и работа с AI. Живые занятия на русском и узбекском языках.'],
  ['2027', 'Первые выпускники', 'Первые студенты трудоустроены через нашу поддержку с резюме и карьерным центром. Запуск фриланс-практики на реальных заказах.'],
  ['2028', 'Партнёрство с работодателями', 'Выстраиваем прямые связи с IT-компаниями и создаём возможности для трудоустройства выпускников. Запускаем корпоративное обучение.'],
  ['2029', 'Масштабирование академии', 'Расширяем направления и форматы обучения, усиливаем практическую часть на основе опыта студентов, преподавателей и работодателей.'],
  ['2030', 'Лидерство в регионе', 'Наша цель — стать ведущей академией живого дистанционного IT-образования в Узбекистане и выйти на рынки стран СНГ.'],
]

export default function About() {
  return <div className="overflow-hidden">
    <section className="relative px-6 py-28 md:py-36">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-1/2 top-1/3 -translate-x-1/2 w-[760px] h-[440px] rounded-full bg-primary/10 blur-[135px]" />
      </div>
      <div className="relative max-w-5xl mx-auto text-center">
        <motion.div {...fadeUp()} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/5 text-primary text-sm font-medium mb-7">
          <Sparkles className="w-4 h-4" /> О нашей академии
        </motion.div>
        <motion.h1 {...fadeUp(.1)} className="font-display text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-6">
          Мы учим профессии так, <span className="text-gradient">как ими занимаются</span> в реальной работе
        </motion.h1>
        <motion.p {...fadeUp(.2)} className="text-muted text-lg md:text-xl max-w-3xl mx-auto leading-relaxed mb-9">
          Живые занятия, много практики и сопровождение до трудоустройства — без сухой теории и обучения в одиночку.
        </motion.p>
        <motion.div {...fadeUp(.3)} className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/courses" className="btn bg-primary hover:bg-primary-hover text-white h-12 px-8 shadow-glow">Смотреть курсы <ArrowRight className="w-4 h-4" /></Link>
          <Link to="/apply" className="btn bg-surface-2 hover:bg-border border border-border h-12 px-8">Оставить заявку</Link>
        </motion.div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-16">
          {[['90%', 'реальной практики'], ['100%', 'живые онлайн-уроки'], ['RU / UZ', 'обучение на двух языках'], ['до оффера', 'карьерное сопровождение']].map(([v,l],i)=><motion.div key={v} {...fadeUp(.35+i*.06)} className="card p-5"><p className="font-display text-xl md:text-2xl font-bold text-primary">{v}</p><p className="text-muted text-xs mt-1">{l}</p></motion.div>)}
        </div>
      </div>
    </section>

    <section className="max-w-6xl mx-auto px-6 py-24">
      <motion.div {...fadeUp()} className="text-center max-w-3xl mx-auto mb-12">
        <p className="text-primary text-xs uppercase tracking-[.2em] font-semibold mb-3">О IT STEK</p>
        <h2 className="section-title mb-5">Создаём специалистов, готовых к реальной работе</h2>
        <p className="text-muted text-lg leading-relaxed">IT STEK — академия, где студент не остаётся один на один с видеозаписями. Мы соединяем живое обучение, реальные проекты и поддержку на пути к первой работе.</p>
      </motion.div>
      <div className="grid md:grid-cols-2 gap-6">
        <motion.article {...fadeUp()} className="card p-8 glow-border"><div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center mb-5"><Target className="w-5 h-5 text-primary" /></div><h3 className="font-display text-2xl font-bold mb-3">Наша миссия</h3><p className="text-muted leading-relaxed">Дать людям в Узбекистане настоящую профессию в IT, доводить от первого урока до первой работы.</p></motion.article>
        <motion.article {...fadeUp(.1)} className="card p-8"><div className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center mb-5"><Eye className="w-5 h-5 text-primary" /></div><h3 className="font-display text-2xl font-bold mb-3">Наше видение</h3><p className="text-muted leading-relaxed">Стать академией №1 в Узбекистане с живым дистанционным обучением к 2030 году.</p></motion.article>
      </div>
    </section>

    <section className="border-y border-border/40 bg-surface/30">
      <div className="max-w-6xl mx-auto px-6 py-24 grid lg:grid-cols-[.9fr_1.1fr] gap-12 items-center">
        <motion.div {...fadeUp()}>
          <p className="text-primary text-xs uppercase tracking-[.2em] font-semibold mb-3">Почему появилась академия</p>
          <h2 className="section-title mb-6">Не хватало живого обучения</h2>
          <p className="text-muted text-lg leading-relaxed mb-5">На рынке было много записанных курсов, но почти не было живого дистанционного обучения на русском и узбекском языках, где преподаватель реально ведёт урок, отвечает на вопросы и помогает дойти до результата.</p>
          <p className="text-muted text-lg leading-relaxed">Мы хотели, чтобы человек из любого города Узбекистана мог получить настоящую IT-профессию без переезда — с живыми занятиями, практикой и поддержкой до первой работы.</p>
        </motion.div>
        <motion.div {...fadeUp(.1)} className="relative card p-8 md:p-10 overflow-hidden">
          <div className="absolute -right-16 -top-16 w-48 h-48 bg-primary/15 rounded-full blur-3xl" />
          <GraduationCap className="w-12 h-12 text-primary mb-7" />
          <blockquote className="font-display text-2xl md:text-3xl font-bold leading-tight relative">«Не важны возраст, город или стартовый уровень. Важно желание учиться и доводить дело до конца. Остальное — наша работа».</blockquote>
        </motion.div>
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-6 py-24">
      <motion.div {...fadeUp()} className="text-center mb-12"><p className="text-primary text-xs uppercase tracking-[.2em] font-semibold mb-3">Наши ценности</p><h2 className="section-title">Принципы, на которых мы строим обучение</h2></motion.div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">{values.map(([Icon,title,text],i)=><motion.article key={title} {...fadeUp(i*.07)} className="card p-6 hover:border-primary/30 transition-colors"><Icon className="w-5 h-5 text-primary mb-5" /><h3 className="font-display text-lg font-semibold mb-2">{title}</h3><p className="text-muted text-sm leading-relaxed">{text}</p></motion.article>)}</div>
    </section>

    <section className="border-y border-border/40 bg-surface/30">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <motion.div {...fadeUp()} className="text-center mb-14"><p className="text-primary text-xs uppercase tracking-[.2em] font-semibold mb-3">Наш путь</p><h2 className="section-title mb-4">Куда мы идём</h2><p className="text-muted text-lg">От старта академии до лидерства в регионе — шаг за шагом.</p></motion.div>
        <div className="relative max-w-4xl mx-auto before:absolute before:left-[19px] md:before:left-1/2 before:top-0 before:bottom-0 before:w-px before:bg-border">
          {timeline.map(([year,title,text],i)=><motion.div key={year} {...fadeUp()} className={`relative grid md:grid-cols-2 gap-8 mb-8 ${i%2?'md:text-left':'md:text-right'}`}>
            <div className={`ml-14 md:ml-0 ${i%2?'md:col-start-2 md:pl-8':'md:pr-8'}`}><div className="card p-6"><p className="font-display text-xl font-bold text-primary">{year}</p><h3 className="font-display text-lg font-semibold mt-2 mb-2">{title}</h3><p className="text-muted text-sm leading-relaxed">{text}</p></div></div>
            <span className="absolute left-[12px] md:left-1/2 top-7 md:-translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-bg shadow-glow" />
          </motion.div>)}
        </div>
      </div>
    </section>

    <section className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid md:grid-cols-3 gap-5 mb-12">
        {[[Users,'Живое сообщество','Студенты, преподаватели и выпускники помогают друг другу расти.'],[Handshake,'Связь с индустрией','Программы опираются на реальные требования работодателей.'],[ShieldCheck,'Проверяемый результат','Сертификаты можно подтвердить через публичную проверку.']].map(([Icon,title,text],i)=><motion.div key={title} {...fadeUp(i*.08)} className="card p-6"><Icon className="w-5 h-5 text-primary mb-4"/><h3 className="font-display font-semibold mb-2">{title}</h3><p className="text-muted text-sm">{text}</p></motion.div>)}
      </div>
      <motion.div {...fadeUp()} className="card glow-border bg-gradient-to-br from-primary/10 to-surface p-10 md:p-14 text-center"><Award className="w-10 h-10 text-primary mx-auto mb-5"/><h2 className="font-display text-3xl md:text-4xl font-bold">Начните свой путь в IT вместе с нами</h2><p className="text-muted text-lg max-w-xl mx-auto mt-4 mb-8">Пройдите тест, выберите направление и сделайте первый шаг к новой профессии.</p><div className="flex flex-col sm:flex-row justify-center gap-3"><Link to="/test" className="btn bg-primary hover:bg-primary-hover text-white h-12 px-8 shadow-glow">Подобрать курс <ArrowRight className="w-4 h-4"/></Link><Link to="/business" className="btn bg-surface-2 hover:bg-border border border-border h-12 px-8">Обучение для бизнеса</Link></div></motion.div>
    </section>
  </div>
}
