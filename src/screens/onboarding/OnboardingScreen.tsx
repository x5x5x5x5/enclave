import { EmptyState } from '../../components/primitives/EmptyState'

/** Placeholder until this screen's phase. Replaced, not extended, in place. */
export function OnboardingScreen() {
  return (
    <div className="flex min-h-0 flex-1 items-center justify-center">
      <EmptyState title="Not built yet" body="This screen arrives in a later phase." />
    </div>
  )
}
