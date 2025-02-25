import { useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { withAuth } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const router = useRouter();
  const { userProfile, loading } = useAuth();
  const { success } = router.query;
  
  useEffect(() => {
    // If user is not a pro user, redirect to pricing
    if (userProfile && userProfile.role !== 'pro' && userProfile.role !== 'admin') {
      router.push('/pricing');
    }
  }, [userProfile, router]);

  // Show loading state while checking subscription
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-xl">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // If userProfile is null, show an error or redirect
  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white">User profile not found. Please log in again.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Welcome, {userProfile.full_name}
        </h1>
        
        {userProfile.role === 'admin' && (
          <div>
            <h2 className="text-lg font-semibold text-blue-400">Admin Controls</h2>
          </div>
        )}
        
        <div className="grid gap-4 md:grid-cols-2">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <Link href="/quiz" className="block">
              <div className="text-blue-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Create New Quiz
              </h2>
              <p className="text-gray-300 mb-4">
                Upload a PDF and generate interactive quiz questions.
              </p>
            </Link>
          </div>

          <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <Link href="/set-task" className="block">
              <div className="text-blue-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">Set Your Task</h2>
              <p className="text-gray-300">Create a new focused work session</p>
            </Link>
          </div>
        </div>

        {success && (
          <div className="mb-6 p-4 bg-green-800 text-green-100 rounded-lg">
            <p className="font-medium">🎉 Thank you for subscribing to Pro! Your account has been upgraded.</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default withAuth(Dashboard);