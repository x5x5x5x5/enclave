/**
 * "Enclave" is a working codename. Rename the product here and nowhere else.
 */
export const BRAND = {
  name: 'Enclave',
  wordmark: 'Enclave',
  tagline: 'A private club for the people you actually talk to.',
  onboardingHeadline: 'One account. As many people as you need to be.',
  vaultPromise: 'Only you can open this. Sealed with your keys.',
  maskNote: 'Masks are unlinkable. Spaces cannot tell they share an owner.',
} as const

export type Brand = typeof BRAND
