function mean(arr) {
  if (!arr.length) return 0
  return arr.reduce((a, b) => a + b, 0) / arr.length
}

function stdev(arr) {
  if (arr.length < 2) return 0
  const m = mean(arr)
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / arr.length)
}

export function calculateBMI(weight, height) {
  if (!height) return 0
  return Math.round((weight / ((height / 100) ** 2)) * 10) / 10
}

export function bmiCategory(bmi) {
  if (!bmi) return null
  if (bmi < 18.5) return 'underweight'
  if (bmi < 25) return 'normal'
  if (bmi < 30) return 'overweight'
  return 'obese'
}

function bmiRiskScore(bmi) {
  if (!bmi) return 0
  if (bmi < 18.5) return 0.15
  if (bmi < 22) return 0.0
  if (bmi < 25) return 0.05
  if (bmi < 27) return 0.15
  if (bmi < 30) return 0.25
  if (bmi < 35) return 0.35
  return 0.45
}

function ageRiskScore(age, gender) {
  if (gender === 'male') {
    if (age < 30) return 0.0
    if (age < 40) return 0.05
    if (age < 50) return 0.15
    if (age < 60) return 0.30
    if (age < 70) return 0.45
    return 0.60
  } else {
    if (age < 30) return 0.0
    if (age < 40) return 0.02
    if (age < 50) return 0.08
    if (age < 60) return 0.20
    if (age < 70) return 0.35
    return 0.50
  }
}

function bloodPressureRisk(systolic, diastolic) {
  if (!systolic || !diastolic) return { category: 'unknown', score: 0.05, label: 'Non renseignee' }
  if (systolic < 120 && diastolic < 80) return { category: 'optimal', score: 0.0, label: 'Optimale' }
  if (systolic < 130 && diastolic < 85) return { category: 'normal', score: 0.05, label: 'Normale' }
  if (systolic < 140 && diastolic < 90) return { category: 'elevated', score: 0.15, label: 'Elevee' }
  if (systolic < 160 && diastolic < 100) return { category: 'stage1', score: 0.30, label: 'Hypertension stade 1' }
  if (systolic < 180 && diastolic < 110) return { category: 'stage2', score: 0.50, label: 'Hypertension stade 2' }
  return { category: 'crisis', score: 0.70, label: 'Crise hypertensive' }
}

function smokerRisk(status) {
  const risks = { no: 0.0, former: 0.10, occasional: 0.25, regular: 0.45 }
  return risks[status] || 0.0
}

function familyHistoryRisk(history) {
  const risks = { none: 0.0, siblings: 0.10, parents: 0.15, both: 0.25 }
  return risks[history] || 0.0
}

function activityRisk(level) {
  const risks = { active: -0.05, moderate: 0.0, light: 0.10, sedentary: 0.25 }
  return risks[level] || 0.0
}

function diabetesRisk(has) {
  return has ? 0.25 : 0.0
}

function cholesterolRisk(cholesterol) {
  if (cholesterol == null) return 0.05
  if (cholesterol < 200) return 0.0
  if (cholesterol < 240) return 0.10
  if (cholesterol < 280) return 0.20
  return 0.35
}

function stressRisk(level) {
  return Math.max(0, (level - 5) * 0.04)
}

function sleepRisk(hours) {
  if (7 <= hours && hours <= 9) return 0.0
  if ((6 <= hours && hours < 7) || (9 < hours && hours <= 10)) return 0.08
  if ((5 <= hours && hours < 6) || (10 < hours && hours <= 11)) return 0.15
  return 0.25
}

function alcoholRisk(level) {
  const risks = { none: 0.0, light: 0.03, moderate: 0.10, heavy: 0.30 }
  return risks[level] || 0.0
}

