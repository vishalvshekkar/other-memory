/** Signal-strength bars showing significance level (1–5) */
export function SignalBars({ level }: { level: number }) {
  const maxBars = 5;
  const barWidth = 3;
  const gap = 1.5;
  const minH = 4;
  const stepH = 2.5;
  const totalHeight = minH + (maxBars - 1) * stepH;

  return (
    <svg
      width={maxBars * (barWidth + gap) - gap}
      height={totalHeight}
      className="shrink-0"
    >
      {Array.from({ length: maxBars }, (_, i) => {
        const barH = minH + i * stepH;
        return (
          <rect
            key={i}
            x={i * (barWidth + gap)}
            y={totalHeight - barH}
            width={barWidth}
            height={barH}
            rx={0.5}
            fill={i < level ? "#c4841d" : "rgba(196,132,29,0.2)"}
          />
        );
      })}
    </svg>
  );
}
