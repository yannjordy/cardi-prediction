import { useLocation, useNavigate } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

const riskColors = { high: '#ef4444', medium: '#f59e0b', low: '#8b5cf6', info: '#3b82f6' }
const riskLabels = { high: 'Eleve', medium: 'Moyen', low: 'Faible', info: 'Info' }

function ArticleDetail({ data }) {
  return (
    <div>
      <div style={{background: data.bg, borderRadius: 24, padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'}}>
        <div style={{position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: '50%'}}/>
        <div style={{position: 'relative', zIndex: 1, textAlign: 'center'}}>
          <div style={{width: 72, height: 72, background: 'rgba(255,255,255,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
            <svg style={{width: 36, height: 36, color: 'white'}} viewBox="0 0 24 24" fill="currentColor"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </div>
          <h1 style={{fontFamily: 'Fredoka,cursive', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8}}>{data.title}</h1>
          <p style={{fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)'}}>{data.count} perspectives</p>
        </div>
      </div>

      {data.image && (
        <div style={{borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 16px var(--shadow)'}}>
          <img src={data.image} alt={data.title} style={{width: '100%', height: 220, objectFit: 'cover', display: 'block'}}/>
        </div>
      )}

      {data.youtube && (
        <div style={{background: 'var(--bg-card)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 16px var(--shadow)'}}>
          <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8}}>
            <svg style={{width: 22, height: 22, color: '#ef4444'}} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            Voir la video explicative
          </h3>
          <div style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12}}>
            <iframe src={data.youtube} title="Video YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
              style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 12}}/>
          </div>
        </div>
      )}

      {data.tips && (
        <div style={{background: 'var(--bg-card)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 16px var(--shadow)'}}>
          <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8}}>
            <svg style={{width: 22, height: 22, color: 'var(--accent-primary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            Zones de frequence cardiaque
          </h3>
          <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12}}>
            {data.tips.map((t, i) => (
              <div key={i} style={{background: 'var(--bg-secondary)', borderRadius: 16, padding: 16, textAlign: 'center', border: '1px solid var(--border-color)'}}>
                <div style={{width: 40, height: 40, background: 'linear-gradient(135deg,rgba(255,107,157,0.1),rgba(139,92,246,0.1))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px'}}>
                  <svg style={{width: 20, height: 20, color: 'var(--accent-primary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                </div>
                <div style={{fontSize: 20, fontWeight: 800, color: 'var(--accent-primary)', marginBottom: 4}}>{t.value}</div>
                <div style={{fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)'}}>{t.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{background: 'linear-gradient(135deg,rgba(139,92,246,0.05),rgba(99,102,241,0.05))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 20, padding: 24, marginBottom: 24}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
          <div style={{width: 36, height: 36, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg style={{width: 18, height: 18, color: 'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </div>
          <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 16, fontWeight: 700}}>Conseil Dr. Cardi</h3>
        </div>
        <p style={{fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.7}}>{data.advice}</p>
      </div>

      <div style={{background: 'var(--bg-card)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 16px var(--shadow)'}}>
        <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8}}>
          <svg style={{width: 22, height: 22, color: 'var(--accent-primary)'}} viewBox="0 0 24 24" fill="fill" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          Points cles a retenir
        </h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: 10}}>
          {data.content.map((c, i) => (
            <div key={i} style={{display: 'flex', gap: 12, background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, border: '1px solid var(--border-color)', animation: 'fadeInUp 0.3s ease-out', animationDelay: i * 0.05 + 's'}}>
              <div style={{width: 28, height: 28, minWidth: 28, background: 'linear-gradient(135deg,#ff6b9d,#8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: 'white'}}>{i + 1}</div>
              <p style={{fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: 3}}>{c}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function SleepDetail({ data }) {
  return (
    <div>
      <div style={{background: data.bg, borderRadius: 24, padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'}}>
        <div style={{position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: '50%'}}/>
        <div style={{position: 'relative', zIndex: 1, textAlign: 'center'}}>
          <div style={{width: 72, height: 72, background: 'rgba(255,255,255,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
            <svg style={{width: 36, height: 36, color: 'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
          </div>
          <span style={{display: 'inline-block', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)', padding: '4px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, color: 'white', marginBottom: 12}}>{data.badge}</span>
          <h1 style={{fontFamily: 'Fredoka,cursive', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8}}>{data.name}</h1>
          <p style={{fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)'}}>Duree : {data.duration}</p>
        </div>
      </div>

      {data.image && (
        <div style={{borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 16px var(--shadow)'}}>
          <img src={data.image} alt={data.name} style={{width: '100%', height: 220, objectFit: 'cover', display: 'block'}}/>
        </div>
      )}

      {data.youtube && (
        <div style={{background: 'var(--bg-card)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 16px var(--shadow)'}}>
          <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8}}>
            <svg style={{width: 22, height: 22, color: '#ef4444'}} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            Video guide
          </h3>
          <div style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12}}>
            <iframe src={data.youtube} title="Video YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
              style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 12}}/>
          </div>
        </div>
      )}

      <div style={{background: 'var(--bg-card)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 16px var(--shadow)'}}>
        <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8}}>
          <svg style={{width: 22, height: 22, color: 'var(--accent-primary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
          Description
        </h3>
        <p style={{fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.8}}>{data.content}</p>
      </div>

      <div style={{background: 'linear-gradient(135deg,rgba(139,92,246,0.05),rgba(99,102,241,0.05))', border: '1px solid rgba(139,92,246,0.2)', borderRadius: 20, padding: 24, marginBottom: 24}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
          <div style={{width: 36, height: 36, background: 'linear-gradient(135deg,#8b5cf6,#6366f1)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg style={{width: 18, height: 18, color: 'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
          </div>
          <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 16, fontWeight: 700}}>Technique</h3>
        </div>
        <p style={{fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.7}}>{data.technique}</p>
      </div>

      <button
        onClick={() => {
          const toast = document.createElement('div')
          toast.className = 'toast'
          toast.style.background = data.bg
          toast.textContent = 'Exercice lanced ! Suivez la technique pendant ' + data.duration
          document.body.appendChild(toast)
          setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300) }, 3500)
        }}
        style={{width: '100%', padding: 18, border: 'none', borderRadius: 16, background: data.bg, color: 'white', fontFamily: 'Fredoka,sans-serif', fontSize: 16, fontWeight: 700, cursor: 'pointer', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', transition: 'all 0.3s ease'}}
        onMouseOver={e => e.currentTarget.style.transform = 'translateY(-2px)'}
        onMouseOut={e => e.currentTarget.style.transform = ''}
      >
        <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8}}>
          <svg style={{width: 20, height: 20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Commencer ({data.duration})
        </span>
      </button>
    </div>
  )
}

function RecipeDetail({ data }) {
  return (
    <div>
      <div style={{background: data.bg, borderRadius: 24, padding: 32, marginBottom: 24, position: 'relative', overflow: 'hidden', boxShadow: '0 8px 32px rgba(0,0,0,0.15)'}}>
        <div style={{position: 'absolute', top: -40, right: -40, width: 160, height: 160, background: 'rgba(255,255,255,0.05)', borderRadius: '50%'}}/>
        <div style={{position: 'relative', zIndex: 1, textAlign: 'center'}}>
          <div style={{width: 72, height: 72, background: 'rgba(255,255,255,0.2)', borderRadius: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px'}}>
            <svg style={{width: 36, height: 36, color: 'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          </div>
          <h1 style={{fontFamily: 'Fredoka,cursive', fontSize: 28, fontWeight: 700, color: 'white', marginBottom: 8}}>{data.name}</h1>
          <div style={{display: 'flex', gap: 20, justifyContent: 'center'}}>
            <span style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)'}}>
              <svg style={{width: 18, height: 18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              {data.time}
            </span>
            <span style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.85)'}}>
              <svg style={{width: 18, height: 18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              {data.tag}
            </span>
          </div>
        </div>
      </div>

      {data.image && (
        <div style={{borderRadius: 20, overflow: 'hidden', marginBottom: 24, boxShadow: '0 4px 16px var(--shadow)'}}>
          <img src={data.image} alt={data.name} style={{width: '100%', height: 220, objectFit: 'cover', display: 'block'}}/>
        </div>
      )}

      {data.youtube && (
        <div style={{background: 'var(--bg-card)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 16px var(--shadow)'}}>
          <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8}}>
            <svg style={{width: 22, height: 22, color: '#ef4444'}} viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
            Video recette
          </h3>
          <div style={{position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12}}>
            <iframe src={data.youtube} title="Video YouTube" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen
              style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none', borderRadius: 12}}/>
          </div>
        </div>
      )}

      <div style={{background: 'linear-gradient(135deg,rgba(16,185,129,0.05),rgba(5,150,105,0.05))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 20, padding: 24, marginBottom: 24}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12}}>
          <div style={{width: 36, height: 36, background: '#10b981', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <svg style={{width: 18, height: 18, color: 'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
          </div>
          <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 16, fontWeight: 700}}>Bienfaits pour le coeur</h3>
        </div>
        <p style={{fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.7}}>{data.benefits}</p>
      </div>

      <div style={{background: 'var(--bg-card)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 16px var(--shadow)'}}>
        <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8}}>
          <svg style={{width: 22, height: 22, color: 'var(--accent-primary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>
          Ingredients
        </h3>
        <div style={{display: 'flex', flexWrap: 'wrap', gap: 8}}>
          {data.ingredients.map((ing, i) => (
            <span key={i} style={{padding: '8px 14px', background: 'var(--bg-secondary)', borderRadius: 10, fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: 6}}>
              <svg style={{width: 14, height: 14, color: 'var(--accent-primary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
              {ing}
            </span>
          ))}
        </div>
      </div>

      <div style={{background: 'var(--bg-card)', borderRadius: 20, padding: 24, marginBottom: 24, border: '1px solid var(--border-color)', boxShadow: '0 4px 16px var(--shadow)'}}>
        <h3 style={{fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8}}>
          <svg style={{width: 22, height: 22, color: 'var(--accent-primary)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          Preparation
        </h3>
        <div style={{display: 'flex', flexDirection: 'column', gap: 12}}>
          {data.steps.map((step, i) => (
            <div key={i} style={{display: 'flex', gap: 14, background: 'var(--bg-secondary)', borderRadius: 12, padding: 14, border: '1px solid var(--border-color)', animation: 'fadeInUp 0.3s ease-out', animationDelay: i * 0.1 + 's'}}>
              <div style={{width: 32, height: 32, minWidth: 32, background: 'linear-gradient(135deg,#ff6b9d,#8b5cf6)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 800, color: 'white'}}>{i + 1}</div>
              <p style={{fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.6, paddingTop: 4}}>{step}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function DetailPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const state = location.state

  if (!state || !state.type || !state.data) {
    return (
      <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', padding: 40, textAlign: 'center'}}>
        <svg style={{width: 64, height: 64, color: 'var(--text-tertiary)', marginBottom: 16}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <h2 style={{fontFamily: 'Fredoka,cursive', fontSize: 22, fontWeight: 700, marginBottom: 8}}>Page non disponible</h2>
        <p style={{fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 24}}>Aucune donnee trouvee pour cette page.</p>
        <button onClick={() => navigate('/activite')} className="btn btn-primary" style={{padding: '14px 32px'}}>Retour a l'activite</button>
      </div>
    )
  }

  const { type, data } = state
  const titles = { article: data.title, sleep: data.name, recipe: data.name }
  const icons = {
    article: <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>,
    sleep: <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>,
      recipe: <><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></>,
  }

  return (
    <div style={{background: 'var(--bg-primary)', minHeight: '100vh'}}>
      <header className="header" style={{background: 'rgba(26,31,46,0.9)'}}>
        <div className="header-content">
          <button className="back-btn" onClick={() => navigate('/activite')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
          </button>
          <div className="header-logo">
            <svg style={{width:28,height:28}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <h1 className="header-title">{titles[type] || 'Detail'}</h1>
          </div>
          <ThemeToggle/>
        </div>
      </header>

      <main className="container" style={{paddingBottom: 40}}>
        {type === 'article' && <ArticleDetail data={data}/>}
        {type === 'sleep' && <SleepDetail data={data}/>}
        {type === 'recipe' && <RecipeDetail data={data}/>}
      </main>
    </div>
  )
}
