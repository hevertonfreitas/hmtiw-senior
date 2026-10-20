import { ChakraProvider } from '@chakra-ui/react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Template } from './components/Template'
import { SeniorContextProvider } from './contexts/SeniorContext'
import './index.css'
import { History } from './routes/history'
import ReactDOM from 'react-dom/client'
import App from './App'
import { theme } from './theme'

const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(
  <ChakraProvider theme={theme}>
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
  </ChakraProvider>
)
