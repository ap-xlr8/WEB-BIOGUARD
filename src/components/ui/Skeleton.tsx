import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

export function Skeleton({ width, height, borderRadius, className = '', style }: SkeletonProps) {
  const customStyle: React.CSSProperties = {
    width: width !== undefined ? width : '100%',
    height: height !== undefined ? height : '1rem',
    borderRadius: borderRadius !== undefined ? borderRadius : '4px',
    ...style,
  };

  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={customStyle}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div style={{ padding: 20, background: 'var(--color-bg-card)', borderRadius: 8, border: '1px solid var(--color-border)' }}>
      <Skeleton width="40px" height="40px" borderRadius="8px" style={{ marginBottom: 12 }} />
      <Skeleton width="60%" height="1.8rem" style={{ marginBottom: 8 }} />
      <Skeleton width="40%" height="1rem" />
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <Skeleton key={i} height="1.5rem" style={{ flex: 1 }} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: 16 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height="1.2rem" style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}
