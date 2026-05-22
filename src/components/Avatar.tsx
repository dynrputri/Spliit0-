import React from 'react';

interface AvatarProps {
  name: string;
  avatarUrl?: string;
  color: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function Avatar({ name, avatarUrl, color, size = 'md', className = '' }: AvatarProps) {
  let sizeClasses = 'w-8 h-8 text-xs';
  if (size === 'xs') sizeClasses = 'w-5 h-5 text-[9px]';
  if (size === 'sm') sizeClasses = 'w-6 h-6 text-[10px]';
  if (size === 'md') sizeClasses = 'w-8 h-8 text-xs';
  if (size === 'lg') sizeClasses = 'w-10 h-10 text-sm';
  if (size === 'xl') sizeClasses = 'w-16 h-16 text-lg';

  if (avatarUrl) {
    // xs, sm -> rounded-full, others -> rounded-xl to match standard modern design
    const borderRadiusForImage = size === 'xs' || size === 'sm' ? 'rounded-full' : 'rounded-lg';
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses} ${borderRadiusForImage} object-cover shadow-xs border border-slate-100 dark:border-slate-800 shrink-0 ${className}`}
        referrerPolicy="no-referrer"
      />
    );
  }

  const shapeClass = size === 'xs' || size === 'sm' ? 'rounded-full' : 'rounded-lg';
  return (
    <span className={`${sizeClasses} ${shapeClass} flex items-center justify-center font-extrabold shadow-sm shrink-0 ${color} ${className}`}>
      {name ? name[0].toUpperCase() : '?'}
    </span>
  );
}
