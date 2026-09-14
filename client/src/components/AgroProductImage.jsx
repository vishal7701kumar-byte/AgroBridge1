import React, { useState } from 'react';

// Crisp, verified category fallback imagery
export const FALLBACK_CATEGORY_IMAGES = {
  Vegetables: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=600&auto=format&fit=crop&q=80',
  Fruits: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&auto=format&fit=crop&q=80',
  Grains: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&auto=format&fit=crop&q=80',
  Pulses: 'https://images.unsplash.com/photo-1585996746979-3d0773d4ee71?w=600&auto=format&fit=crop&q=80',
  Dairy: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&auto=format&fit=crop&q=80',
  Seasonal: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=600&auto=format&fit=crop&q=80',
  Spices: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=600&auto=format&fit=crop&q=80',
  Organic: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?w=600&auto=format&fit=crop&q=80'
};

export const DEFAULT_FOOD_IMAGE = 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=80';

/**
 * Validates if a given string represents a valid image URI (HTTP, data-URI, or local path)
 */
export function isValidImageUrl(str) {
  if (!str || typeof str !== 'string') return false;
  const s = str.trim();
  if (s.length < 5) return false;
  if (s === 'undefined' || s === 'null') return false;
  // Exclude raw emoji placeholders
  if (/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u.test(s)) return false;
  return (
    s.startsWith('http://') ||
    s.startsWith('https://') ||
    s.startsWith('data:image/') ||
    s.startsWith('/uploads/') ||
    s.startsWith('uploads/') ||
    s.startsWith('/assets/') ||
    s.startsWith('blob:')
  );
}

/**
 * Extracts the best primary display image URL for any product object.
 * Priority:
 * 1. Primary image in images[] array
 * 2. First valid image in images[] array
 * 3. product.image property
 * 4. product.image_url property
 * 5. Category fallback image
 */
export function getProductImage(product) {
  if (!product) return DEFAULT_FOOD_IMAGE;

  // 1. Check images array
  if (Array.isArray(product.images) && product.images.length > 0) {
    const primary = product.images.find(img => img && (img.isPrimary === true || img.is_primary === true));
    if (primary) {
      const url = typeof primary === 'string' ? primary : primary.url;
      if (isValidImageUrl(url)) return url.trim();
    }
    for (const item of product.images) {
      const u = typeof item === 'string' ? item : item?.url;
      if (isValidImageUrl(u)) return u.trim();
    }
  }

  // 2. Check direct image or image_url fields
  if (isValidImageUrl(product.image)) {
    return product.image.trim();
  }
  if (isValidImageUrl(product.image_url)) {
    return product.image_url.trim();
  }

  // 3. Fallback to category or default
  const category = product.category || 'Vegetables';
  return FALLBACK_CATEGORY_IMAGES[category] || DEFAULT_FOOD_IMAGE;
}

export default function AgroProductImage({
  src,
  alt = 'Farm Produce',
  category = 'Vegetables',
  className = 'w-full h-full object-cover',
  aspectRatio = 'aspect-square',
  containerClassName = ''
}) {
  const [loading, setLoading] = useState(true);
  const [errorCount, setErrorCount] = useState(0);

  // Fallback chain determination
  const primaryCategory = category || 'Vegetables';
  const fallbackUrl = FALLBACK_CATEGORY_IMAGES[primaryCategory] || DEFAULT_FOOD_IMAGE;

  let currentSrc = fallbackUrl;
  if (errorCount === 0 && isValidImageUrl(src)) {
    currentSrc = src;
  } else if (errorCount === 1) {
    currentSrc = fallbackUrl;
  } else {
    currentSrc = DEFAULT_FOOD_IMAGE;
  }

  const handleError = () => {
    setErrorCount(prev => prev + 1);
  };

  return (
    <div className={`relative overflow-hidden bg-slate-900 ${aspectRatio ? aspectRatio : ''} ${containerClassName}`}>
      {/* Loading Skeleton */}
      {loading && (
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-pulse flex items-center justify-center pointer-events-none">
          <span className="text-base opacity-40">🌱</span>
        </div>
      )}

      {/* Product Image */}
      <img
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        onLoad={() => setLoading(false)}
        onError={handleError}
        className={`${className} transition-opacity duration-300 ${loading ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
}
