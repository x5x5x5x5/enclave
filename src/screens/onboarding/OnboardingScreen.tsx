import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowLeft, Check, Dices, Download } from 'lucide-react'
import { cx } from '../../lib/cx'
import { BRAND } from '../../config/brand'
import { crossfadeAccent } from '../../lib/tint'
import { AVATAR_PRESETS } from '../../mock/masks'
import { RECOVERY_PHRASE } from '../../mock/settings'
import { HUES, HUE_LABEL } from '../../mock/world'
import type { Hue } from '../../mock/types'
import { useApp } from '../../state/app'
import { useUi } from '../../state/ui'
import { Button } from '../../components/primitives/Button'
import { Input, Textarea } from '../../components/primitives/Input'
import { AvatarMark } from '../../components/identity/AvatarMark'
import { SealGlyph } from '../../components/trust/Glyphs'

const HANDLE_IDEAS = [
  'aija',
  'nightramp',
  'quire',
  'northrack',
  'lowroar',
  'marginalia',
  'ninthcandle',
  'coveline',
]

const TAKEN = new Set(['admin', 'aija', 'mira', 'root', 'enclave'])

export function OnboardingScreen() {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const setHandle = useApp((s) => s.setHandle)
  const setOnboarded = useApp((s) => s.setOnboarded)
  const setActiveMask = useApp((s) => s.setActiveMask)
  const toast = useUi((s) => s.toast)

  const [step, setStep] = useState(0)
  const [handle, setLocalHandle] = useState('')
  const [ideaIndex, setIdeaIndex] = useState(0)
  const [displayName, setDisplayName] = useState('')
  const [avatar, setAvatar] = useState<string>(AVATAR_PRESETS[0])
  const [hue, setHue] = useState<Hue>('cove')
  const [bio, setBio] = useState('')
  const [saved, setSaved] = useState(false)

  const availability = useMemo(() => {
    const value = handle.trim().toLowerCase()
    if (value.length === 0) return null
    if (value.length < 3) return { ok: false, label: 'a little longer' }
    if (!/^[a-z0-9._-]+$/.test(value)) return { ok: false, label: 'letters, numbers, . _ -' }
    if (TAKEN.has(value)) return { ok: false, label: 'taken' }
    return { ok: true, label: 'available' }
  }, [handle])

  const pickHue = (h: Hue) => {
    setHue(h)
    // First taste of the signature: the screen takes the shape of the choice.
    crossfadeAccent(hue, h, !!reduce)
  }

  const finish = () => {
    setHandle(`@${handle.trim() || 'aija'}`)
    setOnboarded(true)
    setActiveMask('m-aija')
    toast({
      kind: 'accent',
      title: `Welcome to ${BRAND.name}`,
      body: 'You landed in LostEra, wearing Aija.',
    })
    navigate('/space/c-lostera/ch-general')
  }

  const steps = ['Claim a handle', 'Create your first mask', 'Recovery kit']

  return (
    <div className="flex min-h-dvh w-full flex-col bg-ink-0">
      <header className="flex items-center justify-between gap-3 px-5 py-4 md:px-8">
        <span className="font-display text-15 text-hi">{BRAND.wordmark}</span>
        <button
          onClick={() => {
            setOnboarded(true)
            navigate('/chats')
          }}
          className="min-h-11 px-1 text-13 text-mid underline-offset-4 transition-colors hover:text-hi hover:underline"
        >
          Just exploring? Enter the demo world
        </button>
      </header>

      <div className="flex min-h-0 flex-1 items-center justify-center px-[var(--gutter)] pb-28 md:pb-10">
        <div className="w-full max-w-lg">
          <div className="mb-6 flex items-center gap-2">
            {steps.map((s, i) => (
              <div key={s} className="flex flex-1 flex-col gap-1.5">
                <span
                  className={cx(
                    'h-0.5 rounded-full transition-colors duration-[var(--dur-std)]',
                    i <= step ? 'bg-accent' : 'bg-[var(--line)]',
                  )}
                />
                <span className={cx('text-12', i === step ? 'text-hi' : 'text-low')}>{s}</span>
              </div>
            ))}
          </div>

          <motion.div
            key={step}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: reduce ? 0 : 0.32, ease: [0.2, 0, 0, 1] }}
          >
            {step === 0 ? (
              <>
                <h1 className="font-display text-30 leading-tight text-hi">
                  {BRAND.onboardingHeadline}
                </h1>
                <p className="mt-2 text-15 leading-relaxed text-mid">
                  No phone. No email. Just a name you choose.
                </p>

                <div className="mt-6">
                  <Input
                    autoFocus
                    mono
                    value={handle}
                    onChange={(e) => setLocalHandle(e.target.value.replace(/^@/, ''))}
                    placeholder="pick a handle"
                    leading={<span className="font-mono text-mid">@</span>}
                    invalid={availability?.ok === false}
                    trailing={
                      availability ? (
                        <span
                          className={cx(
                            'text-12',
                            availability.ok ? 'text-accent' : 'text-breach',
                          )}
                        >
                          {availability.label}
                        </span>
                      ) : null
                    }
                  />
                  <button
                    onClick={() => {
                      const next = (ideaIndex + 1) % HANDLE_IDEAS.length
                      setIdeaIndex(next)
                      setLocalHandle(HANDLE_IDEAS[next])
                    }}
                    className="mt-3 inline-flex min-h-11 items-center gap-1.5 rounded-chip border border-[var(--line)] px-3 text-13 text-mid transition-colors hover:bg-ink-2 hover:text-hi"
                  >
                    <Dices size={14} strokeWidth={1.5} /> Generate another
                  </button>
                </div>

                <p className="mt-6 text-12 leading-relaxed text-mid">
                  Your handle belongs to one mask. Other masks you make later get their own, and
                  nothing links them.
                </p>
              </>
            ) : null}

            {step === 1 ? (
              <>
                <h1 className="font-display text-30 leading-tight text-hi">
                  Create your first mask
                </h1>
                <p className="mt-2 text-15 leading-relaxed text-mid">
                  A mask is who a space meets. You can be someone else somewhere else.
                </p>

                <div className="mt-6 rounded-card border border-[color:var(--accent-line)] bg-accent-soft p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className="rounded-full p-[2px]"
                      style={{ background: `rgb(var(--hue-${hue}-rgb) / .4)` }}
                    >
                      <AvatarMark preset={avatar} hue={hue} size={48} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-display text-17 text-hi">
                        {displayName.trim() || 'Your name here'}
                      </p>
                      <p className="mono-num truncate text-12 text-low">
                        @{handle.trim() || 'handle'} · {HUE_LABEL[hue].toLowerCase()}
                      </p>
                    </div>
                  </div>
                  {bio.trim() ? (
                    <p className="mt-3 text-13 leading-relaxed text-mid">{bio}</p>
                  ) : null}
                </div>

                <div className="mt-5 flex flex-col gap-4">
                  <div>
                    <p className="mb-2 text-13 text-mid">Avatar</p>
                    <div className="flex flex-wrap gap-2">
                      {AVATAR_PRESETS.map((p) => (
                        <button
                          key={p}
                          onClick={() => setAvatar(p)}
                          aria-label={p}
                          className={cx(
                            'rounded-full p-1 transition-colors',
                            avatar === p
                              ? 'bg-accent-soft ring-1 ring-[color:var(--accent-line)]'
                              : 'hover:bg-ink-2',
                          )}
                        >
                          <AvatarMark preset={p} hue={hue} size={34} />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-13 text-mid">Hue</p>
                    <div className="flex flex-wrap gap-2">
                      {HUES.map((h) => (
                        <button
                          key={h}
                          onClick={() => pickHue(h)}
                          aria-label={HUE_LABEL[h]}
                          title={HUE_LABEL[h]}
                          className={cx(
                            'h-11 w-11 rounded-full transition-transform md:h-9 md:w-9',
                            hue === h ? 'scale-110 ring-2 ring-[color:var(--accent-glow)]' : '',
                          )}
                          /* Sanctioned rainbow moment: picking a hue. */
                          style={{ background: `var(--hue-${h}-vivid)` }}
                        />
                      ))}
                    </div>
                  </div>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-13 text-mid">Display name</span>
                    <Input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="What people call you here"
                    />
                  </label>

                  <label className="flex flex-col gap-1.5">
                    <span className="text-13 text-mid">Bio (optional)</span>
                    <Textarea
                      rows={2}
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="One line. It can be a lie."
                    />
                  </label>
                </div>
              </>
            ) : null}

            {step === 2 ? (
              <>
                <h1 className="font-display text-30 leading-tight text-hi">Recovery kit</h1>
                <p className="mt-2 text-15 leading-relaxed text-mid">
                  Twelve words. They are the only way back in, and nobody else has a copy — not us,
                  not a server, not a support desk.
                </p>

                <div className="mt-6 rounded-card border border-[var(--line)] bg-ink-1 p-4">
                  <div className="flex items-center gap-2 text-mid">
                    <SealGlyph size={14} />
                    <span className="text-13">Sealed with your keys</span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-3">
                    {RECOVERY_PHRASE.map((w, i) => (
                      <span key={w} className="mono-num text-13 text-hi">
                        <span className="mr-2 text-low">{String(i + 1).padStart(2, '0')}</span>
                        {w}
                      </span>
                    ))}
                  </div>
                  <Button
                    variant="quiet"
                    size="sm"
                    className="mt-4"
                    icon={<Download size={14} strokeWidth={1.5} />}
                    onClick={() =>
                      toast({
                        kind: 'neutral',
                        title: 'Recovery card ready',
                        body: 'In the real product this saves a printable card. Here it stops.',
                      })
                    }
                  >
                    Download the card
                  </Button>
                </div>

                <button
                  onClick={() => setSaved((v) => !v)}
                  className="mt-4 flex items-start gap-2.5 text-left"
                >
                  <span
                    className={cx(
                      'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-[5px] border transition-colors',
                      saved
                        ? 'border-[color:var(--accent-line)] bg-accent text-[var(--ink-0)]'
                        : 'border-[var(--line)] bg-ink-1',
                    )}
                  >
                    {saved ? <Check size={13} strokeWidth={2.5} /> : null}
                  </span>
                  <span className="text-14 text-hi">
                    I saved it somewhere safe
                    <span className="mt-0.5 block text-12 leading-relaxed text-mid">
                      There is no reset link. That is the trade.
                    </span>
                  </span>
                </button>
              </>
            ) : null}
          </motion.div>

          {/* The CTA is pinned in the thumb zone on a phone, inline on desktop. */}
          <div
            className="mt-8 flex items-center gap-3 max-md:fixed max-md:inset-x-0 max-md:bottom-0 max-md:z-10 max-md:border-t max-md:border-[var(--line-soft)] max-md:bg-ink-0 max-md:px-[var(--gutter)] max-md:pt-3"
            style={{ paddingBottom: 'calc(12px + var(--safe-bottom))' }}
          >
            {step > 0 ? (
              <Button
                variant="ghost"
                size="md"
                icon={<ArrowLeft size={15} strokeWidth={1.5} />}
                onClick={() => setStep((s) => s - 1)}
              >
                Back
              </Button>
            ) : null}
            <Button
              variant="solid"
              size="lg"
              className="ml-auto"
              disabled={
                (step === 0 && !availability?.ok) ||
                (step === 1 && !displayName.trim()) ||
                (step === 2 && !saved)
              }
              onClick={() => (step === 2 ? finish() : setStep((s) => s + 1))}
            >
              {step === 2 ? `Enter ${BRAND.name}` : 'Continue'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
