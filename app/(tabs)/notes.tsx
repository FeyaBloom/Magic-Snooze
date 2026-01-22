import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  AppState
} from 'react-native';
import { Plus, Edit, Trash2, Search, BookOpen } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as NavigationBar from 'expo-navigation-bar';
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

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesScreen() {
  const { t, i18n } = useTranslation();
  const textStyles = useTextStyles();
  const { colors, isMessyMode } = useTheme();

  const [notes, setNotes] = useState<Note[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [viewingNote, setViewingNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDialog, setConfirmDialog] = useState({
    visible: false,
    title: '',
    message: '',
    onConfirm: () => {},
  });

  const styles = createNotesStyles(colors);


  const loadNotes = async () => {
    try {
      const notesData = await AsyncStorage.getItem('personalNotes');
      if (notesData) {
        const parsedNotes = JSON.parse(notesData);
        parsedNotes.sort(
          (a: Note, b: Note) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        setNotes(parsedNotes);
      }
    } catch (error) {
      console.error('Error loading notes:', error);
    }
  };

  const saveNotes = async (updatedNotes: Note[]) => {
    try {
      await AsyncStorage.setItem('personalNotes', JSON.stringify(updatedNotes));
      setNotes(updatedNotes);
    } catch (error) {
      console.error('Error saving notes:', error);
    }
  };

  const addNote = async () => {
    if (!noteTitle.trim() && !noteContent.trim()) return;

    const newNote: Note = {
      id: Date.now().toString(),
      title: noteTitle.trim() || t('notes.untitled'),
      content: noteContent.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = [newNote, ...notes];
    await saveNotes(updatedNotes);

    setNoteTitle('');
    setNoteContent('');
    setShowAddModal(false);
  };

  const editNote = async () => {
    if (!editingNote) return;

    const updatedNote: Note = {
      ...editingNote,
      title: noteTitle.trim() || t('notes.untitled'),
      content: noteContent.trim(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map((note) =>
      note.id === editingNote.id ? updatedNote : note
    );

    updatedNotes.sort(
      (a: Note, b: Note) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    await saveNotes(updatedNotes);

    setNoteTitle('');
    setNoteContent('');
    setEditingNote(null);
    setShowEditModal(false);
  };

  const deleteNote = (noteId: string) => {
    setConfirmDialog({
      visible: true,
      title: t('notes.deleteTitle'),
      message: t('notes.deleteMessage'),
      onConfirm: async () => {
        const updatedNotes = notes.filter((note) => note.id !== noteId);
        await saveNotes(updatedNotes);
        setShowEditModal(false);
        setShowViewModal(false);
        setEditingNote(null);
        setViewingNote(null);
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
      setShowViewModal(false);
      setShowEditModal(true);
    }
  };

  const filteredNotes = notes.filter(
    (note) =>
      note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    loadNotes();
  }, []);

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

          {/* Add Button */}
          <TouchableOpacity
            style={[styles.addNoteButton, { backgroundColor: colors.primary }]}
            onPress={() => setShowAddModal(true)}
          >
            <Plus size={24} color="#FFFFFF" />
            <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
              {t('notes.addButton')}
            </Text>
          </TouchableOpacity>

          {/* Notes List */}
          {filteredNotes.length > 0 ? (
            <View style={styles.notesContainer}>
              {filteredNotes.map((note) => (
                <TouchableOpacity
                  key={note.id}
                  style={[styles.noteCard, { backgroundColor: colors.surface }]}
                  onPress={() => openNote(note)}
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
                  <View style={styles.noteFooter}>
                    <Text style={[textStyles.caption, { color: colors.textSecondary }]}>
                      {formatDate(note.updatedAt, i18n.language)}
                    </Text>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation();
                        setEditingNote(note);
                        setNoteTitle(note.title);
                        setNoteContent(note.content);
                        setShowEditModal(true);
                      }}
                      style={styles.editButton}
                    >
                      <Edit size={16} color={colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
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
                  style={[styles.contentInput, { color: colors.text, borderColor: colors.primary }]}
                  placeholder={t('notes.contentPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={noteContent}
                  onChangeText={setNoteContent}
                  multiline
                  autoFocus
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.background[0] }]}
                    onPress={() => {
                      setShowAddModal(false);
                      setNoteTitle('');
                      setNoteContent('');
                    }}
                  >
                    <Text style={[textStyles.button, { color: colors.text }]}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={addNote}
                  >
                    <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
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
                  style={[styles.contentInput, { color: colors.text, borderColor: colors.primary }]}
                  placeholder={t('notes.contentPlaceholder')}
                  placeholderTextColor={colors.textSecondary}
                  value={noteContent}
                  onChangeText={setNoteContent}
                  multiline
                  autoFocus
                />
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.background[0] }]}
                    onPress={() => {
                      setShowEditModal(false);
                      setNoteTitle('');
                      setNoteContent('');
                      setEditingNote(null);
                    }}
                  >
                    <Text style={[textStyles.button, { color: colors.text }]}>
                      {t('common.cancel')}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, { backgroundColor: colors.primary }]}
                    onPress={editNote}
                  >
                    <Text style={[textStyles.button, { color: '#FFFFFF' }]}>
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
              <TouchableOpacity onPress={openEditFromView} style={styles.editIconButton}>
                <Edit size={20} color={colors.primary} />
              </TouchableOpacity>
            </View>
            <Text style={[textStyles.caption, { color: colors.textSecondary, marginBottom: 16 }]}>
              {viewingNote && formatDate(viewingNote.updatedAt, i18n.language)}
            </Text>
            <ScrollView
              style={styles.viewScroll}
              showsVerticalScrollIndicator={false}
            >
              <Text style={[textStyles.body, { color: colors.text }]}>
                {viewingNote?.content}
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={[styles.closeButton, { backgroundColor: colors.background[0] }]}
              onPress={() => {
                setShowViewModal(false);
                setViewingNote(null);
              }}
            >
              <Text style={[textStyles.button, { color: colors.text }]}>
                {t('common.close')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
