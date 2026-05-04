import React, { useEffect } from 'react';
import { auth } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged, signOut } from 'firebase/auth';
import UploadStep from './components/UploadStep';
import VerifyStep from './components/VerifyStep';
import FormStep from './components/FormStep';
import Dashboard from './components/Dashboard';
import MinistryDashboard from './components/MinistryDashboard';
import PillNav from './components/PillNav';
import { ReportSkeleton } from './components/Skeletons';
import { RippleButton, RippleButtonRipples } from '@/components/animate-ui/components/buttons/ripple';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import Prism from './components/Prism';
import useAppStore from './store/useAppStore';

function App() {
  // ─── Pull everything from the Zustand store ───────────────────────────────
  const {
    user, setUser, setInitializing, initializing,
    view, setView,
    step, file, verificationData,
    handleFileSelect, handleVerifySuccess, handleSubmissionSuccess, handleReset
  } = useAppStore();

  // ─── Firebase Auth Listener — syncs user into the store ──────────────────
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setInitializing(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error('Login failed', err);
    }
  };

  const handleLogout = () => signOut(auth);

  return (
    <div className="min-h-screen flex flex-col items-center bg-transparent">

      {/* Prism WebGL Background — fixed behind everything */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-30">
        <Prism
          animationType="rotate"
          timeScale={0.3}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0}
          glow={1}
          bloom={1.2}
          transparent={true}
        />
      </div>

      {/* Main Header Layout */}
      <header className="w-full max-w-7xl px-6 h-24 flex items-center justify-between lg:grid lg:grid-cols-3 z-[1001] relative">

        {/* Branding (Left) */}
        <div className="flex items-center">
          <h1 className="text-xl md:text-2xl font-black tracking-tighter text-white drop-shadow-md">ROADPORTS AI</h1>
        </div>

        {/* Navigation (Center - Desktop) */}
        <div className="hidden lg:flex justify-center items-center">
          <PillNav
            logo={null}
            logoAlt="Roadports"
            items={[
              { label: 'Report', href: 'report' },
              { label: 'My Reports', href: 'dashboard' },
              { label: 'Ministry', href: 'ministry' }
            ]}
            activeHref={view}
            baseColor="#fff"
            pillColor="#000"
            onItemClick={(item) => setView(item.href)}
            className="!static !top-0 !w-auto"
            initialLoadAnimation={false}
          />
        </div>

        {/* Global User / Auth (Right) */}
        <div className="flex items-center justify-end gap-4 relative z-[1002]">
          {user ? (
            <div className="flex items-center gap-3 bg-white/50 backdrop-blur-md p-1.5 pr-4 rounded-full border border-gray-200 shadow-sm animate-in fade-in slide-in-from-right-4 duration-500">
              <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full border border-white shadow-sm" />
              <button
                onClick={handleLogout}
                className="text-xs font-bold text-gray-500 hover:text-red-500 uppercase tracking-wider transition-colors"
              >
                Logout
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="bg-green text-white px-5 py-2.5 rounded-full font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-green/20"
            >
              Sign In
            </button>
          )}
        </div>
      </header>

      {/* Persistent Mobile Nav Bar */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-[1000] w-[90%] flex justify-center">
        <PillNav
          logo={null}
          items={[
            { label: 'Report', href: 'report' },
            { label: 'My Reports', href: 'dashboard' },
            { label: 'Ministry', href: 'ministry' }
          ]}
          activeHref={view}
          baseColor="#000"
          pillColor="#fff"
          pillTextColor="#000"
          onItemClick={(item) => setView(item.href)}
          className="shadow-2xl"
        />
      </div>

      {/* Main Container */}
      {view === 'dashboard' ? (
        <div className="w-full max-w-7xl flex-1 flex mx-auto">
          <Dashboard user={user} />
        </div>
      ) : view === 'ministry' ? (
        <div className="w-full max-w-7xl flex-1 flex mx-auto">
          <MinistryDashboard user={user} />
        </div>
      ) : initializing ? (
        <ReportSkeleton />
      ) : (
        <main className="flex-1 w-full max-w-5xl p-4 md:p-6 mt-4 md:mt-8 flex flex-col items-center">
          {/* Progress Bar */}
          <div className="w-full max-w-sm flex items-center justify-between mb-8 opacity-70">
            <StepDot active={step >= 1} text="Image" />
            <div className={`flex-1 h-1 mx-2 rounded ${step >= 2 ? 'bg-green' : 'bg-gray-300'}`} />
            <StepDot active={step >= 2} text="AI Scan" />
            <div className={`flex-1 h-1 mx-2 rounded ${step >= 3 ? 'bg-green' : 'bg-gray-300'}`} />
            <StepDot active={step >= 3} text="Location" />
          </div>

          <div className={`w-full rounded-2xl shadow-2xl overflow-hidden min-h-[500px] flex items-stretch justify-center relative border transition-all duration-700
            ${step === 3 ? 'bg-black border-white/5' : 'bg-white border-gray-100'}`}>

            {step === 1 && <UploadStep onFileSelect={handleFileSelect} />}

            {step === 2 && (
              <VerifyStep
                file={file}
                onVerifySuccess={handleVerifySuccess}
                onReset={handleReset}
              />
            )}

            {step === 3 && user && (
              <FormStep
                file={file}
                verificationData={verificationData}
                user={user}
                onSubmissionSuccess={handleSubmissionSuccess}
                onCancel={handleReset}
              />
            )}

            {step === 4 && (
              <div className="w-full flex flex-col items-center justify-center p-8 bg-green/5 animate-in zoom-in duration-500">
                <div className="w-32 h-32 bg-green rounded-full flex items-center justify-center mb-6 shadow-xl shadow-green/20 text-white animate-bounce">
                  <CheckCircle2 className="w-20 h-20" />
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-3 text-center">Thank You!</h2>
                <p className="text-xl text-gray-600 mb-8 max-w-md text-center">
                  Your pothole report has been successfully verified and saved. City authorities have been notified.
                </p>
                <RippleButton
                  onClick={handleReset}
                  className="flex items-center gap-2 px-8 py-6 bg-brown hover:bg-brown/80 text-white rounded-xl shadow-lg transition-all font-semibold text-lg"
                >
                  <RippleButtonRipples />
                  <RefreshCw className="w-5 h-5" /> Report Another
                </RippleButton>
              </div>
            )}

          </div>
        </main>
      )}
    </div>
  );
}

function StepDot({ active, text }) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-md transition-colors ${active ? 'bg-green text-white' : 'bg-white text-gray-400 border border-gray-200'}`}>
        ✓
      </div>
      <span className={`text-xs mt-2 font-medium ${active ? 'text-gray-800' : 'text-gray-400'}`}>
        {text}
      </span>
    </div>
  );
}

export default App;
