'use client';

import { memo } from 'react';
import { getBezierPath, type EdgeProps } from 'reactflow';
import { motion } from 'framer-motion';

interface AnimatedEdgeData {
  active?: boolean;
  reducedMotion?: boolean;
}

const PARTICLE_DELAYS = [0, 0.8, 1.6];
const PARTICLE_DURATION = 2.5;

function AnimatedEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}: EdgeProps<AnimatedEdgeData>) {
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isActive = data?.active ?? false;
  const reducedMotion = data?.reducedMotion ?? false;

  return (
    <>
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={isActive ? '#D1D5DB' : '#F3F4F6'}
        strokeWidth={2}
        opacity={isActive ? 1 : 0.5}
      />

      {isActive && !reducedMotion &&
        PARTICLE_DELAYS.map((delay, i) => (
          <motion.circle
            key={`${id}-p${i}`}
            r={3}
            fill="#3B82F6"
            aria-hidden="true"
            initial={{ offsetDistance: '0%', opacity: 0 }}
            animate={{
              offsetDistance: '100%',
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              duration: PARTICLE_DURATION,
              repeat: Infinity,
              ease: 'linear',
              delay,
            }}
            style={{ offsetPath: `path('${edgePath}')` }}
          />
        ))}
    </>
  );
}

export const AnimatedEdge = memo(AnimatedEdgeComponent);
