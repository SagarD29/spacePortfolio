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
 * - Wheel/trackpad deltas are accumulated into a short "gesture" window.
 * - When the gesture ends, we commit exactly ONE step (stage +/- 1),
 *   and animate scrollTop to that stage's waypoint.
 * - If the user keeps scrolling during animation, we queue steps (optional).
 */
const StepScrollController = forwardRef(function StepScrollController(
  {
    stageCount,
    gestureWindowMs = 120, // how long we wait for a wheel burst to end
    gestureThreshold = 45, // lower = easier to trigger a step
    maxQueuedSteps = 1, // allow 0..N queued steps during animation
    stepDurationMs = 420, // waypoint animation duration
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
    queuedDir: 0, // -1 or +1
    queuedCount: 0,
  });

  const getMaxScrollTop = (el) => Math.max(1, el.scrollHeight - el.clientHeight);

  const stageToTop = (el, stageIndex) => {
    const maxScrollTop = getMaxScrollTop(el);
    const t = stageCount <= 1 ? 0 : stageIndex / (stageCount - 1);
    return t * maxScrollTop;
  };

  const topToNearestStage = (el) => {
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

    // keep stage in sync in case layout changed
    s.stage = topToNearestStage(el);

    const abs = Math.abs(s.accum);
    if (abs < gestureThreshold) {
      s.accum = 0;
      return;
    }

    const dir = s.accum > 0 ? 1 : -1;
    s.accum = 0;

    // If animating, queue the step
    if (s.animating) {
      if (s.queuedCount < maxQueuedSteps) {
        s.queuedDir = dir;
        s.queuedCount += 1;
      }
      return;
    }

    startAnimToStage(s.stage + dir);
  };

  // Expose controls for arrows + keyboard
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
    goTo(stageIndex) {
      const s = stateRef.current;
      s.queuedCount = 0;
      s.queuedDir = 0;
      s.accum = 0;
      if (s.animating) {s.animating = false;}
      startAnimToStage(stageIndex);
    },
    getStage() {
      return stateRef.current.stage;
    },
  }));

  useEffect(() => {
    const el = scroll.el;
    if (!el) {return;}

    // align to nearest stage on mount
    const initial = topToNearestStage(el);
    stateRef.current.stage = initial;
    el.scrollTop = stageToTop(el, initial);

    const onWheel = (e) => {
      const s = stateRef.current;

      // We control scroll (waypoints), so prevent native free scroll
      e.preventDefault();

      // accumulate deltas into a "gesture"
      s.accum += e.deltaY;

      // reset gesture timer
      if (s.gestureTimer) {clearTimeout(s.gestureTimer);}
      s.gestureTimer = setTimeout(() => {
        s.gestureTimer = null;
        commitGesture();
      }, gestureWindowMs);
    };

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

      // run queued steps if any
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
