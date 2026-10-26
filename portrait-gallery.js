import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js";

const gallery = document.querySelector("[data-portrait-gallery]");

if (gallery) {
  const photos = [
    {
      src: "photo%20gallery/581869773_1265349218954324_3808890512626176926_n.jpg",
      alt: "Jacob Orencia in graduation attire",
      caption: "GRADUATION PORTRAIT",
    },
    {
      src: "photo%20gallery/753298608_1481444460678131_6931728023194408134_n.jpg",
      alt: "A band performing in the Wish 107.5 radio studio",
      caption: "LIVE MUSIC",
    },
    {
      src: "photo%20gallery/3b7d1fde-399b-4f04-9832-fe85d3b543c5.jpg",
      alt: "Music production setup with a studio monitor, headphones, and music controller",
      caption: "MUSIC PRODUCTION SETUP",
    },
    {
      src: "photo%20gallery/18b073b7-a0d4-4aec-8c7f-22a409b17d98.jpg",
      alt: "Video editing screens showing DaVinci Resolve in a multi-monitor workstation",
      caption: "VIDEO EDITING",
    },
  ];
  const stage = gallery.querySelector(".portrait-stage");
  const canvas = gallery.querySelector(".portrait-canvas");
  const caption = gallery.querySelector("[data-portrait-caption]");
  const count = gallery.querySelector("[data-portrait-count]");
  const toggleButton = gallery.querySelector("[data-portrait-toggle]");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  async function initializeGallery() {
    const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 50);
    camera.position.z = 6.6;

    const carousel = new THREE.Group();
    scene.add(carousel);

    const cardGeometry = new THREE.PlaneGeometry(1.78, 2.52);
    const photoGeometry = new THREE.PlaneGeometry(1.66, 2.4);
    const angleStep = (Math.PI * 2) / photos.length;
    const radius = 1.85;
    const textureLoader = new THREE.TextureLoader();

    for (let index = 0; index < photos.length; index += 1) {
      const source = await textureLoader.loadAsync(photos[index].src);
      const photoAspect = source.image.width / source.image.height;
      const cardAspect = photoGeometry.parameters.width / photoGeometry.parameters.height;
      if (photoAspect > cardAspect) {
        source.repeat.x = cardAspect / photoAspect;
        source.offset.x = (1 - source.repeat.x) / 2;
      } else {
        source.repeat.y = photoAspect / cardAspect;
        source.offset.y = (1 - source.repeat.y) / 2;
      }
      const card = new THREE.Group();
      const frame = new THREE.Mesh(cardGeometry, new THREE.MeshBasicMaterial({ color: 0xf4f2eb }));
      const photo = new THREE.Mesh(
        photoGeometry,
        new THREE.MeshBasicMaterial({ map: source, side: THREE.DoubleSide }),
      );
      source.colorSpace = THREE.SRGBColorSpace;
      photo.position.z = 0.012;
      card.add(frame, photo);
      card.position.set(Math.sin(index * angleStep) * radius, 0, Math.cos(index * angleStep) * radius);
      card.rotation.y = index * angleStep;
      carousel.add(card);
    }

    let currentIndex = 0;
    let targetRotation = 0;
    let paused = reducedMotion;
    function resizeStage() {
      const width = stage.clientWidth;
      const height = stage.clientHeight;
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    }

    const resizeObserver = new ResizeObserver(resizeStage);
    resizeObserver.observe(stage);
    window.addEventListener("resize", resizeStage);
    resizeStage();

    function updateLabels() {
      caption.textContent = photos[currentIndex].caption;
      count.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(photos.length).padStart(2, "0")}`;
      canvas.setAttribute("aria-label", photos[currentIndex].alt);
    }

    function advance(direction) {
      currentIndex = (currentIndex + direction + photos.length) % photos.length;
      targetRotation -= direction * angleStep;
      updateLabels();
    }

    function updatePauseControl() {
      toggleButton.textContent = paused ? "Play" : "Pause";
      toggleButton.setAttribute("aria-label", paused ? "Resume automatic rotation" : "Pause automatic rotation");
      toggleButton.setAttribute("aria-pressed", String(paused));
    }

    gallery.addEventListener("click", (event) => {
      const stepButton = event.target.closest("[data-portrait-step]");
      if (stepButton) advance(Number(stepButton.dataset.portraitStep));

      if (event.target.closest("[data-portrait-toggle]")) {
        paused = !paused;
        updatePauseControl();
      }
    });

    window.setInterval(() => {
      const interacting = gallery.contains(document.activeElement);
      if (!paused && !interacting && !document.hidden) advance(1);
    }, 5000);

    function render() {
      requestAnimationFrame(render);
      carousel.rotation.y += (targetRotation - carousel.rotation.y) * 0.055;
      renderer.render(scene, camera);
    }

    updateLabels();
    updatePauseControl();
    renderer.render(scene, camera);
    gallery.classList.add("is-ready");
    requestAnimationFrame(render);
  }

  initializeGallery().catch((error) => {
    console.error("The portrait gallery could not start.", error);
  });
}