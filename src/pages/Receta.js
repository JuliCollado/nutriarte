import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import './Receta.css'

const EMOJIS_TIPO = {
  desayuno_merienda: '🌅',
  almuerzo_cena: '🍽',
  snack: '🌿',
  postre: '🍫',
  bebida: '🥤'
}

export default function Receta({ receta, onVolver, onAgregarCompras, onAgregarMenu }) {
  const [tab, setTab] = useState('ingredientes')
  const [ingredientes, setIngredientes] = useState([])
  const [loading, setLoading] = useState(true)
  const [favorito, setFavorito] = useState(false)
  const [agregado, setAgregado] = useState(false)

  useEffect(() => {
    cargarIngredientes()
  }, [receta.id])

  const cargarIngredientes = async () => {
    const { data, error } = await supabase
      .from('receta_ingredientes')
      .select(`
        id, cantidad, unidad_normalizada, es_opcional, es_principal,
        ingredientes (id, nombre, categoria)
      `)
      .eq('receta_id', receta.id)
      .order('es_principal', { ascending: false })

    if (!error) setIngredientes(data || [])
    setLoading(false)
  }

  const pasos = receta.pasos
    ? receta.pasos.split(/\d+\.\s+/).filter(p => p.trim())
    : []

  const handleAgregarCompras = () => {
    const items = ingredientes.map(i => ({
      ingrediente_id: i.ingredientes.id,
      nombre: i.ingredientes.nombre,
      cantidad: i.cantidad,
      unidad: i.unidad_normalizada,
      es_opcional: i.es_opcional,
      categoria: i.ingredientes.categoria
    }))
    onAgregarCompras(items, receta.nombre)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  return (
    <div className="receta-detalle">
      {/* HERO */}
      <div className="detalle-hero">
        <div className="hero-blob1" />
        <div className="hero-blob2" />
        <span className="hero-emoji">{EMOJIS_TIPO[receta.tipo_comida] || '🍽'}</span>
        <button className="btn-back" onClick={onVolver}>←</button>
        <button className="btn-fav" onClick={() => setFavorito(!favorito)}>
          {favorito ? '❤️' : '🤍'}
        </button>
      </div>

      {/* CARD */}
      <div className="detalle-card">
        {/* TAGS */}
        <div className="tags-row">
          {receta.apta_vegana && <span className="tag tag-verde">🌱 Vegano</span>}
          {receta.apta_sin_gluten && <span className="tag tag-lila">Sin TACC</span>}
          {receta.dulzor && (
            <span className={`tag ${receta.dulzor === 'dulce' ? 'tag-amarillo' : 'tag-gris'}`}>
              {receta.dulzor === 'dulce' ? '🍯' : '🧂'} {receta.dulzor.charAt(0).toUpperCase() + receta.dulzor.slice(1)}
            </span>
          )}
        </div>

        {/* NOMBRE */}
        <h1 className="detalle-nombre">{receta.nombre}</h1>
        {receta.rendimiento && (
          <p className="detalle-rendimiento">Rinde {receta.rendimiento}</p>
        )}

        {/* META */}
        <div className="detalle-meta">
          <div className="meta-item">
            <span className="meta-icon">⏱</span>
            <span className="meta-valor">{receta.tiempo_prep_min} min</span>
            <span className="meta-label">Tiempo</span>
          </div>
          {receta.lleva_remojo && (
            <div className="meta-item">
              <span className="meta-icon">💧</span>
              <span className="meta-valor">12 hs</span>
              <span className="meta-label">Remojo</span>
            </div>
          )}
        </div>

        {/* NOTA REMOJO */}
        {receta.lleva_remojo && receta.ingrediente_remojo && (
          <div className="nota-remojo">
            <span>💡</span>
            <p><strong>Remojo previo:</strong> {receta.ingrediente_remojo} necesita estar en agua 12 hs antes de cocinar.</p>
          </div>
        )}

        {/* TABS */}
        <div className="detalle-tabs">
          <button className={`dtab ${tab === 'ingredientes' ? 'active' : ''}`} onClick={() => setTab('ingredientes')}>
            Ingredientes
          </button>
          <button className={`dtab ${tab === 'pasos' ? 'active' : ''}`} onClick={() => setTab('pasos')}>
            Preparación
          </button>
          {receta.notas && (
            <button className={`dtab ${tab === 'notas' ? 'active' : ''}`} onClick={() => setTab('notas')}>
              Notas
            </button>
          )}
        </div>

        {/* CONTENIDO TAB */}
        {tab === 'ingredientes' && (
          <div className="tab-contenido">
            {loading ? (
              <div className="loading">Cargando...</div>
            ) : (
              <div className="ing-lista">
                {ingredientes.map(i => (
                  <div key={i.id} className="ing-item">
                    <div className="ing-nombre">
                      <div className={`ing-dot ${i.es_opcional ? 'opcional' : ''}`} />
                      {i.ingredientes.nombre}
                    </div>
                    <div className="ing-derecha">
                      {i.cantidad && <span className="ing-cantidad">{i.cantidad} {i.unidad_normalizada || ''}</span>}
                      {i.es_opcional && <span className="ing-opcional">opcional</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'pasos' && (
          <div className="tab-contenido">
            <div className="pasos-lista">
              {pasos.map((paso, i) => (
                <div key={i} className="paso-item">
                  <div className="paso-num">{i + 1}</div>
                  <p className="paso-texto">{paso.trim()}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'notas' && receta.notas && (
          <div className="tab-contenido">
            <div className="notas-box">
              <p>{receta.notas}</p>
            </div>
          </div>
        )}

        {/* ESPACIO PARA BOTONES FIJOS */}
        <div style={{ height: 32 }} />
      </div>

      {/* BOTONES FIJOS */}
      <div className="detalle-actions">
        <button className="btn-secundario" onClick={handleAgregarCompras}>
          {agregado ? '✓ Agregado' : '🛒 Lista'}
        </button>
        <button className="btn-primario" style={{ flex: 2 }}>
          📋 Agregar al menú
        </button>
      </div>
    </div>
  )
}
