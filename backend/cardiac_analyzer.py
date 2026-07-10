import math
import statistics
from dataclasses import dataclass, field
from typing import Optional, List


@dataclass
class UserProfile:
    age: int
    gender: str
    height: float
    weight: float
    systolic: Optional[float] = None
    diastolic: Optional[float] = None
    smoker: str = "no"
    family_history: str = "none"
    activity_level: str = "moderate"
    diabetes: bool = False
    cholesterol: Optional[float] = None
    stress_level: int = 5
    sleep_hours: float = 7.0
    alcohol: str = "none"
    bpm_history: list = field(default_factory=list)


def calculate_bmi(weight: float, height: float) -> float:
    if height <= 0:
        return 0
    return round(weight / ((height / 100) ** 2), 1)


def bmi_category(bmi: float) -> str:
    if bmi < 18.5:
        return "underweight"
    if bmi < 25:
        return "normal"
    if bmi < 30:
        return "overweight"
    return "obese"


def bmi_risk_score(bmi: float) -> float:
    if bmi < 18.5:
        return 0.15
    if bmi < 22:
        return 0.0
    if bmi < 25:
        return 0.05
    if bmi < 27:
        return 0.15
    if bmi < 30:
        return 0.25
    if bmi < 35:
        return 0.35
    return 0.45


def age_risk_score(age: int, gender: str) -> float:
    if gender == "male":
        if age < 30:
            return 0.0
        if age < 40:
            return 0.05
        if age < 50:
            return 0.15
        if age < 60:
            return 0.30
        if age < 70:
            return 0.45
        return 0.60
    else:
        if age < 30:
            return 0.0
        if age < 40:
            return 0.02
        if age < 50:
            return 0.08
        if age < 60:
            return 0.20
        if age < 70:
            return 0.35
        return 0.50


def blood_pressure_risk(systolic: float, diastolic: float) -> dict:
    if systolic < 120 and diastolic < 80:
        return {"category": "optimal", "score": 0.0, "label": "Optimale"}
    if systolic < 130 and diastolic < 85:
        return {"category": "normal", "score": 0.05, "label": "Normale"}
    if systolic < 140 and diastolic < 90:
        return {"category": "elevated", "score": 0.15, "label": "Elevee"}
    if systolic < 160 and diastolic < 100:
        return {"category": "stage1", "score": 0.30, "label": "Hypertension stade 1"}
    if systolic < 180 and diastolic < 110:
        return {"category": "stage2", "score": 0.50, "label": "Hypertension stade 2"}
    return {"category": "crisis", "score": 0.70, "label": "Crise hypertensive"}


def smoker_risk(smoker_status: str) -> float:
    risks = {
        "no": 0.0,
        "former": 0.10,
        "occasional": 0.25,
        "regular": 0.45,
    }
    return risks.get(smoker_status, 0.0)


def family_history_risk(history: str) -> float:
    risks = {
        "none": 0.0,
        "siblings": 0.10,
        "parents": 0.15,
        "both": 0.25,
    }
    return risks.get(history, 0.0)


def activity_risk(level: str) -> float:
    risks = {
        "active": -0.05,
        "moderate": 0.0,
        "light": 0.10,
        "sedentary": 0.25,
    }
    return risks.get(level, 0.0)


def diabetes_risk(has_diabetes: bool) -> float:
    return 0.25 if has_diabetes else 0.0


def cholesterol_risk(cholesterol: Optional[float]) -> float:
    if cholesterol is None:
        return 0.05
    if cholesterol < 200:
        return 0.0
    if cholesterol < 240:
        return 0.10
    if cholesterol < 280:
        return 0.20
    return 0.35


def stress_risk(level: int) -> float:
    return max(0, (level - 5) * 0.04)


def sleep_risk(hours: float) -> float:
    if 7 <= hours <= 9:
        return 0.0
    if 6 <= hours < 7 or 9 < hours <= 10:
        return 0.08
    if 5 <= hours < 6 or 10 < hours <= 11:
        return 0.15
    return 0.25


