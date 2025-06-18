import type { SVGProps } from 'react';

export function WebWeaverLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 200 50"
      width="120"
      height="30"
      aria-label="Web Weaver Logo"
      {...props}
    >
      <defs>
        <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style={{ stopColor: 'hsl(var(--primary))', stopOpacity: 1 }} />
          <stop offset="100%" style={{ stopColor: 'hsl(var(--accent))', stopOpacity: 1 }} />
        </linearGradient>
      </defs>
      <text
        x="50%"
        y="50%"
        fontFamily="Inter, sans-serif"
        fontSize="30"
        fontWeight="bold"
        fill="url(#logoGradient)"
        dominantBaseline="middle"
        textAnchor="middle"
        className="font-headline"
      >
        Web Weaver
      </text>
    </svg>
  );
}
