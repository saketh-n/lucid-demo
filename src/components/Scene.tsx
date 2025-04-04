import { useRef, useState, useEffect } from 'react'
import { Mesh, Group, Vector3, Quaternion } from 'three'
import { useFrame } from '@react-three/fiber'

// Constants shared with App.tsx
const ROAD_WIDTH = 8;
const CURB_POSITIONS = { left: -4.25, right: 4.25 };
const MOVEMENT_SPEED = 5;
const TURN_SPEED = 2;
const WHEEL_ROTATION_SPEED = 10;

interface CarProps {
  position: [number, number, number];
  color: string;
  rotation?: number;
  isMovable?: boolean;
}

function Car({ position, color, rotation = 0, isMovable = false }: CarProps) {
  const groupRef = useRef<Group>(null);
  const wheelsRef = useRef<Mesh[]>([]);
  const [carState, setCarState] = useState({
    position: new Vector3(position[0], position[1], position[2]),
    rotation: rotation,
    velocity: 0,
    steering: 0
  });
  
  // Keep track of pressed keys
  const [keys, setKeys] = useState({
    w: false,
    s: false,
    a: false,
    d: false
  });

  // Keyboard event handlers
  useEffect(() => {
    if (!isMovable) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 's', 'a', 'd'].includes(e.key)) {
        setKeys(prev => ({ ...prev, [e.key]: true }));
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 's', 'a', 'd'].includes(e.key)) {
        setKeys(prev => ({ ...prev, [e.key]: false }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isMovable]);

  // Movement and animation logic
  useFrame((state, delta) => {
    if (!isMovable || !groupRef.current) return;

    // Update velocity based on W/S keys
    let newVelocity = carState.velocity;
    if (keys.w) newVelocity += MOVEMENT_SPEED * delta;
    if (keys.s) newVelocity -= MOVEMENT_SPEED * delta;
    // Apply friction
    newVelocity *= 0.95;

    // Update steering based on A/D keys
    let newSteering = carState.steering;
    if (keys.a) newSteering += TURN_SPEED * delta;
    if (keys.d) newSteering -= TURN_SPEED * delta;
    // Return steering to center
    newSteering *= 0.9;

    // Update position and rotation
    const newPosition = carState.position.clone();
    const direction = new Vector3(0, 0, 1).applyAxisAngle(new Vector3(0, 1, 0), carState.rotation);
    newPosition.add(direction.multiplyScalar(newVelocity));

    // Update car state
    const newRotation = carState.rotation + newSteering * newVelocity;
    setCarState({
      position: newPosition,
      rotation: newRotation,
      velocity: newVelocity,
      steering: newSteering
    });

    // Apply updates to the 3D model
    groupRef.current.position.copy(newPosition);
    groupRef.current.rotation.y = newRotation;

    // Rotate wheels based on velocity
    wheelsRef.current.forEach(wheel => {
      if (wheel) {
        wheel.rotation.x += newVelocity * WHEEL_ROTATION_SPEED;
      }
    });
  });

  return (
    <group ref={groupRef} position={position} rotation={[0, rotation, 0]}>
      {/* Car body */}
      <mesh castShadow receiveShadow position={[0, isMovable ? 0.6 : 0, 0]}>
        <boxGeometry args={[2, 1, 4]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, isMovable ? 1.3 : 0.7, -0.5]} castShadow>
        <boxGeometry args={[1.5, 0.8, 2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* Wheels */}
      <mesh
        ref={el => wheelsRef.current[0] = el as Mesh}
        position={[-1, isMovable ? 0.1 : -0.5, 1]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh
        ref={el => wheelsRef.current[1] = el as Mesh}
        position={[1, isMovable ? 0.1 : -0.5, 1]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh
        ref={el => wheelsRef.current[2] = el as Mesh}
        position={[-1, isMovable ? 0.1 : -0.5, -1]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="black" />
      </mesh>
      <mesh
        ref={el => wheelsRef.current[3] = el as Mesh}
        position={[1, isMovable ? 0.1 : -0.5, -1]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      >
        <cylinderGeometry args={[0.4, 0.4, 0.4]} />
        <meshStandardMaterial color="black" />
      </mesh>
    </group>
  );
}

export default function Scene() {
  const staticCars = [
    { position: [3, 0, -8] as [number, number, number], color: "red" },
    { position: [3, 0, 8] as [number, number, number], color: "yellow" }
  ];

  return (
    <>
      {/* Ground (grass) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
        <planeGeometry args={[100, 100]} />
        <meshStandardMaterial color="#3f7f3f" />
      </mesh>

      {/* Road */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <planeGeometry args={[ROAD_WIDTH, 100]} />
        <meshStandardMaterial color="#444444" />
      </mesh>

      {/* Left Curb */}
      <mesh position={[CURB_POSITIONS.left, -0.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.3, 100]} />
        <meshStandardMaterial color="#808080" />
      </mesh>

      {/* Right Curb */}
      <mesh position={[CURB_POSITIONS.right, -0.25, 0]} castShadow receiveShadow>
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

      {/* Static Cars */}
      {staticCars.map((car, index) => (
        <Car 
          key={index}
          position={car.position}
          color={car.color}
        />
      ))}

      {/* Movable blue car */}
      <Car 
        position={[0, 0, 0]}
        color="blue"
        isMovable={true}
      />
    </>
  );
} 