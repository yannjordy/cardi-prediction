import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import BottomNav from '../components/BottomNav'

const IMG = 'https://images.unsplash.com/photo-'
const YT = 'https://www.youtube.com/embed/'

const articles = [
  {
    icon: 'heart', bg: 'linear-gradient(135deg,#ec4899,#db2777)', title: 'Fréquence Cardiaque', count: '6 Perspectives',
    image: IMG + '1571013883455-7e2d1f6c7a6f?w=800&h=400&fit=crop',
    youtube: YT + 'd-3Wjc7zXjw',
    tips: [
      { label: 'Au repos', value: '60-100 BPM', icon: 'moon' },
      { label: ' Sport modéré', value: '100-140 BPM', icon: 'walk' },
      { label: ' Sport intense', value: '140-180 BPM', icon: 'run' },
    ],
    content: [
      'La fréquence cardiaque au repos normale se situe entre 60 et 100 battements par minute.',
      'Les sportifs peuvent avoir une fréquence plus basse (40-60 BPM), signe d\'un cœur efficace.',
      'Surveillez votre pouls chaque matin au réveil pour détecter d\'éventuelles anomalies.',
      'Une augmentation soudaine et persistante peut indiquer du stress, de la fatigue ou une infection.',
      'La variabilité cardiaque (HRV) est un excellent indicateur de récupération et de forme physique.',
      'Un pouls irrégulier peut être le signe d\'une fibrillation atriale - consultez si persistant.',
    ],
    advice: 'Mesurez votre pouls chaque matin avant de vous lever. Notez les variations et consultez si vous observez des changements brusques et durables.',
  },
  {
    icon: 'users', bg: 'linear-gradient(135deg,#60a5fa,#3b82f6)', title: 'Déclencheurs De Maladies', count: '8 Perspectives',
    image: IMG + '1578496781985-5e4b4c2d9c3e?w=800&h=400&fit=crop',
    youtube: YT + 'OCDZzVj9C1E',
    content: [
      'Le stress chronique est l\'un des principaux déclencheurs de maladies cardiovasculaires.',
      'Une alimentation riche en sel, sucre et graisses saturées augmente significativement les risques.',
      'Le tabagisme endommage les parois artérielles et favorise la formation de plaques d\'athérome.',
      'La sédentarité affaiblit le muscle cardiaque et réduit la circulation sanguine.',
      'L\'hypertension non contrôlée est un facteur de risque majeur silencieux.',
      'Le diabète non traité double le risque de maladies cardiaques.',
      'L\'obésité, surtout abdominale, est fortement corrélée aux problèmes cardiovasculaires.',
      'La pollution atmosphérique peut déclencher des événements cardiaques chez les personnes vulnérables.',
    ],
    advice: 'Identifiez vos déclencheurs personnels. Tenez un journal pour repérer les liens entre votre mode de vie et vos symptômes.',
  },
  {
    icon: 'check', bg: 'linear-gradient(135deg,#4ade80,#22c55e)', title: 'Santé Mentale', count: '7 Perspectives',
    image: IMG + '1499204707359-aa7c7d5f7a6b?w=800&h=400&fit=crop',
    youtube: YT + 'ssss7V1_eyA',
    content: [
      'L\'anxiété chronique augmente le rythme cardiaque et la pression artérielle.',
      'La dépression est associée à un risque 50% plus élevé de maladies cardiovasculaires.',
      'La méditation de pleine conscience réduit le stress et améliore la variabilité cardiaque.',
      'Un sommeil de qualité (7-8h) est essentiel pour la récupération cardiaque nocturne.',
      'Les relations sociales positives protègent le cœur autant que l\'exercice physique.',
      'La respiration profonde (4-7-8) peut réduire la tension artérielle en quelques minutes.',
      'L\'exposition à la nature diminue le cortisol et améliore la santé cardiovasculaire.',
    ],
    advice: 'Pratiquez 10 minutes de respiration profonde par jour. Entourez-vous de personnes positives et n\'hésitez pas à consulter un professionnel.',
  },
  {
    icon: 'clock', bg: 'linear-gradient(135deg,#fb923c,#f97316)', title: 'Nutrition', count: '12 Perspectives',
    image: IMG + '1498837169522-3b8e4e3b4c9f?w=800&h=400&fit=crop',
    youtube: YT + 'wxB6GgPk3y0',
    content: [
      'Le régime méditerranéen est le plus bénéfique pour la santé cardiaque (huile d\'olive, poisson, légumes).',
      'Les oméga-3 (saumon, maquereau, noix, graines de lin) réduisent l\'inflammation et les triglycérides.',
      'Limitez le sel à 5g/jour maximum (un excès élève la tension artérielle).',
      'Les fibres solubles (avoine, légumineuses, pommes) aident à réduire le cholestérol.',
      'Le potassium (bananes, épinards, avocats) contrebalance les effets du sodium.',
      'Évitez les acides gras trans (fritures, viennoiseries industrielles, margarines).',
      'Le chocolat noir (>70% cacao) est riche en flavonoïdes bénéfiques pour le cœur.',
      'L\'alcool avec modération : maximum 2 verres/jour pour les hommes, 1 pour les femmes.',
      'Le thé vert contient des catéchines qui améliorent la fonction endothéliale.',
      'Réduisez les sucres ajoutés (boissons sucrées, pâtisseries, plats préparés).',
      'Mangez des fruits rouges (myrtilles, fraises, framboises) riches en antioxydants.',
      'L\'ail et le curcuma ont des propriétés anti-inflammatoires naturelles.',
    ],
    advice: 'Adoptez progressivement le régime méditerranéen. Cuisinez maison, réduisez le sel et augmentez les fibres.',
  },
  {
    icon: 'activity', bg: 'linear-gradient(135deg,#a78bfa,#8b5cf6)', title: 'Sport & Fitness', count: '15 Perspectives',
    image: IMG + '1571013883455-7e2d1f6c7a6f?w=800&h=400&fit=crop',
    youtube: YT + '0t2h0dQ6k_Q',
    content: [
      'Objectif minimum : 150 minutes d\'activité modérée ou 75 minutes intense par semaine.',
      'La marche rapide (30 min/jour) réduit de 30% le risque de maladies cardiovasculaires.',
      'Le renforcement musculaire 2 fois/semaine améliore le métabolisme et la santé osseuse.',
      'Le HIIT (High Intensity Interval Training) brûle plus de calories en moins de temps.',
      'Le yoga combine flexibilité, force et relaxation - excellent pour le cœur.',
      'La natation est un sport complet sans impact sur les articulations.',
      'Le cyclisme améliore l\'endurance cardiovasculaire et renforce les jambes.',
      'L\'échauffement (5-10 min) est essentiel avant tout effort pour préparer le cœur.',
      'Les étirements après l\'effort améliorent la récupération et la souplesse.',
      'Le fractionné alterne pics d\'effort et récupération pour booster le métabolisme.',
      'Écoutez votre corps : douleur = arrêt. Ne forcez pas sur une douleur cardiaque.',
      'L\'hydratation est cruciale : buvez avant, pendant et après l\'effort.',
      'Variez les activités pour éviter la monotonie et solliciter différents groupes musculaires.',
      'Le sport en groupe motive et crée une routine durable.',
      'Après 50 ans, privilégiez les activités à faible impact (marche, natation, vélo).',
    ],
    advice: 'Commencez doucement si vous débutez. 15 minutes de marche rapide par jour, puis augmentez progressivement.',
  },
  {
    icon: 'sun', bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', title: 'Bien-être', count: '10 Perspectives',
    image: IMG + '1506126271815-9f5d4c9b3c2e?w=800&h=400&fit=crop',
    youtube: YT + 'InhNTgJjI8s',
    content: [
      'La gratitude quotidienne améliore la santé cardiaque et réduit l\'inflammation.',
      'Un bain chaud de 15 minutes détend les vaisseaux sanguins et abaisse la tension.',
      'L\'exposition au soleil 15 min/jour (hors heures chaudes) fait le plein de vitamine D.',
      'La cohérence cardiaque (6 respirations/min) harmonise le système nerveux autonome.',
      'Les massages réduisent le cortisol et augmentent l\'ocytocine, hormone du bien-être.',
      'La musique classique ou les sons de la nature diminuent la pression artérielle.',
      'Le rire dilate les vaisseaux sanguins et améliore la circulation pendant 30 minutes.',
      'Les animaux de compagnie réduisent le stress et augmentent l\'activité physique.',
      'La luminothérapie améliore l\'humeur en hiver et régule le rythme circadien.',
      'L\'auto-massage des points de pression (poignet, nuque) soulage les tensions.',
    ],
    advice: 'Accordez-vous 15 minutes de bien-être chaque jour. La régularité compte plus que l\'intensité.',
  },
]

