import React, { useState } from 'react';
import UploadStep from './components/UploadStep';
import VerifyStep from './components/VerifyStep';
import FormStep from './components/FormStep';
import Dashboard from './components/Dashboard';
import { RippleButton, RippleButtonRipples } from '@/components/animate-ui/components/buttons/ripple';
import { CheckCircle2, RefreshCw, LayoutDashboard, Flag } from 'lucide-react';

function App() {
  const [view, setView] = useState('report');
  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [verificationData, setVerificationData] = useState(null);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    setStep(2); // Move to verification
  };

  const handleVerifySuccess = (data) => {
    setVerificationData(data);
    setStep(3); // Move to form mapping
  };

  const handleSubmissionSuccess = () => {
    setStep(4); // Success overlay
  }

  const handleReset = () => {
    setFile(null);
    setStep(1);
  }

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-50">
      {/* Header */}
      <header className="w-full text-black p-4 px-6 flex justify-between items-center z-50 relative">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight hidden sm:block">Roadports AI</h1>
          <h1 className="text-2xl font-bold tracking-tight sm:hidden">RPAI</h1>
          <span className="text-xs bg-green px-2.5 py-1 rounded-full font-medium shadow-inner hidden md:inline-block">Pothole Shield</span>
        </div>
        <nav className="flex gap-2">
          <button onClick={() => setView('report')} className={`flex items-center gap-2 px-3 py-2 md:px-4 rounded-lg font-medium transition-colors ${view === 'report' ? 'bg-gray-200 text-black shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
            <Flag className="w-4 h-4" /> <span className="hidden sm:inline">Report Feature</span>
          </button>
          <button onClick={() => setView('dashboard')} className={`flex items-center gap-2 px-3 py-2 md:px-4 rounded-lg font-medium transition-colors ${view === 'dashboard' ? 'bg-gray-200 text-black shadow-sm' : 'text-gray-700 hover:bg-gray-100'}`}>
            <LayoutDashboard className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
          </button>
        </nav>
      </header>

      {/* Main Container */}
      {view === 'dashboard' ? (
        <div className="w-full max-w-7xl flex-1 flex mx-auto">
          <Dashboard />
        </div>
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

          <div className="w-full bg-white rounded-2xl shadow-xl overflow-hidden min-h-[500px] flex items-stretch justify-center relative border border-gray-100">
            {step === 1 && <UploadStep onFileSelect={handleFileSelect} />}

            {step === 2 && (
              <VerifyStep
                file={file}
                onVerifySuccess={handleVerifySuccess}
                onReset={handleReset}
              />
            )}

            {step === 3 && (
              <FormStep
                file={file}
                verificationData={verificationData}
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
