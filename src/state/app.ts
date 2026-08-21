import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { USER, maskById } from '../mock/masks'
import { NOTIF_RULES, PRIORITY_CONTACTS, PRIVACY_DEFAULTS, TRANSLATE_RULES } from '../mock/settings'
import type { EmberPresetId, PrivacyRowId, PrivacyValue } from '../mock/settings'
import type { Hue, NotifRule, Presence } from '../mock/types'

export type Density = 'cozy' | 'compact'
export type MotionPref = 'system' | 'reduced'

interface AppState {
  /* identity */
  activeMaskId: string
  /** Who you are *in the room you are looking at*. Overrides the tint. */
  contextMaskId: string | null
  /** What to call that room when explaining scope, e.g. "LostEra", "Mira". */
  contextLabel: string | null
  presence: Record<string, Presence>
  setActiveMask: (id: string) => void
  setContextMask: (id: string | null, label?: string | null) => void
  setPresence: (maskId: string, presence: Presence) => void
  activeHue: () => Hue

  /* appearance */
  density: Density
  motion: MotionPref
  setDensity: (d: Density) => void
  setMotion: (m: MotionPref) => void

  /* onboarding */
  onboarded: boolean
  handle: string
  setOnboarded: (v: boolean) => void
  setHandle: (h: string) => void

  /* privacy */
  privacy: Record<PrivacyRowId, PrivacyValue>
  setPrivacy: (row: PrivacyRowId, value: PrivacyValue) => void
  requireRequest: boolean
  setRequireRequest: (v: boolean) => void

  /* notifications */
  notifRules: NotifRule[]
  updateNotifRule: (scopeId: string, patch: Partial<NotifRule>) => void
  priorityContacts: { maskId: string; label: string; on: boolean }[]
  togglePriority: (maskId: string) => void
  globalQuietHours: { from: string; to: string }
  setGlobalQuietHours: (q: { from: string; to: string }) => void

  /* data & expiry */
  defaultEmber: Record<string, EmberPresetId | 'follow'>
  setDefaultEmber: (context: string, value: EmberPresetId | 'follow') => void

  /* security */
  duressArmed: boolean
  setDuressArmed: (v: boolean) => void
  panicHide: boolean
  setPanicHide: (v: boolean) => void
  revokedSessions: string[]
  revokeSession: (id: string) => void

  /* language */
  translateRules: { id: string; label: string; on: boolean }[]
  toggleTranslateRule: (id: string) => void
  language: string
  setLanguage: (l: string) => void

  /* social */
  statsOptedIn: boolean
  setStatsOptedIn: (v: boolean) => void

  /* moderation */
  actingAsStaff: boolean
  setActingAsStaff: (v: boolean) => void
}

export const useApp = create<AppState>()(
  persist(
    (set, get) => ({
      activeMaskId: USER.activeMaskId,
      contextMaskId: null,
      contextLabel: null,
      presence: {
        'm-aija': 'online',
        'm-nova': 'away',
        'm-courier7': 'invisible',
      },
      setActiveMask: (id) => set({ activeMaskId: id }),
      setContextMask: (contextMaskId, contextLabel = null) =>
        set({ contextMaskId, contextLabel }),
      setPresence: (maskId, presence) =>
        set((s) => ({ presence: { ...s.presence, [maskId]: presence } })),
      activeHue: () => maskById(get().activeMaskId).hue,

      density: 'cozy',
      motion: 'system',
      setDensity: (density) => set({ density }),
      setMotion: (motion) => set({ motion }),

      onboarded: true,
      handle: '@aija',
      setOnboarded: (onboarded) => set({ onboarded }),
      setHandle: (handle) => set({ handle }),

      privacy: { ...PRIVACY_DEFAULTS },
      setPrivacy: (row, value) => set((s) => ({ privacy: { ...s.privacy, [row]: value } })),
      requireRequest: true,
      setRequireRequest: (requireRequest) => set({ requireRequest }),

      notifRules: NOTIF_RULES.map((r) => ({ ...r })),
      updateNotifRule: (scopeId, patch) =>
        set((s) => ({
          notifRules: s.notifRules.map((r) => (r.scopeId === scopeId ? { ...r, ...patch } : r)),
        })),
      priorityContacts: PRIORITY_CONTACTS.map((c) => ({ ...c })),
      togglePriority: (maskId) =>
        set((s) => ({
          priorityContacts: s.priorityContacts.map((c) =>
            c.maskId === maskId ? { ...c, on: !c.on } : c,
          ),
        })),
      globalQuietHours: { from: '23:00', to: '08:00' },
      setGlobalQuietHours: (globalQuietHours) => set({ globalQuietHours }),

      defaultEmber: { dms: 'off', groups: '7d', spaces: 'follow' },
      setDefaultEmber: (context, value) =>
        set((s) => ({ defaultEmber: { ...s.defaultEmber, [context]: value } })),

      duressArmed: false,
      setDuressArmed: (duressArmed) => set({ duressArmed }),
      panicHide: false,
      setPanicHide: (panicHide) => set({ panicHide }),
      revokedSessions: [],
      revokeSession: (id) => set((s) => ({ revokedSessions: [...s.revokedSessions, id] })),

      translateRules: TRANSLATE_RULES.map((r) => ({ ...r })),
      toggleTranslateRule: (id) =>
        set((s) => ({
          translateRules: s.translateRules.map((r) => (r.id === id ? { ...r, on: !r.on } : r)),
        })),
      language: 'English',
      setLanguage: (language) => set({ language }),

      statsOptedIn: true,
      setStatsOptedIn: (statsOptedIn) => set({ statsOptedIn }),

      actingAsStaff: true,
      setActingAsStaff: (actingAsStaff) => set({ actingAsStaff }),
    }),
    {
      name: 'enclave.app',
      version: 1,
      // Only the things a returning visitor should find where they left them.
      partialize: (s) => ({
        activeMaskId: s.activeMaskId,
        presence: s.presence,
        density: s.density,
        motion: s.motion,
        onboarded: s.onboarded,
        handle: s.handle,
        statsOptedIn: s.statsOptedIn,
      }),
    },
  ),
)
