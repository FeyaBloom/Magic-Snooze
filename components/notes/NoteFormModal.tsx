import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Modal, View, Text, TextInput, TouchableOpacity, ScrollView,
  Image, KeyboardAvoidingView, Keyboard, Platform, Pressable, StatusBar,
} from 'react-native';
import { Mic, Square, Trash2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';

import { Note, NoteInput, NoteAudioClip, parseTags, persistFile, deleteFile } from '@/hooks/useNotes';
import { useNoteAudioRecorder } from '@/hooks/useNoteAudioRecorder';
import { AudioClipList } from './AudioClipList';
import { useTranslation } from 'react-i18next';
import { createNotesStyles } from '@/styles/notes';

const MAX_IMAGES = 6;

interface Props {
  visible: boolean;
  note?: Note | null;
  onSave: (input: NoteInput) => Promise<void>;
  onDelete?: () => void;
  onClose: () => void;
  colors: any;
  textStyles: any;
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function NoteFormModal({ visible, note, onSave, onDelete, onClose, colors, textStyles }: Props) {
  const { t } = useTranslation();
  const styles = createNotesStyles(colors);
  const isEdit = !!note;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [clips, setClips] = useState<NoteAudioClip[]>([]);
  const formScrollRef = useRef<ScrollView>(null);

  const recorder = useNoteAudioRecorder(t('notes.audioDefaultTitle'));

  useEffect(() => {
    if (!visible) return;
    setTitle(note?.title ?? '');
    setContent(note?.content ?? '');
    setTagsInput((note?.tags ?? []).join(', '));
    setImages(note?.mediaUris ?? []);
    setClips(note?.audioClips ?? []);
  }, [visible, note]);

  const reset = () => {
    setTitle(''); setContent(''); setTagsInput(''); setImages([]); setClips([]);
  };

  const handleClose = () => { reset(); onClose(); };

  const handleSave = async () => {
    if (!title.trim() && !content.trim() && !images.length && !clips.length) return;
    await onSave({
      title: title.trim() || t('notes.untitled'),
      content: content.trim(),
      tags: parseTags(tagsInput),
      mediaUris: images,
      audioClips: clips,
    });
    reset();
    onClose();
  };

  // ── images ───────────────────────────────────────────────────────────────────

  const pickImages = async () => {
    if (images.length >= MAX_IMAGES) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      selectionLimit: MAX_IMAGES - images.length,
      quality: 0.7,
    });

    if (result.canceled || !result.assets?.length) return;

    const uris = await Promise.all(result.assets.map(a => persistFile(a.uri, 'img')));
    setImages(prev => {
      const next = [...prev];
      for (const uri of uris) {
        if (!next.includes(uri) && next.length < MAX_IMAGES) next.push(uri);
      }
      return next;
    });
  };

  const removeImage = async (uri: string) => {
    await deleteFile(uri);
    setImages(prev => prev.filter(u => u !== uri));
  };

  // ── audio ────────────────────────────────────────────────────────────────────

  const handleRecordToggle = async () => {
    if (recorder.isRecording) {
      const clip = await recorder.stop();
      if (clip) setClips(prev => [clip, ...prev]);
    } else {
      await recorder.start();
    }
  };

  const removeClip = async (id: string) => {
    const clip = clips.find(c => c.id === id);
    if (clip) await deleteFile(clip.uri);
    setClips(prev => prev.filter(c => c.id !== id));
  };

  const renameClip = (id: string, title: string) =>
    setClips(prev => prev.map(c => c.id === id ? { ...c, title: title || t('notes.audioDefaultTitle') } : c));

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      formScrollRef.current?.scrollToEnd({ animated: true });
    }, 120);
  }, []);

  const scrollSlightlyDown = useCallback(() => {
    setTimeout(() => {
      formScrollRef.current?.scrollTo({ y: 140, animated: true });
    }, 120);
  }, []);

  // ── render ───────────────────────────────────────────────────────────────────

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
      onShow={() => StatusBar.setHidden(true, 'none')}
      onDismiss={() => StatusBar.setHidden(true, 'none')}
      onRequestClose={() => {
        StatusBar.setHidden(true, 'none');
        handleClose();
      }}
    >
      <KeyboardAvoidingView
        style={styles.modalOverlay}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <Pressable style={styles.modalBackdrop} onPress={Keyboard.dismiss} />
        <View style={[styles.modalContent, { backgroundColor: colors.surface }]}> 
              {/* header */}
              <View style={styles.modalHeader}>
                <Text style={[textStyles.h2, { color: colors.text, textAlign: 'center' }]}>
                  {isEdit ? t('notes.editModalTitle') : t('notes.addModalTitle')}
                </Text>
                {isEdit && onDelete && (
                  <TouchableOpacity onPress={onDelete} activeOpacity={0.7} style={styles.deleteButton}>
                    <Trash2 size={20} color="#EF4444" />
                  </TouchableOpacity>
                )}
              </View>

              <ScrollView
                ref={formScrollRef}
                style={styles.formScroll}
                contentContainerStyle={styles.formScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
                nestedScrollEnabled
              >
                <TextInput
                  style={[styles.titleInput, { color: colors.text, borderColor: colors.primary }]}
                  placeholder={t('notes.titlePlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={title}
                  onChangeText={setTitle}
                />
                <TextInput
                  style={[styles.titleInput, { color: colors.text, borderColor: colors.primary }]}
                  placeholder={t('notes.tagsPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={tagsInput}
                  onChangeText={setTagsInput}
                />
                <TextInput
                  style={[styles.contentInput, { color: colors.text, borderColor: colors.primary }]}
                  placeholder={t('notes.contentPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={content}
                  onChangeText={setContent}
                  onFocus={scrollSlightlyDown}
                  multiline
                  scrollEnabled
                  autoFocus={!isEdit}
                />

                {/* images */}
                <View style={styles.mediaSection}>
                  <View style={styles.mediaHeaderRow}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {t('notes.mediaSectionTitle')}
                    </Text>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {t('notes.mediaLimitHint', { count: MAX_IMAGES })}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.mediaAddButton, { backgroundColor: `${colors.secondary}80`, opacity: images.length >= MAX_IMAGES ? 0.4 : 1 }]}
                    onPress={pickImages}
                    disabled={images.length >= MAX_IMAGES}
                    activeOpacity={0.7}
                  >
                    <Text style={[textStyles.caption, { color: colors.surface }]}>{t('notes.addImageButton')}</Text>
                  </TouchableOpacity>
                  {images.length > 0 && (
                    <View style={styles.modalMediaGrid}>
                      {images.map(uri => (
                        <View key={uri} style={styles.modalMediaItem}>
                          <TouchableOpacity onPress={() => {}} activeOpacity={0.8}>
                            <Image source={{ uri }} style={styles.modalMediaThumb} />
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.removeMediaBtn, { backgroundColor: colors.surface }]}
                            onPress={() => removeImage(uri)}
                            activeOpacity={0.7}
                          >
                            <Trash2 size={12} color="#EF4444" />
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}
                </View>

                {/* audio */}
                <View style={styles.mediaSection}>
                  <View style={styles.mediaHeaderRow}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {t('notes.audioSectionTitle')}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TouchableOpacity
                      style={[styles.mediaAddButton, { backgroundColor: recorder.isRecording ? colors.secondary : `${colors.secondary}80` }]}
                      onPress={handleRecordToggle}
                      activeOpacity={0.7}
                    >
                      {recorder.isRecording
                        ? <Square size={16} color={colors.surface} />
                        : <Mic size={16} color={colors.surface} />}
                    </TouchableOpacity>
                    {recorder.isRecording && (
                      <Text style={[textStyles.caption, { color: colors.secondary }]}>
                        {fmt(recorder.durationMs)} • REC
                      </Text>
                    )}
                  </View>
                  <AudioClipList
                    clips={clips}
                    onRemove={removeClip}
                    onRenameTitle={renameClip}
                    onTitleFocus={scrollToBottom}
                    colors={colors}
                    textStyles={textStyles}
                  />
                </View>
              </ScrollView>

              {/* footer */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: `${colors.primary}80` }]}
                  onPress={handleClose}
                  activeOpacity={0.7}
                >
                  <Text style={[textStyles.button, { color: colors.text }]}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: colors.secondary }]}
                  onPress={handleSave}
                  activeOpacity={0.7}
                >
                  <Text style={[textStyles.button, { color: colors.surface }]}>
                    {isEdit ? t('common.save') : t('common.add')}
                  </Text>
                </TouchableOpacity>
              </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}