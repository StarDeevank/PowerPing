
import type { SVGProps } from 'react';

const PowerPingLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 120 120" // Using a 120x120 viewBox for detail
    fill="none"
    {...props}
  >
    <title>PowerPing Logo</title>
    
    {/* Outer Ticks - Stylized representation */}
    <g id="ticks" stroke="hsl(var(--foreground))" strokeWidth="0.75">
      {Array.from({ length: 12 }).map((_, i) => ( // 12 Major ticks
        <line
          key={`major-tick-${i}`}
          x1="60"
          y1="5"
          x2="60"
          y2="15"
          transform={`rotate(${i * 30}, 60, 60)`}
        />
      ))}
      {Array.from({ length: 12 }).map((_, i) => ( // 12 Secondary ticks (longer than minor)
        <line
          key={`secondary-tick-${i}`}
          x1="60"
          y1="7"
          x2="60"
          y2="13"
          transform={`rotate(${i * 30 + 15}, 60, 60)`}
        />
      ))}
      {Array.from({ length: 24 }).map((_, i) => ( // 24 Minor ticks
         <line
          key={`minor-tick-${i}`}
          x1="60"
          y1="9"
          x2="60"
          y2="12"
          transform={`rotate(${i * 15 + 7.5}, 60, 60)`}
          strokeWidth="0.5"
        />
      ))}
    </g>

    {/* Gauge background area (dark circle behind segments) */}
    <circle cx="60" cy="60" r="46" fill="hsl(var(--background))" />


    {/* Gauge Segments - angles are clockwise from +X axis (right) */}
    {/* Segment 1 (darkest gray): 150deg to 110deg */}
    <path
      d="M 26.02885204 82.5 A 45 45 0 0 1 60 15 A 45 45 0 0 1 93.97114796 82.5 L 87.61940297 79.16666666 A 35 35 0 0 0 60 25 A 35 35 0 0 0 32.38059703 79.16666666 Z"
      fill="hsl(var(--secondary))"
      transform="rotate(-120 60 60)" // Positions the base of the arc segments correctly
    />
     {/* Segment 2 (medium gray): 110deg to 70deg */}
    <path
      d="M 26.02885204 82.5 A 45 45 0 0 1 60 15 A 45 45 0 0 1 93.97114796 82.5 L 87.61940297 79.16666666 A 35 35 0 0 0 60 25 A 35 35 0 0 0 32.38059703 79.16666666 Z"
      fill="hsl(var(--muted-foreground))"
      transform="rotate(-80 60 60)"
    />
    {/* Segment 3 (lightest gray): 70deg to 30deg */}
     <path
      d="M 26.02885204 82.5 A 45 45 0 0 1 60 15 A 45 45 0 0 1 93.97114796 82.5 L 87.61940297 79.16666666 A 35 35 0 0 0 60 25 A 35 35 0 0 0 32.38059703 79.16666666 Z"
      fill="hsl(var(--primary))"
      transform="rotate(-40 60 60)"
    />

    {/* Gauge Border Arc - Semi-circle outline */}
     <path
      d="M 22.5 60 A 37.5 37.5 0 0 1 97.5 60" // Adjusted for open bottom
      stroke="hsl(var(--foreground))"
      strokeWidth="2"
      fill="none"
    />
    
    {/* "100" Text */}
    <text
      x="60"
      y="78" // Positioned below the gauge segments
      textAnchor="middle"
      fontSize="14"
      fontWeight="bold"
      fill="hsl(var(--foreground))"
    >
      100
    </text>

    {/* Needle */}
    <g id="needle">
      {/* Pivot point of the needle */}
      <circle cx="60" cy="60" r="4" fill="hsl(var(--background))" stroke="hsl(var(--foreground))" strokeWidth="1"/>
      {/* Needle pointer - pointing towards approx 45 degrees (up-right) */}
      <polygon
        points="60,60 58,23 62,23" // Base at pivot, two points form the tip
        fill="hsl(var(--foreground))"
        transform="rotate(45 60 60)" // Rotate needle to desired position
      />
    </g>

    {/* Lightning Bolt (centered below the needle pivot and "100" text) */}
    <path
      d="M 60 83 L 55 93 L 61 93 L 56 103 L 67 90 L 61 90 Z" // Adjusted coordinates for new viewbox
      fill="hsl(var(--foreground))"
    />
  </svg>
);

export default PowerPingLogo;