def alcohol_risk(level: str) -> float:
    risks = {
        "none": 0.0,
        "light": 0.03,
        "moderate": 0.10,
        "heavy": 0.30,
    }
    return risks.get(level, 0.0)


def bpm_risk_analysis(bpm_history: list) -> dict:
    if not bpm_history:
        return {"score": 0.05, "status": "no_data", "label": "Aucune donnee"}

    recent = bpm_history[:10]
    avg_bpm = statistics.mean(recent)
    std_bpm = statistics.stdev(recent) if len(recent) > 1 else 0
    trend = 0
    if len(recent) >= 3:
        first_half = statistics.mean(recent[len(recent) // 2:])
        second_half = statistics.mean(recent[:len(recent) // 2])
        trend = second_half - first_half

    score = 0.0
    status = "normal"
    label = "Frequence normale"

    if avg_bpm < 50:
        score = 0.20
        status = "bradycardia"
        label = "Bradycardie"
    elif avg_bpm < 60:
        score = 0.05
        status = "low_normal"
        label = "Frequence basse normale"
    elif avg_bpm <= 80:
        score = 0.0
        status = "optimal"
        label = "Optimale"
    elif avg_bpm <= 100:
        score = 0.08
        status = "elevated"
        label = "Frequence elevee"
    elif avg_bpm <= 120:
        score = 0.20
        status = "tachycardia_mild"
        label = "Tachycardie legerement elevee"
    else:
        score = 0.40
        status = "tachycardia"
        label = "Tachycardie"

    if std_bpm > 15:
        score += 0.10
    elif std_bpm < 2 and len(recent) >= 5:
        score += 0.05

    if trend > 5:
        score += 0.05
    elif trend < -5:
        score -= 0.03

    return {
        "score": max(0, min(1, score)),
        "status": status,
        "label": label,
        "avg_bpm": round(avg_bpm, 1),
        "std_bpm": round(std_bpm, 1),
        "trend": round(trend, 1),
        "measurements": len(bpm_history),
    }


def calculate_health_score(profile: UserProfile) -> dict:
    bmi = calculate_bmi(profile.weight, profile.height)
    bmi_cat = bmi_category(bmi)

    factors = {
        "age": age_risk_score(profile.age, profile.gender),
        "bmi": bmi_risk_score(bmi),
        "smoker": smoker_risk(profile.smoker),
        "family_history": family_history_risk(profile.family_history),
        "activity": activity_risk(profile.activity_level),
        "diabetes": diabetes_risk(profile.diabetes),
        "cholesterol": cholesterol_risk(profile.cholesterol),
        "stress": stress_risk(profile.stress_level),
        "sleep": sleep_risk(profile.sleep_hours),
        "alcohol": alcohol_risk(profile.alcohol),
    }

    bp_result = None
    if profile.systolic and profile.diastolic:
        bp_result = blood_pressure_risk(profile.systolic, profile.diastolic)
        factors["blood_pressure"] = bp_result["score"]

    bpm_result = bpm_risk_analysis(profile.bpm_history)
    factors["bpm"] = bpm_result["score"]

    total_risk = sum(factors.values())
    max_possible = len(factors) * 0.5
    risk_ratio = min(total_risk / max_possible, 1.0)

    score = max(0, min(100, round(100 - (risk_ratio * 100))))

    if score >= 85:
        grade = "A"
        label = "Excellente"
        color = "#10b981"
        advice = "Votre sante cardiovasculaire est excellente. Continuez vos bonnes habitudes !"
    elif score >= 70:
        grade = "B"
        label = "Bonne"
        color = "#3b82f6"
        advice = "Votre sante cardiaque est bonne. Quelques ameliorations sont possibles."
    elif score >= 55:
        grade = "C"
        label = "Moyenne"
        color = "#f59e0b"
        advice = "Des facteurs de risque sont presents. Une consultation medicale est recommandee."
    elif score >= 40:
        grade = "D"
        label = "Attention"
        color = "#f97316"
        advice = "Plusieurs facteurs de risque importants. Consultez un cardiologue rapidement."
    else:
        grade = "E"
        label = "Critique"
        color = "#ef4444"
        advice = "Risque cardiovasculaire eleve. Consultation medicale urgente recommandee."

    return {
        "score": score,
        "grade": grade,
        "label": label,
        "color": color,
        "advice": advice,
        "bmi": bmi,
        "bmi_category": bmi_cat,
        "risk_factors": factors,
        "blood_pressure": bp_result,
        "bpm_analysis": bpm_result,
    }


def predict_diseases(profile: UserProfile, health_score: dict) -> list:
    base_risk = (100 - health_score["score"]) / 100
    factors = health_score["risk_factors"]

    diseases = []

    mi_risk = (
        base_risk * 0.35
        + factors.get("age", 0) * 0.20
        + factors.get("smoker", 0) * 0.25
        + factors.get("bmi", 0) * 0.10
        + factors.get("blood_pressure", 0) * 0.15
        + factors.get("cholesterol", 0) * 0.10
    )
    mi_risk = min(0.95, max(0.02, mi_risk))
    mi_factors = []
    if factors.get("smoker", 0) > 0.1:
        mi_factors.append("Tabagisme")
    if factors.get("blood_pressure", 0) > 0.15:
        mi_factors.append("Hypertension")
    if factors.get("age", 0) > 0.2:
        mi_factors.append("Age avance")
    if factors.get("bmi", 0) > 0.15:
        mi_factors.append("Surpoids/Obesite")
    if factors.get("cholesterol", 0) > 0.1:
        mi_factors.append("Cholesterolelevee")
    if factors.get("diabetes", 0) > 0:
        mi_factors.append("Diabete")
    if not mi_factors:
        mi_factors.append("Facteurs generaux")

    diseases.append({
        "name": "Infarctus du Myocarde",
        "probability": round(mi_risk * 100, 1),
        "severity": "high" if mi_risk > 0.3 else "medium" if mi_risk > 0.15 else "low",
        "description": "Risque d'infarctus cardiaque base sur vos facteurs de risque actuels. L'infarctus survient lorsqu'un vaisseau sanguin irriguant le coeur est bloque.",
        "factors": mi_factors[:4],
        "prevention": [
            "Arreter de fumer",
            "Maintenir un poids sain",
            "Activite physique reguliere",
            "Alimentation mediterraneenne",
        ],
    })

    avc_risk = (
        base_risk * 0.30
        + factors.get("blood_pressure", 0) * 0.30
        + factors.get("age", 0) * 0.15
        + factors.get("smoker", 0) * 0.15
        + factors.get("diabetes", 0) * 0.10
    )
    avc_risk = min(0.90, max(0.02, avc_risk))
    avc_factors = []
    if factors.get("blood_pressure", 0) > 0.15:
        avc_factors.append("Hypertension")
    if factors.get("smoker", 0) > 0.1:
        avc_factors.append("Tabagisme")
    if factors.get("diabetes", 0) > 0:
        avc_factors.append("Diabete")
    if factors.get("age", 0) > 0.2:
        avc_factors.append("Age avance")
    if not avc_factors:
        avc_factors.append("Facteurs generaux")

    diseases.append({
        "name": "Accident Vasculaire Cerebral",
        "probability": round(avc_risk * 100, 1),
        "severity": "high" if avc_risk > 0.25 else "medium" if avc_risk > 0.10 else "low",
        "description": "Risque d'AVC base sur votre profil cardiovasculaire. L'AVC resulte d'une perturbation de l'irrigation sanguine du cerveau.",
        "factors": avc_factors[:4],
        "prevention": [
            "Controle strict de la tension",
            "Reduction du sel (<5g/jour)",
            "Activite physique reguliere",
            "Controle du cholesterol",
        ],
    })

    ic_risk = (
        base_risk * 0.25
        + factors.get("bmi", 0) * 0.20
        + factors.get("age", 0) * 0.15
        + factors.get("blood_pressure", 0) * 0.20
        + factors.get("activity", 0) * 0.10
        + factors.get("diabetes", 0) * 0.10
    )
    ic_risk = min(0.85, max(0.02, ic_risk))
    ic_factors = []
    if factors.get("bmi", 0) > 0.15:
        ic_factors.append("Surpoids/Obesite")
    if factors.get("blood_pressure", 0) > 0.15:
        ic_factors.append("Hypertension")
    if factors.get("activity", 0) > 0.1:
        ic_factors.append("Sedentarite")
    if factors.get("diabetes", 0) > 0:
        ic_factors.append("Diabete")
    if not ic_factors:
        ic_factors.append("Facteurs generaux")

    diseases.append({
        "name": "Insuffisance Cardiaque",
        "probability": round(ic_risk * 100, 1),
        "severity": "high" if ic_risk > 0.25 else "medium" if ic_risk > 0.10 else "low",
        "description": "Risque d'insuffisance cardiaque. Le coeur ne pompe plus le sang efficacement dans tout l'organisme.",
        "factors": ic_factors[:4],
        "prevention": [
            "Activite physique adaptee",
            "Regime pauvre en sel",
            "Surveillance du poids",
            "Traitement de l'hypertension",
        ],
    })

    ac_risk = (
        base_risk * 0.20
        + factors.get("blood_pressure", 0) * 0.25
        + factors.get("cholesterol", 0) * 0.20
        + factors.get("age", 0) * 0.15
        + factors.get("smoker", 0) * 0.10
    )
    ac_risk = min(0.80, max(0.02, ac_risk))
    ac_factors = []
    if factors.get("blood_pressure", 0) > 0.15:
        ac_factors.append("Hypertension")
    if factors.get("cholesterol", 0) > 0.1:
        ac_factors.append("Cholesterolelevee")
    if factors.get("age", 0) > 0.2:
        ac_factors.append("Age avance")
    if factors.get("smoker", 0) > 0.1:
        ac_factors.append("Tabagisme")
    if not ac_factors:
        ac_factors.append("Facteurs generaux")

    diseases.append({
        "name": "Arteriopathie Coronarienne",
        "probability": round(ac_risk * 100, 1),
        "severity": "high" if ac_risk > 0.25 else "medium" if ac_risk > 0.10 else "low",
        "description": "Risque de maladie des arteres coronaires. Les arteres alimentant le coeur se retrecissent a cause de plaques d'atheromes.",
        "factors": ac_factors[:4],
        "prevention": [
            "Alimentation riche en omega-3",
            "Arret du tabac",
            "Activite physique reguliere",
            "Controle du cholesterol",
        ],
    })

    aa_risk = (
        base_risk * 0.15
        + factors.get("age", 0) * 0.15
        + factors.get("smoker", 0) * 0.15
        + factors.get("family_history", 0) * 0.20
        + factors.get("bpm", 0) * 0.10
    )
    aa_risk = min(0.70, max(0.02, aa_risk))

    diseases.append({
        "name": "Arythmie Cardiaque",
        "probability": round(aa_risk * 100, 1),
        "severity": "medium" if aa_risk > 0.15 else "low",
        "description": "Risque d'arythmie. Le rythme cardiaque peut etre irregulier, trop rapide ou trop lent.",
        "factors": [
            "Facteurs genetiques",
            "Stress",
            "Tabagisme",
            "Caffeine",
        ][:3],
        "prevention": [
            "Reduire la cafeine",
            "Gestion du stress",
            "Eviter l'alcool",
            "Sommeil regulier",
        ],
    })

    return sorted(diseases, key=lambda d: d["probability"], reverse=True)


def generate_recommendations(profile: UserProfile, health_score: dict) -> list:
    recs = []
    factors = health_score["risk_factors"]
    bmi = health_score["bmi"]

    if profile.smoker != "no":
        priority = "high" if profile.smoker == "regular" else "medium"
        reduction = 50 if profile.smoker == "regular" else 30
        recs.append({
            "category": "tabac",
            "title": "Arret du tabac",
            "description": f"L'arret du tabac reduit votre risque cardiaque de {reduction}% en 1 an. Des programmes d'accompagnement existent.",
            "priority": priority,
            "impact": round(reduction * 0.3, 1),
            "actions": [
                "Consultez un tabacologue",
                "Envisagez les substituts nicotiniques",
                "Identifiez vos triggers",
                "Rejoignez un groupe de soutien",
            ],
        })

    if bmi > 25:
        target_bmi = 22
        weight_to_lose = round(profile.weight - (target_bmi * (profile.height / 100) ** 2), 1)
        priority = "high" if bmi > 30 else "medium"
        recs.append({
            "category": "poids",
            "title": "Gestion du poids",
            "description": f"Votre IMC est de {bmi}. Perdre {max(0, weight_to_lose)} kg ameliorerait significativement votre sante cardiaque.",
            "priority": priority,
            "impact": round(min(15, (bmi - 25) * 1.5), 1),
            "actions": [
                "Objectif IMC : 18.5-25",
                f"Poids cible : {round(target_bmi * (profile.height / 100) ** 2, 0)} kg",
                "Reduction de 500 kcal/jour",
                "Activite physique 30 min/jour",
            ],
        })

    if profile.activity_level in ["sedentary", "light"]:
        priority = "high" if profile.activity_level == "sedentary" else "medium"
        recs.append({
            "category": "activite",
            "title": "Activite physique",
            "description": "L'activite physique reguliere reduit le risque cardiovasculaire de 30%. Commencez par 15 min de marche rapide.",
            "priority": priority,
            "impact": 12.0,
            "actions": [
                "Marche rapide 30 min/jour",
                "Escaliers au lieu de l'ascenseur",
                "Etirements 10 min/mat",
                "Objectif : 150 min/semaine",
            ],
        })

    if profile.systolic and profile.systolic >= 130:
        priority = "high" if profile.systolic >= 140 else "medium"
        reduction = 5 if profile.systolic >= 140 else 3
        recs.append({
            "category": "tension",
            "title": "Controle de la tension",
            "description": f"Votre tension ({profile.systolic}/{profile.diastolic}) est elevee. Reduisez le sel et consultez un medecin.",
            "priority": priority,
            "impact": reduction,
            "actions": [
                "Limiter le sel a <5g/jour",
                "Eviter les plats transformes",
                "Consulter un cardiologue",
                "Surveiller quotidiennement",
            ],
        })

    if profile.stress_level > 6:
        recs.append({
            "category": "stress",
            "title": "Gestion du stress",
            "description": "Le stress chronique augmente le cortisol, eleve la tension et fragilise les arteres. La meditation aide significativement.",
            "priority": "medium",
            "impact": 5.0,
            "actions": [
                "Meditation 10 min/jour",
                "Respiration profonde 4-7-8",
                "Activites de relaxation",
                "Sommeil regulier",
            ],
        })

    if profile.sleep_hours < 6 or profile.sleep_hours > 10:
        recs.append({
            "category": "sommeil",
            "title": "Sommeil reparateur",
            "description": f"Vous dormez {profile.sleep_hours}h. Visez 7-8h de sommeil pour la sante cardiaque.",
            "priority": "medium",
            "impact": 4.0,
            "actions": [
                "Horaires reguliers",
                "Eviter les ecrans 1h avant",
                "Chambre fraiche et sombre",
                "Eviter cafeine apres 14h",
            ],
        })

    if profile.cholesterol and profile.cholesterol > 240:
        recs.append({
            "category": "cholesterol",
            "title": "Reduction du cholesterol",
            "description": f"Votre cholesterol ({profile.cholesterol} mg/dL) est eleve. Une alimentation adaptee peut reduire de 20%.",
            "priority": "high" if profile.cholesterol > 280 else "medium",
            "impact": 8.0,
            "actions": [
                "Augmenter les fibres (legumes, cereales)",
                "Poissons gras 2x/semaine",
                "Eviter les graisses saturées",
                "Consulter pour traitement si necessaire",
            ],
        })

    if profile.diabetes:
        recs.append({
            "category": "diabete",
            "title": "Controle du diabete",
            "description": "Le diabete multiplie le risque cardiaque par 2. Un controle strict de la glycemie est essentiel.",
            "priority": "high",
            "impact": 10.0,
            "actions": [
                "Surveiller la glycemie",
                "Regime equilibre",
                "Activite physique reguliere",
                "Suivi medical rapproche",
            ],
        })

    if profile.alcohol in ["moderate", "heavy"]:
        recs.append({
            "category": "alcool",
            "title": "Reduction de l'alcool",
            "description": "L'alcool eleve la tension et le risque d'arythmie. Reduisez a 1 verre/jour maximum.",
            "priority": "high" if profile.alcohol == "heavy" else "medium",
            "impact": 5.0,
            "actions": [
                "Maximum 1 verre/jour",
                "Jours sans alcool",
                "Alternatives : eau, the",
                "Consulter si dependance",
            ],
        })

    recs.append({
        "category": "alimentation",
        "title": "Alimentation cardio-protectrice",
        "description": "Le regime mediterraneen reduit le risque cardiovasculaire de 30%. Rich en omega-3, fibres et antioxydants.",
        "priority": "medium",
        "impact": 8.0,
        "actions": [
            "5 fruits et legumes/jour",
            "Poissons gras 2x/semaine",
            "Huile d'olive comme source principale",
            "Reduire viande rouge et charcuterie",
        ],
    })

    if profile.age > 50:
        recs.append({
            "category": "suivi",
            "title": "Bilan cardiovasculaire",
            "description": "Apres 50 ans, un bilan cardiaque annuel est recommande pour detecter precocement les problemes.",
            "priority": "high",
            "impact": 6.0,
            "actions": [
                "Consultation cardiologique annuelle",
                "ECG de repos",
                "Bilan sanguin complet",
                "Test d'effort si necessaire",
            ],
        })

    bpm_analysis = health_score.get("bpm_analysis", {})
    if bpm_analysis.get("status") in ["tachycardia", "tachycardia_mild"]:
        recs.append({
            "category": "bpm",
            "title": "Surveillance de la frequence cardiaque",
            "description": f"Votre BPM moyen est de {bpm_analysis.get('avg_bpm', '--')}. Mesurez-vous regulierement au repos.",
            "priority": "medium",
            "impact": 3.0,
            "actions": [
                "Mesure au repos le matin",
                "Eviter cafeine avant mesure",
                "Enregistrer les resultats",
                "Consulter si persistant",
            ],
        })

    recs.sort(key=lambda r: {"high": 0, "medium": 1, "low": 2}[r["priority"]])

    return recs[:8]


def full_analysis(profile: UserProfile) -> dict:
    health_score = calculate_health_score(profile)
    diseases = predict_diseases(profile, health_score)
    recommendations = generate_recommendations(profile, health_score)

    return {
        "health_score": health_score,
        "diseases": diseases,
        "recommendations": recommendations,
        "summary": {
            "risk_level": health_score["label"],
            "top_risk": diseases[0]["name"] if diseases else "Aucun",
            "top_risk_probability": diseases[0]["probability"] if diseases else 0,
            "critical_recommendations": len(
                [r for r in recommendations if r["priority"] == "high"]
            ),
            "total_recommendations": len(recommendations),
        },
    }
