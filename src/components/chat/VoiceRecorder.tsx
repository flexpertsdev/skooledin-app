import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';

interface VoiceRecorderProps {
  isRecording: boolean;
  onStop: () => void;
  onSend: (duration: number) => void;
}

export function VoiceRecorder({ isRecording, onStop, onSend }: VoiceRecorderProps) {
  const [duration, setDuration] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    if (isRecording) {
      setDuration(0);
      intervalRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRecording]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isRecording) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-3 safe-bottom z-50">
      <div className="flex items-center gap-4">
        <button
          onClick={onStop}
          className="p-2 hover:bg-gray-100 rounded-full"
        >
          <X size={20} className="text-gray-600" />
        </button>

        <div className="flex-1 flex items-center gap-3">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
          <span className="text-sm font-medium">Recording</span>
          <span className="text-sm text-gray-600">{formatDuration(duration)}</span>
        </div>

        <button
          onClick={() => onSend(duration)}
          className="p-3 bg-brand-primary text-white rounded-full hover:bg-brand-darker"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}