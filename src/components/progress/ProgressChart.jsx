import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';
import {
  CategoryScale,
  Chart,
  Filler,
  LineController,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';

// register only what we use (keeps the bundle smaller than importing everything)
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, Filler, Tooltip);

const cssVar = (name) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

/**
 * Chart.js line chart wrapped in a React component.
 * useRef holds the <canvas> and the Chart instance; the effect creates the
 * chart and its cleanup destroys it, so re-renders never leak canvases.
 */
export default function ProgressChart({ points }) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const TICK = { font: { family: 'Space Mono', size: 10 }, color: cssVar('--chalk-dim') };
    const chart = new Chart(canvasRef.current, {
      type: 'line',
      data: {
        labels: points.map((p) => p.date.slice(5)),
        datasets: [
          {
            label: 'Top Set (kg)',
            data: points.map((p) => p.topWeight),
            borderColor: cssVar('--iron'),
            backgroundColor: 'rgba(232,89,12,0.15)',
            borderWidth: 2.5,
            pointRadius: 4,
            pointBackgroundColor: cssVar('--plate-2'),
            tension: 0.25,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: { grid: { display: false }, ticks: TICK },
          y: { grid: { color: cssVar('--line') }, ticks: TICK },
        },
      },
    });
    return () => chart.destroy();
  }, [points, theme]);

  return (
    <div className="chart-wrap">
      <canvas ref={canvasRef} height="260" role="img" aria-label="Top set weight over time" />
    </div>
  );
}
