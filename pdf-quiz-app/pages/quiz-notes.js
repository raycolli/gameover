import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { withAuth } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

function QuizNotes() {
  const { userProfile } = useAuth();
  const [notes, setNotes] = useState([]);

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Quiz Notes</h1>
        
        <div className="grid gap-4">
          {notes.map((note) => (
            <div key={note.id} className="bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold text-blue-400 mb-2">
                {note.title}
              </h2>
              <p className="text-gray-300 whitespace-pre-wrap">
                {note.body}
              </p>
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