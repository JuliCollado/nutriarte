import './Menu.css'

const CATEGORIAS = {
  desayuno_merienda: { label: '🌅 Desayuno / Merienda', emoji: '🌅' },
  snack: { label: '🌿 Snacks', emoji: '🌿' },
  almuerzo_cena: { label: '🍽 Almuerzo / Cena', emoji: '🍽' },
  postre: { label: '🍫 Postres', emoji: '🍫' },
  bebida: { label: '🥤 Bebidas', emoji: '🥤' },
}

export default function Menu({ menuRecetas, onVerReceta, onRemoverDeMenu }) {

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

  // Agrupar por tipo de comida
  const porCategoria = {}
  menuRecetas.forEach(receta => {
    const tipo = receta.tipo_comida || 'snack'
    if (!porCategoria[tipo]) porCategoria[tipo] = []
    porCategoria[tipo].push(receta)
  })

  // Orden de categorías
  const orden = ['desayuno_merienda', 'snack', 'almuerzo_cena', 'postre', 'bebida']

  return (
    <div className="menu-page">
      <div className="menu-header">
        <h1 className="page-titulo">Mi menú</h1>
        <p className="page-subtitulo">{menuRecetas.length} receta{menuRecetas.length !== 1 ? 's' : ''} seleccionada{menuRecetas.length !== 1 ? 's' : ''}</p>
      </div>

      <div className="menu-contenido">

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
        {orden.map(tipo => {
          const recetas = porCategoria[tipo]
          if (!recetas || recetas.length === 0) return null
          const cat = CATEGORIAS[tipo]

          return (
            <div key={tipo} className="menu-seccion">
              <p className="seccion-titulo">{cat.label}</p>
              {recetas.map(receta => (
                <div
                  key={receta.id}
                  className="menu-item"
                  onClick={() => onVerReceta(receta)}
                >
                  <div className="menu-item-emoji">{cat.emoji}</div>
                  <div className="menu-item-info">
                    <span className="menu-item-nombre">{receta.nombre}</span>
                    <span className="menu-item-meta">⏱ {receta.tiempo_prep_min} min</span>
                  </div>
                  <span className="menu-item-arrow">›</span>
                </div>
              ))}
            </div>
          )
        })}

      </div>
    </div>
  )
}
