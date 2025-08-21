'use client'

import Link from 'next/link'

export function AuthFooter({ text, linkText, linkHref }) {
  return (
    <div className="text-center mt-6">
      <p className="text-sm" style={{ color: 'var(--color-muted)' }}>
        {text}{' '}
        <Link 
          href={linkHref}
          className="font-medium hover:underline"
          style={{ color: 'var(--color-primary)' }}
        >
          {linkText}
        </Link>
      </p>
    </div>
  )
}
