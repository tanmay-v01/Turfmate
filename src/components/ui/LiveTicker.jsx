export default function LiveTicker({ items }) {
  const doubled = [...items, ...items];

  return (
    <div className="tm-live-ticker" role="region" aria-label="Live updates">
      <div className="tm-live-ticker__label">
        <span className="tm-live-ticker__pulse" aria-hidden>
          <span className="tm-live-ticker__ping" />
          <span className="tm-live-ticker__dot" />
        </span>
        <span>live</span>
      </div>

      <div className="tm-live-ticker__track">
        <div className="tm-live-ticker__fade tm-live-ticker__fade--left" aria-hidden />
        <div className="tm-live-ticker__fade tm-live-ticker__fade--right" aria-hidden />
        <div className="tm-marquee tm-live-ticker__marquee">
          {doubled.map((item, i) => (
            <span key={`${item}-${i}`} className="tm-live-ticker__item">
              <span className="tm-live-ticker__item-dot" aria-hidden />
              {item}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
