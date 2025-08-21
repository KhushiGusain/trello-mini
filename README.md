# Mini Trello

A modern, lightweight Trello clone built with Next.js App Router for efficient task and project management.

## Features

- ✨ Modern authentication pages (Login & Signup)
- 🎨 Beautiful UI with custom color scheme
- 📱 Responsive design
- 🔒 Form validation and password strength indicator
- 🎯 Clean component architecture
- ⚡ Built with Next.js 14 App Router

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/
│   ├── auth/
│   │   ├── login/           # Login page
│   │   └── signup/          # Signup page
│   ├── globals.css          # Global styles and color variables
│   ├── layout.js
│   └── page.js
├── components/
│   ├── ui/                  # Reusable UI components
│   │   ├── Button.jsx       # Primary, secondary, ghost variants
│   │   ├── Input.jsx        # Form input with error states
│   │   ├── Checkbox.jsx     # Custom checkbox component
│   │   ├── PasswordStrength.jsx # Password strength indicator
│   │   └── index.js         # Component exports
│   └── auth/                # Auth-specific components
└── lib/                     # Utility functions
```

## Color Palette

The app uses a carefully crafted color scheme:

- **Primary Blue**: `#3a72ee` (buttons, links)
- **Primary Hover**: `#2456f1` (button hover states)
- **Navy**: `#0c2144` (headings, primary text)
- **Muted Gray**: `#6b7a90` (secondary text)
- **Background**: `#eff1f1` (page background)
- **Surface**: `#ffffff` (cards, forms)
- **Error**: `#ff1b45` (validation errors)
- **Success**: `#83fe1d` (success states)

## Authentication Pages

### Login Page (`/auth/login`)
- Email and password fields
- "Forgot password" link
- Google Sign-in option
- Link to signup page

### Signup Page (`/auth/signup`)
- Full name, email, password, confirm password fields
- Real-time password strength indicator
- Terms of service agreement checkbox
- Google Sign-up option
- Link to login page

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom CSS variables
- **Components**: Custom React components
- **Validation**: Client-side form validation
- **Icons**: Inline SVG (Google icon)

## Development

The project uses modern development practices:
- ESLint for code quality
- Component-based architecture
- Custom CSS variables for consistent theming
- Responsive design principles
