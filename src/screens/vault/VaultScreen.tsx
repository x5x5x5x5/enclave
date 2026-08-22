import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CornerUpRight, ExternalLink, FileText, Plus, Search } from 'lucide-react'
import { cx } from '../../lib/cx'
import { Screen } from '../../components/shell/Screen'
import { MaskButton } from '../../components/identity/MaskButton'
import { shortStamp } from '../../lib/time'
import { BRAND } from '../../config/brand'
import { VAULT, VAULT_TABS } from '../../mock/vault'
import type { VaultTabId } from '../../mock/vault'
import type { VaultItem } from '../../mock/types'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Button } from '../../components/primitives/Button'
import { Card, EmptyState } from '../../components/primitives/EmptyState'
import { Chip } from '../../components/primitives/Chip'
import { Input, Textarea } from '../../components/primitives/Input'
import { Tabs } from '../../components/primitives/Tabs'
import { MediaArt } from '../../components/messaging/MediaArt'
import { SealGlyph } from '../../components/trust/Glyphs'

export function VaultScreen() {
  const [tab, setTab] = useState<VaultTabId>('note')
  const [query, setQuery] = useState('')
  const [openNote, setOpenNote] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const navigate = useNavigate()
  const later = useUi((s) => s.later)
  const toast = useUi((s) => s.toast)
  const savedIds = useWorld((s) => s.savedToVault)
  const messages = useWorld((s) => s.messages)

  const savedFromChats = useMemo(
    () =>
      savedIds
        .map((id) => messages.find((m) => m.id === id))
        .filter(Boolean)
        .map<VaultItem>((m) => ({
          id: `live-${m!.id}`,
          kind: 'saved',
          title: 'Saved from a conversation',
          preview: m!.body ?? 'Attachment',
          ts: m!.ts,
          fromChannelId: m!.channelId,
        })),
    [savedIds, messages],
  )

  const items = useMemo(() => {
    const q = query.trim().toLowerCase()
    return [...savedFromChats, ...VAULT]
      .filter((i) => i.kind === tab)
      .filter((i) => (q ? `${i.title} ${i.preview}`.toLowerCase().includes(q) : true))
      .sort((a, b) => new Date(b.ts).getTime() - new Date(a.ts).getTime())
  }, [tab, query, savedFromChats])

  return (
    <Screen gutter={false} contentClassName="px-[var(--gutter)]">
      <div className="mx-auto w-full max-w-4xl py-6">
        <header>
          <div className="flex min-w-0 items-center gap-2">
            <MaskButton className="md:hidden" />
            <h1 className="truncate font-display text-24 text-hi">Vault</h1>
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-13 text-mid">
            <SealGlyph size={13} />
            {BRAND.vaultPromise}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search your vault"
              leading={<Search size={15} strokeWidth={1.5} />}
              className="h-9 min-w-48 flex-1"
            />
            <Button
              variant="quiet"
              size="md"
              icon={<Plus size={15} strokeWidth={1.5} />}
              onClick={() => {
                if (tab === 'note') {
                  setOpenNote('new')
                  setDraft('')
                } else later('Adding items by hand')
              }}
            >
              New
            </Button>
          </div>
        </header>

        <Tabs
          variant="pill"
          className="mt-4"
          ariaLabel="Vault sections"
          items={VAULT_TABS.map((t) => ({ id: t.id, label: t.label }))}
          value={tab}
          onChange={(t) => setTab(t)}
        />

        <div className="mt-4">
          {items.length === 0 ? (
            <EmptyState
              title={`Nothing in ${VAULT_TABS.find((t) => t.id === tab)?.label.toLowerCase()} yet`}
              body="Anything you keep here is sealed with your keys and never leaves your devices."
              actionLabel={tab === 'note' ? 'Write a note' : 'Save something from a chat'}
              onAction={() =>
                tab === 'note' ? (setOpenNote('new'), setDraft('')) : navigate('/chats')
              }
            />
          ) : tab === 'note' ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {openNote === 'new' ? (
                <Card raised className="p-3 sm:col-span-2">
                  <Textarea
                    rows={4}
                    autoFocus
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder="A note only you can open."
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button variant="ghost" size="sm" onClick={() => setOpenNote(null)}>
                      Discard
                    </Button>
                    <Button
                      variant="solid"
                      size="sm"
                      disabled={!draft.trim()}
                      onClick={() => {
                        setOpenNote(null)
                        toast({
                          kind: 'accent',
                          title: 'Note kept',
                          body: 'Sealed with your keys.',
                        })
                      }}
                    >
                      Keep
                    </Button>
                  </div>
                </Card>
              ) : null}
              {items.map((i) => (
                <Card key={i.id} className="p-4">
                  <p className="font-display text-15 text-hi">{i.title}</p>
                  <p className="mt-1.5 line-clamp-4 text-13 leading-relaxed text-mid">{i.preview}</p>
                  <p className="mono-num mt-2 text-12 text-low">{shortStamp(i.ts)}</p>
                </Card>
              ))}
            </div>
          ) : tab === 'saved' ? (
            <div className="flex flex-col gap-2">
              {items.map((i) => (
                <Card key={i.id} className="flex items-start gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-13 text-low">{i.title}</p>
                    <p className="mt-0.5 text-14 leading-relaxed text-hi">{i.preview}</p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <span className="mono-num text-12 text-low">{shortStamp(i.ts)}</span>
                    {i.fromChannelId ? (
                      <button
                        onClick={() =>
                          navigate(
                            i.fromChannelId!.startsWith('ch-')
                              ? `/space/${i.fromChannelId === 'ch-designcrit' ? 'c-atelier' : i.fromChannelId === 'ch-annotations' ? 'c-reading' : 'c-lostera'}/${i.fromChannelId}`
                              : `/chats/${i.fromChannelId}`,
                          )
                        }
                        className="inline-flex items-center gap-1 rounded-chip px-1.5 py-0.5 text-12 text-accent hover:bg-accent-soft"
                      >
                        <CornerUpRight size={11} strokeWidth={1.5} /> Jump back
                      </button>
                    ) : null}
                  </div>
                </Card>
              ))}
            </div>
          ) : tab === 'file' ? (
            <>
              <div className="grid gap-3 sm:grid-cols-3">
                {items.map((i) => (
                  <Card key={i.id} className="overflow-hidden">
                    <div className="aspect-[4/3]">
                      <MediaArt seed={i.title} rounded={false} />
                    </div>
                    <div className="p-3">
                      <p className="truncate text-13 text-hi">{i.title}</p>
                      <p className="mono-num mt-0.5 text-12 text-low">
                        {i.size} · {shortStamp(i.ts)}
                      </p>
                    </div>
                  </Card>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-1.5 border-t border-[var(--line-soft)] pt-3 text-12 text-low">
                <FileText size={12} strokeWidth={1.5} />
                Encrypted at rest. Even on a stolen device, none of this opens without your keys.
              </p>
            </>
          ) : tab === 'link' ? (
            <div className="flex flex-col gap-2">
              {items.map((i) => (
                <Card key={i.id} className="flex items-center gap-3 p-3">
                  <span
                    className="mono-num flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] border border-[var(--line)] bg-ink-2 text-12 text-mid"
                    aria-hidden="true"
                  >
                    {(i.host ?? '?').slice(0, 2)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-14 text-hi">{i.title}</p>
                    <p className="mono-num truncate text-12 text-low">{i.host}</p>
                  </div>
                  <button
                    onClick={() => later('Opening links')}
                    className="shrink-0 rounded-chip p-1.5 text-low hover:bg-ink-2 hover:text-hi"
                    aria-label="Open link"
                  >
                    <ExternalLink size={14} strokeWidth={1.5} />
                  </button>
                </Card>
              ))}
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {items.slice(0, 5).map((i) => (
                <Card key={i.id} className="flex items-center gap-2 p-3">
                  <p className="mono-num min-w-0 flex-1 truncate text-13 text-hi">{i.preview}</p>
                  <span className="flex shrink-0 items-center gap-2">
                    <Chip tone="mono">{i.device}</Chip>
                    <span className="mono-num text-12 text-low">{shortStamp(i.ts)}</span>
                  </span>
                </Card>
              ))}
              <p className={cx('pt-1 text-12 leading-relaxed text-mid')}>
                Your clipboard syncs between your own devices only, sealed end to end. It keeps the
                last five clips and forgets the rest.
              </p>
            </div>
          )}
        </div>
      </div>
    </Screen>
  )
}
