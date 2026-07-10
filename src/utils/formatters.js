export function getBpmColor(bpm) {
  if (bpm < 60) return '#f59e0b'
  if (bpm <= 100) return '#10b981'
  if (bpm <= 140) return '#f59e0b'
  return '#ef4444'
}

export function formatTime(iso) {
  const d = new Date(iso)
  return (
    d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }) +
    ' ' +
    d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  )
}

export function getBpmStatus(bpm) {
  if (bpm < 60)
    return { text: 'Frequence cardiaque basse (bradycardie)', cls: 'status-warning' }
  if (bpm <= 100)
    return { text: 'Frequence cardiaque normale', cls: 'status-success' }
  if (bpm <= 140)
    return { text: 'Frequence cardiaque elevee', cls: 'status-warning' }
  return {
    text: 'Frequence cardiaque tres elevee (tachycardie)',
    cls: 'status-danger',
  }
}

export function getSignalQualityLabel(std) {
  if (std < 5) return 'Excellent'
  if (std < 10) return 'Bon'
  if (std < 15) return 'Moyen'
  return 'Faible'
}
