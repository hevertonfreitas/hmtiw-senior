import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Template } from './components/Template'
import { SeniorContextProvider } from './contexts/SeniorContext'
import './index.css'
import { History } from './routes/history'
import ReactDOM from 'react-dom/client'
import App from './App'
import { theme } from './theme'
import { ColorModeProvider } from './contexts/ColorModeContext'
import { Toaster } from './components/ui/toaster'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <ChakraProvider value={theme}>
    <ColorModeProvider>
      <SeniorContextProvider>
        <BrowserRouter>
          <Template>
            <Routes>
              <Route path="/" element={<App />} />
              <Route path="/historico" element={<History />} />
            </Routes>
          </Template>
        </BrowserRouter>
      </SeniorContextProvider>
      <Toaster />
    </ColorModeProvider>
  </ChakraProvider>
)
