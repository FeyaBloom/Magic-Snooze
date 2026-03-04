import { useState, useRef, useCallback } from 'react';
import { createAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export function useNoteAudioPlayer() {
  const playerRef = useRef(createAudioPlayer({ uri: '' }));
  const [playingUri, setPlayingUri] = useState<string | null>(null);
  const [fallbackDuration, setFallbackDuration] = useState(0);

  const status = useAudioPlayerStatus(playerRef.current);

  const pos = Math.max(0, Math.round((status?.currentTime ?? 0) * 1000));
  const dur = Math.round((status?.duration ?? 0) * 1000) || fallbackDuration;

  const stopPlayer = useCallback(() => {
    try { playerRef.current.pause(); } catch {}
    try { playerRef.current.seekTo(0); } catch {}
    setPlayingUri(null);
    setFallbackDuration(0);
  }, []);

  const toggle = useCallback(async (uri: string, fallbackDurationMs = 0) => {
    if (playingUri === uri) { stopPlayer(); return; }
    try {
      playerRef.current.replace({ uri });
      setFallbackDuration(fallbackDurationMs);

      // Wait 6s for player to load metadata before starting
      await new Promise<void>(resolve => setTimeout(resolve, 6000));

      playerRef.current.play();
      setPlayingUri(uri);
    } catch (e) {
      console.error('audio player error:', e);
      stopPlayer();
    }
  }, [playingUri, stopPlayer]);

  // auto-stop at end
  if (playingUri && !status?.playing && dur > 0 && pos >= dur - 100) {
    setPlayingUri(null);
  }

  const isPlaying = (u: string) => playingUri === u;
  const positionMs = (u: string) => playingUri === u ? pos : 0;
  const durationMs = (u: string, fallback = 0) => playingUri === u && dur > 0 ? dur : fallback;

  return { toggle, isPlaying, positionMs, durationMs, stopPlayer };
}