import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@mantine/core/styles.css'
import App from './App.tsx'
import './index.scss'
import { TcgThemeProvider } from './theme/TcgThemeProvider.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TcgThemeProvider>
      <App />
    </TcgThemeProvider>
  </StrictMode>,
)