const sleepItems = [
  {
    bg: 'linear-gradient(135deg,#fbbf24,#f59e0b)', badge: 'Relaxation', name: 'Gratitude Apaisante',
    image: IMG + '1513203206005-6f9b4b7b0b3e?w=400&h=300&fit=crop',
    youtube: YT + 'O-6f5w0YF1c',
    content: 'Avant de dormir, prenez 3 minutes pour noter 3 choses positives de votre journée. Cette pratique réduit l\'anxiété et améliore la qualité du sommeil. La gratitude abaisse le cortisol et prépare votre esprit au repos.',
    technique: 'Asseyez-vous confortablement, fermez les yeux, inspirez profondément. Pensez à chaque événement positif de votre journée et laissez la sensation de gratitude envahir votre poitrine.',
    duration: '3-5 minutes',
  },
  {
    bg: 'linear-gradient(135deg,#60a5fa,#3b82f6)', badge: 'Méditation', name: 'Tranquillité',
    image: IMG + '1506126271815-9f5d4c9b3c2e?w=400&h=300&fit=crop',
    youtube: YT + 'inpok4MKVLM',
    content: 'La méditation de pleine conscience avant le sommeil calme le mental agité et abaisse la fréquence cardiaque. En vous concentrant sur votre souffle, vous activez le système parasympathique (repos et digestion).',
    technique: 'Allongez-vous, scannez mentalement chaque partie de votre corps des pieds à la tête. Relâchez les tensions conscientes. Respirez en comptant : 4 secondes inspiration, 6 secondes expiration.',
    duration: '10 minutes',
  },
  {
    bg: 'linear-gradient(135deg,#4ade80,#22c55e)', badge: 'Bien-être', name: 'Esprit Joyeux',
    image: IMG + '1499204707359-aa7c7d5f7a6b?w=400&h=300&fit=crop',
    youtube: YT + 'ZToicYcHIOU',
    content: 'Les pensées positives avant le sommeil programment votre subconscient pour un réveil énergique. Visualisez un lieu paisible (plage, forêt, montagne) et imprégnez-vous des sensations associées.',
    technique: 'Créez votre sanctuaire mental : imaginez les couleurs, les sons, les odeurs et les textures. Laissez cette visualisation dissiper les soucis de la journée. Souriez doucement.',
    duration: '5-7 minutes',
  },
  {
    bg: 'linear-gradient(135deg,#a78bfa,#8b5cf6)', badge: 'Audio', name: 'Détente Sonore',
    image: IMG + '1511673248453-f3b8e3c0b12e?w=400&h=300&fit=crop',
    youtube: YT + '1ZYbU82GVz4',
    content: 'Les fréquences sonores à 432 Hz ou 528 Hz sont connues pour leurs propriétés relaxantes. Les battements binauraux (ondes delta) synchronisent les hémisphères cérébraux pour un sommeil profond.',
    technique: 'Utilisez un casque pour les battements binauraux. Commencez par des fréquences alpha (8-12 Hz) pendant 10 minutes, puis descendez vers les ondes thêta (4-7 Hz) pour l\'endormissement.',
    duration: '15-20 minutes',
  },
  {
    bg: 'linear-gradient(135deg,#f472b6,#d946ef)', badge: 'Respiration', name: 'Cohérence Cardiaque',
    image: IMG + '1544367567-0f2f8a0b3c9e?w=400&h=300&fit=crop',
    youtube: YT + 'd-3Wjc7zXjw',
    content: 'La cohérence cardiaque (5 secondes inspiration, 5 secondes expiration) pendant 5 minutes abaisse significativement la tension artérielle et prépare le corps au sommeil profond.',
    technique: 'Inspirez par le nez (5 sec) - expirez par la bouche (5 sec). Maintenez ce rythme régulier. Visualisez votre cœur qui bat calmement. Idéal après une journée stressante.',
    duration: '5 minutes',
  },
  {
    bg: 'linear-gradient(135deg,#14b8a6,#0d9488)', badge: 'Étirements', name: 'Yoga Nidra',
    image: IMG + '1544367567-0f2f8a0b3c9e?w=400&h=300&fit=crop',
    youtube: YT + 'o-3kE5jCoNs',
    content: 'Le Yoga Nidra est une relaxation guidée profonde qui équivaut à 4 heures de sommeil. Idéal pour les jours où vous avez du mal à vous endormir ou si vous vous réveillez la nuit.',
    technique: 'Allongez-vous sur le dos, bras le long du corps. Suivez une guidance qui vous mènera à travers les 5 enveloppes de votre être : physique, énergétique, mentale, sagesse, bien-être.',
    duration: '20-30 minutes',
  },
]

