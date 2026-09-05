import React, { useState } from 'react';
import { 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup, 
  googleProvider,
  signInAnonymously 
} from '../firebase/config';
import { 
  Shield, 
  Lock, 
  Key, 
  Mail, 
  ArrowRight, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle,
  Sparkles,
  Server,
  UserCheck
} from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMessage('Please provide both email and password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      if (mode === 'signup') {
        await createUserWithEmailAndPassword(auth, email, password);
        setSuccessMessage('Account created with authoritative UID isolation.');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error('Authentication error:', err.code || err.message);
      // Safe, user-friendly error mapping
      switch (err.code) {
        case 'auth/user-not-found':
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          setErrorMessage('Invalid credentials. Please verify your email and password.');
          break;
        case 'auth/email-already-in-use':
          setErrorMessage('An account with this email already exists. Please sign in instead.');
          break;
        case 'auth/invalid-email':
          setErrorMessage('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setErrorMessage('Password is too weak. Please use at least 6 characters.');
          break;
        case 'auth/too-many-requests':
          setErrorMessage('Access temporarily restricted due to many failed attempts. Try again shortly.');
          break;
        default:
          setErrorMessage('Unable to authenticate. Please check your credentials or network connection.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      if (err.code === 'auth/popup-closed-by-user') {
        // User closed the popup, do nothing
      } else if (err.code === 'auth/operation-not-allowed') {
        setErrorMessage('Google Sign-In is not enabled in your Firebase project. Please enable Google under Authentication > Sign-in method in the Firebase Console.');
      } else if (err.code === 'auth/unauthorized-domain') {
        setErrorMessage(`Domain not authorized. Please add "${window.location.hostname}" to Firebase Console > Authentication > Settings > Authorized domains.`);
      } else if (err.code === 'auth/popup-blocked') {
        setErrorMessage('Sign-in popup was blocked by your browser. Please allow popups for this site and try again.');
      } else {
        setErrorMessage(err.message || 'Google authentication could not be completed. Make sure Google sign-in is enabled in your Firebase Console, or sign in with Email / Guest mode.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestSignIn = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      // Create isolated Firebase anonymous session with dedicated UID
      await signInAnonymously(auth);
    } catch (err: any) {
      console.error('Guest Sign In error:', err);
      setErrorMessage('Failed to initialize isolated guest session.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Emblem & Title */}
        <div className="flex justify-center">
          <div className="w-14 h-14 rounded-2xl bg-amber-900 text-amber-50 flex items-center justify-center shadow-md">
            <BookOpen className="w-7 h-7 text-amber-200" />
          </div>
        </div>

        <h1 className="mt-5 text-center text-2xl font-bold tracking-tight text-stone-900 font-serif-journal">
          Personal Gemini Journal
        </h1>
        <p className="mt-1 text-center text-xs text-stone-600 max-w-sm mx-auto">
          Private, encrypted-at-rest reflections with strict Firebase Firestore tenant isolation and server-side Gemini AI.
        </p>

        {/* Security Constitution Banner */}
        <div className="mt-4 mx-4 sm:mx-0 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-900">
          <div className="flex items-center space-x-2">
            <Shield className="w-4 h-4 text-emerald-700 shrink-0" />
            <span className="font-medium">Security Constitution Active:</span>
            <span className="text-emerald-800 text-[11px]">Strict UID Boundary Enforced</span>
          </div>
          <span className="font-mono text-[10px] bg-emerald-200/70 text-emerald-900 px-1.5 py-0.5 rounded font-semibold">
            v1.0
          </span>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 shadow-sm sm:rounded-2xl border border-stone-200/80">
          
          {/* Mode Switch Tabs */}
          <div className="flex border-b border-stone-200 pb-3 mb-6">
            <button
              id="auth-tab-signin"
              onClick={() => { setMode('signin'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 text-center pb-2 text-sm font-semibold border-b-2 transition-colors ${
                mode === 'signin'
                  ? 'border-amber-900 text-amber-950'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              Sign In
            </button>
            <button
              id="auth-tab-signup"
              onClick={() => { setMode('signup'); setErrorMessage(null); setSuccessMessage(null); }}
              className={`flex-1 text-center pb-2 text-sm font-semibold border-b-2 transition-colors ${
                mode === 'signup'
                  ? 'border-amber-900 text-amber-950'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div id="auth-error-alert" className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div id="auth-success-alert" className="mb-5 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={handleEmailAuth}>
            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1" htmlFor="auth-email">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  id="auth-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-800 focus:border-amber-800 focus:outline-none placeholder-stone-400 bg-stone-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1" htmlFor="auth-password">
                Password
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  id="auth-password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="block w-full pl-9 pr-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-amber-800 focus:border-amber-800 focus:outline-none placeholder-stone-400 bg-stone-50/50"
                />
              </div>
              <p className="mt-1 text-[11px] text-stone-500">
                Minimum 6 characters with secure credential handling.
              </p>
            </div>

            <button
              id="auth-submit-btn"
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-amber-50 bg-amber-900 hover:bg-amber-950 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-800 transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <span className="inline-flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authorizing...
                </span>
              ) : (
                <span className="flex items-center space-x-2">
                  <span>{mode === 'signin' ? 'Sign In' : 'Create Isolated Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-stone-200" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-white text-stone-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Alternative Sign-In Options */}
            <div className="mt-5 space-y-2.5">
              <button
                id="auth-google-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-stone-300 rounded-lg text-xs font-medium text-stone-700 bg-white hover:bg-stone-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-800 transition-colors cursor-pointer"
              >
                <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                Sign in with Google
              </button>

              <button
                id="auth-guest-btn"
                onClick={handleGuestSignIn}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-2 border border-stone-200 rounded-lg text-xs font-medium text-stone-600 bg-stone-100/70 hover:bg-stone-200/70 focus:outline-none transition-colors cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5 mr-2 text-stone-500" />
                Quick Test Session (Anonymous Auth with Isolated UID)
              </button>
            </div>
          </div>

          {/* Security Guarantee List */}
          <div className="mt-8 pt-6 border-t border-stone-100">
            <h2 className="text-[11px] font-semibold text-stone-700 uppercase tracking-wider mb-2 flex items-center">
              <Lock className="w-3 h-3 mr-1 text-amber-900" />
              Security Architecture Highlights
            </h2>
            <ul className="space-y-1.5 text-[11px] text-stone-600">
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Strict multi-tenant isolation: documents stored strictly at <code className="font-mono text-[10px] bg-stone-100 px-1 py-0.5 rounded">/users/{'{uid}'}/journals</code></span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Zero client secrets: Gemini API keys isolated on server proxy</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Prompt injection sandboxing with XML boundary guards</span>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
};
