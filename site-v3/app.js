/* ============================================================
   DoubleDyn v3 — app.js
   Three.js Butterflies + Volumetric Clouds + GSAP ScrollTrigger
   "Metamorfose Carbono" — Premium Scroll Experience
   ============================================================ */

(function () {
    'use strict';

    // ========================================================
    // CONFIG
    // ========================================================
    const CONFIG = {
        butterflies: {
            count: window.innerWidth < 768 ? 10 : 22,
            colors: [
                { body: 0x2ecc71, wing: 0x1abc9c, emissive: 0x0d7a42 },
                { body: 0xd4a853, wing: 0x2ecc71, emissive: 0x1a6b35 },
                { body: 0x00ff88, wing: 0x2ecc71, emissive: 0x0a5c2f },
                { body: 0xd4a853, wing: 0xf0d090, emissive: 0x7a5a20 },
            ],
        },
        clouds: {
            count: window.innerWidth < 768 ? 15 : 30,
        },
        particles: {
            count: window.innerWidth < 768 ? 40 : 100,
        },
        camera: {
            fov: 60,
            near: 0.1,
            far: 100,
            z: 18,
        },
        fog: {
            color: 0x060b09,
            near: 15,
            far: 45,
        },
    };

    // ========================================================
    // THREE.JS SCENE
    // ========================================================
    let scene, camera, renderer;
    let butterflies = [];
    let clouds = [];
    let particles;
    let scrollProgress = 0;
    let mouseX = 0, mouseY = 0;
    const clock = new THREE.Clock();

    function initThree() {
        const canvas = document.getElementById('scene');
        if (!canvas) return;

        // Scene
        scene = new THREE.Scene();
        scene.fog = new THREE.Fog(CONFIG.fog.color, CONFIG.fog.near, CONFIG.fog.far);

        // Camera
        camera = new THREE.PerspectiveCamera(
            CONFIG.camera.fov,
            window.innerWidth / window.innerHeight,
            CONFIG.camera.near,
            CONFIG.camera.far
        );
        camera.position.z = CONFIG.camera.z;

        // Renderer
        renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true,
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(CONFIG.fog.color, 1);

        // Lighting
        const ambientLight = new THREE.AmbientLight(0x1abc9c, 0.4);
        scene.add(ambientLight);

        const pointLight1 = new THREE.PointLight(0x2ecc71, 1.5, 50);
        pointLight1.position.set(10, 8, 5);
        scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xd4a853, 1.0, 50);
        pointLight2.position.set(-10, -5, 8);
        scene.add(pointLight2);

        const pointLight3 = new THREE.PointLight(0x00ff88, 0.6, 40);
        pointLight3.position.set(0, 10, -5);
        scene.add(pointLight3);

        // Create scene elements
        createButterflies();
        createClouds();
        createParticles();

        // Events
        window.addEventListener('resize', onResize);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('scroll', onScroll);

        // Start render loop
        animate();
    }

    // ========================================================
    // BUTTERFLY
    // ========================================================
    function createWingShape(mirror) {
        const shape = new THREE.Shape();
        const m = mirror ? -1 : 1;

        shape.moveTo(0, 0);
        // Upper wing
        shape.bezierCurveTo(
            m * 0.3, 0.4,
            m * 1.2, 1.0,
            m * 0.9, 1.6
        );
        shape.bezierCurveTo(
            m * 0.7, 1.8,
            m * 0.4, 1.5,
            m * 0.2, 1.0
        );
        // Lower wing
        shape.bezierCurveTo(
            m * 0.5, 0.8,
            m * 1.0, 0.3,
            m * 0.8, -0.3
        );
        shape.bezierCurveTo(
            m * 0.6, -0.5,
            m * 0.3, -0.3,
            0, 0
        );

        return shape;
    }

    function createButterfly(colorScheme) {
        const group = new THREE.Group();

        // Wing material
        const wingMaterial = new THREE.MeshPhongMaterial({
            color: colorScheme.wing,
            emissive: colorScheme.emissive,
            emissiveIntensity: 0.35,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.75,
            shininess: 80,
        });

        // Left wing
        const leftShape = createWingShape(false);
        const leftGeo = new THREE.ShapeGeometry(leftShape);
        const leftWing = new THREE.Mesh(leftGeo, wingMaterial.clone());
        leftWing.name = 'leftWing';

        // Right wing
        const rightShape = createWingShape(true);
        const rightGeo = new THREE.ShapeGeometry(rightShape);
        const rightWing = new THREE.Mesh(rightGeo, wingMaterial.clone());
        rightWing.name = 'rightWing';

        // Body
        const bodyGeo = new THREE.CylinderGeometry(0.03, 0.02, 1.2, 6);
        const bodyMat = new THREE.MeshPhongMaterial({
            color: colorScheme.body,
            emissive: colorScheme.body,
            emissiveIntensity: 0.3,
        });
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.rotation.z = Math.PI / 2;
        body.position.y = 0.5;

        // Antennae (thin lines)
        const antennaGeo = new THREE.CylinderGeometry(0.005, 0.005, 0.5, 4);
        const antennaMat = new THREE.MeshBasicMaterial({ color: colorScheme.body });

        const leftAntenna = new THREE.Mesh(antennaGeo, antennaMat);
        leftAntenna.position.set(0.15, 1.15, 0);
        leftAntenna.rotation.z = -0.4;

        const rightAntenna = new THREE.Mesh(antennaGeo, antennaMat);
        rightAntenna.position.set(-0.15, 1.15, 0);
        rightAntenna.rotation.z = 0.4;

        group.add(leftWing, rightWing, body, leftAntenna, rightAntenna);

        // Random scale
        const scale = 0.25 + Math.random() * 0.35;
        group.scale.setScalar(scale);

        // Random position
        group.position.set(
            (Math.random() - 0.5) * 30,
            (Math.random() - 0.5) * 16,
            (Math.random() - 0.5) * 20
        );

        // Animation properties
        group.userData = {
            speed: 0.8 + Math.random() * 1.5,
            offset: Math.random() * Math.PI * 2,
            baseY: group.position.y,
            baseX: group.position.x,
            baseZ: group.position.z,
            radius: 1.5 + Math.random() * 4,
            verticalAmplitude: 0.5 + Math.random() * 2,
            flapSpeed: 4 + Math.random() * 4,
        };

        scene.add(group);
        return group;
    }

    function createButterflies() {
        for (let i = 0; i < CONFIG.butterflies.count; i++) {
            const colorScheme = CONFIG.butterflies.colors[i % CONFIG.butterflies.colors.length];
            const butterfly = createButterfly(colorScheme);
            butterflies.push(butterfly);
        }
    }

    function updateButterfly(butterfly, time) {
        const d = butterfly.userData;
        const t = time * d.speed;

        // Wing flapping
        const flapAngle = Math.sin(t * d.flapSpeed + d.offset) * 1.0;
        const leftWing = butterfly.children[0];
        const rightWing = butterfly.children[1];
        if (leftWing && rightWing) {
            leftWing.rotation.y = flapAngle * 0.5;
            rightWing.rotation.y = -flapAngle * 0.5;
        }

        // Floating path (figure-eight-ish)
        butterfly.position.x = d.baseX + Math.sin(t * 0.3 + d.offset) * d.radius;
        butterfly.position.y = d.baseY + Math.sin(t * 0.5 + d.offset * 1.3) * d.verticalAmplitude;
        butterfly.position.z = d.baseZ + Math.cos(t * 0.2 + d.offset * 0.7) * d.radius * 0.5;

        // Face movement direction
        const dx = Math.cos(t * 0.3 + d.offset) * d.radius * 0.3;
        butterfly.rotation.y = Math.atan2(dx, 1) * 0.5;
        butterfly.rotation.z = Math.sin(t * 0.4 + d.offset) * 0.15;

        // Scroll reactivity — butterflies slow down and dim deeper in page
        const scrollFade = 1 - scrollProgress * 0.3;
        butterfly.scale.setScalar(
            (0.25 + Math.random() * 0.001) * (0.7 + scrollFade * 0.3)
        );
    }

    // ========================================================
    // VOLUMETRIC CLOUDS
    // ========================================================
    function createCloudTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        // Radial gradient for soft cloud
        const gradient = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
        gradient.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
        gradient.addColorStop(0.3, 'rgba(200, 240, 220, 0.1)');
        gradient.addColorStop(0.7, 'rgba(150, 220, 180, 0.03)');
        gradient.addColorStop(1, 'rgba(100, 200, 150, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 256, 256);

        return new THREE.CanvasTexture(canvas);
    }

    function createClouds() {
        const texture = createCloudTexture();

        for (let i = 0; i < CONFIG.clouds.count; i++) {
            const material = new THREE.SpriteMaterial({
                map: texture,
                transparent: true,
                opacity: 0.08 + Math.random() * 0.12,
                depthWrite: false,
            });

            const sprite = new THREE.Sprite(material);
            sprite.position.set(
                (Math.random() - 0.5) * 40,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 25 - 5
            );
            sprite.scale.setScalar(6 + Math.random() * 12);

            sprite.userData = {
                baseX: sprite.position.x,
                baseY: sprite.position.y,
                speed: 0.1 + Math.random() * 0.3,
                offset: Math.random() * Math.PI * 2,
            };

            scene.add(sprite);
            clouds.push(sprite);
        }
    }

    function updateClouds(time) {
        clouds.forEach((cloud) => {
            const d = cloud.userData;
            cloud.position.x = d.baseX + Math.sin(time * d.speed * 0.1 + d.offset) * 1.5;
            cloud.position.y = d.baseY + Math.cos(time * d.speed * 0.08 + d.offset) * 0.5;

            // Clouds dissipate with scroll (CO₂ metaphor)
            const dissipate = Math.max(0.02, cloud.material.opacity * (1 - scrollProgress * 0.5));
            cloud.material.opacity = dissipate + 0.02;
        });
    }

    // ========================================================
    // AMBIENT PARTICLES (Firefly-like)
    // ========================================================
    function createParticles() {
        const count = CONFIG.particles.count;
        const geometry = new THREE.BufferGeometry();
        const positions = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 35;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 25;
            sizes[i] = 0.5 + Math.random() * 1.5;
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

        // Create particle texture
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');
        const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
        gradient.addColorStop(0, 'rgba(46, 204, 113, 0.8)');
        gradient.addColorStop(0.5, 'rgba(0, 255, 136, 0.2)');
        gradient.addColorStop(1, 'rgba(0, 255, 136, 0)');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 64, 64);

        const texture = new THREE.CanvasTexture(canvas);

        const material = new THREE.PointsMaterial({
            map: texture,
            size: 0.3,
            transparent: true,
            opacity: 0.6,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true,
        });

        particles = new THREE.Points(geometry, material);
        scene.add(particles);
    }

    function updateParticles(time) {
        if (!particles) return;
        const positions = particles.geometry.attributes.position.array;
        for (let i = 0; i < positions.length; i += 3) {
            positions[i + 1] += Math.sin(time * 0.5 + i) * 0.003;
            positions[i] += Math.cos(time * 0.3 + i * 0.5) * 0.002;
        }
        particles.geometry.attributes.position.needsUpdate = true;
        particles.rotation.y = time * 0.01;
    }

    // ========================================================
    // ANIMATION LOOP
    // ========================================================
    function animate() {
        requestAnimationFrame(animate);

        const time = clock.getElapsedTime();

        // Update butterflies
        butterflies.forEach((b) => updateButterfly(b, time));

        // Update clouds
        updateClouds(time);

        // Update particles
        updateParticles(time);

        // Smooth camera follow mouse
        const targetX = mouseX * 0.5;
        const targetY = mouseY * 0.3;
        camera.position.x += (targetX - camera.position.x) * 0.02;
        camera.position.y += (targetY - camera.position.y) * 0.02;
        camera.lookAt(0, 0, 0);

        // Scroll: move camera back slightly + adjust fog
        camera.position.z = CONFIG.camera.z + scrollProgress * 5;
        scene.fog.near = CONFIG.fog.near + scrollProgress * 10;

        renderer.render(scene, camera);
    }

    // ========================================================
    // EVENT HANDLERS
    // ========================================================
    function onResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    function onMouseMove(e) {
        mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        mouseY = -(e.clientY / window.innerHeight - 0.5) * 2;
    }

    function onScroll() {
        const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
        scrollProgress = window.scrollY / maxScroll;
    }

    // ========================================================
    // GSAP + SCROLLTRIGGER
    // ========================================================
    function initGSAP() {
        gsap.registerPlugin(ScrollTrigger);

        // --- Navbar scroll effect ---
        ScrollTrigger.create({
            start: 'top -80',
            onEnter: () => document.getElementById('navbar').classList.add('scrolled'),
            onLeaveBack: () => document.getElementById('navbar').classList.remove('scrolled'),
        });

        // --- Hero ---
        const heroTl = gsap.timeline();
        heroTl
            .from('.hero__badge', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' })
            .from('.hero__title', { opacity: 0, y: 50, duration: 1, ease: 'power3.out' }, '-=0.4')
            .from('.hero__subtitle', { opacity: 0, y: 30, duration: 0.8, ease: 'power3.out' }, '-=0.5')
            .from('.hero__actions .btn', { opacity: 0, y: 20, duration: 0.6, stagger: 0.15, ease: 'power3.out' }, '-=0.3')
            .from('.hero__scroll-indicator', { opacity: 0, duration: 0.8, ease: 'power2.out' }, '-=0.2');

        // --- Problema ---
        gsap.from('#problema .section__header', {
            scrollTrigger: {
                trigger: '#problema',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: 'power3.out',
        });

        gsap.utils.toArray('.problem-card').forEach((card, i) => {
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                y: 0,
                duration: 0.7,
                delay: i * 0.12,
                ease: 'power3.out',
            });
        });

        // --- Solução (Steps) ---
        gsap.from('#solucao .section__header', {
            scrollTrigger: {
                trigger: '#solucao',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: 'power3.out',
        });

        gsap.from('.steps-line', {
            scrollTrigger: {
                trigger: '.steps-timeline',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            scaleY: 0,
            transformOrigin: 'top center',
            duration: 1.5,
            ease: 'power2.out',
        });

        gsap.utils.toArray('.step').forEach((step, i) => {
            gsap.to(step, {
                scrollTrigger: {
                    trigger: step,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                x: 0,
                duration: 0.7,
                delay: i * 0.08,
                ease: 'power3.out',
            });
        });

        // --- Parceiros ---
        gsap.from('#parceiros .section__header', {
            scrollTrigger: {
                trigger: '#parceiros',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: 'power3.out',
        });

        gsap.utils.toArray('.partner-card').forEach((card, i) => {
            gsap.to(card, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                y: 0,
                duration: 0.6,
                delay: i * 0.1,
                ease: 'power3.out',
            });
        });

        // --- Impacto (Counters) ---
        gsap.from('#impacto .section__header', {
            scrollTrigger: {
                trigger: '#impacto',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: 'power3.out',
        });

        ScrollTrigger.create({
            trigger: '#impacto',
            start: 'top 70%',
            once: true,
            onEnter: () => animateCounters(),
        });

        // --- Blockchain ---
        gsap.from('#blockchain .section__header', {
            scrollTrigger: {
                trigger: '#blockchain',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 50,
            duration: 0.8,
            ease: 'power3.out',
        });

        gsap.from('.nft-card', {
            scrollTrigger: {
                trigger: '.nft-mockup',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            opacity: 0,
            y: 60,
            rotationY: 15,
            duration: 1,
            ease: 'power3.out',
        });

        gsap.utils.toArray('.blockchain-feature').forEach((feat, i) => {
            gsap.to(feat, {
                scrollTrigger: {
                    trigger: feat,
                    start: 'top 85%',
                    toggleActions: 'play none none none',
                },
                opacity: 1,
                x: 0,
                duration: 0.7,
                delay: i * 0.1,
                ease: 'power3.out',
            });
        });

        // --- NFT Card 3D tilt on scroll ---
        gsap.to('.nft-card', {
            scrollTrigger: {
                trigger: '#blockchain',
                start: 'top bottom',
                end: 'bottom top',
                scrub: 1,
            },
            rotationY: -8,
            rotationX: 5,
            ease: 'none',
        });

        // --- CTA ---
        gsap.to('.cta-content', {
            scrollTrigger: {
                trigger: '#cta',
                start: 'top 80%',
                toggleActions: 'play none none none',
            },
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: 'power3.out',
        });
    }

    // ========================================================
    // COUNTER ANIMATION
    // ========================================================
    function animateCounters() {
        const counters = document.querySelectorAll('.impact-card__number');
        counters.forEach((counter) => {
            const target = parseInt(counter.dataset.count, 10);
            const duration = 2000;
            const start = performance.now();

            function step(currentTime) {
                const elapsed = currentTime - start;
                const progress = Math.min(elapsed / duration, 1);

                // Ease out cubic
                const eased = 1 - Math.pow(1 - progress, 3);
                counter.textContent = Math.round(eased * target);

                if (progress < 1) {
                    requestAnimationFrame(step);
                }
            }

            requestAnimationFrame(step);
        });
    }

    // ========================================================
    // NAVIGATION
    // ========================================================
    function initNav() {
        // Hamburger toggle
        const hamburger = document.getElementById('hamburger');
        const mobileMenu = document.getElementById('mobileMenu');

        if (hamburger && mobileMenu) {
            hamburger.addEventListener('click', () => {
                hamburger.classList.toggle('active');
                mobileMenu.classList.toggle('open');
                document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
            });

            // Close menu on link click
            mobileMenu.querySelectorAll('a').forEach((link) => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    mobileMenu.classList.remove('open');
                    document.body.style.overflow = '';
                });
            });
        }

        // Smooth scroll for all anchor links
        document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    const offset = 80; // navbar height
                    const top = target.getBoundingClientRect().top + window.scrollY - offset;
                    window.scrollTo({ top, behavior: 'smooth' });
                }
            });
        });
    }

    // ========================================================
    // NFT CARD TILT (Mouse interaction)
    // ========================================================
    function initNFTTilt() {
        const nftCard = document.querySelector('.nft-card');
        if (!nftCard) return;

        const mockup = document.querySelector('.nft-mockup');

        mockup.addEventListener('mousemove', (e) => {
            const rect = mockup.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(nftCard, {
                rotationY: x * 15,
                rotationX: -y * 10,
                duration: 0.5,
                ease: 'power2.out',
            });
        });

        mockup.addEventListener('mouseleave', () => {
            gsap.to(nftCard, {
                rotationY: 0,
                rotationX: 0,
                duration: 0.8,
                ease: 'power3.out',
            });
        });
    }

    // ========================================================
    // INIT
    // ========================================================
    function init() {
        initThree();
        initGSAP();
        initNav();
        initNFTTilt();
    }

    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
