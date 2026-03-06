import { useState, useRef, useCallback, useEffect } from 'react';
import { createAudioPlayer, useAudioPlayerStatus } from 'expo-audio';

export function useNoteAudioPlayer() {
  const playerRef = useRef(createAudioPlayer());
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

  const waitForMetadata = useCallback(async () => {
    await new Promise<void>(resolve => {
      let attempts = 0;
      const check = setInterval(() => {
        attempts++;
        if ((playerRef.current.duration ?? 0) > 0 || attempts >= 40) {
          clearInterval(check);
          resolve();
        }
      }, 150);
    });
  }, []);

  const toggle = useCallback(async (uri: string, fallbackDurationMs = 0) => {
    if (playingUri === uri) {
      if (status?.playing) {
        try { playerRef.current.pause(); } catch {}
      } else {
        try { playerRef.current.play(); } catch {}
      }
      return;
    }

    try {
      playerRef.current.replace({ uri });
      setFallbackDuration(fallbackDurationMs);

      // Wait 6s for player to load metadata before starting

      await waitForMetadata();

      playerRef.current.play();
      setPlayingUri(uri);
    } catch (e) {
      console.error('audio player error:', e);
      stopPlayer();
    }
  }, [playingUri, status?.playing, stopPlayer, waitForMetadata]);

  const seekToMs = useCallback(async (uri: string, targetMs: number, fallbackDurationMs = 0) => {
    const safeMs = Math.max(0, targetMs);
    const targetSeconds = safeMs / 1000;

    try {
      if (playingUri !== uri) {
        playerRef.current.replace({ uri });
        setFallbackDuration(fallbackDurationMs);
        setPlayingUri(uri);

        await waitForMetadata();
        playerRef.current.seekTo(targetSeconds);
        playerRef.current.play();
        return;
      }

      playerRef.current.seekTo(targetSeconds);
    } catch (e) {
      console.error('audio seek error:', e);
      stopPlayer();
    }
  }, [playingUri, stopPlayer, waitForMetadata]);

  useEffect(() => {
    if (playingUri && !status?.playing && dur > 0 && pos >= dur - 100) {
      setPlayingUri(null);
    }
  }, [playingUri, status?.playing, dur, pos]);

  useEffect(() => {
    return () => {
      stopPlayer();
      try { playerRef.current.remove(); } catch {}
    };
  }, [stopPlayer]);

  const isPlaying = (u: string) => playingUri === u && !!status?.playing;
  const isActive = (u: string) => playingUri === u;
  const positionMs = (u: string) => playingUri === u ? pos : 0;
  const durationMs = (u: string, fallback = 0) => playingUri === u && dur > 0 ? dur : fallback;

  return { toggle, seekToMs, isPlaying, isActive, positionMs, durationMs, stopPlayer };
}