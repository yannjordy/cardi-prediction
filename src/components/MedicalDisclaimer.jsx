import { memo } from 'react'

function MedicalDisclaimer() {
  return (
    <div
      style={{
        background:
          'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(239,68,68,0.05))',
        border: '1px solid rgba(245,158,11,0.2)',
        borderRadius: 20,
        padding: 20,
        marginBottom: 24,
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          minWidth: 40,
          background: 'rgba(245,158,11,0.15)',
          borderRadius: 12,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <svg
          style={{ width: 22, height: 22, color: '#f59e0b' }}
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
        <h4
          style={{ fontSize: 14, fontWeight: 700, color: '#f59e0b', marginBottom: 6 }}
        >
          Avis important
        </h4>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
          }}
        >
          Les mesures et analyses fournies par Cardi sont indicatives et ne
          remplacent en aucun cas un avis medical professionnel. Pour tout
          diagnostic ou inquietude concernant votre sante cardiaque,
          <strong style={{ color: 'var(--text-primary)' }}>
            {' '}
            consultez un medecin ou un cardiologue
          </strong>
          . Seul un professionnel de sante peut interpreter correctement vos
          donnees et prescrire un traitement.
        </p>
      </div>
    </div>
  )
}

export default memo(MedicalDisclaimer)
