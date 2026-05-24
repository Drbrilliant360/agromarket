import { useState } from "react";
import { Sprout } from "lucide-react";

interface SafeImageProps {
  src?: string;
  alt?: string;
  className?: string;
  id?: string;
}

export default function SafeImage({ src, alt = "Crop Image", className = "", id }: SafeImageProps) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  // Fallback if no source, or if source fails to load
  const isFallbackNeeded = !src || error;

  return (
    <div className={`relative overflow-hidden bg-slate-100 ${className}`} id={id}>
      {/* Loading shimmer skeleton */}
      {!loaded && !isFallbackNeeded && (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center animate-pulse" id={`${id}-shimmer`}>
          <div className="w-6 h-6 text-slate-300 animate-spin">
            <Sprout className="w-full h-full" />
          </div>
        </div>
      )}

      {isFallbackNeeded ? (
        <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center text-center p-2 border border-dashed border-slate-200 text-slate-400 select-none" id={`${id}-fallback`}>
          <Sprout className="w-8 h-8 text-emerald-500/60 mb-1 animate-bounce" />
          <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-slate-400">Crop Image</span>
        </div>
      ) : (
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(true)}
          onError={() => setError(true)}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          }`}
          loading="lazy"
        />
      )}
    </div>
  );
}
