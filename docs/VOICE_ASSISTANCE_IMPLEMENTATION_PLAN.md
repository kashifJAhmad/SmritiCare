# Voice Assistance Implementation Plan

## Current implementation

- `src/components/QuickAssist.tsx` is a floating warm-themed menu. Its “Start Voice Assistant” action only navigates through `onVoiceAssistant`; its other entries are placeholder alerts. It neither records audio nor owns speech listeners.
- `src/screens/home/VoiceAssistantScreen.tsx` is the sole recognition implementation. It imports `ExpoSpeechRecognitionModule` and `useSpeechRecognitionEvent`, requests recognition permissions on each start, shows partial/final text, and locally maps a small command set to existing App navigation callbacks.
- `App.tsx` maps voice navigation to the existing `schedule`, `call-family`, `games`, `profile`, and home screens. There is no voice backend endpoint, and no voice fetch wrapper to fix; commands must remain local rather than inventing a conversational API.
- The screen uses a hardcoded `en-US` locale, `setTimeout` navigation, no explicit abort/cancel, no listener/unmount ownership guard, and no TTS. `QuickAssist` itself has no duplicate-tap protection.

## Existing dependencies and platform configuration

- `expo-speech-recognition` is installed and registered in `app.json`; Android already declares `RECORD_AUDIO`. The plugin needs native EAS/development builds, not ordinary Expo Go.
- `expo-speech` is not installed, so there is currently no TTS lifecycle to preserve. It is the Expo-supported minimal dependency needed for the requested optional response speech; no duplicate voice service will be created.
- `src/services/networkMonitor.ts` is the single network state source; voice commands do not require network. `src/services/authStorage.ts`, `src/services/auth.ts`, SQLite, and `syncManager.ts` remain unchanged because no safe conversational request should be queued.
- The stored profile language is used by `profile.service.ts`/`ProfileScreen.tsx`; it supports English and Hindi.

## Changes

1. Keep `QuickAssist` as navigation only, prevent rapid double activation, and make its placeholder actions route to the existing voice screen instead of claiming unsupported behavior.
2. Stabilize `VoiceAssistantScreen` with one recognition session guard, safe permission/availability checks, final/partial transcript handling, stop and abort controls, timeout cleanup, and guarded event callbacks after unmount.
3. Add only `expo-speech` for TTS. Stop old speech before a new response, track completion/error, provide a stop action, and stop recognition/TTS on navigation or unmount.
4. Load the current persisted profile language through the existing `getMyProfile` service and map it to `en-US`/`hi-IN`; fall back visibly to English where native recognition cannot support the selected locale.
5. Keep commands local and limited to existing navigation: schedule/reminders, family call, games, profile, medical help, memories, and home. Do not queue conversation text or make a new backend API.
6. Configure the existing speech-recognition plugin with user-facing permission strings and Android speech-service visibility while retaining existing Android permissions and EAS profiles.

## Verification

Run TypeScript, Expo config validation, and package dependency validation. Native permission, speech-recognizer service availability, actual microphone input, device TTS, offline models, and EAS builds require a physical native development/EAS Android build and are not falsified as locally executed.
