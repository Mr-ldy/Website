import React from 'react';
import * as LucideIcons from 'lucide-react';
import { LucideIcon } from 'lucide-react';

interface IconRendererProps {
  name: string;
  className?: string;
}

export const IconRenderer: React.FC<IconRendererProps> = ({ name, className }) => {
  // If it's a URL (starts with http)
  if (name.startsWith('http')) {
    return <img src={name} alt="" className={className} />;
  }

  // Otherwise, it's a Lucide icon
  const Icon = (LucideIcons as any)[name] as LucideIcon;
  if (!Icon) return <LucideIcons.Globe className={className} />;

  return <Icon className={className} />;
};
