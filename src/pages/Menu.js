import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Menu.css'

const CATEGORIAS = {
  desayuno_merienda: { label: '🌅 Desayuno / Merienda', emoji: '🌅' },
  snack: { label: '🌿 Snacks', emoji: '🌿' },
  almuerzo_cena: { label: '🍽 Almuerzo / Cena', emoji: '🍽' },
  postre: { label: '🍫 Postres', emoji: '🍫' },
  bebida: { label: '🥤 Bebidas', emoji: '🥤' },
}

const ORDEN = ['desayuno_merienda', 'snack', 'almuerzo_cena', 'postre', 'bebida']

export default function Menu({ menuRecetas, onVerReceta, onRemoverDeMenu, onMarcarRealizada }) {
  const [realizadas, setRealizadas] = useState(new Set())
  const [remojos, setRemojos] = useState([]) // [{ingrediente, cantidad, unidad, receta}]

  const LEGUMBRES_REMOJO = ['garbanzos', 'lentejas', 'porotos']

  useEffect(() => {
    if (menuRecetas.length === 0) { setRemojos([]); return }

    const cargarRemojos = async () => {
      const resultado = []
      const vistos = new Set()

      for (const receta of menuRecetas) {
        const { data } = await supabase
          .from('receta_ingredientes')
          .select('cantidad, unidad_normalizada, ingredientes(nombre)')
          .eq('receta_id', receta.id)

        if (!data) continue

        // Detectar por lleva_remojo explícito
        if (receta.lleva_remojo && receta.ingrediente_remojo) {
          const item = data.find(d =>
            d.ingredientes?.nombre?.toLowerCase().includes(receta.ingrediente_remojo.toLowerCase())
          )
          const key = receta.ingrediente_remojo.toLowerCase()
          if (!vistos.has(key)) {
            vistos.add(key)
            resultado.push({
              ingrediente: receta.ingrediente_remojo,
              cantidad: item?.cantidad || '',
              unidad: item?.unidad_normalizada || '',
            })
          }
        }

        // Detectar por ingredientes con "cocido" que sean legumbres
        data.forEach(d => {
          const nombre = d.ingredientes?.nombre?.toLowerCase() || ''
          const esLegumbre = LEGUMBRES_REMOJO.some(l => nombre.includes(l))
          const esCocido = nombre.includes('cocido')
          const noTurca = !nombre.includes('turca')
          if (esLegumbre && esCocido && noTurca && !vistos.has(nombre)) {
            vistos.add(nombre)
            resultado.push({
              ingrediente: d.ingredientes.nombre,
              cantidad: d.cantidad || '',
              unidad: d.unidad_normalizada || '',
            })
          }
        })
      }

      setRemojos(resultado)
    }

    cargarRemojos()
  }, [menuRecetas])

  if (!menuRecetas || menuRecetas.length === 0) {
    return (
      <div className="menu-page">
        <div className="menu-header">
          <h1 className="page-titulo">Mi menú</h1>
          <p className="page-subtitulo">Tu meal prep de la semana</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <p>Entrá a una receta y tocá<br />"Agregar al menú" para organizarlas acá.</p>
        </div>
      </div>
    )
  }

  const toggleRealizada = (recetaId) => {
    setRealizadas(prev => {
      const next = new Set(prev)
      if (next.has(recetaId)) {
        next.delete(recetaId)
      } else {
        next.add(recetaId)
        onMarcarRealizada && onMarcarRealizada(menuRecetas.find(r => r.id === recetaId))
      }
      return next
    })
  }

  // Tiempo total solo de pendientes
  const tiempoTotal = menuRecetas
    .filter(r => !realizadas.has(r.id))
    .reduce((acc, r) => acc + (r.tiempo_prep_min || 0), 0)

  const horas = Math.floor(tiempoTotal / 60)
  const minutos = tiempoTotal % 60
  const tiempoLabel = horas > 0
    ? `${horas} hs ${minutos > 0 ? minutos + ' min' : ''}`
    : `${minutos} min`

  // Agrupar por tipo
  const porCategoria = {}
  menuRecetas.forEach(receta => {
    const tipo = receta.tipo_comida || 'snack'
    if (!porCategoria[tipo]) porCategoria[tipo] = []
    porCategoria[tipo].push(receta)
  })

  const pendientes = menuRecetas.filter(r => !realizadas.has(r.id)).length
  const hechas = realizadas.size

  return (
    <div className="menu-page">
      <div className="menu-header">
        <div className="compras-header-top">
          <div>
            <h1 className="page-titulo">Mi menú</h1>
            <p className="page-subtitulo">
              {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
              {hechas > 0 && ` · ${hechas} realizada${hechas !== 1 ? 's' : ''}`}
            </p>
          </div>
          <button className="btn-limpiar-compras" onClick={() => { menuRecetas.forEach(r => onRemoverDeMenu(r.id)); setRealizadas(new Set()) }}>
            Limpiar todo
          </button>
        </div>
      </div>

      <div className="menu-contenido">

        {/* KPI REMOJO */}
        {remojos.length > 0 && (
          <div className="kpi-remojo">
            <div className="kpi-remojo-titulo">
              <span>💧</span>
              <strong>A remojar antes de cocinar</strong>
            </div>
            {remojos.map((r, i) => (
              <div key={i} className="kpi-remojo-item">
                <span className="remojo-ingrediente">{r.ingrediente}</span>
                <span className="remojo-detalle">
                  {r.cantidad && `${r.cantidad} ${r.unidad} · `}12 hs
                </span>
              </div>
            ))}
          </div>
        )}

        {/* KPI TIEMPO TOTAL */}
        {tiempoTotal > 0 && (
          <div className="kpi-tiempo">
            <span className="kpi-tiempo-icon">⏱</span>
            <div>
              <span className="kpi-tiempo-label">Tiempo total estimado</span>
              <span className="kpi-tiempo-valor">{tiempoLabel}</span>
            </div>
          </div>
        )}

        {/* RECETAS SELECCIONADAS */}
        <div className="recetas-seccion">
          <p className="seccion-titulo">📋 Recetas seleccionadas</p>
          {menuRecetas.map(receta => (
            <div key={receta.id} className="receta-chip">
              <span className="receta-chip-nombre">{receta.nombre}</span>
              <button
                className="receta-chip-remove"
                onClick={(e) => { e.stopPropagation(); onRemoverDeMenu(receta.id) }}
              >✕</button>
            </div>
          ))}
        </div>

        {/* AGRUPADAS POR MOMENTO */}
        {ORDEN.map(tipo => {
          const recetas = porCategoria[tipo]
          if (!recetas || recetas.length === 0) return null
          const cat = CATEGORIAS[tipo]

          return (
            <div key={tipo} className="menu-seccion">
              <p className="seccion-titulo">{cat.label}</p>
              {recetas.map(receta => {
                const hecha = realizadas.has(receta.id)
                return (
                  <div key={receta.id} className={`menu-item ${hecha ? 'realizada' : ''}`}>
                    <button
                      className={`menu-check ${hecha ? 'checked' : ''}`}
                      onClick={(e) => { e.stopPropagation(); toggleRealizada(receta.id) }}
                    >
                      {hecha && <span>✓</span>}
                    </button>
                    <div className="menu-item-info" onClick={() => onVerReceta(receta)}>
                      <span className="menu-item-nombre">{receta.nombre}</span>
                      <span className="menu-item-meta">⏱ {receta.tiempo_prep_min} min</span>
                    </div>
                    <span className="menu-item-arrow" onClick={() => onVerReceta(receta)}>›</span>
                  </div>
                )
              })}
            </div>
          )
        })}

        {/* REALIZADAS */}
        {hechas > 0 && (
          <div className="menu-seccion">
            <p className="seccion-titulo" style={{ color: 'var(--gris)' }}>✓ Realizadas</p>
            {menuRecetas.filter(r => realizadas.has(r.id)).map(receta => (
              <div key={receta.id} className="menu-item realizada">
                <button
                  className="menu-check checked"
                  onClick={(e) => { e.stopPropagation(); toggleRealizada(receta.id) }}
                >
                  <span>✓</span>
                </button>
                <div className="menu-item-info" onClick={() => onVerReceta(receta)}>
                  <span className="menu-item-nombre">{receta.nombre}</span>
                  <span className="menu-item-meta">⏱ {receta.tiempo_prep_min} min</span>
                </div>
                <span className="menu-item-arrow" onClick={() => onVerReceta(receta)}>›</span>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}
