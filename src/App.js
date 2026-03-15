import { useState } from 'react'
import Recetas from './pages/Recetas'
import Receta from './pages/Receta'
import Menu from './pages/Menu'
import Compras from './pages/Compras'
import Perfil from './pages/Perfil'
import './App.css'

export default function App() {
  const [tab, setTab] = useState('recetas')
  const [recetaSeleccionada, setRecetaSeleccionada] = useState(null)
  const [tabAnterior, setTabAnterior] = useState('recetas')
  const [listaCompras, setListaCompras] = useState([])
  const [menuRecetas, setMenuRecetas] = useState([])
  const [historial, setHistorial] = useState([])

  const agregarACompras = (ingredientes, recetaNombre) => {
    setListaCompras(prev => {
      const existentes = prev.filter(p => p.origen !== recetaNombre)
      const nuevos = ingredientes.map(i => ({
        ...i,
        origen: recetaNombre,
        id: `${i.ingrediente_id}-${recetaNombre}`
      }))
      return [...existentes, ...nuevos]
    })
  }

  const removerReceta = (recetaNombre) => {
    setListaCompras(prev => prev.filter(i => i.origen !== recetaNombre))
  }

  const agregarAlMenu = (receta) => {
    setMenuRecetas(prev => {
      if (prev.find(r => r.id === receta.id)) return prev
      return [...prev, receta]
    })
  }

  const marcarRealizada = (receta) => {
    setHistorial(prev => {
      const yaExiste = prev.find(h => h.id === receta.id && h.fecha === new Date().toLocaleDateString('es-AR'))
      if (yaExiste) return prev
      return [{ ...receta, fecha: new Date().toLocaleDateString('es-AR') }, ...prev]
    })
  }

  const removerDelMenu = (recetaId) => {
    setMenuRecetas(prev => prev.filter(r => r.id !== recetaId))
  }

  const verReceta = (receta) => {
    setTabAnterior(tab)
    setRecetaSeleccionada(receta)
  }

  const volver = () => {
    setRecetaSeleccionada(null)
  }

  if (recetaSeleccionada) {
    return (
      <div className="app">
        <Receta
          receta={recetaSeleccionada}
          onVolver={volver}
          onAgregarCompras={agregarACompras}
          onAgregarMenu={agregarAlMenu}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="contenido">
        {tab === 'recetas' && <Recetas onVerReceta={verReceta} />}
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
        {tab === 'perfil' && <Perfil historial={historial} onVerReceta={verReceta} />}
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
