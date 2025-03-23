import { useRef, useState, useEffect } from 'react'
import { Mesh, Group, Vector3, Quaternion } from 'three'
import { useFrame } from '@react-three/fiber'

// Constants shared with App.tsx
const ROAD_WIDTH = 8;
const CURB_POSITIONS = { left: -4.25, right: 4.25 };
const MOVEMENT_SPEED = 2; // Reduced from 5
const TURN_SPEED = 1.5; // Reduced from 2
const WHEEL_ROTATION_SPEED = 8;
const MAX_SPEED = 8;
const BRAKE_POWER = 0.85;
const ACCELERATION = 0.8;

interface CarProps {
  position: [number, number, number];
  color: string;
  rotation?: number;
  isMovable?: boolean;
  onPositionUpdate?: (position: { x: number, z: number }) => void;
}

function Car({ position, color, rotation = 0, isMovable = false, onPositionUpdate }: CarProps) {
  const groupRef = useRef<Group>(null);
  const wheelsRef = useRef<Mesh[]>([]);
  const [carState, setCarState] = useState({
    position: new Vector3(position[0], position[1], position[2]),
    rotation: rotation,
    velocity: 0,
    steering: 0,
    acceleration: 0
  });
  
  // Keep track of pressed keys
  const [keys, setKeys] = useState({
    w: false,
    s: false,
    a: false,
    d: false,
    space: false
  });

  // Keyboard event handlers
  useEffect(() => {
    if (!isMovable) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (['w', 's', 'a', 'd', ' '].includes(e.key)) {
        setKeys(prev => ({ ...prev, [e.key === ' ' ? 'space' : e.key]: true }));
        if (e.key === ' ') e.preventDefault(); // Prevent page scroll on space
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (['w', 's', 'a', 'd', ' '].includes(e.key)) {
        setKeys(prev => ({ ...prev, [e.key === ' ' ? 'space' : e.key]: false }));
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

    // Update acceleration based on W/S keys
    let newAcceleration = carState.acceleration;
    if (keys.w) newAcceleration += ACCELERATION * delta;
    if (keys.s) newAcceleration -= ACCELERATION * delta;
    // Natural deceleration
    if (!keys.w && !keys.s) newAcceleration *= 0.95;

    // Calculate new velocity
    let newVelocity = carState.velocity;
    newVelocity += newAcceleration;

    // Apply brakes
    if (keys.space) {
      newVelocity *= BRAKE_POWER;
      newAcceleration *= BRAKE_POWER;
    }

    // Clamp velocity
    newVelocity = Math.max(Math.min(newVelocity, MAX_SPEED), -MAX_SPEED * 0.5);
    
    // Apply more friction at low speeds
    if (Math.abs(newVelocity) < 0.1) {
      newVelocity *= 0.9;
    }

    // Update steering based on A/D keys - more responsive at lower speeds
    let newSteering = carState.steering;
    const steeringPower = Math.max(0.5, 1 - (Math.abs(newVelocity) / MAX_SPEED));
    if (keys.a) newSteering += TURN_SPEED * delta * steeringPower;
    if (keys.d) newSteering -= TURN_SPEED * delta * steeringPower;
    // Return steering to center - faster at higher speeds
    newSteering *= 0.9 - (Math.abs(newVelocity) / MAX_SPEED) * 0.1;

    // Update position and rotation
    const newPosition = carState.position.clone();
    const direction = new Vector3(0, 0, 1).applyAxisAngle(new Vector3(0, 1, 0), carState.rotation);
    newPosition.add(direction.multiplyScalar(newVelocity * delta * MOVEMENT_SPEED));

    // Update car state
    const newRotation = carState.rotation + newSteering * newVelocity * delta;
    setCarState({
      position: newPosition,
      rotation: newRotation,
      velocity: newVelocity,
      steering: newSteering,
      acceleration: newAcceleration
    });

    // Apply updates to the 3D model
    groupRef.current.position.copy(newPosition);
    groupRef.current.rotation.y = newRotation;

    // Update parent component with new position
    if (onPositionUpdate) {
      onPositionUpdate({ x: newPosition.x, z: newPosition.z });
    }

    // Rotate wheels based on velocity
    const wheelSpeed = newVelocity * WHEEL_ROTATION_SPEED;
    wheelsRef.current.forEach(wheel => {
      if (wheel) {
        wheel.rotation.x += wheelSpeed * delta;
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

export default function Scene({ onBlueCarPositionUpdate }: { onBlueCarPositionUpdate?: (position: { x: number, z: number }) => void }) {
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
        onPositionUpdate={onBlueCarPositionUpdate}
      />
    </>
  );
} 