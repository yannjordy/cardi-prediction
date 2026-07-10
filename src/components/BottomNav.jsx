import { Link, useLocation } from 'react-router-dom'
import { useState, useRef, useCallback } from 'react'
import EmergencyModal from './EmergencyModal'

export default function BottomNav() {
  const { pathname } = useLocation()
  const [showEmergency, setShowEmergency] = useState(false)
  const [longPressProgress, setLongPressProgress] = useState(false)
  const longPressTimer = useRef(null)
  const pressStart = useRef(null)

  const active = path => pathname.startsWith(path) ? 'nav-item active' : 'nav-item'

  const LONG_PRESS_DURATION = 1500

  const handlePressStart = useCallback(() => {
    pressStart.current = Date.now()
    setLongPressProgress(true)

    longPressTimer.current = setTimeout(() => {
      setLongPressProgress(false)
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      window.location.href = 'tel:119'
    }, LONG_PRESS_DURATION)
  }, [])

  const handlePressEnd = useCallback(() => {
    const elapsed = Date.now() - (pressStart.current || 0)
    clearTimeout(longPressTimer.current)
    setLongPressProgress(false)

    if (elapsed < LONG_PRESS_DURATION) {
      setShowEmergency(true)
    }
  }, [])

  const handlePressCancel = useCallback(() => {
    clearTimeout(longPressTimer.current)
    setLongPressProgress(false)
  }, [])

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
            <span>Activite</span>
          </Link>
          <button
            className="nav-item"
            style={{ background: 'none', border: 'none', position: 'relative' }}
            onMouseDown={handlePressStart}
            onMouseUp={handlePressEnd}
            onMouseLeave={handlePressCancel}
            onTouchStart={handlePressStart}
            onTouchEnd={handlePressEnd}
            onTouchCancel={handlePressCancel}
          >
            <div className="emergency-btn" style={longPressProgress ? { transform: 'translateY(-12px) scale(1.1)' } : {}}>
              <div className="emergency-ripple"/>
              <div className="emergency-ripple" style={{animationDelay:'.5s'}}/>
              {longPressProgress && (
                <svg style={{position:'absolute',width:64,height:64,zIndex:3}} viewBox="0 0 64 64">
                  <circle cx="32" cy="32" r="28" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="4"/>
                  <circle cx="32" cy="32" r="28" fill="none" stroke="white" strokeWidth="4"
                    strokeDasharray="176" strokeDashoffset="176"
                    strokeLinecap="round" transform="rotate(-90 32 32)"
                    style={{animation:`progressCircle ${LONG_PRESS_DURATION}ms linear forwards`}}/>
                </svg>
              )}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
              </svg>
            </div>
            <span style={{fontSize:10,fontWeight:700,color:longPressProgress ? '#ef4444' : 'var(--text-tertiary)',marginTop:4}}>
              {longPressProgress ? 'Maintenez...' : 'Alerte'}
            </span>
          </button>
          <Link to="/prediction" className={active('/prediction')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <span>Prediction</span>
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
