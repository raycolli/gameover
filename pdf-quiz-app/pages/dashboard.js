import { useRouter } from 'next/router';
import Link from 'next/link';
import { withAuth } from '../components/ProtectedRoute';
import { useAuth } from '../contexts/AuthContext';

function Dashboard() {
  const router = useRouter();
  const { userProfile, isAdmin } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8 bg-gray-900 min-h-screen text-white">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">
          Welcome, {userProfile.full_name}
        </h1>
        
        {isAdmin() && (
          <div>
            <h2 className="text-lg font-semibold text-blue-400">Admin Controls</h2>
          </div>
        )}
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <div className="bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
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
            <button
              onClick={() => router.push('/quiz')}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Start Quiz
            </button>
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
      </div>
    </div>
  );
}

export default withAuth(Dashboard, ['user', 'admin']);