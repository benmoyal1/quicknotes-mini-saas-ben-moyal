import React from 'react';
import type { Note } from '../types';

interface NoteCardProps {
  note: Note;
  onEdit: (note: Note) => void;
  onDelete: (id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onEdit, onDelete }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="note-card">
      <div className="note-card-header">
        <h3>{note.title}</h3>
        <div className="note-card-actions">
          <button
            onClick={() => onEdit(note)}
            className="icon-btn"
            title="Edit note"
          >
            ✏️
          </button>
          <button
            onClick={() => onDelete(note.id)}
            className="icon-btn"
            title="Delete note"
          >
            🗑️
          </button>
        </div>
      </div>

      <p className="note-card-content">{note.content}</p>

      {note.tags.length > 0 && (
        <div className="note-card-tags">
          {note.tags.map((tag, index) => (
            <span key={index} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="note-card-footer">
        <span className="note-date">Updated {formatDate(note.updatedAt)}</span>
      </div>
    </div>
  );
};

export default NoteCard;
