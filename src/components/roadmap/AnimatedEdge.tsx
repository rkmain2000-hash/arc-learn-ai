import { BaseEdge, EdgeProps, getSmoothStepPath } from "@xyflow/react";

const AnimatedEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
}: EdgeProps) => {
  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <defs>
        <linearGradient id={`gradient-${id}`} gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="hsl(263 70% 60%)" />
          <stop offset="50%" stopColor="hsl(195 100% 50%)" />
          <stop offset="100%" stopColor="hsl(280 80% 65%)" />
        </linearGradient>
        
        <animate
          attributeName="offset"
          values="0;1;0"
          dur="3s"
          repeatCount="indefinite"
        />
      </defs>
      
      {/* Background path for glow effect */}
      <path
        d={edgePath}
        fill="none"
        stroke={`url(#gradient-${id})`}
        strokeWidth={4}
        opacity={0.3}
        className="animate-pulse"
      />
      
      {/* Main animated path */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: `url(#gradient-${id})`,
          strokeWidth: 2,
        }}
      />
      
      {/* Flowing particles effect */}
      <circle r="3" fill="hsl(195 100% 50%)">
        <animateMotion dur="3s" repeatCount="indefinite" path={edgePath} />
        <animate
          attributeName="opacity"
          values="0;1;1;0"
          dur="3s"
          repeatCount="indefinite"
        />
      </circle>
    </>
  );
};

export default AnimatedEdge;