const recipes = [
  {
    bg: 'linear-gradient(135deg,#a78bfa,#8b5cf6)', name: 'Flocons d\'avoine avec myrtilles', time: '15 min', tag: 'Santé',
    image: IMG + '1498837169522-3b8e4e3b4c9f?w=400&h=300&fit=crop',
    youtube: YT + 'J_1a9b3mNGo',
    ingredients: ['50g flocons d\'avoine', '200ml lait végétal (amande/avoine)', '1 poignée de myrtilles fraîches', '1 cuillère de miel', '1 cuillère de graines de chia', 'Quelques amandes effilées'],
    steps: [
      'Faites chauffer le lait dans une casserole à feu moyen.',
      'Ajoutez les flocons d\'avoine et les graines de chia. Mélangez 5 minutes.',
      'Versez dans un bol, ajoutez les myrtilles, le miel et les amandes.',
      'Laissez tiédir 2 minutes avant de déguster.',
    ],
    benefits: 'Riche en fibres solubles qui aident à réduire le cholestérol. Les myrtilles sont chargées d\'antioxydants bénéfiques pour le cœur.',
  },
  {
    bg: 'linear-gradient(135deg,#4ade80,#22c55e)', name: 'Toast à l\'avocat avec œuf', time: '10 min', tag: 'Protéines',
    image: IMG + '1525351204564-b18f4b5f3b0e?w=400&h=300&fit=crop',
    youtube: YT + 'oUe6Zf1Y3e0',
    ingredients: ['2 tranches de pain complet', '1 avocat mûr', '2 œufs', 'Jus de citron', 'Sel, poivre, piment d\'Espelette', '1 filet d\'huile d\'olive'],
    steps: [
      'Faites griller les tranches de pain complet.',
      'Écrasez l\'avocat à la fourchette, ajoutez du jus de citron, sel et poivre.',
      'Cuisez les œufs au plat ou pochés (cuisson douce pour préserver les nutriments).',
      'Tartinez l\'avocat sur le pain, déposez l\'œuf, ajoutez le piment et l\'huile d\'olive.',
    ],
    benefits: 'L\'avocat apporte des acides gras mono-insaturés bénéfiques pour le cœur. Les œufs fournissent des protéines de qualité.',
  },
  {
    bg: 'linear-gradient(135deg,#fb923c,#f97316)', name: 'Crêpes aux fruits rouges', time: '20 min', tag: 'Dessert',
    image: IMG + '1521016497-5f0c0b5c3b4e?w=400&h=300&fit=crop',
    youtube: YT + 'dQw4w9WgXcQ',
    ingredients: ['100g farine complète', '1 œuf', '200ml lait végétal', '1 cuillère d\'huile de coco', '1 poignée de fruits rouges surgelés', '1 cuillère sirop d\'érable'],
    steps: [
      'Mélangez la farine, l\'œuf et le lait. Fouettez jusqu\'à obtenir une pâte lisse.',
      'Ajoutez l\'huile de coco fondue et mélangez à nouveau.',
      'Faites chauffer une poêle antiadhésive. Versez une louche de pâte.',
      'Faites cuire 2 minutes de chaque côté. Garnissez de fruits rouges réchauffés et de sirop d\'érable.',
    ],
    benefits: 'Les fruits rouges sont riches en flavonoïdes. La farine complète apporte des fibres pour la satiété et le contrôle du cholestérol.',
  },
  {
    bg: 'linear-gradient(135deg,#f43f5e,#e11d48)', name: 'Saumon aux légumes verts', time: '25 min', tag: 'Omega-3',
    image: IMG + '1519702597422-5c6d5b3b4c9f?w=400&h=300&fit=crop',
    youtube: YT + 'LrOB0vWr3K0',
    ingredients: ['2 pavés de saumon', '200g de brocolis', '100g de haricots verts', '1 citron', 'Huile d\'olive', 'Ail, thym, sel, poivre'],
    steps: [
      'Préchauffez le four à 180°C.',
      'Disposez les pavés de saumon sur une plaque. Arrosez d\'huile d\'olive, ajoutez l\'ail et le thym.',
      'Faites cuire les légumes à la vapeur 8 minutes.',
      'Enfournez le saumon 12 minutes. Servez avec les légumes et un filet de citron.',
    ],
    benefits: 'Le saumon est riche en oméga-3 EPA et DHA, essentiels pour la santé cardiaque. Les légumes verts apportent des fibres et des vitamines.',
  },
  {
    bg: 'linear-gradient(135deg,#06b6d4,#0891b2)', badge: 'Boost', name: 'Smoothie Énergie', time: '5 min', tag: 'Antioxydants',
    image: IMG + '1534353478678-4f3b4b3b0c3e?w=400&h=300&fit=crop',
    youtube: YT + 'N1pCzVoY0X0',
    ingredients: ['1 banane', '1 poignée d\'épinards', '200ml lait d\'amande', '1 cuillère de graines de lin', '1/2 avocat', 'Quelques glaçons'],
    steps: [
      'Lavez les épinards frais.',
      'Épluchez la banane et l\'avocat.',
      'Mettez tous les ingrédients dans un mixeur.',
      'Mixez 1 minute jusqu\'à obtenir une texture lisse et homogène. Servez immédiatement.',
    ],
    benefits: 'Riche en potassium, magnésium et antioxydants. Idéal pour un petit-déjeuner qui protège le cœur et donne de l\'énergie durable.',
  },
]

