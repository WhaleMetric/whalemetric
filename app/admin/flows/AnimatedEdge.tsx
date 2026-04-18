'use client';

import { memo } from 'react';
import { getBezierPath, type EdgeProps } from 'reactflow';
import { motion } from 'framer-motion';

export interface AnimatedEdgeData {
  active:        boolean;
  reducedMotion: boolean;
}

const DELAYS = [0, 0.9, 1.8];

function AnimatedEdgeComponent(props: EdgeProps<AnimatedEdgeData>) {
  const {
    id, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data,
  } = props;

  const [edgePath] = getBezierPath({
    sourceX, sourceY, sourcePosition,
    targetX, targetY, targetPosition,
  });

  const active       = data?.active       ?? false;
  const reducedMotion = data?.reducedMotion ?? false;

  return (
    <>
      {/* Base path */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={active ? '#CBD5E1' : '#E5E7EB'}
        strokeWidth={active ? 2 : 1.5}
        opacity={active ? 1 : 0.4}
      />

      {/* Arrowhead */}
      {active && (
        <defs>
          <marker
            id={`arrow-${id}`}
            markerWidth="8"
            markerHeight="8"
            refX="6"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L8,3 z" fill="#94A3B8" />
          </marker>
        </defs>
      )}

      {/* Animated particles along the path */}
      {active && !reducedMotion && DELAYS.map((delay, i) => (
        <motion.circle
          key={`${id}-p${i}`}
          r={3.5}
          fill="#3B82F6"
          aria-hidden="true"
          initial={{ offsetDistance: '0%', opacity: 0 }}
          animate={{
            offsetDistance: ['0%', '100%'],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            ease: 'linear',
            delay,
          }}
          style={{
            offsetPath: `path('${edgePath}')`,
            offsetRotate: '0deg',
          }}
        />
      ))}
    </>
  );
}

export const AnimatedEdge = memo(AnimatedEdgeComponent);
