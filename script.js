(() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Theme
  const root = document.documentElement;
  const saved = localStorage.getItem("theme");
  if (saved) root.dataset.theme = saved;
  $("#themeBtn").addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    localStorage.setItem("theme", next);
  });

  // Mobile menu
  const menuBtn = $("#menuBtn");
  const menu = $("#menu");
  menuBtn.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", open);
  });
  $$("#menu a").forEach((a) => a.addEventListener("click", () => {
    menu.classList.remove("open");
    menuBtn.setAttribute("aria-expanded", "false");
  }));

  // Typed roles
  const roles = ["Machine Learning Engineer", "AI Engineer", "GenAI & Agentic Systems", "NeurIPS '23 Spotlight Author"];
  const typed = $("#typed");
  if (reduceMotion) {
    typed.textContent = roles[0];
  } else {
    let r = 0, c = 0, deleting = false;
    const tick = () => {
      const word = roles[r];
      typed.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 75;
      if (!deleting && c === word.length) { deleting = true; delay = 1600; }
      else if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
      c += deleting ? -1 : 1;
      setTimeout(tick, delay);
    };
    tick();
  }

  // Reveal on scroll
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (e.isIntersecting) { e.target.classList.add("visible"); io.unobserve(e.target); }
    });
  }, { threshold: 0.12 });
  $$(".reveal").forEach((el, i) => {
    el.style.transitionDelay = `${(i % 4) * 70}ms`;
    io.observe(el);
  });

  // Counters
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = +el.dataset.count;
      const prefix = el.dataset.prefix || "";
      const suffix = el.dataset.suffix || "";
      const start = performance.now();
      const dur = 1600;
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
        el.textContent = prefix + v.toLocaleString() + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      reduceMotion ? (el.textContent = prefix + target.toLocaleString() + suffix) : requestAnimationFrame(step);
      countIO.unobserve(el);
    });
  }, { threshold: 0.6 });
  $$("[data-count]").forEach((el) => countIO.observe(el));

  // Scroll progress + active nav link
  const progress = $("#progress");
  const sections = $$("main section[id]");
  const links = $$("#menu a");
  const onScroll = () => {
    const h = document.documentElement;
    progress.style.width = `${(h.scrollTop / (h.scrollHeight - h.clientHeight)) * 100}%`;
    const y = h.scrollTop + 140;
    let current = "";
    sections.forEach((s) => { if (s.offsetTop <= y) current = s.id; });
    links.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === `#${current}`));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  $("#year").textContent = new Date().getFullYear();

  // Neural-network canvas background
  const canvas = $("#bg-canvas");
  if (reduceMotion) { canvas.style.display = "none"; return; }
  const ctx = canvas.getContext("2d");
  let w, h, nodes = [];
  const mouse = { x: -999, y: -999 };

  const resize = () => {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + "px";
    canvas.style.height = innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const count = Math.min(90, Math.floor((innerWidth * innerHeight) / 17000));
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
    }));
  };
  resize();
  addEventListener("resize", resize);
  addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });

  const draw = () => {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    const light = root.dataset.theme === "light";
    const rgb = light ? "80,90,160" : "130,200,255";
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      a.x += a.vx; a.y += a.vy;
      if (a.x < 0 || a.x > innerWidth) a.vx *= -1;
      if (a.y < 0 || a.y > innerHeight) a.vy *= -1;
      ctx.beginPath();
      ctx.arc(a.x, a.y, 1.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${rgb},0.8)`;
      ctx.fill();
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d < 130) {
          ctx.strokeStyle = `rgba(${rgb},${0.22 * (1 - d / 130)})`;
          ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
        }
      }
      const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
      if (dm < 170) {
        ctx.strokeStyle = `rgba(167,139,250,${0.5 * (1 - dm / 170)})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
      }
    }
    requestAnimationFrame(draw);
  };
  draw();
})();
