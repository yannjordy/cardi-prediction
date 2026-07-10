import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import BottomNav from '../components/BottomNav'
import PageHeader from '../components/PageHeader'
import MedicalDisclaimer from '../components/MedicalDisclaimer'
import { useToast } from '../components/Toast'
import { useUserData } from '../context/UserDataContext'
import {
  detectAnomalies,
  generateRecommendations,
  ACTIVITY_LEVELS,
} from '../utils/healthAnalysis'
import { getBpmColor, formatTime, getBpmStatus } from '../utils/formatters'

const CONFIG = {
  MEASUREMENT_DURATION: 15000,
  SAMPLE_RATE: 30,
  MIN_BPM: 40,
  MAX_BPM: 200,
  FILTER_WINDOW: 5,
}

const FINGER_STATUS = {
  no_finger: {
    label: 'Aucun doigt detecte',
    color: '#ef4444',
    msg: 'Placez votre doigt sur la camera',
  },
  adjusting: {
    label: 'Ajustement necessaire',
    color: '#f59e0b',
    msg: 'Appuyez plus fermement',
  },
  good: {
    label: 'Position parfaite',
    color: '#10b981',
    msg: 'Excellent ! Ne bougez plus',
  },
  movement: {
    label: 'Mouvement detecte',
    color: '#ef4444',
    msg: 'Restez immobile pendant la mesure',
  },
  signal: {
    label: 'Signal capte',
    color: '#3b82f6',
    msg: 'Pouls detecte, mesure en cours',
  },
}

const TUTORIAL_STEPS = [
  {
    title: 'Technologie PPG',
    desc: 'Cardi utilise la photoplethysmographie (PPG) : la lumiere du flash traverse votre doigt et les variations de flux sanguin sont detectees par la camera.',
    detail:
      "Le flash emet une lumiere qui traverse les tissus du doigt. La camera capte les variations d'intensite lumineuse causees par l'afflux sanguin a chaque pulsation.",
  },
  {
    title: 'Position du doigt',
    desc: "Placez votre index ou majeur sur l'objectif de la camera arriere. Le doigt doit couvrir COMPLETEMENT l'objectif et le flash.",
    detail:
      'La pulpe du doigt est ideale car elle est riche en capillaires sanguins. Evitez le pouce qui a un pouls plus fort et moins regulier.',
  },
  {
    title: 'Pression optimale',
    desc: "Appuyez legerement mais fermement. Trop de pression comprime les vaisseaux et fausse la mesure. Trop peu de pression laisse passer la lumiere ambiante.",
    detail:
      "La pression ideale est celle qui empeche la lumiere exterieure de passer tout en permettant une circulation sanguine normale dans le doigt.",
  },
  {
    title: 'Rester immobile',
    desc: "Ne bougez pas pendant les 15 secondes de mesure. Les mouvements creent des artefacts qui perturbent l'algorithme de detection du pouls.",
    detail:
      'Posez votre main a plat sur une surface stable. Respirez normalement sans bouger les doigts. Evitez de parler pendant la mesure.',
  },
  {
    title: 'Conditions ideales',
    desc: 'Mesurez dans un environnement calme, assis depuis au moins 2 minutes. Evitez apres un effort, un cafe ou un repas copieux.',
    detail:
      'La frequence cardiaque au repos se mesure idealement le matin au reveil, avant de se lever. Pour une mesure fiable, restez au calme 5 minutes avant.',
  },
  {
    title: 'Interpretation du signal',
    desc: "L'onde PPG affichee correspond a chaque pulsation. Une onde reguliere et ample indique une bonne qualite de mesure.",
    detail:
      'La courbe PPG montree en temps reel permet de visualiser la regularite du pouls. Plus les pics sont reguliers, plus la mesure sera precise.',
  },
]

