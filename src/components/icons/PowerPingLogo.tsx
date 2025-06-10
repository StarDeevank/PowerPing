
import type { SVGProps } from 'react';

const PowerPingLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 60 60" // Square viewBox
    fill="none"
    {...props}
  >
    <defs>
      <linearGradient id="powerPingLightningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#E5E5E5' }} />
        <stop offset="50%" style={{ stopColor: '#C0C0C0' }} />
        <stop offset="100%" style={{ stopColor: '#A0A0A0' }} />
      </linearGradient>
    </defs>
    {/* Open Circle Path - unchanged */}
    <path
      d="M 49.05 41 A 22 22 0 1 0 49.05 19"
      stroke="hsl(var(--accent))"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    {/* Simplified Lightning Bolt Path for robustness */}
    <path
      d="M33 18 L27 32 L34 32 L28 45 L37 28 L30 28 Z" // Adjusted for visual balance
      fill="url(#powerPingLightningGradient)"
    />
  </svg>
);

export default PowerPingLogo;