function bpmRiskAnalysis(bpmHistory) {
  if (!bpmHistory || !bpmHistory.length) {
    return { score: 0.05, status: 'no_data', label: 'Aucune donnee', avg_bpm: 0, std_bpm: 0, trend: 0, measurements: 0 }
  }

  const recent = bpmHistory.slice(0, 10)
  const avgBpm = mean(recent)
  const stdBpm = recent.length > 1 ? stdev(recent) : 0

  let trend = 0
  if (recent.length >= 3) {
    const half = Math.floor(recent.length / 2)
    const firstHalf = mean(recent.slice(half))
    const secondHalf = mean(recent.slice(0, half))
    trend = secondHalf - firstHalf
  }

  let score = 0.0
  let status = 'normal'
  let label = 'Frequence normale'

  if (avgBpm < 50) {
    score = 0.20; status = 'bradycardia'; label = 'Bradycardie'
  } else if (avgBpm < 60) {
    score = 0.05; status = 'low_normal'; label = 'Frequence basse normale'
  } else if (avgBpm <= 80) {
    score = 0.0; status = 'optimal'; label = 'Optimale'
  } else if (avgBpm <= 100) {
    score = 0.08; status = 'elevated'; label = 'Frequence elevee'
  } else if (avgBpm <= 120) {
    score = 0.20; status = 'tachycardia_mild'; label = 'Tachycardie legerement elevee'
  } else {
    score = 0.40; status = 'tachycardia'; label = 'Tachycardie'
  }

  if (stdBpm > 15) score += 0.10
  else if (stdBpm < 2 && recent.length >= 5) score += 0.05

  if (trend > 5) score += 0.05
  else if (trend < -5) score -= 0.03

  return {
    score: Math.max(0, Math.min(1, score)),
    status,
    label,
    avg_bpm: Math.round(avgBpm * 10) / 10,
    std_bpm: Math.round(stdBpm * 10) / 10,
    trend: Math.round(trend * 10) / 10,
    measurements: bpmHistory.length,
  }
}

function buildProfile(userData, measurementHistory) {
  return {
    age: userData.age || 30,
    gender: userData.gender || 'male',
    height: userData.height || 170,
    weight: userData.weight || 70,
    systolic: userData.systolic || null,
    diastolic: userData.diastolic || null,
    smoker: userData.smoker || 'no',
    family_history: userData.familyHistory || 'none',
    activity_level: userData.activityLevel || 'moderate',
    diabetes: userData.diabetes || false,
    cholesterol: userData.cholesterol || null,
    stress_level: userData.stressLevel || 5,
    sleep_hours: userData.sleepHours || 7,
    alcohol: userData.alcohol || 'none',
    bpm_history: (measurementHistory || []).slice(0, 20).map((e) => e.bpm),
  }
}

export function generateHealthScore(userData, measurementHistory) {
  const p = buildProfile(userData, measurementHistory)
  const bmi = calculateBMI(p.weight, p.height)
  const bmiCat = bmiCategory(bmi)

  const factors = {
    age: ageRiskScore(p.age, p.gender),
    bmi: bmiRiskScore(bmi),
    smoker: smokerRisk(p.smoker),
    family_history: familyHistoryRisk(p.family_history),
    activity: activityRisk(p.activity_level),
    diabetes: diabetesRisk(p.diabetes),
    cholesterol: cholesterolRisk(p.cholesterol),
    stress: stressRisk(p.stress_level),
    sleep: sleepRisk(p.sleep_hours),
    alcohol: alcoholRisk(p.alcohol),
  }

  const bpResult = bloodPressureRisk(p.systolic, p.diastolic)
  factors.blood_pressure = bpResult.score

  const bpmResult = bpmRiskAnalysis(p.bpm_history)
  factors.bpm = bpmResult.score

  const totalRisk = Object.values(factors).reduce((a, b) => a + b, 0)
  const maxPossible = Object.keys(factors).length * 0.5
  const riskRatio = Math.min(totalRisk / maxPossible, 1.0)

  const score = Math.max(0, Math.min(100, Math.round(100 - riskRatio * 100)))

  let grade, label, color, advice
  if (score >= 85) {
    grade = 'A'; label = 'Excellente'; color = '#10b981'
    advice = 'Votre sante cardiovasculaire est excellente. Continuez vos bonnes habitudes !'
  } else if (score >= 70) {
    grade = 'B'; label = 'Bonne'; color = '#3b82f6'
    advice = 'Votre sante cardiaque est bonne. Quelques ameliorations sont possibles.'
  } else if (score >= 55) {
    grade = 'C'; label = 'Moyenne'; color = '#f59e0b'
    advice = 'Des facteurs de risque sont presents. Une consultation medicale est recommandee.'
  } else if (score >= 40) {
    grade = 'D'; label = 'Attention'; color = '#f97316'
    advice = 'Plusieurs facteurs de risque importants. Consultez un cardiologue rapidement.'
  } else {
    grade = 'E'; label = 'Critique'; color = '#ef4444'
    advice = 'Risque cardiovasculaire eleve. Consultation medicale urgente recommandee.'
  }

  return {
    score,
    grade,
    label,
    color,
    advice,
    bmi,
    bmi_category: bmiCat,
    risk_factors: factors,
    blood_pressure: bpResult,
    bpm_analysis: bpmResult,
  }
}

