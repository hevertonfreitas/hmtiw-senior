import { Icon, type IconProps } from '@chakra-ui/react'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  CircleCheck,
  Clock3,
  Download,
  ExternalLink,
  Info,
  type LucideIcon,
  Moon,
  RotateCw,
  Settings,
  Sun
} from 'lucide-react'

const appIcon = (Glyph: LucideIcon) => {
  const AppIcon = (props: IconProps) => (
    <Icon boxSize="1em" {...props}>
      <Glyph size="1em" />
    </Icon>
  )
  AppIcon.displayName = Glyph.displayName
  return AppIcon
}

export const ArrowBackIcon = appIcon(ArrowLeft)
export const ArrowForwardIcon = appIcon(ArrowRight)
export const CalendarIcon = appIcon(CalendarDays)
export const CheckCircleIcon = appIcon(CircleCheck)
export const ChevronLeftIcon = appIcon(ChevronLeft)
export const ChevronRightIcon = appIcon(ChevronRight)
export const DownloadIcon = appIcon(Download)
export const ExternalLinkIcon = appIcon(ExternalLink)
export const InfoIcon = appIcon(Info)
export const MoonIcon = appIcon(Moon)
export const RepeatIcon = appIcon(RotateCw)
export const SettingsIcon = appIcon(Settings)
export const SunIcon = appIcon(Sun)
export const TimeIcon = appIcon(Clock3)
export const WarningIcon = appIcon(CircleAlert)
