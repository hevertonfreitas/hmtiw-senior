import {
  type ReactNode,
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useState
} from 'react'

type ColorMode = 'light' | 'dark'
const storageKey = 'chakra-ui-color-mode'
const readColorMode = (): ColorMode => {
  try {
    return localStorage.getItem(storageKey) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const ColorModeContext = createContext<{
  colorMode: ColorMode
  toggleColorMode: () => void
} | null>(null)

export const ColorModeProvider = ({ children }: { children: ReactNode }) => {
  const [colorMode, setColorMode] = useState<ColorMode>(readColorMode)

  useLayoutEffect(() => {
    document.documentElement.classList.toggle('dark', colorMode === 'dark')
    document.documentElement.classList.toggle('light', colorMode === 'light')
    document.documentElement.style.colorScheme = colorMode
    try {
      localStorage.setItem(storageKey, colorMode)
    } catch {
      /* Use the preference for this session. */
    }
  }, [colorMode])

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === storageKey) setColorMode(readColorMode())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  return (
    <ColorModeContext.Provider
      value={{
        colorMode,
        toggleColorMode: () =>
          setColorMode((mode) => (mode === 'dark' ? 'light' : 'dark'))
      }}
    >
      {children}
    </ColorModeContext.Provider>
  )
}

export const useColorMode = () => {
  const context = useContext(ColorModeContext)
  if (!context) throw new Error('Color mode must be used inside its provider')
  return context
}
