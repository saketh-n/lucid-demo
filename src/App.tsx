import { Canvas } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import Scene from './components/Scene'
import './App.css'

function App() {
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
        <Scene />
        <OrbitControls 
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={5}
          maxDistance={50}
          maxPolarAngle={Math.PI / 2 - 0.1}
        />
      </Canvas>
    </div>
  )
}

export default App