export default function Home() {
  const [measuring, setMeasuring] = useState(false)
  const measuringRef = useRef(false)
  const [result, setResult] = useState(null)
  const [lastBPM, setLastBPM] = useState(
    () => { try { return localStorage.getItem('cardiLastBPM') || '--' } catch { return '--' } }
  )
  const [userName, setUserName] = useState(() => {
    try {
      const s = JSON.parse(localStorage.getItem('cardi_session') || '{}')
      return s?.user?.fullName || 'Utilisateur'
    } catch { return 'Utilisateur' }
  })
  const [profilePic, setProfilePic] = useState(
    () => { try { return localStorage.getItem('cardiProfilePic') || '' } catch { return '' } }
  )
  const [bpmValues, setBpmValues] = useState([])
  const [waveformData, setWaveformData] = useState([])
  const [showHistory, setShowHistory] = useState(false)
  const [aiInsights, setAiInsights] = useState([])
  const [aiRecs, setAiRecs] = useState([])
  const [aiAnalyzing, setAiAnalyzing] = useState(false)
  const [fingerStatus, setFingerStatus] = useState('no_finger')
  const [signalQuality, setSignalQuality] = useState(0)
  const [showTutorial, setShowTutorial] = useState(false)
  const [tutorialStep, setTutorialStep] = useState(0)

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const rafRef = useRef(null)
  const beepRef = useRef(null)
  const startTimeRef = useRef(null)
  const redValuesRef = useRef([])
  const bpmValuesRef = useRef([])
  const waveformDataRef = useRef([])
  const prevRedValuesRef = useRef([])
  const placementCheckRef = useRef(null)
  const lastFrameTimeRef = useRef(0)
  const aiTimerRef = useRef(null)

  const { userData, addMeasurement, measurementHistory } = useUserData()
  const toast = useToast()

  useEffect(() => {
    if (userData.fullName) setUserName(userData.fullName)
  }, [userData.fullName])

  useEffect(() => {
    return () => clearTimeout(aiTimerRef.current)
  }, [])

  const calcBPM = useCallback((values) => {
    if (values.length < CONFIG.SAMPLE_RATE * 2) return 0
    const mean = values.reduce((a, b) => a + b) / values.length
    const norm = values.map((v) => v - mean)
    const filtered = norm.map((_, i) => {
      const w = CONFIG.FILTER_WINDOW
      const slice = norm.slice(
        Math.max(0, i - w),
        Math.min(norm.length, i + w + 1)
      )
      return slice.reduce((a, b) => a + b) / slice.length
    })
    const threshold = Math.max(...filtered) * 0.6
    const peaks = []
    for (let i = 1; i < filtered.length - 1; i++) {
      if (
        filtered[i] > filtered[i - 1] &&
        filtered[i] > filtered[i + 1] &&
        filtered[i] > threshold
      ) {
        if (
          peaks.length === 0 ||
          i - peaks[peaks.length - 1] > CONFIG.SAMPLE_RATE / 3
        )
          peaks.push(i)
      }
    }
    if (peaks.length < 2) return 0
    const intervals = peaks.slice(1).map((p, i) => p - peaks[i])
    const avgInterval = intervals.reduce((a, b) => a + b) / intervals.length
    const bpm = Math.round((60 * CONFIG.SAMPLE_RATE) / avgInterval)
    return bpm >= CONFIG.MIN_BPM && bpm <= CONFIG.MAX_BPM ? bpm : 0
  }, [])

  const checkFingerPlacement = useCallback(() => {
    const recent = prevRedValuesRef.current
    if (recent.length < 3) return

    const avg = recent.reduce((a, b) => a + b) / recent.length

    if (avg < 30) {
      setFingerStatus('no_finger')
    } else if (avg > 200) {
      setFingerStatus('adjusting')
    } else {
      const min = Math.min(...recent)
      const max = Math.max(...recent)
      const amplitude = max - min
      const variance =
        recent.reduce((s, v) => s + (v - avg) ** 2, 0) / recent.length
      const std = Math.sqrt(variance)

      if (std > 15) {
        setFingerStatus('movement')
      } else if (amplitude > 3 && std > 1) {
        setFingerStatus('signal')
        setSignalQuality((prev) => Math.min(100, prev + 5))
      } else {
        setFingerStatus('good')
      }
    }
  }, [])

  const analyzeFrame = useCallback(
    (timestamp) => {
      if (!measuringRef.current) return

      const elapsed = timestamp - lastFrameTimeRef.current
      if (elapsed < 1000 / CONFIG.SAMPLE_RATE) {
        rafRef.current = requestAnimationFrame(analyzeFrame)
        return
      }
      lastFrameTimeRef.current = timestamp

      const video = videoRef.current
      const canvas = canvasRef.current
      if (!video || !canvas || !video.videoWidth) {
        rafRef.current = requestAnimationFrame(analyzeFrame)
        return
      }

      const ctx = canvas.getContext('2d')
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const d = imageData.data
      let redSum = 0,
        count = 0
      const cx = Math.floor(canvas.width / 2)
      const cy = Math.floor(canvas.height / 2)
      const sz = Math.min(canvas.width, canvas.height) / 4

      for (let y = cy - sz; y < cy + sz; y++) {
        for (let x = cx - sz; x < cx + sz; x++) {
          if (x >= 0 && x < canvas.width && y >= 0 && y < canvas.height) {
            const idx = (y * canvas.width + x) * 4
            redSum += d[idx]
            count++
          }
        }
      }

      const avgRed = redSum / count
      redValuesRef.current.push(avgRed)
      prevRedValuesRef.current.push(avgRed)
      if (prevRedValuesRef.current.length > 10)
        prevRedValuesRef.current = prevRedValuesRef.current.slice(-10)

      waveformDataRef.current.push(avgRed)
      if (waveformDataRef.current.length > 100)
        waveformDataRef.current = waveformDataRef.current.slice(-100)
      setWaveformData([...waveformDataRef.current])

      if (redValuesRef.current.length >= CONFIG.SAMPLE_RATE) {
        const bpm = calcBPM(redValuesRef.current)
        if (bpm > 0) {
          bpmValuesRef.current.push(bpm)
          setBpmValues([...bpmValuesRef.current])
        }
      }

      rafRef.current = requestAnimationFrame(analyzeFrame)
    },
    [calcBPM]
  )

  const startMeasurement = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await new Promise((r) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
            r()
          }
        })
      }
      const track = stream.getVideoTracks()[0]
      const caps = track.getCapabilities?.()
      if (caps?.torch)
        await track.applyConstraints({ advanced: [{ torch: true }] }).catch(() => {})

      measuringRef.current = true
      setMeasuring(true)
      setResult(null)
      setAiInsights([])
      setAiRecs([])
      setAiAnalyzing(false)
      setFingerStatus('no_finger')
      setSignalQuality(0)
      startTimeRef.current = Date.now()
      redValuesRef.current = []
      bpmValuesRef.current = []
      waveformDataRef.current = []
      prevRedValuesRef.current = []
      setBpmValues([])
      setWaveformData([])

      if (navigator.vibrate) navigator.vibrate([200, 100, 200])

      lastFrameTimeRef.current = performance.now()
      rafRef.current = requestAnimationFrame(analyzeFrame)
      beepRef.current = setInterval(() => {
        if (navigator.vibrate) navigator.vibrate(100)
      }, 1000)
      placementCheckRef.current = setInterval(checkFingerPlacement, 500)

      setTimeout(() => {
        if (measuringRef.current || streamRef.current) stopMeasurement()
      }, CONFIG.MEASUREMENT_DURATION)
    } catch {
      toast.error("Impossible d'acceder a la camera. Verifiez les permissions.")
    }
  }

  const stopMeasurement = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    clearInterval(beepRef.current)
    clearInterval(placementCheckRef.current)
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    measuringRef.current = false
    setMeasuring(false)
    if (navigator.vibrate) navigator.vibrate([200, 100, 200])

    const vals = bpmValuesRef.current
    if (vals.length === 0) {
      toast.error('Mesure echouee. Couvrez bien la camera avec votre doigt.')
      return
    }

    const sorted = [...vals].sort((a, b) => a - b)
    const q1 = sorted[Math.floor(sorted.length * 0.25)]
    const q3 = sorted[Math.floor(sorted.length * 0.75)]
    const iqr = q3 - q1
    const filtered = vals.filter(
      (v) => v >= q1 - 1.5 * iqr && v <= q3 + 1.5 * iqr
    )
    const arr = filtered.length ? filtered.sort((a, b) => a - b) : sorted
    const mid = Math.floor(arr.length / 2)
    const bpm =
      arr.length % 2 === 0
        ? Math.round((arr[mid - 1] + arr[mid]) / 2)
        : arr[mid]
    const duration = ((Date.now() - startTimeRef.current) / 1000).toFixed(1)
    const mean = vals.reduce((a, b) => a + b) / vals.length
    const std = Math.sqrt(
      vals.reduce((s, v) => s + (v - mean) ** 2, 0) / vals.length
    )
    const quality =
      std < 5 ? 'Excellent' : std < 10 ? 'Bon' : std < 15 ? 'Moyen' : 'Faible'

    const statusInfo = getBpmStatus(bpm)
    setResult({ bpm, duration, quality, status: statusInfo.text, cls: statusInfo.cls })
    setLastBPM(bpm)
    localStorage.setItem('cardiLastBPM', bpm)

    addMeasurement({ bpm, date: new Date().toISOString(), timestamp: Date.now() })

    setAiAnalyzing(true)
    const t = setTimeout(() => {
      const hist = JSON.parse(localStorage.getItem('cardiHistory') || '[]')
      const insights = detectAnomalies(hist, userData)
      setAiInsights(insights)
      const recs = generateRecommendations(userData, hist)
      setAiRecs(recs)
      setAiAnalyzing(false)
    }, 1200)
    aiTimerRef.current = t
  }

  const fs = FINGER_STATUS[fingerStatus]

  const memoizedInsights = useMemo(
    () => aiInsights.filter((i) => i.type === 'suspicious'),
    [aiInsights]
  )
  const memoizedOtherInsights = useMemo(
    () => aiInsights.filter((i) => i.type !== 'suspicious'),
    [aiInsights]
  )

  return (
    <div>
      <PageHeader
        title="Cardi"
        rightAction="Comment ca marche ?"
        onRightAction={() => {
          setTutorialStep(0)
          setShowTutorial(true)
        }}
      />

      <main className="container">
        {/* User card */}
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              background: profilePic ? 'transparent' : 'linear-gradient(135deg,#ff6b9d,#8b5cf6)',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            {profilePic ? (
              <img src={profilePic} alt="photo" style={{width:'100%',height:'100%',objectFit:'cover',borderRadius:16}} />
            ) : (
              <svg style={{width:28,height:28,color:'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 4 }}>
              {userName}
            </h2>
            <p
              style={{
                fontSize: 13,
                fontWeight: 600,
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: measuring ? fs.color : '#10b981',
                  borderRadius: '50%',
                  display: 'inline-block',
                  animation: measuring
                    ? 'pulse 1s infinite'
                    : 'pulse 2s infinite',
                }}
              />
              {measuring ? fs.msg : 'Pret pour la mesure'}
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span
              style={{
                display: 'block',
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--accent-primary)',
              }}
            >
              {lastBPM}
            </span>
            <span
              style={{
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-tertiary)',
              }}
            >
              BPM
            </span>
          </div>
        </div>

        {/* Measurement section */}
        <div className="card">
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 20,
            }}
          >
            <div>
              <h3 className="section-title">Mesure cardiaque</h3>
              <p className="section-subtitle">Place ton doigt sur la camera</p>
            </div>
            <button
              onClick={() => {
                setTutorialStep(0)
                setShowTutorial(true)
              }}
              style={{
                padding: '8px 14px',
                borderRadius: 10,
                border: '1px solid var(--accent-primary)',
                background: 'transparent',
                color: 'var(--accent-primary)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                fontFamily: 'Nunito,sans-serif',
              }}
            >
              <svg
                style={{ width: 14, height: 14 }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Tutoriel
            </button>
          </div>

          {/* Camera area */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: 320,
              background: '#000',
              borderRadius: 20,
              overflow: 'hidden',
              marginBottom: 16,
            }}
          >
            <video
              ref={videoRef}
              autoPlay
              playsInline
              style={{
                display: measuring ? 'block' : 'none',
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {!measuring && (
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background:
                    'linear-gradient(135deg,rgba(255,107,157,0.1),rgba(139,92,246,0.1))',
                  backdropFilter: 'blur(10px)',
                  padding: 20,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 80,
                    height: 80,
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: 20,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                  }}
                >
                  <svg
                    style={{ width: 40, height: 40, color: '#ff6b9d' }}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <path d="M12 19v3" />
                  </svg>
                </div>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'white',
                    marginBottom: 8,
                  }}
                >
                  Place ton doigt sur la camera arriere
                </p>
                <p
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: 'rgba(255,255,255,0.8)',
                    marginBottom: 16,
                  }}
                >
                  Couvre completement l'objectif et le flash avec la pulpe de ton
                  index
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <svg
                      style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                    </svg>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      Flash requis
                    </span>
                  </div>
                  <div
                    style={{
                      background: 'rgba(255,255,255,0.1)',
                      borderRadius: 10,
                      padding: '6px 10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                    }}
                  >
                    <svg
                      style={{ width: 14, height: 14, color: 'rgba(255,255,255,0.7)' }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 6v6l4 2" />
                    </svg>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: 600,
                        color: 'rgba(255,255,255,0.7)',
                      }}
                    >
                      15 secondes
                    </span>
                  </div>
                </div>
              </div>
            )}

            {measuring && (
              <>
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    left: 12,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    zIndex: 10,
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: fs.color,
                      animation: 'pulse 1s infinite',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>
                    {fs.label}
                  </span>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'rgba(0,0,0,0.7)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 12,
                    padding: '8px 12px',
                    zIndex: 10,
                    textAlign: 'center',
                  }}
                >
                  <div
                    style={{
                      fontSize: 16,
                      fontWeight: 800,
                      color:
                        signalQuality > 70
                          ? '#10b981'
                          : signalQuality > 40
                            ? '#f59e0b'
                            : '#ef4444',
                    }}
                  >
                    {signalQuality}%
                  </div>
                  <div
                    style={{
                      fontSize: 9,
                      fontWeight: 600,
                      color: 'rgba(255,255,255,0.6)',
                      textTransform: 'uppercase',
                    }}
                  >
                    Qualite
                  </div>
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    zIndex: 10,
                    background: 'rgba(0,0,0,0.3)',
                  }}
                >
                  {startTimeRef.current && (
                    <div
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg,#ff6b9d,#8b5cf6)',
                        width:
                          Math.min(
                            100,
                            ((Date.now() - startTimeRef.current) /
                              CONFIG.MEASUREMENT_DURATION) *
                              100
                          ) + '%',
                        transition: 'width 0.3s linear',
                        borderRadius: '0 2px 2px 0',
                      }}
                    />
                  )}
                </div>

                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {fingerStatus === 'good' || fingerStatus === 'signal' ? (
                    <>
                      {[0, 1].map((i) => (
                        <div
                          key={i}
                          style={{
                            position: 'absolute',
                            width: 120,
                            height: 120,
                            border: '3px solid #ff6b9d',
                            borderRadius: '50%',
                            animation: 'pulseRing 2s infinite',
                            animationDelay: `${i}s`,
                          }}
                        />
                      ))}
                      <svg
                        style={{
                          width: 60,
                          height: 60,
                          color: '#ff6b9d',
                          animation: 'heartbeat 1s infinite',
                          filter: 'drop-shadow(0 0 20px #ff6b9d)',
                          zIndex: 2,
                        }}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                      {bpmValues.length > 0 && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 70,
                            textAlign: 'center',
                            zIndex: 3,
                          }}
                        >
                          <span
                            style={{
                              fontSize: 32,
                              fontWeight: 800,
                              color: 'white',
                              textShadow: '0 2px 8px rgba(0,0,0,0.5)',
                            }}
                          >
                            {bpmValues[bpmValues.length - 1]}
                          </span>
                          <span
                            style={{
                              fontSize: 14,
                              fontWeight: 700,
                              color: 'rgba(255,255,255,0.8)',
                              display: 'block',
                            }}
                          >
                            BPM
                          </span>
                        </div>
                      )}
                    </>
                  ) : fingerStatus === 'no_finger' ? (
                    <div style={{ textAlign: 'center', zIndex: 2 }}>
                      <div
                        style={{
                          background: 'rgba(255,255,255,0.1)',
                          borderRadius: '50%',
                          padding: 24,
                          marginBottom: 12,
                        }}
                      >
                        <svg
                          style={{
                            width: 48,
                            height: 48,
                            color: 'rgba(255,255,255,0.5)',
                          }}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                          <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                          <line x1="12" y1="19" x2="12" y2="22" />
                        </svg>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
                        Placez votre doigt
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        Couvrez la camera et le flash
                      </p>
                    </div>
                  ) : fingerStatus === 'adjusting' ? (
                    <div style={{ textAlign: 'center', zIndex: 2 }}>
                      <div
                        style={{
                          background: 'rgba(245,158,11,0.2)',
                          borderRadius: '50%',
                          padding: 24,
                          marginBottom: 12,
                        }}
                      >
                        <svg
                          style={{ width: 48, height: 48, color: '#f59e0b' }}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                          <polyline points="12 9 12 13 14 15" />
                        </svg>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
                        Trop de lumiere
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        Appuyez plus fermement sur le doigt
                      </p>
                    </div>
                  ) : fingerStatus === 'movement' ? (
                    <div style={{ textAlign: 'center', zIndex: 2 }}>
                      <div
                        style={{
                          background: 'rgba(239,68,68,0.2)',
                          borderRadius: '50%',
                          padding: 24,
                          marginBottom: 12,
                        }}
                      >
                        <svg
                          style={{ width: 48, height: 48, color: '#ef4444' }}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <polyline points="15 14 20 9 15 4" />
                          <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                        </svg>
                      </div>
                      <p style={{ fontSize: 15, fontWeight: 700, color: 'white' }}>
                        Mouvement detecte
                      </p>
                      <p
                        style={{
                          fontSize: 12,
                          fontWeight: 600,
                          color: 'rgba(255,255,255,0.6)',
                        }}
                      >
                        Restez parfaitement immobile
                      </p>
                    </div>
                  ) : null}
                </div>

                {measuring && waveformData.length > 2 && (
                  <div
                    style={{
                      position: 'absolute',
                      bottom: 10,
                      left: 10,
                      right: 10,
                      height: 60,
                      background: 'rgba(0,0,0,0.5)',
                      borderRadius: 12,
                      zIndex: 5,
                    }}
                  >
                    <svg
                      width="100%"
                      height="100%"
                      viewBox={`0 0 ${waveformData.length} 60`}
                      preserveAspectRatio="none"
                    >
                      <polyline
                        points={waveformData
                          .map((v, i) => {
                            const min = Math.min(...waveformData)
                            const max = Math.max(...waveformData)
                            const range = max - min || 1
                            return `${i},${60 - ((v - min) / range) * 50 - 5}`
                          })
                          .join(' ')}
                        fill="none"
                        stroke={
                          fingerStatus === 'good' || fingerStatus === 'signal'
                            ? '#ff6b9d'
                            : fs.color
                        }
                        strokeWidth="2"
                      />
                    </svg>
                  </div>
                )}
              </>
            )}
          </div>

          {!measuring && !result && (
            <div className="card-secondary" style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  background:
                    'linear-gradient(135deg,rgba(139,92,246,0.1),rgba(99,102,241,0.1))',
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  style={{ width: 18, height: 18, color: 'var(--accent-primary)' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4" />
                  <path d="M12 8h.01" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ fontSize: 12, fontWeight: 700, marginBottom: 4 }}>
                  Conseils pour une mesure fiable
                </p>
                <ul
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    paddingLeft: 14,
                    margin: 0,
                  }}
                >
                  <li>Utilisez l'index ou le majeur de preference</li>
                  <li>Couvrez entierement l'objectif ET le flash</li>
                  <li>Appuyez legerement mais fermement</li>
                  <li>Ne bougez pas pendant les 15 secondes</li>
                </ul>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
            {!measuring ? (
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={startMeasurement}
              >
                <svg
                  className="btn-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                </svg>
                Mesurer
              </button>
            ) : (
              <button
                className="btn btn-secondary"
                style={{ flex: 1 }}
                onClick={stopMeasurement}
              >
                <svg
                  className="btn-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="6" y="6" width="12" height="12" />
                </svg>
                Arreter
              </button>
            )}
          </div>

          {result && (
            <div
              style={{
                background:
                  'linear-gradient(135deg,rgba(255,107,157,0.1),rgba(139,92,246,0.1))',
                border: '1px solid var(--border-color)',
                borderRadius: 20,
                padding: 24,
                animation: 'fadeInUp 0.5s ease-out',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'center',
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 48,
                      fontWeight: 800,
                      background: 'linear-gradient(135deg,#ff6b9d,#8b5cf6)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                    }}
                  >
                    {result.bpm}
                  </span>
                  <span
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      color: 'var(--text-secondary)',
                    }}
                  >
                    BPM
                  </span>
                </div>
                <p
                  className={result.cls}
                  style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}
                >
                  {result.status}
                </p>
                <div
                  style={{
                    display: 'flex',
                    gap: 24,
                    justifyContent: 'center',
                    paddingTop: 16,
                    borderTop: '1px solid var(--border-color)',
                  }}
                >
                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      Duree
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>
                      {result.duration}s
                    </span>
                  </div>
                  <div>
                    <span
                      style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                      }}
                    >
                      Qualite
                    </span>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>
                      {result.quality}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* AI Analysis */}
        {aiAnalyzing && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 12 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  animation: 'pulse 1.5s infinite',
                }}
              >
                <svg
                  style={{ width: 24, height: 24, color: 'white' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 16, fontWeight: 700, marginBottom: 2 }}>
                  Dr. Cardi AI
                </h3>
                <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)' }}>
                  Analyse de vos donnees en cours...
                </p>
              </div>
              <div style={{ display: 'flex', gap: 4 }}>
                {[0, 1, 2].map((i) => (
                  <span
                    key={i}
                    style={{
                      width: 8,
                      height: 8,
                      background: '#8b5cf6',
                      borderRadius: '50%',
                      display: 'inline-block',
                      animation: 'typing 1.4s infinite',
                      animationDelay: `${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* AI Insights */}
        {!aiAnalyzing && memoizedInsights.length > 0 && (
          <div
            style={{
              background:
                'linear-gradient(135deg,rgba(239,68,68,0.1),rgba(245,158,11,0.1))',
              border: '2px solid #ef4444',
              borderRadius: 20,
              padding: 24,
              marginBottom: 16,
              animation: 'fadeInUp 0.5s ease-out',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div
                style={{
                  width: 48,
                  height: 48,
                  background: 'rgba(239,68,68,0.15)',
                  borderRadius: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <svg
                  style={{ width: 26, height: 26, color: '#ef4444' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
              </div>
              <div style={{ flex: 1 }}>
                <h4 style={{ fontSize: 16, fontWeight: 700, color: '#ef4444', marginBottom: 4 }}>
                  Attention - Mesure suspecte
                </h4>
                {memoizedInsights.map((insight, idx) => (
                  <div key={idx} style={{ marginBottom: idx < memoizedInsights.length - 1 ? 12 : 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
                      {insight.message}
                    </p>
                    <div className="card-secondary" style={{ border: '1px solid rgba(239,68,68,0.2)' }}>
                      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 18 }}>&#x1F4A1;</span>
                        <div>
                          <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                            Conseil Dr. Cardi
                          </p>
                          <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                            {insight.tip}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {!aiAnalyzing && memoizedOtherInsights.length > 0 && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg,#8b5cf6,#6366f1)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  style={{ width: 22, height: 22, color: 'white' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 16, fontWeight: 700 }}>
                Analyse Dr. Cardi
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {memoizedOtherInsights.map((insight, idx) => {
                const colors = {
                  high: '#ef4444',
                  medium: '#f59e0b',
                  low: '#8b5cf6',
                  info: '#3b82f6',
                  warning: '#f59e0b',
                }
                const icons = { risk: '\u26A0\uFE0F', anomaly: '\uD83D\uDD0D', insight: '\uD83D\uDCA1' }
                return (
                  <div
                    key={idx}
                    style={{
                      background: 'var(--bg-secondary)',
                      borderLeft: `4px solid ${colors[insight.severity] || colors.info}`,
                      borderRadius: 12,
                      padding: 14,
                      display: 'flex',
                      gap: 12,
                      alignItems: 'flex-start',
                      animation: 'fadeInUp 0.3s ease-out',
                      animationDelay: `${idx * 0.1}s`,
                    }}
                  >
                    <span style={{ fontSize: 18, flexShrink: 0 }}>
                      {icons[insight.type] || '\uD83D\uDCA1'}
                    </span>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 700, marginBottom: 4 }}>
                        {insight.title}
                      </p>
                      <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>
                        {insight.message}
                      </p>
                      <div className="card-accent">
                        <p style={{ fontSize: 11, fontWeight: 700, color: '#8b5cf6', marginBottom: 2 }}>
                          Conseil
                        </p>
                        <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {insight.tip}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {!aiAnalyzing && aiRecs.length > 0 && (
          <div className="card" style={{ animation: 'fadeInUp 0.5s ease-out 0.3s both' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  background: 'linear-gradient(135deg,#10b981,#059669)',
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <svg
                  style={{ width: 22, height: 22, color: 'white' }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 style={{ fontFamily: 'Fredoka,cursive', fontSize: 16, fontWeight: 700 }}>
                Recommandations personnalisees
              </h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {aiRecs.slice(0, 4).map((rec, idx) => (
                <div
                  key={idx}
                  className="card-secondary"
                  style={{
                    display: 'flex',
                    gap: 12,
                    alignItems: 'flex-start',
                    animation: 'fadeInUp 0.3s ease-out',
                    animationDelay: `${idx * 0.1}s`,
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      background:
                        rec.priority === 'high'
                          ? 'rgba(239,68,68,0.1)'
                          : 'rgba(16,185,129,0.1)',
                      borderRadius: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <svg
                      style={{
                        width: 18,
                        height: 18,
                        color: rec.priority === 'high' ? '#ef4444' : '#10b981',
                      }}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="M12 16v-4" />
                      <path d="M12 8h.01" />
                    </svg>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700 }}>{rec.title}</span>
                      {rec.priority === 'high' && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: '#ef4444',
                            background: 'rgba(239,68,68,0.1)',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          Prioritaire
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {rec.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {(result || measurementHistory.length > 0) && <MedicalDisclaimer />}

        {/* History */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Historique recent</h3>
            <button
              className="view-all-btn"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Reduire' : 'Voir tout'}
            </button>
          </div>
          {measurementHistory.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <svg
                style={{ width: 48, height: 48, color: 'var(--text-tertiary)', marginBottom: 12 }}
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 4 }}>
                Aucune mesure pour le moment
              </p>
              <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-tertiary)' }}>
                Commence ta premiere mesure !
              </p>
            </div>
          ) : (
            <div>
              {(showHistory
                ? measurementHistory
                : measurementHistory.slice(0, 5)
              ).map((entry, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom:
                      i <
                      (showHistory
                        ? measurementHistory.length
                        : Math.min(5, measurementHistory.length)) -
                          1
                        ? '1px solid var(--border-color)'
                        : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 40,
                        height: 40,
                        background: `rgba(${entry.bpm <= 100 ? '16,185,129' : entry.bpm <= 140 ? '245,158,11' : '239,68,68'},0.1)`,
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <svg
                        style={{ width: 20, height: 20, color: getBpmColor(entry.bpm) }}
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>
                      {formatTime(entry.date)}
                    </span>
                  </div>
                  <span style={{ fontSize: 20, fontWeight: 800, color: getBpmColor(entry.bpm) }}>
                    {entry.bpm}{' '}
                    <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>BPM</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />

      {/* Tutorial Modal */}
      {showTutorial && (
        <div
          className="modal-overlay"
          onClick={(e) => e.target === e.currentTarget && setShowTutorial(false)}
        >
          <div className="modal-content" style={{ maxWidth: 420, width: '90%' }}>
            <div className="modal-header">
              <h3>{TUTORIAL_STEPS[tutorialStep].title}</h3>
              <button
                className="modal-close"
                onClick={() => setShowTutorial(false)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div style={{ padding: 24 }}>
              <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', marginBottom: 16 }}>
                {TUTORIAL_STEPS[tutorialStep].desc}
              </p>
              <div className="card-secondary">
                <p style={{ fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
                  {TUTORIAL_STEPS[tutorialStep].detail}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, padding: '0 24px 24px' }}>
              {tutorialStep > 0 && (
                <button
                  className="btn btn-secondary"
                  style={{ flex: 1 }}
                  onClick={() => setTutorialStep((s) => s - 1)}
                >
                  Precedent
                </button>
              )}
              <button
                className="btn btn-primary"
                style={{ flex: 1 }}
                onClick={() => {
                  if (tutorialStep < TUTORIAL_STEPS.length - 1) {
                    setTutorialStep((s) => s + 1)
                  } else {
                    setShowTutorial(false)
                  }
                }}
              >
                {tutorialStep < TUTORIAL_STEPS.length - 1 ? 'Suivant' : 'Compris !'}
              </button>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 6, paddingBottom: 16 }}>
              {TUTORIAL_STEPS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === tutorialStep ? 20 : 6,
                    height: 6,
                    borderRadius: 3,
                    background:
                      i === tutorialStep
                        ? 'var(--accent-primary)'
                        : 'var(--border-color)',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
