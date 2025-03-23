import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import Scene from './components/Scene'
import Minimap from './components/Minimap'
import { useState } from 'react'
import './App.css'

// Constants for the scene
const ROAD_WIDTH = 8;
const CURB_POSITIONS = { left: -4.25, right: 4.25 };
const STATIC_CAR_POSITIONS = [
  { x: 3, z: -8, color: "red" },
  { x: 3, z: 8, color: "yellow" }
];

function App() {
  const [blueCarPosition, setBlueCarPosition] = useState({ x: 0, z: 0 });

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <Canvas shadows camera={{ position: [15, 15, 15], fov: 60 }}>
        <Sky sunPosition={[0, 100, 0]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          castShadow
          position={[0, 100, 0]}
          intensity={2}
          shadow-mapSize={1024}
        />
        <Scene onBlueCarPositionUpdate={setBlueCarPosition} />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
      </Canvas>
      <Minimap 
        carPositions={[
          ...STATIC_CAR_POSITIONS,
          { ...blueCarPosition, color: "blue" }
        ]}
        roadWidth={ROAD_WIDTH}
        curbPositions={CURB_POSITIONS}
      />
    </div>
  )
}

export default App
