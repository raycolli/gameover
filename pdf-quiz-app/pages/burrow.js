import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { withAuth } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

function Burrow() {
  const { userProfile } = useAuth();
  const [notes, setNotes] = useState([]);
  const [expandedNoteIndex, setExpandedNoteIndex] = useState(null);
  const [editingNote, setEditingNote] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('burrow')
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
        .from('burrow')
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

  const handleEditClick = (note) => {
    setEditingNote(note.id);
    setEditTitle(note.title);
    setEditBody(note.body);
  };

  const handleUpdateNote = async () => {
    try {
      const { error } = await supabase
        .from('burrow')
        .update({
          title: editTitle,
          body: editBody,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingNote);

      if (error) throw error;

      // Reset edit state
      setEditingNote(null);
      setEditTitle("");
      setEditBody("");
      
      // Refresh notes
      fetchNotes();
    } catch (error) {
      console.error('Error updating note:', error);
      alert('Failed to update note');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Burrow</h1>
        
        <div className="grid gap-4">
          {notes.map((note, index) => (
            <div key={note.id} className="bg-gray-800 rounded-xl shadow-lg p-6">
              {editingNote === note.id ? (
                // Edit mode
                <div>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <textarea
                    value={editBody}
                    onChange={(e) => setEditBody(e.target.value)}
                    rows="3"
                    className="w-full p-2 mb-4 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleUpdateNote}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setEditingNote(null)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                // View mode
                <>
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-semibold text-blue-400">
                      {note.title}
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditClick(note)}
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDeleteNote(note.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
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
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default withAuth(Burrow, ['user', 'admin']); 