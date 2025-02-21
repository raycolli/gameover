import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const router = useRouter();
  const { user, userProfile, supabase } = useAuth();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-gray-800 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link href={user ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-blue-400">Note Nibblers</span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {/* Show Home link only if user is not logged in */}
              {!user && (
                <Link
                  href="/"
                  className={`${
                    router.pathname === '/'
                      ? 'border-blue-400 text-white'
                      : 'border-transparent text-gray-300 hover:border-gray-600 hover:text-gray-100'
                  } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  Home
                </Link>
              )}

              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className={`${
                      router.pathname === '/dashboard'
                        ? 'border-blue-400 text-white'
                        : 'border-transparent text-gray-300 hover:border-gray-600 hover:text-gray-100'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Dashboard
                  </Link>
                  
                  {userProfile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={`${
                        router.pathname === '/admin'
                          ? 'border-blue-400 text-white'
                          : 'border-transparent text-gray-300 hover:border-gray-600 hover:text-gray-100'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                    >
                      Admin
                    </Link>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Right side buttons */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-gray-300">
                  {userProfile?.full_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-gray-300 hover:text-gray-100 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {/* Icon when menu is closed */}
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden" id="mobile-menu">
        <div className="pt-2 pb-3 space-y-1">
          {/* Show Home link only if user is not logged in */}
          {!user && (
            <Link
              href="/"
              className={`${
                router.pathname === '/'
                  ? 'bg-gray-900 border-blue-400 text-white'
                  : 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-100'
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
            >
              Home
            </Link>
          )}

          {user && (
            <>
              <Link
                href="/dashboard"
                className={`${
                  router.pathname === '/dashboard'
                    ? 'bg-gray-900 border-blue-400 text-white'
                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-100'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Dashboard
              </Link>

              {userProfile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`${
                    router.pathname === '/admin'
                      ? 'bg-gray-900 border-blue-400 text-white'
                      : 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-100'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
                >
                  Admin
                </Link>
              )}
            </>
          )}
        </div>
      </div>
    </nav>
  );
}