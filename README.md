# 🫀 Cardi - Application de Santé Cardiaque

Application React complète de prédiction et suivi de santé cardiaque.

## 📋 Pages incluses

| Page | Route | Description |
|------|-------|-------------|
| Landing | `/` | Page d'accueil / présentation |
| Connexion | `/connexion` | Login email + Google OAuth |
| Inscription | `/inscription` | Register avec validation |
| Onboarding | `/info` | 8 étapes de profil de santé |
| Accueil | `/home` | Mesure BPM par caméra (PPG) |
| Activité | `/activite` | Articles santé, recettes, sommeil |
| Prédiction | `/prediction` | IA prédiction cardiaque + graphiques |
| Profil | `/profil` | Données personnelles + paramètres |

## 🚀 Installation

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement
npm run dev

# 3. Build production
npm run build
```

## ⚙️ Configuration Supabase

Ouvre `src/utils/supabase.js` et remplace les clés :

```js
const SUPABASE_URL = 'https://TON-PROJET.supabase.co'
const SUPABASE_ANON_KEY = 'ta-cle-anon'
```

### Tables Supabase recommandées

```sql
-- Table profils utilisateurs
create table profiles (
  id uuid references auth.users primary key,
  full_name text,
  age int,
  gender text,
  height float,
  weight float,
  bmi float,
  activity_level text,
  smoker text,
  family_history text,
  updated_at timestamp default now()
);

-- Table mesures BPM
create table measurements (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users,
  bpm int not null,
  quality text,
  duration float,
  created_at timestamp default now()
);
```

## 🛠️ Stack technique

- **React 18** + **React Router v6**
- **Vite** (bundler ultra-rapide)
- **Supabase** (auth + base de données)
- **CSS Variables** (dark/light mode)
- **WebRTC / getUserMedia** (accès caméra pour mesure BPM)
- **PPG (Photoplethysmography)** pour la détection du pouls

## 📱 Fonctionnalités

- ✅ Dark / Light mode
- ✅ Mesure du pouls par caméra (PPG)
- ✅ Historique des mesures (localStorage)
- ✅ Authentification Supabase (email + Google)
- ✅ Prédiction IA du risque cardiovasculaire
- ✅ Score de santé cardiaque
- ✅ Onboarding en 8 étapes
- ✅ Bouton d'urgence configurable
- ✅ Navigation bottom bar
- ✅ Animations et transitions fluides
- ✅ 100% responsive mobile

## 🔐 Auth Google OAuth

Dans le dashboard Supabase :
1. Authentication → Providers → Google → Enable
2. Ajoute ton Client ID et Secret Google
3. Redirige vers : `https://TON-PROJET.supabase.co/auth/v1/callback`
