import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Image,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
  useWindowDimensions
} from 'react-native';
import { Plus, Edit, Trash2, Search, BookOpen, Mic, Square, Play } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
import * as ImagePicker from 'expo-image-picker';
import {
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
} from 'expo-audio';
import * as FileSystem from 'expo-file-system';
import { formatDate } from '@/utils/dateUtils';

// Components
import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';

// Hooks
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { useTranslation } from 'react-i18next';

// Styles
import { createNotesStyles } from '@/styles/notes';
import { TOUCHABLE_CONFIG } from '@/styles/touchable';

interface Note {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  mediaUris?: string[];
  audioClips?: NoteAudioClip[];
  createdAt: string;
  updatedAt: string;
}

interface NoteAudioClip {
  id: string;
  uri: string;
  title: string;
  durationMs: number;
  createdAt: string;
}

const MAX_TAGS_PER_NOTE = 12;
const MAX_TAG_LENGTH = 24;
const MAX_MEDIA_PER_NOTE = 6;
const NOTES_MEDIA_DIR = `${FileSystem.documentDirectory ?? ''}notes-media/`;

const parseTagsInput = (value: string): string[] => {
  const result: string[] = [];
  const seen = new Set<string>();

  const rawParts = value.split(/[,;|\n]+/g);

  for (const rawTag of rawParts) {
    let tag = rawTag
      .replace(/^#+/, '')
      .replace(/[^a-zA-Z0-9а-яА-ЯёЁÀ-ÿ\s_-]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (!tag) continue;

    if (tag.length > MAX_TAG_LENGTH) {
      tag = tag.slice(0, MAX_TAG_LENGTH).trim();
    }

    if (!tag) continue;

    const normalized = tag.toLowerCase();
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    result.push(normalized);

    if (result.length >= MAX_TAGS_PER_NOTE) break;
  }

  return result;
};

export default function NotesScreen() {
  const { t, i18n } = useTranslation();
  const textStyles = useTextStyles();
  const { colors, isMessyMode } = useTheme();
  const { width: windowWidth } = useWindowDimensions();

  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [noteTagsInput, setNoteTagsInput] = useState('');
  const [noteMediaUris, setNoteMediaUris] = useState<string[]>([]);
  const [noteAudioClips, setNoteAudioClips] = useState<NoteAudioClip[]>([]);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [previewImageUri, setPreviewImageUri] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [currentAudioPlayer, setCurrentAudioPlayer] = useState<any>(null);
  const [playingAudioUri, setPlayingAudioUri] = useState<string | null>(null);
  const [recordingDurationMs, setRecordingDurationMs] = useState(0);
  const [playbackPositionMs, setPlaybackPositionMs] = useState(0);
  const [playbackDurationMs, setPlaybackDurationMs] = useState(0);
  const [viewMediaContainerWidth, setViewMediaContainerWidth] = useState(0);
  const playbackIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder, 250);
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const styles = createNotesStyles(colors);

  const ensureMediaDirectory = async () => {
    if (!FileSystem.documentDirectory) return;
    const dirInfo = await FileSystem.getInfoAsync(NOTES_MEDIA_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(NOTES_MEDIA_DIR, { intermediates: true });
    }
  };

  const buildPersistentMediaPath = (sourceUri: string, prefix: 'img' | 'aud') => {
    const extMatch = sourceUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
    const ext = extMatch?.[1] || (prefix === 'img' ? 'jpg' : 'm4a');
    return `${NOTES_MEDIA_DIR}${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  };

  const persistMediaFile = async (sourceUri: string, prefix: 'img' | 'aud') => {
    if (!sourceUri) return sourceUri;
    if (sourceUri.startsWith('data:')) return sourceUri;

    if (Platform.OS === 'web') {
      return sourceUri;
    }

    if (!FileSystem.documentDirectory) return sourceUri;

    if (sourceUri.startsWith(FileSystem.documentDirectory)) {
      return sourceUri;
    }

    await ensureMediaDirectory();
    const destination = buildPersistentMediaPath(sourceUri, prefix);
    await FileSystem.copyAsync({ from: sourceUri, to: destination });
    return destination;
  };

  const removeMediaFile = async (uri: string) => {
    if (!uri || !FileSystem.documentDirectory) return;
    if (uri.startsWith('data:')) return;
    if (!uri.startsWith(FileSystem.documentDirectory)) return;

    try {
      const info = await FileSystem.getInfoAsync(uri);
      if (info.exists) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
      }
    } catch (error) {
      console.error('Error removing media file:', error);
    }
  };


  const loadNotes = async () => {
    try {
      const notesData = await AsyncStorage.getItem('personalNotes');
      if (notesData) {
        const parsedNotes = JSON.parse(notesData);
        let needsSave = false;
        const shouldMigrateFiles = Platform.OS !== 'web';
        const normalizedNotes: Note[] = [];

        for (const note of parsedNotes as Note[]) {
          const normalizedTags = parseTagsInput(Array.isArray(note.tags) ? note.tags.join(',') : '');
          const sourceMedia = Array.isArray(note.mediaUris) ? note.mediaUris : [];
          const sourceAudio = Array.isArray(note.audioClips) ? note.audioClips : [];

          const persistedMedia: string[] = [];
          for (const uri of sourceMedia) {
            if (!uri) continue;

            if (!shouldMigrateFiles) {
              persistedMedia.push(uri);
              continue;
            }

            try {
              const migrated = await persistMediaFile(uri, 'img');
              persistedMedia.push(migrated);
              if (migrated !== uri) {
                needsSave = true;
              }
            } catch (error) {
              console.error('Error migrating image uri:', error);
              persistedMedia.push(uri);
            }
          }

          const persistedAudio: NoteAudioClip[] = [];
          for (const clip of sourceAudio) {
            const uri = clip?.uri;
            if (!uri) {
              continue;
            }

            let finalUri = uri;
            if (shouldMigrateFiles) {
              try {
                const migrated = await persistMediaFile(uri, 'aud');
                finalUri = migrated;
                if (migrated !== uri) {
                  needsSave = true;
                }
              } catch (error) {
                console.error('Error migrating audio uri:', error);
                finalUri = uri;
              }
            }

            persistedAudio.push({
              id: clip.id || `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
              uri: finalUri,
              title: clip.title?.trim() || t('notes.audioDefaultTitle'),
              durationMs: clip.durationMs || 0,
              createdAt: clip.createdAt || new Date().toISOString(),
            });
          }

          const normalizedNote: Note = {
            ...note,
            tags: normalizedTags,
            mediaUris: persistedMedia,
            audioClips: persistedAudio,
          };

          if (
            JSON.stringify(note.tags || []) !== JSON.stringify(normalizedNote.tags || []) ||
            JSON.stringify(note.mediaUris || []) !== JSON.stringify(normalizedNote.mediaUris || []) ||
            JSON.stringify(note.audioClips || []) !== JSON.stringify(normalizedNote.audioClips || [])
          ) {
            needsSave = true;
          }

          normalizedNotes.push(normalizedNote);
        }

        for (let index = 0; index < parsedNotes.length; index++) {
          const originalTags = Array.isArray(parsedNotes[index].tags) ? parsedNotes[index].tags : [];
          const normalizedTags = normalizedNotes[index].tags || [];
          if (originalTags.length !== normalizedTags.length) {
            needsSave = true;
            break;
          }

          for (let tagIndex = 0; tagIndex < originalTags.length; tagIndex++) {
            if ((originalTags[tagIndex] || '').toLowerCase().trim() !== normalizedTags[tagIndex]) {
              needsSave = true;
              break;
            }
          }
          if (needsSave) break;
        }

        normalizedNotes.sort(
          (a: Note, b: Note) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setNotes(normalizedNotes);

        if (needsSave) {
          await AsyncStorage.setItem('personalNotes', JSON.stringify(normalizedNotes));
        }
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('personalNotes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
      return true;
    } catch (error) {
      console.error('Error saving notes:', error);
      return false;
    }
  };

  const addNote = async () => {
    if (
      !noteTitle.trim() &&
      !noteContent.trim() &&
      noteMediaUris.length === 0 &&
      noteAudioClips.length === 0
    ) {
      return;
    }

    const newNote: Note = {
      id: Date.now().toString(),
      title: noteTitle.trim() || t('notes.untitled'),
      content: noteContent.trim(),
      tags: parseTagsInput(noteTagsInput),
      mediaUris: noteMediaUris,
      audioClips: noteAudioClips,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...notes];
    const saved = await saveNotes(updatedNotes);
    if (!saved) return;

    setNoteTitle('');
    setNoteContent('');
    setNoteTagsInput('');
    setNoteMediaUris([]);
    setNoteAudioClips([]);
    setShowAddModal(false);
  };

  const editNote = async () => {
    if (!editingNote) return;

    if (
      !noteTitle.trim() &&
      !noteContent.trim() &&
      noteMediaUris.length === 0 &&
      noteAudioClips.length === 0
    ) {
      return;
    }

    const updatedNote: Note = {
      ...editingNote,
      title: noteTitle.trim() || t('notes.untitled'),
      content: noteContent.trim(),
      tags: parseTagsInput(noteTagsInput),
      mediaUris: noteMediaUris,
      audioClips: noteAudioClips,
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map((note) =>
      note.id === editingNote.id ? updatedNote : note
    );

    updatedNotes.sort(
      (a: Note, b: Note) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    const saved = await saveNotes(updatedNotes);
    if (!saved) return;

    setNoteTitle('');
    setNoteContent('');
    setNoteTagsInput('');
    setNoteMediaUris([]);
    setNoteAudioClips([]);
    setEditingNote(null);
    setShowEditModal(false);
  };

  const deleteNote = (noteId: string) => {
    setConfirmDialog({
      visible: true,
      title: t('notes.deleteTitle'),
      message: t('notes.deleteMessage'),
      onConfirm: async () => {
        const noteToDelete = notes.find((note) => note.id === noteId);
        const updatedNotes = notes.filter((note) => note.id !== noteId);
        await saveNotes(updatedNotes);

        if (noteToDelete) {
          for (const uri of noteToDelete.mediaUris || []) {
            await removeMediaFile(uri);
          }
          for (const clip of noteToDelete.audioClips || []) {
            await removeMediaFile(clip.uri);
          }
        }

        setShowEditModal(false);
        setShowViewModal(false);
        setEditingNote(null);
        setViewingNote(null);
        setNoteAudioClips([]);
      },
    });
  };

  const openNote = (note: Note) => {
    setViewingNote(note);
    setShowViewModal(true);
  };

  const openEditFromView = () => {
    if (viewingNote) {
      setEditingNote(viewingNote);
      setNoteTitle(viewingNote.title);
      setNoteContent(viewingNote.content);
      setNoteTagsInput((viewingNote.tags || []).join(', '));
      setNoteMediaUris(viewingNote.mediaUris || []);
      setNoteAudioClips(viewingNote.audioClips || []);
      setShowViewModal(false);
      setShowEditModal(true);
    }
  };

  const formatAudioDuration = (durationMs: number) => {
    const totalSeconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${String(seconds).padStart(2, '0')}`;
  };

  const addImageToNote = async () => {
    if (noteMediaUris.length >= MAX_MEDIA_PER_NOTE) return;

    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: MAX_MEDIA_PER_NOTE - noteMediaUris.length,
        allowsEditing: false,
        quality: 0.7,
      });

      if (result.canceled || !result.assets?.length) return;

      const remainingSlots = MAX_MEDIA_PER_NOTE - noteMediaUris.length;
      const selectedAssets = result.assets
        .map((asset) => asset.uri)
        .filter(Boolean)
        .slice(0, remainingSlots);

      if (selectedAssets.length === 0) return;

      const persistentUris = await Promise.all(
        selectedAssets.map((uri) => persistMediaFile(uri, 'img'))
      );

      setNoteMediaUris((prev) => {
        const next = [...prev];
        for (const uri of persistentUris) {
          if (next.includes(uri)) continue;
          if (next.length >= MAX_MEDIA_PER_NOTE) break;
          next.push(uri);
        }
        return next;
      });
    } catch (error) {
      console.error('Error picking image:', error);
    }
  };

  const removeImageFromNote = async (uri: string) => {
    await removeMediaFile(uri);
    setNoteMediaUris((prev) => prev.filter((item) => item !== uri));
  };

  const startAudioRecording = async () => {
    if (isRecordingAudio) return;

    try {
      const permission = await requestRecordingPermissionsAsync();
      if (!permission.granted) return;

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      setIsRecordingAudio(true);
      setRecordingDurationMs(0);
    } catch (error) {
      console.error('Error starting audio recording:', error);
      setIsRecordingAudio(false);
    }
  };

  const stopAudioRecording = async () => {
    if (!isRecordingAudio) return;

    try {
      await audioRecorder.stop();
      const status = audioRecorder.getStatus();
      const uri = status.url || audioRecorder.uri;

      await setAudioModeAsync({
        allowsRecording: false,
        playsInSilentMode: true,
      });

      if (uri) {
        const persistentUri = await persistMediaFile(uri, 'aud');
        const clip: NoteAudioClip = {
          id: Date.now().toString(),
          uri: persistentUri,
          title: t('notes.audioDefaultTitle'),
          durationMs: status.durationMillis || 0,
          createdAt: new Date().toISOString(),
        };
        setNoteAudioClips((prev) => [clip, ...prev]);
      }
    } catch (error) {
      console.error('Error stopping audio recording:', error);
    } finally {
      setIsRecordingAudio(false);
      setRecordingDurationMs(0);
    }
  };

  const removeAudioClip = async (clipId: string) => {
    const clipToRemove = noteAudioClips.find((clip) => clip.id === clipId);
    if (clipToRemove && playingAudioUri === clipToRemove.uri && currentAudioPlayer) {
      currentAudioPlayer.pause();
      currentAudioPlayer.remove();
      setCurrentAudioPlayer(null);
      setPlayingAudioUri(null);
      setPlaybackPositionMs(0);
      setPlaybackDurationMs(0);
    }
    if (clipToRemove) {
      await removeMediaFile(clipToRemove.uri);
    }
    setNoteAudioClips((prev) => prev.filter((clip) => clip.id !== clipId));
  };

  const updateAudioClipTitle = (clipId: string, title: string) => {
    setNoteAudioClips((prev) =>
      prev.map((clip) =>
        clip.id === clipId
          ? { ...clip, title: title.trim() ? title : t('notes.audioDefaultTitle') }
          : clip
      )
    );
  };

  const playOrPauseAudio = async (uri: string) => {
    try {
      if (playingAudioUri === uri && currentAudioPlayer) {
        currentAudioPlayer.pause();
        currentAudioPlayer.remove();
        setCurrentAudioPlayer(null);
        setPlayingAudioUri(null);
        setPlaybackPositionMs(0);
        setPlaybackDurationMs(0);
        return;
      }

      if (currentAudioPlayer) {
        currentAudioPlayer.pause();
        currentAudioPlayer.remove();
      }

      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
        playbackIntervalRef.current = null;
      }

      const player = createAudioPlayer({ uri }, { updateInterval: 200 });
      player.play();

      setCurrentAudioPlayer(player);
      setPlayingAudioUri(uri);

      playbackIntervalRef.current = setInterval(() => {
        const durationMs = Math.max(0, Math.round((player.duration || 0) * 1000));
        const positionMs = Math.max(0, Math.round((player.currentTime || 0) * 1000));

        setPlaybackDurationMs(durationMs);
        setPlaybackPositionMs(positionMs);

        if (!player.playing && durationMs > 0 && positionMs >= durationMs) {
          player.remove();
          setCurrentAudioPlayer(null);
          setPlayingAudioUri(null);
          setPlaybackPositionMs(0);
          setPlaybackDurationMs(0);

          if (playbackIntervalRef.current) {
            clearInterval(playbackIntervalRef.current);
            playbackIntervalRef.current = null;
          }
        }
      }, 200);
    } catch (error) {
      console.error('Error playing audio clip:', error);
    }
  };

  const filteredNotes = notes.filter(
    (note) => {
      const search = searchQuery.toLowerCase();
      const tagMatches =
        !activeTagFilter ||
        (note.tags || []).some((tag) => tag.toLowerCase() === activeTagFilter.toLowerCase());
      const textMatches =
        note.title.toLowerCase().includes(search) ||
        note.content.toLowerCase().includes(search) ||
        (note.tags || []).some((tag) => tag.toLowerCase().includes(search));

      return tagMatches && textMatches;
    }
  );

  const tagCloud = useMemo(() => {
    const counts = new Map<string, number>();

    for (const note of notes) {
      for (const tag of note.tags || []) {
        const normalized = tag.toLowerCase();
        counts.set(normalized, (counts.get(normalized) || 0) + 1);
      }
    }

    return Array.from(counts.entries())
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => (b.count !== a.count ? b.count - a.count : a.tag.localeCompare(b.tag)));
  }, [notes]);

  useEffect(() => {
    loadNotes();
  }, []);

  useEffect(() => {
    if (isRecordingAudio) {
      setRecordingDurationMs(recorderState.durationMillis || 0);
    }
  }, [recorderState.durationMillis, isRecordingAudio]);

  useEffect(() => {
    return () => {
      if (currentAudioPlayer) {
        currentAudioPlayer.pause();
        currentAudioPlayer.remove();
      }
      if (playbackIntervalRef.current) {
        clearInterval(playbackIntervalRef.current);
      }
    };
  }, [currentAudioPlayer]);

  const getViewColumns = (width: number) => {
    if (width >= 420) return 3;
    if (width >= 280) return 2;
    return 1;
  };

  const viewColumns = getViewColumns(viewMediaContainerWidth || (windowWidth - 80));
  const viewGridGap = 8;
  const viewGridWidth = viewMediaContainerWidth || Math.max(240, windowWidth - 80);
  const gridItemSize = Math.max(
    86,
    Math.floor((viewGridWidth - viewGridGap * (viewColumns - 1)) / viewColumns)
  );

  return (
    <ScreenLayout tabName="notes">
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <ContentContainer paddingHorizontal={20} paddingVertical={20}>
          {/* Header */}
          <View style={{ marginBottom: isMessyMode ? 32 : 24 }}>
            <Text
              style={[
                textStyles.h1,
                { color: colors.text, textAlign: 'center', marginBottom: 8 },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('notes.title')}
            </Text>
            <Text
              style={[
                textStyles.body,
                { color: colors.textSecondary, textAlign: 'center', opacity: 0.9 },
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
              minimumFontScale={0.7}
            >
              {t('notes.subtitle')}
            </Text>
          </View>

          {/* Search */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('notes.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>

          {tagCloud.length > 0 && (
            <View style={styles.tagsCloudSection}>
              <Text style={[textStyles.caption, { color: colors.textSecondary, marginBottom: 8 }]}> 
                {t('notes.tagsCloudTitle')}
              </Text>
              <View style={styles.tagsWrap}>
                <TouchableOpacity
                  style={[
                    styles.tagChip,
                    { backgroundColor: colors.surface },
                    !activeTagFilter && { backgroundColor: colors.primary },
                  ]}
                  onPress={() => setActiveTagFilter(null)}
                  activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                >
                  <Text
                    style={[
                      textStyles.caption,
                      { color: !activeTagFilter ? colors.surface : colors.textSecondary },
                    ]}
                  >
                    {t('notes.allTags')}
                  </Text>
                </TouchableOpacity>

                {tagCloud.map(({ tag, count }) => {
                  const isActive = activeTagFilter === tag;
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[
                        styles.tagChip,
                        { backgroundColor: colors.surface },
                        isActive && { backgroundColor: colors.primary },
                      ]}
                      onPress={() => setActiveTagFilter(isActive ? null : tag)}
                      activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                    >
                      <Text
                        style={[
                          textStyles.caption,
                          { color: isActive ? colors.surface : colors.textSecondary },
                        ]}
                      >
                        #{tag} · {count}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addNoteButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddModal(true)}
            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
            accessibilityRole="button"
            accessibilityLabel={t('notes.addButton')}
          >
            <Plus size={24} color={colors.surface} />
            <Text style={[textStyles.button, { color: colors.surface }]}> 
              {t('notes.addButton')}
            </Text>
          </TouchableOpacity>

          {/* Notes List */}
          {filteredNotes.length > 0 ? (
            <View style={styles.notesContainer}>
              {filteredNotes.map((note) => (
                <View
                  key={note.id}
                  style={[styles.noteCard, { backgroundColor: colors.surface }]}
                >
                  <TouchableOpacity
                    onPress={() => openNote(note)}
                    activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                    style={{ flex: 1 }}
                    accessibilityRole="button"
                    accessibilityLabel={note.title}
                  >
                    <Text
                      style={[textStyles.h2, { color: colors.text, marginBottom: 8 }]}
                      numberOfLines={1}
                    >
                      {note.title}
                    </Text>
                    <Text
                      style={[textStyles.body, { color: colors.textSecondary, marginBottom: 12 }]}
                      numberOfLines={3}
                    >
                      {note.content}
                    </Text>
                    {(note.tags || []).length > 0 && (
                      <View style={styles.noteTagsRow}>
                        {(note.tags || []).slice(0, 4).map((tag) => (
                          <View key={tag} style={[styles.noteTag, { backgroundColor: colors.background[0] }]}>
                            <Text style={[textStyles.caption, { color: colors.textSecondary }]}>#{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {(note.mediaUris || []).length > 0 && (
                      <View style={styles.noteMediaPreviewRow}>
                        {(note.mediaUris || []).map((uri) => (
                          <TouchableOpacity
                            key={uri}
                            onPress={() => setPreviewImageUri(uri)}
                            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                          >
                            <Image source={{ uri }} style={styles.noteMediaThumb} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {(note.audioClips || []).length > 0 && (
                      <View style={styles.noteAudioSummaryRow}>
                        <Text style={[textStyles.caption, { color: colors.textSecondary }]}> 
                          🎙️ {(note.audioClips || []).length} {t('notes.audioCountLabel')}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={styles.noteFooter}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {formatDate(note.updatedAt, i18n.language)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => {
                        setEditingNote(note);
                        setNoteTitle(note.title);
                        setNoteContent(note.content);
                        setNoteTagsInput((note.tags || []).join(', '));
                        setNoteMediaUris(note.mediaUris || []);
                        setNoteAudioClips(note.audioClips || []);
                        setShowEditModal(true);
                      }}
                      style={styles.editButton}
                      activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                      accessibilityRole="button"
                      accessibilityLabel={t('common.edit')}
                    >
                      <Edit size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          ) : (
            <View style={styles.emptyState}>
              <BookOpen size={48} color={colors.textSecondary} />
              <Text
                style={[
                  textStyles.h2,
                  { color: colors.text, marginTop: 16, textAlign: 'center' },
                ]}
              >
                {searchQuery ? t('notes.emptySearchTitle') : t('notes.emptyTitle')}
              </Text>
              <Text
                style={[
                  textStyles.body,
                  { color: colors.textSecondary, marginTop: 8, textAlign: 'center' },
                ]}
              >
                {searchQuery
                  ? t('notes.emptySearchSubtitle')
                  : t('notes.emptySubtitle')}
              </Text>
            </View>
          )}
        </ContentContainer>
      </ScrollView>

      {/* Add Modal */}
      <Modal 
        visible={showAddModal} 
        animationType="fade" 
        transparent={true}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior="padding"
            keyboardVerticalOffset={0}
            style={styles.modalOverlay}
          >
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <Text style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}>
                  {t('notes.addModalTitle')}
                </Text>
                <TextInput
                  style={[styles.titleInput, { color: colors.text, borderColor: colors.primary }]}
                  placeholder={t('notes.titlePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                />
                <TextInput
                  style={[styles.titleInput, { color: colors.text, borderColor: colors.primary }]}
                  placeholder={t('notes.tagsPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={noteTagsInput}
                  onChangeText={setNoteTagsInput}
                />
                <View style={styles.mediaSection}> 
                  <View style={styles.mediaHeaderRow}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {t('notes.mediaSectionTitle')}
                    </Text>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}> 
                      {t('notes.mediaLimitHint', { count: MAX_MEDIA_PER_NOTE })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.mediaAddButton,
                      { backgroundColor: colors.background[0] },
                      noteMediaUris.length >= MAX_MEDIA_PER_NOTE && { opacity: 0.5 },
                    ]}
                    onPress={addImageToNote}
                    activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                    disabled={noteMediaUris.length >= MAX_MEDIA_PER_NOTE}
                  >
                    <Text style={[textStyles.caption, { color: colors.text }]}>
                      {t('notes.addImageButton')}
                    </Text>
                  </TouchableOpacity>

                  {noteMediaUris.length > 0 && (
                    <View style={styles.modalMediaGrid}>
                      {noteMediaUris.map((uri) => (
                        <View key={uri} style={styles.modalMediaItem}>
                          <TouchableOpacity
                            onPress={() => setPreviewImageUri(uri)}
                            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                          >
                            <Image source={{ uri }} style={styles.modalMediaThumb} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.removeMediaBtn, { backgroundColor: colors.surface }]}
                            onPress={() => removeImageFromNote(uri)}
                            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                            accessibilityRole="button"
                            accessibilityLabel={t('notes.removeImageLabel')}
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <View style={styles.mediaSection}> 
                  <View style={styles.mediaHeaderRow}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {t('notes.audioSectionTitle')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.mediaAddButton,
                      { backgroundColor: isRecordingAudio ? colors.primary : colors.background[0] },
                    ]}
                    onPress={isRecordingAudio ? stopAudioRecording : startAudioRecording}
                    activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                  >
                    {isRecordingAudio ? (
                      <Square size={18} color={colors.surface} />
                    ) : (
                      <Mic size={18} color={colors.text} />
                    )}
                  </TouchableOpacity>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}> 
                    {isRecordingAudio
                      ? `${formatAudioDuration(recordingDurationMs)} • REC`
                      : t('notes.startRecordingButton')}
                  </Text>

                  {noteAudioClips.length > 0 && (
                    <View style={styles.audioList}>
                      {noteAudioClips.map((clip) => (
                        <View key={clip.id} style={[styles.audioItem, { backgroundColor: colors.background[0] }]}>
                          <View style={styles.audioControlsRow}>
                            <TouchableOpacity
                              style={[styles.audioPlayBtn, { backgroundColor: colors.surface }]}
                              onPress={() => playOrPauseAudio(clip.uri)}
                              activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                            >
                              {playingAudioUri === clip.uri ? (
                                <Square size={14} color={colors.text} />
                              ) : (
                                <Play size={14} color={colors.text} />
                              )}
                            </TouchableOpacity>
                            <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                              {playingAudioUri === clip.uri
                                ? `${formatAudioDuration(playbackPositionMs)} / ${formatAudioDuration(playbackDurationMs || clip.durationMs)}`
                                : formatAudioDuration(clip.durationMs)}
                            </Text>
                            <TouchableOpacity
                              onPress={() => removeAudioClip(clip.id)}
                              activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                              accessibilityRole="button"
                              accessibilityLabel={t('notes.removeAudioLabel')}
                            >
                              <Trash2 size={14} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                          <TextInput
                            style={[styles.audioTitleInput, { color: colors.text, borderColor: colors.surface }]}
                            value={clip.title}
                            onChangeText={(value) => updateAudioClipTitle(clip.id, value)}
                            placeholder={t('notes.audioTitlePlaceholder')}
                            placeholderTextColor={colors.textSecondary}
                          />
                          <View style={[styles.audioProgressTrack, { backgroundColor: colors.surface }]}> 
                            <View
                              style={[
                                styles.audioProgressFill,
                                {
                                  backgroundColor: colors.primary,
                                  width: `${playingAudioUri === clip.uri && (playbackDurationMs || clip.durationMs) > 0
                                    ? Math.min(100, (playbackPositionMs / (playbackDurationMs || clip.durationMs)) * 100)
                                    : 0}%`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <TextInput
                  style={[styles.contentInput, { color: colors.text, borderColor: colors.primary, maxHeight: 100 }]}
                  placeholder={t('notes.contentPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={noteContent}
                  onChangeText={setNoteContent}
                  multiline
                  autoFocus
                  scrollEnabled={true}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.background[0] }]}
                    onPress={() => {
                      setShowAddModal(false);
                      setNoteTitle('');
                      setNoteContent('');
                      setNoteTagsInput('');
                      setNoteMediaUris([]);
                      setNoteAudioClips([]);
                    }}
                    activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.cancel')}
                  >
                    <Text style={[textStyles.button, { color: colors.text }]}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={addNote}
                    activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.add')}
                  >
                    <Text style={[textStyles.button, { color: colors.surface }]}> 
                      {t('common.add')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* Edit Modal */}
      <Modal 
        visible={showEditModal} 
        animationType="fade" 
        transparent={true} 
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <KeyboardAvoidingView 
            behavior="padding"
            keyboardVerticalOffset={0}
            style={styles.modalOverlay}
          >
            <TouchableWithoutFeedback>
              <View style={[styles.modalContent, { backgroundColor: colors.surface }]}>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => editingNote && deleteNote(editingNote.id)}
                  activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                  accessibilityRole="button"
                  accessibilityLabel={t('common.delete')}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
                <Text style={[textStyles.h2, { color: colors.text, marginBottom: 16 }]}>
                  {t('notes.editModalTitle')}
                </Text>
                <TextInput
                  style={[styles.titleInput, { color: colors.text, borderColor: colors.primary }]}
                  placeholder={t('notes.titlePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={noteTitle}
                  onChangeText={setNoteTitle}
                />
                <TextInput
                  style={[styles.titleInput, { color: colors.text, borderColor: colors.primary }]}
                  placeholder={t('notes.tagsPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={noteTagsInput}
                  onChangeText={setNoteTagsInput}
                />
                <View style={styles.mediaSection}> 
                  <View style={styles.mediaHeaderRow}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {t('notes.mediaSectionTitle')}
                    </Text>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}> 
                      {t('notes.mediaLimitHint', { count: MAX_MEDIA_PER_NOTE })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[
                      styles.mediaAddButton,
                      { backgroundColor: colors.background[0] },
                      noteMediaUris.length >= MAX_MEDIA_PER_NOTE && { opacity: 0.5 },
                    ]}
                    onPress={addImageToNote}
                    activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                    disabled={noteMediaUris.length >= MAX_MEDIA_PER_NOTE}
                  >
                    <Text style={[textStyles.caption, { color: colors.text }]}>
                      {t('notes.addImageButton')}
                    </Text>
                  </TouchableOpacity>

                  {noteMediaUris.length > 0 && (
                    <View style={styles.modalMediaGrid}>
                      {noteMediaUris.map((uri) => (
                        <View key={uri} style={styles.modalMediaItem}>
                          <TouchableOpacity
                            onPress={() => setPreviewImageUri(uri)}
                            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                          >
                            <Image source={{ uri }} style={styles.modalMediaThumb} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.removeMediaBtn, { backgroundColor: colors.surface }]}
                            onPress={() => removeImageFromNote(uri)}
                            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                            accessibilityRole="button"
                            accessibilityLabel={t('notes.removeImageLabel')}
                          >
                            <Trash2 size={14} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <View style={styles.mediaSection}> 
                  <View style={styles.mediaHeaderRow}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {t('notes.audioSectionTitle')}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[
                      styles.mediaAddButton,
                      { backgroundColor: isRecordingAudio ? colors.primary : colors.background[0] },
                    ]}
                    onPress={isRecordingAudio ? stopAudioRecording : startAudioRecording}
                    activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                  >
                    {isRecordingAudio ? (
                      <Square size={18} color={colors.surface} />
                    ) : (
                      <Mic size={18} color={colors.text} />
                    )}
                  </TouchableOpacity>
                  <Text style={[textStyles.caption, { color: colors.textSecondary }]}> 
                    {isRecordingAudio
                      ? `${formatAudioDuration(recordingDurationMs)} • REC`
                      : t('notes.startRecordingButton')}
                  </Text>

                  {noteAudioClips.length > 0 && (
                    <View style={styles.audioList}>
                      {noteAudioClips.map((clip) => (
                        <View key={clip.id} style={[styles.audioItem, { backgroundColor: colors.background[0] }]}>
                          <View style={styles.audioControlsRow}>
                            <TouchableOpacity
                              style={[styles.audioPlayBtn, { backgroundColor: colors.surface }]}
                              onPress={() => playOrPauseAudio(clip.uri)}
                              activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                            >
                              {playingAudioUri === clip.uri ? (
                                <Square size={14} color={colors.text} />
                              ) : (
                                <Play size={14} color={colors.text} />
                              )}
                            </TouchableOpacity>
                            <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                              {playingAudioUri === clip.uri
                                ? `${formatAudioDuration(playbackPositionMs)} / ${formatAudioDuration(playbackDurationMs || clip.durationMs)}`
                                : formatAudioDuration(clip.durationMs)}
                            </Text>
                            <TouchableOpacity
                              onPress={() => removeAudioClip(clip.id)}
                              activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                              accessibilityRole="button"
                              accessibilityLabel={t('notes.removeAudioLabel')}
                            >
                              <Trash2 size={14} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                          <TextInput
                            style={[styles.audioTitleInput, { color: colors.text, borderColor: colors.surface }]}
                            value={clip.title}
                            onChangeText={(value) => updateAudioClipTitle(clip.id, value)}
                            placeholder={t('notes.audioTitlePlaceholder')}
                            placeholderTextColor={colors.textSecondary}
                          />
                          <View style={[styles.audioProgressTrack, { backgroundColor: colors.surface }]}> 
                            <View
                              style={[
                                styles.audioProgressFill,
                                {
                                  backgroundColor: colors.primary,
                                  width: `${playingAudioUri === clip.uri && (playbackDurationMs || clip.durationMs) > 0
                                    ? Math.min(100, (playbackPositionMs / (playbackDurationMs || clip.durationMs)) * 100)
                                    : 0}%`,
                                },
                              ]}
                            />
                          </View>
                        </View>
                      ))}
                    </View>
                  )}
                </View>
                <TextInput
                  style={[styles.contentInput, { color: colors.text, borderColor: colors.primary, maxHeight: 100 }]}
                  placeholder={t('notes.contentPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={noteContent}
                  onChangeText={setNoteContent}
                  multiline
                  autoFocus
                  scrollEnabled={true}
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.background[0] }]}
                    onPress={() => {
                      setShowEditModal(false);
                      setNoteTitle('');
                      setNoteContent('');
                      setNoteTagsInput('');
                      setNoteMediaUris([]);
                      setNoteAudioClips([]);
                      setEditingNote(null);
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.cancel')}
                  >
                    <Text style={[textStyles.button, { color: colors.text }]}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={editNote}
                    activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                    accessibilityRole="button"
                    accessibilityLabel={t('common.save')}
                  >
                    <Text style={[textStyles.button, { color: colors.surface }]}> 
                      {t('common.save')}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </TouchableWithoutFeedback>
      </Modal>

      {/* View Modal */}
      <Modal visible={showViewModal} animationType="fade" transparent={true} statusBarTranslucent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.viewModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.viewHeader}>
              <Text
                style={[textStyles.h2, { color: colors.text, flex: 1 }]}
                numberOfLines={2}
              >
                {viewingNote?.title}
              </Text>
              <TouchableOpacity
                onPress={openEditFromView}
                style={styles.editIconButton}
                activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                accessibilityRole="button"
                accessibilityLabel={t('common.edit')}
              >
                <Edit size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[textStyles.caption, { color: colors.textSecondary, marginBottom: 16 }]}>
              {viewingNote && formatDate(viewingNote.updatedAt, i18n.language)}
            </Text>
            <ScrollView
              style={styles.viewScroll}
              contentContainerStyle={styles.viewScrollContent}
              showsVerticalScrollIndicator={false}
            >
              {(viewingNote?.tags || []).length > 0 && (
                <View style={styles.noteTagsRow}>
                  {(viewingNote?.tags || []).map((tag) => (
                    <View key={tag} style={[styles.noteTag, { backgroundColor: colors.background[0] }]}> 
                      <Text style={[textStyles.caption, { color: colors.textSecondary }]}>#{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {(viewingNote?.mediaUris || []).length > 0 && (
                <View
                  style={styles.viewMediaRow}
                  onLayout={(event) => {
                    const width = event.nativeEvent.layout.width;
                    if (width > 0 && width !== viewMediaContainerWidth) {
                      setViewMediaContainerWidth(width);
                    }
                  }}
                >
                  {(viewingNote?.mediaUris || []).map((uri) => (
                    <TouchableOpacity
                      key={uri}
                      onPress={() => setPreviewImageUri(uri)}
                      activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                    >
                      <Image
                        source={{ uri }}
                        style={[styles.viewMediaThumb, { width: gridItemSize, height: gridItemSize }]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {(viewingNote?.audioClips || []).length > 0 && (
                <View style={styles.audioList}>
                  {(viewingNote?.audioClips || []).map((clip) => (
                    <View key={clip.id} style={[styles.audioItem, { backgroundColor: colors.background[0] }]}>
                      <View style={styles.audioControlsRow}>
                        <TouchableOpacity
                          style={[styles.audioPlayBtn, { backgroundColor: colors.surface }]}
                          onPress={() => playOrPauseAudio(clip.uri)}
                          activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                        >
                          {playingAudioUri === clip.uri ? (
                            <Square size={14} color={colors.text} />
                          ) : (
                            <Play size={14} color={colors.text} />
                          )}
                        </TouchableOpacity>
                        <Text style={[textStyles.caption, { color: colors.textSecondary, flex: 1 }]}> 
                          {clip.title}
                        </Text>
                        <Text style={[textStyles.caption, { color: colors.textSecondary }]}> 
                          {playingAudioUri === clip.uri
                            ? `${formatAudioDuration(playbackPositionMs)} / ${formatAudioDuration(playbackDurationMs || clip.durationMs)}`
                            : formatAudioDuration(clip.durationMs)}
                        </Text>
                      </View>
                      <View style={[styles.audioProgressTrack, { backgroundColor: colors.surface }]}> 
                        <View
                          style={[
                            styles.audioProgressFill,
                            {
                              backgroundColor: colors.primary,
                              width: `${playingAudioUri === clip.uri && (playbackDurationMs || clip.durationMs) > 0
                                ? Math.min(100, (playbackPositionMs / (playbackDurationMs || clip.durationMs)) * 100)
                                : 0}%`,
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              <Text style={[textStyles.body, { color: colors.text }]}>
                {viewingNote?.content}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.background[0] }]}
              onPress={() => {
                setShowViewModal(false);
                setViewingNote(null);
                setNoteAudioClips([]);
              }}
              activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
              accessibilityRole="button"
              accessibilityLabel={t('common.close')}
            >
              <Text style={[textStyles.button, { color: colors.text }]}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!previewImageUri}
        animationType="fade"
        transparent={true}
        statusBarTranslucent={true}
      >
        <TouchableWithoutFeedback onPress={() => setPreviewImageUri(null)}>
          <View
            style={{
              flex: 1,
              backgroundColor: 'rgba(0,0,0,0.92)',
              justifyContent: 'center',
              alignItems: 'center',
              paddingHorizontal: 12,
            }}
          >
            {previewImageUri && (
              <Image
                source={{ uri: previewImageUri }}
                resizeMode="contain"
                style={{ width: windowWidth - 24, aspectRatio: 1 }}
              />
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ConfirmDialog
        visible={confirmDialog.visible}
        title={confirmDialog.title}
        message={confirmDialog.message}
        onConfirm={() => {
          confirmDialog.onConfirm();
          setConfirmDialog((d) => ({ ...d, visible: false }));
        }}
        onCancel={() => setConfirmDialog((d) => ({ ...d, visible: false }))}
      />
    </ScreenLayout>
  );
}
