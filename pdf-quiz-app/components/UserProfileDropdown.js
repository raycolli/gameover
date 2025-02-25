import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { PLANS } from '../config/stripe';
import Link from 'next/link';
import { useRouter } from 'next/router';

export default function UserProfileDropdown() {
  const { user, supabase, signOut } = useAuth();
  console.log('Current user:', user);
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const loadProfileData = async () => {
      if (!user) return;

      try {
        const [profileResult, subscriptionResult] = await Promise.all([
          supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single(),
          supabase
            .from('subscriptions')
            .select('*')
            .eq('user_id', user.id)
            .single()
        ]);

        if (profileResult.data) setProfile(profileResult.data);
        if (subscriptionResult.data) setSubscription(subscriptionResult.data);
      } catch (error) {
        console.error('Error loading profile data:', error);
      }
    };

    loadProfileData();
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      setIsOpen(false);
      router.push('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const planDetails = PLANS[subscription?.plan_type || 'FREE'];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-white hover:text-blue-400 focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          {profile?.full_name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase()}
        </div>
        <span className="hidden md:block">{profile?.full_name || 'User'}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-gray-800 rounded-lg shadow-xl z-50">
          <div className="p-4 border-b border-gray-700">
            <p className="text-white font-semibold">{profile?.full_name}</p>
            <p className="text-sm text-gray-400">{profile?.email}</p>
          </div>

          <div className="p-4 border-b border-gray-700">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-400">Current Plan</span>
              <span className="text-sm font-semibold text-blue-400">
                {planDetails.name}
              </span>
            </div>
            {subscription?.plan_type === 'FREE' && (
              <div className="text-xs text-gray-400">
                {subscription?.quiz_count || 0}/{planDetails.quizLimit} quizzes used
              </div>
            )}
          </div>

          <div className="p-2">
            <Link
              href="/pricing"
              className="block px-4 py-2 text-sm text-white hover:bg-gray-700 rounded"
            >
              {subscription?.plan_type === 'FREE' ? 'Upgrade to Pro' : 'Manage Subscription'}
            </Link>
            
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 rounded"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 