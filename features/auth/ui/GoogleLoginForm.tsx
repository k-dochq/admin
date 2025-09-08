'use client';

import { useState } from 'react';
import { GoogleIcon } from 'shared/ui/google-login-button';
import { useGoogleLogin } from 'features/auth/model/useGoogleLogin';

export function GoogleLoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithGoogle } = useGoogleLogin();

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      await signInWithGoogle();
    } catch (error) {
      console.error('Google 로그인 실패:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className='space-y-4'>
      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className='flex h-12 w-full cursor-pointer items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 transition-colors hover:border-gray-400 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50'
      >
        <GoogleIcon className='h-5 w-5' />
        {isLoading ? '로그인 중...' : 'Google로 로그인'}
      </button>

      <div className='text-center'>
        <p className='text-xs text-gray-500'>
          로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
