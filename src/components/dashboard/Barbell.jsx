const SIZES = [46, 40, 34, 28];

/** The signature visual: plates fill up as you complete sets today. */
export default function Barbell({ filled, target }) {
  const perSide = Math.max(1, Math.ceil(target / 2));
  const filledPerSide = Math.ceil(filled / 2);
  const plates = Array.from({ length: perSide }, (_, i) => {
    const size = SIZES[Math.min(i, 3)];
    const isFilled = i < filledPerSide;
    return (
      <div
        key={i}
        className={`plate ${isFilled ? 'filled' : ''}`}
        style={{ width: size * 0.55, height: size }}
      >
        {isFilled ? '●' : ''}
      </div>
    );
  });

  return (
    <div className="barbell" role="img" aria-label={`${filled} of ${target} sets loaded today`}>
      <div className="collar" />
      <div className="plates left">{plates}</div>
      <div className="bar" />
      <div className="plates">{plates}</div>
      <div className="collar" />
    </div>
  );
}
