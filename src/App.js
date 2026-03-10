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
  const [listaCompras, setListaCompras] = useState([])
  const [menuSemanal, setMenuSemanal] = useState({})

  const agregarACompras = (ingredientes, recetaNombre) => {
    setListaCompras(prev => {
      const nuevos = ingredientes.map(i => ({
        ...i,
        origen: recetaNombre,
        id: `${i.ingrediente_id}-${recetaNombre}`
      }))
      const existentes = prev.filter(p => p.origen !== recetaNombre)
      return [...existentes, ...nuevos]
    })
  }

  const verReceta = (receta) => {
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
          onAgregarMenu={(receta, dia, momento) => {
            setMenuSemanal(prev => ({
              ...prev,
              [`${dia}-${momento}`]: receta
            }))
          }}
        />
      </div>
    )
  }

  return (
    <div className="app">
      <div className="contenido">
        {tab === 'recetas' && <Recetas onVerReceta={verReceta} />}
        {tab === 'menu' && <Menu menuSemanal={menuSemanal} onVerReceta={verReceta} />}
        {tab === 'compras' && <Compras lista={listaCompras} onLimpiar={() => setListaCompras([])} />}
        {tab === 'perfil' && <Perfil />}
      </div>

      <nav className="nav-bottom">
        <button className={`nav-btn ${tab === 'recetas' ? 'active' : ''}`} onClick={() => setTab('recetas')}>
          <span className="nav-icon">🍽</span>
          <span className="nav-label">Recetas</span>
        </button>
        <button className={`nav-btn ${tab === 'menu' ? 'active' : ''}`} onClick={() => setTab('menu')}>
          <span className="nav-icon">📋</span>
          <span className="nav-label">Mi menú</span>
        </button>
        <button className={`nav-btn ${tab === 'compras' ? 'active' : ''}`} onClick={() => setTab('compras')}>
          <span className="nav-icon">🛒</span>
          <span className="nav-label">Compras</span>
          {listaCompras.length > 0 && <span className="nav-badge">{listaCompras.length}</span>}
        </button>
        <button className={`nav-btn ${tab === 'perfil' ? 'active' : ''}`} onClick={() => setTab('perfil')}>
          <span className="nav-icon">👤</span>
          <span className="nav-label">Perfil</span>
        </button>
      </nav>
    </div>
  )
}