const dailyTips = [
  {
    icon: 'heart',
    title: 'Bien-être du cœur',
    tip: 'Buvez un verre d\'eau tiède citronnée chaque matin à jeun. Cela alcalinise le corps, stimule la digestion et hydrate le système cardiovasculaire après le jeûne nocturne.',
  },
  {
    icon: 'activity',
    title: 'Petit geste santé',
    tip: 'Prenez les escaliers plutôt que l\'ascenseur. 2 minutes d\'escaliers par jour brûlent l\'équivalent de 500 calories par an et renforcent votre cœur.',
  },
  {
    icon: 'moon',
    title: 'Rituel du soir',
    tip: 'Éteignez les écrans 1 heure avant le coucher. La lumière bleue supprime la mélatonine et perturbe le sommeil réparateur essentiel à la récupération cardiaque.',
  },
  {
    icon: 'users',
    title: 'Lien social',
    tip: 'Appelez un ami ou un proche aujourd\'hui. Les interactions sociales positives libèrent de l\'ocytocine, qui abaisse la tension artérielle et réduit le stress.',
  },
  {
    icon: 'sun',
    title: 'Pause nature',
    tip: 'Passez 20 minutes dans un espace vert aujourd\'hui. L\'exposition à la nature réduit le cortisol de 15% et améliore la variabilité cardiaque.',
  },
  {
    icon: 'check',
    title: 'Gratitude',
    tip: 'Notez 3 choses pour lesquelles vous êtes reconnaissant aujourd\'hui. La pratique régulière de la gratitude réduit l\'inflammation de 23% et améliore la santé cardiaque.',
  },
]

