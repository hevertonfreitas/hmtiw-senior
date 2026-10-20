import { extendTheme } from '@chakra-ui/react'

export const theme = extendTheme({
  config: { initialColorMode: 'light', useSystemColorMode: false },
  fonts: {
    heading:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    body: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
  },
  colors: {
    brand: {
      50: '#edf5ef',
      100: '#d3e8d9',
      200: '#acd1b8',
      300: '#7db58f',
      400: '#51976b',
      500: '#317a50',
      600: '#24613f',
      700: '#1c4d34',
      800: '#193f2e',
      900: '#142f24'
    }
  },
  styles: {
    global: {
      body: { bg: 'var(--page)', color: 'var(--ink)' },
      '*': { borderColor: 'var(--line)' },
      '::selection': { background: '#cbe5b7', color: '#193f2e' }
    }
  },
  components: {
    Button: {
      defaultProps: { colorScheme: 'brand' },
      baseStyle: { borderRadius: '10px', fontWeight: 600 },
      sizes: { md: { fontSize: 'sm' } }
    },
    Input: { defaultProps: { focusBorderColor: 'brand.400' } },
    Select: { defaultProps: { focusBorderColor: 'brand.400' } },
    Modal: {
      baseStyle: { dialog: { bg: 'var(--panel)', borderRadius: '20px' } }
    },
    Drawer: { baseStyle: { dialog: { bg: 'var(--panel)' } } }
  }
})
