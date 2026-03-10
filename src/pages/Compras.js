export default function Compras({ lista, onLimpiar }) {
  if (lista.length === 0) {
    return (
      <div style={{ padding: '56px 24px 24px' }}>
        <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, marginBottom: 8 }}>Lista de compras</h1>
        <div className="empty-state" style={{ paddingTop: 40 }}>
          <div className="empty-icon">🛒</div>
          <p>Todavía no agregaste ingredientes.<br />Entrá a una receta y tocá "Lista".</p>
        </div>
      </div>
    )
  }

  const porOrigen = lista.reduce((acc, item) => {
    if (!acc[item.origen]) acc[item.origen] = []
    acc[item.origen].push(item)
    return acc
  }, {})

  const compartir = () => {
    const texto = Object.entries(porOrigen).map(([receta, items]) =>
      `*${receta}*\n` + items.map(i => `• ${i.nombre}${i.cantidad ? ` — ${i.cantidad} ${i.unidad || ''}` : ''}`).join('\n')
    ).join('\n\n')
    if (navigator.share) {
      navigator.share({ text: texto })
    } else {
      navigator.clipboard.writeText(texto)
      alert('Lista copiada al portapapeles')
    }
  }

  return (
    <div style={{ padding: '56px 24px 100px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
        <div>
          <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, marginBottom: 4 }}>Lista de compras</h1>
          <p style={{ color: '#6B6B6B', fontSize: 13 }}>{lista.length} ingredientes</p>
        </div>
        <button onClick={onLimpiar} style={{
          background: '#EDE6D6', border: 'none', borderRadius: 10,
          padding: '8px 14px', fontSize: 12, fontWeight: 600,
          color: '#6B6B6B', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif'
        }}>
          Limpiar
        </button>
      </div>

      {Object.entries(porOrigen).map(([receta, items]) => (
        <div key={receta} style={{ marginBottom: 20 }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: '#7FA876', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>
            {receta}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {items.map(item => (
              <div key={item.id} style={{
                background: 'white', borderRadius: 12, padding: '12px 14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
              }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{item.nombre}</span>
                {item.cantidad && (
                  <span style={{ fontSize: 13, color: '#4A4A4A', fontWeight: 500 }}>
                    {item.cantidad} {item.unidad || ''}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 430,
        background: 'white', borderTop: '1px solid #EDE6D6',
        padding: '14px 20px 28px', zIndex: 100
      }}>
        <button className="btn-primario" style={{ width: '100%' }} onClick={compartir}>
          📤 Compartir lista
        </button>
      </div>
    </div>
  )
}