const articleIcons = {
  heart: { fill: true, paths: [<path key="h" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" fill="currentColor"/>] },
  moon: { fill: false, paths: [<path key="m" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>] },
  walk: { fill: false, paths: [<path key="w" d="M13 2a1 1 0 1 0 0 2 1 1 0 0 0 0-2z"/>, <path key="w2" d="M9 18l-1-5-3 2" />, <path key="w3" d="M13 14l1-3 3 1" />, <path key="w4" d="M9 6l1 3h4" />] },
  run: { fill: false, paths: [<path key="r" d="M16 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>, <path key="r2" d="M11 18l1-4-3-2 1-3" />, <path key="r3" d="M14 9l4 2 2-2" />] },
  smoke: { fill: false, paths: [<path key="s" d="M16 16h3a2 2 0 0 0 0-4h-1" />, <path key="s2" d="M13 16H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h9" />, <line key="s3" x1="12" y1="8" x2="12" y2="16" />] },
  weight: { fill: false, paths: [<circle key="w" cx="12" cy="6" r="2" />, <path key="w2" d="M4 22v-4a8 8 0 0 1 16 0v4" />] },
  diet: { fill: false, paths: [<path key="d" d="M18 8h1a4 4 0 0 1 0 8h-1" />, <path key="d2" d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />, <line key="d3" x1="6" y1="1" x2="6" y2="4" />, <line key="d4" x1="10" y1="1" x2="10" y2="4" />, <line key="d5" x1="14" y1="1" x2="14" y2="4" />] },
  checkup: { fill: false, paths: [<path key="cu" d="M22 12h-4l-3 9L9 3l-3 9H2" />] },
  stress: { fill: false, paths: [<circle key="s" cx="12" cy="12" r="10" />, <path key="s2" d="M12 8v4" />, <path key="s3" d="M12 16h.01" />] },
  sleep: { fill: false, paths: [<path key="sl" d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />] },
  trending: { fill: false, paths: [<polyline key="t" points="23 6 13.5 15.5 8.5 10.5 1 18" />, <polyline key="t2" points="17 6 23 6 23 12" />] },
}

function renderIcon(type, size = 28, color = 'white') {
  const icon = articleIcons[type] || articleIcons.heart
  return (
    <svg style={{ width: size, height: size, color }} viewBox="0 0 24 24" fill={icon.fill ? 'currentColor' : 'none'} stroke={icon.fill ? 'none' : 'currentColor'} strokeWidth="2">
      {icon.paths}
    </svg>
  )
}

export default function Activity() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('articles')
  const [tipIndex, setTipIndex] = useState(() => Math.floor(Math.random() * dailyTips.length))

  const notify = (msg, bg) => {
    const toast = document.createElement('div')
    toast.className = 'toast'
    toast.style.background = bg || 'linear-gradient(135deg,#8b5cf6,#6366f1)'
    toast.textContent = msg
    document.body.appendChild(toast)
    setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300) }, 3500)
  }

  const openDetail = (type, index, data) => {
    navigate('/activite/detail', { state: { type, index, data } })
  }

  return (
    <div style={{background:'var(--bg-primary)',minHeight:'100vh'}}>
      <header className="header" style={{background:'rgba(26,31,46,0.9)'}}>
        <div className="header-content">
          <h1 style={{fontFamily:'Fredoka,cursive',fontSize:24,fontWeight:700,color:'var(--text-primary)'}}>Activité</h1>
          <div style={{display:'flex',gap:8}}>
            <button onClick={() => setTipIndex(Math.floor(Math.random() * dailyTips.length))} style={{width:40,height:40,border:'none',background:'var(--bg-card)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',transition:'all .3s ease',color:'var(--accent-primary)'}} title="Nouveau conseil">
              <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
            </button>
            <button onClick={() => notify('Recherche bientôt disponible !')} className="search-btn">
              <svg style={{width:20,height:20}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            </button>
          </div>
        </div>
      </header>

      <main className="container">
        {/* Daily Tip */}
        <div style={{background:'linear-gradient(135deg,#ff6b9d,#8b5cf6)',borderRadius:24,padding:24,marginBottom:24,position:'relative',overflow:'hidden',boxShadow:'0 8px 32px rgba(255,107,157,0.3)'}}>
          <div style={{position:'absolute',top:-30,right:-30,width:120,height:120,background:'rgba(255,255,255,0.05)',borderRadius:'50%'}}/>
          <div style={{position:'absolute',bottom:-20,left:-20,width:80,height:80,background:'rgba(255,255,255,0.05)',borderRadius:'50%'}}/>
          <div style={{display:'flex',alignItems:'flex-start',gap:16,position:'relative',zIndex:1}}>
            <div style={{width:48,height:48,background:'rgba(255,255,255,0.2)',borderRadius:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
              {renderIcon(dailyTips[tipIndex].icon, 24)}
            </div>
            <div style={{flex:1}}>
              <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:6}}>
                <span style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.7)',textTransform:'uppercase',letterSpacing:1}}>Conseil du jour</span>
                <span style={{fontSize:11,fontWeight:700,color:'rgba(255,255,255,0.7)',background:'rgba(255,255,255,0.1)',padding:'2px 8px',borderRadius:4}}>Dr. Cardi</span>
              </div>
              <h3 style={{fontFamily:'Fredoka,cursive',fontSize:18,fontWeight:700,color:'white',marginBottom:8}}>{dailyTips[tipIndex].title}</h3>
              <p style={{fontSize:14,fontWeight:600,color:'rgba(255,255,255,0.9)',lineHeight:1.6}}>{dailyTips[tipIndex].tip}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {[
            { id: 'articles', label: 'Articles', icon: <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/> },
            { id: 'sleep', label: 'Sommeil', icon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/> },
              { id: 'recipes', label: 'Recettes', icon: <><path d="M18 8h1a4 4 0 0 1 0 8h-1"/><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"/></> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              style={{
                flex:1,padding:'12px 16px',borderRadius:14,fontFamily:'Nunito,sans-serif',fontSize:13,fontWeight:700,cursor:'pointer',transition:'all 0.3s ease',display:'flex',alignItems:'center',justifyContent:'center',gap:8,
                background: activeTab === tab.id ? 'linear-gradient(135deg,#ff6b9d,#8b5cf6)' : 'var(--bg-card)',
                border: activeTab === tab.id ? 'none' : '1px solid var(--border-color)',
                color: activeTab === tab.id ? 'white' : 'var(--text-secondary)',
                boxShadow: activeTab === tab.id ? '0 4px 16px rgba(255,107,157,0.2)' : 'none',
              }}
            >
              <svg style={{width:18,height:18}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">{tab.icon}</svg>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Articles Tab */}
        {activeTab === 'articles' && (
          <div style={{marginBottom:32}}>
            <div className="section-header">
              <h3 className="section-title">Articles De Santé</h3>
              <button className="view-all-btn" onClick={() => notify('Tous les articles sont affichés ci-dessous')}>Voir tout</button>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:16}}>
              {articles.map((a, i) => (
                <div key={i}
                  onClick={() => openDetail('article', i, a)}
                  style={{
                    background:'var(--bg-card)',borderRadius:20,padding:20,
                    border:'1px solid var(--border-color)',cursor:'pointer',
                    transition:'all 0.3s ease',position:'relative',overflow:'hidden',
                  }}
                  onMouseOver={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 12px 32px var(--shadow)' }}
                  onMouseOut={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='' }}
                >
                  <div style={{width:56,height:56,borderRadius:16,background:a.bg,display:'flex',alignItems:'center',justifyContent:'center',marginBottom:12}}>
                    {renderIcon(a.icon, 28)}
                  </div>
                  <h4 style={{fontSize:16,fontWeight:700,marginBottom:4}}>{a.title}</h4>
                  <p style={{fontSize:13,fontWeight:600,color:'var(--text-secondary)',display:'flex',alignItems:'center',gap:4}}>
                    <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                    {a.count}
                  </p>
                  <div style={{marginTop:12,display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:'var(--accent-primary)'}}>
                    <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                    Lire l'article
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sleep Tab */}
        {activeTab === 'sleep' && (
          <div style={{marginBottom:32}}>
            <div className="section-header">
              <h3 className="section-title">Un Sommeil Meilleur</h3>
              <button className="view-all-btn" onClick={() => notify('Pratiquez chaque soir pour des résultats durables')}>Conseils</button>
            </div>
            <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:8,scrollbarWidth:'none'}}>
              {sleepItems.map((s, i) => (
                <div key={i}
                  onClick={() => openDetail('sleep', i, s)}
                  style={{
                    minWidth:160,background:'var(--bg-card)',borderRadius:20,overflow:'hidden',
                    border:'1px solid var(--border-color)',cursor:'pointer',transition:'all 0.3s ease',flexShrink:0,
                  }}
                  onMouseOver={e => e.currentTarget.style.transform='scale(1.05)'}
                  onMouseOut={e => e.currentTarget.style.transform=''}
                >
                  <div style={{width:'100%',height:120,background:s.bg,display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                    <svg style={{width:48,height:48,color:'white',opacity:0.9}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/>
                    </svg>
                    <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(to top,rgba(0,0,0,0.6),transparent)',padding:'8px 12px'}}>
                      <span style={{background:'rgba(255,255,255,0.2)',backdropFilter:'blur(10px)',padding:'4px 8px',borderRadius:8,fontSize:11,fontWeight:700,color:'white'}}>{s.badge}</span>
                    </div>
                  </div>
                  <div style={{padding:12}}>
                    <h4 style={{fontSize:14,fontWeight:700,marginBottom:4}}>{s.name}</h4>
                    <span style={{fontSize:11,fontWeight:700,color:'var(--text-tertiary)',display:'flex',alignItems:'center',gap:4}}>
                      <svg style={{width:12,height:12}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {s.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{background:'var(--bg-card)',borderRadius:20,padding:24,marginTop:20,border:'1px solid var(--border-color)',boxShadow:'0 4px 16px var(--shadow)'}}>
              <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:16}}>
                <div style={{width:40,height:40,background:'linear-gradient(135deg,#6366f1,#8b5cf6)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                  <svg style={{width:22,height:22,color:'white'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                </div>
                <div>
                  <h4 style={{fontSize:16,fontWeight:700,marginBottom:4}}>Routine du soir recommandée</h4>
                  <p style={{fontSize:12,fontWeight:600,color:'var(--text-secondary)'}}>Suivez ces étapes pour un sommeil réparateur</p>
                </div>
              </div>
              {[
                { time: '21:00', label: 'Éteindre les écrans', icon: 'moon', desc: 'Lumière bleue perturbatrice' },
                { time: '21:15', label: 'Rituel de gratitude', icon: 'heart', desc: '3 choses positives de la journée' },
                { time: '21:30', label: 'Respiration profonde', icon: 'check', desc: 'Cohérence cardiaque 5 min' },
                { time: '22:00', label: 'Coucher', icon: 'sleep', desc: 'Ambiance tamisée et calme' },
              ].map((step, i) => (
                <div key={i} style={{display:'flex',alignItems:'center',gap:14,padding:'12px 0',borderBottom: i < 3 ? '1px solid var(--border-color)' : 'none'}}>
                  <div style={{width:48,height:48,background:'var(--bg-secondary)',borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',border:'1px solid var(--border-color)'}}>
                    <span style={{fontSize:11,fontWeight:800,color:'var(--accent-primary)'}}>{i + 1}</span>
                  </div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:14,fontWeight:700}}>{step.label}</div>
                    <div style={{fontSize:11,fontWeight:600,color:'var(--text-tertiary)',display:'flex',alignItems:'center',gap:6,marginTop:2}}>
                      <span>{step.desc}</span>
                    </div>
                  </div>
                  <span style={{fontSize:13,fontWeight:700,color:'var(--text-secondary)'}}>{step.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recipes Tab */}
        {activeTab === 'recipes' && (
          <div style={{marginBottom:32}}>
            <div className="section-header">
              <h3 className="section-title">Recettes</h3>
              <button className="view-all-btn" onClick={() => notify('Toutes les recettes sont bonnes pour le c\u0153ur !')}>Toutes</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:16}}>
              {recipes.map((r, i) => (
                <div key={i}
                  onClick={() => openDetail('recipe', i, r)}
                  style={{
                    background:'var(--bg-card)',borderRadius:20,overflow:'hidden',
                    border:'1px solid var(--border-color)',cursor:'pointer',
                    transition:'all 0.3s ease',display:'flex',gap:16,
                  }}
                  onMouseOver={e => e.currentTarget.style.transform='translateX(4px)'}
                  onMouseOut={e => e.currentTarget.style.transform=''}
                >
                  <div style={{width:100,height:100,background:r.bg,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,borderRadius:'20px 0 0 20px'}}>
                    <svg style={{width:40,height:40,color:'white',opacity:0.9}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                  </div>
                  <div style={{padding:'16px 16px 16px 0',flex:1}}>
                    <h4 style={{fontSize:16,fontWeight:700,marginBottom:8}}>{r.name}</h4>
                    <div style={{display:'flex',gap:12,fontSize:12,fontWeight:600,color:'var(--text-secondary)',marginBottom:6}}>
                      <span style={{display:'flex',alignItems:'center',gap:4}}>
                        <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        {r.time}
                      </span>
                      <span style={{display:'flex',alignItems:'center',gap:4}}>
                        <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {r.tag}
                      </span>
                    </div>
                    <div style={{display:'flex',alignItems:'center',gap:4,fontSize:11,fontWeight:600,color:'var(--accent-primary)'}}>
                      <svg style={{width:14,height:14}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
                      Voir la recette
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <BottomNav/>
    </div>
  )
}
