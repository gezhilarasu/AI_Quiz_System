import { useState, useRef, useEffect } from 'react';
import { Camera, Aperture, Play } from 'lucide-react';

export default function CameraComponent() {
  const [permissionRequested, setPermissionRequested] = useState(false);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const [facingMode, setFacingMode] = useState('user'); // 'user' for front camera, 'environment' for back
  const [testStarted, setTestStarted] = useState(false);
  
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Request camera permission
  const requestCameraPermission = async () => {
    setPermissionRequested(true);
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: facingMode }
      });
      
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setPermissionGranted(true);
      setIsCameraOn(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
      setPermissionGranted(false);
      setIsCameraOn(false);
    }
  };

  // Switch between front and back camera
  const switchCamera = async () => {
    if (streamRef.current) {
      // Stop all tracks in the current stream
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    // Toggle facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
    setFacingMode(newFacingMode);
    
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: newFacingMode }
      });
      
      streamRef.current = newStream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
      }
    } catch (err) {
      console.error("Error switching camera:", err);
    }
  };

  // Start test functionality
  const startTest = () => {
    setTestStarted(true);
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto p-4 gap-6">
      {/* Left side - Controls */}
      <div className="flex flex-col items-center justify-center w-full md:w-1/2 p-6 bg-gray-100 rounded-lg">
        <div className="flex flex-col items-center space-y-6">
          {!permissionRequested ? (
            <div className="flex flex-col items-center">
              <button 
                onClick={requestCameraPermission}
                className="flex items-center justify-center p-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors mb-4"
              >
                <Camera size={48} />
              </button>
              <p className="text-center text-gray-700">Click the camera icon to request permission</p>
            </div>
          ) : !permissionGranted ? (
            <div className="flex flex-col items-center">
              <div className="text-center text-red-600 mb-4">
                Camera permission denied. Please enable camera access in your browser settings.
              </div>
              <button 
                onClick={requestCameraPermission}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center space-y-6 w-full">
              <div className="flex items-center space-x-4">
                {isCameraOn && (
                  <button 
                    onClick={switchCamera}
                    className="flex items-center justify-center p-3 rounded-full bg-gray-700 hover:bg-gray-800 text-white transition-colors"
                    title="Switch camera"
                  >
                    <Aperture size={24} />
                  </button>
                )}
                
                {!testStarted ? (
                  <button 
                    onClick={startTest}
                    className="flex items-center justify-center px-6 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                  >
                    <Play size={20} className="mr-2" />
                    Start Test
                  </button>
                ) : (
                  <div className="bg-green-100 text-green-800 px-4 py-2 rounded">
                    Test in progress...
                  </div>
                )}
              </div>
              
              {testStarted && (
                <div className="w-full bg-white p-4 rounded-lg shadow">
                  <h3 className="font-medium text-lg mb-4">Test Content</h3>
                  <div className="space-y-2">
                    <p>Your test content goes here.</p>
                    <p>This will only be shown after camera permission is granted and test is started.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Right side - Camera Display */}
      <div className="w-full md:w-1/2 bg-gray-800 rounded-lg overflow-hidden flex items-center justify-center">
        {isCameraOn ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 p-8 text-center">
            Camera feed will appear here after permission is granted
          </div>
        )}
      </div>
    </div>
  );
}