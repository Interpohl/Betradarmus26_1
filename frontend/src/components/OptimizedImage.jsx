import React, { useState } from 'react';

/**
 * Optimized image component with lazy loading and placeholder
 */
export const OptimizedImage = ({ 
  src, 
  alt, 
  className = '', 
  width, 
  height,
  placeholder = null 
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 bg-[#121212] animate-pulse flex items-center justify-center">
          {placeholder || (
            <div className="w-8 h-8 border-2 border-[#39FF14]/20 border-t-[#39FF14] rounded-full animate-spin" />
          )}
        </div>
      )}
      
      {/* Actual image */}
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        loading="lazy"
        decoding="async"
        onLoad={() => setIsLoaded(true)}
        onError={() => setHasError(true)}
        className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'} ${className}`}
      />
      
      {/* Error state */}
      {hasError && (
        <div className="absolute inset-0 bg-[#121212] flex items-center justify-center">
          <span className="text-[#A1A1AA] text-sm">Bild konnte nicht geladen werden</span>
        </div>
      )}
    </div>
  );
};

export default OptimizedImage;
