import React from 'react';

// InfoScope OSINT Platform Icon Component
// A modern, attractive icon representing investigation, intelligence, and digital forensics

const InfoScopeIcon = ({ size = 24, className = "", variant = "default" }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'gradient':
        return {
          primary: "url(#gradient-primary)",
          secondary: "url(#gradient-secondary)",
          accent: "url(#gradient-accent)"
        };
      case 'monochrome':
        return {
          primary: "currentColor",
          secondary: "currentColor",
          accent: "currentColor"
        };
      default:
        return {
          primary: "#2563eb", // Blue
          secondary: "#7c3aed", // Purple  
          accent: "#059669" // Green
        };
    }
  };

  const colors = getVariantStyles();

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="InfoScope OSINT Platform"
    >
      {/* Gradient Definitions */}
      <defs>
        <linearGradient id="gradient-primary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="gradient-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
        <linearGradient id="gradient-accent" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#047857" />
        </linearGradient>
        
        {/* Glow Effect */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
          <feMerge> 
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>

      {/* Background Circle - Represents the digital world/scope */}
      <circle
        cx="32"
        cy="32"
        r="30"
        fill={colors.primary}
        opacity="0.1"
        stroke={colors.primary}
        strokeWidth="2"
        strokeDasharray="4 4"
      />

      {/* Central Magnifying Glass - Core OSINT Investigation */}
      <g filter="url(#glow)">
        {/* Magnifying Glass Lens */}
        <circle
          cx="24"
          cy="24"
          r="12"
          fill="none"
          stroke={colors.primary}
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Magnifying Glass Handle */}
        <path
          d="M33 33L44 44"
          stroke={colors.primary}
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Handle Grip */}
        <circle
          cx="44"
          cy="44"
          r="3"
          fill={colors.primary}
        />
      </g>

      {/* Data Streams - Information Flow */}
      <g opacity="0.8">
        {/* Left Data Stream */}
        <path
          d="M8 16 Q12 20 8 24 Q12 28 8 32"
          fill="none"
          stroke={colors.secondary}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Top Data Stream */}
        <path
          d="M16 8 Q20 12 24 8 Q28 12 32 8"
          fill="none"
          stroke={colors.secondary}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Right Data Stream */}
        <path
          d="M56 32 Q52 36 56 40 Q52 44 56 48"
          fill="none"
          stroke={colors.accent}
          strokeWidth="2"
          strokeLinecap="round"
        />
        
        {/* Bottom Data Stream */}
        <path
          d="M48 56 Q44 52 40 56 Q36 52 32 56"
          fill="none"
          stroke={colors.accent}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </g>

      {/* Network Nodes - Intelligence Sources */}
      <g>
        {/* Top Left Node */}
        <circle cx="12" cy="12" r="2" fill={colors.secondary} />
        
        {/* Top Right Node */}
        <circle cx="52" cy="12" r="2" fill={colors.accent} />
        
        {/* Bottom Left Node */}
        <circle cx="12" cy="52" r="2" fill={colors.accent} />
        
        {/* Bottom Right Node */}
        <circle cx="52" cy="52" r="2" fill={colors.secondary} />
      </g>

      {/* Central Information Symbol - The 'i' in InfoScope */}
      <g transform="translate(24, 24)">
        {/* Info dot */}
        <circle
          cx="0"
          cy="-6"
          r="1.5"
          fill={colors.primary}
        />
        
        {/* Info line */}
        <rect
          x="-1"
          y="-2"
          width="2"
          height="8"
          rx="1"
          fill={colors.primary}
        />
      </g>

      {/* Targeting Crosshairs - Precision Investigation */}
      <g opacity="0.6">
        <path
          d="M32 2 L32 8 M32 56 L32 62 M2 32 L8 32 M56 32 L62 32"
          stroke={colors.primary}
          strokeWidth="1"
          strokeLinecap="round"
        />
      </g>
    </svg>
  );
};

export default InfoScopeIcon;