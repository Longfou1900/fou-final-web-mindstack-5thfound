// src/components/ui/avatar.jsx
import React from 'react';

export const Avatar = ({ children, className, ...props }) => (
  <div className={`avatar ${className}`} {...props}>
    {children}
  </div>
);

export const AvatarImage = ({ src, alt, ...props }) => (
  <img src={src} alt={alt} className="avatar-image" {...props} />
);

export const AvatarFallback = ({ children, ...props }) => (
  <div className="avatar-fallback" {...props}>
    {children}
  </div>
);