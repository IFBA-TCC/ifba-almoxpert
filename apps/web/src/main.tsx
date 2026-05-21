import React from 'react'
import ReactDOM from 'react-dom/client'
import { App } from './App'
import { tokenManager } from './services/tokenManager'
import './index.css'

// Restaura o token em memória ANTES de qualquer render
// Garante que o interceptor do Axios já tem o token disponível
tokenManager.restore()

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)