export function predictDiseases(userData, measurementHistory, healthScore) {
  const p = buildProfile(userData, measurementHistory)
  const hs = healthScore || generateHealthScore(userData, measurementHistory)
  const baseRisk = (100 - hs.score) / 100
  const factors = hs.risk_factors

  const miRisk = Math.min(0.95, Math.max(0.02,
    baseRisk * 0.35 + factors.age * 0.20 + factors.smoker * 0.25 + factors.bmi * 0.10 + factors.blood_pressure * 0.15 + factors.cholesterol * 0.10
  ))
  const miFactors = []
  if (factors.smoker > 0.1) miFactors.push('Tabagisme')
  if (factors.blood_pressure > 0.15) miFactors.push('Hypertension')
  if (factors.age > 0.2) miFactors.push('Age avance')
  if (factors.bmi > 0.15) miFactors.push('Surpoids/Obesite')
  if (factors.cholesterol > 0.1) miFactors.push('Cholesterol eleve')
  if (factors.diabetes > 0) miFactors.push('Diabete')
  if (!miFactors.length) miFactors.push('Facteurs generaux')

  const avcRisk = Math.min(0.90, Math.max(0.02,
    baseRisk * 0.30 + factors.blood_pressure * 0.30 + factors.age * 0.15 + factors.smoker * 0.15 + factors.diabetes * 0.10
  ))
  const avcFactors = []
  if (factors.blood_pressure > 0.15) avcFactors.push('Hypertension')
  if (factors.smoker > 0.1) avcFactors.push('Tabagisme')
  if (factors.diabetes > 0) avcFactors.push('Diabete')
  if (factors.age > 0.2) avcFactors.push('Age avance')
  if (!avcFactors.length) avcFactors.push('Facteurs generaux')

  const icRisk = Math.min(0.85, Math.max(0.02,
    baseRisk * 0.25 + factors.bmi * 0.20 + factors.age * 0.15 + factors.blood_pressure * 0.20 + factors.activity * 0.10 + factors.diabetes * 0.10
  ))
  const icFactors = []
  if (factors.bmi > 0.15) icFactors.push('Surpoids/Obesite')
  if (factors.blood_pressure > 0.15) icFactors.push('Hypertension')
  if (factors.activity > 0.1) icFactors.push('Sedentarite')
  if (factors.diabetes > 0) icFactors.push('Diabete')
  if (!icFactors.length) icFactors.push('Facteurs generaux')

  const acRisk = Math.min(0.80, Math.max(0.02,
    baseRisk * 0.20 + factors.blood_pressure * 0.25 + factors.cholesterol * 0.20 + factors.age * 0.15 + factors.smoker * 0.10
  ))
  const acFactors = []
  if (factors.blood_pressure > 0.15) acFactors.push('Hypertension')
  if (factors.cholesterol > 0.1) acFactors.push('Cholesterol eleve')
  if (factors.age > 0.2) acFactors.push('Age avance')
  if (factors.smoker > 0.1) acFactors.push('Tabagisme')
  if (!acFactors.length) acFactors.push('Facteurs generaux')

  const aaRisk = Math.min(0.70, Math.max(0.02,
    baseRisk * 0.15 + factors.age * 0.15 + factors.smoker * 0.15 + factors.family_history * 0.20 + factors.bpm * 0.10
  ))

  return [
    {
      name: 'Infarctus du Myocarde',
      probability: Math.round(miRisk * 1000) / 10,
      severity: miRisk > 0.3 ? 'high' : miRisk > 0.15 ? 'medium' : 'low',
      description: "Risque d'infarctus cardiaque base sur vos facteurs de risque actuels. L'infarctus survient lorsqu'un vaisseau sanguin irriguant le coeur est bloque.",
      factors: miFactors.slice(0, 4),
      prevention: ['Arreter de fumer', 'Maintenir un poids sain', 'Activite physique reguliere', 'Alimentation mediterraneenne'],
    },
    {
      name: 'Accident Vasculaire Cerebral',
      probability: Math.round(avcRisk * 1000) / 10,
      severity: avcRisk > 0.25 ? 'high' : avcRisk > 0.10 ? 'medium' : 'low',
      description: "Risque d'AVC base sur votre profil cardiovasculaire. L'AVC resulte d'une perturbation de l'irrigation sanguine du cerveau.",
      factors: avcFactors.slice(0, 4),
      prevention: ['Controle strict de la tension', 'Reduction du sel (<5g/jour)', 'Activite physique reguliere', 'Controle du cholesterol'],
    },
    {
      name: 'Insuffisance Cardiaque',
      probability: Math.round(icRisk * 1000) / 10,
      severity: icRisk > 0.25 ? 'high' : icRisk > 0.10 ? 'medium' : 'low',
      description: "Risque d'insuffisance cardiaque. Le coeur ne pompe plus le sang efficacement dans tout l'organisme.",
      factors: icFactors.slice(0, 4),
      prevention: ['Activite physique adaptee', 'Regime pauvre en sel', 'Surveillance du poids', 'Traitement de l\'hypertension'],
    },
    {
      name: 'Arteriopathie Coronarienne',
      probability: Math.round(acRisk * 1000) / 10,
      severity: acRisk > 0.25 ? 'high' : acRisk > 0.10 ? 'medium' : 'low',
      description: "Risque de maladie des arteres coronaires. Les arteres alimentant le coeur se retrecissent a cause de plaques d'atheromes.",
      factors: acFactors.slice(0, 4),
      prevention: ['Alimentation riche en omega-3', 'Arret du tabac', 'Activite physique reguliere', 'Controle du cholesterol'],
    },
    {
      name: 'Arythmie Cardiaque',
      probability: Math.round(aaRisk * 1000) / 10,
      severity: aaRisk > 0.15 ? 'medium' : 'low',
      description: "Risque d'arythmie. Le rythme cardiaque peut etre irregulier, trop rapide ou trop lent.",
      factors: ['Facteurs genetiques', 'Stress', 'Tabagisme', 'Cafeine'].slice(0, 3),
      prevention: ['Reduire la cafeine', 'Gestion du stress', 'Eviter l\'alcool', 'Sommeil regulier'],
    },
  ].sort((a, b) => b.probability - a.probability)
}

