'use client';

import { useState } from 'react';
import { signIn, getSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Button } from '@/components/ui';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});


    const newErrors = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setIsLoading(false);
      return;
    }


    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setErrors({ general: 'Invalid credentials' });
      } else {
        router.push('/boards');
      }
    } catch (error) {
      setErrors({ general: 'An error occurred' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn('google', { callbackUrl: '/boards' });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#eff1f1' }}>
      <div className="w-full max-w-md">

        <div className="bg-white rounded-2xl shadow-lg p-8">

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2" style={{ color: '#0c2144' }}>
              Welcome back 👋
            </h1>
            <p className="text-sm" style={{ color: '#6b7a90' }}>
              Log in to manage boards and tasks
            </p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-4">
            {errors.general && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5" style={{ color: '#0c2144' }}>
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
              />
              {errors.email && (
                <p className="mt-1 text-xs" style={{ color: '#ff1b45' }}>
                  {errors.email}
                </p>
              )}
            </div>


            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5" style={{ color: '#0c2144' }}>
                Password
              </label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                error={!!errors.password}
              />
              {errors.password && (
                <p className="mt-1 text-xs" style={{ color: '#ff1b45' }}>
                  {errors.password}
                </p>
              )}
            </div>


            <div className="text-right">
              <Link 
                href="/auth/forgot-password" 
                className="text-sm font-medium hover:underline transition-colors"
                style={{ color: '#3a72ee' }}
                onMouseEnter={(e) => e.target.style.color = '#2456f1'}
                onMouseLeave={(e) => e.target.style.color = '#3a72ee'}
              >
                Forgot password?
              </Link>
            </div>


            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Log in'}
            </Button>
          </form>


          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" style={{ borderColor: '#eff1f1' }}></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 text-gray-500" style={{ backgroundColor: '#ffffff', color: '#6b7a90' }}>
                or
              </span>
            </div>
          </div>


          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={handleGoogleSignIn}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285f4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34a853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#fbbc05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#ea4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>


          <div className="text-center mt-6">
            <p className="text-sm" style={{ color: '#6b7a90' }}>
              New here?{' '}
              <Link 
                href="/auth/signup" 
                className="font-medium hover:underline transition-colors"
                style={{ color: '#3a72ee' }}
                onMouseEnter={(e) => e.target.style.color = '#2456f1'}
                onMouseLeave={(e) => e.target.style.color = '#3a72ee'}
              >
                Create account
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
