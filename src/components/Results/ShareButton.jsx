import { useState } from 'react';
import { trackEvent } from '../../analytics.js';

export function ShareButton({ onExport, sessionId }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/results?session=${sessionId}`;

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: 'My Pokémon Arena Results', url: shareUrl });
        trackEvent('share', { method: 'native_share' });
      } catch {
        // User cancelled native share
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
        trackEvent('share', { method: 'clipboard' });
      } catch {
        prompt('Copy this link:', shareUrl);
      }
    }
  }

  function handleExport() {
    onExport?.();
    trackEvent('share', { method: 'image_export' });
  }

  return (
    <div className="share-buttons">
      <button className="btn btn--primary" onClick={handleShare}>
        {copied ? 'Link Copied!' : 'Share Results'}
      </button>
      <button className="btn btn--secondary" onClick={handleExport}>
        Save as Image
      </button>
    </div>
  );
}
