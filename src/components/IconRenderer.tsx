import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
  targetUrl?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className, targetUrl }) => {
  // If the icon name matches the target URL, fetch the website's favicon
  if (targetUrl && name === targetUrl) {
    try {
      const url = new URL(targetUrl);
      const faviconUrl = `https://www.google.com/s2/favicons?domain=${url.hostname}&sz=128`;
      return <img src={faviconUrl} alt="" className={`object-cover ${className}`} />;
    } catch {
      // Fallback if URL parsing fails
    }
  }

  // If it's another URL (starts with http)
  if (name.startsWith('http')) {
    return <img src={name} alt="" className={`object-cover ${className}`} />;
  }

  // Otherwise, it's a Lucide icon
  const Icon = (LucideIcons as any)[name] as LucideIcon;
  if (!Icon) return <LucideIcons.Globe className={className} />;

  return <Icon className={className} />;
};
