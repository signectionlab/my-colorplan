<div class="mesh" aria-hidden="true">
  <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
    <defs>
      <filter id="mesh-blur" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="70" />
      </filter>
      <linearGradient id="mesh-fade" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0.42" stop-color="#ffffff" stop-opacity="0" />
        <stop offset="1" stop-color="#ffffff" stop-opacity="1" />
      </linearGradient>
    </defs>
    <rect width="1440" height="900" fill="#f6f9fc" />
    <g filter="url(#mesh-blur)">
      <ellipse cx="160" cy="250" rx="460" ry="300" fill="#f5e9d4" />
      <ellipse cx="430" cy="180" rx="340" ry="240" fill="#9b6829" opacity="0.55" />
      <ellipse cx="760" cy="240" rx="420" ry="300" fill="#b9b9f9" />
      <ellipse cx="1040" cy="180" rx="380" ry="280" fill="#665efd" opacity="0.9" />
      <ellipse cx="1260" cy="300" rx="360" ry="260" fill="#533afd" />
      <ellipse cx="1180" cy="460" rx="280" ry="200" fill="#ea2261" opacity="0.8" />
      <ellipse cx="900" cy="120" rx="220" ry="160" fill="#f96bee" opacity="0.75" />
    </g>
    <rect width="1440" height="900" fill="url(#mesh-fade)" />
  </svg>
</div>

<style>
  .mesh {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  svg {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
