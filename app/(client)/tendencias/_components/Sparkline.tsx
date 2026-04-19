interface Props {
  data: number[];
  color: string;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  color,
  width = 140,
  height = 36,
  strokeWidth = 1.75,
}: Props) {
  if (data.length < 2) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }

  const min = Math.min(...data);
  const max = Math.max(...data);
  const span = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / span) * height;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  const d = `M ${points.join(' L ')}`;

  // Semi-transparent fill under the line
  const areaD = `${d} L ${width.toFixed(2)},${height} L 0,${height} Z`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      aria-hidden="true"
      style={{ display: 'block', overflow: 'visible' }}
    >
      <path d={areaD} fill={color} opacity={0.08} />
      <path
        d={d}
        fill="none"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );
}
