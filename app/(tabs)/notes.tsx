import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Modal, Image, TouchableWithoutFeedback,
  useWindowDimensions,
  StatusBar,
} from 'react-native';
import { Plus, Edit, Search, BookOpen } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

import { ScreenLayout } from '@/components/ScreenLayout';
import { ContentContainer } from '@/components/ContentContainer';
import { ConfirmDialog } from '@/components/modals/ConfirmDialog';
import { NoteFormModal } from '@/components/notes/NoteFormModal';
import { AudioClipList } from '@/components/notes/AudioClipList';

import { useNotes, Note } from '@/hooks/useNotes';
import { useTextStyles } from '@/hooks/useTextStyles';
import { useTheme } from '@/components/ThemeProvider';
import { formatDate } from '@/utils/dateUtils';
import { createNotesStyles } from '@/styles/notes';
import { TOUCHABLE_CONFIG } from '@/styles/touchable';

export default function NotesScreen() {
  const { t, i18n } = useTranslation();
  const textStyles = useTextStyles();
  const { colors, isMessyMode } = useTheme();
  const { width } = useWindowDimensions();
  const { notes, addNote, updateNote, deleteNote } = useNotes();
  const styles = createNotesStyles(colors);

  const [search, setSearch] = useState('');
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string } | null>(null);
  const [viewMediaWidth, setViewMediaWidth] = useState(0);

  // ── derived ───────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return notes.filter(n => {
      const tagOk = !tagFilter || n.tags.includes(tagFilter);
      const textOk = !q ||
        n.title.toLowerCase().includes(q) ||
        n.content.toLowerCase().includes(q) ||
        n.tags.some(tag => tag.includes(q));
      return tagOk && textOk;
    });
  }, [notes, search, tagFilter]);

  const tagCloud = useMemo(() => {
    const counts = new Map<string, number>();
    for (const n of notes) for (const tag of n.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
    return [...counts.entries()]
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
  }, [notes]);

  // grid size for view modal images
  const viewColumns = viewMediaWidth >= 420 ? 3 : viewMediaWidth >= 280 ? 2 : 1;
  const viewGap = 8;
  const viewItemSize = Math.max(86, Math.floor((viewMediaWidth - viewGap * (viewColumns - 1)) / viewColumns));

  // ── handlers ──────────────────────────────────────────────────────────────

  const openEdit = (note: Note) => {
    setViewingNote(null);
    setEditingNote(note);
    setShowForm(true);
  };

  const confirmDoDelete = async () => {
    if (!confirmDelete) return;
    await deleteNote(confirmDelete.id);
    setConfirmDelete(null);
    setShowForm(false);
    setViewingNote(null);
    setEditingNote(null);
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <ScreenLayout tabName="notes">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <ContentContainer paddingHorizontal={20} paddingVertical={20}>

          {/* header */}
          <View style={{ marginBottom: isMessyMode ? 32 : 24 }}>
            <Text style={[textStyles.h1, { color: colors.text, textAlign: 'center', marginBottom: 8 }]}
              numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {t('notes.title')}
            </Text>
            <Text style={[textStyles.body, { color: colors.textSecondary, textAlign: 'center' }]}
              numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
              {t('notes.subtitle')}
            </Text>
          </View>

          {/* search */}
          <View style={[styles.searchContainer, { backgroundColor: colors.surface }]}>
            <Search size={20} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder={t('notes.searchPlaceholder')}
              placeholderTextColor={colors.textSecondary}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          {/* add button */}
          <TouchableOpacity
            style={[styles.addNoteButton, { backgroundColor: colors.primary }]}
            onPress={() => { setEditingNote(null); setShowForm(true); }}
            activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
          >
            <Plus size={22} color={colors.surface} />
            <Text style={[textStyles.button, { color: colors.surface }]}>{t('notes.addButton')}</Text>
          </TouchableOpacity>


          {/* tag cloud */}
          {tagCloud.length > 0 && (
            <View style={styles.tagsCloudSection}>
              <View style={styles.tagsWrap}>
                {[{ tag: null, label: t('notes.allTags') }, ...tagCloud.map(tc => ({ tag: tc.tag, label: `${tc.tag} · ${tc.count}` }))].map(({ tag, label }) => {
                  const active = tagFilter === tag;
                  return (
                    <TouchableOpacity
                      key={tag ?? '__all'}
                      style={[styles.tagChip, { backgroundColor: active ? colors.secondary : colors.surface }]}
                      onPress={() => setTagFilter(active ? null : tag)}
                      activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                    >
                      <Text style={[textStyles.caption, { color: active ? colors.surface : colors.textSecondary }]}>
                        {label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}


          {/* notes list */}
          {filtered.length > 0 ? (
            <View style={styles.notesContainer}>
              {filtered.map(note => (
                <View key={note.id} style={[styles.noteCard, { backgroundColor: colors.surface }]}>
                  <TouchableOpacity
                    onPress={() => setViewingNote(note)}
                    activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
                    style={{ flex: 1 }}
                  >
                    <Text style={[textStyles.h2, { color: colors.text, marginBottom: 8 }]} numberOfLines={1}>
                      {note.title}
                    </Text>
                    {!!note.content && (
                      <Text style={[textStyles.body, { color: colors.textSecondary, marginBottom: 12 }]} numberOfLines={3}>
                        {note.content}
                      </Text>
                    )}
                    {note.tags.length > 0 && (
                      <View style={styles.noteTagsRow}>
                        {note.tags.slice(0, 4).map(tag => (
                          <View key={tag} style={[styles.noteTag, { backgroundColor: `${colors.secondary}80` }]}>
                            <Text style={[textStyles.caption, { color: colors.textSecondary }]}>{tag}</Text>
                          </View>
                        ))}
                      </View>
                    )}
                    {note.mediaUris.length > 0 && (
                      <View style={styles.noteMediaPreviewRow}>
                        {note.mediaUris.map(uri => (
                          <TouchableOpacity key={uri} onPress={() => setPreviewUri(uri)} activeOpacity={0.8}>
                            <Image source={{ uri }} style={styles.noteMediaThumb} />
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                    {note.audioClips.length > 0 && (
                      <View style={styles.noteAudioSummaryRow}>
                        <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                          🎙️ {note.audioClips.length} {t('notes.audioCountLabel')}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={styles.noteFooter}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {formatDate(note.updatedAt, i18n.language)}
                    </Text>
                    <TouchableOpacity
                      onPress={() => openEdit(note)}
                      style={styles.editButton}
                      activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
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
              <Text style={[textStyles.h2, { color: colors.text, marginTop: 16, textAlign: 'center' }]}>
                {search ? t('notes.emptySearchTitle') : t('notes.emptyTitle')}
              </Text>
              <Text style={[textStyles.body, { color: colors.textSecondary, marginTop: 8, textAlign: 'center' }]}>
                {search ? t('notes.emptySearchSubtitle') : t('notes.emptySubtitle')}
              </Text>
            </View>
          )}
        </ContentContainer>
      </ScrollView>

      {/* form modal */}
      <NoteFormModal
        visible={showForm}
        note={editingNote}
        onSave={async input => {
          if (editingNote) await updateNote(editingNote.id, input);
          else await addNote(input);
        }}
        onDelete={editingNote ? () => setConfirmDelete({ id: editingNote.id }) : undefined}
        onClose={() => { setShowForm(false); setEditingNote(null); }}
        colors={colors}
        textStyles={textStyles}
      />

      {/* view modal */}
      <Modal
        visible={!!viewingNote}
        animationType="fade"
        transparent
        statusBarTranslucent
        onShow={() => StatusBar.setHidden(true, 'none')}
        onDismiss={() => StatusBar.setHidden(true, 'none')}
        onRequestClose={() => {
          StatusBar.setHidden(true, 'none');
          setViewingNote(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.viewModalContent, { backgroundColor: colors.surface }]}>
            <View style={styles.viewHeader}>
              <Text style={[textStyles.h2, { color: colors.text, flex: 1 }]} numberOfLines={2}>
                {viewingNote?.title}
              </Text>
              <TouchableOpacity
                onPress={() => viewingNote && openEdit(viewingNote)}
                style={styles.editIconButton}
                activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
              >
                <Edit size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[textStyles.caption, { color: colors.textSecondary, marginBottom: 16 }]}>
              {viewingNote && formatDate(viewingNote.updatedAt, i18n.language)}
            </Text>

            <ScrollView style={styles.viewScroll} contentContainerStyle={styles.viewScrollContent} showsVerticalScrollIndicator={false}>
              {(viewingNote?.tags ?? []).length > 0 && (
                <View style={styles.noteTagsRow}>
                  {viewingNote!.tags.map(tag => (
                    <View key={tag} style={[styles.noteTag, { backgroundColor: `${colors.secondary}80` }]}> 
                      <Text style={[textStyles.caption, { color: colors.textSecondary }]}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}

              {(viewingNote?.mediaUris ?? []).length > 0 && (
                <View
                  style={styles.viewMediaRow}
                  onLayout={e => {
                    const w = e.nativeEvent.layout.width;
                    if (w > 0) setViewMediaWidth(w);
                  }}
                >
                  {viewingNote!.mediaUris.map(uri => (
                    <TouchableOpacity key={uri} onPress={() => setPreviewUri(uri)} activeOpacity={0.8}>
                      <Image
                        source={{ uri }}
                        style={[styles.viewMediaThumb, { width: viewItemSize, height: viewItemSize }]}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {(viewingNote?.audioClips ?? []).length > 0 && (
                <AudioClipList
                  clips={viewingNote!.audioClips}
                  colors={colors}
                  textStyles={textStyles}
                />
              )}

              {!!viewingNote?.content && (
                <Text style={[textStyles.body, { color: colors.text }]}>
                  {viewingNote.content}
                </Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.primary }]}
              onPress={() => setViewingNote(null)}
              activeOpacity={TOUCHABLE_CONFIG.activeOpacity}
            >
              <Text style={[textStyles.button, { color: colors.surface }]}>{t('common.close')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* image preview */}
      <Modal
        visible={!!previewUri}
        animationType="fade"
        transparent
        statusBarTranslucent
        onShow={() => StatusBar.setHidden(true, 'none')}
        onDismiss={() => StatusBar.setHidden(true, 'none')}
        onRequestClose={() => {
          StatusBar.setHidden(true, 'none');
          setPreviewUri(null);
        }}
      >
        <TouchableWithoutFeedback onPress={() => setPreviewUri(null)}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.92)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 12 }}>
            {previewUri && (
              <Image source={{ uri: previewUri }} resizeMode="contain" style={{ width: width - 24, aspectRatio: 1 }} />
            )}
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      <ConfirmDialog
        visible={!!confirmDelete}
        title={t('notes.deleteTitle')}
        message={t('notes.deleteMessage')}
        onConfirm={confirmDoDelete}
        onCancel={() => setConfirmDelete(null)}
      />
    </ScreenLayout>
  );
}