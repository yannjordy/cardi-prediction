const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function analyzeHealth(userData, measurementHistory = []) {
  const bpmHistory = measurementHistory.slice(0, 20).map((e) => e.bpm)

  const payload = {
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
    bpm_history: bpmHistory,
  }

  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`)
  }

  return response.json()
}
