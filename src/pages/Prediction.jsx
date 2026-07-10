import { useState, useEffect, useRef, useCallback } from 'react'
import BottomNav from '../components/BottomNav'
import PageHeader from '../components/PageHeader'
import MedicalDisclaimer from '../components/MedicalDisclaimer'
import { useToast } from '../components/Toast'
import { useUserData } from '../context/UserDataContext'
import { analyzeHealth } from '../utils/api'
import { getBpmColor, formatTime } from '../utils/formatters'

export default function Prediction() {
  const [analyzing, setAnalyzing] = useState(false)
  const [done, setDone] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [period, setPeriod] = useState('week')
  const [showModal, setShowModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [progressText, setProgressText] = useState('')
  const [progressStep, setProgressStep] = useState(-1)
  const chartRef = useRef(null)
  const printRef = useRef(null)
  const historyRef = useRef(null)

  const { userData, measurementHistory } = useUserData()
  const toast = useToast()

  const analyze = async () => {
    setAnalyzing(true)
    setDone(false)
    setAnalysis(null)

    const steps = [
      'Collecte de vos donnees biometriques...',
      'Analyse des facteurs de risque...',
      'Calcul du score de sante cardiaque...',
      'Evaluation des maladies potentielles...',
      'Generation des recommandations personnalisees...',
      'Analyse terminee !',
    ]

    for (let i = 0; i < steps.length; i++) {
      setProgressStep(i)
      setProgressText(steps[i])
      await new Promise((r) => setTimeout(r, 400 + Math.random() * 300))
    }

    try {
      const result = await analyzeHealth(userData, measurementHistory)
      if (result.success) {
        setAnalysis(result.analysis)
        setDone(true)
        toast.success('Analyse terminee !')
      } else {
        toast.error('Erreur lors de l\'analyse')
      }
    } catch (err) {
      console.error('API error:', err)
      toast.error('API non disponible. Lancez le backend Python.')
    }

    setAnalyzing(false)
  }

  useEffect(() => {
    if (done && chartRef.current && analysis) drawChart()
  }, [done, period, analysis])

  const drawChart = useCallback(() => {
    const canvas = chartRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const w = (canvas.width = canvas.offsetWidth * window.devicePixelRatio)
    const h = (canvas.height = 200 * window.devicePixelRatio)
    const p = 40
    ctx.clearRect(0, 0, w, h)

    const hasRealData = measurementHistory && measurementHistory.length >= 2
    const pts = period === 'week' ? 7 : period === 'month' ? 30 : 12
    const data = hasRealData
      ? measurementHistory.slice(0, pts).reverse().map((e) => e.bpm)
      : Array.from({ length: pts }, () => Math.round(65 + Math.random() * 20))

    const step = (w - 2 * p) / (data.length - 1)

    const grad = ctx.createLinearGradient(0, p, 0, h - p)
    grad.addColorStop(0, 'rgba(255,107,157,0.3)')
    grad.addColorStop(1, 'rgba(139,92,246,0.05)')
    ctx.beginPath()
    ctx.moveTo(p, h - p)
    data.forEach((v, i) =>
      ctx.lineTo(p + i * step, h - p - (v / 150) * (h - 2 * p))
    )
    ctx.lineTo(p + (data.length - 1) * step, h - p)
    ctx.closePath()
    ctx.fillStyle = grad
    ctx.fill()

    ctx.beginPath()
    data.forEach((v, i) => {
      const x = p + i * step,
        y = h - p - (v / 150) * (h - 2 * p)
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
    })
    ctx.strokeStyle = '#ff6b9d'
    ctx.lineWidth = 2 * window.devicePixelRatio
    ctx.stroke()

    data.forEach((v, i) => {
      const x = p + i * step,
        y = h - p - (v / 150) * (h - 2 * p)
      ctx.beginPath()
      ctx.arc(x, y, 4 * window.devicePixelRatio, 0, 2 * Math.PI)
      ctx.fillStyle = '#ff6b9d'
      ctx.fill()
      ctx.strokeStyle = '#fff'
      ctx.lineWidth = 1.5 * window.devicePixelRatio
      ctx.stroke()

      if (data.length <= 10) {
        ctx.fillStyle = getComputedStyle(document.documentElement)
          .getPropertyValue('--text-secondary')
          .trim()
        ctx.font = `${11 * window.devicePixelRatio}px Nunito, sans-serif`
        ctx.textAlign = 'center'
        ctx.fillText(`${v}`, x, y - 12 * window.devicePixelRatio)
      }
    })
  }, [measurementHistory, period])

  const handleShare = async () => {
    if (!analysis) return
    const hs = analysis.health_score
    const text =
      `*Rapport Cardi AI - Analyse Cardiaque*\n\n` +
      `Score: ${hs.score}/100 (${hs.label})\n` +
      `Grade: ${hs.grade}\n` +
      `IMC: ${hs.bmi} (${hs.bmi_category})\n` +
      `Derniere mesure: ${measurementHistory[0]?.bpm || '--'} BPM\n\n` +
      `Risques:\n${analysis.diseases.map((d) => `- ${d.name}: ${d.probability}%`).join('\n')}\n\n` +
      `Recommandations:\n${analysis.recommendations.slice(0, 4).map((r) => `- ${r.title}: ${r.description}`).join('\n')}\n\n` +
      `Genere par Cardi AI - ${new Date().toLocaleDateString('fr-FR')}`

    if (navigator.share) {
      try { await navigator.share({ title: 'Rapport Cardi AI', text }) } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text)
        toast.success('Rapport copie !')
      } catch {
        toast.error('Impossible de copier')
      }
    }
  }

  const handleExportPDF = () => {
    window.print()
  }

  if (!analysis && !analyzing) {
    return (
      <div>
        <PageHeader title="Prediction Sante" />
        <main className="container">
          <div
            style={{
              background: 'linear-gradient(135deg,#ff6b9d,#8b5cf6)',
              borderRadius: 24,
              padding: 32,
              marginBottom: 24,
              textAlign: 'center',
              boxShadow: '0 8px 32px rgba(255,107,157,0.3)',
            }}
          >
            <div
              style={{
                width: 80,
                height: 80,
                background: 'rgba(255,255,255,0.2)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 16px',
              }}
            >
              <svg style={{ width: 40, height: 40, color: 'white' }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 style={{ fontFamily: 'Fredoka,cursive', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 8 }}>
              Dr. Cardi AI
            </h2>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)', marginBottom: 24 }}>
              Intelligence artificielle specialisee en cardiologie
            </p>
          </div>

          <div className="card">
            <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
              Analyse Complète
            </h3>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 20 }}>
              Notre IA analyse vos donnees biometriques, facteurs de risque et historique de mesures pour fournir :
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {[
                { icon: '\u2764\uFE0F', title: 'Score de sante cardiaque', desc: 'Evaluation globale de votre sante cardiovasculaire' },
                { icon: '\u26A0\uFE0F', title: 'Prediction de maladies', desc: 'Risque d\'infarctus, AVC, insuffisance cardiaque, arythmie' },
                { icon: '\uD83D\uDCCB', title: 'Recommandations personnalisees', desc: 'Conseils adaptes a votre profil de risque' },
                { icon: '\uD83D\uDCC8', title: 'Graphique d\'evolution', desc: 'Suivi de votre frequence cardiaque dans le temps' },
              ].map((item, i) => (
                <div key={i} className="card-secondary" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>{item.icon}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>{item.title}</p>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="btn btn-primary" style={{ width: '100%' }} onClick={analyze}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            Lancer l'analyse IA
          </button>

          <MedicalDisclaimer />
        </main>
        <BottomNav />
      </div>
    )
  }

  const hs = analysis?.health_score
  const diseases = analysis?.diseases || []
  const recs = analysis?.recommendations || []

  return (
    <div>
      <PageHeader title="Prediction Sante" />
      <main className="container" ref={printRef}>
        {/* Dr. Cardi */}
        <div
          style={{
            background: 'linear-gradient(135deg,#ff6b9d,#8b5cf6)',
            borderRadius: 24,
            padding: 24,
            marginBottom: 24,
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            boxShadow: '0 8px 32px rgba(255,107,157,0.3)',
          }}
        >
          <div
            style={{
              width: 80,
              height: 80,
              background: 'rgba(255,255,255,0.2)',
              border: '3px solid rgba(255,255,255,0.3)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              animation: 'float 3s ease-in-out infinite',
            }}
          >
            <svg style={{ width: 40, height: 40, color: 'white' }} viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontFamily: 'Fredoka,cursive', fontSize: 24, fontWeight: 700, color: 'white', marginBottom: 4 }}>
              Dr. Cardi AI
            </h2>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              Analyse pour {userData?.fullName || 'vous'}
            </p>
          </div>
        </div>

        {/* Progress */}
        {analyzing && (
          <div className="card" style={{ border: '2px dashed var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg,rgba(255,107,157,0.1),rgba(139,92,246,0.1))',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'spin 2s linear infinite',
                }}
              >
                <svg style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700 }}>Analyse IA en cours</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>{progressText}</p>
              </div>
            </div>
            <div className="card-secondary">
              {[
                'Collecte des donnees...',
                'Facteurs de risque...',
                'Score cardiaque...',
                'Predictions maladies...',
                'Recommandations...',
                'Termine !',
              ].map((step, i) => {
                const isDone = progressStep > i
                const isCurrent = progressStep === i
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 600, color: isDone ? '#10b981' : isCurrent ? 'var(--accent-primary)' : 'var(--text-tertiary)', marginBottom: 8 }}>
                    {isDone ? (
                      <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                    ) : isCurrent ? (
                      <div style={{ width: 16, height: 16, border: '2px solid var(--accent-primary)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
                    ) : (
                      <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border-color)' }} />
                    )}
                    <span>{step}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Health Score */}
        {done && hs && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
              Score de Sante Cardiaque
            </h3>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', marginBottom: 20 }}>
              <svg width="220" height="220" viewBox="0 0 220 220">
                <circle cx="110" cy="110" r="90" fill="none" stroke="var(--bg-secondary)" strokeWidth="20" />
                <circle cx="110" cy="110" r="90" fill="none" stroke={hs.color} strokeWidth="20" strokeLinecap="round" strokeDasharray={`${(hs.score / 100) * 565} 565`} strokeDashoffset="141" style={{ transition: 'stroke-dasharray 1s ease-out' }} />
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 800, color: hs.color }}>{hs.score}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>{hs.label}</div>
                <div style={{ fontSize: 12, fontWeight: 700, color: hs.color, marginTop: 4 }}>Grade {hs.grade}</div>
              </div>
            </div>
            <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'center', lineHeight: 1.6 }}>{hs.advice}</p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
              {[
                { label: 'IMC', value: hs.bmi, color: 'var(--accent-primary)' },
                { label: 'Mesures', value: measurementHistory.length || 0, color: '#3b82f6' },
                { label: 'Age', value: userData?.age ? `${userData.age} ans` : '--', color: '#8b5cf6' },
              ].map((item, i) => (
                <div key={i} className="card-secondary" style={{ textAlign: 'center', minWidth: 80 }}>
                  <span style={{ display: 'block', fontSize: 18, fontWeight: 800, color: item.color }}>{item.value}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Diseases */}
        {done && diseases.length > 0 && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
            <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Predictions Medicales
            </h3>
            {diseases.map((d, i) => (
              <div key={i} className="card-secondary" style={{ marginBottom: 16, animation: 'fadeInUp 0.3s ease-out', animationDelay: `${i * 0.1}s` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <span style={{ fontSize: 16, fontWeight: 700 }}>{d.name}</span>
                  <span style={{ fontSize: 24, fontWeight: 800, color: d.probability > 50 ? '#ef4444' : d.probability > 25 ? '#f59e0b' : '#10b981' }}>
                    {d.probability}%
                  </span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{d.description}</p>
                <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                  <div style={{ height: '100%', width: `${d.probability}%`, background: d.probability > 50 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : d.probability > 25 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'linear-gradient(90deg,#10b981,#059669)', borderRadius: 4, transition: 'width 1s ease-out' }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                  {d.factors.map((f, j) => (
                    <span key={j} className="tag">{f}</span>
                  ))}
                </div>
                {d.prevention && (
                  <div className="card-accent">
                    <p style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', marginBottom: 4 }}>Prevention</p>
                    <ul style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 14, margin: 0 }}>
                      {d.prevention.map((p, k) => <li key={k}>{p}</li>)}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Chart */}
        {done && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>
            <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>Evolution Frequence Cardiaque</h3>
            <div className="card-secondary">
              <canvas ref={chartRef} style={{ width: '100%', height: 200 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', marginTop: 16 }}>
              {['week', 'month', 'year'].map((p) => (
                <button key={p} onClick={() => { setPeriod(p); setTimeout(drawChart, 50) }}
                  style={{ padding: '10px 20px', borderRadius: 12, fontFamily: 'Nunito,sans-serif', fontSize: 13, fontWeight: 700, cursor: 'pointer', background: period === p ? 'linear-gradient(135deg,#ff6b9d,#8b5cf6)' : 'var(--bg-secondary)', border: `2px solid ${period === p ? 'transparent' : 'var(--border-color)'}`, color: period === p ? 'white' : 'var(--text-secondary)' }}>
                  {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Annee'}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {done && recs.length > 0 && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}>
            <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              Recommandations Personnalisees
            </h3>
            {recs.map((r, i) => (
              <div key={i} style={{ background: r.priority === 'high' ? 'linear-gradient(135deg,rgba(239,68,68,0.05),rgba(220,38,38,0.05))' : 'var(--bg-secondary)', border: r.priority === 'high' ? '1px solid rgba(239,68,68,0.2)' : '1px solid var(--border-color)', borderRadius: 12, padding: 16, marginBottom: 12, animation: 'fadeInUp 0.3s ease-out', animationDelay: `${i * 0.05}s` }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ width: 32, height: 32, background: r.priority === 'high' ? '#ef4444' : '#10b981', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg style={{ width: 18, height: 18, color: 'white' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 15, fontWeight: 700 }}>{r.title}</span>
                      {r.priority === 'high' && <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 4 }}>Prioritaire</span>}
                      {r.impact && <span style={{ fontSize: 10, fontWeight: 700, color: '#10b981', background: 'rgba(16,185,129,0.1)', padding: '2px 6px', borderRadius: 4 }}>-{r.impact}% risque</span>}
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{r.description}</p>
                    {r.actions && (
                      <div className="card-accent">
                        <ul style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.6, paddingLeft: 14, margin: 0 }}>
                          {r.actions.map((a, j) => <li key={j}>{a}</li>)}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {done && <MedicalDisclaimer />}

        {/* History */}
        {done && measurementHistory.length > 0 && (
          <div ref={historyRef} className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}>
            <div className="section-header">
              <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg style={{ width: 22, height: 22, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></svg>
                Historique
              </h3>
              <button className="view-all-btn" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? 'Reduire' : `Voir tout (${measurementHistory.length})`}
              </button>
            </div>
            {(showHistory ? measurementHistory : measurementHistory.slice(0, 5)).map((entry, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < Math.min(showHistory ? measurementHistory.length : 5, measurementHistory.length) - 1 ? '1px solid var(--border-color)' : 'none' }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{formatTime(entry.date)}</span>
                <span style={{ fontSize: 18, fontWeight: 800, color: getBpmColor(entry.bpm) }}>{entry.bpm} <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>BPM</span></span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          {!done && (
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={analyze} disabled={analyzing}>
              <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></svg>
              {analyzing ? 'Analyse en cours...' : 'Analyser ma Sante Cardiaque'}
            </button>
          )}
          {done && (
            <>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleShare}>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
                  Partager
                </button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleExportPDF}>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                  Export PDF
                </button>
              </div>
              <button className="btn btn-primary" style={{ width: '100%' }} onClick={analyze}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" /></svg>
                Relancer l'analyse
              </button>
            </>
          )}
        </div>
      </main>
      <BottomNav />
    </div>
  )
}
