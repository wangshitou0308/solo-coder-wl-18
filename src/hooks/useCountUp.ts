import { useState, useEffect, useRef } from 'react';

interface UseCountUpOptions {
  duration?: number;
  start?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
}

export function useCountUp(
  target: number,
  { duration = 800, start = 0, decimals = 0, prefix = '', suffix = '' }: UseCountUpOptions = {}
) {
  const [value, setValue] = useState(start);
  const startTimeRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);
  const previousTargetRef = useRef(start);

  useEffect(() => {
    if (target === previousTargetRef.current) return;

    const startValue = previousTargetRef.current;
    const endValue = target;
    const startTime = performance.now();
    startTimeRef.current = startTime;

    const step = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentValue = startValue + (endValue - startValue) * easeProgress;

      setValue(currentValue);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      } else {
        previousTargetRef.current = endValue;
      }
    };

    frameRef.current = requestAnimationFrame(step);

    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [target, duration]);

  const formatted = `${prefix}${value.toFixed(decimals)}${suffix}`;

  return { value, formatted };
}
