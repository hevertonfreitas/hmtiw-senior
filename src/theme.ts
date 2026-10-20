import { createSystem, defaultConfig } from '@chakra-ui/react'

const font =
  "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"

export const theme = createSystem(defaultConfig, {
  globalCss: {
    body: { bg: 'var(--page)', color: 'var(--ink)' },
    '*': { borderColor: 'var(--line)' },
    '::selection': { background: '#cbe5b7', color: '#193f2e' }
  },
  theme: {
    tokens: {
      fonts: { heading: { value: font }, body: { value: font } },
      colors: {
        brand: {
          50: { value: '#edf5ef' },
          100: { value: '#d3e8d9' },
          200: { value: '#acd1b8' },
          300: { value: '#7db58f' },
          400: { value: '#51976b' },
          500: { value: '#317a50' },
          600: { value: '#24613f' },
          700: { value: '#1c4d34' },
          800: { value: '#193f2e' },
          900: { value: '#142f24' },
          950: { value: '#10261c' }
        }
      }
    },
    semanticTokens: {
      colors: {
        brand: {
          solid: {
            value: { base: '{colors.brand.500}', _dark: '{colors.brand.300}' }
          },
          contrast: { value: { base: 'white', _dark: '{colors.brand.950}' } },
          fg: {
            value: { base: '{colors.brand.700}', _dark: '{colors.brand.200}' }
          },
          muted: {
            value: { base: '{colors.brand.100}', _dark: '{colors.brand.800}' }
          },
          subtle: {
            value: { base: '{colors.brand.50}', _dark: '{colors.brand.900}' }
          },
          emphasized: {
            value: { base: '{colors.brand.200}', _dark: '{colors.brand.700}' }
          },
          focusRing: {
            value: { base: '{colors.brand.500}', _dark: '{colors.brand.300}' }
          }
        }
      }
    },
    recipes: {
      button: {
        base: { colorPalette: 'brand', borderRadius: '10px', fontWeight: 600 },
        variants: { size: { md: { fontSize: 'sm' } } }
      },
      input: { base: { '--focus-color': '{colors.brand.400}' } }
    }
  }
})
