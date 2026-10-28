"use client";

import { useEffect } from "react";

export default function HomeSmoothScroll() {
  useEffect(() => {
    const root = document.documentElement;
    const originalScrollBehavior = root.style.scrollBehavior;
    const scrollKeys = new Set([
      "ArrowDown",
      "ArrowUp",
      "PageDown",
      "PageUp",
      "Home",
      "End",
      " ",
    ]);

    let animationFrame: number | null = null;
    let targetScrollTop = window.scrollY;
    let hasOverriddenScrollBehavior = false;

    function restoreScrollBehavior() {
      if (!hasOverriddenScrollBehavior) return;
      root.style.scrollBehavior = originalScrollBehavior;
      hasOverriddenScrollBehavior = false;
    }

    function cancelScrollAnimation() {
      if (animationFrame !== null) {
        window.cancelAnimationFrame(animationFrame);
        animationFrame = null;
      }
      restoreScrollBehavior();
    }

    function hasNativeScrollAncestor(target: EventTarget | null) {
      if (!(target instanceof Element)) return false;

      if (
        target.closest(
          "input, textarea, select, [contenteditable='true'], [role='slider'], [data-native-wheel-scroll]"
        )
      ) {
        return true;
      }

      let current: HTMLElement | null =
        target instanceof HTMLElement ? target : target.parentElement;

      while (
        current &&
        current !== document.body &&
        current !== document.documentElement
      ) {
        const overflowY = window.getComputedStyle(current).overflowY;
        const isScrollable =
          (overflowY === "auto" ||
            overflowY === "scroll" ||
            overflowY === "overlay") &&
          current.scrollHeight > current.clientHeight + 1;

        if (isScrollable) return true;
        current = current.parentElement;
      }

      return false;
    }

    function animateScroll() {
      const maxScrollTop = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );
      targetScrollTop = Math.max(0, Math.min(maxScrollTop, targetScrollTop));
      const difference = targetScrollTop - window.scrollY;

      if (Math.abs(difference) < 0.8) {
        window.scrollTo({ top: targetScrollTop, behavior: "auto" });
        animationFrame = null;
        restoreScrollBehavior();
        return;
      }

      window.scrollTo({
        top: window.scrollY + difference * 0.22,
        behavior: "auto",
      });
      animationFrame = window.requestAnimationFrame(animateScroll);
    }

    function handleWheel(event: WheelEvent) {
      if (
        event.defaultPrevented ||
        event.ctrlKey ||
        event.shiftKey ||
        event.deltaY === 0 ||
        Math.abs(event.deltaX) > Math.abs(event.deltaY)
      ) {
        return;
      }

      if (
        window.matchMedia("(prefers-reduced-motion: reduce)").matches ||
        document.body.style.overflow === "hidden"
      ) {
        cancelScrollAnimation();
        return;
      }

      // Leave popup lists, form fields and other nested scroll regions to the browser.
      if (hasNativeScrollAncestor(event.target)) return;

      const multiplier =
        event.deltaMode === 1
          ? 16
          : event.deltaMode === 2
            ? window.innerHeight
            : 1;
      const delta = event.deltaY * multiplier;
      if (!Number.isFinite(delta)) return;

      const maxScrollTop = Math.max(
        0,
        document.documentElement.scrollHeight - window.innerHeight
      );

      if (animationFrame === null) targetScrollTop = window.scrollY;
      const nextTarget = Math.max(
        0,
        Math.min(maxScrollTop, targetScrollTop + delta)
      );
      if (nextTarget === targetScrollTop) return;

      event.preventDefault();
      targetScrollTop = nextTarget;

      if (!hasOverriddenScrollBehavior) {
        root.style.scrollBehavior = "auto";
        hasOverriddenScrollBehavior = true;
      }

      if (animationFrame === null) {
        animationFrame = window.requestAnimationFrame(animateScroll);
      }
    }

    function handleScrollKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || !scrollKeys.has(event.key)) return;
      if (
        event.target instanceof Element &&
        event.target.closest(
          "input, textarea, select, [contenteditable='true']"
        )
      ) {
        return;
      }
      cancelScrollAnimation();
    }

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleScrollKeyDown, true);
    window.addEventListener("touchstart", cancelScrollAnimation, {
      passive: true,
    });

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleScrollKeyDown, true);
      window.removeEventListener("touchstart", cancelScrollAnimation);
      cancelScrollAnimation();
    };
  }, []);

  return null;
}
