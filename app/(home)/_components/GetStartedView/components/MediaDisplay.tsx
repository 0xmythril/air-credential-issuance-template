"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface MediaDisplayProps {
  src: string;
  alt?: string;
  type?: "image" | "video" | "auto";
  className?: string;
  imageClassName?: string;
  videoClassName?: string;
  autoPlay?: boolean;
  loop?: boolean;
  muted?: boolean;
  controls?: boolean;
  poster?: string;
  fallbackSrc?: string;
}

export function MediaDisplay({
  src,
  alt = "Media content",
  type = "auto",
  className,
  imageClassName,
  videoClassName,
  autoPlay = true,
  loop = true,
  muted = true,
  controls = false,
  poster,
  fallbackSrc,
}: MediaDisplayProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-detect media type based on file extension
  const detectMediaType = (url: string): "image" | "video" => {
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp", ".svg"];
    
    const extension = url.toLowerCase().substring(url.lastIndexOf("."));
    
    if (videoExtensions.some(ext => extension.includes(ext))) {
      return "video";
    }
    if (imageExtensions.some(ext => extension.includes(ext))) {
      return "image";
    }
    
    // Default to image if can't determine
    return "image";
  };

  const mediaType = type === "auto" ? detectMediaType(src) : type;
  const currentSrc = hasError && fallbackSrc ? fallbackSrc : src;

  // If there's an error and no fallback, don't render anything
  if (hasError && !fallbackSrc) {
    return null;
  }

  const handleError = () => {
    setHasError(true);
    setIsLoading(false);
  };

  const handleLoad = () => {
    setIsLoading(false);
  };

  const commonProps = {
    onError: handleError,
    onLoad: handleLoad,
    className: cn(
      "w-full h-auto rounded-lg shadow-lg transition-opacity duration-300",
      isLoading && "opacity-50",
      className
    ),
  };

  if (mediaType === "video") {
    return (
      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        )}
        <video
          {...commonProps}
          className={cn(commonProps.className, videoClassName)}
          autoPlay={autoPlay}
          loop={loop}
          muted={muted}
          controls={controls}
          poster={poster}
          onLoadedData={handleLoad}
          onError={handleError}
        >
          <source src={currentSrc} />
          <p className="text-muted-foreground">
            Your browser does not support the video element.
          </p>
        </video>
      </div>
    );
  }

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
      <img
        {...commonProps}
        className={cn(commonProps.className, imageClassName)}
        src={currentSrc}
        alt={alt}
      />
    </div>
  );
}
