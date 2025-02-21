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
    <nav className="bg-deep-navy border-b border-cool-gray border-opacity-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-vibrant-cyan hover:text-soft-lilac transition-all duration-200">
                Note Nibbler
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                href="/"
                className={`${
                  router.pathname === '/'
                    ? 'border-vibrant-cyan text-vibrant-cyan'
                    : 'border-transparent text-cool-gray hover:text-vibrant-cyan'
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
              >
                Home
              </Link>

              {user && (
                <>
                  <Link
                    href="/dashboard"
                    className={`${
                      router.pathname === '/dashboard'
                        ? 'border-vibrant-cyan text-vibrant-cyan'
                        : 'border-transparent text-cool-gray hover:text-vibrant-cyan'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
                  >
                    Dashboard
                  </Link>
                  
                  {userProfile?.role === 'admin' && (
                    <Link
                      href="/admin"
                      className={`${
                        router.pathname === '/admin'
                          ? 'border-vibrant-cyan text-vibrant-cyan'
                          : 'border-transparent text-cool-gray hover:text-vibrant-cyan'
                      } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium transition-all duration-200`}
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
                <span className="text-cool-gray">
                  {userProfile?.full_name || user.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium 
                    rounded-lg text-deep-navy bg-vibrant-cyan hover:bg-soft-lilac 
                    transition-all duration-200 shadow-md"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className="text-cool-gray hover:text-vibrant-cyan transition-all duration-200"
                >
                  Login
                </Link>
                <Link
                  href="/signup"
                  className="inline-flex items-center px-4 py-2 border border-transparent 
                    text-sm font-medium rounded-lg text-deep-navy bg-vibrant-cyan 
                    hover:bg-soft-lilac transition-all duration-200 shadow-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-lg text-cool-gray 
                hover:text-vibrant-cyan hover:bg-cool-gray hover:bg-opacity-10 
                focus:outline-none focus:ring-2 focus:ring-inset focus:ring-vibrant-cyan
                transition-all duration-200"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
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
          <Link
            href="/"
            className={`${
              router.pathname === '/'
                ? 'bg-vibrant-cyan bg-opacity-10 border-vibrant-cyan text-vibrant-cyan'
                : 'border-transparent text-cool-gray hover:bg-cool-gray hover:bg-opacity-10 hover:text-vibrant-cyan'
            } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200`}
          >
            Home
          </Link>

          {user && (
            <>
              <Link
                href="/dashboard"
                className={`${
                  router.pathname === '/dashboard'
                    ? 'bg-vibrant-cyan bg-opacity-10 border-vibrant-cyan text-vibrant-cyan'
                    : 'border-transparent text-cool-gray hover:bg-cool-gray hover:bg-opacity-10 hover:text-vibrant-cyan'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200`}
              >
                Dashboard
              </Link>

              {userProfile?.role === 'admin' && (
                <Link
                  href="/admin"
                  className={`${
                    router.pathname === '/admin'
                      ? 'bg-vibrant-cyan bg-opacity-10 border-vibrant-cyan text-vibrant-cyan'
                      : 'border-transparent text-cool-gray hover:bg-cool-gray hover:bg-opacity-10 hover:text-vibrant-cyan'
                  } block pl-3 pr-4 py-2 border-l-4 text-base font-medium transition-all duration-200`}
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