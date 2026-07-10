export const AGE_ZONES = [
  [18, 30, 64, 76],
  [31, 40, 66, 78],
  [41, 50, 68, 80],
  [51, 60, 70, 82],
  [61, 200, 72, 84],
]

export const SMOKER_RISKS = { no: 0, former: 5, occasional: 10, regular: 20 }

export const ACTIVITY_LEVELS = {
  sedentary: [72, 84],
  light: [68, 80],
  moderate: [60, 74],
  active: [50, 66],
}

export function getAgeZone(age) {
  const zone = AGE_ZONES.find((a) => age >= a[0] && age <= a[1])
  return zone || AGE_ZONES[0]
}

export function getBMICategory(bmi) {
  if (!bmi) return null
  if (bmi < 18.5) return 'Insuffisance ponderale'
  if (bmi < 25) return 'Poids normal'
  if (bmi < 30) return 'Surpoids'
  return 'Obesite'
}

export function detectAnomalies(history, userData) {
  const anomalies = []
  if (history.length < 2) return anomalies

  const recent = history.slice(0, Math.min(5, history.length))
  const values = recent.map((e) => e.bpm)
  const unique = new Set(values)

  if (unique.size === 1 && values.length >= 2) {
    anomalies.push({
      type: 'suspicious',
      severity: 'high',
      title: 'Mesures identiques detectees',
      message:
        'Les ' +
        values.length +
        ' dernieres mesures sont toutes a ' +
        values[0] +
        ' BPM.',
      tip: 'Assurez-vous que votre doigt couvre bien lentille et flash.',
    })
  }

  if (values.length >= 3) {
    const mean = values.reduce((a, b) => a + b) / values.length
    const variance =
      values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length
    const std = Math.sqrt(variance)
    if (std < 1)
      anomalies.push({
        type: 'suspicious',
        severity: 'medium',
        title: 'Variation anormalement faible',
        message:
          'Mesures trop constantes (' + std.toFixed(1) + ' BPM de variation).',
        tip: 'Un coeur sain a une variabilite naturelle.',
      })
  }

  if (userData) {
    const lastBpm = history[0]?.bpm
    if (lastBpm) {
      const ageZone = getAgeZone(userData.age || 30)
      if (lastBpm < ageZone[2] - 10)
        anomalies.push({
          type: 'insight',
          severity: 'info',
          title: 'Frequence basse pour votre age',
          message:
            'Votre pouls (' +
            lastBpm +
            ' BPM) est inferieur a la normale.',
          tip: "Si vous etes sportif, c'est normal.",
        })
      else if (lastBpm > ageZone[3] + 15)
        anomalies.push({
          type: 'insight',
          severity: 'warning',
          title: 'Frequence elevee pour votre age',
          message:
            'Votre pouls (' +
            lastBpm +
            ' BPM) est au-dessus de la moyenne.',
          tip: 'Detendez-vous 5 min avant la mesure.',
        })
    }

    if (userData.bmi) {
      const cat = getBMICategory(userData.bmi)
      if (cat && cat !== 'Poids normal')
        anomalies.push({
          type: 'risk',
          severity: cat === 'Surpoids' ? 'medium' : 'high',
          title: 'IMC : ' + cat,
          message: 'Votre IMC est de ' + userData.bmi,
          tip: 'Un poids sain reduit la charge sur votre coeur.',
        })
    }

    if (userData.smoker && userData.smoker !== 'no') {
      const r = SMOKER_RISKS[userData.smoker] || 0
      if (r > 5)
        anomalies.push({
          type: 'risk',
          severity: 'high',
          title: 'Tabagisme detecte',
          message: 'Le tabagisme augmente les risques cardiaques.',
          tip: "Arreter de fumer reduit de 50% le risque d'infarctus.",
        })
    }

    if (userData.familyHistory && userData.familyHistory !== 'none')
      anomalies.push({
        type: 'risk',
        severity: 'medium',
        title: 'Antecedents familiaux',
        message: 'Risque hereditaire de maladies cardiaques.',
        tip: 'Un suivi medical regulier est recommande.',
      })

    if (userData.systolic && userData.diastolic) {
      if (userData.systolic >= 140 || userData.diastolic >= 90)
        anomalies.push({
          type: 'risk',
          severity: 'high',
          title: 'Tension elevee',
          message: userData.systolic + '/' + userData.diastolic + ' mmHg',
          tip: 'Reduisez le sel et consultez un medecin.',
        })
      else if (userData.systolic >= 130 || userData.diastolic >= 85)
        anomalies.push({
          type: 'risk',
          severity: 'medium',
          title: 'Pre-hypertension',
          message: userData.systolic + '/' + userData.diastolic + ' mmHg',
          tip: 'Surveillez votre tension regulierement.',
        })
    }

    if (userData.activityLevel && history[0]?.bpm) {
      const range = ACTIVITY_LEVELS[userData.activityLevel]
      if (
        range &&
        history[0].bpm > range[1] + 5 &&
        userData.activityLevel === 'active'
      )
        anomalies.push({
          type: 'insight',
          severity: 'info',
          title: 'BPM plus eleve que prevu',
          message:
            'Pour votre niveau, le pouls est entre ' +
            range[0] +
            '-' +
            range[1] +
            ' BPM.',
          tip: 'Mesurez-vous au repos.',
        })
    }
  }

  if (history.length >= 3) {
    const stable = history
      .slice(0, 3)
      .filter(
        (e, i, a) => i === 0 || Math.abs(e.bpm - a[i - 1].bpm) < 3
      ).length
    if (stable === 3)
      anomalies.push({
        type: 'insight',
        severity: 'info',
        title: 'Battements stables',
        message: 'Frequence stable sur les 3 dernieres mesures.',
        tip: 'Continuez vos bonnes habitudes !',
      })
  }

  return anomalies
}

