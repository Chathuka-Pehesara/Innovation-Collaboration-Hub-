'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, animate } from 'framer-motion';

interface CounterProps {
  value: number | string;
  duration?: number;
}

export default function Counter({ value, duration = 1.5 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const [displayValue, setDisplayValue] = useState('0');
  
  // Correctly define hooks at the top-level of the component
  const count = useMotionValue(0);

  useEffect(() => {
    // If the element is not in view yet, keep it at default
    if (!inView) {
      const numericStr = String(value).replace(/[^0-9.-]/g, '');
      const numericVal = parseFloat(numericStr);
      if (!isNaN(numericVal)) {
        setDisplayValue('0');
      } else {
        setDisplayValue(String(value));
      }
      return;
    }

    // Extract digits and floating points
    const numericStr = String(value).replace(/[^0-9]/g, '');
    const numericVal = parseInt(numericStr, 10);
    
    if (isNaN(numericVal)) {
      setDisplayValue(String(value));
      return;
    }

    // Reset starting motion value to zero
    count.set(0);

    const unsubscribe = count.on('change', (latest) => {
      const rounded = Math.round(latest);
      // Reassemble original text around the number
      const regex = new RegExp(String(numericVal), 'g');
      const formatted = String(value).replace(regex, String(rounded));
      setDisplayValue(formatted);
    });

    const controls = animate(count, numericVal, {
      duration: duration,
      ease: [0.16, 1, 0.3, 1], // Custom premium ease-out
    });

    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [value, inView, duration, count]);

  return <span ref={ref}>{displayValue}</span>;
}
