import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const router = useRouter();
  const { user, userProfile, supabase } = useAuth();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Get user's avatar URL - either from Google or use initials as fallback
  const getAvatarUrl = () => {
    if (user?.user_metadata?.avatar_url) {
      return user.user_metadata.avatar_url;
    }
    // Fallback to initials if no avatar
    return null;
  };

  // Get user's initials for the fallback avatar
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

              {/* Show these links only when user is logged in */}
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
                  
                  <Link
                    href="/burrow"
                    className={`${
                      router.pathname === '/burrow'
                        ? 'border-blue-400 text-white'
                        : 'border-transparent text-gray-300 hover:border-gray-600 hover:text-gray-100'
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    Burrow
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
                {/* Profile dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center space-x-3 text-gray-300 hover:text-white focus:outline-none"
                  >
                    {/* Avatar */}
                    {getAvatarUrl() ? (
                      <img
                        src={getAvatarUrl()}
                        alt="Profile"
                        className="h-8 w-8 rounded-full object-cover border-2 border-gray-600"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium border-2 border-gray-600">
                        {getInitials()}
                      </div>
                    )}
                    <span className="text-sm">{userProfile?.full_name || user.email}</span>
                    <svg 
                      className={`h-5 w-5 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`}
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Enhanced Dropdown menu */}
                  {isProfileOpen && (
                    <div className="absolute right-0 mt-2 w-64 rounded-md shadow-lg py-1 bg-gray-700 ring-1 ring-black ring-opacity-5">
                      {/* User info section */}
                      <div className="px-4 py-3 border-b border-gray-600">
                        <p className="text-sm text-gray-300">Signed in as</p>
                        <p className="text-sm font-medium text-white truncate">{user.email}</p>
                      </div>
                      
                      {/* Menu items */}
                      <div className="py-1">
                        <Link
                          href="/profile"
                          className="flex items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          Your Profile
                        </Link>
                        <button
                          onClick={handleSignOut}
                          className="flex w-full items-center px-4 py-2 text-sm text-gray-300 hover:bg-gray-600"
                        >
                          <svg className="mr-3 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
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

          {/* Show these links only when user is logged in */}
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

              <Link
                href="/burrow"
                className={`${
                  router.pathname === '/burrow'
                    ? 'bg-gray-900 border-blue-400 text-white'
                    : 'border-transparent text-gray-300 hover:bg-gray-700 hover:border-gray-600 hover:text-gray-100'
                } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              >
                Burrow
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