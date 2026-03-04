import { useState } from 'react';
import {
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from 'expo-audio';
import { persistFile, NoteAudioClip } from './useNotes';

export function useNoteAudioRecorder(defaultTitle: string) {
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder, 100);
  const [isRecording, setIsRecording] = useState(false);

  const durationMs = isRecording ? (recorderState.durationMillis ?? 0) : 0;

  const start = async (): Promise<boolean> => {
    const { granted } = await requestRecordingPermissionsAsync();
    if (!granted) return false;

    await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
    await recorder.prepareToRecordAsync();
    recorder.record();
    setIsRecording(true);
    return true;
  };

  const stop = async (): Promise<NoteAudioClip | null> => {
    if (!isRecording) return null;

    // Capture duration BEFORE stop() — recorderState becomes unavailable after
    const capturedDurationMs = recorderState.durationMillis ?? 0;

    try {
      await recorder.stop();

      const uri = (recorder.getStatus() as any).url ?? recorder.uri;
      if (!uri) return null;

      await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });

      const persistedUri = await persistFile(uri, 'aud');

      return {
        id: `${Date.now()}`,
        uri: persistedUri,
        title: defaultTitle,
        durationMs: Math.round(capturedDurationMs),
        createdAt: new Date().toISOString(),
      };
    } catch (e) {
      console.error('stop recording error:', e);
      return null;
    } finally {
      setIsRecording(false);
    }
  };

  return { isRecording, durationMs, start, stop };
}