import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'
import './Recetas.css'

const TIPO_LABELS = {
  desayuno_merienda: 'Desayuno/merienda',
  almuerzo_cena: 'Almuerzo/cena',
  snack: 'Snack',
  postre: 'Postre',
  bebida: 'Bebida'
}

const EMOJIS_TIPO = {
  desayuno_merienda: '🌅',
  almuerzo_cena: '🍽',
  snack: '🌿',
  postre: '🍫',
  bebida: '🥤'
}

export default function Recetas({ onVerReceta }) {
  const [recetas, setRecetas] = useState([])
  const [loading, setLoading] = useState(true)
  const [busqueda, setBusqueda] = useState('')
  const [filtros, setFiltros] = useState({
    tipo: null,
    dulzor: null,
    sinTacc: false,
    vegano: false,
    sinRemojo: false,
    tiempoMax: null
  })
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const filtrosPanelRef = useRef(null)
  const filtroBtnRef = useRef(null)

  // Cerrar filtros al tocar fuera
  useEffect(() => {
    const handleClickFuera = (e) => {
      if (
        mostrarFiltros &&
        filtrosPanelRef.current &&
        !filtrosPanelRef.current.contains(e.target) &&
        filtroBtnRef.current &&
        !filtroBtnRef.current.contains(e.target)
      ) {
        setMostrarFiltros(false)
      }
    }
    document.addEventListener('mousedown', handleClickFuera)
    document.addEventListener('touchstart', handleClickFuera)
    return () => {
      document.removeEventListener('mousedown', handleClickFuera)
      document.removeEventListener('touchstart', handleClickFuera)
    }
  }, [mostrarFiltros])

  useEffect(() => {
    cargarRecetas()
  }, [])

  const cargarRecetas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('recetas')
      .select('*')
      .order('nombre')

    if (!error) setRecetas(data || [])
    setLoading(false)
  }

  const recetasFiltradas = recetas.filter(r => {
    if (busqueda && !r.nombre.toLowerCase().includes(busqueda.toLowerCase())) return false
    if (filtros.tipo && r.tipo_comida !== filtros.tipo) return false
    if (filtros.dulzor && r.dulzor !== filtros.dulzor) return false
    if (filtros.sinTacc && !r.apta_sin_gluten) return false
    if (filtros.vegano && !r.apta_vegana) return false
    if (filtros.sinRemojo && r.lleva_remojo) return false
    if (filtros.tiempoMax && r.tiempo_prep_min > filtros.tiempoMax) return false
    return true
  })

  const limpiarFiltros = () => {
    setFiltros({ tipo: null, dulzor: null, sinTacc: false, vegano: false, sinRemojo: false, tiempoMax: null })
    setBusqueda('')
  }

  const filtrosActivos = filtros.tipo || filtros.dulzor || filtros.sinTacc || filtros.vegano || filtros.sinRemojo || filtros.tiempoMax

  return (
    <div className="recetas-page">
      {/* HEADER */}
      <div className="recetas-header">
        <div className="header-top">
          <div>
            <h1 className="page-titulo">Nutriarte</h1>
            <p className="page-subtitulo">{recetas.length} recetas antiinflamatorias</p>
          </div>
          <div className="header-logo">🌿</div>
        </div>

        {/* BÚSQUEDA */}
        <div className="busqueda-row">
          <div className="busqueda-input">
            <span className="busqueda-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar receta..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
            {busqueda && <button className="busqueda-clear" onClick={() => setBusqueda('')}>✕</button>}
          </div>
          <button
            ref={filtroBtnRef}
          className={`btn-filtro ${mostrarFiltros || filtrosActivos ? 'activo' : ''}`}
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
          >
            <span>⚡</span>
            <strong>Filtrar</strong>
            {filtrosActivos && <span className="filtro-dot" />}
          </button>
        </div>

        {/* CHIPS RÁPIDOS */}
        <div className="chips-row">
          <button
            className={`chip ${filtros.dulzor === 'salado' ? 'chip-active' : ''}`}
            onClick={() => setFiltros(f => ({ ...f, dulzor: f.dulzor === 'salado' ? null : 'salado' }))}
          >🧂 Salado</button>
          <button
            className={`chip ${filtros.dulzor === 'dulce' ? 'chip-active' : ''}`}
            onClick={() => setFiltros(f => ({ ...f, dulzor: f.dulzor === 'dulce' ? null : 'dulce' }))}
          >🍯 Dulce</button>
          <button
            className={`chip ${filtros.sinRemojo ? 'chip-active' : ''}`}
            onClick={() => setFiltros(f => ({ ...f, sinRemojo: !f.sinRemojo }))}
          >⚡ Sin remojo</button>
          <button
            className={`chip ${filtros.tiempoMax === 30 ? 'chip-active' : ''}`}
            onClick={() => setFiltros(f => ({ ...f, tiempoMax: f.tiempoMax === 30 ? null : 30 }))}
          >⏱ &lt;30 min</button>
        </div>
      </div>

      {/* TAGS DE FILTROS ACTIVOS */}
      {(filtrosActivos || busqueda) && !mostrarFiltros && (
        <div className="filtros-activos-row">
          {busqueda && (
            <span className="filtro-tag">
              🔍 {busqueda}
              <button onClick={() => setBusqueda('')}>✕</button>
            </span>
          )}
          {filtros.tipo && (
            <span className="filtro-tag">
              {EMOJIS_TIPO[filtros.tipo]} {TIPO_LABELS[filtros.tipo]}
              <button onClick={() => setFiltros(f => ({ ...f, tipo: null }))}>✕</button>
            </span>
          )}
          {filtros.dulzor && (
            <span className="filtro-tag">
              {filtros.dulzor === 'dulce' ? '🍯' : filtros.dulzor === 'salado' ? '🧂' : ''} {filtros.dulzor.charAt(0).toUpperCase() + filtros.dulzor.slice(1)}
              <button onClick={() => setFiltros(f => ({ ...f, dulzor: null }))}>✕</button>
            </span>
          )}
          {filtros.tiempoMax && (
            <span className="filtro-tag">
              ⏱ {filtros.tiempoMax} min
              <button onClick={() => setFiltros(f => ({ ...f, tiempoMax: null }))}>✕</button>
            </span>
          )}
          {filtros.sinTacc && (
            <span className="filtro-tag">
              🌾 Sin TACC
              <button onClick={() => setFiltros(f => ({ ...f, sinTacc: false }))}>✕</button>
            </span>
          )}
          {filtros.vegano && (
            <span className="filtro-tag">
              🌱 Vegano
              <button onClick={() => setFiltros(f => ({ ...f, vegano: false }))}>✕</button>
            </span>
          )}
          {filtros.sinRemojo && (
            <span className="filtro-tag">
              ⚡ Sin remojo
              <button onClick={() => setFiltros(f => ({ ...f, sinRemojo: false }))}>✕</button>
            </span>
          )}
        </div>
      )}

      {/* PANEL FILTROS AVANZADOS */}
      {mostrarFiltros && (
        <div className="filtros-panel fade-up" ref={filtrosPanelRef}>
          <div className="filtros-seccion">
            <p className="filtros-label">Tipo de comida</p>
            <div className="filtros-opciones">
              {Object.entries(TIPO_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  className={`filtro-opcion ${filtros.tipo === val ? 'active' : ''}`}
                  onClick={() => setFiltros(f => ({ ...f, tipo: f.tipo === val ? null : val }))}
                >
                  {EMOJIS_TIPO[val]} {label}
                </button>
              ))}
            </div>
          </div>

          <div className="filtros-seccion">
            <p className="filtros-label">Sabor</p>
            <div className="filtros-opciones">
              {['dulce', 'salado', 'neutro', 'agridulce'].map(val => (
                <button
                  key={val}
                  className={`filtro-opcion ${filtros.dulzor === val ? 'active' : ''}`}
                  onClick={() => setFiltros(f => ({ ...f, dulzor: f.dulzor === val ? null : val }))}
                >
                  {val.charAt(0).toUpperCase() + val.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="filtros-seccion">
            <p className="filtros-label">Restricciones</p>
            <div className="filtros-opciones">
              <button
                className={`filtro-opcion ${filtros.sinTacc ? 'active' : ''}`}
                onClick={() => setFiltros(f => ({ ...f, sinTacc: !f.sinTacc }))}
              >
                🌾 Sin TACC
              </button>
              <button
                className={`filtro-opcion ${filtros.vegano ? 'active' : ''}`}
                onClick={() => setFiltros(f => ({ ...f, vegano: !f.vegano }))}
              >
                🌱 Vegano
              </button>
            </div>
          </div>

          <div className="filtros-seccion">
            <p className="filtros-label">Tiempo máximo</p>
            <div className="filtros-opciones">
              {[15, 30, 45, 60].map(t => (
                <button
                  key={t}
                  className={`filtro-opcion ${filtros.tiempoMax === t ? 'active' : ''}`}
                  onClick={() => setFiltros(f => ({ ...f, tiempoMax: f.tiempoMax === t ? null : t }))}
                >
                  {t} min
                </button>
              ))}
            </div>
          </div>

          {filtrosActivos && (
            <button className="btn-limpiar" onClick={limpiarFiltros}>
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {/* RESULTADOS */}
      <div className="recetas-contenido">
        {loading ? (
          <div className="loading">Cargando recetas...</div>
        ) : recetasFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p>No encontramos recetas con esos filtros.</p>
            <button className="btn-secundario" onClick={limpiarFiltros}>Ver todas</button>
          </div>
        ) : (
          <>
            <p className="resultados-count">
              {recetasFiltradas.length} receta{recetasFiltradas.length !== 1 ? 's' : ''}
              {filtrosActivos ? ' encontradas' : ''}
            </p>
            <div className="recetas-grid">
              {recetasFiltradas.map((receta, i) => (
                <RecetaCard
                  key={receta.id}
                  receta={receta}
                  onClick={() => onVerReceta(receta)}
                  style={{ animationDelay: `${i * 0.04}s` }}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function RecetaCard({ receta, onClick, style }) {
  return (
    <div className="receta-card fade-up" style={style} onClick={onClick}>
      <div className="card-foto">
        <span className="card-emoji">{EMOJIS_TIPO[receta.tipo_comida] || '🍽'}</span>
      </div>
      <div className="card-info">
        <h3 className="card-nombre">{receta.nombre}</h3>
        <div className="card-meta">
          <span className="card-tiempo">⏱ {receta.tiempo_prep_min} min</span>
          {receta.lleva_remojo && <span className="card-tag tag-remojo">💧 Remojo</span>}
        </div>
        <div className="card-tags">
          {receta.apta_vegana && <span className="card-tag tag-verde">🌱 Vegano</span>}
          {receta.apta_sin_gluten && <span className="card-tag tag-lila">Sin TACC</span>}
          {receta.dulzor === 'dulce' && <span className="card-tag tag-amarillo">Dulce</span>}
          {receta.dulzor === 'salado' && <span className="card-tag tag-gris">Salado</span>}
        </div>
      </div>
      <button className="card-arrow">›</button>
    </div>
  )
}
