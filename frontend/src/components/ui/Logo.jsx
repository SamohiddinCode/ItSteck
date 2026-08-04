import violetHorizontal from '@/assets/logo/logo-violet-horizontal.svg'
import violetVertical from '@/assets/logo/logo-violet-vertical.svg'
import blueHorizontal from '@/assets/logo/logo-blue-horizontal.svg'
import blueVertical from '@/assets/logo/logo-blue-vertical.svg'

const sources = {
  violet: { horizontal: violetHorizontal, vertical: violetVertical },
  blue: { horizontal: blueHorizontal, vertical: blueVertical },
}

export default function Logo({ variant = 'violet', orientation = 'horizontal', className = 'h-8' }) {
  return (
    <img
      src={sources[variant][orientation]}
      alt="ItStek"
      className={`${className} w-auto select-none`}
      draggable={false}
    />
  )
}
