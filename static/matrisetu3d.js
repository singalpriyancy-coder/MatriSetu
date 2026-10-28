/* MatriSetu 3D theme — background scene + card tilt. Purely visual; touches no page logic. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- card tilt (mouse devices only) ---------- */
  if (!reduce && matchMedia('(hover:hover) and (pointer:fine)').matches) {
    var SEL = '.stat-card,.stat,.kpi,.chart-card,.perf-card,.asha-perf-card,.scheme-card,.export-card,.child-card';
    document.addEventListener('pointermove', function (e) {
      var el = e.target.closest && e.target.closest(SEL);
      if (!el) return;
      var r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      el.classList.add('m3-tilt');
      el.style.transform = 'perspective(900px) rotateX(' + (-y * 7) + 'deg) rotateY(' + (x * 9) + 'deg) translateZ(8px)';
    });
    document.addEventListener('pointerout', function (e) {
      var el = e.target.closest && e.target.closest(SEL);
      if (el) el.style.transform = '';
    });
  }

  /* ---------- background scene ---------- */
  function boot() {
    var THREE = window.THREE; if (!THREE) return;
    var cv = document.createElement('canvas'); cv.id = 'm3-canvas'; document.body.prepend(cv);
    var ren;
    try { ren = new THREE.WebGLRenderer({ canvas: cv, antialias: true, alpha: true }); } catch (e) { cv.remove(); return; }
    ren.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    var sc = new THREE.Scene(), cam = new THREE.PerspectiveCamera(50, 1, .1, 120);
    sc.add(new THREE.AmbientLight(0x8a6cc0, .8));
    var Lr = new THREE.PointLight(0xff5c8a, 2, 60); Lr.position.set(8, 6, 6); sc.add(Lr);
    var Lt = new THREE.PointLight(0x35e0c2, 1.8, 60); Lt.position.set(-9, -3, 4); sc.add(Lt);
    var Lg = new THREE.PointLight(0xffb547, 1.1, 14); sc.add(Lg);
    var G = new THREE.Group(); sc.add(G);

    /* heart of the "setu" — pulsing core inside a lattice */
    var core = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1, 1),
      new THREE.MeshStandardMaterial({ color: 0xffb547, emissive: 0xff5c8a, emissiveIntensity: .45, flatShading: true, roughness: .5 }));
    var lat = new THREE.Mesh(new THREE.IcosahedronGeometry(1.9, 2),
      new THREE.MeshBasicMaterial({ color: 0xa78bfa, wireframe: true, transparent: true, opacity: .32 }));
    G.add(core, lat);

    /* five tiers = five orbit rings, each with a travelling bead */
    var tiers = [0x35e0c2, 0xffb547, 0xff5c8a, 0xa78bfa, 0xffffff], beads = [];
    tiers.forEach(function (c, i) {
      var r = 3.2 + i * .95;
      var ring = new THREE.Mesh(new THREE.TorusGeometry(r, .016, 8, 220), new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .5 }));
      ring.rotation.set(Math.PI / 2 + (i - 2) * .32, i * .55, 0);
      var bead = new THREE.Mesh(new THREE.SphereGeometry(.13, 16, 16), new THREE.MeshBasicMaterial({ color: c }));
      ring.add(bead); beads.push({ m: bead, r: r, s: .45 + i * .13, p: i * 1.4 }); G.add(ring);
    });

    /* floating village crystals, coloured by risk */
    var risk = [0x35e0c2, 0x35e0c2, 0xffb547, 0xff5c8a], gems = [], N = innerWidth < 700 ? 12 : 22;
    for (var k = 0; k < N; k++) {
      var c = risk[k % 4], m = new THREE.Mesh(new THREE.OctahedronGeometry(.16 + (k % 3) * .07),
        new THREE.MeshStandardMaterial({ color: c, emissive: c, emissiveIntensity: .6, flatShading: true }));
      var a = k / N * 6.283, rr = 7 + (k % 5) * .9;
      m.userData = { a: a, r: rr, y: (Math.random() - .5) * 6, s: .05 + Math.random() * .08, ph: Math.random() * 6 };
      G.add(m); gems.push(m);
    }

    /* star dust */
    var P = innerWidth < 700 ? 350 : 900, pos = new Float32Array(P * 3), col = new Float32Array(P * 3),
      pal = [[1, .36, .54], [1, .71, .28], [.21, .88, .76], [.65, .55, 1]];
    for (var i = 0; i < P; i++) {
      var rad = 10 + Math.random() * 26, th = Math.random() * 6.283;
      pos.set([Math.cos(th) * rad, (Math.random() - .5) * 30, Math.sin(th) * rad - 6], i * 3); col.set(pal[i % 4], i * 3);
    }
    var pg = new THREE.BufferGeometry();
    pg.setAttribute('position', new THREE.BufferAttribute(pos, 3)); pg.setAttribute('color', new THREE.BufferAttribute(col, 3));
    var dust = new THREE.Points(pg, new THREE.PointsMaterial({ size: .09, vertexColors: true, transparent: true, opacity: .85, blending: THREE.AdditiveBlending, depthWrite: false }));
    sc.add(dust);

    function size() {
      var w = innerWidth, h = innerHeight; ren.setSize(w, h, false); cam.aspect = w / h;
      cam.position.set(0, 0, w < 700 ? 20 : 15); cam.updateProjectionMatrix();
    }
    addEventListener('resize', size); size();

    var mx = 0, my = 0, sy = 0, t0 = performance.now(), run = true;
    addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
    addEventListener('scroll', function () { sy = scrollY; }, { passive: true });
    document.addEventListener('visibilitychange', function () { run = !document.hidden; if (run) loop(performance.now()); });

    function loop(now) {
      if (!run) return;
      var t = (now - t0) / 1000;
      G.rotation.y = reduce ? .4 : t * .12 + sy * .0012;
      G.rotation.x = Math.sin(t * .15) * .12 + sy * .0004;
      core.scale.setScalar(.85 + Math.sin(t * 2.2) * .06); core.rotation.y = t * .5; lat.rotation.x = t * .2;
      Lg.intensity = 1.1 + Math.sin(t * 2.2) * .35;
      beads.forEach(function (b) { var a = t * b.s + b.p; b.m.position.set(Math.cos(a) * b.r, Math.sin(a) * b.r, 0); });
      gems.forEach(function (g) {
        var d = g.userData, a = d.a + t * d.s; g.position.set(Math.cos(a) * d.r, d.y + Math.sin(t + d.ph) * .4, Math.sin(a) * d.r);
        g.rotation.x = t * .6 + d.ph; g.rotation.y = t * .4;
      });
      dust.rotation.y = t * .015;
      cam.position.x += (mx * 2.2 - cam.position.x) * .04; cam.position.y += (-my * 1.6 - cam.position.y) * .04; cam.lookAt(0, 0, 0);
      ren.render(sc, cam);
      if (!reduce) requestAnimationFrame(loop);
    }
    loop(performance.now()); requestAnimationFrame(function () { cv.classList.add('on'); });
  }

  var s = document.createElement('script');
  s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
  s.onload = boot; document.head.appendChild(s);
})();
