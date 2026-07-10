import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'
import ThemeToggle from '../components/ThemeToggle'
import { supabase } from '../utils/supabase'

export default function Profile() {
  const navigate = useNavigate()
  const [userData, setUserData] = useState({})
  const [editField, setEditField] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [notifications, setNotifications] = useState(true)
  const [vibration, setVibration] = useState(true)
  const [measureCount, setMeasureCount] = useState(0)
  const [profilePic, setProfilePic] = useState(() => localStorage.getItem('cardiProfilePic') || '')

  useEffect(() => {
    try {
      const d = JSON.parse(localStorage.getItem('cardiUserHealthData') || '{}')
      setUserData(d)
      const hist = JSON.parse(localStorage.getItem('cardiHistory') || '[]')
      setMeasureCount(hist.length)
    } catch {}
  }, [])

  const handlePicUpload = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target.result
      localStorage.setItem('cardiProfilePic', dataUrl)
      setProfilePic(dataUrl)
    }
    reader.readAsDataURL(file)
  }

  const save = () => {
    const updated = { ...userData, [editField]: editValue }
    const h = parseFloat(updated.height)
    const w = parseFloat(updated.weight)
    if (h > 0 && w > 0) {
      updated.bmi = (w / ((h / 100) ** 2)).toFixed(1)
    }
    localStorage.setItem('cardiUserHealthData', JSON.stringify(updated))
    setUserData(updated)
    setEditField(null)
  }

  const logout = async () => {
    await supabase.auth.signOut()
    navigate('/')
  }

  const genderLabel = { male: 'Homme', female: 'Femme', other: 'Autre' }
  const activityLabel = { sedentary: 'Sédentaire', light: 'Léger', moderate: 'Modéré', active: 'Très actif' }

  const healthItems = [
    { field: 'age', label: 'Âge', display: userData.age ? `${userData.age} ans` : '--' },
    { field: 'height', label: 'Taille', display: userData.height ? `${userData.height} cm` : '--' },
    { field: 'weight', label: 'Poids', display: userData.weight ? `${userData.weight} kg` : '--' },
    { field: 'pressure', label: 'Pression', display: userData.systolic ? `${userData.systolic}/${userData.diastolic} mmHg` : '--/--' },
    { field: 'gender', label: 'Sexe', display: genderLabel[userData.gender] || '--' },
    { field: 'activityLevel', label: 'Activité', display: activityLabel[userData.activityLevel] || '--' },
  ]

  const settings = [
    { icon: 'bell', label: 'Notifications', desc: 'Alertes et rappels', toggle: true, id: 'notifications' },
    { icon: 'vibrate', label: 'Vibrations', desc: 'Retour haptique', toggle: true, id: 'vibration' },
    { icon: 'edit', label: 'Modifier le profil', desc: 'Informations personnelles', link: '/info' },
    { icon: 'lock', label: 'Confidentialité', desc: 'Données et sécurité', link: '#' },
    { icon: 'help', label: 'Aide et support', desc: 'FAQ et contact', link: '#' },
  ]

  return (
    <div>
      <header className="header">
        <div className="header-content">
          <button className="back-btn" onClick={() => window.history.back()}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="header-logo">
            <svg style={{width:28,height:28}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <h1 className="header-title">Mon Profil</h1>
          </div>
          <ThemeToggle/>
        </div>
      </header>

      <main className="container">
        {/* Profile header */}
        <div style={{background:'linear-gradient(135deg,#ff6b9d,#8b5cf6)',borderRadius:24,padding:32,marginBottom:24,boxShadow:'0 8px 32px rgba(255,107,157,0.3)',position:'relative',overflow:'hidden'}}>
          <div style={{position:'relative',zIndex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:16}}>
            <div onClick={() => document.getElementById('picInput').click()} style={{width:120,height:120,borderRadius:'50%',border:'4px solid rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.2)',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden',cursor:'pointer',position:'relative'}}>
              {profilePic ? (
                <img src={profilePic} alt="photo" style={{width:'100%',height:'100%',objectFit:'cover'}} />
              ) : (
                <svg style={{width:60,height:60,color:'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              )}
              <div style={{position:'absolute',bottom:0,left:0,right:0,background:'rgba(0,0,0,0.5)',padding:'4px 0',textAlign:'center'}}>
                <svg style={{width:20,height:20,color:'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              </div>
            </div>
            <input id="picInput" type="file" accept="image/jpeg,image/png,image/webp" style={{display:'none'}} onChange={handlePicUpload} />
            <div style={{textAlign:'center',color:'white'}}>
              <h2 style={{fontFamily:'Fredoka,cursive',fontSize:24,fontWeight:700,marginBottom:4,cursor:'pointer'}} onClick={() => { setEditField('fullName'); setEditValue(userData.fullName || '') }}>
                {userData.fullName || 'Utilisateur'}
              </h2>
              <p style={{fontSize:14,fontWeight:600,opacity:0.9}}>{userData.email || 'cardi@app.com'}</p>
            </div>
            <div style={{display:'flex',gap:24}}>
              {[
                { val: userData.age || '--', label: 'ans' },
                { val: userData.bmi || '--', label: 'IMC' },
                { val: measureCount, label: 'mesures' },
              ].map((s, i) => (
                <div key={i} style={{textAlign:'center'}}>
                  <span style={{display:'block',fontSize:24,fontWeight:800,color:'white'}}>{s.val}</span>
                  <span style={{fontSize:12,fontWeight:600,opacity:0.9,color:'white'}}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Health info */}
        <div style={{background:'var(--bg-card)',borderRadius:24,padding:24,marginBottom:24,border:'1px solid var(--border-color)',boxShadow:'0 4px 16px var(--shadow)'}}>
          <h3 style={{fontFamily:'Fredoka,cursive',fontSize:18,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
            <svg style={{width:24,height:24,color:'var(--accent-primary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
            Informations de santé
          </h3>
          <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:12}}>
            {healthItems.map((item, i) => (
              <div key={i}
                onClick={() => { setEditField(item.field); setEditValue(userData[item.field] || '') }}
                style={{background:'var(--bg-secondary)',border:'1px solid var(--border-color)',borderRadius:16,padding:16,cursor:'pointer',transition:'all 0.3s ease'}}
                onMouseOver={e => { e.currentTarget.style.borderColor='var(--accent-secondary)'; e.currentTarget.style.transform='translateY(-2px)' }}
                onMouseOut={e => { e.currentTarget.style.borderColor='var(--border-color)'; e.currentTarget.style.transform='' }}
              >
                <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:8}}>
                  <div style={{width:32,height:32,background:'linear-gradient(135deg,rgba(255,107,157,0.1),rgba(139,92,246,0.1))',borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <svg style={{width:18,height:18,color:'var(--accent-primary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                  </div>
                  <svg style={{width:16,height:16,color:'var(--text-tertiary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </div>
                <p style={{fontSize:12,fontWeight:600,color:'var(--text-secondary)',marginBottom:4}}>{item.label}</p>
                <p style={{fontSize:20,fontWeight:800}}>{item.display}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Settings */}
        <div style={{background:'var(--bg-card)',borderRadius:24,padding:24,marginBottom:24,border:'1px solid var(--border-color)',boxShadow:'0 4px 16px var(--shadow)'}}>
          <h3 style={{fontFamily:'Fredoka,cursive',fontSize:18,fontWeight:700,marginBottom:20,display:'flex',alignItems:'center',gap:8}}>
            <svg style={{width:24,height:24,color:'var(--accent-primary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v6m0 6v6m5.656-13.656l-4.242 4.242m-2.828 2.828l-4.242 4.242M23 12h-6m-6 0H5"/></svg>
            Paramètres
          </h3>
          {settings.map((s, i) => (
            <div key={i}
              onClick={() => s.link ? navigate(s.link) : null}
              style={{background:'var(--bg-secondary)',border:'1px solid var(--border-color)',borderRadius:16,padding:16,marginBottom:12,display:'flex',alignItems:'center',justifyContent:'space-between',cursor:'pointer',transition:'all 0.3s ease'}}
              onMouseOver={e => { e.currentTarget.style.transform='translateX(4px)'; e.currentTarget.style.borderColor='var(--accent-secondary)' }}
              onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='var(--border-color)' }}
            >
              <div style={{display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:40,height:40,background:'linear-gradient(135deg,rgba(255,107,157,0.1),rgba(139,92,246,0.1))',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center'}}>
                  <svg style={{width:20,height:20,color:'var(--accent-primary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
                </div>
                <div>
                  <span style={{display:'block',fontSize:15,fontWeight:700}}>{s.label}</span>
                  <span style={{display:'block',fontSize:12,fontWeight:600,color:'var(--text-secondary)'}}>{s.desc}</span>
                </div>
              </div>
              {s.toggle ? (
                <div
                  onClick={e => { e.stopPropagation(); if (s.id === 'notifications') setNotifications(!notifications); else setVibration(!vibration) }}
                  style={{width:48,height:28,background:( s.id === 'notifications' ? notifications : vibration) ? 'var(--accent-primary)' : 'var(--border-color)',borderRadius:14,position:'relative',cursor:'pointer',transition:'all 0.3s ease'}}
                >
                  <div style={{position:'absolute',top:4,left:( s.id === 'notifications' ? notifications : vibration) ? 24 : 4,width:20,height:20,background:'white',borderRadius:'50%',transition:'all 0.3s ease',boxShadow:'0 2px 4px rgba(0,0,0,0.2)'}}/>
                </div>
              ) : (
                <svg style={{width:20,height:20,color:'var(--text-tertiary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              )}
            </div>
          ))}
        </div>

        {/* Logout */}
        <button onClick={logout} style={{width:'100%',padding:18,background:'var(--bg-card)',border:'2px solid var(--danger)',borderRadius:16,fontFamily:'Fredoka,sans-serif',fontSize:15,fontWeight:700,color:'var(--danger)',cursor:'pointer',transition:'all 0.3s ease',display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginBottom:24}}
          onMouseOver={e => { e.currentTarget.style.background='var(--danger)'; e.currentTarget.style.color='white' }}
          onMouseOut={e => { e.currentTarget.style.background='var(--bg-card)'; e.currentTarget.style.color='var(--danger)' }}
        >
          <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          Déconnexion
        </button>
      </main>

      {/* Edit modal */}
      {editField && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditField(null)}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>Modifier {editField}</h3>
              <button className="modal-close" onClick={() => setEditField(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              <input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                placeholder={`Entrez votre ${editField}`}
                style={{padding:'14px 16px',background:'var(--bg-secondary)',border:'2px solid var(--border-color)',borderRadius:12,fontFamily:'Nunito,sans-serif',fontSize:15,fontWeight:600,color:'var(--text-primary)',outline:'none'}}
                onFocus={e => e.target.style.borderColor='var(--accent-secondary)'}
                onBlur={e => e.target.style.borderColor='var(--border-color)'}
              />
              <button onClick={save} className="btn btn-primary" style={{width:'100%'}}>Enregistrer</button>
            </div>
          </div>
        </div>
      )}

      <BottomNav/>
    </div>
  )
}
