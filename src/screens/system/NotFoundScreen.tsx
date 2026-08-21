import { useNavigate } from 'react-router-dom'
import { EmptyState } from '../../components/primitives/EmptyState'
import { GhostGlyph } from '../../components/trust/Glyphs'

export function NotFoundScreen() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center bg-ink-0">
      <EmptyState
        icon={<GhostGlyph size={20} />}
        title="This room doesn't exist — or you're wearing the wrong mask."
        body="Rooms are scoped to the identity that can see them. Try the palette, or go back to your chats."
        actionLabel="Go home"
        onAction={() => navigate('/chats')}
      />
    </div>
  )
}
