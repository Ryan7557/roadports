import React from 'react';
import { Lock, ArrowLeft } from 'lucide-react';
import { RippleButton, RippleButtonRipples } from '@/components/animate-ui/components/buttons/ripple';

const GoogleIcon = () => (
  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
  </svg>
);

export default function SignInPrompt({ onSignIn, onCancel }) {
  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center p-8 text-white relative overflow-hidden bg-zinc-950/40 backdrop-blur-md rounded-2xl border border-white/5 shadow-2xl">
      {/* Background radial glow */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-green/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-green/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Main Lock Icon container with soft pulse */}
      <div className="relative mb-8 flex items-center justify-center">
        <div className="absolute inset-0 bg-green/20 rounded-full blur-xl animate-pulse" />
        <div className="relative w-24 h-24 bg-gradient-to-tr from-zinc-900 to-zinc-800 rounded-full flex items-center justify-center border border-white/10 shadow-inner">
          <Lock className="w-10 h-10 text-green animate-bounce" />
        </div>
      </div>

      {/* Header Info */}
      <h2 className="text-3xl md:text-4xl font-black tracking-tight text-center mb-3 uppercase">
        Authentication Required
      </h2>
      <p className="text-zinc-400 font-medium text-center max-w-md mb-10 leading-relaxed text-sm md:text-base">
        You need to sign in to submit a pothole report. This allows city authorities to verify reports and keep you updated on progress.
      </p>

      {/* Action Buttons */}
      <div className="w-full flex flex-col sm:flex-row gap-4 justify-center items-center relative z-10">
        <RippleButton
          onClick={onCancel}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-xl border border-white/5 transition-all font-bold text-sm tracking-wider uppercase"
        >
          <RippleButtonRipples />
          <ArrowLeft className="w-4 h-4" /> Go Back
        </RippleButton>

        <RippleButton
          onClick={onSignIn}
          className="w-full sm:w-auto flex items-center justify-center gap-3 px-8 py-3.5 bg-green hover:bg-green/95 text-white rounded-xl shadow-lg shadow-green/20 hover:shadow-green/35 hover:scale-[1.02] active:scale-95 transition-all font-bold text-sm tracking-wider uppercase"
        >
          <RippleButtonRipples />
          <GoogleIcon /> Sign In with Google
        </RippleButton>
      </div>
    </div>
  );
}
