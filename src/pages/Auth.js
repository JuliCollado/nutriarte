import { useState } from 'react'
import { supabase } from '../lib/supabase'
import './Auth.css'

export default function Auth({ onLogin }) {
  const [modo, setModo] = useState('login') // 'login' | 'registro'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mensaje, setMensaje] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('Completá email y contraseña'); return }
    setLoading(true); setError('')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) { setError('Email o contraseña incorrectos'); setLoading(false); return }
    onLogin(data.user)
    setLoading(false)
  }

  const handleRegistro = async () => {
    if (!email || !password || !nombre) { setError('Completá todos los campos'); return }
    if (password.length < 6) { setError('La contraseña debe tener al menos 6 caracteres'); return }
    setLoading(true); setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { nombre } }
    })

    if (error) { setError('No se pudo crear la cuenta. Intentá de nuevo.'); setLoading(false); return }

    // Guardar nombre en tabla usuarios
    if (data.user) {
      await supabase.from('usuarios').upsert({
        id: data.user.id,
        email,
        nombre,
        rol: 'paciente'
      })
    }

    setMensaje('¡Cuenta creada! Revisá tu email para confirmar.')
    setLoading(false)
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">🌿</div>
        <h1 className="auth-titulo">Nutriarte</h1>
        <p className="auth-subtitulo">Recetas antiinflamatorias</p>

        <div className="auth-tabs">
          <button className={`auth-tab ${modo === 'login' ? 'active' : ''}`} onClick={() => { setModo('login'); setError(''); setMensaje('') }}>
            Ingresar
          </button>
          <button className={`auth-tab ${modo === 'registro' ? 'active' : ''}`} onClick={() => { setModo('registro'); setError(''); setMensaje('') }}>
            Registrarse
          </button>
        </div>

        <div className="auth-form">
          {modo === 'registro' && (
            <div className="auth-campo">
              <label>Nombre</label>
              <input
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={e => setNombre(e.target.value)}
              />
            </div>
          )}

          <div className="auth-campo">
            <label>Email</label>
            <input
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>

          <div className="auth-campo">
            <label>Contraseña</label>
            <input
              type="password"
              placeholder={modo === 'registro' ? 'Mínimo 6 caracteres' : '••••••••'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (modo === 'login' ? handleLogin() : handleRegistro())}
            />
          </div>

          {error && <p className="auth-error">{error}</p>}
          {mensaje && <p className="auth-mensaje">{mensaje}</p>}

          <button
            className="auth-btn"
            onClick={modo === 'login' ? handleLogin : handleRegistro}
            disabled={loading}
          >
            {loading ? 'Cargando...' : modo === 'login' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </div>
      </div>
    </div>
  )
}
