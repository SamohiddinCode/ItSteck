import { Link } from 'react-router-dom'
import { ArrowLeft, ShieldCheck } from 'lucide-react'

const pages = {
  privacy: {
    title: 'Политика конфиденциальности',
    intro: 'Мы бережно относимся к персональным данным посетителей и используем их только для обработки заявок и предоставления образовательных услуг.',
    sections: [
      ['Какие данные мы собираем', 'Имя, номер телефона, Telegram-аккаунт (если указан), выбранный курс и сведения, которые вы добровольно передаёте в заявке.'],
      ['Зачем используются данные', 'Чтобы связаться с вами, подобрать программу, оформить обучение, вести заявки и улучшать качество сервиса.'],
      ['Хранение и защита', 'Доступ к данным имеют только уполномоченные сотрудники. Мы применяем технические и организационные меры защиты.'],
      ['Передача третьим лицам', 'Мы не продаём персональные данные. Передача возможна только поставщикам, необходимым для работы сервиса, или по требованию закона.'],
      ['Ваши права', 'Вы можете запросить уточнение или удаление своих данных, связавшись с IT STEK по контактному номеру на сайте.'],
    ],
  },
  terms: {
    title: 'Условия использования',
    intro: 'Используя сайт IT STEK, вы соглашаетесь с этими условиями. Информация на сайте носит ознакомительный характер.',
    sections: [
      ['Образовательные услуги', 'Состав программы, стоимость, расписание и условия обучения окончательно фиксируются в договоре с обучающимся или компанией.'],
      ['Материалы сайта', 'Тексты, фирменные элементы и учебные материалы нельзя копировать и распространять без разрешения IT STEK.'],
      ['Заявки', 'Отправка заявки не является автоматическим заключением договора. Представитель академии свяжется с вами для уточнения деталей.'],
      ['Ответственность', 'Мы стремимся поддерживать точность информации, но можем обновлять программы, расписание и содержание сайта.'],
    ],
  },
}

export default function Legal({ type }) {
  const page = pages[type]
  return <div className="max-w-4xl mx-auto px-6 py-20">
    <Link to="/" className="inline-flex items-center gap-2 text-muted hover:text-text text-sm mb-9"><ArrowLeft className="w-4 h-4"/>На главную</Link>
    <div className="flex items-center gap-3 mb-5"><span className="w-11 h-11 rounded-xl bg-primary/10 border border-primary/20 grid place-items-center"><ShieldCheck className="w-5 h-5 text-primary"/></span><h1 className="font-display text-4xl md:text-5xl font-bold">{page.title}</h1></div>
    <p className="text-muted text-lg leading-relaxed mb-10">{page.intro}</p>
    <div className="space-y-5">{page.sections.map(([title,text])=><section key={title} className="card p-6"><h2 className="font-display text-xl font-semibold mb-2">{title}</h2><p className="text-muted leading-relaxed">{text}</p></section>)}</div>
    <p className="text-muted text-sm mt-8">Последнее обновление: 3 сентября 2026 года.</p>
  </div>
}
