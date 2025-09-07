import { GoogleLoginForm } from 'features/auth/ui/GoogleLoginForm';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from 'shared/ui/card';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Admin 로그인</CardTitle>
          <CardDescription className="text-center">
            Google 계정으로 로그인하세요
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleLoginForm />
        </CardContent>
      </Card>
    </div>
  );
}
