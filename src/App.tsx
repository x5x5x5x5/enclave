import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/shell/AppShell'
import { ChatsScreen } from './screens/chats/ChatsScreen'
import { SpaceScreen } from './screens/space/SpaceScreen'
import { VoiceScreen } from './screens/voice/VoiceScreen'
import { ProfileScreen } from './screens/profile/ProfileScreen'
import { VaultScreen } from './screens/vault/VaultScreen'
import { DiscoverScreen } from './screens/discover/DiscoverScreen'
import { SettingsScreen } from './screens/settings/SettingsScreen'
import { ModQueueScreen } from './screens/moderation/ModQueueScreen'
import { SpacesScreen } from './screens/space/SpacesScreen'
import { OnboardingScreen } from './screens/onboarding/OnboardingScreen'
import { PlaygroundScreen } from './screens/playground/PlaygroundScreen'
import { NotFoundScreen } from './screens/system/NotFoundScreen'

export function App() {
  return (
    <Routes>
      <Route path="/welcome" element={<OnboardingScreen />} />
      <Route element={<AppShell />}>
        <Route index element={<Navigate to="/chats" replace />} />
        <Route path="/chats" element={<ChatsScreen />} />
        <Route path="/chats/:roomId" element={<ChatsScreen />} />
        <Route path="/spaces" element={<SpacesScreen />} />
        <Route path="/space/:communityId" element={<SpaceScreen />} />
        <Route path="/space/:communityId/:channelId" element={<SpaceScreen />} />
        <Route path="/voice/:communityId/:channelId" element={<VoiceScreen />} />
        <Route path="/you" element={<ProfileScreen />} />
        <Route path="/vault" element={<VaultScreen />} />
        <Route path="/discover" element={<DiscoverScreen />} />
        <Route path="/settings" element={<SettingsScreen />} />
        <Route path="/settings/:section" element={<SettingsScreen />} />
        <Route path="/mod" element={<ModQueueScreen />} />
        <Route path="/playground" element={<PlaygroundScreen />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Route>
    </Routes>
  )
}
