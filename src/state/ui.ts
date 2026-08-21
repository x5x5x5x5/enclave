import { create } from 'zustand'

export type ToastKind = 'neutral' | 'accent' | 'breach'

export interface Toast {
  id: string
  kind: ToastKind
  title: string
  body?: string
  actionLabel?: string
  onAction?: () => void
  duration?: number
}

export type OverlayId =
  | 'mask-switcher'
  | 'command-palette'
  | 'social-card'
  | 'report'
  | 'story-viewer'
  | 'story-composer'
  | 'room-details'
  | 'sweep'
  | 'duress-confirm'
  | 'space-preview'
  | 'ember-picker'
  | 'schedule'

interface UiState {
  toasts: Toast[]
  overlay: OverlayId | null
  overlayPayload: unknown
  rightPanel: 'members' | 'thread' | 'profile' | null
  mobileNav: boolean

  toast: (t: Omit<Toast, 'id'>) => void
  dismissToast: (id: string) => void
  later: (what: string) => void

  openOverlay: (id: OverlayId, payload?: unknown) => void
  closeOverlay: () => void
  toggleOverlay: (id: OverlayId) => void

  setRightPanel: (p: UiState['rightPanel']) => void
  setMobileNav: (open: boolean) => void
}

let toastSeq = 0

export const useUi = create<UiState>((set, get) => ({
  toasts: [],
  overlay: null,
  overlayPayload: undefined,
  rightPanel: 'members',
  mobileNav: false,

  toast: (t) => {
    const id = `toast-${++toastSeq}`
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    const duration = t.duration ?? 4200
    window.setTimeout(() => get().dismissToast(id), duration)
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  /** The one honest answer for anything out of scope. Never a dead button. */
  later: (what) =>
    get().toast({
      kind: 'neutral',
      title: `${what} comes in a later phase`,
      body: 'This prototype stops here on purpose.',
    }),

  openOverlay: (id, payload) => set({ overlay: id, overlayPayload: payload }),
  closeOverlay: () => set({ overlay: null, overlayPayload: undefined }),
  toggleOverlay: (id) =>
    set((s) => (s.overlay === id ? { overlay: null, overlayPayload: undefined } : { overlay: id })),

  setRightPanel: (p) => set({ rightPanel: p }),
  setMobileNav: (open) => set({ mobileNav: open }),
}))
