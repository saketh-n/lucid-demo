import { useRef } from 'react'
import { Mesh } from 'three'

function Car({ position, color, rotation = 0 }: { position: [number, number, number], color: string, rotation?: number }) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      {/* Car body */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 0.7, -0.5]} castShadow>
        <boxGeometry args={[1.5, 0.8, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Wheels */}
      <mesh position={[-1, -0.5, 1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[1, -0.5, 1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[-1, -0.5, -1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh position={[1, -0.5, -1]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  )
}

export default function Scene() {
  return (
    <>
      {/* Ground (grass) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3f7f3f" />
      </mesh>

      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <planeGeometry args={[8, 100]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Left Curb */}
      <mesh position={[-4.25, -0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.3, 100]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Right Curb */}
      <mesh position={[4.25, -0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.3, 100]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Left Sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-6, -0.35, 0]} receiveShadow>
        <planeGeometry args={[3, 100]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>

      {/* Right Sidewalk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[6, -0.35, 0]} receiveShadow>
        <planeGeometry args={[3, 100]} />
        <meshStandardMaterial color="#c0c0c0" />
      </mesh>

      {/* Cars - parallel parked */}
      <Car position={[3, 0, -8]} color="red" /> {/* Right side, close to curb */}
      <Car position={[0, 0, 0]} color="blue" /> {/* Center of road */}
      <Car position={[3, 0, 8]} color="yellow" /> {/* Right side, close to curb */}
    </>
  )
} 