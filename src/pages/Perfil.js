import './Perfil.css'

export default function Perfil({ usuario, historial = [], favoritos, favoritosDetalle = [], onVerReceta, onLogout }) {
  const nombre = usuario?.user_metadata?.nombre || usuario?.email?.split('@')[0] || 'Paciente'

  return (
    <div className="perfil-page">
      <div className="perfil-header">
        <div className="perfil-avatar">{nombre.charAt(0).toUpperCase()}</div>
        <div>
          <h1 className="perfil-nombre">{nombre}</h1>
          <p className="perfil-email">{usuario?.email}</p>
        </div>
      </div>

      <div className="perfil-contenido">

        {/* STATS */}
        <div className="perfil-stats">
          <div className="stat-item">
            <span className="stat-valor">{favoritosDetalle.length}</span>
            <span className="stat-label">Favoritos</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-item">
            <span className="stat-valor">{historial.length}</span>
            <span className="stat-label">Realizadas</span>
          </div>
        </div>

        {/* FAVORITOS */}
        {favoritosDetalle.length > 0 && (
          <div className="perfil-seccion">
            <p className="seccion-titulo">❤️ Mis favoritos</p>
            <div className="perfil-lista">
              {favoritosDetalle.map(receta => (
                <div key={receta.id} className="perfil-item" onClick={() => onVerReceta(receta)}>
                  <div>
                    <p className="perfil-item-nombre">{receta.nombre}</p>
                    <p className="perfil-item-fecha">⏱ {receta.tiempo_prep_min} min</p>
                  </div>
                  <span className="perfil-item-arrow">›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTORIAL */}
        {historial.length > 0 && (
          <div className="perfil-seccion">
            <p className="seccion-titulo">📖 Historial de recetas</p>
            <div className="perfil-lista">
              {historial.map((receta, i) => (
                <div key={i} className="perfil-item" onClick={() => onVerReceta(receta)}>
                  <div>
                    <p className="perfil-item-nombre">{receta.nombre}</p>
                    <p className="perfil-item-fecha">{receta.fecha}</p>
                  </div>
                  <span className="perfil-item-arrow">›</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {historial.length === 0 && (
          <div className="empty-state" style={{ paddingTop: 20 }}>
            <div className="empty-icon">📖</div>
            <p>Acá vas a ver las recetas que fuiste realizando.</p>
          </div>
        )}

        {/* LOGOUT */}
        <button className="btn-logout" onClick={onLogout}>
          Cerrar sesión
        </button>

      </div>
    </div>
  )
}
