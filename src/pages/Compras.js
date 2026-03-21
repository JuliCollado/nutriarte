import { useState } from 'react'
import './Compras.css'

const CATEGORIA_LABELS = {
  verduleria: '🥦 Verdulería',
  almacen: '🛒 Almacén'
}

export default function Compras({ lista, onLimpiar, onRemoverReceta }) {
  const [tachados, setTachados] = useState(new Set())

  // Recetas únicas en la lista
  const recetas = [...new Set(lista.map(i => i.origen))]

  if (lista.length === 0) {
    return (
      <div className="compras-page">
        <div className="compras-header">
          <h1 className="page-titulo">Lista de compras</h1>
          <p className="page-subtitulo">Tu lista está vacía</p>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🛒</div>
          <p>Entrá a una receta y tocá<br />"Lista" para agregar ingredientes.</p>
        </div>
      </div>
    )
  }

  // Unificar ingredientes de todas las recetas activas
  const unificados = {}
  lista.forEach(item => {
    const key = item.nombre.toLowerCase()
    if (item.categoria === 'omitir') return
    if (!unificados[key]) {
      unificados[key] = { ...item, origenes: [item.origen] }
    } else {
      if (!unificados[key].origenes.includes(item.origen)) {
        unificados[key].origenes.push(item.origen)
      }
    }
  })

  const items = Object.values(unificados)
  const porCategoria = {
    verduleria: items.filter(i => i.categoria === 'verduleria'),
    almacen: items.filter(i => i.categoria !== 'verduleria')
  }

  const totalItems = items.length
  const tachados_count = tachados.size
  const pendientes = totalItems - tachados_count

  const toggleTachado = (nombre) => {
    setTachados(prev => {
      const next = new Set(prev)
      if (next.has(nombre)) next.delete(nombre)
      else next.add(nombre)
      return next
    })
  }

  const handleRemoverReceta = (receta) => {
    // Limpiar tachados que ya no tienen ingredientes
    setTachados(new Set())
    onRemoverReceta(receta)
  }

  const compartir = () => {
    const lineas = [`*Lista de compras*\n`]
    Object.entries(porCategoria).forEach(([cat, items]) => {
      const activos = items.filter(i => !tachados.has(i.nombre.toLowerCase()))
      if (activos.length === 0) return
      lineas.push(`*${CATEGORIA_LABELS[cat]}*`)
      activos.forEach(i => {
        lineas.push(`• ${i.nombre}${i.cantidad ? ` — ${i.cantidad} ${i.unidad || ''}`.trim() : ''}`)
      })
      lineas.push('')
    })
    const texto = lineas.join('\n')
    if (navigator.share) {
      navigator.share({ text: texto })
    } else {
      navigator.clipboard.writeText(texto)
      alert('Lista copiada al portapapeles')
    }
  }

  return (
    <div className="compras-page">
      <div className="compras-header">
        <div className="compras-header-top">
          <div>
            <h1 className="page-titulo">Lista de compras</h1>
            <p className="page-subtitulo">
              {pendientes} pendiente{pendientes !== 1 ? 's' : ''}
              {tachados_count > 0 && ` · ${tachados_count} listo${tachados_count !== 1 ? 's' : ''}`}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="btn-limpiar-compras" onClick={compartir}>
              📤 Compartir
            </button>
            <button className="btn-limpiar-compras" onClick={() => { onLimpiar(); setTachados(new Set()) }}>
              Limpiar todo
            </button>
          </div>
        </div>

        {tachados_count > 0 && (
          <div className="progreso-bar">
            <div className="progreso-fill" style={{ width: `${(tachados_count / totalItems) * 100}%` }} />
          </div>
        )}
      </div>

      <div className="compras-contenido">

        {/* RECETAS SELECCIONADAS */}
        <div className="recetas-seccion">
          <p className="seccion-titulo">📋 Recetas seleccionadas</p>
          {recetas.map(receta => (
            <div key={receta} className="receta-chip">
              <span className="receta-chip-nombre">{receta}</span>
              <button
                className="receta-chip-remove"
                onClick={(e) => { e.stopPropagation(); handleRemoverReceta(receta) }}
              >✕</button>
            </div>
          ))}
        </div>

        {/* INGREDIENTES POR CATEGORÍA */}
        {Object.entries(porCategoria).map(([cat, items]) => {
          if (items.length === 0) return null
          const activos = items.filter(i => !tachados.has(i.nombre.toLowerCase()))
          const hechos = items.filter(i => tachados.has(i.nombre.toLowerCase()))

          return (
            <div key={cat} className="compras-seccion">
              <p className="seccion-titulo">{CATEGORIA_LABELS[cat]}</p>
              {activos.map(item => (
                <ItemCompra key={item.nombre} item={item} tachado={false} onToggle={() => toggleTachado(item.nombre.toLowerCase())} />
              ))}
              {hechos.map(item => (
                <ItemCompra key={item.nombre} item={item} tachado={true} onToggle={() => toggleTachado(item.nombre.toLowerCase())} />
              ))}
            </div>
          )
        })}

      </div>

      <div className="compras-actions">
        <button className="btn-primario" style={{ flex: 1 }} onClick={compartir}>
          📤 Compartir lista
        </button>
      </div>
    </div>
  )
}

function ItemCompra({ item, tachado, onToggle }) {
  return (
    <div className={`compra-item ${tachado ? 'tachado' : ''}`} onClick={onToggle}>
      <div className={`compra-check ${tachado ? 'checked' : ''}`}>
        {tachado && <span>✓</span>}
      </div>
      <div className="compra-info">
        <span className="compra-nombre">{item.nombre}</span>
        {item.origenes && item.origenes.length > 1 && (
          <span className="compra-origen">{item.origenes.join(' · ')}</span>
        )}
      </div>
      {item.cantidad && (
        <span className="compra-cantidad">{item.cantidad} {item.unidad || ''}</span>
      )}
    </div>
  )
}
