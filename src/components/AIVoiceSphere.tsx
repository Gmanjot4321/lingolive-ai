import React, { useEffect, useState } from 'react';
import { Mic, Volume2, Sparkles, Radio } from 'lucide-react';

interface AIVoiceSphereProps {
  partnerSpeaking: boolean;
  userSpeaking: boolean;
  isConnected: boolean;
  inputVolume?: number; // 0 to 1
  partnerName: string;
}

export const AIVoiceSphere: React.FC<AIVoiceSphereProps> = ({
  partnerSpeaking,
  userSpeaking,
  isConnected,
  inputVolume = 0,
  partnerName,
}) => {
  const [waveHeights, setWaveHeights] = useState<number[]>([20, 45, 75, 35, 60, 85, 40, 65, 30]);

  // Audio wave animation
  useEffect(() => {
    if (!isConnected) return;
    const interval = setInterval(() => {
      if (partnerSpeaking) {
        setWaveHeights([
          40 + Math.random() * 55,
          50 + Math.random() * 50,
          70 + Math.random() * 30,
          85 + Math.random() * 15,
          65 + Math.random() * 35,
          80 + Math.random() * 20,
          55 + Math.random() * 45,
          45 + Math.random() * 50,
          30 + Math.random() * 60,
        ]);
      } else if (userSpeaking) {
        const boost = Math.min(100, Math.max(25, inputVolume * 150));
        setWaveHeights([
          20 + Math.random() * boost,
          35 + Math.random() * boost,
          50 + Math.random() * boost,
          70 + Math.random() * boost,
          90 + Math.random() * (boost * 0.5),
          65 + Math.random() * boost,
          45 + Math.random() * boost,
          30 + Math.random() * boost,
          15 + Math.random() * boost,
        ]);
      } else {
        setWaveHeights([15, 25, 35, 45, 35, 25, 20, 15, 12]);
      }
    }, 120);

    return () => clearInterval(interval);
  }, [partnerSpeaking, userSpeaking, isConnected, inputVolume]);

  return (
    <div className="relative flex flex-col items-center justify-center my-1 sm:my-2 select-none shrink-0">
      
      {/* Outer Radiating Soundwave Rings */}
      {isConnected && (partnerSpeaking || userSpeaking) && (
        <>
          <div
            className={`absolute w-52 h-52 sm:w-64 sm:h-64 rounded-full border border-pink-400/30 animate-sound-ripple pointer-events-none ${
              partnerSpeaking ? 'border-pink-500/50' : 'border-cyan-400/50'
            }`}
          />
          <div
            className={`absolute w-60 h-60 sm:w-72 sm:h-72 rounded-full border border-cyan-400/25 animate-sound-ripple pointer-events-none [animation-delay:0.7s] ${
              partnerSpeaking ? 'border-fuchsia-500/40' : 'border-teal-400/40'
            }`}
          />
        </>
      )}

      {/* Atmospheric Halo Glow */}
      <div
        className={`absolute rounded-full transition-all duration-700 blur-2xl sm:blur-3xl pointer-events-none ${
          partnerSpeaking
            ? 'w-52 h-52 sm:w-64 sm:h-64 bg-gradient-to-tr from-pink-500/45 via-rose-500/40 to-fuchsia-600/35 scale-110'
            : userSpeaking
            ? 'w-52 h-52 sm:w-64 sm:h-64 bg-gradient-to-tr from-cyan-400/45 via-teal-500/40 to-blue-500/35 scale-110'
            : isConnected
            ? 'w-48 h-48 sm:w-56 sm:h-56 bg-gradient-to-tr from-pink-500/25 via-purple-600/25 to-cyan-400/25 animate-pulse'
            : 'w-36 h-36 bg-white/[0.04]'
        }`}
      />

      {/* Modern Fluid 3D Moving AI Sphere Container */}
      <div className="relative z-10 flex items-center justify-center w-36 h-36 sm:w-44 sm:h-44">
        
        {/* The Morphing Fluid AI Body */}
        <div
          className={`w-28 h-28 sm:w-36 sm:h-36 transition-all duration-500 relative flex items-center justify-center overflow-hidden shadow-2xl ${
            partnerSpeaking
              ? 'ai-morph-sphere-speaking bg-gradient-to-tr from-pink-600 via-rose-500 to-fuchsia-400 shadow-[0_0_50px_rgba(236,72,153,0.7)] ring-2 ring-white/60'
              : userSpeaking
              ? 'ai-morph-sphere-listening bg-gradient-to-tr from-cyan-500 via-teal-400 to-sky-300 shadow-[0_0_50px_rgba(6,182,212,0.7)] ring-2 ring-white/60'
              : isConnected
              ? 'ai-morph-sphere bg-gradient-to-tr from-[#3b0764] via-[#701a75] to-[#0369a1] shadow-[0_0_35px_rgba(236,72,153,0.4)] ring-1 ring-white/30'
              : 'rounded-full bg-white/[0.06] border border-white/20 shadow-inner'
          }`}
        >
          {/* Internal Swirling Liquid Light Layers */}
          {isConnected && (
            <>
              {/* Internal neon fluid shimmer */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.7),transparent_60%)] pointer-events-none" />
              <div className="absolute -inset-2 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-60 rotate-45 animate-pulse pointer-events-none" />
              <div className="absolute bottom-0 inset-x-0 h-1/2 bg-gradient-to-t from-black/35 to-transparent pointer-events-none" />
            </>
          )}

          {/* Central State Indicator & Icon */}
          <div className="relative z-20 flex flex-col items-center justify-center text-center p-2 pointer-events-none">
            {partnerSpeaking ? (
              <>
                <Volume2 className="w-7 h-7 sm:w-8 sm:h-8 text-white drop-shadow-md animate-bounce" />
                <span className="text-[10px] sm:text-[11px] font-black text-white mt-0.5 uppercase tracking-widest drop-shadow-sm">
                  Speaking
                </span>
                <span className="text-[9px] text-pink-100 font-bold line-clamp-1">{partnerName}</span>
              </>
            ) : userSpeaking ? (
              <>
                <Mic className="w-7 h-7 sm:w-8 sm:h-8 text-slate-950 drop-shadow-md animate-pulse" />
                <span className="text-[10px] sm:text-[11px] font-black text-slate-950 mt-0.5 uppercase tracking-widest">
                  Listening
                </span>
                <span className="text-[9px] text-teal-950 font-bold">You</span>
              </>
            ) : isConnected ? (
              <>
                <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-cyan-200 animate-spin [animation-duration:8s]" />
                <span className="text-[11px] sm:text-xs font-black text-white mt-0.5 tracking-wide">Live Ready</span>
                <span className="text-[9px] sm:text-[10px] text-cyan-200 font-medium">Say anything</span>
              </>
            ) : (
              <>
                <Radio className="w-6 h-6 sm:w-7 sm:h-7 text-slate-400" />
                <span className="text-[10px] sm:text-[11px] font-bold text-slate-300 mt-0.5">Offline</span>
                <span className="text-[9px] text-slate-400">Click start</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Dynamic Audio Soundwave Bars */}
      {isConnected && (
        <div className="flex items-center gap-1.5 h-6 mt-2 px-3 py-1 rounded-full glass-pill border border-white/20">
          {waveHeights.map((h, i) => (
            <div
              key={i}
              className={`w-1 rounded-full transition-all duration-100 ${
                partnerSpeaking
                  ? 'bg-gradient-to-t from-pink-500 to-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.6)]'
                  : userSpeaking
                  ? 'bg-gradient-to-t from-cyan-400 to-teal-200 shadow-[0_0_8px_rgba(6,182,212,0.6)]'
                  : 'bg-white/20'
              }`}
              style={{ height: `${Math.max(6, h * 0.28)}px` }}
            />
          ))}
        </div>
      )}
    </div>
  );
};
