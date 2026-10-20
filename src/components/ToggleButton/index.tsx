import { MoonIcon, SunIcon } from '@chakra-ui/icons'
import { IconButton, useColorMode } from '@chakra-ui/react'

export const ToggleButton = () => {
  const { colorMode, toggleColorMode } = useColorMode()
  return (
    <IconButton
      variant="ghost"
      size="sm"
      color="var(--muted)"
      onClick={toggleColorMode}
      aria-label={
        colorMode === 'light' ? 'Ativar tema escuro' : 'Ativar tema claro'
      }
      icon={colorMode === 'light' ? <MoonIcon /> : <SunIcon />}
    />
  )
}
