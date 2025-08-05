import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plus, Pencil as Edit, Trash2, Search, BookOpen } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '@/components/ThemeProvider';
import { createNotesStyles } from '@/styles/notes';
import {FloatingBackground} from "@/components/MagicalFeatures";
import { ConfirmDialog } from "@/components/confirmDialog";
import i18n from '@/i18n';
import { LanguageModal } from '@/components/LanguageModal';
const { t } = i18n;
interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export default function NotesTab() {
  const currentLanguageCode = i18n.language;
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const { colors } = useTheme();
  const styles = createNotesStyles(colors);
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
  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    try {
      const notesData = await AsyncStorage.getItem('personalNotes');
      if (notesData) {
        const parsedNotes = JSON.parse(notesData);
        parsedNotes.sort((a: Note, b: Note) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
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
      title: noteTitle.trim() || 'Untitled Note',
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
      title: noteTitle.trim() || 'Untitled Note',
      content: noteContent.trim(),
      updatedAt: new Date().toISOString(),
    };

    const updatedNotes = notes.map(note =>
      note.id === editingNote.id ? updatedNote : note
    );

    updatedNotes.sort((a: Note, b: Note) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    await saveNotes(updatedNotes);

    setNoteTitle('');
    setNoteContent('');
    setEditingNote(null);
    setShowEditModal(false);
  };

  const deleteNote = (noteId: string) => {
  setConfirmDialog({
    visible: true,
    title: 'Delete Task',
    message: 'Are you sure you want to delete this note?',
    onConfirm: async () => {
      const updatedNotes = notes.filter(note => note.id !== noteId);
            await saveNotes(updatedNotes);
            setShowEditModal(false);
            setEditingNote(null);
    },
  });
};
 

      const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString(i18n.language, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <>
      <SafeAreaView style={styles.container}>
  <LinearGradient colors={colors.background} style={styles.gradient}>
    <FloatingBackground />
    <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('notes.title')}</Text>
        <Text style={styles.subtitle}>{t('notes.subtitle')}</Text>
      </View>

      <View style={styles.searchContainer}>
        <Search size={20} color="#6B7280" />
        <TextInput
          style={styles.searchInput}
          placeholder={t('notes.searchPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <TouchableOpacity style={styles.addNoteButton} onPress={() => setShowAddModal(true)}>
        <Plus size={24} color="#FFFFFF" />
        <Text style={styles.addNoteText}>{t('notes.addButton')}</Text>
      </TouchableOpacity>

      {filteredNotes.length > 0 ? (
        <View style={styles.notesContainer}>
          {filteredNotes.map(note => (
            <TouchableOpacity
              key={note.id}
              style={styles.noteCard}
              onPress={() => openNote(note)}
            >
              <View style={styles.noteHeader}>
                <Text style={styles.noteTitle} numberOfLines={1}>
                  {note.title}
                </Text>
                <Text style={styles.noteDate}>
                  {formatDate(note.updatedAt)}
                </Text>
              </View>
              <Text style={styles.notePreview} numberOfLines={3}>
                {note.content}
              </Text>
              <View style={styles.noteActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setEditingNote(note);
                    setNoteTitle(note.title);
                    setNoteContent(note.content);
                    setShowEditModal(true);
                  }}
                >
                  <Edit size={16} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      ) : (
        <View style={styles.emptyState}>
          <BookOpen size={48} color="#9CA3AF" />
          <Text style={styles.emptyStateText}>
            {searchQuery ? t('notes.emptySearchTitle') : t('notes.emptyTitle')}
          </Text>
          <Text style={styles.emptyStateSubtext}>
            {searchQuery
              ? t('notes.emptySearchSubtitle')
              : t('notes.emptySubtitle')}
          </Text>
        </View>
      )}
    </ScrollView>
  </LinearGradient>

  {/* Add Note Modal */}
  <Modal
    visible={showAddModal}
    animationType="slide"
    transparent={true}
    statusBarTranslucent={true}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <Text style={styles.modalTitle}>{t('notes.addModalTitle')}</Text>
        <TextInput
          style={styles.titleInput}
          placeholder={t('notes.titlePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={noteTitle}
          onChangeText={setNoteTitle}
        />
        <TextInput
          style={styles.contentInput}
          placeholder={t('notes.contentPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={noteContent}
          onChangeText={setNoteContent}
          multiline
          autoFocus
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              setShowAddModal(false);
              setNoteTitle('');
              setNoteContent('');
            }}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton]}
            onPress={addNote}
          >
            <Text style={styles.saveButtonText}>{t('notes.save')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>

  {/* Edit Note Modal */}
  <Modal
    visible={showEditModal}
    animationType="slide"
    transparent={true}
    statusBarTranslucent={true}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => {
            if (editingNote) {
              deleteNote(editingNote.id);
            }
          }}
        >
          <Trash2 size={16} color="#EF4444" />
        </TouchableOpacity>
        <Text style={styles.modalTitle}>{t('notes.editModalTitle')}</Text>
        <TextInput
          style={styles.titleInput}
          placeholder={t('notes.titlePlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={noteTitle}
          onChangeText={setNoteTitle}
        />
        <TextInput
          style={styles.contentInput}
          placeholder={t('notes.contentPlaceholder')}
          placeholderTextColor={colors.textSecondary}
          value={noteContent}
          onChangeText={setNoteContent}
          multiline
          autoFocus
        />
        <View style={styles.modalButtons}>
          <TouchableOpacity
            style={[styles.modalButton, styles.cancelButton]}
            onPress={() => {
              setShowEditModal(false);
              setNoteTitle('');
              setNoteContent('');
              setEditingNote(null);
            }}
          >
            <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modalButton, styles.saveButton]}
            onPress={editNote}
          >
            <Text style={styles.saveButtonText}>{t('notes.saveChanges')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>

  {/* View Note Modal */}
  <Modal
    visible={showViewModal}
    animationType="slide"
    transparent={true}
    statusBarTranslucent={true}
  >
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.viewHeader}>
          <Text style={styles.viewTitle} numberOfLines={2}>
            {viewingNote?.title}
          </Text>
          <TouchableOpacity
            style={styles.editFromViewButton}
            onPress={openEditFromView}
          >
            <Edit size={20} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <Text style={styles.viewDate}>
          {viewingNote && formatDate(viewingNote.updatedAt)}
        </Text>
        <ScrollView
          style={styles.viewContent}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 8 }}
        >
          <Text style={styles.viewText}>{viewingNote?.content}</Text>
        </ScrollView>
        <TouchableOpacity
          style={styles.closeButton}
          onPress={() => {
            setShowViewModal(false);
            setViewingNote(null);
          }}
        >
          <Text style={styles.closeButtonText}>{t('common.close')}</Text>
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
      setConfirmDialog(d => ({ ...d, visible: false }));
    }}
    onCancel={() => setConfirmDialog(d => ({ ...d, visible: false }))}
  />
</SafeAreaView>

    </>
  );
}