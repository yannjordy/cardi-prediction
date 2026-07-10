import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const STEPS = [
  { id:1, title:"Quel est ton âge ?", subtitle:"Pour personnaliser tes recommandations", field:'age', type:'number', placeholder:'25', unit:'ans', min:1, max:120 },
  { id:2, title:"Quel est ton sexe ?", subtitle:"Pour des calculs de santé précis", field:'gender', type:'options', options:[{value:'male',label:'Homme'},{value:'female',label:'Femme'},{value:'other',label:'Autre'}] },
  { id:3, title:"Quelle est ta taille ?", subtitle:"Nécessaire pour calculer ton IMC", field:'height', type:'number', placeholder:'170', unit:'cm', min:50, max:250 },
  { id:4, title:"Quel est ton poids ?", subtitle:"Pour un suivi précis de ta santé", field:'weight', type:'number', placeholder:'70', unit:'kg', min:20, max:300 },
  { id:5, title:"Ta pression artérielle ?", subtitle:"Si tu l'as mesurée récemment (optionnel)", field:'pressure', type:'dual', fields:['systolic','diastolic'], placeholders:['120','80'], labels:['Systolique','Diastolique'] },
  { id:6, title:"Antécédents familiaux ?", subtitle:"Des maladies cardiaques dans ta famille ?", field:'familyHistory', type:'options', options:[{value:'none',label:'Aucun'},{value:'parents',label:'Parents'},{value:'siblings',label:'Frères/Sœurs'},{value:'both',label:'Les deux'}] },
  { id:7, title:"Ton niveau d'activité ?", subtitle:"Combien de fois par semaine fais-tu du sport ?", field:'activityLevel', type:'options', options:[{value:'sedentary',label:'Sédentaire',sub:"Peu d'exercice"},{value:'light',label:'Léger',sub:'1-2 fois/sem'},{value:'moderate',label:'Modéré',sub:'3-4 fois/sem'},{value:'active',label:'Très actif',sub:'5+ fois/sem'}] },
  { id:8, title:"Fumes-tu ?", subtitle:"Le tabagisme affecte la santé cardiaque", field:'smoker', type:'options', options:[{value:'no',label:'Non 🙅'},{value:'former',label:'Ancien fumeur'},{value:'occasional',label:'Occasionnel'},{value:'regular',label:'Régulier'}] },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)
  const [data, setData] = useState({})
  const [error, setError] = useState('')
  const step = STEPS[current]
  const progress = ((current+1)/STEPS.length)*100

  const val = (field, value) => setData(d => ({...d,[field]:value}))

  const validate = () => {
    if (step.type==='number') {
      const v = data[step.field]
      if (!v||v<step.min||v>step.max) { setError(`Valeur entre ${step.min} et ${step.max}`); return false }
    } else if (step.type==='options' && !data[step.field]) { setError('Sélectionnez une option'); return false }
    return true
  }

  const next = () => {
    setError('')
    if (!validate()) return
    if (current < STEPS.length-1) { setCurrent(c=>c+1) } else {
      const d = {...data}
      if (d.height&&d.weight) d.bmi = +((d.weight/((d.height/100)**2)).toFixed(1))
      localStorage.setItem('cardiUserHealthData', JSON.stringify(d))
      navigate('/home')
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-background"><div className="blur-circle blur-circle-1"/><div className="blur-circle blur-circle-2"/><div className="blur-circle blur-circle-3"/></div>
      <div className="auth-logo-corner"><svg style={{width:28,height:28}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span className="auth-logo-text">Cardi</span></div>
      <div className="form-wrapper" style={{maxWidth:600}}>
        {/* Progress */}
        <div style={{marginBottom:36}}>
          <div style={{height:8,background:'rgba(139,92,246,.2)',borderRadius:10,overflow:'hidden',marginBottom:10}}>
            <div style={{height:'100%',width:`${progress}%`,background:'linear-gradient(135deg,#ff6b9d,#8b5cf6)',borderRadius:10,transition:'width .5s ease'}}/>
          </div>
          <p style={{textAlign:'center',fontSize:14,fontWeight:700,color:'var(--auth-text-secondary)'}}>
            <span style={{color:'var(--accent-primary)'}}>{current+1}</span> / {STEPS.length}
          </p>
        </div>
        {/* Header */}
        <div style={{textAlign:'center',marginBottom:36}}>
          <div style={{width:80,height:80,margin:'0 auto 16px',background:'linear-gradient(135deg,#ff6b9d,#8b5cf6)',borderRadius:24,display:'flex',alignItems:'center',justifyContent:'center',boxShadow:'0 12px 32px rgba(255,107,157,.3)'}}>
            <svg style={{width:40,height:40,color:'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          </div>
          <h2 style={{fontFamily:'Fredoka,cursive',fontSize:26,fontWeight:700,color:'var(--auth-text-primary)',marginBottom:8}}>{step.title}</h2>
          <p style={{fontSize:14,fontWeight:600,color:'var(--auth-text-secondary)'}}>{step.subtitle}</p>
        </div>
        {/* Content */}
        <div style={{minHeight:240,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center'}}>
          {step.type==='number' && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,width:'100%',maxWidth:280}}>
              <input type="number" value={data[step.field]||''} onChange={e=>val(step.field,parseFloat(e.target.value))} placeholder={step.placeholder} min={step.min} max={step.max}
                style={{width:'100%',padding:'20px 24px',border:'3px solid rgba(139,92,246,.2)',borderRadius:24,background:'var(--input-bg)',fontFamily:'Fredoka,sans-serif',fontSize:48,fontWeight:700,color:'var(--auth-text-primary)',textAlign:'center',outline:'none',transition:'border-color .3s'}}
                onFocus={e=>e.target.style.borderColor='#8b5cf6'} onBlur={e=>e.target.style.borderColor='rgba(139,92,246,.2)'}/>
              <span style={{fontSize:18,fontWeight:700,color:'var(--auth-text-secondary)'}}>{step.unit}</span>
            </div>
          )}
          {step.type==='dual' && (
            <div style={{display:'flex',flexDirection:'column',alignItems:'center',gap:16,width:'100%'}}>
              <div style={{display:'flex',gap:20,width:'100%',justifyContent:'center',flexWrap:'wrap'}}>
                {step.fields.map((f,i) => (
                  <div key={f} style={{display:'flex',flexDirection:'column',alignItems:'center',gap:8,flex:1,minWidth:120}}>
                    <input type="number" value={data[f]||''} onChange={e=>val(f,parseFloat(e.target.value))} placeholder={step.placeholders[i]}
                      style={{width:'100%',padding:16,border:'3px solid rgba(139,92,246,.2)',borderRadius:20,background:'var(--input-bg)',fontFamily:'Fredoka,sans-serif',fontSize:36,fontWeight:700,color:'var(--auth-text-primary)',textAlign:'center',outline:'none'}}
                      onFocus={e=>e.target.style.borderColor='#8b5cf6'} onBlur={e=>e.target.style.borderColor='rgba(139,92,246,.2)'}/>
                    <span style={{fontSize:13,fontWeight:700,color:'var(--auth-text-secondary)'}}>{step.labels[i]}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => { setError(''); setCurrent(c=>c+1) }} style={{padding:'12px 24px',background:'transparent',border:'2px solid rgba(139,92,246,.2)',borderRadius:50,fontFamily:'Nunito,sans-serif',fontSize:13,fontWeight:700,color:'var(--auth-text-secondary)',cursor:'pointer'}}>
                Passer cette étape
              </button>
            </div>
          )}
          {step.type==='options' && (
            <div style={{display:'grid',gridTemplateColumns:`repeat(${step.options.length===3?3:2},1fr)`,gap:12,width:'100%'}}>
              {step.options.map(opt => (
                <button key={opt.value} onClick={() => { val(step.field,opt.value); setError('') }}
                  style={{background:data[step.field]===opt.value?'linear-gradient(135deg,#ff6b9d,#8b5cf6)':'var(--input-bg)',border:`3px solid ${data[step.field]===opt.value?'#ff6b9d':'rgba(139,92,246,.2)'}`,borderRadius:20,padding:'24px 16px',display:'flex',flexDirection:'column',alignItems:'center',gap:8,cursor:'pointer',transition:'all .3s ease'}}>
                  <span style={{fontFamily:'Fredoka,sans-serif',fontSize:16,fontWeight:700,color:data[step.field]===opt.value?'white':'var(--auth-text-primary)',textAlign:'center'}}>{opt.label}</span>
                  {opt.sub&&<span style={{fontSize:12,fontWeight:600,color:data[step.field]===opt.value?'rgba(255,255,255,.85)':'var(--auth-text-secondary)',textAlign:'center'}}>{opt.sub}</span>}
                </button>
              ))}
            </div>
          )}
          {error && <div className="error-message" style={{marginTop:16,width:'100%',maxWidth:400}}>{error}</div>}
        </div>
        {/* Navigation */}
        <div style={{display:'flex',gap:12,marginTop:32}}>
          {current>0&&(
            <button onClick={() => { setError(''); setCurrent(c=>c-1) }} style={{flex:1,padding:'18px 24px',borderRadius:50,fontFamily:'Fredoka,sans-serif',fontSize:15,fontWeight:700,border:'2px solid rgba(139,92,246,.2)',background:'var(--input-bg)',color:'var(--auth-text-primary)',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:8}}>
              <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
              Retour
            </button>
          )}
          <button onClick={next} className="auth-btn" style={{flex:2}}>
            <span>{current===STEPS.length-1?'Commencer':'Suivant'}</span>
            <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </button>
        </div>
      </div>
    </div>
  )
}
