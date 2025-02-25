import { useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { withAuth } from '../components/ProtectedRoute';

function Profile() {
  const router = useRouter();
  const { user, userProfile, supabase } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState(userProfile?.full_name || '');
  const [message, setMessage] = useState('');

  const getAvatarUrl = () => {
    return user?.user_metadata?.avatar_url;
  };

  const getInitials = () => {
    if (userProfile?.full_name) {
      return userProfile.full_name
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    return user?.email?.[0].toUpperCase() || '?';
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id);

      if (error) throw error;
      setMessage('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      setMessage('Error updating profile: ' + error.message);
    }
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to delete your account? This cannot be undone.')) {
      try {
        const { error } = await supabase
          .from('profiles')
          .delete()
          .eq('id', user.id);

        if (error) throw error;

        await supabase.auth.signOut();
        router.push('/');
      } catch (error) {
        setMessage('Error deleting account: ' + error.message);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex flex-col items-center mb-8">
          {getAvatarUrl() ? (
            <img
              src={getAvatarUrl()}
              alt="Profile"
              className="h-24 w-24 rounded-full object-cover border-4 border-gray-600 mb-4"
            />
          ) : (
            <div className="h-24 w-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-2xl font-medium border-4 border-gray-600 mb-4">
              {getInitials()}
            </div>
          )}
          <h1 className="text-2xl font-bold text-white">Your Profile</h1>
          {user?.app_metadata?.provider && (
            <span className="mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-900 text-blue-200">
              {user.app_metadata.provider === 'google' ? 'Google Account' : 'Email Account'}
            </span>
          )}
        </div>
        
        {message && (
          <div className="mb-6 p-3 rounded bg-blue-900 text-blue-200">
            {message}
          </div>
        )}

        <div className="space-y-6">
          <div className="bg-gray-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <div className="mt-1 text-white font-medium">{user?.email}</div>
          </div>

          <div className="bg-gray-700 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-300">Full Name</label>
            {isEditing ? (
              <form onSubmit={handleUpdateProfile} className="mt-3 space-y-4">
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-500 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="flex justify-between items-center mt-1">
                <div className="text-white font-medium">{userProfile?.full_name || 'Not set'}</div>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          <div className="pt-6 border-t border-gray-600">
            <button
              onClick={handleDeleteAccount}
              className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Delete Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Profile); 