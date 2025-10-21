import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../services/api';
import type { Note, CreateNoteDto, UpdateNoteDto } from '../types';
import NoteCard from '../components/NoteCard';
import NoteModal from '../components/NoteModal';
import TagFilter from '../components/TagFilter';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([]);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchNotes();
  }, []);

  useEffect(() => {
    // Extract all unique tags from notes
    const tags = new Set<string>();
    notes.forEach(note => {
      note.tags.forEach(tag => tags.add(tag));
    });
    setAllTags(Array.from(tags).sort());
  }, [notes]);

  useEffect(() => {
    // Filter notes by selected tags
    if (selectedTags.length === 0) {
      setFilteredNotes(notes);
    } else {
      fetchNotes(selectedTags);
    }
  }, [selectedTags]);

  const fetchNotes = async (tags?: string[]) => {
    try {
      setIsLoading(true);
      setError('');
      const data = await apiService.getNotes(tags);
      if (tags && tags.length > 0) {
        setFilteredNotes(data);
      } else {
        setNotes(data);
        setFilteredNotes(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateNote = async (data: CreateNoteDto) => {
    try {
      await apiService.createNote(data);
      setIsModalOpen(false);
      // Refetch notes to get updated list and clear cache
      await fetchNotes(selectedTags.length > 0 ? selectedTags : undefined);
      if (selectedTags.length === 0) {
        // If no filters, also fetch all notes to update the base list
        const allNotes = await apiService.getNotes();
        setNotes(allNotes);
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to create note');
    }
  };

  const handleUpdateNote = async (id: string, data: UpdateNoteDto) => {
    try {
      await apiService.updateNote(id, data);
      setEditingNote(null);
      setIsModalOpen(false);
      // Refetch notes to get updated list and clear cache
      await fetchNotes(selectedTags.length > 0 ? selectedTags : undefined);
      if (selectedTags.length === 0) {
        // If no filters, also fetch all notes to update the base list
        const allNotes = await apiService.getNotes();
        setNotes(allNotes);
      }
    } catch (err: any) {
      throw new Error(err.response?.data?.message || 'Failed to update note');
    }
  };

  const handleDeleteNote = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this note?')) {
      return;
    }

    try {
      await apiService.deleteNote(id);
      // Refetch notes to get updated list and clear cache
      await fetchNotes(selectedTags.length > 0 ? selectedTags : undefined);
      if (selectedTags.length === 0) {
        // If no filters, also fetch all notes to update the base list
        const allNotes = await apiService.getNotes();
        setNotes(allNotes);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete note');
    }
  };

  const handleEditClick = (note: Note) => {
    setEditingNote(note);
    setIsModalOpen(true);
  };

  const handleNewNoteClick = () => {
    setEditingNote(null);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingNote(null);
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>QuickNotes</h1>
          <div className="header-actions">
            <span className="user-email">{user?.email}</span>
            <button onClick={logout} className="btn-secondary">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="dashboard-main">
        <div className="dashboard-controls">
          <button onClick={handleNewNoteClick} className="btn-primary">
            + New Note
          </button>
          <TagFilter
            allTags={allTags}
            selectedTags={selectedTags}
            onTagToggle={setSelectedTags}
          />
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="loading">Loading notes...</div>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <h2>No notes yet</h2>
            <p>
              {selectedTags.length > 0
                ? 'No notes found with the selected tags. Try different tags or clear the filter.'
                : 'Get started by creating your first note!'}
            </p>
          </div>
        ) : (
          <div className="notes-grid">
            {filteredNotes.map(note => (
              <NoteCard
                key={note.id}
                note={note}
                onEdit={handleEditClick}
                onDelete={handleDeleteNote}
              />
            ))}
          </div>
        )}
      </main>

      {isModalOpen && (
        <NoteModal
          note={editingNote}
          onClose={handleModalClose}
          onSave={editingNote ?
            (data) => handleUpdateNote(editingNote.id, data) :
            handleCreateNote
          }
        />
      )}
    </div>
  );
};

export default Dashboard;
