"use client";

import React from "react";
import { twMerge } from "tailwind-merge";

type AvatarSize = "xs" | "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string;
  alt?: string;
  size?: AvatarSize;
  className?: string;
}

const Avatar = ({ src, alt, size = "md", className = "" }: AvatarProps) => {
  const sizes: Record<AvatarSize, string> = {
    xs: "w-6 h-6",
    sm: "w-8 h-8",
    md: "w-10 h-10",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  return (
    <div
      className={twMerge(
        "overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700",
        sizes[size],
        className
      )}
    >
      {src ? (
        <img
          src={src}
          alt={alt || "Avatar"}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="flex items-center justify-center w-full h-full bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-200">
          {alt ? alt.charAt(0).toUpperCase() : "U"}
        </div>
      )}
    </div>
  );
};

export default Avatar;
