<script>
  // Îlot 3D Three.js pour Vincent 2000 OS.
  // - rendu "chunky" rétro (pixelRatio bas + flat shading) façon PS2/N64
  // - placeholder low-poly qui tourne tant qu'aucun GLB n'est fourni
  // - loader GLB + support Draco (GLB compressés) prêt à l'emploi
  // - OrbitControls optionnels (tourner / zoomer à la souris)
  //
  // Usage (dans une page .astro, en îlot chargé à la vue) :
  //   ---
  //   import Scene3D from '../os/three/Scene3D.svelte';
  //   ---
  //   <Scene3D client:visible src="/media/3d/borne.glb" controls />
  import { onMount } from 'svelte';
  import * as THREE from 'three';
  import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
  import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  let {
    src = '',
    height = 360,
    bg = '#0b0e1a',
    spin = true,
    controls = false,
    label = ''
  } = $props();

  let host;
  let loading = $state(!!src);
  let error = $state('');

  onMount(() => {
    const w = () => host.clientWidth || 640;
    const h = () => height;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(bg);

    const camera = new THREE.PerspectiveCamera(45, w() / h(), 0.01, 1000);
    camera.position.set(0, 1.1, 4);

    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: false });
    renderer.setPixelRatio(1);            // pixels francs, look rétro
    renderer.setSize(w(), h());
    host.appendChild(renderer.domElement);

    // lumières : clé chaude (néon) + ambiance froide (night drive)
    scene.add(new THREE.HemisphereLight(0x8899ff, 0x120018, 0.9));
    const key = new THREE.DirectionalLight(0xffb24a, 1.2);
    key.position.set(3, 5, 2);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xff3140, 0.5);
    rim.position.set(-4, 2, -3);
    scene.add(rim);

    let orbit;
    if (controls) {
      orbit = new OrbitControls(camera, renderer.domElement);
      orbit.enableDamping = true;
      orbit.autoRotate = spin;
      orbit.autoRotateSpeed = 1.2;
    }

    let subject;

    if (src) {
      const loader = new GLTFLoader();
      const draco = new DRACOLoader();
      draco.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.5.7/');
      loader.setDRACOLoader(draco);
      loader.load(
        src,
        (gltf) => { subject = gltf.scene; frameObject(subject); scene.add(subject); loading = false; },
        undefined,
        (err) => { console.warn('[Scene3D] GLB introuvable:', src, err); error = 'GLB introuvable'; loading = false; addPlaceholder(); }
      );
    } else {
      addPlaceholder();
    }

    function addPlaceholder() {
      const geo = new THREE.IcosahedronGeometry(1, 0); // low-poly
      const mat = new THREE.MeshStandardMaterial({ color: 0xff3140, flatShading: true, roughness: 0.6, metalness: 0.1 });
      subject = new THREE.Mesh(geo, mat);
      scene.add(subject);
    }

    // recadre la caméra sur un GLB quelle que soit sa taille
    function frameObject(obj) {
      const box = new THREE.Box3().setFromObject(obj);
      const size = box.getSize(new THREE.Vector3()).length();
      const center = box.getCenter(new THREE.Vector3());
      obj.position.sub(center);
      camera.position.set(0, size * 0.2, size * 1.4);
      camera.near = size / 100; camera.far = size * 10; camera.updateProjectionMatrix();
      if (orbit) { orbit.target.set(0, 0, 0); orbit.update(); }
    }

    let raf;
    const tick = () => {
      if (orbit) orbit.update();
      else if (spin && subject) subject.rotation.y += 0.01;
      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const onResize = () => { camera.aspect = w() / h(); camera.updateProjectionMatrix(); renderer.setSize(w(), h()); };
    const ro = new ResizeObserver(onResize);
    ro.observe(host);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      orbit?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  });
</script>

<div class="scene3d-wrap">
  <div class="scene3d" bind:this={host} style="height:{height}px"></div>
  {#if label}<span class="scene3d-label">{label}</span>{/if}
  {#if loading}<span class="scene3d-hint">chargement…</span>{/if}
  {#if error}<span class="scene3d-hint err">{error}</span>{/if}
</div>

<style>
  .scene3d-wrap { position: relative; }
  .scene3d {
    width: 100%;
    image-rendering: pixelated;   /* renforce le rendu chunky rétro */
    border: 1px solid #2a2f45;
    overflow: hidden;
  }
  .scene3d :global(canvas) { display: block; }
  .scene3d-label {
    position: absolute; left: 8px; bottom: 8px;
    font: 11px monospace; color: #cbd2ff;
    background: #0009; padding: 2px 6px; border: 1px solid #2a2f45;
  }
  .scene3d-hint {
    position: absolute; right: 8px; top: 8px;
    font: 10px monospace; color: #8fa0ff; background: #0009; padding: 2px 6px;
  }
  .scene3d-hint.err { color: #ff6b6b; }
</style>
