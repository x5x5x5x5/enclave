import { Navigate, NavLink, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { cx } from '../../lib/cx'
import { IconButton } from '../../components/primitives/Button'
import { ListColumn, MainColumn } from '../../components/shell/Columns'
import { MasksSection } from './sections/MasksSection'
import { PrivacySection } from './sections/PrivacySection'
import { NotificationsSection } from './sections/NotificationsSection'
import { DataSection } from './sections/DataSection'
import { SecuritySection } from './sections/SecuritySection'
import { AppearanceSection } from './sections/AppearanceSection'
import { LanguageSection } from './sections/LanguageSection'

const SECTIONS = [
  { id: 'masks', label: 'Masks', note: 'Who you are, per space' },
  { id: 'privacy', label: 'Privacy', note: 'What each audience can learn' },
  { id: 'notifications', label: 'Notifications', note: 'Per space and per person' },
  { id: 'data', label: 'Data & expiry', note: 'How long anything lives' },
  { id: 'security', label: 'Security', note: 'Devices, duress, panic' },
  { id: 'appearance', label: 'Appearance', note: 'Density and motion' },
  { id: 'language', label: 'Language', note: 'Translation rules' },
] as const

type SectionId = (typeof SECTIONS)[number]['id']

export function SettingsScreen() {
  const { section } = useParams()
  const navigate = useNavigate()

  // No section in the URL is a real state on mobile: it shows the nav. On
  // desktop the nav is always there, so Masks fills the pane.
  if (section && !SECTIONS.some((s) => s.id === section)) {
    return <Navigate to="/settings/masks" replace />
  }
  const current = SECTIONS.find((s) => s.id === (section ?? 'masks'))!

  const body: Record<SectionId, React.ReactNode> = {
    masks: <MasksSection />,
    privacy: <PrivacySection />,
    notifications: <NotificationsSection />,
    data: <DataSection />,
    security: <SecuritySection />,
    appearance: <AppearanceSection />,
    language: <LanguageSection />,
  }

  return (
    <>
      <ListColumn hideOnMobile={!!section}>
        <header className="shrink-0 px-3 pb-2 pt-3">
          <h1 className="font-display text-20 text-hi">Settings</h1>
        </header>
        <nav className="min-h-0 flex-1 overflow-y-auto px-1.5 pb-3">
          {SECTIONS.map((s) => (
            <NavLink
              key={s.id}
              to={`/settings/${s.id}`}
              className={({ isActive }) =>
                cx(
                  'block rounded-chip px-2.5 py-2 transition-colors',
                  isActive ? 'bg-accent-soft text-accent' : 'text-mid hover:bg-ink-2 hover:text-hi',
                )
              }
            >
              <span className="block text-14">{s.label}</span>
              <span className="block text-12 text-low">{s.note}</span>
            </NavLink>
          ))}
        </nav>
      </ListColumn>

      <MainColumn hideOnMobile={!section}>
        <header className="flex shrink-0 items-center gap-2 px-3 py-2.5 hairline-b md:px-6">
          <IconButton
            label="Back to settings"
            className="md:hidden"
            onClick={() => navigate('/settings')}
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </IconButton>
          <div className="min-w-0">
            <h2 className="truncate font-display text-17 text-hi">{current.label}</h2>
            <p className="truncate text-12 text-low">{current.note}</p>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-2xl px-4 py-6 md:px-6">{body[current.id]}</div>
        </div>
      </MainColumn>
    </>
  )
}
