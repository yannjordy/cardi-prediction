import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function Login() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPwd, setShowPwd] = useState(false)
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const rem = localStorage.getItem('rememberMe')
    const em = localStorage.getItem('userEmail')
    if (rem === 'true' && em) { setEmail(em); setRemember(true) }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) return setError('Veuillez remplir tous les champs')
    setLoading(true); setError('')
    try {
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      remember ? localStorage.setItem('rememberMe','true') && localStorage.setItem('userEmail', email) : localStorage.removeItem('rememberMe')
      navigate('/home')
    } catch (err) {
      setError(err.message.includes('Invalid') ? 'Email ou mot de passe incorrect' : 'Erreur de connexion')
    } finally { setLoading(false) }
  }

  return (
    <div className="auth-container">
      <div className="auth-background"><div className="blur-circle blur-circle-1"/><div className="blur-circle blur-circle-2"/><div className="blur-circle blur-circle-3"/></div>
      <div className="auth-logo-corner"><svg style={{width:28,height:28}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span className="auth-logo-text">Cardi</span></div>
      <div className="form-wrapper" style={{maxWidth:460}}>
        <div className="form-header">
          <button className="auth-back-btn" onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="form-title">CONNEXION</h1>
          <p className="form-subtitle">Content de te revoir ! 👋</p>
        </div>
        <form onSubmit={handleSubmit} style={{marginBottom:32}}>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              <input type="email" className="form-input" placeholder="ton@email.com" value={email} onChange={e => setEmail(e.target.value)} required/>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type={showPwd?'text':'password'} className="form-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required/>
              <button type="button" className="toggle-password" onClick={() => setShowPwd(!showPwd)}>
                <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
          </div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:24}}>
            <label style={{display:'flex',alignItems:'center',gap:8,cursor:'pointer'}}>
              <input type="checkbox" checked={remember} onChange={e => setRemember(e.target.checked)} style={{width:18,height:18}}/>
              <span style={{fontSize:14,fontWeight:600,color:'var(--auth-text-primary)'}}>Se souvenir</span>
            </label>
            <a href="#" style={{fontSize:14,fontWeight:700,color:'var(--accent-primary)',textDecoration:'none'}}>Mot de passe oublié ?</a>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Connexion...' : <><span>SE CONNECTER</span><svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
          </button>
          {error && <div className="error-message">{error}</div>}
        </form>
        <p className="auth-link-text">Pas encore de compte ? <Link to="/inscription" className="auth-link">Créer un compte</Link></p>
      </div>
    </div>
  )
}