export function generateRecommendations(userData, measurementHistory) {
  const recs = []
  if (userData) {
    if (userData.smoker && userData.smoker !== 'no')
      recs.push({
        icon: 'smoke',
        title: 'Arret du tabac',
        description: "Programme d'accompagnement personnalise.",
        priority: 'high',
      })
    if (userData.bmi && userData.bmi > 25)
      recs.push({
        icon: 'weight',
        title: 'Gestion du poids',
        description:
          'Objectif : IMC sain (18.5-25). Votre IMC : ' + userData.bmi,
        priority: userData.bmi > 30 ? 'high' : 'medium',
      })
    if (userData.activityLevel === 'sedentary')
      recs.push({
        icon: 'walk',
        title: 'Augmenter votre activite',
        description: 'Commencez par 15 min de marche rapide par jour.',
        priority: 'high',
      })
    else if (userData.activityLevel === 'light')
      recs.push({
        icon: 'walk',
        title: 'Maintenir et progresser',
        description: 'Passez de 1-2 a 3-4 seances par semaine.',
        priority: 'medium',
      })
    if (userData.systolic && userData.systolic >= 130)
      recs.push({
        icon: 'heart',
        title: 'Controle de la tension',
        description: 'Limitez le sel (<5g/jour).',
        priority: 'medium',
      })
    recs.push({
      icon: 'diet',
      title: 'Alimentation cardio-protectrice',
      description: 'Regime mediterraneen, riche en omega-3.',
      priority: 'medium',
    })
    if (userData.age && userData.age > 50)
      recs.push({
        icon: 'checkup',
        title: 'Bilan cardiovasculaire annuel',
        description: 'Check-up cardiaque annuel recommande.',
        priority: 'high',
      })
  }

  if (measurementHistory && measurementHistory.length > 0) {
    const vals = measurementHistory.map((e) => e.bpm)
    const first = vals[vals.length - 1]
    const last = vals[0]
    if (vals.length >= 2 && last < first)
      recs.push({
        icon: 'trending',
        title: 'Bonne tendance !',
        description:
          'Frequence en baisse (' + first + ' -> ' + last + ' BPM).',
        priority: 'low',
      })
  }

  recs.push({
    icon: 'sleep',
    title: 'Sommeil reparateur',
    description: 'Visez 7-8h de sommeil par nuit.',
    priority: 'medium',
  })
  recs.push({
    icon: 'stress',
    title: 'Gestion du stress',
    description: 'Pratiquez 10 min de meditation par jour.',
    priority: 'medium',
  })

  return recs.slice(0, 6)
}

