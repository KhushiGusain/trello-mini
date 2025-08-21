'use client'

import {
  AuthContainer,
  AuthHeader,
  AuthForm,
  EmailInput,
  PasswordInput,
  GoogleAuthButton,
  AuthDivider,
  AuthFooter
} from '@/components/auth'
import { useAuthForm } from '@/hooks/useAuth'

export default function LoginPage() {
  const {
    formData,
    errors,
    isLoading,
    error,
    handleSubmit,
    handleGoogleAuth,
    handleInputChange
  } = useAuthForm('login')

  return (
    <AuthContainer>
      <AuthHeader
        title="Welcome back"
        subtitle="Sign in to your account to continue"
      />

      <AuthForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        submitText="Sign in"
      >
        <EmailInput
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
        />

        <PasswordInput
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={errors.password}
        />
      </AuthForm>

      <AuthDivider />

      <GoogleAuthButton
        onClick={handleGoogleAuth}
        isLoading={isLoading}
        text="Continue with Google"
      />

      <AuthFooter
        text="Don't have an account?"
        linkText="Sign up"
        linkHref="/auth/signup"
      />
    </AuthContainer>
  )
}
