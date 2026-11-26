"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopProgressBar() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // When pathname changes, complete progress quickly
    setProgress(100);
    const hideTimeout = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 250);

    return () => clearTimeout(hideTimeout);
  }, [pathname]);

  useEffect(() => {
    // Intercept clicks on links to show instant 0ms visual feedback
    const handleLinkClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Ignore external, anchor links, or download links
      if (
        href.startsWith("http") ||
        href.startsWith("#") ||
        href.startsWith("mailto:") ||
        href.startsWith("tel:") ||
        target.hasAttribute("download") ||
        target.target === "_blank"
      ) {
        return;
      }

      // If it's the exact same page, do not animate
      if (href === window.location.pathname) return;

      setVisible(true);
      setProgress(25);

      const t1 = setTimeout(() => setProgress(65), 100);
      const t2 = setTimeout(() => setProgress(85), 250);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    };

    document.addEventListener("click", handleLinkClick, { capture: true });
    return () => document.removeEventListener("click", handleLinkClick, { capture: true });
  }, []);

  if (!visible && progress === 0) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none h-[2.5px] overflow-hidden bg-transparent"
      aria-hidden="true"
    >
      <div
        className="h-full bg-gradient-to-r from-[#2C3A2F] via-[#B55A38] to-[#2C3A2F] transition-all duration-200 ease-out shadow-[0_0_8px_rgba(181,90,56,0.6)]"
        style={{
          width: `${progress}%`,
          opacity: visible ? 1 : 0,
        }}
      />
    </div>
  );
}