export function generateHealthScore(userData, measurementHistory) {
  let score = 100
  if (!userData)
    return { score: 50, label: 'Donnees insuffisantes', color: '#8b5cf6' }

  const { age, bmi, smoker, familyHistory, systolic, diastolic, activityLevel } =
    userData

  if (age > 40) score -= (age - 40) * 0.3
  if (bmi) {
    if (bmi > 30) score -= 15
    else if (bmi > 25) score -= 8
    else if (bmi < 18.5) score -= 5
  }
  if (smoker === 'regular') score -= 20
  else if (smoker === 'occasional') score -= 10
  else if (smoker === 'former') score -= 3
  if (familyHistory === 'both') score -= 12
  else if (familyHistory === 'parents' || familyHistory === 'siblings') score -= 7
  if (systolic && diastolic) {
    if (systolic >= 140 || diastolic >= 90) score -= 15
    else if (systolic >= 130 || diastolic >= 85) score -= 8
    else if (systolic >= 120) score -= 3
  }
  if (activityLevel === 'sedentary') score -= 10
  else if (activityLevel === 'active') score += 5

  if (measurementHistory && measurementHistory.length > 0) {
    const lastBpm = measurementHistory[0].bpm
    if (lastBpm > 100) score -= 10
    else if (lastBpm > 80) score -= 3
    else if (lastBpm < 60) score -= 2
    if (measurementHistory.length > 5) score += 3
  }

  score = Math.max(0, Math.min(100, Math.round(score)))

  let label, color
  if (score >= 80) {
    label = 'Excellent'
    color = '#10b981'
  } else if (score >= 60) {
    label = 'Bon'
    color = '#3b82f6'
  } else if (score >= 40) {
    label = 'Moyen'
    color = '#f59e0b'
  } else {
    label = 'A ameliorer'
    color = '#ef4444'
  }

  return { score, label, color }
}

export function predictDiseases(userData, measurementHistory, healthScore) {
  const baseRisk = 100 - healthScore.score
  const lastBpm = measurementHistory[0]?.bpm || 75

  const predictions = [
    {
      disease: 'Infarctus du Myocarde',
      probability: Math.min(
        90,
        Math.round(
          baseRisk * 0.5 +
            (lastBpm > 100 ? 15 : 0) +
            (userData?.smoker && userData.smoker !== 'no' ? 10 : 0) +
            (userData?.bmi > 30 ? 10 : userData?.bmi > 25 ? 5 : 0)
        )
      ),
      description:
        "Risque d'accident cardiaque base sur l'ensemble de vos facteurs de risque actuels.",
    },
    {
      disease: 'Accident Vasculaire Cerebral',
      probability: Math.min(
        80,
        Math.round(
          baseRisk * 0.4 +
            (userData?.systolic >= 140
              ? 15
              : userData?.systolic >= 130
                ? 8
                : 0) +
            (userData?.familyHistory && userData.familyHistory !== 'none'
              ? 8
              : 0)
        )
      ),
      description:
        "Probabilite d'AVC estimee selon votre profil cardiovasculaire et vos antecedents.",
    },
    {
      disease: 'Insuffisance Cardiaque',
      probability: Math.min(
        70,
        Math.round(
          baseRisk * 0.35 +
            (lastBpm > 90 ? 10 : 0) +
            (userData?.bmi > 30 ? 8 : 0) +
            (userData?.smoker === 'regular' ? 10 : 0)
        )
      ),
      description:
        'Risque de developper une insuffisance cardiaque dans les 10 prochaines annees.',
    },
  ]

  predictions.forEach((p) => {
    const factors = []
    if (userData?.systolic && userData.systolic >= 130) factors.push('Hypertension')
    if (userData?.bmi && userData.bmi > 25) factors.push('Surpoids')
    if (lastBpm > 90) factors.push('Tachycardie')
    if (
      userData?.smoker === 'regular' ||
      userData?.smoker === 'occasional'
    )
      factors.push('Tabagisme')
    if (userData?.familyHistory && userData.familyHistory !== 'none')
      factors.push('Antecedents')
    if (userData?.age && userData.age > 50) factors.push('Age avance')
    if (userData?.activityLevel === 'sedentary') factors.push('Sedentarite')
    if (!factors.length) factors.push('Facteurs generaux')
    p.factors = factors.slice(0, 3)
  })

  return predictions.sort((a, b) => b.probability - a.probability)
}
