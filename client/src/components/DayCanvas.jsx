import { useRef, useEffect } from 'react';

// A small <canvas> that paints one dot per scheduled event, colored by type.
// This is the second "web media" type alongside the SVG image.

const TYPE_COLORS = {
  musical: '#e8633f',
  live: '#d99a2b',
  cast: '#6a4ea0',
  character: '#0f5e57',
  parade: '#0a3f3a',
  dining: '#9c5a2c'
};

export default function DayCanvas({ events }) {
  const ref = useRef(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    // Match the canvas's internal resolution to its display size for sharpness.
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Warm background wash.
    ctx.fillStyle = '#fbf6ec';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const count = events.length;
    if (count === 0) return;

    const gap = canvas.width / (count + 1);
    const midY = canvas.height / 2;

    // Connecting line.
    ctx.strokeStyle = '#d9cdb6';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(gap, midY);
    ctx.lineTo(gap * count, midY);
    ctx.stroke();

    // One dot per event.
    events.forEach((e, i) => {
      const x = gap * (i + 1);
      ctx.beginPath();
      ctx.fillStyle = TYPE_COLORS[e.type] || '#0f5e57';
      ctx.arc(x, midY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#20302f';
      ctx.stroke();
    });
  }, [events]);

  return <canvas ref={ref} className="day-canvas" aria-label="Timeline of the day's events colored by type" />;
}
