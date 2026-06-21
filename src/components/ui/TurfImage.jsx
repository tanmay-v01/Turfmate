import { useState, useEffect } from 'react';
import { IMAGES } from '../../data/images';

const FALLBACK = IMAGES.pitch;

/** Resolve best available image URL for a turf record */
export function turfImageUrl(turf, fallback = FALLBACK) {
  if (!turf) return fallback;
  const url = turf.image || turf.gallery?.[0] || turf.turfImage;
  if (!url || typeof url !== 'string') return fallback;
  return url;
}

export default function TurfImage({ turf, src, fallback = FALLBACK, alt = '', className = '', ...props }) {
  const resolved = src || turfImageUrl(turf, fallback);
  const [current, setCurrent] = useState(resolved);

  useEffect(() => {
    setCurrent(src || turfImageUrl(turf, fallback));
  }, [src, turf?.id, turf?.image, fallback]);

  return (
    <img
      {...props}
      src={current}
      alt={alt || turf?.name || 'Turf'}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => {
        if (current !== fallback) setCurrent(fallback);
      }}
    />
  );
}
