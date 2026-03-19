"use client";

import { Suspense, lazy } from "react";

const Spline = lazy(() => import("@splinetool/react-spline"));

interface SplineSceneProps {
  scene: string;
  className?: string;
}

function SplineLoader() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-spin" />
        <div className="absolute inset-4 border border-solana-purple/40 rounded-full animate-[spin_2s_linear_infinite_reverse]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 bg-primary rounded-full animate-pulse" />
        </div>
      </div>
    </div>
  );
}

export default function SplineScene({
  scene,
  className = "",
}: SplineSceneProps) {
  return (
    <div className={`relative ${className}`}>
      <Suspense fallback={<SplineLoader />}>
        <Spline scene={scene} />
      </Suspense>
    </div>
  );
}

export function SplinePlaceholder() {
  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <div className="relative w-64 h-64">
        <div className="absolute inset-0 border-2 border-primary/30 rounded-full animate-[spin_10s_linear_infinite]" />
        <div className="absolute inset-4 border border-solana-purple/40 rounded-full animate-[spin_6s_linear_infinite_reverse]" />
        <div className="absolute inset-8 border border-solana-green/20 rounded-full animate-[spin_8s_linear_infinite]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-8xl text-primary drop-shadow-[0_0_15px_rgba(0,242,255,0.5)]">
            <svg
              viewBox="0 0 24 24"
              className="w-20 h-20 fill-primary"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M21 16.5C21 16.88 20.79 17.21 20.47 17.38L12.57 21.82C12.41 21.94 12.21 22 12 22C11.79 22 11.59 21.94 11.43 21.82L3.53 17.38C3.21 17.21 3 16.88 3 16.5V7.5C3 7.12 3.21 6.79 3.53 6.62L11.43 2.18C11.59 2.06 11.79 2 12 2C12.21 2 12.41 2.06 12.57 2.18L20.47 6.62C20.79 6.79 21 7.12 21 7.5V16.5Z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
