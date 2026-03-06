import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { Play, Pause, Trash2 } from 'lucide-react-native';
import { NoteAudioClip } from '@/hooks/useNotes';
import { useNoteAudioPlayer } from '@/hooks/useNoteAudioPlayer';
import { createNotesStyles } from '@/styles/notes';

interface Props {
  clips: NoteAudioClip[];
  onRemove?: (id: string) => void;
  onRenameTitle?: (id: string, title: string) => void;
  onTitleFocus?: () => void;
  colors: any;
  textStyles: any;
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function AudioClipList({ clips, onRemove, onRenameTitle, onTitleFocus, colors, textStyles }: Props) {
  const player = useNoteAudioPlayer();
  const styles = createNotesStyles(colors);
  const [trackWidths, setTrackWidths] = useState<Record<string, number>>({});

  if (!clips.length) return null;

  return (
    <View style={styles.audioList}>
      {clips.map(clip => {
        const playing = player.isPlaying(clip.uri);
        const active = player.isActive(clip.uri);
        const pos = player.positionMs(clip.uri);
        const dur = player.durationMs(clip.uri, clip.durationMs);
        const progress = dur > 0 ? Math.min(1, pos / dur) : 0;

        return (
          <View key={clip.id} style={[styles.audioItem, { backgroundColor: `${colors.secondary}80` }]}>
            <View style={styles.audioControlsRow}>
              <TouchableOpacity
                style={[styles.audioPlayBtn, { backgroundColor: colors.surface }]}
                onPress={() => player.toggle(clip.uri, clip.durationMs)}
                activeOpacity={0.7}
              >
                {playing
                  ? <Pause size={14} color={colors.text} />
                  : <Play size={14} color={colors.text} />}
              </TouchableOpacity>

              {onRenameTitle ? (
                <TextInput
                  style={[styles.audioTitleInput, { color: colors.text, borderColor: colors.surface, flex: 1 }]}
                  value={clip.title}
                  onChangeText={v => onRenameTitle(clip.id, v)}
                  onFocus={onTitleFocus}
                  placeholderTextColor={colors.textSecondary}
                />
              ) : (
                <Text style={[textStyles.caption, { color: colors.text, flex: 1 }]} numberOfLines={1}>
                  {clip.title}
                </Text>
              )}

              <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                {active ? `${fmt(pos)} / ${fmt(dur)}` : fmt(dur || clip.durationMs)}
              </Text>

              {onRemove && (
                <TouchableOpacity onPress={() => onRemove(clip.id)} activeOpacity={0.7} style={{ padding: 4 }}>
                  <Trash2 size={14} color="#EF4444" />
                </TouchableOpacity>
              )}
            </View>

            <TouchableOpacity
              style={[styles.audioProgressTrack, { backgroundColor: colors.surface }]}
              activeOpacity={0.9}
              onLayout={(event) => {
                const width = event.nativeEvent.layout.width;
                setTrackWidths((prev) => (prev[clip.id] === width ? prev : { ...prev, [clip.id]: width }));
              }}
              onPress={(event) => {
                const width = trackWidths[clip.id] || 0;
                if (width <= 0 || dur <= 0) return;

                const ratio = Math.max(0, Math.min(1, event.nativeEvent.locationX / width));
                player.seekToMs(clip.uri, Math.round(dur * ratio), clip.durationMs);
              }}
              accessibilityRole="adjustable"
              accessibilityLabel={clip.title}
            >
              <View style={[styles.audioProgressFill, { backgroundColor: colors.secondary, width: `${progress * 100}%` }]} />
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}