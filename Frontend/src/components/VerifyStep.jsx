import React, { useEffect } from 'react';
import { Search, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';
import { RippleButton, RippleButtonRipples } from '@/components/animate-ui/components/buttons/ripple';
import axios from 'axios';

export default function VerifyStep({ file, onVerifySuccess, onReset }) {
  const [status, setStatus] = React.useState('analyzing'); // analyzing, success, failed, error
  const [preview, setPreview] = React.useState(null);

  useEffect(() => {
    // Generate object URL for preview
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);

    // Run AI Verification
    verifyImage(file);

    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  const verifyImage = async (imageFile) => {
    try {
      // Wrap FileReader in a Promise to safely await and catch errors
      const getBase64 = (file) => new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result.split(',')[1]);
        reader.onerror = (error) => reject(error);
      });

      const base64data = await getBase64(imageFile);
      
      const apiKey = import.meta.env.VITE_ROBOFLOW_API_KEY;
      const model = import.meta.env.VITE_ROBOFLOW_MODEL;
      const version = import.meta.env.VITE_ROBOFLOW_VERSION;

      if (!apiKey || !model || !version) {
         console.warn("Roboflow API keys missing. Bypassing AI verification for development.");
         setTimeout(() => {
           setStatus('success');
           setTimeout(onVerifySuccess, 1500);
         }, 2000);
         return;
      }

      // 10 second timeout so we don't hang forever
      const res = await axios({
        method: "POST",
        url: `https://detect.roboflow.com/${model}/${version}`,
        params: {
          api_key: apiKey,
        },
        data: base64data,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        timeout: 30000 
      });

      const predictions = res.data.predictions || [];
      const maxConfidence = predictions.length > 0 ? Math.max(...predictions.map(p => p.confidence)) : 0;
      const isPothole = maxConfidence > 0.50;

      if (isPothole) {
        const verificationData = {
          isPothole: true,
          confidenceScore: maxConfidence,
          severity: maxConfidence > 0.9 ? 'critical' : maxConfidence > 0.7 ? 'high' : maxConfidence > 0.5 ? 'medium' : 'low'
        };
        setStatus('success');
        setTimeout(() => onVerifySuccess(verificationData), 1500);
      } else {
        setStatus('failed');
      }

    } catch (err) {
      console.error("Roboflow API Error:", err.response?.data || err.message);
      setStatus('error'); // Triggers the "Verification Service Offline / Skip" UI Let's the user continue gracefully
    }
  };

  return (
    <div className="w-full flex flex-col items-center justify-center p-8 animate-in fade-in zoom-in duration-500">
      <div className="relative mb-8">
        <img 
          src={preview} 
          alt="Upload preview" 
          className="w-64 h-64 object-cover rounded-xl shadow-2xl ring-4 ring-white"
        />
        
        {/* Overlay Overlay Scanning Effect */}
        {status === 'analyzing' && (
          <div className="absolute inset-0 bg-black/40 rounded-xl flex items-center justify-center overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-1 bg-green-400 shadow-[0_0_15px_3px_rgba(74,222,128,0.7)] animate-[scan_2s_ease-in-out_infinite]" />
             <Search className="w-12 h-12 text-white animate-pulse" />
          </div>
        )}

        {status === 'success' && (
          <div className="absolute -bottom-4 -right-4 bg-green-500 rounded-full p-2 shadow-lg animate-bounce">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </div>
        )}

        {status === 'failed' && (
          <div className="absolute -bottom-4 -right-4 bg-red-500 rounded-full p-2 shadow-lg">
            <XCircle className="w-10 h-10 text-white" />
          </div>
        )}
      </div>

      {status === 'analyzing' && (
        <div className="text-center">
          <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter italic">Analyzing Image...</h3>
          <p className="text-gray-500 font-medium">Our AI is verifying if this is a road anomaly</p>
        </div>
      )}

      {status === 'success' && (
        <div className="text-center text-green-600">
          <h3 className="text-2xl font-bold mb-2">Pothole Verified!</h3>
          <p className="text-gray-600">Taking you to location details...</p>
        </div>
      )}

      {status === 'failed' && (
        <div className="text-center text-red-600">
          <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter italic">No Anomaly Detected</h3>
          <p className="text-gray-600 mb-6 max-w-sm font-medium mx-auto">Our AI couldn't find a clear pothole in this image. Review the photo and try again, or submit it for manual review.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <RippleButton 
              onClick={onReset}
              className="px-6 py-4 bg-red-50 text-red-600 rounded-xl font-bold uppercase tracking-wider hover:bg-red-100 transition-all border border-red-200"
            >
              <RippleButtonRipples />
              Try Another Image
            </RippleButton>
            <RippleButton 
              onClick={() => onVerifySuccess({ isPothole: false, confidenceScore: 0, severity: 'low' })}
              className="px-6 py-4 bg-red-500 text-white rounded-xl font-bold uppercase tracking-wider hover:bg-red-600 transition-colors shadow-md"
            >
              <RippleButtonRipples />
              Submit for Manual Review
            </RippleButton>
          </div>
        </div>
      )}
      
      {status === 'error' && (
        <div className="text-center text-amber-600">
          <AlertTriangle className="w-16 h-16 mx-auto mb-4" />
          <h3 className="text-3xl font-black mb-2 uppercase tracking-tighter italic text-amber-600">AI Proxy Offline</h3>
          <p className="text-gray-600 mb-8 max-w-sm font-medium">We hit a snag reaching the AI service. You can skip and proceed manually.</p>
          <RippleButton 
            onClick={() => onVerifySuccess({ isPothole: false, confidenceScore: 0, severity: 'low' })}
            className="px-6 py-6 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors shadow-md"
          >
            <RippleButtonRipples />
            Skip Verification
          </RippleButton>
        </div>
      )}
    </div>
  );
}
