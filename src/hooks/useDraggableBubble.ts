
import { useState, useRef, useEffect } from 'react';

export interface BubblePositions {
  [key: string]: { x: number; y: number }
}

export function useDraggableBubble(initialPositions: BubblePositions) {
  const [positions, setPositions] = useState<BubblePositions>(initialPositions);
  const draggingRef = useRef<string | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  const handlePositionChange = (
    bubble: keyof typeof positions,
    axis: 'x' | 'y',
    value: string
  ) => {
    const numValue = Number(value)
    if (!isNaN(numValue)) {
      setPositions(prev => ({
        ...prev,
        [bubble]: {
          ...prev[bubble],
          [axis]: axis === 'x' ? Math.min(10, Math.max(0, numValue)) : Math.min(1, Math.max(0, numValue))
        }
      }))
    }
  }

  const getPositionFromEvent = (event: React.MouseEvent | MouseEvent) => {
    if (!chartRef.current) return null;
    const rect = chartRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 10;
    const y = 1 - ((event.clientY - rect.top) / rect.height);
    return { x: Math.min(10, Math.max(0, x)), y: Math.min(1, Math.max(0, y)) };
  }

  const handleMouseDown = (event: React.MouseEvent, bubbleName: string) => {
    if (!bubbleName.includes('Current') && !bubbleName.includes('AI\nRegion')) {
      // Convert name to camelCase for state key matching
      const normalizedName = bubbleName
        .split(' ')
        .map((part, index) => {
          if (index === 0 && part.toLowerCase() === 'ai') {
            return 'ai';
          }
          return index === 0 ? part.toLowerCase() : part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
        })
        .join('');
      
      draggingRef.current = normalizedName;
      event.preventDefault();
    }
  };

  const handleMouseMove = (event: MouseEvent) => {
    if (draggingRef.current) {
      const pos = getPositionFromEvent(event);
      if (pos) {
        setPositions(prev => ({
          ...prev,
          [draggingRef.current!]: pos
        }));
      }
    }
  };

  const handleMouseUp = () => {
    draggingRef.current = null;
  };

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return {
    positions,
    chartRef,
    handlePositionChange,
    handleMouseDown
  };
}
