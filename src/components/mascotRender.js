// Procedural 3D "cute tooth" mascot. Poses are rendered once, offscreen, with Three.js
// and cached as PNG data-URLs so they can be used as ordinary images anywhere on the site.
import * as THREE from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'
import { useEffect, useState } from 'react'

export const POSES = ['wave', 'magnifier', 'mirror', 'stethoscope', 'shield', 'brush', 'heart', 'trauma']
export const POSE_LABELS = { wave: 'Waving', magnifier: 'Magnifier (microscope)', mirror: 'Dental mirror', stethoscope: 'Stethoscope', shield: 'Shield (protection)', brush: 'Toothbrush (retreatment)', heart: 'Hearts (care)', trauma: 'Injured tooth' }

const white = () => new THREE.MeshPhysicalMaterial({ color: '#fbfdff', roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.12, sheen: 0.4 })
const mat = (color, extra = {}) => new THREE.MeshPhysicalMaterial({ color, roughness: 0.35, clearcoat: 0.6, ...extra })
const BLUE = '#2f80ed', GOLD = '#e6b653', RED = '#ef4444'

function toothBody() {
  const g = new THREE.Group()
  const w = white()
  // Crown: broad rounded tooth, wide at the top, tapering in, with a soft dip on the biting edge.
  const cg = new THREE.SphereGeometry(1, 72, 56)
  const p = cg.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), t = (y + 1) / 2
    const f = 0.7 + 0.3 * Math.pow(t, 0.6)
    p.setX(i, x * f); p.setZ(i, p.getZ(i) * f)
    p.setY(i, y - 0.2 * Math.pow(t, 4) * Math.exp(-(x * x) / 0.22)) // top dip
  }
  cg.computeVertexNormals()
  const crown = new THREE.Mesh(cg, w)
  crown.scale.set(1.36, 1.02, 0.98); crown.position.y = 0.45
  g.add(crown)
  // Two short chubby roots at the bottom with a notch between them.
  ;[-1, 1].forEach((s) => {
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.5, 40, 32), w)
    r.position.set(s * 0.52, -0.82, 0); r.scale.set(0.95, 1.2, 0.9); r.rotation.z = s * -0.08; g.add(r)
  })
  return g
}

function face(sad = false) {
  const g = new THREE.Group()
  const dark = mat('#14171c', { roughness: 0.15, clearcoat: 1 })
  ;[-0.42, 0.42].forEach((x) => {
    const e = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 16), dark)
    e.position.set(x, 0.5, 0.86); e.scale.set(0.85, 1.15, 0.5)
    const hi = new THREE.Mesh(new THREE.SphereGeometry(0.035, 12, 8), new THREE.MeshBasicMaterial({ color: '#fff' }))
    hi.position.set(x + 0.04, 0.55, 0.93)
    g.add(e, hi)
    const b = new THREE.Mesh(new THREE.CircleGeometry(0.15, 24), new THREE.MeshBasicMaterial({ color: '#ff9db1', transparent: true, opacity: 0.55 }))
    b.position.set(x * 1.55, 0.2, 0.84); b.rotation.y = x * 0.5; b.scale.set(1.2, 0.8, 1); g.add(b)
  })
  const smile = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.028, 12, 32, Math.PI), dark)
  smile.position.set(0, sad ? 0.14 : 0.27, 0.9)
  smile.rotation.z = sad ? 0 : Math.PI
  g.add(smile)
  if (!sad) {
    const tongue = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 12), mat('#ff6b81'))
    tongue.position.set(0, 0.17, 0.89); tongue.scale.set(1.3, 0.55, 0.4); g.add(tongue)
  }
  return g
}

