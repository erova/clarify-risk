"use client";

/**
 * Animated background with blue tint
 * Creates an underwater caustic light effect
 */
export function ProtoHubBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-[#0a0a0c]">
      {/* Base gradient layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0c] via-[#080a12] to-[#0a0a0c]" />
      
      {/* Primary caustic light - large, slow movement */}
      <div 
        className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[120px] animate-caustic-1"
        style={{
          background: 'radial-gradient(circle, rgba(59, 130, 246, 0.6) 0%, rgba(59, 130, 246, 0.2) 40%, transparent 70%)',
          top: '-20%',
          left: '30%',
        }}
      />
      
      {/* Secondary caustic - medium, offset timing */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full opacity-25 blur-[100px] animate-caustic-2"
        style={{
          background: 'radial-gradient(circle, rgba(96, 165, 250, 0.5) 0%, rgba(37, 99, 235, 0.15) 50%, transparent 70%)',
          top: '-10%',
          right: '20%',
        }}
      />
      
      {/* Tertiary caustic - smaller, faster pulse */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full opacity-20 blur-[80px] animate-caustic-3"
        style={{
          background: 'radial-gradient(circle, rgba(147, 197, 253, 0.4) 0%, rgba(59, 130, 246, 0.1) 50%, transparent 70%)',
          top: '5%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />
      
      {/* Deep ambient glow */}
      <div 
        className="absolute w-[1200px] h-[600px] rounded-full opacity-15 blur-[150px] animate-pulse-slow"
        style={{
          background: 'radial-gradient(ellipse, rgba(29, 78, 216, 0.5) 0%, transparent 60%)',
          top: '-30%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      />

      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Vignette effect */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, rgba(10, 10, 12, 0.4) 70%, rgba(10, 10, 12, 0.8) 100%)',
        }}
      />
    </div>
  );
}
