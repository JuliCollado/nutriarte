import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import Auth from './pages/Auth'
import Recetas from './pages/Recetas'
import Receta from './pages/Receta'
import Menu from './pages/Menu'
import Compras from './pages/Compras'
import Perfil from './pages/Perfil'
import './App.css'

export default function App() {
  const [usuario, setUsuario] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)
  const [tab, setTab] = useState('recetas')
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null)
  const [listaCompras, setListaCompras] = useState([])
  const [menuRecetas, setMenuRecetas] = useState([])
  const [favoritos, setFavoritos] = useState(new Set())
  const [favoritosDetalle, setFavoritosDetalle] = useState([])
  const [historial, setHistorial] = useState([])

  // Verificar sesión al iniciar
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUsuario(session.user)
        cargarDatosUsuario(session.user.id)
      }
      setCargandoSesion(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUsuario(session.user)
        cargarDatosUsuario(session.user.id)
      } else {
        setUsuario(null)
        setFavoritos(new Set())
        setHistorial([])
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const cargarDatosUsuario = async (userId) => {
    // Cargar favoritos con datos completos
    const { data: favs } = await supabase
      .from('favoritos')
      .select('receta_id, recetas(id, nombre, tipo_comida, tiempo_prep_min, apta_vegana, apta_sin_gluten, dulzor)')
      .eq('usuario_id', userId)

    if (favs) {
      setFavoritos(new Set(favs.map(f => f.receta_id)))
      setFavoritosDetalle(favs.map(f => f.recetas).filter(Boolean))
    }

    // Cargar historial
    const { data: hist } = await supabase
      .from('historial_recetas')
      .select('receta_id, fecha, recetas(id, nombre, tipo_comida, tiempo_prep_min)')
      .eq('usuario_id', userId)
      .order('fecha', { ascending: false })
      .limit(50)

    if (hist) {
      setHistorial(hist.map(h => ({
        ...h.recetas,
        fecha: new Date(h.fecha).toLocaleDateString('es-AR')
      })))
    }
  }

  const toggleFavorito = async (receta) => {
    if (!usuario) return
    const recetaId = typeof receta === 'object' ? receta.id : receta
    const esFav = favoritos.has(recetaId)
    if (esFav) {
      await supabase.from('favoritos').delete()
        .eq('usuario_id', usuario.id).eq('receta_id', recetaId)
      setFavoritos(prev => { const next = new Set(prev); next.delete(recetaId); return next })
      setFavoritosDetalle(prev => prev.filter(r => r.id !== recetaId))
    } else {
      await supabase.from('favoritos').insert({ usuario_id: usuario.id, receta_id: recetaId })
      setFavoritos(prev => new Set([...prev, recetaId]))
      if (typeof receta === 'object') setFavoritosDetalle(prev => [...prev, receta])
    }
  }

  const marcarRealizada = async (receta) => {
    if (!usuario) return
    await supabase.from('historial_recetas').insert({
      usuario_id: usuario.id,
      receta_id: receta.id,
      fecha: new Date().toISOString()
    })
    setHistorial(prev => [{
      ...receta,
      fecha: new Date().toLocaleDateString('es-AR')
    }, ...prev])
  }

  const agregarACompras = (ingredientes, recetaNombre) => {
    setListaCompras(prev => {
      const existentes = prev.filter(p => p.origen !== recetaNombre)
      const nuevos = ingredientes.map(i => ({
        ...i, origen: recetaNombre,
        id: `${i.ingrediente_id}-${recetaNombre}`
      }))
      return [...existentes, ...nuevos]
    })
  }

  const removerReceta = (recetaNombre) => {
    setListaCompras(prev => prev.filter(i => i.origen !== recetaNombre))
  }

  const agregarAlMenu = (receta) => {
    setMenuRecetas(prev => prev.find(r => r.id === receta.id) ? prev : [...prev, receta])
  }

  const removerDelMenu = (recetaId) => {
    setMenuRecetas(prev => prev.filter(r => r.id !== recetaId))
  }

  const verReceta = (receta) => setRecetaSeleccionada(receta)
  const volver = () => setRecetaSeleccionada(null)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUsuario(null)
    setListaCompras([])
    setMenuRecetas([])
    setFavoritos(new Set())
    setHistorial([])
    setTab('recetas')
  }

  if (cargandoSesion) {
    return (
      <div className="app" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--gris)', fontSize: 14 }}>Cargando...</p>
      </div>
    )
  }

  if (!usuario) {
    return <Auth onLogin={(user) => setUsuario(user)} />
  }

  if (recetaSeleccionada) {
    return (
      <div className="app">
        <Receta
          receta={recetaSeleccionada}
          onVolver={volver}
          onAgregarCompras={agregarACompras}
          onAgregarMenu={agregarAlMenu}
          esFavorito={favoritos.has(recetaSeleccionada.id)}
          onToggleFavorito={() => toggleFavorito(recetaSeleccionada)}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="contenido">
        {tab === 'recetas' && <Recetas onVerReceta={verReceta} favoritos={favoritos} />}
        {tab === 'menu' && (
          <Menu
            menuRecetas={menuRecetas}
            onVerReceta={verReceta}
            onRemoverDeMenu={removerDelMenu}
            onMarcarRealizada={marcarRealizada}
          />
        )}
        {tab === 'compras' && (
          <Compras
            lista={listaCompras}
            onLimpiar={() => setListaCompras([])}
            onRemoverReceta={removerReceta}
          />
        )}
        {tab === 'perfil' && (
          <Perfil
            usuario={usuario}
            historial={historial}
            favoritos={favoritos}
            favoritosDetalle={favoritosDetalle}
            onVerReceta={verReceta}
            onLogout={handleLogout}
          />
        )}
      </div>

      <nav className="nav-bottom">
        <button className={`nav-btn ${tab === 'recetas' ? 'active' : ''}`} onClick={() => setTab('recetas')}>
          <span className="nav-icon">🍽</span>
          <span className="nav-label">Recetas</span>
        </button>
        <button className={`nav-btn ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}>
          <span className="nav-icon">📋</span>
          <span className="nav-label">Mi menú</span>
          {menuRecetas.length > 0 && <span className="nav-badge">{menuRecetas.length}</span>}
        </button>
        <button className={`nav-btn ${tab === 'compras' ? 'active' : ''}`} onClick={() => setTab('compras')}>
          <span className="nav-icon">🛒</span>
          <span className="nav-label">Compras</span>
          {listaCompras.length > 0 && <span className="nav-badge">{new Set(listaCompras.map(i => i.origen)).size}</span>}
        </button>
        <button className={`nav-btn ${tab === 'perfil' ? 'active' : ''}`} onClick={() => setTab('perfil')}>
          <span className="nav-icon">👤</span>
          <span className="nav-label">Perfil</span>
        </button>
      </nav>
    </div>
  )
}
