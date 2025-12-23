// src/journey/StepScrollController.jsx
import { useScroll } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import React, {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";

const clamp = (v, min, max) => Math.max(min, Math.min(max, v));

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/**
 * Step-based scrolling with waypoints:
 * - We *do not* rely on single wheel events (trackpads spam tiny deltas).
 * - We collect deltas over a short window ("gesture"), then commit ONE step.
 * - While animating, we can queue another step (so fast scrolls still feel responsive).
 */
const StepScrollController = forwardRef(function StepScrollController(
  {
    stageCount,

    // gesture settings
    gestureWindowMs = 120,     // how long we wait for wheel "burst" to end
    gestureThreshold = 60,     // accumulated delta required to commit a step
    maxQueuedSteps = 2,        // allow queuing extra steps while animating (0..N)

    // animation settings
    stepDurationMs = 520,      // waypoint animation duration
  },
  ref
) {
  const scroll = useScroll();

  const stateRef = useRef({
    stage: 0,

    // gesture accumulation
    accum: 0,
    gestureTimer: null,

    // animation
    animating: false,
    startTop: 0,
    targetTop: 0,
    startTime: 0,

    // queued intent while animating
    queuedDir: 0,         // -1 or +1
    queuedCount: 0,       // how many steps to execute after animation
  });

  const getMaxScrollTop = (el) => Math.max(1, el.scrollHeight - el.clientHeight);

  const stageToTop = (el, stageIndex) => {
    const maxScrollTop = getMaxScrollTop(el);
    const t = stageCount <= 1 ? 0 : stageIndex / (stageCount - 1);
    return t * maxScrollTop;
  };

  const topToStage = (el) => {
    const maxScrollTop = getMaxScrollTop(el);
    const t = clamp(el.scrollTop / maxScrollTop, 0, 1);
    return clamp(Math.round(t * (stageCount - 1)), 0, stageCount - 1);
  };

  const startAnimToStage = (targetStage) => {
    const el = scroll.el;
    if (!el) {return;}

    const s = stateRef.current;
    const next = clamp(targetStage, 0, stageCount - 1);

    // if already there, do nothing
    if (next === s.stage) {return;}

    s.animating = true;
    s.startTop = el.scrollTop;
    s.targetTop = stageToTop(el, next);
    s.startTime = performance.now();
    s.stage = next;
  };

  const commitGesture = () => {
    const el = scroll.el;
    if (!el) {return;}

    const s = stateRef.current;

    // If user resized / content changed, keep stage aligned
    s.stage = topToStage(el);

    const abs = Math.abs(s.accum);
    if (abs < gestureThreshold) {
      s.accum = 0;
      return;
    }

    const dir = s.accum > 0 ? 1 : -1;
    s.accum = 0;

    // If animating, queue intent
    if (s.animating) {
      if (s.queuedCount < maxQueuedSteps) {
        s.queuedDir = dir;
        s.queuedCount += 1;
      }
      return;
    }

    startAnimToStage(s.stage + dir);
  };

  // Expose next/prev for arrow buttons
  useImperativeHandle(ref, () => ({
    next() {
      const s = stateRef.current;
      if (s.animating) {
        if (s.queuedCount < maxQueuedSteps) {
          s.queuedDir = 1;
          s.queuedCount += 1;
        }
        return;
      }
      startAnimToStage(s.stage + 1);
    },
    prev() {
      const s = stateRef.current;
      if (s.animating) {
        if (s.queuedCount < maxQueuedSteps) {
          s.queuedDir = -1;
          s.queuedCount += 1;
        }
        return;
      }
      startAnimToStage(s.stage - 1);
    },
    getStage() {
      return stateRef.current.stage;
    },
  }));

  useEffect(() => {
    const el = scroll.el;
    if (!el) {return;}

    // Align to the nearest stage on mount
    const initial = topToStage(el);
    stateRef.current.stage = initial;
    el.scrollTop = stageToTop(el, initial);

    const onWheel = (e) => {
      const s = stateRef.current;

      // Always prevent default so we don't “free scroll” between waypoints.
      // We will animate to waypoints ourselves.
      e.preventDefault();

      // Accumulate trackpad/mouse wheel deltas into a "gesture"
      s.accum += e.deltaY;

      // Reset gesture timer
      if (s.gestureTimer) {clearTimeout(s.gestureTimer);}
      s.gestureTimer = setTimeout(() => {
        s.gestureTimer = null;
        commitGesture();
      }, gestureWindowMs);
    };

    // Must be passive:false for preventDefault to work
    el.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      el.removeEventListener("wheel", onWheel);
      const s = stateRef.current;
      if (s.gestureTimer) {clearTimeout(s.gestureTimer);}
      s.gestureTimer = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scroll, stageCount, gestureWindowMs, gestureThreshold, maxQueuedSteps]);

  useFrame(() => {
    const el = scroll.el;
    if (!el) {return;}

    const s = stateRef.current;
    if (!s.animating) {return;}

    const t = clamp((performance.now() - s.startTime) / stepDurationMs, 0, 1);
    const e = easeInOutCubic(t);

    el.scrollTop = s.startTop + (s.targetTop - s.startTop) * e;

    if (t >= 1) {
      el.scrollTop = s.targetTop;
      s.animating = false;

      // If user kept scrolling / clicking during animation, execute queued step(s)
      if (s.queuedCount > 0) {
        const dir = s.queuedDir || 1;
        s.queuedCount -= 1;
        if (s.queuedCount === 0) {s.queuedDir = 0;}

        startAnimToStage(s.stage + dir);
      }
    }
  });

  return null;
});

export default StepScrollController;
