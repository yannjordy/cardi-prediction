import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../utils/supabase'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({fullName:'',email:'',password:'',confirm:''})
  const [showPwd, setShowPwd] = useState(false)
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const set = k => e => setForm(f => ({...f,[k]:e.target.value}))

  const strength = () => {
    const p = form.password
    const c = [p.length>=8, /[A-Z]/.test(p), /[0-9]/.test(p), /[!@#$%]/.test(p)].filter(Boolean).length
    return { score: c, color: ['','#ef4444','#f59e0b','#f59e0b','#10b981'][c], label: ['','Faible','Moyen','Bon','Fort'][c] }
  }

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('')
    if (!form.fullName||!form.email||!form.password) return setError('Veuillez remplir tous les champs')
    if (!terms) return setError("Acceptez les conditions d'utilisation")
    if (form.password.length < 8) return setError('Mot de passe trop court (min 8)')
    if (form.password !== form.confirm) return setError('Les mots de passe ne correspondent pas')
    setLoading(true)
    try {
      const { error: err } = await supabase.auth.signUp({ email:form.email, password:form.password, options:{data:{full_name:form.fullName}} })
      if (err) throw err
      setSuccess('✓ Compte créé ! Vérifiez votre email.')
      setTimeout(() => navigate('/info'), 2500)
    } catch (err) {
      setError(err.message.includes('already') ? 'Email déjà utilisé' : 'Erreur lors de la création')
    } finally { setLoading(false) }
  }

  const s = strength()

  return (
    <div className="auth-container">
      <div className="auth-background"><div className="blur-circle blur-circle-1"/><div className="blur-circle blur-circle-2"/><div className="blur-circle blur-circle-3"/></div>
      <div className="auth-logo-corner"><svg style={{width:28,height:28}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span className="auth-logo-text">Cardi</span></div>
      <div className="form-wrapper" style={{maxWidth:520}}>
        <div className="form-header">
          <button className="auth-back-btn" onClick={() => navigate('/')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <h1 className="form-title">CRÉER UN COMPTE</h1>
          <p className="form-subtitle">Rejoins-nous pour protéger ton cœur ! 💙</p>
        </div>
        <form onSubmit={handleSubmit} style={{marginBottom:32}}>
          {[
            {field:'fullName',label:'Nom complet',type:'text',placeholder:'Jean Dupont',icon:<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>},
            {field:'email',label:'Email',type:'email',placeholder:'ton@email.com',icon:<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>},
          ].map(({field,label,type,placeholder,icon}) => (
            <div className="form-group" key={field}>
              <label className="form-label">{label}</label>
              <div className="input-wrapper">
                <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{icon}</svg>
                <input type={type} className="form-input" placeholder={placeholder} value={form[field]} onChange={set(field)} required/>
              </div>
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Mot de passe</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type={showPwd?'text':'password'} className="form-input" placeholder="••••••••" value={form.password} onChange={set('password')} required minLength={8}/>
              <button type="button" className="toggle-password" onClick={() => setShowPwd(!showPwd)}>
                <svg className="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
              </button>
            </div>
            {form.password && (
              <div style={{marginTop:8}}>
                <div style={{height:6,background:'rgba(139,92,246,.2)',borderRadius:10,overflow:'hidden',marginBottom:4}}>
                  <div style={{height:'100%',width:`${s.score*25}%`,background:s.color,borderRadius:10,transition:'all .3s'}}/>
                </div>
                <span style={{fontSize:12,fontWeight:700,color:s.color}}>{s.label}</span>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Confirmer</label>
            <div className="input-wrapper">
              <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              <input type="password" className="form-input" placeholder="••••••••" value={form.confirm} onChange={set('confirm')} required/>
            </div>
            {form.confirm && <span style={{fontSize:12,fontWeight:700,color:form.password===form.confirm?'#10b981':'#ef4444',display:'block',marginTop:6}}>
              {form.password===form.confirm?'✓ Correspondent':'✗ Ne correspondent pas'}
            </span>}
          </div>
          <div className="form-group">
            <label style={{display:'flex',alignItems:'flex-start',gap:10,cursor:'pointer'}}>
              <input type="checkbox" checked={terms} onChange={e=>setTerms(e.target.checked)} style={{width:20,height:20,minWidth:20,marginTop:2}}/>
              <span style={{fontSize:13,fontWeight:600,color:'var(--auth-text-primary)',lineHeight:1.5}}>
                J'accepte les <a href="#" style={{color:'var(--accent-primary)',fontWeight:700}}>Conditions</a> et la <a href="#" style={{color:'var(--accent-primary)',fontWeight:700}}>Politique</a>
              </span>
            </label>
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading?'Création...':<><span>CRÉER MON COMPTE</span><svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></>}
          </button>
          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}
        </form>
        <p className="auth-link-text">Déjà un compte ? <Link to="/connexion" className="auth-link">Se connecter</Link></p>
      </div>
    </div>
  )
}
