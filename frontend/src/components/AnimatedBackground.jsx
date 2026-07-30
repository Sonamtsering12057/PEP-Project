import React from 'react';

const AnimatedBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] overflow-hidden bg-slate-50">
      {/* Soft animated gradient orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-[60%] h-[60%] bg-emerald-300/30 rounded-full mix-blend-multiply filter blur-[120px] animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-[70%] h-[70%] bg-cyan-300/30 rounded-full mix-blend-multiply filter blur-[100px] animate-blob animation-delay-4000"></div>
      
      {/* Subtle Grid overlay for texture */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDEwIEwgNDAgMTAgTSAxMCAwIEwgMTAgNDAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iI2U1ZTdlYiIgc3Ryb2tlLXdpZHRoPSIwLjUiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-50"></div>
    </div>
  );
};

export default AnimatedBackground;
