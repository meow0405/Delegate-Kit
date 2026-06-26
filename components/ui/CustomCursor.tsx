"use client";

import { useEffect, useRef } from "react";

const interactiveSelector = "a, button, input, textarea, select, [role='button']";

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!finePointer.matches) return;

    let ringX = 0;
    let ringY = 0;
    let targetX = 0;
    let targetY = 0;
    let frame = 0;

    function animate() {
      ringX += (targetX - ringX) * 0.18;
      ringY += (targetY - ringY) * 0.18;
      ringRef.current?.style.setProperty("--cursor-x", `${ringX}px`);
      ringRef.current?.style.setProperty("--cursor-y", `${ringY}px`);
      frame = window.requestAnimationFrame(animate);
    }

    function handleMove(event: MouseEvent) {
      targetX = event.clientX;
      targetY = event.clientY;
      cursorRef.current?.style.setProperty("--cursor-x", `${targetX}px`);
      cursorRef.current?.style.setProperty("--cursor-y", `${targetY}px`);

      const target = event.target instanceof Element ? event.target : null;
      const interactive = Boolean(target?.closest(interactiveSelector));
      document.documentElement.dataset.cursor = interactive ? "interactive" : "default";
      document.documentElement.dataset.cursorVisible = "true";
    }

    function handleLeave() {
      document.documentElement.dataset.cursorVisible = "false";
    }

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseleave", handleLeave);
    frame = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseleave", handleLeave);
      window.cancelAnimationFrame(frame);
      delete document.documentElement.dataset.cursor;
      delete document.documentElement.dataset.cursorVisible;
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
      <div ref={cursorRef} className="custom-cursor-mark" aria-hidden="true">
        <span />
      </div>
    </>
  );
}
