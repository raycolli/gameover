import { useRouter } from 'next/router';
import Link from 'next/link';
import { withAuth } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const router = useRouter();
  const { userProfile, isAdmin } = useAuth();

  if (!userProfile) {
    return <div className="text-center p-8">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Welcome back, {userProfile?.full_name || 'User'}
        </h1>
        
        {isAdmin && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-blue-400 mb-4">Admin Controls</h2>
            {/* Add admin controls here if needed */}
          </div>
        )}
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Create Quiz Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <Link href="/quiz" className="block">
              <div className="text-blue-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Create New Quiz
              </h2>
              <p className="text-gray-300">
                Upload a file and generate interactive quiz questions instantly.
              </p>
            </Link>
          </div>

          {/* Set Task/Timer Card */}
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
            <Link href="/set-task" className="block">
              <div className="text-blue-400 mb-4">
                <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" 
                  />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Set Your Task
              </h2>
              <p className="text-gray-300">
                Create a new focused work session with timer
              </p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default withAuth(Dashboard);