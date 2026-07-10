import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import EmergencyModal from './EmergencyModal'

export default function BottomNav() {
  const { pathname } = useLocation()
  const [showEmergency, setShowEmergency] = useState(false)
  const active = path => pathname.startsWith(path) ? 'nav-item active' : 'nav-item'

  return (
    <>
      <nav className="bottom-nav">
        <div className="nav-container">
          <Link to="/home" className={active('/home')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>
            <span>Accueil</span>
          </Link>
          <Link to="/activite" className={active('/activite')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            <span>Activité</span>
          </Link>
          <button className="nav-item" onClick={() => setShowEmergency(true)} style={{background:'none',border:'none'}}>
            <div className="emergency-btn">
              <div className="emergency-ripple"/>
              <div className="emergency-ripple" style={{animationDelay:'.5s'}}/>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
          </button>
          <Link to="/prediction" className={active('/prediction')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Prédiction</span>
          </Link>
          <Link to="/profil" className={active('/profil')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            <span>Profil</span>
          </Link>
        </div>
      </nav>
      {showEmergency && <EmergencyModal onClose={() => setShowEmergency(false)}/>}
    </>
  )
}
