export default function Perfil({ historial = [], onVerReceta }) {
  return (
    <div style={{ padding: '52px 24px 100px', background: 'var(--crema)', minHeight: '100vh' }}>
      <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, marginBottom: 4 }}>Perfil</h1>
      <p style={{ color: '#6B6B6B', fontSize: 13, marginBottom: 28 }}>Login y favoritos próximamente 🌿</p>

      {historial.length > 0 && (
        <div>
          <p style={{
            fontSize: 12, fontWeight: 700, color: 'var(--verde-dark)',
            textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12
          }}>
            📖 Historial de recetas realizadas
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {historial.map((receta, i) => (
              <div
                key={i}
                onClick={() => onVerReceta(receta)}
                style={{
                  background: 'white', borderRadius: 14, padding: '13px 16px',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, fontFamily: 'Fraunces, serif' }}>{receta.nombre}</p>
                  <p style={{ fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>{receta.fecha}</p>
                </div>
                <span style={{ fontSize: 18, color: '#EDE6D6' }}>›</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {historial.length === 0 && (
        <div style={{ textAlign: 'center', paddingTop: 40, color: '#6B6B6B', fontSize: 14 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>📖</div>
          <p>Acá vas a ver las recetas que fuiste realizando.</p>
        </div>
      )}
    </div>
  )
}
