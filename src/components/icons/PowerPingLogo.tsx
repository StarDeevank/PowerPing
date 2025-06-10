
import type { SVGProps } from 'react';

const PowerPingLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 40" // Adjusted viewBox for a more horizontal logo
    fill="none"
    {...props}
  >
    {/* Simplified wave path */}
    <path
      d="M10 20 Q25 10, 40 20 T70 20 Q85 30, 100 20"
      stroke="hsl(var(--foreground))" // Use foreground color from theme
      strokeWidth="2"
      fill="transparent"
    />
    {/* Letter E - simplified */}
    <path
      d="M65 12 L80 12 M65 20 L80 20 M65 28 L80 28 M65 12 L65 28"
      stroke="hsl(var(--foreground))" // Use foreground color
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export default PowerPingLogo;
