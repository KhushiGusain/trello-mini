'use client'

import {
  AuthContainer,
  AuthHeader,
  AuthForm,
  NameInput,
  EmailInput,
  PasswordInput,
  GoogleAuthButton,
  AuthDivider,
  AuthFooter
} from '@/components/auth'
import { useAuthForm } from '@/hooks/useAuth'

export default function SignupPage() {
  const {
    formData,
    errors,
    isLoading,
    error,
    handleSubmit,
    handleGoogleAuth,
    handleInputChange
  } = useAuthForm('signup')

  return (
    <AuthContainer>
      <AuthHeader
        title="Create your account"
        subtitle="Get started with Mini Trello"
      />

      <AuthForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        error={error}
        submitText="Create account"
      >
        <NameInput
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          error={errors.name}
        />

        <EmailInput
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          error={errors.email}
        />

        <PasswordInput
          value={formData.password}
          onChange={(e) => handleInputChange('password', e.target.value)}
          error={errors.password}
          placeholder="Create a password"
        />
      </AuthForm>

      <AuthDivider />

      <GoogleAuthButton
        onClick={handleGoogleAuth}
        isLoading={isLoading}
        text="Sign up with Google"
      />

      <AuthFooter
        text="Already have an account?"
        linkText="Sign in"
        linkHref="/auth/login"
      />
    </AuthContainer>
  )
}
