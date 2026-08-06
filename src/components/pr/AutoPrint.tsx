'use client';

import { useEffect } from 'react';

export default function AutoPrint() {
  useEffect(() => {
    let fired = false;
    const triggerPrint = () => {
      if (fired) return;
      fired = true;
      window.print();
    };

    // Fire once the page (images, fonts, etc.) is fully loaded — like window.onload.
    if (document.readyState === 'complete') {
      triggerPrint();
    } else {
      window.addEventListener('load', triggerPrint);
    }

    // Safety net in case the load event fired before hydration completed.
    const timer = window.setTimeout(triggerPrint, 750);

    return () => {
      window.removeEventListener('load', triggerPrint);
      window.clearTimeout(timer);
    };
  }, []);

  return null;
}
