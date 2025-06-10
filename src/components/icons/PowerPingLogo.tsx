
import type { SVGProps } from 'react';

const PowerPingLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 60 60" // Square viewBox for the new design
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
    {/* Open Circle Path */}
    <path
      d="M 49.05 41 A 22 22 0 1 0 49.05 19" // Arc starting from (49.05, 41) sweeping counter-clockwise to (49.05, 19)
      stroke="hsl(var(--accent))"
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
    {/* Lightning Bolt Path */}
    <path
      d="M30,8 L38,28 L30,28 L34,38 L22,52 L28,32 L22,32 Z"
      fill="url(#powerPingLightningGradient)"
    />
  </svg>
);

export default PowerPingLogo;
