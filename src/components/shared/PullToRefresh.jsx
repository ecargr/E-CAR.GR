import React, { useState, useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

export default function PullToRefresh({ onRefresh, children, className = '' }) {
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const startY = useRef(0);
  const containerRef = useRef(null);
  const threshold = 80;

  const handleTouchStart = useCallback((e) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      startY.current = e.touches[0].clientY;
    }
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (containerRef.current && containerRef.current.scrollTop <= 0) {
      const distance = e.touches[0].clientY - startY.current;
      if (distance > 0 && distance < 150) {
        setPullDistance(distance);
      }
    }
  }, []);

  const handleTouchEnd = useCallback(async () => {
    if (pullDistance >= threshold && !refreshing) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, refreshing, onRefresh]);

  return (
    <div
      ref={containerRef}
      className={`relative overflow-y-auto h-full ${className}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="absolute top-0 left-0 right-0 flex justify-center transition-transform duration-200 z-10 pointer-events-none"
        style={{
          transform: `translateY(${Math.min(pullDistance, 100) - 50}px)`,
          opacity: Math.min(pullDistance / threshold, 1)
        }}
      >
        <div className={`w-8 h-8 rounded-full bg-card border border-border flex items-center justify-center shadow-md ${refreshing ? 'animate-spin' : ''}`}>
          <RefreshCw className="w-4 h-4 text-primary" />
        </div>
      </div>
      {children}
    </div>
  );
}