// Thin dark cable-like arm ending in a white gloved hand. x/rotZ/y keep the old pose params:
// the hand sits at the lower end of a segment centred on (x, y) tilted by rotZ.
const armMat = () => mat('#2b2f36', { roughness: 0.5, clearcoat: 0.3 })
const arm = (x, rotZ, y = 0.1) => {
  const g = new THREE.Group(), side = Math.sign(x) || 1
  const hand = new THREE.Vector3(x + Math.sin(rotZ) * 0.6, y - Math.cos(rotZ) * 0.6 + 0.1, 0.35)
  const start = new THREE.Vector3(side * 1.1, 0.25, 0.1)
  const mid = new THREE.Vector3(side * 1.45 + (hand.x - side * 1.3) * 0.3, (start.y + hand.y) / 2, 0.2)
  const tube = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([start, mid, hand]), 28, 0.045, 10), armMat())
  const palm = new THREE.Mesh(new THREE.SphereGeometry(0.17, 24, 18), white()); palm.position.copy(hand); palm.scale.set(1, 1.1, 0.7)
  const thumb = new THREE.Mesh(new THREE.SphereGeometry(0.07, 14, 10), white()); thumb.position.set(hand.x - side * 0.16, hand.y + 0.05, hand.z + 0.04)
  g.add(tube, palm, thumb); return g
}

function ring(r, color, tube = 0.06) { return new THREE.Mesh(new THREE.TorusGeometry(r, tube, 16, 48), mat(color)) }
function glass(r) { return new THREE.Mesh(new THREE.CircleGeometry(r, 40), new THREE.MeshPhysicalMaterial({ color: '#cfe8ff', transparent: true, opacity: 0.55, roughness: 0.05, clearcoat: 1 })) }
function stick(len, color, w = 0.05) { return new THREE.Mesh(new THREE.CylinderGeometry(w, w, len, 12), mat(color)) }
function star(s, color = '#fde047') {
  const m = new THREE.Mesh(new THREE.OctahedronGeometry(s, 0), new THREE.MeshBasicMaterial({ color })); m.scale.set(0.45, 1, 0.45); return m
}
function heart(s) {
  const sh = new THREE.Shape(); sh.moveTo(0, 0.25); sh.bezierCurveTo(0, 0.5, -0.5, 0.5, -0.5, 0.1); sh.bezierCurveTo(-0.5, -0.2, 0, -0.35, 0, -0.55)
  sh.bezierCurveTo(0, -0.35, 0.5, -0.2, 0.5, 0.1); sh.bezierCurveTo(0.5, 0.5, 0, 0.5, 0, 0.25)
  const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.25, bevelEnabled: true, bevelSize: 0.06, bevelThickness: 0.08, bevelSegments: 4 }), mat(RED, { clearcoat: 1 }))
  m.scale.setScalar(s); return m
}

