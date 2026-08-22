import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { MaskSwitcher } from '../identity/MaskSwitcher'
import { CommandPalette } from '../nav/CommandPalette'
import { MobileTabs } from '../nav/MobileTabs'
import { Rail } from '../nav/Rail'
import { ToastHost } from '../primitives/Toast'
import { StoryViewer } from '../social/StoryViewer'
import { StoryComposer } from '../social/StoryComposer'
import { useKeyboardInset } from '../../lib/useKeyboardInset'
import { useUi } from '../../state/ui'
import { useWorld } from '../../state/world'
import { useChrome } from './useChrome'

/** Routes that put you inside a room; the tab bar never shows there. */
const IN_ROOM = [/^\/chats\/[^/]+/, /^\/space\/[^/]+\/[^/]+/, /^\/voice\//]

export function AppShell() {
  useChrome()
  useKeyboardInset()
  const toggleOverlay = useUi((s) => s.toggleOverlay)
  const closeOverlay = useUi((s) => s.closeOverlay)
  const advanceTransfers = useWorld((s) => s.advanceTransfers)
  const location = useLocation()
  const inRoom = IN_ROOM.some((re) => re.test(location.pathname))

  /* Global keyboard path: palette and mask switcher are always one chord away. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      if (e.key.toLowerCase() === 'k') {
        e.preventDefault()
        toggleOverlay('command-palette')
      }
      if (e.key.toLowerCase() === 'i') {
        e.preventDefault()
        toggleOverlay('mask-switcher')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [toggleOverlay])

  /* Transfers keep moving while you are elsewhere, like they would. */
  useEffect(() => {
    const id = window.setInterval(advanceTransfers, 1200)
    return () => window.clearInterval(id)
  }, [advanceTransfers])

  useEffect(() => {
    closeOverlay()
  }, [location.pathname, closeOverlay])

  return (
    <div className="flex h-dvh w-full flex-col overflow-hidden bg-ink-0">
      <div className="flex min-h-0 flex-1">
        <div className="hidden md:flex">
          <Rail />
        </div>
        <div className="flex min-h-0 min-w-0 flex-1">
          <Outlet />
        </div>
      </div>
      {inRoom ? null : <MobileTabs />}
      <MaskSwitcher />
      <CommandPalette />
      <StoryViewer />
      <StoryComposer />
      <ToastHost />
    </div>
  )
}
