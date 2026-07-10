import { useState } from 'react'
export default function EmergencyModal({ onClose }) {
  const [numbers, setNumbers] = useState(() => {
    try { return JSON.parse(localStorage.getItem('cardiEmergencyNumbers') || '["15","17","18","112"]') } catch { return ['15','17','18','112'] }
  })
  const save = n => { setNumbers(n); localStorage.setItem('cardiEmergencyNumbers', JSON.stringify(n)) }
  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-content">
        <div className="modal-header">
          <h3>🚨 Urgences</h3>
          <button className="modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <p style={{fontSize:14,color:'var(--text-secondary)',fontWeight:600,marginBottom:16}}>Numéros d'urgence configurés</p>
        {numbers.map((n, i) => (
          <div key={i} style={{background:'var(--bg-secondary)',border:'1px solid var(--border-color)',borderRadius:12,padding:12,marginBottom:12,display:'flex',alignItems:'center',gap:12}}>
            <input type="tel" value={n} onChange={e => { const u=[...numbers]; u[i]=e.target.value; save(u) }}
              style={{flex:1,background:'transparent',border:'none',fontSize:16,fontWeight:700,color:'var(--text-primary)',outline:'none',fontFamily:'Nunito,sans-serif'}}/>
            <button onClick={() => save(numbers.filter((_,j) => j!==i))}
              style={{width:32,height:32,border:'none',background:'rgba(239,68,68,.1)',borderRadius:8,color:'#ef4444',cursor:'pointer',fontSize:14}}>✕</button>
          </div>
        ))}
        <button onClick={() => save([...numbers,''])} className="btn btn-secondary" style={{width:'100%',marginBottom:12}}>+ Ajouter</button>
        <a href={`tel:${numbers[0]||'15'}`} style={{display:'block',padding:16,background:'linear-gradient(135deg,#ef4444,#dc2626)',color:'#fff',borderRadius:16,textAlign:'center',fontFamily:'Fredoka,sans-serif',fontSize:16,fontWeight:700,textDecoration:'none'}}>
          📞 Appeler le {numbers[0]||'15'}
        </a>
      </div>
    </div>
  )
}
