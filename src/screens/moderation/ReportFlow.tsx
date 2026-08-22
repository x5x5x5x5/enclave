import { useMemo } from 'react'
import { Check } from 'lucide-react'
import { cx } from '../../lib/cx'
import { clock } from '../../lib/time'
import { maskById } from '../../mock/masks'
import { REPORT_REASONS } from '../../mock/moderation'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { Button } from '../../components/primitives/Button'
import { Modal } from '../../components/primitives/Overlay'
import { MaskAvatar } from '../../components/identity/MaskAvatar'
import { FrankingHash } from '../../components/trust'

/**
 * Step 1 lives in the conversation stream (see `Conversation`), because the
 * point of the flow is that you choose exactly what mods will see. Steps 2 and
 * 3 are this modal: the proof, then the reason.
 */
export function ReportFlow() {
  const report = useUi((s) => s.report)
  const setStep = useUi((s) => s.setReportStep)
  const setReason = useUi((s) => s.setReportReason)
  const cancel = useUi((s) => s.cancelReport)
  const toast = useUi((s) => s.toast)
  const messages = useWorld((s) => s.messages)
  const submitReport = useWorld((s) => s.submitReport)

  const picked = useMemo(
    () => (report ? messages.filter((m) => report.selected.includes(m.id)) : []),
    [messages, report],
  )

  if (!report || report.step === 1) return null

  return (
    <Modal
      open
      onClose={cancel}
      size="lg"
      title={report.step === 2 ? 'What mods will see' : 'Why are you reporting this?'}
      subtitle={
        report.step === 2
          ? 'Nothing else from this room travels with the report.'
          : 'The reason is the only thing you write. The proof is already attached.'
      }
      footer={
        report.step === 2 ? (
          <>
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back to picking
            </Button>
            <Button variant="solid" onClick={() => setStep(3)}>
              Looks right
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => setStep(2)}>
              Back
            </Button>
            <Button
              variant="solid"
              disabled={!report.reason}
              onClick={() => {
                submitReport({
                  id: `mr-${Date.now()}`,
                  reporterLabel: 'You',
                  reasonLabel: report.reason ?? 'Something else',
                  channelName: report.roomId,
                  status: 'open',
                  openedAt: new Date().toISOString(),
                  excerpts: picked.map((m) => ({
                    maskId: m.authorMaskId,
                    body: m.body ?? 'Attachment',
                    frankingTag: m.frankingTag,
                    ts: m.ts,
                  })),
                })
                cancel()
                toast({
                  kind: 'accent',
                  title: 'Report sent with proof',
                  body: `${picked.length} message${picked.length === 1 ? '' : 's'}, each with its own hash.`,
                })
              }}
            >
              Send report
            </Button>
          </>
        )
      }
    >
      {report.step === 2 ? (
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-2">
            {picked.map((m) => {
              const author = maskById(m.authorMaskId)
              return (
                <div
                  key={m.id}
                  className="rounded-card border border-[var(--line)] bg-ink-2 p-3"
                >
                  <div className="flex items-center gap-2">
                    <MaskAvatar maskId={author.id} size={22} presence={false} />
                    <span className="text-13 font-medium text-hi">{author.displayName}</span>
                    <span className="mono-num text-12 text-low">{clock(m.ts)}</span>
                    <FrankingHash tag={m.frankingTag} full className="ml-auto" />
                  </div>
                  <p className="mt-1.5 text-14 leading-relaxed text-hi">
                    {m.body ?? 'Attachment'}
                  </p>
                </div>
              )
            })}
          </div>
          <p className="rounded-card border border-[var(--line)] bg-ink-1 p-3 text-13 leading-relaxed text-mid">
            Each message carries a cryptographic proof it is authentic and unaltered. Mods see only
            what you selected — not the messages around it, not who else was in the room, and not
            anything you have said.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {REPORT_REASONS.map((r) => (
            <button
              key={r}
              onClick={() => setReason(r)}
              className={cx(
                'flex items-center justify-between gap-3 rounded-card border px-3 py-2.5 text-left text-14 transition-colors',
                report.reason === r
                  ? 'border-[color:var(--accent-line)] bg-accent-soft text-accent'
                  : 'border-[var(--line)] bg-ink-1 text-mid hover:bg-ink-2 hover:text-hi',
              )}
            >
              {r}
              {report.reason === r ? <Check size={15} strokeWidth={2} /> : null}
            </button>
          ))}
        </div>
      )}
    </Modal>
  )
}

/** The bar that appears under the stream while you are picking messages. */
export function ReportSelectionBar() {
  const report = useUi((s) => s.report)
  const setStep = useUi((s) => s.setReportStep)
  const cancel = useUi((s) => s.cancelReport)
  if (!report || report.step !== 1) return null

  return (
    <div className="shrink-0 border-t border-[color:var(--accent-line)] bg-accent-soft px-4 py-3">
      <div className="flex flex-wrap items-center gap-3">
        <p className="min-w-0 flex-1 text-13 text-hi">
          Pick the messages a moderator should see.{' '}
          <span className="mono-num text-accent">{report.selected.length}</span> selected.
        </p>
        <Button variant="ghost" size="sm" onClick={cancel}>
          Cancel
        </Button>
        <Button
          variant="solid"
          size="sm"
          disabled={report.selected.length === 0}
          onClick={() => setStep(2)}
        >
          Continue
        </Button>
      </div>
    </div>
  )
}
