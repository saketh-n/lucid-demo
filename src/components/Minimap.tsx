import React from 'react';

interface MinimapProps {
  carPositions: { x: number; z: number; color: string }[];
  roadWidth: number;
  curbPositions: { left: number; right: number };
}

const Minimap: React.FC<MinimapProps> = ({ carPositions, roadWidth, curbPositions }) => {
  const scale = 20; // pixels per unit
  const height = 200;
  const width = 300;

  // Convert 3D coordinates to 2D minimap coordinates
  const toScreenX = (x: number) => (x + roadWidth/2) * scale + width/2;
  const toScreenY = (z: number) => height/2 - z * scale;

  // Calculate distances between cars and curbs
  const getDistances = (car: { x: number; z: number; color: string }) => {
    const curbDist = Math.abs(curbPositions.right - car.x).toFixed(2);
    
    // Find distances to other cars
    const otherCars = carPositions
      .filter(other => other.color !== car.color)
      .map(other => ({
        color: other.color,
        distance: Math.sqrt(Math.pow(car.x - other.x, 2) + Math.pow(car.z - other.z, 2)).toFixed(2)
      }));

    return {
      curbDist,
      otherCars
    };
  };

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      background: 'rgba(0, 0, 0, 0.8)',
      padding: '10px',
      borderRadius: '10px',
      color: 'white',
      fontFamily: 'monospace',
      width: width + 200 // Increased width further for longer text
    }}>
      <div style={{ marginBottom: '10px', fontSize: '14px', borderBottom: '1px solid #444' }}>
        AV Environment Monitor
      </div>
      <svg width={width + 200} height={height} style={{ border: '1px solid #444' }}>
        {/* Road */}
        <rect
          x={toScreenX(-roadWidth/2)}
          y={0}
          width={roadWidth * scale}
          height={height}
          fill="#444"
        />
        {/* Curbs */}
        <line
          x1={toScreenX(curbPositions.left)}
          y1={0}
          x2={toScreenX(curbPositions.left)}
          y2={height}
          stroke="#808080"
          strokeWidth="3"
        />
        <line
          x1={toScreenX(curbPositions.right)}
          y1={0}
          x2={toScreenX(curbPositions.right)}
          y2={height}
          stroke="#808080"
          strokeWidth="3"
        />
        {/* Cars */}
        {carPositions.map((car, i) => {
          const distances = getDistances(car);
          return (
            <g key={i}>
              <rect
                x={toScreenX(car.x) - 10}
                y={toScreenY(car.z) - 20}
                width={20}
                height={40}
                fill={car.color}
              />
              {/* Distance labels with background for better readability */}
              <rect
                x={toScreenX(car.x) + 15}
                y={toScreenY(car.z) - 20}
                width={180}
                height={12 + (distances.otherCars.length * 12)}
                fill="rgba(0, 0, 0, 0.5)"
                rx={3}
              />
              <text
                x={toScreenX(car.x) + 20}
                y={toScreenY(car.z) - 8}
                fill="white"
                fontSize="11"
                dominantBaseline="middle"
              >
                {`Distance to curb: ${distances.curbDist}m`}
              </text>
              {distances.otherCars.map((other, index) => (
                <text
                  key={index}
                  x={toScreenX(car.x) + 20}
                  y={toScreenY(car.z) + (index * 12) + 4}
                  fill="white"
                  fontSize="11"
                  dominantBaseline="middle"
                >
                  {`To ${other.color} car: ${other.distance}m`}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default Minimap; 