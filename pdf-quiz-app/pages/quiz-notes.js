import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { withAuth } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

function QuizNotes() {
  const { userProfile } = useAuth();
  const [notes, setNotes] = useState([]);
  const [expandedNoteIndex, setExpandedNoteIndex] = useState(null);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_notes')
        .select('*')
        .eq('user_id', userProfile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  const handleDeleteNote = async (noteId) => {
    try {
      const { error } = await supabase
        .from('quiz_notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      alert('Failed to delete note');
    }
  };

  const toggleNoteExpansion = (index) => {
    setExpandedNoteIndex(expandedNoteIndex === index ? null : index);
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Quiz Notes</h1>
        
        <div className="grid gap-4">
          {notes.map((note, index) => (
            <div key={note.id} className="bg-gray-800 rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-blue-400">
                  {note.title}
                </h2>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="text-red-400 hover:text-red-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
              <div
                onClick={() => toggleNoteExpansion(index)}
                className="cursor-pointer"
              >
                <p className="text-gray-300 whitespace-pre-wrap">
                  {expandedNoteIndex === index
                    ? note.body
                    : note.body.length > 50
                    ? `${note.body.substring(0, 50)}...`
                    : note.body}
                </p>
              </div>
              <div className="text-sm text-gray-500 mt-4">
                {new Date(note.created_at).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(QuizNotes, ['user', 'admin']); 