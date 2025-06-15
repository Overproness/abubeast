export function PageHeader({ title, subtitle }) {
  return (
    <div className="relative mb-8 text-center py-20 bg-gradient-to-br from-indigo-50/80 via-white/60 to-purple-50/80 dark:from-gray-900/90 dark:via-slate-800/80 dark:to-purple-900/90 backdrop-blur-xl overflow-hidden">
      {/* Glass overlay */}
      <div className="absolute inset-0 bg-white/20 dark:bg-black/20 backdrop-blur-sm"></div>

      {/* Animated gradient orbs */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-blue-400/60 to-cyan-400/60 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-r from-purple-400/60 to-pink-400/60 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-gradient-to-r from-emerald-400/60 to-teal-400/60 rounded-full blur-xl animate-bounce delay-500"></div>
        <div className="absolute top-1/3 right-1/3 w-20 h-20 bg-gradient-to-r from-orange-400/60 to-red-400/60 rounded-full blur-lg animate-pulse delay-700"></div>
      </div>

      {/* Floating glass cards */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 right-20 w-16 h-16 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 animate-float"></div>
        <div className="absolute bottom-32 left-16 w-12 h-12 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-xl border border-white/20 dark:border-white/10 animate-float delay-300"></div>
        <div className="absolute top-40 left-1/2 w-8 h-8 bg-white/10 dark:bg-white/5 backdrop-blur-md rounded-lg border border-white/20 dark:border-white/10 animate-float delay-500"></div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <div className="inline-block mb-6">
          <div className="h-1 w-20 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mx-auto animate-shimmer bg-[length:200%_100%]"></div>
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-gray-800 via-blue-600 to-purple-700 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent leading-tight animate-fade-in-up drop-shadow-sm">
          {title}
        </h1>

        {subtitle && (
          <div className="mt-6 backdrop-blur-sm bg-white/10 dark:bg-black/10 rounded-2xl p-6 border border-white/20 dark:border-white/10 shadow-xl">
            <p className="text-lg md:text-xl text-gray-700 dark:text-gray-200 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200 font-medium">
              {subtitle}
            </p>
          </div>
        )}

        <div className="mt-10">
          <div className="flex justify-center space-x-3">
            <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full animate-bounce shadow-lg"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full animate-bounce delay-100 shadow-lg"></div>
            <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-bounce delay-200 shadow-lg"></div>
          </div>
        </div>
      </div>

      {/* Bottom wave decoration with glass effect */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg
          className="w-full h-16 text-white/80 dark:text-gray-800/80 drop-shadow-sm"
          fill="currentColor"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
        >
          <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V0H0V27.35A600.21,600.21,0,0,0,321.39,56.44Z"></path>
        </svg>
      </div>
    </div>
  );
}
