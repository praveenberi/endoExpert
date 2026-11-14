import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

function Tooth({ speed }) {
  const group = useRef()
  const glow = useRef([])
  // Crown profile (radius, height) revolved around Y.
  const crown = useMemo(() => {
    const pts = [[0, 1.25], [0.45, 1.2], [0.8, 1.05], [1.0, 0.7], [1.05, 0.25], [0.95, -0.2], [0.8, -0.55], [0.55, -0.8], [0, -0.85]]
    return new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), 48)
  }, [])
  const canals = useMemo(() => [-0.38, 0.38].map((x, i) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(x * 0.2, 0.5, 0), new THREE.Vector3(x * 0.4, -0.6, 0.02),
      new THREE.Vector3(x * 0.9, -1.6, 0.08 * (i ? 1 : -1)), new THREE.Vector3(x * 1.1, -2.4, 0),
    ])
    return new THREE.TubeGeometry(curve, 48, 0.05, 10, false)
  }), [])
  useFrame((s, dt) => {
    group.current.rotation.y += dt * speed
    group.current.position.y = Math.sin(s.clock.elapsedTime * 0.8) * 0.06
    glow.current.forEach((m, i) => m && (m.emissiveIntensity = 1.2 + Math.sin(s.clock.elapsedTime * 2.2 - i) * 0.8))
  })
  const enamel = <meshPhysicalMaterial color="#f8fafc" roughness={0.25} clearcoat={1} clearcoatRoughness={0.15} transparent opacity={0.72} />
  return (
    <group ref={group} scale={1.05}>
      <mesh geometry={crown}>{enamel}</mesh>
      {[-0.4, 0.4].map((x, i) => (
        <mesh key={i} position={[x, -1.7, 0]} rotation={[Math.PI, 0, x * -0.28]}>
          <coneGeometry args={[0.42, 1.8, 32]} />{enamel}
        </mesh>
      ))}
      {canals.map((g, i) => (
        <mesh key={i} geometry={g}>
          <meshStandardMaterial ref={(m) => (glow.current[i] = m)} color="#2dd4bf" emissive="#2dd4bf" emissiveIntensity={1.5} />
        </mesh>
      ))}
    </group>
  )
}

export default function Tooth3D({ speed = 0.6 }) {
  return (
    <Canvas camera={{ position: [0, 0, 6.2], fov: 38 }} dpr={[1, 1.75]} gl={{ alpha: true, antialias: true }}>
      <ambientLight intensity={0.8} />
      <directionalLight position={[4, 5, 4]} intensity={2.2} />
      <pointLight position={[-4, -2, 3]} intensity={30} color="#2dd4bf" />
      <Tooth speed={speed} />
    </Canvas>
  )
}
