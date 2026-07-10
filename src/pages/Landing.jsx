import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  return (
    <div style={{minHeight:'100vh',background:'linear-gradient(135deg,#f8f4ff 0%,#fef7ff 100%)',overflow:'hidden',position:'relative'}}>
      <div className="auth-background">
        <div className="blur-circle blur-circle-1"/>
        <div className="blur-circle blur-circle-2"/>
        <div className="blur-circle blur-circle-3"/>
      </div>
      <div className="auth-logo-corner">
        <svg style={{width:28,height:28}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        <span className="auth-logo-text">Cardi</span>
      </div>
      <div style={{position:'relative',zIndex:1,minHeight:'100vh',maxWidth:1400,margin:'0 auto',padding:'60px 40px 40px',display:'flex',flexDirection:'column',justifyContent:'center',alignItems:'center'}}>
        <main style={{display:'flex',alignItems:'center',justifyContent:'center',gap:60,width:'100%',animation:'fadeInUp .8s ease-out',flexWrap:'wrap'}}>
          {/* Hero */}
          <div style={{flex:1,maxWidth:500,textAlign:'left',minWidth:280}}>
            <div style={{marginBottom:24}}>
              <svg style={{width:90,height:90,color:'#ff6b9d',filter:'drop-shadow(0 0 20px #ff6b9d)',animation:'heartbeat 2s ease-in-out infinite'}} viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h1 style={{fontFamily:'Fredoka,cursive',fontSize:'clamp(32px,5vw,52px)',fontWeight:700,marginBottom:16,lineHeight:1.1,color:'#2d1b4e',textTransform:'uppercase'}}>
              TON CŒUR,<br/>NOTRE PRIORITÉ
            </h1>
            <p style={{fontSize:17,fontWeight:600,color:'#7c6b95',lineHeight:1.6,marginBottom:36}}>
              Prédiction intelligente des maladies cardiaques assistée par IA
            </p>
            <div style={{display:'flex',flexDirection:'column',gap:14,maxWidth:360}}>
              <button className="auth-btn" onClick={() => navigate('/inscription')}>
                <span>CRÉER UN COMPTE</span>
                <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
              <button onClick={() => navigate('/connexion')} style={{background:'transparent',border:'2px solid rgba(139,92,246,.2)',borderRadius:50,padding:'18px 32px',fontFamily:'Fredoka,sans-serif',fontSize:15,fontWeight:700,color:'#2d1b4e',cursor:'pointer',transition:'all .3s ease',textTransform:'uppercase'}}
                onMouseOver={e => e.currentTarget.style.background='rgba(255,255,255,.5)'}
                onMouseOut={e => e.currentTarget.style.background='transparent'}
              >SE CONNECTER</button>
            </div>
          </div>
          {/* Feature cards */}
          <div style={{flex:1,display:'flex',flexDirection:'column',gap:16,maxWidth:400,minWidth:280}}>
            {[
              {path:<polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>,title:'ANALYSE IA',text:'Prédictions précises basées sur tes données biométriques'},
              {path:<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>,title:'SÉCURISÉ',text:'Tes données médicales protégées avec chiffrement'},
              {path:<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>,title:'RAPIDE',text:'Résultats et recommandations instantanés'},
            ].map((f, i) => (
              <div key={i} style={{background:'rgba(255,255,255,.45)',backdropFilter:'blur(20px)',border:'2px solid rgba(139,92,246,.2)',borderRadius:24,padding:24,display:'flex',alignItems:'center',gap:20,transition:'all .3s ease',cursor:'default'}}
                onMouseOver={e => { e.currentTarget.style.transform='translateX(10px)'; e.currentTarget.style.borderColor='#8b5cf6' }}
                onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.borderColor='rgba(139,92,246,.2)' }}
              >
                <div style={{width:56,height:56,minWidth:56,display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#ff6b9d,#8b5cf6)',borderRadius:16,padding:12}}>
                  <svg style={{width:32,height:32,color:'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{f.path}</svg>
                </div>
                <div>
                  <h3 style={{fontFamily:'Fredoka,sans-serif',fontSize:16,fontWeight:700,marginBottom:4,color:'#2d1b4e'}}>{f.title}</h3>
                  <p style={{fontSize:13,fontWeight:600,color:'#7c6b95',lineHeight:1.5}}>{f.text}</p>
                </div>
              </div>
            ))}
          </div>
        </main>
        <footer style={{marginTop:50,textAlign:'center'}}>
          <p style={{fontSize:13,fontWeight:600,color:'#7c6b95'}}>
            En continuant, tu acceptes nos <a href="#" style={{color:'#ff6b9d',fontWeight:700}}>Conditions</a> et notre <a href="#" style={{color:'#ff6b9d',fontWeight:700}}>Politique de confidentialité</a>
          </p>
        </footer>
      </div>
    </div>
  )
}
