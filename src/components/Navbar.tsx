import React from 'react';
import { User, signOut } from '../firebase/config';
import { 
  ShieldCheck, 
  BookOpen, 
  Sparkles, 
  MessageSquareHeart, 
  Lock, 
  LogOut, 
  User as UserIcon,
  Fingerprint
} from 'lucide-react';

interface NavbarProps {
  user: User | null;
  activeTab: 'journals' | 'insights' | 'chat' | 'security';
  setActiveTab: (tab: 'journals' | 'insights' | 'chat' | 'security') => void;
  onOpenNewEntry: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onOpenNewEntry
}) => {
  const handleSignOut = async () => {
    try {
      await signOut(user ? user.auth : undefined as any);
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const truncatedUid = user?.uid 
    ? `${user.uid.slice(0, 6)}...${user.uid.slice(-4)}`
    : 'Not Authenticated';

  return (
    <header className="sticky top-0 z-40 w-full border-b border-stone-200 bg-stone-50/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Name */}
          <div className="flex items-center space-x-3">
            <button 
              id="brand-logo-btn"
              onClick={() => setActiveTab('journals')}
              className="flex items-center space-x-2.5 text-left focus:outline-none group"
            >
              <div className="w-9 h-9 rounded-xl bg-amber-800 text-amber-50 flex items-center justify-center shadow-sm group-hover:bg-amber-900 transition-colors">
                <BookOpen className="w-5 h-5 text-amber-100" />
              </div>
              <div>
                <span className="text-base font-semibold text-stone-900 tracking-tight flex items-center gap-1.5">
                  Personal Gemini Journal
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <ShieldCheck className="w-3 h-3 mr-0.5 text-emerald-600" />
                    Isolated
                  </span>
                </span>
                <p className="text-[11px] text-stone-500 hidden sm:block">Security-First Private Reflections</p>
              </div>
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            <button
              id="nav-tab-journals"
              onClick={() => setActiveTab('journals')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'journals'
                  ? 'bg-amber-100/70 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Journals</span>
            </button>

            <button
              id="nav-tab-insights"
              onClick={() => setActiveTab('insights')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'insights'
                  ? 'bg-amber-100/70 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-700" />
              <span>AI Insights</span>
            </button>

            <button
              id="nav-tab-chat"
              onClick={() => setActiveTab('chat')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'chat'
                  ? 'bg-amber-100/70 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <MessageSquareHeart className="w-4 h-4 text-stone-600" />
              <span>Reflective Companion</span>
            </button>

            <button
              id="nav-tab-security"
              onClick={() => setActiveTab('security')}
              className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors flex items-center space-x-2 ${
                activeTab === 'security'
                  ? 'bg-amber-100/70 text-amber-900 font-semibold'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Constitution & Security</span>
            </button>
          </nav>

          {/* Action & User Profile Section */}
          <div className="flex items-center space-x-3">
            {user && (
              <>
                <button
                  id="nav-new-entry-btn"
                  onClick={onOpenNewEntry}
                  className="hidden sm:inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg bg-stone-900 text-stone-50 hover:bg-stone-800 text-xs font-medium shadow-sm transition-colors cursor-pointer"
                >
                  <span>+ New Journal</span>
                </button>

                {/* Authoritative User Identity Badge */}
                <div 
                  id="user-auth-badge" 
                  title={`Authoritative Firestore Isolation UID: ${user.uid}`}
                  className="flex items-center space-x-2 bg-stone-100 border border-stone-200/80 rounded-lg px-2.5 py-1 text-xs text-stone-700"
                >
                  <Fingerprint className="w-3.5 h-3.5 text-stone-500" />
                  <span className="font-mono text-[11px] font-medium hidden sm:inline text-stone-600">
                    UID: {truncatedUid}
                  </span>
                  {user.isAnonymous && (
                    <span className="px-1.5 py-0.2 text-[9px] bg-stone-200 text-stone-600 rounded font-semibold">
                      GUEST
                    </span>
                  )}
                </div>

                {/* Sign Out Button */}
                <button
                  id="auth-signout-btn"
                  onClick={handleSignOut}
                  title="Sign out securely"
                  className="p-1.5 rounded-lg text-stone-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>

        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-200 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('journals')}
            className={`px-3 py-1 rounded-md ${activeTab === 'journals' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-stone-600'}`}
          >
            Journals
          </button>
          <button
            onClick={() => setActiveTab('insights')}
            className={`px-3 py-1 rounded-md ${activeTab === 'insights' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-stone-600'}`}
          >
            Insights
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1 rounded-md ${activeTab === 'chat' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-stone-600'}`}
          >
            Companion
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-3 py-1 rounded-md ${activeTab === 'security' ? 'bg-amber-100 text-amber-900 font-semibold' : 'text-stone-600'}`}
          >
            Security
          </button>
        </div>
      </div>
    </header>
  );
};