export function generateRecommendations(userData, measurementHistory) {
  const p = buildProfile(userData, measurementHistory)
  const hs = generateHealthScore(userData, measurementHistory)
  const factors = hs.risk_factors
  const bmi = hs.bmi

  const recs = []

  if (p.smoker !== 'no') {
    const priority = p.smoker === 'regular' ? 'high' : 'medium'
    const reduction = p.smoker === 'regular' ? 50 : 30
    recs.push({
      category: 'tabac',
      title: 'Arret du tabac',
      description: `L'arret du tabac reduit votre risque cardiaque de ${reduction}% en 1 an. Des programmes d'accompagnement existent.`,
      priority,
      impact: Math.round(reduction * 0.3 * 10) / 10,
      actions: ['Consultez un tabacologue', 'Envisagez les substituts nicotiniques', 'Identifiez vos triggers', 'Rejoignez un groupe de soutien'],
    })
  }

  if (bmi > 25) {
    const targetBmi = 22
    const weightToLose = Math.round((p.weight - (targetBmi * (p.height / 100) ** 2)) * 10) / 10
    const priority = bmi > 30 ? 'high' : 'medium'
    recs.push({
      category: 'poids',
      title: 'Gestion du poids',
      description: `Votre IMC est de ${bmi}. Perdre ${Math.max(0, weightToLose)} kg ameliorerait significativement votre sante cardiaque.`,
      priority,
      impact: Math.round(Math.min(15, (bmi - 25) * 1.5) * 10) / 10,
      actions: ['Objectif IMC : 18.5-25', `Poids cible : ${Math.round(targetBmi * (p.height / 100) ** 2)} kg`, 'Reduction de 500 kcal/jour', 'Activite physique 30 min/jour'],
    })
  }

  if (p.activity_level === 'sedentary' || p.activity_level === 'light') {
    const priority = p.activity_level === 'sedentary' ? 'high' : 'medium'
    recs.push({
      category: 'activite',
      title: 'Activite physique',
      description: "L'activite physique reguliere reduit le risque cardiovasculaire de 30%. Commencez par 15 min de marche rapide.",
      priority,
      impact: 12.0,
      actions: ['Marche rapide 30 min/jour', 'Escaliers au lieu de l\'ascenseur', 'Etirements 10 min/mat', 'Objectif : 150 min/semaine'],
    })
  }

  if (p.systolic && p.systolic >= 130) {
    const priority = p.systolic >= 140 ? 'high' : 'medium'
    const reduction = p.systolic >= 140 ? 5 : 3
    recs.push({
      category: 'tension',
      title: 'Controle de la tension',
      description: `Votre tension (${p.systolic}/${p.diastolic}) est elevee. Reduisez le sel et consultez un medecin.`,
      priority,
      impact: reduction,
      actions: ['Limiter le sel a <5g/jour', 'Eviter les plats transformes', 'Consulter un cardiologue', 'Surveiller quotidiennement'],
    })
  }

  if (p.stress_level > 6) {
    recs.push({
      category: 'stress',
      title: 'Gestion du stress',
      description: 'Le stress chronique augmente le cortisol, eleve la tension et fragilise les arteres. La meditation aide significativement.',
      priority: 'medium',
      impact: 5.0,
      actions: ['Meditation 10 min/jour', 'Respiration profonde 4-7-8', 'Activites de relaxation', 'Sommeil regulier'],
    })
  }

  if (p.sleep_hours < 6 || p.sleep_hours > 10) {
    recs.push({
      category: 'sommeil',
      title: 'Sommeil reparateur',
      description: `Vous dormez ${p.sleep_hours}h. Visez 7-8h de sommeil pour la sante cardiaque.`,
      priority: 'medium',
      impact: 4.0,
      actions: ['Horaires reguliers', 'Eviter les ecrans 1h avant', 'Chambre fraiche et sombre', 'Eviter cafeine apres 14h'],
    })
  }

  if (p.cholesterol && p.cholesterol > 240) {
    const priority = p.cholesterol > 280 ? 'high' : 'medium'
    recs.push({
      category: 'cholesterol',
      title: 'Reduction du cholesterol',
      description: `Votre cholesterol (${p.cholesterol} mg/dL) est eleve. Une alimentation adaptee peut reduire de 20%.`,
      priority,
      impact: 8.0,
      actions: ['Augmenter les fibres (legumes, cereales)', 'Poissons gras 2x/semaine', 'Eviter les graisses saturees', 'Consulter pour traitement si necessaire'],
    })
  }

  if (p.diabetes) {
    recs.push({
      category: 'diabete',
      title: 'Controle du diabete',
      description: 'Le diabete multiplie le risque cardiaque par 2. Un controle strict de la glycemie est essentiel.',
      priority: 'high',
      impact: 10.0,
      actions: ['Surveiller la glycemie', 'Regime equilibre', 'Activite physique reguliere', 'Suivi medical rapproche'],
    })
  }

  if (p.alcohol === 'moderate' || p.alcohol === 'heavy') {
    const priority = p.alcohol === 'heavy' ? 'high' : 'medium'
    recs.push({
      category: 'alcool',
      title: "Reduction de l'alcool",
      description: "L'alcool eleve la tension et le risque d'arythmie. Reduisez a 1 verre/jour maximum.",
      priority,
      impact: 5.0,
      actions: ['Maximum 1 verre/jour', 'Jours sans alcool', 'Alternatives : eau, the', 'Consulter si dependance'],
    })
  }

  recs.push({
    category: 'alimentation',
    title: 'Alimentation cardio-protectrice',
    description: 'Le regime mediterraneen reduit le risque cardiovasculaire de 30%. Riche en omega-3, fibres et antioxydants.',
    priority: 'medium',
    impact: 8.0,
    actions: ['5 fruits et legumes/jour', 'Poissons gras 2x/semaine', "Huile d'olive comme source principale", 'Reduire viande rouge et charcuterie'],
  })

  if (p.age > 50) {
    recs.push({
      category: 'suivi',
      title: 'Bilan cardiovasculaire',
      description: 'Apres 50 ans, un bilan cardiaque annuel est recommande pour detecter precocement les problemes.',
      priority: 'high',
      impact: 6.0,
      actions: ['Consultation cardiologique annuelle', 'ECG de repos', 'Bilan sanguin complet', "Test d'effort si necessaire"],
    })
  }

  const bpmAnalysis = hs.bpm_analysis
  if (bpmAnalysis && (bpmAnalysis.status === 'tachycardia' || bpmAnalysis.status === 'tachycardia_mild')) {
    recs.push({
      category: 'bpm',
      title: 'Surveillance de la frequence cardiaque',
      description: `Votre BPM moyen est de ${bpmAnalysis.avg_bpm}. Mesurez-vous regulierement au repos.`,
      priority: 'medium',
      impact: 3.0,
      actions: ['Mesure au repos le matin', 'Eviter cafeine avant mesure', 'Enregistrer les resultats', 'Consulter si persistant'],
    })
  }

  recs.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 }
    return order[a.priority] - order[b.priority]
  })

  return recs.slice(0, 8)
}

