import { IconButton } from '@chakra-ui/react'
import { useColorMode } from '../../contexts/ColorModeContext'
import { MoonIcon, SunIcon } from '../ui/icons'

export const ToggleButton = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  const dark = colorMode === 'dark'
  return (
    <IconButton
      variant="ghost"
      size="sm"
      color="var(--muted)"
      onClick={toggleColorMode}
      aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}
    >
      {dark ? <SunIcon /> : <MoonIcon />}
    </IconButton>
  )
}
