import React from 'react';

interface GlassBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const GlassBackground: React.FC<GlassBackgroundProps> = ({ children, className = '' }) => {
  return (
    <div className={`relative min-h-screen flex flex-col w-full bg-[#150428] text-slate-100 overflow-x-hidden font-sans selection:bg-pink-500 selection:text-white antialiased ${className}`}>
      {/* 
        Sleek Pinkish Neon Glassmorphism Canvas
        - Dynamic, moving fluid aurora gradients (Neon Pink, Magenta, Fuchsia, Cyan)
        - Translucent frosted glass refraction
        - No static isolated background spheres
      */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none">
        
        {/* Ambient radial foundation in rich magenta-indigo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(236,72,153,0.22),rgba(20,5,40,0.95)_70%)]" />

        {/* Moving Fluid Aurora Wave 1 - Hot Neon Pink & Magenta (Top Right to Center) */}
        <div className="absolute -top-32 -right-24 w-[750px] h-[750px] bg-gradient-to-bl from-pink-500/40 via-fuchsia-500/35 to-rose-600/20 rounded-full blur-[130px] animate-aurora-1" />

        {/* Moving Fluid Aurora Wave 2 - Radiant Cyan & Sky (Top Left to Center) */}
        <div className="absolute -top-24 -left-28 w-[700px] h-[700px] bg-gradient-to-br from-cyan-400/30 via-sky-500/25 to-purple-600/20 rounded-full blur-[140px] animate-aurora-2" />

        {/* Moving Fluid Aurora Wave 3 - Electric Violet & Deep Rose (Middle Right) */}
        <div className="absolute top-1/3 -right-20 w-[650px] h-[650px] bg-gradient-to-l from-rose-500/35 via-pink-600/30 to-purple-800/25 rounded-full blur-[130px] animate-aurora-3" />

        {/* Moving Fluid Aurora Wave 4 - Soft Cyan-Pink Core Wash (Bottom Center) */}
        <div className="absolute -bottom-40 left-1/2 -translate-x-1/2 w-[900px] h-[550px] bg-gradient-to-t from-pink-500/30 via-cyan-500/20 to-purple-900/15 rounded-full blur-[140px] animate-aurora-1" />

        {/* Perspective Grid Plane for Depth */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 w-[1600px] h-[800px] opacity-[0.22] pointer-events-none [mask-image:radial-gradient(ellipse_75%_65%_at_50%_40%,#000_30%,transparent_90%)]">
          <div
            className="w-full h-full isometric-stage"
            style={{
              backgroundImage: `
                linear-gradient(to right, rgba(236, 72, 153, 0.28) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(6, 182, 212, 0.25) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px',
            }}
          />
        </div>

        {/* Subtle noise/specular texture overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_20%,rgba(255,255,255,0.04),transparent)]" />
      </div>

      {/* Foreground Content with High-Z layering */}
      <div className="relative z-10 flex-1 flex flex-col min-h-0 w-full">
        {children}
      </div>
    </div>
  );
};