export function fullAnalysis(userData, measurementHistory) {
  const healthScore = generateHealthScore(userData, measurementHistory)
  const diseases = predictDiseases(userData, measurementHistory, healthScore)
  const recommendations = generateRecommendations(userData, measurementHistory)

  return {
    health_score: healthScore,
    diseases,
    recommendations,
    summary: {
      risk_level: healthScore.label,
      top_risk: diseases[0]?.name || 'Aucun',
      top_risk_probability: diseases[0]?.probability || 0,
      critical_recommendations: recommendations.filter((r) => r.priority === 'high').length,
      total_recommendations: recommendations.length,
    },
  }
}

export const ACTIVITY_LEVELS = {
  sedentary: [72, 84],
  light: [68, 80],
  moderate: [60, 74],
  active: [50, 66],
}

export function getAgeZone(age) {
  const ZONES = [
    [18, 30, 64, 76],
    [31, 40, 66, 78],
    [41, 50, 68, 80],
    [51, 60, 70, 82],
    [61, 200, 72, 84],
  ]
  const zone = ZONES.find((a) => age >= a[0] && age <= a[1])
  return zone || ZONES[0]
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
      message: 'Les ' + values.length + ' dernieres mesures sont toutes a ' + values[0] + ' BPM.',
      tip: 'Assurez-vous que votre doigt couvre bien lentille et flash.',
    })
  }

  if (values.length >= 3) {
    const m = values.reduce((a, b) => a + b) / values.length
    const variance = values.reduce((s, v) => s + (v - m) ** 2, 0) / values.length
    const std = Math.sqrt(variance)
    if (std < 1)
      anomalies.push({
        type: 'suspicious',
        severity: 'medium',
        title: 'Variation anormalement faible',
        message: 'Mesures trop constantes (' + std.toFixed(1) + ' BPM de variation).',
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
          message: 'Votre pouls (' + lastBpm + ' BPM) est inferieur a la normale.',
          tip: "Si vous etes sportif, c'est normal.",
        })
      else if (lastBpm > ageZone[3] + 15)
        anomalies.push({
          type: 'insight',
          severity: 'warning',
          title: 'Frequence elevee pour votre age',
          message: 'Votre pouls (' + lastBpm + ' BPM) est au-dessus de la moyenne.',
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
      const r = { no: 0, former: 5, occasional: 10, regular: 20 }[userData.smoker] || 0
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
      if (range && history[0].bpm > range[1] + 5 && userData.activityLevel === 'active')
        anomalies.push({
          type: 'insight',
          severity: 'info',
          title: 'BPM plus eleve que prevu',
          message: 'Pour votre niveau, le pouls est entre ' + range[0] + '-' + range[1] + ' BPM.',
          tip: 'Mesurez-vous au repos.',
        })
    }
  }

  if (history.length >= 3) {
    const stable = history.slice(0, 3).filter((e, i, a) => i === 0 || Math.abs(e.bpm - a[i - 1].bpm) < 3).length
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
