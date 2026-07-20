import React from "react";
import { cn } from "@/lib/utils";

interface GradientFeatureCardProps {
  title: string;
  description: string;
  image?: React.ReactNode;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function GradientFeatureCard({
  title,
  description,
  image,
  actionText,
  onAction,
  className,
}: GradientFeatureCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-[32px] bg-[#1c1c1e] text-white flex flex-col justify-between p-6 sm:p-8 min-h-[400px]",
        className
      )}
    >
      {/* Top Content */}
      <div className="relative z-10 flex flex-col gap-3 max-w-sm">
        <h3 className="text-[28px] font-medium tracking-tight leading-tight">{title}</h3>
        <p className="text-[15px] text-[#8e8e93] leading-relaxed pr-4">
          {description}
        </p>
      </div>

      {/* Middle Image/Illustration */}
      {image && (
        <div className="relative z-10 flex-1 flex items-center justify-center my-6">
          {image}
        </div>
      )}

      {/* Bottom Gradient Overlay */}
      <div className="absolute bottom-0 left-0 right-0 h-[60%] bg-gradient-to-t from-[#10b981] via-[#10b981]/80 to-transparent pointer-events-none" />
      
      {/* Action Button */}
      {actionText && (
        <div className="relative z-10 mt-auto pt-4 w-full">
          <button
            onClick={onAction}
            className="w-full bg-white text-black font-medium text-[15px] py-4 px-4 rounded-[16px] hover:bg-white/90 transition-colors shadow-sm"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
}
