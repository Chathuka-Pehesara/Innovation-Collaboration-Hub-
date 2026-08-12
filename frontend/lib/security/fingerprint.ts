/**
 * Zero-dependency robust browser fingerprint generator.
 * Combines screen resolution, language, time zone offset, hardware concurrency, 
 * and a canvas rendering footprint into a consistent identifier.
 */
export const getFingerprint = async (): Promise<string> => {
  if (typeof window === 'undefined') {
    return 'ssr-environment';
  }

  try {
    const data: string[] = [];

    // 1. User Agent and language
    data.push(navigator.userAgent || '');
    data.push(navigator.language || '');

    // 2. Screen details
    data.push(`${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`);

    // 3. Timezone
    data.push(new Date().getTimezoneOffset().toString());

    // 4. Hardware concurrency (CPU cores)
    if (navigator.hardwareConcurrency) {
      data.push(navigator.hardwareConcurrency.toString());
    }

    // 5. Canvas Fingerprint
    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.textBaseline = 'top';
        ctx.font = "14px 'Arial'";
        ctx.fillStyle = '#f60';
        ctx.fillRect(125, 1, 62, 20);
        ctx.fillStyle = '#069';
        ctx.fillText('InnovationHubFingerprint,123!', 2, 15);
        ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
        ctx.fillText('InnovationHubFingerprint,123!', 4, 17);

        // Export to data URL
        data.push(canvas.toDataURL());
      }
    } catch (canvasErr) {
      // Ignored
    }

    // 6. Generate fingerprint string
    const combinedString = data.join('|||');
    return hashString(combinedString);
  } catch (error) {
    console.error('[FINGERPRINT] Failed to compute custom fingerprint:', error);
    return 'fallback-fingerprint-' + Math.random().toString(36).substring(2, 10);
  }
};

/**
 * A fast, simple hashing function (DJB2/MurmurHash style) returning a clean hex-like string.
 */
function hashString(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }

  // Convert to positive hex representation
  const hex = Math.abs(hash).toString(16).padStart(8, '0');

  // Pad/augment string to ensure consistent format (similar length to UUID/visitorID)
  let secondaryHash = 0;
  for (let i = str.length - 1; i >= 0; i--) {
    const char = str.charCodeAt(i);
    secondaryHash = (secondaryHash << 5) - secondaryHash + char;
    secondaryHash |= 0;
  }
  const hexSecondary = Math.abs(secondaryHash).toString(16).padStart(8, '0');

  return `fp_${hex}${hexSecondary}`;
}
