import { useState, useEffect, useRef, useCallback } from 'react'
import BottomNav from '../components/BottomNav'
import PageHeader from '../components/PageHeader'
import MedicalDisclaimer from '../components/MedicalDisclaimer'
import { useToast } from '../components/Toast'
import { useUserData } from '../context/UserDataContext'
import {
  detectAnomalies,
  generateRecommendations,
  generateHealthScore,
  predictDiseases,
} from '../utils/healthAnalysis'
import { getBpmColor, formatTime } from '../utils/formatters'

export default function Prediction() {
  const [analyzing, setAnalyzing] = useState(false)
  const [done, setDone] = useState(false)
  const [score, setScore] = useState(0)
  const [scoreLabel, setScoreLabel] = useState('')
  const [scoreColor, setScoreColor] = useState('#8b5cf6')
  const [risks, setRisks] = useState([])
  const [predictions, setPredictions] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [period, setPeriod] = useState('week')
  const [showModal, setShowModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [progressText, setProgressText] = useState('')
  const chartRef = useRef(null)
  const printRef = useRef(null)
  const historyRef = useRef(null)

  const { userData, measurementHistory } = useUserData()
  const toast = useToast()

  const analyze = async () => {
    setAnalyzing(true)
    setDone(false)

    const steps = [
      'Analyse de vos donnees biometriques...',
      'Calcul du score de sante cardiaque...',
      'Detection des facteurs de risque...',
      'Generation des predictions personnalisees...',
      'Creation des recommandations...',
      'Analyse terminee !',
    ]

    for (let i = 0; i < steps.length; i++) {
      setProgressText(steps[i])
      await new Promise((r) => setTimeout(r, 300 + Math.random() * 200))
    }

    const healthResult = generateHealthScore(userData, measurementHistory)
    setScore(healthResult.score)
    setScoreLabel(healthResult.label)
    setScoreColor(healthResult.color)

    const insights = detectAnomalies(measurementHistory, userData)
    const riskItems = insights.filter((i) => i.type === 'risk' || i.type === 'anomaly')
    setRisks(
      riskItems.map((i) => ({
        type: i.severity,
        title: i.title,
        description: i.message,
        tip: i.tip,
      }))
    )

    const predictionList = predictDiseases(userData, measurementHistory, healthResult)
    setPredictions(predictionList)

    const recs = generateRecommendations(userData, measurementHistory)
    setRecommendations(recs)

    setAnalyzing(false)
    setDone(true)
  }

  useEffect(() => {
    if (done && chartRef.current) drawChart()
  }, [done, period])

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

  const riskColors = {
    high: '#ef4444',
    medium: '#f59e0b',
    low: '#8b5cf6',
    info: '#3b82f6',
    warning: '#f59e0b',
  }
  const riskLabels = {
    high: 'Eleve',
    medium: 'Moyen',
    low: 'Faible',
    info: 'Info',
    warning: 'Attention',
  }

  const handleShare = async () => {
    const text =
      `*Rapport Cardi - Analyse Cardiaque*\n\n` +
      `Score de Sante: ${score}/100 (${scoreLabel})\n` +
      `Derniere mesure: ${measurementHistory[0]?.bpm || '--'} BPM\n` +
      `Nombre de mesures: ${measurementHistory.length}\n` +
      `Risques detectes: ${risks.map((r) => r.title).join(', ') || 'Aucun risque majeur'}\n\n` +
      `Recommandations:\n${recommendations.map((r) => `- ${r.title}: ${r.description}`).join('\n')}\n\n` +
      `Genere par Cardi - ${new Date().toLocaleDateString('fr-FR')}`

    if (navigator.share) {
      try {
        await navigator.share({ title: 'Rapport Cardi - Sante Cardiaque', text })
      } catch {}
    } else {
      try {
        await navigator.clipboard.writeText(text)
        toast.success('Rapport copie dans le presse-papiers !')
      } catch {
        toast.error('Impossible de copier le rapport')
      }
    }
  }

  const handleExportPDF = () => {
    setExporting(true)
    setTimeout(() => {
      setExporting(false)
      window.print()
    }, 300)
  }

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
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(255,107,157,0.3)',
          }}
        >
          <div style={{ position: 'relative', zIndex: 1 }}>
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
              <svg
                style={{ width: 40, height: 40, color: 'white' }}
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>
          <div style={{ flex: 1, position: 'relative', zIndex: 1 }}>
            <h2
              style={{
                fontFamily: 'Fredoka,cursive',
                fontSize: 24,
                fontWeight: 700,
                color: 'white',
                marginBottom: 4,
              }}
            >
              Dr. Cardi
            </h2>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
              {userData
                ? `Analyse pour ${userData.fullName || 'vous'}`
                : 'Specialiste en sante cardiaque'}
            </p>
            {analyzing && (
              <div style={{ display: 'flex', gap: 4, marginTop: 8 }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      background: 'white',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'typing 1.4s infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {analyzing && (
          <div className="card" style={{ border: '2px dashed var(--border-color)', animation: 'fadeInUp 0.5s ease-out' }}>
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
                <svg
                  style={{ width: 24, height: 24, color: 'var(--accent-primary)' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" />
                </svg>
              </div>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700 }}>Analyse IA en cours</p>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>
                  {progressText}
                </p>
              </div>
            </div>
            <div className="card-secondary">
              {[
                'Lecture des donnees biometriques...',
                'Calcul du score cardiaque...',
                'Analyse des risques...',
                'Predictions medicales...',
              ].map((step, i) => {
                const idx = [
                  'Analyse de vos donnees biometriques...',
                  'Calcul du score de sante cardiaque...',
                  'Detection des facteurs de risque...',
                  'Generation des predictions personnalisees...',
                  'Creation des recommandations...',
                  'Analyse terminee !',
                ].indexOf(progressText)
                const isDone = idx > i
                const isCurrent = idx === i
                return (
                  <div
                    key={i}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      fontSize: 12,
                      fontWeight: 600,
                      color: isDone
                        ? '#10b981'
                        : isCurrent
                          ? 'var(--accent-primary)'
                          : 'var(--text-tertiary)',
                    }}
                  >
                    {isDone ? (
                      <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : isCurrent ? (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          border: '2px solid var(--accent-primary)',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin .8s linear infinite',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          border: '2px solid var(--border-color)',
                        }}
                      />
                    )}
                    <span>{step}</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {done && (
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
                <circle cx="110" cy="110" r="90" fill="none" stroke="url(#scoreGrad)" strokeWidth="20" strokeLinecap="round" strokeDasharray={`${(score / 100) * 565} 565`} strokeDashoffset="141" />
                <defs>
                  <linearGradient id="scoreGrad" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ff6b9d" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: 48, fontWeight: 800, background: 'linear-gradient(135deg,#ff6b9d,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {score}
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>{scoreLabel}</div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
              {[
                { label: 'Mesures', value: measurementHistory.length || 0 },
                { label: 'IMC', value: userData?.bmi || '--' },
                { label: 'Age', value: userData?.age ? `${userData.age} ans` : '--' },
              ].map((item, i) => (
                <div key={i} className="card-secondary" style={{ textAlign: 'center', minWidth: 80 }}>
                  <span style={{ display: 'block', fontSize: 18, fontWeight: 800, color: 'var(--accent-primary)' }}>{item.value}</span>
                  <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)' }}>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {done && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.1s both' }}>
            <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Facteurs de Risque
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>{risks.length} detecte(s)</span>
            </h3>
            {risks.length === 0 ? (
              <div className="card-secondary" style={{ textAlign: 'center', padding: 20 }}>
                <svg style={{ width: 40, height: 40, color: '#10b981', marginBottom: 8 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <p style={{ fontSize: 14, fontWeight: 700, color: '#10b981' }}>Aucun risque majeur detecte</p>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 4 }}>Continuez vos bonnes habitudes !</p>
              </div>
            ) : (
              risks.map((r, i) => (
                <div
                  key={i}
                  className="card-secondary"
                  style={{
                    borderLeft: `4px solid ${riskColors[r.type] || riskColors.info}`,
                    marginBottom: 12,
                    animation: 'fadeInUp 0.3s ease-out',
                    animationDelay: `${i * 0.1}s`,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: `rgba(${r.type === 'high' ? '239,68,68' : r.type === 'medium' ? '245,158,11' : '139,92,246'},0.1)`,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <svg style={{ width: 20, height: 20, color: riskColors[r.type] || riskColors.info }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                        <line x1="12" y1="9" x2="12" y2="13" />
                        <line x1="12" y1="17" x2="12.01" y2="17" />
                      </svg>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 4 }}>{r.title}</div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 8 }}>{r.description}</div>
                      {r.tip && (
                        <div className="card-accent">
                          <p style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', marginBottom: 2 }}>Conseil</p>
                          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.tip}</p>
                        </div>
                      )}
                      <span
                        style={{
                          display: 'inline-block',
                          padding: '4px 8px',
                          borderRadius: 6,
                          fontSize: 11,
                          fontWeight: 700,
                          background: `rgba(${r.type === 'high' ? '239,68,68' : r.type === 'medium' ? '245,158,11' : '139,92,246'},0.1)`,
                          color: riskColors[r.type] || riskColors.info,
                        }}
                      >
                        {riskLabels[r.type] || 'Info'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {done && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.2s both' }}>
            <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
              </svg>
              Predictions Medicales
            </h3>
            {predictions.map((p, i) => (
              <div
                key={i}
                className="card-secondary"
                style={{
                  marginBottom: 16,
                  animation: 'fadeInUp 0.3s ease-out',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 48, height: 48, background: 'linear-gradient(135deg,rgba(255,107,157,0.1),rgba(139,92,246,0.1))', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{p.disease}</span>
                  </div>
                  <span style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#ff6b9d,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                    {p.probability}%
                  </span>
                </div>
                <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>{p.description}</p>
                <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden', marginBottom: 12 }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${p.probability}%`,
                      background: p.probability > 70 ? 'linear-gradient(90deg,#ef4444,#dc2626)' : p.probability > 40 ? 'linear-gradient(90deg,#f59e0b,#d97706)' : 'linear-gradient(90deg,#10b981,#059669)',
                      borderRadius: 4,
                      transition: 'width 1s ease-out',
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {p.factors.map((f, j) => (
                    <span key={j} className="tag">{f}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {done && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}>
            <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 20 }}>
              Evolution de votre Frequence Cardiaque
            </h3>
            <div className="card-secondary">
              <canvas ref={chartRef} style={{ width: '100%', height: 200 }} />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              {['week', 'month', 'year'].map((p) => (
                <button
                  key={p}
                  onClick={() => {
                    setPeriod(p)
                    setTimeout(drawChart, 50)
                  }}
                  style={{
                    padding: '10px 20px',
                    borderRadius: 12,
                    fontFamily: 'Nunito,sans-serif',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    background: period === p ? 'linear-gradient(135deg,#ff6b9d,#8b5cf6)' : 'var(--bg-secondary)',
                    border: `2px solid ${period === p ? 'transparent' : 'var(--border-color)'}`,
                    color: period === p ? 'white' : 'var(--text-secondary)',
                  }}
                >
                  {p === 'week' ? 'Semaine' : p === 'month' ? 'Mois' : 'Annee'}
                </button>
              ))}
            </div>
            {measurementHistory.length < 2 && (
              <p style={{ textAlign: 'center', fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 12 }}>
                Les donnees reelles apparaitront apres plusieurs mesures
              </p>
            )}
          </div>
        )}

        {done && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.4s both' }}>
            <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
              <svg style={{ width: 24, height: 24, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Recommandations Personnalisees
            </h3>
            {recommendations.map((r, i) => (
              <div
                key={i}
                style={{
                  background: r.priority === 'high' ? 'linear-gradient(135deg,rgba(239,68,68,0.05),rgba(220,38,38,0.05))' : 'var(--bg-secondary)',
                  border: r.priority === 'high' ? '1px solid rgba(239,68,68,0.2)' : '1px solid var(--border-color)',
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  animation: 'fadeInUp 0.3s ease-out',
                  animationDelay: `${i * 0.1}s`,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    background: r.priority === 'high' ? '#ef4444' : '#10b981',
                    borderRadius: 8,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <svg style={{ width: 18, height: 18, color: 'white' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{r.title}</div>
                    {r.priority === 'high' && (
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '2px 6px', borderRadius: 4 }}>
                        Prioritaire
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{r.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {done && <MedicalDisclaimer />}

        {done && measurementHistory.length > 0 && (
          <div ref={historyRef} className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.45s both' }}>
            <div className="section-header">
              <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 18, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg style={{ width: 22, height: 22, color: 'var(--accent-primary)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Historique des Mesures
              </h3>
              <button className="view-all-btn" onClick={() => setShowHistory(!showHistory)}>
                {showHistory ? 'Reduire' : 'Voir tout (' + measurementHistory.length + ')'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
              {[
                { label: 'Moyenne', value: Math.round(measurementHistory.reduce((a, b) => a + b.bpm, 0) / measurementHistory.length) + ' BPM', color: 'var(--accent-primary)' },
                { label: 'Min', value: Math.min(...measurementHistory.map((e) => e.bpm)) + ' BPM', color: '#10b981' },
                { label: 'Max', value: Math.max(...measurementHistory.map((e) => e.bpm)) + ' BPM', color: '#ef4444' },
                { label: 'Dernier', value: measurementHistory[0]?.bpm + ' BPM', color: '#8b5cf6' },
              ].map((stat, i) => (
                <div key={i} className="card-secondary" style={{ flex: 1, minWidth: 70, textAlign: 'center' }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: stat.color }}>{stat.value}</div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-tertiary)', marginTop: 2 }}>{stat.label}</div>
                </div>
              ))}
            </div>
            {(showHistory ? measurementHistory : measurementHistory.slice(0, 5)).map((entry, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 0',
                  borderBottom: i < Math.min(showHistory ? measurementHistory.length : 5, measurementHistory.length) - 1 ? '1px solid var(--border-color)' : 'none',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div className="card-secondary" style={{ width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg style={{ width: 18, height: 18, color: getBpmColor(entry.bpm) }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>{formatTime(entry.date)}</span>
                </div>
                <span style={{ fontSize: 18, fontWeight: 800, color: getBpmColor(entry.bpm) }}>
                  {entry.bpm} <span style={{ fontSize: 12, color: 'var(--text-tertiary)', fontWeight: 600 }}>BPM</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
          <button className="btn btn-primary" style={{ width: '100%' }} onClick={analyze} disabled={analyzing}>
            <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
            </svg>
            {analyzing ? 'Analyse en cours...' : 'Analyser ma Sante Cardiaque'}
          </button>
          {done && (
            <>
              <button className="btn btn-secondary" style={{ width: '100%' }} onClick={() => setShowModal(true)}>
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                Voir les Details
              </button>
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleShare}>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                  </svg>
                  Partager
                </button>
                <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handleExportPDF} disabled={exporting}>
                  <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                  {exporting ? 'Preparation...' : 'Export PDF'}
                </button>
              </div>
              <button
                className="btn btn-secondary"
                style={{ width: '100%' }}
                onClick={() => {
                  setShowHistory(true)
                  historyRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                }}
              >
                <svg className="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
                Voir l'historique complet des mesures
              </button>
            </>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal-content" style={{ width: 450 }}>
            <div className="modal-header">
              <h3>Analyse Detaillee</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            {[
              {
                label: 'Donnees Biometriques',
                items: [
                  `Age: ${userData?.age || '--'} ans`,
                  `Taille: ${userData?.height || '--'} cm`,
                  `Poids: ${userData?.weight || '--'} kg`,
                  `IMC: ${userData?.bmi || '--'}`,
                  `Sexe: ${userData?.gender ? { male: 'Homme', female: 'Femme', other: 'Autre' }[userData.gender] : '--'}`,
                ],
              },
              {
                label: 'Indicateurs Vitaux',
                items: [
                  `Dernier BPM: ${measurementHistory[0]?.bpm || '--'} bpm`,
                  `Nombre de mesures: ${measurementHistory.length}`,
                  userData?.systolic ? `Tension: ${userData.systolic}/${userData.diastolic} mmHg` : 'Tension: Non renseignee',
                ],
              },
              {
                label: 'Mode de Vie',
                items: [
                  `Activite: ${userData?.activityLevel ? { sedentary: 'Sedentaire', light: 'Leger', moderate: 'Modere', active: 'Tres actif' }[userData.activityLevel] : '--'}`,
                  `Tabagisme: ${userData?.smoker ? { no: 'Non', former: 'Ancien fumeur', occasional: 'Occasionnel', regular: 'Regulier' }[userData.smoker] : '--'}`,
                  userData?.familyHistory && userData.familyHistory !== 'none' ? 'Antecedents familiaux: Oui' : 'Antecedents familiaux: Non',
                ],
              },
            ].map((section, i) => (
              <div key={i} className="card-secondary" style={{ marginBottom: 16 }}>
                <h4 style={{ fontWeight: 700, marginBottom: 8 }}>{section.label}</h4>
                {section.items.map((item, j) => (
                  <p key={j} style={{ fontSize: 14, color: 'var(--text-secondary)', margin: '4px 0' }}>{item}</p>
                ))}
              </div>
            ))}
            <div className="card-secondary">
              <h4 style={{ fontWeight: 700, marginBottom: 8 }}>Score Global</h4>
              <p style={{ fontSize: 24, fontWeight: 800, background: 'linear-gradient(135deg,#ff6b9d,#8b5cf6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                {score}/100
              </p>
              <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 8 }}>
                Ce score reflete votre sante cardiovasculaire actuelle basee sur vos donnees reelles.
              </p>
            </div>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
