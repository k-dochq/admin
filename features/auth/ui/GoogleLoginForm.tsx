'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
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
    <div className="space-y-4">
      <Button
        variant="outline"
        size="lg"
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="w-full"
      >
        <GoogleIcon className="mr-2 h-4 w-4" />
        {isLoading ? '로그인 중...' : 'Google로 로그인'}
      </Button>
      
      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          로그인하면 서비스 이용약관 및 개인정보처리방침에 동의하는 것으로 간주됩니다.
        </p>
      </div>
    </div>
  );
}
