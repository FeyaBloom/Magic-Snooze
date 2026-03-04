import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import {
  documentDirectory,
  getInfoAsync,
  makeDirectoryAsync,
  copyAsync,
  deleteAsync,
} from 'expo-file-system/legacy';

export interface NoteAudioClip {
  id: string;
  uri: string;
  title: string;
  durationMs: number;
  createdAt: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  mediaUris: string[];
  audioClips: NoteAudioClip[];
  createdAt: string;
  updatedAt: string;
}

export type NoteInput = Pick<Note, 'title' | 'content' | 'tags' | 'mediaUris' | 'audioClips'>;

const STORAGE_KEY = 'personalNotes';
const MEDIA_DIR = `${documentDirectory}notes-media/`;

// ─── file helpers ─────────────────────────────────────────────────────────────

async function ensureMediaDir() {
  if (!documentDirectory) return;
  const info = await getInfoAsync(MEDIA_DIR);
  if (!info.exists) await makeDirectoryAsync(MEDIA_DIR, { intermediates: true });
}

function buildDestPath(sourceUri: string, prefix: 'img' | 'aud'): string {
  const ext = sourceUri.match(/\.([a-zA-Z0-9]+)(?:\?|$)/)?.[1] ?? (prefix === 'img' ? 'jpg' : 'm4a');
  return `${MEDIA_DIR}${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
}

function isInDocDir(uri: string): boolean {
  return !!documentDirectory && uri.startsWith(documentDirectory);
}

// Call this immediately when user picks image or stops recording —
// before the note is saved. No migration needed.
export async function persistFile(uri: string, prefix: 'img' | 'aud'): Promise<string> {
  if (!uri || uri.startsWith('data:') || Platform.OS === 'web') return uri;
  if (isInDocDir(uri)) return uri; // already safe, nothing to do

  await ensureMediaDir();
  const dest = buildDestPath(uri, prefix);
  await copyAsync({ from: uri, to: dest });
  return dest;
}

export async function deleteFile(uri: string) {
  if (!uri || uri.startsWith('data:') || !isInDocDir(uri)) return;
  try {
    const info = await getInfoAsync(uri);
    if (info.exists) await deleteAsync(uri, { idempotent: true });
  } catch (e) {
    console.error('deleteFile error:', e);
  }
}

// ─── tag helpers ──────────────────────────────────────────────────────────────

const MAX_TAGS = 12;
const MAX_TAG_LEN = 24;

export function parseTags(raw: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const part of raw.split(/[,;|\n]+/)) {
    let tag = part
      .replace(/^#+/, '')
      .replace(/[^a-zA-Z0-9а-яА-ЯёЁÀ-ÿ\s_-]/g, '')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, MAX_TAG_LEN)
      .trim()
      .toLowerCase();
    if (!tag || seen.has(tag)) continue;
    seen.add(tag);
    result.push(tag);
    if (result.length >= MAX_TAGS) break;
  }
  return result;
}

// ─── hook ─────────────────────────────────────────────────────────────────────

export function useNotes() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const persist = useCallback(async (updated: Note[]) => {
    const sorted = [...updated].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(sorted));
    setNotes(sorted);
  }, []);

  // Simple load — no migration, just parse and sort
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        const parsed: Note[] = JSON.parse(raw);
        const sorted = parsed.sort(
          (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );
        if (!cancelled) setNotes(sorted);
      } catch (e) {
        console.error('useNotes load error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const addNote = useCallback(async (input: NoteInput) => {
    const now = new Date().toISOString();
    await persist([{
      id: `${Date.now()}`,
      ...input,
      tags: parseTags(input.tags.join(',')),
      createdAt: now,
      updatedAt: now,
    }, ...notes]);
  }, [notes, persist]);

  const updateNote = useCallback(async (id: string, input: NoteInput) => {
    await persist(notes.map(n =>
      n.id === id
        ? { ...n, ...input, tags: parseTags(input.tags.join(',')), updatedAt: new Date().toISOString() }
        : n
    ));
  }, [notes, persist]);

  const deleteNote = useCallback(async (id: string) => {
    const note = notes.find(n => n.id === id);
    if (note) {
      for (const uri of note.mediaUris) await deleteFile(uri);
      for (const clip of note.audioClips) await deleteFile(clip.uri);
    }
    await persist(notes.filter(n => n.id !== id));
  }, [notes, persist]);

  return { notes, loading, addNote, updateNote, deleteNote };
}