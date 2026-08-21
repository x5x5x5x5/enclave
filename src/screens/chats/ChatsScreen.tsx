import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { MoreHorizontal, Search, Sparkles } from 'lucide-react'
import { CHAT_ROWS } from '../../mock/threads'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { ChatRow } from '../../components/nav/ChatRow'
import { StoriesRail } from '../../components/social/StoriesRail'
import { EmptyState } from '../../components/primitives/EmptyState'
import { IconButton } from '../../components/primitives/Button'
import { Input } from '../../components/primitives/Input'
import { Popover } from '../../components/primitives/Overlay'
import { Tabs } from '../../components/primitives/Tabs'
import { ListColumn, MainColumn } from '../../components/shell/Columns'
import { Conversation } from '../conversation/Conversation'
import { RequestCard } from './RequestCard'

type Folder = 'all' | 'dms' | 'spaces' | 'requests'

function UserMenu() {
  const demoMode = useWorld((s) => s.demoMode)
  const setDemoMode = useWorld((s) => s.setDemoMode)
  const toast = useUi((s) => s.toast)
  const navigate = useNavigate()
  const item =
    'flex w-full items-center justify-between gap-3 rounded-chip px-2 py-1.5 text-13 text-mid transition-colors hover:bg-ink-3 hover:text-hi'

  return (
    <Popover
      side="bottom"
      align="end"
      trigger={({ toggle }) => (
        <IconButton label="Your menu" size="sm" onClick={toggle}>
          <MoreHorizontal size={16} strokeWidth={1.5} />
        </IconButton>
      )}
    >
      {(close) => (
        <div className="w-60 p-1">
          <button
            className={item}
            onClick={() => {
              setDemoMode(!demoMode)
              close()
              toast({
                kind: 'accent',
                title: demoMode ? 'Demo mode off' : 'Demo mode on',
                body: demoMode
                  ? 'The world is back exactly as it was.'
                  : 'Fake activity arrives every few seconds.',
              })
            }}
          >
            <span className="flex items-center gap-2">
              <Sparkles size={14} strokeWidth={1.5} /> Demo mode
            </span>
            <span
              className={
                demoMode
                  ? 'rounded-chip border border-[color:var(--accent-line)] bg-accent-soft px-1.5 py-0.5 text-12 text-accent'
                  : 'rounded-chip border border-[var(--line)] px-1.5 py-0.5 text-12 text-low'
              }
            >
              {demoMode ? 'on' : 'off'}
            </span>
          </button>
          <button className={item} onClick={() => { close(); navigate('/you') }}>
            Your profile
          </button>
          <button className={item} onClick={() => { close(); navigate('/settings') }}>
            Settings
          </button>
          <button className={item} onClick={() => { close(); navigate('/welcome') }}>
            Replay onboarding
          </button>
          <button className={item} onClick={() => { close(); navigate('/playground') }}>
            Component playground
          </button>
        </div>
      )}
    </Popover>
  )
}

export function ChatsScreen() {
  const { roomId } = useParams()
  const [folder, setFolder] = useState<Folder>('all')
  const [query, setQuery] = useState('')
  const typingIn = useWorld((s) => s.typingIn)
  const demoMode = useWorld((s) => s.demoMode)

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase()
    return CHAT_ROWS.filter((r) => (folder === 'all' ? r.folder !== 'requests' : r.folder === folder))
      .filter((r) => (q ? `${r.title} ${r.snippet}`.toLowerCase().includes(q) : true))
      .map((r) => ({
        ...r,
        typing: demoMode && typingIn === r.threadId ? true : folder !== 'requests' && r.typing && demoMode,
      }))
      .sort((a, b) => Number(!!b.pinned) - Number(!!a.pinned))
  }, [folder, query, typingIn, demoMode])

  const requestCount = CHAT_ROWS.filter((r) => r.folder === 'requests').length

  return (
    <>
      <ListColumn hideOnMobile={!!roomId}>
        <header className="shrink-0 px-3 pb-2 pt-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h1 className="font-display text-20 text-hi">Chats</h1>
            <UserMenu />
          </div>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search"
            leading={<Search size={15} strokeWidth={1.5} />}
            className="h-9"
          />
        </header>

        <StoriesRail />

        <Tabs
          className="shrink-0 px-2"
          ariaLabel="Folders"
          items={[
            { id: 'all', label: 'All' },
            { id: 'dms', label: 'DMs' },
            { id: 'spaces', label: 'Spaces' },
            { id: 'requests', label: 'Requests', count: requestCount },
          ]}
          value={folder}
          onChange={(f) => setFolder(f as Folder)}
        />

        <div className="min-h-0 flex-1 overflow-y-auto px-1.5 py-2">
          {folder === 'requests' ? (
            <div className="px-1.5 py-1">
              {CHAT_ROWS.filter((r) => r.folder === 'requests').map((r) => (
                <RequestCard key={r.id} row={r} />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <EmptyState
              title="Nothing here yet"
              body="Start a conversation from the palette, or find a space to join."
              actionLabel="Open the palette"
              onAction={() => useUi.getState().openOverlay('command-palette')}
            />
          ) : (
            rows.map((row) => (
              <ChatRow
                key={row.id}
                row={row}
                to={`/chats/${row.threadId}`}
                active={roomId === row.threadId}
              />
            ))
          )}
        </div>
      </ListColumn>

      {roomId ? (
        <Conversation roomId={roomId} backTo="/chats" />
      ) : (
        <MainColumn hideOnMobile>
          <div className="flex flex-1 items-center justify-center">
            <EmptyState
              title="Pick a conversation"
              body="Or press Cmd K and go anywhere in the product."
              actionLabel="Open the palette"
              onAction={() => useUi.getState().openOverlay('command-palette')}
            />
          </div>
        </MainColumn>
      )}
    </>
  )
}
