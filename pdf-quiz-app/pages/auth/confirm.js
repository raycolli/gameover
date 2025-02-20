import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

export default function ConfirmEmail() {
  const [message, setMessage] = useState('Verifying your email...');
  const router = useRouter();
  const { supabase } = useAuth();
  const { token_hash, type } = router.query;

  useEffect(() => {
    if (token_hash && type) {
      verifyEmail();
    }
  }, [token_hash, type]);

  async function verifyEmail() {
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash,
        type,
      });

      if (error) throw error;
      
      setMessage('Email verified successfully! Redirecting...');
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      setMessage('Error verifying your email: ' + error.message);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <p className="text-center">{message}</p>
        </div>
      </div>
    </div>
  );
} 