function buildPose(pose) {
  const g = new THREE.Group()
  const body = toothBody(); g.add(body)
  g.add(face(pose === 'trauma'))
  const L = (x, rz, y) => g.add(arm(x, rz, y))

  if (pose === 'wave') { L(-1.2, 0.5, 0.0); L(1.25, -2.4, 0.75); g.add(star(0.16).translateX(1.7).translateY(1.7)) }
  if (pose === 'magnifier') {
    L(1.2, -0.4, 0.0)
    const m = new THREE.Group(); m.add(ring(0.55, BLUE, 0.1)); const gl = glass(0.5); gl.position.z = 0.02; m.add(gl)
    const h = stick(0.8, BLUE, 0.09); h.position.set(-0.45, -0.62, 0); h.rotation.z = -0.65; m.add(h)
    m.position.set(1.35, 0.55, 0.9); g.add(m); L(-1.2, 0.5, 0.0)
  }
  if (pose === 'mirror') {
    L(-1.2, 0.5, 0.0); L(1.15, -0.5, 0.2)
    const m = new THREE.Group(); m.add(ring(0.4, GOLD, 0.07)); const gl = glass(0.37); m.add(gl)
    const h = stick(0.9, GOLD, 0.05); h.position.set(0.1, -0.78, 0); m.add(h)
    m.position.set(1.5, 0.95, 0.5); m.rotation.z = -0.2; g.add(m)
  }
  if (pose === 'stethoscope') {
    L(-1.2, 0.5, 0.0); L(1.2, -0.5, 0.0)
    const t = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.07, 12, 48, Math.PI * 1.1), mat(BLUE))
    t.position.set(0, 0.55, 0.45); t.rotation.z = Math.PI * 1.45; g.add(t)
    const cs = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.1, 32), mat('#cbd5e1', { metalness: 0.8, roughness: 0.2 }))
    cs.rotation.x = Math.PI / 2; cs.position.set(-0.55, -0.55, 1.0); g.add(cs)
    ;[-0.78, 0.78].forEach((x) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.11, 12, 8), mat(BLUE)); e.position.set(x, 1.0, 0.45); g.add(e) })
  }
  if (pose === 'shield') {
    L(1.2, -0.5, 0.0)
    const sh = new THREE.Shape(); sh.moveTo(0, 0.6); sh.lineTo(0.5, 0.45); sh.lineTo(0.5, 0); sh.quadraticCurveTo(0.45, -0.4, 0, -0.65); sh.quadraticCurveTo(-0.45, -0.4, -0.5, 0); sh.lineTo(-0.5, 0.45); sh.lineTo(0, 0.6)
    const s = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05 }), mat(BLUE, { clearcoat: 1 }))
    const c1 = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.12, 0.05), mat('#fff')); c1.position.z = 0.2
    const c2 = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.4, 0.05), mat('#fff')); c2.position.z = 0.2
    const grp = new THREE.Group(); grp.add(s, c1, c2); grp.position.set(-1.35, 0.3, 0.9); grp.scale.setScalar(1.25); g.add(grp); L(-1.2, 0.5, -0.2)
  }
  if (pose === 'brush') {
    L(-1.2, 0.5, 0.0); L(1.2, -0.5, 0.0)
    const b = new THREE.Group()
    const hd = new THREE.Mesh(new THREE.BoxGeometry(0.16, 1.5, 0.1), mat(BLUE)); b.add(hd)
    const br = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.45, 0.14), mat('#f8fafc')); br.position.y = 0.95; b.add(br)
    b.position.set(1.75, 0.35, 0.7); b.rotation.z = -0.2; g.add(b)
    g.add(star(0.16).translateX(-1.6).translateY(1.5), star(0.11).translateX(-1.2).translateY(1.9))
  }
  if (pose === 'heart') {
    L(-1.2, 0.5, 0.0); L(1.2, -0.5, 0.0)
    g.add(heart(0.6).translateX(-1.6).translateY(1.5), heart(0.42).translateX(1.7).translateY(1.8), heart(0.3).translateX(1.5).translateY(0.7))
  }
  if (pose === 'trauma') {
    L(-1.2, 0.8, -0.2); L(1.2, -0.8, -0.2)
    const crack = new THREE.Mesh(new THREE.TorusGeometry(0.3, 0.02, 6, 6, Math.PI * 1.2), mat('#64748b')); crack.position.set(-0.1, 1.1, 0.88); crack.scale.set(0.5, 1, 1); g.add(crack)
    const tear = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), mat('#60a5fa', { transparent: true, opacity: 0.85 })); tear.position.set(0.52, 0.28, 0.9); tear.scale.set(0.8, 1.3, 0.6); g.add(tear)
    g.add(star(0.14, '#93c5fd').translateX(-1.5).translateY(1.6))
  }
  g.rotation.y = -0.22
  return g
}

let cache = null
export function renderMascots(size = 512) {
  if (cache) return cache
  cache = new Promise((resolve) => {
    const canvas = document.createElement('canvas'); canvas.width = canvas.height = size
    const r = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true })
    r.setPixelRatio(1); r.setSize(size, size, false); r.setClearColor(0x000000, 0)
    r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05
    const scene = new THREE.Scene()
    const pm = new THREE.PMREMGenerator(r)
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture
    const key = new THREE.DirectionalLight('#ffffff', 1.6); key.position.set(3, 4, 5); scene.add(key)
    const rim = new THREE.DirectionalLight('#9be7ff', 1.0); rim.position.set(-4, 2, -3); scene.add(rim)
    scene.add(new THREE.AmbientLight('#ffffff', 0.5))
    const cam = new THREE.PerspectiveCamera(30, 1, 0.1, 50); cam.position.set(0.25, 0.2, 8.6); cam.lookAt(0.25, 0.1, 0)
    const out = {}
    POSES.forEach((p) => {
      const obj = buildPose(p); scene.add(obj); r.render(scene, cam); out[p] = canvas.toDataURL('image/png'); scene.remove(obj)
    })
    r.dispose(); pm.dispose()
    resolve(out)
  })
  return cache
}

export function useMascot(pose = 'wave') {
  const [url, setUrl] = useState('')
  useEffect(() => { let on = true; renderMascots().then((m) => on && setUrl(m[pose] || m.wave)).catch(() => {}); return () => { on = false } }, [pose])
  return url
}
