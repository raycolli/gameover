import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';

export function withAuth(Component, allowedRoles = ['user', 'admin']) {
  return function ProtectedRoute(props) {
    const { user, userProfile, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.push('/login');
      } else if (!loading && user && userProfile) {
        if (!allowedRoles.includes(userProfile.role)) {
          router.push('/unauthorized');
        }
      }
    }, [user, loading, userProfile, router]);

    if (loading || !user || !userProfile) {
      return <div>Loading...</div>;
    }

    return <Component {...props} />;
  };
} 