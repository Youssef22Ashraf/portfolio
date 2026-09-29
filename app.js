/**
 * Youssef Ashraf ElNaggar - DevOps Portfolio Interactivity
 * High-performance, modular ES6 script
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initParticleNetwork();
  initAnimatedStats();
  initSkillsFilter();
  initTerminal();
  initModals();
  initPipelineSimulator();
  initClipboardAndToasts();
  initMobileNav();
  initLanguage();
  initResumeTabs();
});

/* ==========================================================================
   0. Theme Toggle (Dark / Light Mode)
   ========================================================================== */
function initThemeToggle() {
  const toggleBtn = document.getElementById('theme-toggle');
  const html = document.documentElement;

  // Retrieve saved preference or default to dark
  const savedTheme = localStorage.getItem('yn-devops-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme') || 'dark';
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('yn-devops-theme', newTheme);
      showToast(`Switched to ${newTheme} theme`);
    });
  }
}

/* ==========================================================================
   1. Cloud Infrastructure Particle Mesh Canvas
   ========================================================================== */
function initParticleNetwork() {
  const canvas = document.getElementById('cloud-network-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const nodeCount = Math.min(Math.floor(window.innerWidth / 26), 40);
  const nodes = [];

  for (let i = 0; i < nodeCount; i++) {
    nodes.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.8 + 1,
      color: i % 4 === 0 ? '#00f2fe' : i % 7 === 0 ? '#10b981' : '#38bdf8'
    });
  }

  let mouse = { x: null, y: null, maxDist: 120 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = null;
    mouse.y = null;
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < nodes.length; i++) {
      const p = nodes[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = p.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Connect nearby nodes
      for (let j = i + 1; j < nodes.length; j++) {
        const p2 = nodes[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          const alpha = (1 - dist / 130) * 0.15;
          ctx.strokeStyle = `rgba(0, 242, 254, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      }

      // Connect to mouse
      if (mouse.x !== null && mouse.y !== null) {
        const mdx = p.x - mouse.x;
        const mdy = p.y - mouse.y;
        const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mdist < mouse.maxDist) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(mouse.x, mouse.y);
          const alpha = (1 - mdist / mouse.maxDist) * 0.25;
          ctx.strokeStyle = `rgba(56, 189, 248, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }

  render();
}

/* ==========================================================================
   2. Animated Metrics Counter with IntersectionObserver
   ========================================================================== */
function initAnimatedStats() {
  const statElements = document.querySelectorAll('.stat-num');
  if (!statElements.length) return;

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseFloat(el.getAttribute('data-target'));
        const suffix = el.getAttribute('data-suffix') || '';
        const isDecimal = el.getAttribute('data-decimal') === 'true';
        
        animateCounter(el, target, suffix, isDecimal);
        obs.unobserve(el);
      }
    });
  }, { threshold: 0.2 });

  statElements.forEach(el => observer.observe(el));
}

function animateCounter(element, target, suffix, isDecimal) {
  const duration = 1600;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Ease-out cubic
    const easeOut = 1 - Math.pow(1 - progress, 3);
    const currentVal = target * easeOut;

    if (isDecimal) {
      element.textContent = currentVal.toFixed(2) + suffix;
    } else if (target % 1 !== 0) {
      element.textContent = currentVal.toFixed(1) + suffix;
    } else {
      element.textContent = Math.floor(currentVal) + suffix;
    }

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      element.textContent = (isDecimal ? target.toFixed(2) : target) + suffix;
    }
  }

  requestAnimationFrame(update);
}

/* ==========================================================================
   3. Skills Matrix Filtering
   ========================================================================== */
function initSkillsFilter() {
  const buttons = document.querySelectorAll('.skills-filter .filter-btn');
  const cards = document.querySelectorAll('.skills-grid .skill-card');

  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      cards.forEach(card => {
        const category = card.getAttribute('data-category');
        if (filter === 'all' || category === filter) {
          card.style.display = 'block';
          card.style.opacity = '0';
          setTimeout(() => {
            card.style.opacity = '1';
          }, 20);
        } else {
          card.style.display = 'none';
        }
      });
    });
  });
}

/* ==========================================================================
   4. Interactive DevOps Terminal Simulator
   ========================================================================== */
function initTerminal() {
  const input = document.getElementById('terminal-input');
  const output = document.getElementById('terminal-output');
  const sendBtn = document.getElementById('terminal-submit-btn');
  const clearBtn = document.getElementById('term-clear-btn');
  const pills = document.querySelectorAll('.terminal-quick-pills button');

  if (!input || !output) return;

  const commands = {
    help: `Available simulated commands:
  • <span class="highlight">skills</span>       - List cloud infrastructure & automation capabilities
  • <span class="highlight">projects</span>     - Display flagship deployed case studies
  • <span class="highlight">kubectl</span>      - Run Kubernetes inspection ('kubectl get pods')
  • <span class="highlight">docker</span>       - View container optimization stats ('docker stats')
  • <span class="highlight">metrics</span>      - High-impact engineering numbers
  • <span class="highlight">contact</span>      - Get direct email, phone, and profiles
  • <span class="highlight">resume</span>       - Quick text summary of credentials
  • <span class="highlight">deploy</span>       - Simulate a zero-downtime microservices rollout
  • <span class="highlight">clear</span>        - Clear terminal window buffer`,

    skills: `[CLOUD & ORCHESTRATION]
  • AWS: EKS, EC2, S3, IAM, VPC
  • GCP: Google Cloud Run (zero-downtime serverless rollouts)
  • Containers: Docker, Docker Compose, Multi-stage builds (-97.5% size)
  • Orchestration: Kubernetes (StatefulSets, PVCs, ConfigMaps, Ingress, NodePort)
  • Infrastructure as Code: Terraform, Ansible playbooks (200+ machines)

[CI/CD & OBSERVABILITY]
  • Automation: Jenkins, GitHub Actions, Linux (Ubuntu, Alpine, Debian)
  • Monitoring: Prometheus, Grafana, Sentry APM, ELK Stack, PromQL
  • Languages: Go (Golang), Python, Bash Scripting, TypeScript, JavaScript, SQL`,

    projects: `[FLAGSHIP ARCHITECTED CASE STUDIES]
  1. Workplace Assessment & Live Proctoring Platform (Client: Mofarreh Group)
     - Socket.IO auditing, React 19 & Express in Alpine Docker, deployed to Railway with Sentry.
  2. AI-driven Energy Optimization Framework (Nile University Graduation Project)
     - Python backend, RAG/LLM microservices, GitHub Actions CI/CD to Google Cloud Run.
  3. Hybrid Multi-Tier & Microservices Deployment (DEPI Graduation Project)
     - AWS EKS, Terraform IaC, Jenkins on EC2 via Ansible, KubeSeal, Prometheus & Grafana.
  4. High-Performance Go Microservice with Redis & Kubernetes (DEPI Program)
     - 97.5% image size cut (1GB -> 24.5MB), StatefulSets, Persistent Volume Claims.`,

    'kubectl get pods': `NAME                                READY   STATUS    RESTARTS   AGE    IP
pod/proctoring-api-7b89f478-xd9q2   1/1     Running   0          4d2h   10.244.1.42
pod/energy-rag-worker-59c476-mn81k  1/1     Running   0          6d1h   10.244.2.19
pod/bookstore-auth-c7f89d-kl93p     1/1     Running   0          12d    10.244.1.88
pod/bookstore-catalog-88f5b-zq11a   1/1     Running   0          12d    10.244.3.05
pod/go-redis-cache-statefulset-0    1/1     Running   0          18d    10.244.2.11
pod/prometheus-server-54d98f-v88n   1/1     Running   0          25d    10.244.0.14`,

    'docker stats': `CONTAINER ID   NAME               CPU %     MEM USAGE / LIMIT     MEM %     IMAGE SIZE
a1f8c9284e31   go-redis-cache     0.38%     12.4MiB / 2.00GiB     0.60%     24.5MB (Optimized!)
b38e7f129aa2   energy-rag-api     1.12%     88.2MiB / 4.00GiB     2.15%     142MB
c991823d14e0   proctor-node-app   0.85%     44.6MiB / 2.00GiB     2.18%     65MB Alpine`,

    metrics: `[ENGINEERING IMPACT METRICS]
  ★ 97.5% Docker image reduction for Go microservice (1GB down to 24.5MB)
  ★ 200+ CI host machines configured with persistent secure SSH & Ansible
  ★ 40% reduction in manual engineer intervention via Docker/Jenkins CI
  ★ 80% decrease in repository sync errors via Ansible playbooks & Nexus
  ★ 3.95 / 4.00 Cumulative GPA (Graduated with Highest Honors from Nile University)`,

    'open resume': () => { window.open('Youssef-Ashraf-Resume.pdf?v=2.7', '_blank'); return '✓ Opened official resume PDF in a new browser tab.'; },
    'cat resume.txt': `========================================================================
YOUSSEF ASHRAF ELNAGGAR | DEVOPS & CLOUD INFRASTRUCTURE ENGINEER
========================================================================
Availability: Available for Immediate Full-Time Employment
Location: 6th October, Giza / Cairo, Egypt
Education: Nile University, B.Sc. in Computer Science (GPA: 3.95/4.00 - Highest Honors)
Experience: DevOps Intern @ Valeo | DevOps Intern @ STEM Center | Valeo Automation
Certifications: DEPI DevOps Diploma (MCIT), KodeKloud, Valeo GISACC, Dean's Honors
Email: youssef.ashraf.elnaggar@gmail.com | Phone: 01026735485
[DOWNLOAD OFFICIAL PDF]: Click top button or type 'open resume'`,

    contact: `[DIRECT CONTACT DETAILS]
  • Email:    youssef.ashraf.elnaggar@gmail.com
  • Phone:    +20 01026735485 (Available on WhatsApp)
  • Location: 6th October, Giza, Egypt (Open to Remote & Relocation)
  • LinkedIn: https://www.linkedin.com/in/youssef-ashraf-el-naggar/
  • GitHub:   https://github.com/Youssef22Ashraf`,

    deploy: `[SIMULATING PRODUCTION CLOUD ROLLOUT]
  [00:01] Pulling Git commit 'feat: cloud-native-scalability'
  [00:02] Running unit tests and security linting: PASSED (100%)
  [00:03] Building multi-stage Alpine container: 24.5MB created
  [00:04] Applying Terraform manifests to cloud ingress
  [00:05] Rolling out zero-downtime canary deployment: 100% traffic shifted
  [00:06] Prometheus health check: STATUS 200 OK (Latency: 9ms)
  ✓ DEPLOYMENT SUCCEEDED WITH ZERO DOWNTIME!`
  };

  function executeCommand(rawCmd) {
    const cmd = rawCmd.trim();
    if (!cmd) return;

    // Echo user command
    const userLine = document.createElement('div');
    userLine.className = 'term-line user-cmd';
    userLine.innerHTML = `<span class="terminal-prompt">youssef@k8s:~$</span> ${escapeHtml(cmd)}`;
    output.appendChild(userLine);

    const lowerCmd = cmd.toLowerCase();
    const respLine = document.createElement('div');
    respLine.className = 'term-line output';

    if (lowerCmd === 'clear') {
      output.innerHTML = '';
      return;
    } else if (commands[lowerCmd]) {
      respLine.innerHTML = commands[lowerCmd].replace(/\n/g, '<br/>');
    } else if (lowerCmd.startsWith('kubectl')) {
      respLine.innerHTML = commands['kubectl get pods'].replace(/\n/g, '<br/>');
    } else if (lowerCmd.startsWith('docker')) {
      respLine.innerHTML = commands['docker stats'].replace(/\n/g, '<br/>');
    } else if (lowerCmd.includes('resume')) {
      respLine.innerHTML = commands['cat resume.txt'].replace(/\n/g, '<br/>');
    } else {
      respLine.innerHTML = `Command not recognized: '<span class="highlight">${escapeHtml(cmd)}</span>'. Type <span class="highlight">help</span> for a list of commands.`;
    }

    output.appendChild(respLine);
    output.scrollTop = output.scrollHeight;
  }

  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      executeCommand(input.value);
      input.value = '';
    }
  });

  if (sendBtn) {
    sendBtn.addEventListener('click', () => {
      executeCommand(input.value);
      input.value = '';
      input.focus();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      output.innerHTML = '';
    });
  }

  pills.forEach(pill => {
    pill.addEventListener('click', () => {
      const cmd = pill.getAttribute('data-cmd');
      executeCommand(cmd);
      output.scrollTop = output.scrollHeight;
    });
  });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ==========================================================================
   5. Architecture Blueprints & Resume Modals (<dialog>)
   ========================================================================== */
function initModals() {
  const openButtons = document.querySelectorAll('[data-modal]');
  const closeButtons = document.querySelectorAll('.close-modal-btn');
  const viewResumeBtn = document.getElementById('view-resume-btn');
  const heroResumeBtn = document.getElementById('hero-resume-btn');
  const printResumeBtn = document.getElementById('print-resume-btn');

  function openResume() {
    const resumeModal = document.getElementById('modal-resume');
    if (resumeModal && typeof resumeModal.showModal === 'function') {
      resumeModal.showModal();
      // On mobile screens, activate Interactive Web View for optimal readability
      if (window.innerWidth <= 768) {
        const tabText = document.getElementById('tab-btn-text');
        if (tabText) tabText.click();
      }
    }
  }

  openButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-modal');
      const dialog = document.getElementById(modalId);
      if (dialog && typeof dialog.showModal === 'function') {
        dialog.showModal();
      }
    });
  });

  if (viewResumeBtn) viewResumeBtn.addEventListener('click', openResume);
  if (heroResumeBtn) heroResumeBtn.addEventListener('click', openResume);

  if (printResumeBtn) {
    printResumeBtn.addEventListener('click', () => {
      window.print();
    });
  }

  closeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const modalId = btn.getAttribute('data-close');
      const dialog = document.getElementById(modalId);
      if (dialog && typeof dialog.close === 'function') {
        dialog.close();
      }
    });
  });

  // Light dismiss on backdrop click
  document.querySelectorAll('dialog.arch-modal').forEach(dialog => {
    dialog.addEventListener('click', (event) => {
      const rect = dialog.getBoundingClientRect();
      const isInDialog = (
        rect.top <= event.clientY &&
        event.clientY <= rect.top + rect.height &&
        rect.left <= event.clientX &&
        event.clientX <= rect.left + rect.width
      );
      if (!isInDialog) {
        dialog.close();
      }
    });
  });
}

/* ==========================================================================
   6. Live Simulated Pipeline Re-run Trigger
   ========================================================================== */
function initPipelineSimulator() {
  const rerunBtn = document.getElementById('retrigger-pipeline-btn');
  const ticker = document.querySelector('.pipeline-log-ticker');
  const steps = [
    { id: 'step-commit', log: 'Git commit detected: syncing changes from main' },
    { id: 'step-build', log: 'Compiling Docker multi-stage Alpine image (24.5MB)' },
    { id: 'step-iac', log: 'Verifying Terraform state lock and Ansible secrets' },
    { id: 'step-deploy', log: 'Rolling out canary instances: 0 downtime achieved' }
  ];

  if (!rerunBtn) return;

  rerunBtn.addEventListener('click', () => {
    rerunBtn.disabled = true;
    rerunBtn.style.opacity = '0.5';

    // Reset steps
    steps.forEach(s => {
      const el = document.getElementById(s.id);
      if (el) {
        el.classList.remove('completed', 'pulse-stage');
        el.style.opacity = '0.4';
      }
    });

    let current = 0;
    function nextStep() {
      if (current < steps.length) {
        const item = steps[current];
        const el = document.getElementById(item.id);
        if (el) {
          el.classList.add('completed');
          el.style.opacity = '1';
        }
        if (ticker) {
          ticker.innerHTML = `<span class="prompt-arrow">&gt;</span> ${item.log}`;
        }
        current++;
        setTimeout(nextStep, 600);
      } else {
        const deployEl = document.getElementById('step-deploy');
        if (deployEl) deployEl.classList.add('pulse-stage');
        if (ticker) {
          ticker.innerHTML = `<span class="prompt-arrow">&gt;</span> [Prometheus] All pods healthy (p99 latency < 14ms)`;
        }
        rerunBtn.disabled = false;
        rerunBtn.style.opacity = '1';
        showToast('✓ Pipeline rollout completed successfully!');
      }
    }

    nextStep();
  });
}

/* ==========================================================================
   7. 1-Click Clipboard Copying & Toast Notifications
   ========================================================================== */
function initClipboardAndToasts() {
  const copyButtons = document.querySelectorAll('.copy-btn[data-copy]');

  copyButtons.forEach(btn => {
    btn.addEventListener('click', async () => {
      const textToCopy = btn.getAttribute('data-copy');
      if (!textToCopy) return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        showToast(`Copied to clipboard: ${textToCopy}`);
      } catch (err) {
        const temp = document.createElement('textarea');
        temp.value = textToCopy;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        showToast(`Copied: ${textToCopy}`);
      }
    });
  });
}

function showToast(message) {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 2800);
}

/* ==========================================================================
   8. Mobile Navigation Drawer
   ========================================================================== */
function initMobileNav() {
  const toggle = document.getElementById('mobile-menu-toggle');
  const drawer = document.getElementById('mobile-drawer');
  const links = document.querySelectorAll('.mobile-link');

  if (!toggle || !drawer) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = drawer.classList.contains('open');
    if (isOpen) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    } else {
      drawer.classList.add('open');
      drawer.setAttribute('aria-hidden', 'false');
    }
  });

  links.forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    });
  });

  document.addEventListener('click', (e) => {
    if (drawer.classList.contains('open') && !drawer.contains(e.target) && !toggle.contains(e.target)) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      drawer.classList.remove('open');
      drawer.setAttribute('aria-hidden', 'true');
    }
  });
}


/* ==========================================================================
   Bilingual Support (Arabic & English) with Full RTL
   ========================================================================== */
const TRANSLATIONS = {
  en: {
  "brand-name": "Youssef Ashraf El-Naggar",
  "nav-about": "<span class=\"nav-num\">01</span>About",
  "nav-projects": "<span class=\"nav-num\">02</span>Projects",
  "nav-experience": "<span class=\"nav-num\">03</span>Experience",
  "nav-skills": "<span class=\"nav-num\">04</span>Skills",
  "nav-certificates": "<span class=\"nav-num\">05</span>Certifications",
  "nav-recommendations": "<span class=\"nav-num\">06</span>Endorsements",
  "nav-cli": "<span class=\"cmd-icon\">&gt;_</span> CLI",
  "nav-hire": "Hire Me",
  "hero-pulse": "<span class=\"pulse-dot\"></span> Open to Work &bull; DevOps &bull; Cairo, Egypt",
  "hero-gpa": "Highest Honors (GPA 3.95/4.00)",
  "hero-title": "Scaling Resilient Cloud Infrastructure with <span class=\"gradient-text\">Zero Downtime</span> &amp; Precision Automation.",
  "hero-subtitle": "I’m <strong>Youssef Ashraf ElNaggar</strong> &mdash; a <strong>DevOps &amp; Cloud Infrastructure Engineer</strong> graduated with Highest Honors from Nile University. Experienced at <strong>Valeo</strong> and <strong>DEPI (MCIT)</strong>, I engineer automated CI/CD pipelines, container orchestration, and declarative infrastructure with high operational excellence.",
  "hero-btn-resume": "View Official Résumé (PDF) ↗",
  "hero-btn-preview": "Modal Preview",
  "hero-btn-download": "Download PDF",
  "hero-stat-1-label": "Image Footprint Slashed (Go/Docker)",
  "hero-stat-2-label": "CI Nodes &amp; Machines Orchestrated",
  "hero-stat-3-label": "Manual Effort Cut with Pipelines",
  "hero-stat-4-label": "Cumulative GPA (Highest Honors)",
  "about-tag": "01 // ENGINEERING PROFILE",
  "about-title": "Bridging Development &amp; Cloud Operations",
  "about-desc": "With hands-on experience at industry leaders like <strong>Valeo</strong>, government initiatives like <strong>DEPI (MCIT)</strong>, and highest academic honors from Nile University, I turn manual deployments into deterministic, observable, automated cloud platforms.",
  "bento-role": "DevOps &amp; Cloud Infrastructure Engineer",
  "bento-based-lbl": "Based in",
  "bento-based-val": "6th October, Giza / Cairo, Egypt",
  "bento-edu-lbl": "Education",
  "bento-edu-val": "Nile University (Class of 2025)",
  "bento-lang-lbl": "Languages",
  "bento-lang-val": "Arabic (Native) &bull; English (Fluent)",
  "bento-avail-lbl": "Availability",
  "bento-avail-val": "Immediate Full-Time Hire",
  "bento-acad-title": "Nile University &mdash; Highest Honors",
  "pillar-1-title": "Cloud &amp; Kubernetes Architecture",
  "pillar-2-title": "CI/CD &amp; Infrastructure as Code",
  "pillar-3-title": "Observability &amp; SRE Mindset",
  "pillar-4-title": "Systems Programming &amp; Optimization",
  "proj-tag": "02 // PRODUCTION CASE STUDIES",
  "proj-title": "Architected &amp; Deployed Projects",
  "proj-desc": "Deep dive into scalable cloud architectures, container optimizations, and zero-downtime microservices.",
  "proj-1-badge": "Client: Mofarreh Group",
  "proj-1-title": "Workplace Assessment &amp; Live Proctoring Platform",
  "proj-1-summary": "Architected and deployed a mission-critical assessment platform featuring real-time Socket.IO supervisor auditing, server-side exam scoring, and anti-cheat tab-blur monitoring.",
  "proj-1-h1": "Webcam proctoring via MediaRecorder &amp; IndexedDB chunk buffering",
  "proj-1-h2": "Containerized React 19 &amp; Express with multi-stage Alpine Docker",
  "proj-1-h3": "Deployed to Railway production with Sentry APM error diagnostics",
  "proj-2-badge": "Nile Univ Graduation Project",
  "proj-2-title": "AI-driven Energy Optimization Framework",
  "proj-2-summary": "Built and containerized the scalable Python backend handling IDF architectural design files, 2D/3D visualizations, and RAG/LLM pipelines. Automated full CI/CD to Google Cloud Run.",
  "proj-2-h1": "Automated end-to-end CI/CD via GitHub Actions",
  "proj-2-h2": "Zero-downtime serverless container rollouts on Google Cloud Run",
  "proj-2-h3": "Secure ingress critical for live RAG/LLM platform operations",
  "proj-3-badge": "DEPI Graduation Project",
  "proj-3-title": "Hybrid Multi-Tier &amp; Microservices Deployment",
  "proj-3-summary": "End-to-end cloud infrastructure for a distributed bookstore microservices application. Provisioned with Terraform on AWS EKS and automated via Jenkins on EC2.",
  "proj-3-h1": "Infrastructure as Code on AWS using modular Terraform scripts",
  "proj-3-h2": "Configured Jenkins CI/CD on EC2 via automated Ansible playbooks",
  "proj-3-h3": "Hardened secrets with KubeSeal; Prometheus &amp; Grafana observability",
  "proj-4-badge": "DEPI Program",
  "proj-4-title": "High-Performance Go Microservice with Redis &amp; K8s",
  "proj-4-summary": "Engineered an ultra-lean caching microservice in Go. Slashed container footprint by 97.5% through multi-stage compilation and deployed resilient StatefulSets on Kubernetes.",
  "proj-4-h1": "Reduced image size by <strong>97.5%</strong> (1 GB &rarr; 24.5 MB)",
  "proj-4-h2": "Configured StatefulSets, PVCs, ConfigMaps, and NodePort services",
  "proj-4-h3": "Low-latency persistent caching layer under simulated heavy traffic",
  "proj-blueprint-btn": "Architecture Blueprint &rarr;",
  "labs-tag": "// CONTINUOUS PRACTICE &amp; REPOSITORIES",
  "labs-title": "Open Source DevOps Labs &amp; Technical Explorations",
  "labs-gh-link": "View All Repositories on GitHub <span>↗</span>",
  "lab-1-tag": "Docker &bull; Containerization",
  "lab-1-title": "Docker Multi-Stage &amp; Networking Labs",
  "lab-1-desc": "Comprehensive repository of containerization practical drills: custom multi-stage Dockerfiles, volume persistence, bridge/host networking, and Docker Compose orchestration.",
  "lab-2-tag": "Kubernetes &bull; Orchestration",
  "lab-2-title": "Kubernetes Manifests &amp; Cluster Architecture",
  "lab-2-desc": "Production-patterned K8s manifests covering Deployments, StatefulSets, PersistentVolumeClaims, Ingress routing, ConfigMaps, Secrets, and RBAC security models.",
  "lab-3-tag": "Scripting &bull; Process Automation",
  "lab-3-badge": "Valeo Automation",
  "lab-3-title": "Enterprise Automation &amp; Metrics Dashboard",
  "lab-3-desc": "Automated internal reporting, analytical gauge models, and task health tracking scripts saving team leads 4+ hours per week on manual project monitoring.",
  "exp-tag": "03 // CAREER MILESTONES",
  "exp-title": "Professional Work Experience",
  "exp-desc": "Delivering measurable automation, high availability, and stability in fast-paced engineering teams.",
  "exp-1-role": "DevOps Engineer Intern",
  "exp-1-comp": "Valeo &bull; Cairo, Egypt",
  "exp-1-b1": "Automated multi-OS Docker image builds and CI workflows using <strong>Bash, Python, and Jenkins</strong>, slashing manual engineer intervention by <strong>40%</strong>.",
  "exp-1-b2": "Maintained persistent, secure SSH connectivity across <strong>200+ machines</strong>, eliminating deployment dropouts and system accessibility bottlenecks.",
  "exp-1-b3": "Automated Git version upgrades across CI nodes and synchronized artifact management in <strong>Nexus</strong> via <strong>Ansible playbooks</strong>, decreasing repository sync errors by <strong>80%</strong>.",
  "exp-1-b4": "Standardized CI environment roles and variable auditing using Ansible, boosting debugging and triage efficiency by <strong>50%</strong>.",
  "exp-2-role": "DevOps Engineer Intern",
  "exp-2-comp": "STEM Entrepreneurship Center &bull; Cairo, Egypt",
  "exp-2-b1": "Containerized multi-service applications using <strong>Docker</strong> and automated continuous deployment pipelines with <strong>Jenkins</strong>.",
  "exp-2-b2": "Conducted practical workshops and technical mentorship on container best practices, Git branching strategies, and CI/CD pipelines for emerging engineers.",
  "exp-3-role": "Software &amp; Process Automation Intern",
  "exp-3-comp": "Valeo &bull; Cairo, Egypt",
  "exp-3-b1": "Automated internal project management reports and analytics dashboards using <strong>JavaScript / Google Apps Script</strong>, reducing manual reporting overhead by <strong>60%</strong>.",
  "exp-3-b2": "Built visual analytical tracking models (gauge &amp; pie charts), saving team leads <strong>4+ hours per week</strong> on manual calculations and status compiling.",
  "skills-tag": "04 // TECHNICAL ARSENAL",
  "skills-title": "Technical Skills &amp; Cloud Arsenal",
  "skills-desc": "Technologies and tools I implement in production environments every day.",
  "filter-all": "All Tools",
  "filter-cloud": "Cloud &amp; Orchestration",
  "filter-cicd": "CI/CD &amp; Automation",
  "filter-obs": "Observability",
  "filter-scripting": "Scripting &amp; Data",
  "skill-1-tag": "Container",
  "skill-1-exp": "Production",
  "skill-1-desc": "Multi-stage alpine builds, volume persistence, network isolation, 97.5% size cuts.",
  "skill-2-tag": "Orchestration",
  "skill-2-exp": "Advanced",
  "skill-2-desc": "Deployments, StatefulSets, PVCs, ConfigMaps, Ingress, NodePort, KubeSeal secrets.",
  "skill-3-tag": "Cloud Provider",
  "skill-3-exp": "Production",
  "skill-3-desc": "EKS, EC2 instances, S3 storage buckets, IAM least-privilege security policies.",
  "skill-4-tag": "Serverless Cloud",
  "skill-4-exp": "Production",
  "skill-4-desc": "Google Cloud Run zero-downtime microservice deployments, secure ingress, auto-scaling.",
  "skill-5-tag": "IaC",
  "skill-5-exp": "Production",
  "skill-5-desc": "Declarative infrastructure provisioning, repeatable cloud states, state locking.",
  "skill-6-tag": "Configuration",
  "skill-6-exp": "Valeo Proven",
  "skill-6-desc": "Managed 200+ host nodes, playbook orchestration, automated Git/Nexus upgrades.",
  "skill-7-tag": "Pipeline",
  "skill-7-exp": "Advanced",
  "skill-7-desc": "Declarative pipelines, automated multi-OS builds, distributed agent architecture.",
  "skill-8-tag": "Modern CI/CD",
  "skill-8-exp": "Production",
  "skill-8-desc": "Automated build, test, and container push workflows directly connected to GCP/AWS.",
  "skill-9-tag": "OS &amp; SysAdmin",
  "skill-9-exp": "Deep Knowledge",
  "skill-9-desc": "Ubuntu / Alpine / Debian, persistent SSH tunnels, systemd, permission auditing.",
  "skill-10-tag": "Metrics",
  "skill-10-exp": "Production",
  "skill-10-desc": "Service discovery, custom scrapers, PromQL alerting rules, metric collection.",
  "skill-11-tag": "Dashboards",
  "skill-11-exp": "Production",
  "skill-11-desc": "Real-time health visualization, cluster telemetry, SLA/SLO tracking, alert channels.",
  "skill-12-tag": "APM &amp; Logs",
  "skill-12-exp": "Production",
  "skill-12-desc": "Real-time crash diagnostics, distributed tracing, centralized log management.",
  "skill-13-tag": "Language",
  "skill-13-exp": "Systems",
  "skill-13-desc": "High-concurrency microservices, lightweight binary compilation, Redis integration.",
  "skill-14-tag": "Scripting &amp; AI",
  "skill-14-exp": "Advanced",
  "skill-14-desc": "Automation CLI scripts, RAG/LLM backends, OS cron jobs, data pipelines.",
  "skill-15-tag": "Caching &amp; DB",
  "skill-15-exp": "Production",
  "skill-15-desc": "In-memory caching with StatefulSets &amp; PVCs, relational schemas, Prisma ORM.",
  "skill-16-tag": "Full-Stack Interop",
  "skill-16-exp": "Proficient",
  "skill-16-desc": "Socket.IO real-time supervisors, Express REST APIs, modern web interfaces.",
  "certs-tag": "05 // CREDENTIALS &amp; RECOGNITION",
  "certs-title": "Certifications &amp; Honors",
  "certs-desc": "Recognized for technical competence, government training programs, and academic excellence.",
  "cert-valeo-org": "Valeo &bull; GISACC Department",
  "cert-valeo-title": "DevOps Engineer Internship Certificate",
  "cert-valeo-desc": "Awarded for successfully executing CI/CD automation, Ansible standardization across 200+ machines, and Docker containerization during Summer 2024.",
  "cert-depi-org": "Egyptian Ministry of Communications &amp; IT",
  "cert-depi-title": "DEPI DevOps Engineering Diploma",
  "cert-depi-desc": "Intensive practical training program in AWS, Kubernetes, Terraform IaC, Jenkins, Ansible, and Prometheus/Grafana monitoring.",
  "cert-kk-org": "KodeKloud",
  "cert-kk-title": "Fundamentals of DevOps",
  "cert-kk-desc": "Mastery of DevOps culture, continuous delivery pipelines, LEAN infrastructure practices, and cloud automation metrics.",
  "cert-dean-org": "Nile University &bull; Dean's Honor",
  "cert-dean-title": "Dean's List Academic Excellence Certificate",
  "cert-dean-desc": "Awarded by Dr. Ahmed El-Mahdy, Dean of the School of Information Technology and Computer Science, for top semester academic distinction.",
  "cert-photo-org": "Nile University &bull; Dean School of Business",
  "cert-photo-title": "1st Place Winner &mdash; Photography Competition",
  "cert-photo-desc": "Special award from Dr. Hassan Aly recognizing creative eye, precision, and visual composition excellence.",
  "recs-tag": "06 // PROFESSIONAL ENDORSEMENTS",
  "recs-title": "Recommendations from Leaders &amp; Engineers",
  "recs-desc": "Direct feedback from managers, startup co-founders, university faculty, and senior engineering colleagues on LinkedIn.",
  "rec-1-quote": "Professionalism, good programmer, hard worker.",
  "rec-1-rel": "Managed Youssef directly",
  "rec-2-quote": "Throughout our time together at Nile University and collaborating across multiple engineering projects, Youssef has consistently impressed me with his intelligence, dedication, and work ethic. He is a quick learner, eager to take on new challenges, and a great team player. He has a strong foundation in computer science fundamentals and is able to think critically and solve problems creatively.",
  "rec-2-rel": "Classmates &amp; Project Collaborator",
  "rec-3-quote": "Youssef consistently demonstrated an exceptional aptitude for Advanced Computing and a strong work ethic. He exhibited a deep understanding of complex computational concepts and was always eager to take on challenging assignments. His passion for learning, problem-solving skills, and dedication make him a standout student who will undoubtedly excel and make a positive impact in the industry.",
  "rec-3-rel": "Instructor to Youssef",
  "rec-4-quote": "Youssef is one of the most exceptional students I have encountered in my years of teaching. He impressed me with his ability to articulate difficult concepts and his team leadership during our semester project. His caring nature allows him to work well in team settings, respecting everyone's opinions. He is talented, intuitive, dedicated, and focused in his pursuits.",
  "rec-4-rel": "Course Instructor / TA",
  "rec-5-quote": "Youssef is an excellent student that works so hard. He has great coding skills and problem solving in many languages like Python and C++. Also, he got many soft skills that makes him fit for any role that requires both technical and soft skills.",
  "rec-5-rel": "Teaching Assistant",
  "rec-6-quote": "He is a very clever student with high skills, he is diligent and hardworking.",
  "rec-6-rel": "Teacher / Academic Mentor",
  "rec-7-quote": "I have had the pleasure of knowing Youssef for 3 years, and I have been consistently impressed by his intelligence, dedication, and passion for computer science. He is a creative and innovative thinker and an asset to any team or organization.",
  "rec-7-rel": "Classmates (3+ Years)",
  "rec-8-quote": "After working with Youssef Ashraf in many projects, I noticed that Youssef gives a lot of effort in every task he does in any project. He is a skilled software developer, outstanding in performing team work, and he is also excellent at mathematics at all its branches.",
  "rec-8-rel": "Project Teammate",
  "cli-tag": "07 // INTERACTIVE CLI INTERFACE",
  "cli-title": "Youssef’s Cloud Terminal",
  "contact-title": "Let’s Build Resilient Infrastructure Together",
  "contact-email-title": "Direct Email",
  "contact-phone-title": "Phone &amp; WhatsApp",
  "contact-loc-title": "Location &amp; Relocation",
  "contact-loc-val": "6th October, Giza / Cairo, Egypt &bull; Open to Onsite, Hybrid, Remote &amp; Relocation",
  "view-full-resume-btn": "View Official Résumé (PDF)"
},
  ar: {
  "brand-name": "يوسف أشرف النجار",
  "nav-about": "<span class=\"nav-num\">٠١</span>عني",
  "nav-projects": "<span class=\"nav-num\">٠٢</span>المشاريع",
  "nav-experience": "<span class=\"nav-num\">٠٣</span>الخبرات",
  "nav-skills": "<span class=\"nav-num\">٠٤</span>المهارات",
  "nav-certificates": "<span class=\"nav-num\">٠٥</span>الشهادات",
  "nav-recommendations": "<span class=\"nav-num\">٠٦</span>التوصيات",
  "nav-cli": "<span class=\"cmd-icon\">&gt;_</span> الطرفية",
  "nav-hire": "وظّفني",
  "hero-pulse": "<span class=\"pulse-dot\"></span> متاح للعمل الفوري &bull; ديف أوبس &bull; القاهرة، مصر",
  "hero-gpa": "مرتبة الشرف الأولى (معدل ٣.٩٥ / ٤.٠٠)",
  "hero-title": "بناء وإدارة البنية السحابية بأعلى كفاءة، <span class=\"gradient-text\">دون توقف</span>، وبأتمتة دقيقة.",
  "hero-subtitle": "أنا <strong>يوسف أشرف النجار</strong> &mdash; مهندس <strong>ديف أوبس وبنية سحابية</strong> خريج جامعة النيل بمرتبة الشرف الأولى. بخبرة عملية في شركة <strong>فاليو (Valeo)</strong> ومبادرة <strong>رواد مصر الرقمية (DEPI)</strong>، أقوم بأتمتة خطوط النشر، وإدارة مجموعات الحاويات، وهندسة البنية ككود لضمان أقصى درجات الاستقرار والموثوقية السحابية.",
  "hero-btn-resume": "استعراض السيرة الذاتية الرسمية (PDF) ↗",
  "hero-btn-preview": "معاينة في النافذة",
  "hero-btn-download": "تحميل PDF",
  "hero-stat-1-label": "تقليص حجم الحاويات (Go/Docker)",
  "hero-stat-2-label": "خادم تم ضبطها وأتمتتها عبر SSH",
  "hero-stat-3-label": "تقليل الجهد اليدوي بخطوط النشر",
  "hero-stat-4-label": "المعدل التراكمي (مرتبة الشرف الأولى)",
  "about-tag": "٠١ // الملف الهندسي والرؤية",
  "about-title": "الربط المتكامل بين التطوير والعمليات السحابية",
  "about-desc": "بخبرة عملية وتدريب في كبرى الشركات مثل <strong>فاليو (Valeo)</strong> والمبادرات الحكومية مثل <strong>رواد مصر الرقمية (DEPI)</strong>، وتفوق أكاديمي بمرتبة الشرف الأولى من جامعة النيل، أحوّل عمليات النشر اليدوية إلى منصات سحابية مؤتمتة وموثوقة وقابلة للمراقبة.",
  "bento-role": "مهندس ديف أوبس وبنية سحابية",
  "bento-based-lbl": "المقر",
  "bento-based-val": "السادس من أكتوبر، الجيزة / القاهرة، مصر",
  "bento-edu-lbl": "التعليم",
  "bento-edu-val": "جامعة النيل (دفعة ٢٠٢٥)",
  "bento-lang-lbl": "اللغات",
  "bento-lang-val": "العربية (اللغة الأم) &bull; الإنجليزية (طلاقة كاملة)",
  "bento-avail-lbl": "الحالة الوظيفية",
  "bento-avail-val": "متاح للتوظيف الفوري بدوام كامل",
  "bento-acad-title": "جامعة النيل &mdash; مرتبة الشرف الأولى",
  "pillar-1-title": "معمارية السحابة وإدارة كوبرنيتس",
  "pillar-2-title": "خطوط النشر المؤتمتة والبنية ككود",
  "pillar-3-title": "المراقبة الاستباقية وهندسة الموثوقية (SRE)",
  "pillar-4-title": "برمجة النظم وضغط الحاويات",
  "proj-tag": "٠٢ // دراسات حالة إنتاجية",
  "proj-title": "المشاريع المنفذة والبنية السحابية الحية",
  "proj-desc": "تعمق في تصاميم البنية السحابية، وضغط الحاويات، وهندسة الخدمات المصغرة دون توقف.",
  "proj-1-badge": "العميل: مجموعة مفرح",
  "proj-1-title": "منصة التقييم المهني والمراقبة الذكية الحية",
  "proj-1-summary": "تصميم ونشر منصة تقييم مهنية متقدمة تدعم التدقيق اللحظي للمشرفين عبر Socket.IO، والتصحيح التلقائي للاختبارات، ومراقبة محاولات التشتت والغش.",
  "proj-1-h1": "مراقبة ذكية عبر الكاميرا مع تخزين مؤقت للوسائط في IndexedDB",
  "proj-1-h2": "حزم React 19 و Express بحاويات Alpine Docker متعددة المراحل",
  "proj-1-h3": "نشر إنتاجي على منصة Railway مع تشخيص الأعطال عبر Sentry APM",
  "proj-2-badge": "مشروع تخرج جامعة النيل",
  "proj-2-title": "إطار تحسين كفاءة الطاقة المعتمد على الذكاء الاصطناعي",
  "proj-2-summary": "بناء وحزم الواجهة الخلفية بلغة Python لمعالجة ملفات الطاقة الهندسية (IDF)، والتجسيم ثلاثي الأبعاد، وتدفقات RAG/LLM، مع أتمتة كاملة لخطوط CI/CD نحو Google Cloud Run.",
  "proj-2-h1": "أتمتة شاملة لخطوط CI/CD من البداية للنهاية عبر GitHub Actions",
  "proj-2-h2": "نشر الحاويات الخالية من الخوادم دون توقف إطلاقاً على Google Cloud Run",
  "proj-2-h3": "توجيه آمن للمدخلات (Ingress) لضمان موثوقية عمليات RAG/LLM الحية",
  "proj-3-badge": "مشروع تخرج مبادرة DEPI",
  "proj-3-title": "نشر الخدمات المصغرة متعددة الطبقات على AWS EKS",
  "proj-3-summary": "بنية تحتية سحابية متكاملة لخدمات مصغرة موزعة، تم توفيرها ككود عبر Terraform على AWS EKS وأتمتتها عبر Jenkins على خوادم EC2 بتشفير KubeSeal.",
  "proj-3-h1": "البنية ككود (IaC) على AWS باستخدام وحدات Terraform النمطية",
  "proj-3-h2": "تكوين خوادم Jenkins على EC2 مؤتمتاً بـ Ansible Playbooks",
  "proj-3-h3": "تأمين وتشفير الأسرار بـ KubeSeal ومراقبة شاملة بـ Prometheus و Grafana",
  "proj-4-badge": "برنامج DEPI المتقدم",
  "proj-4-title": "خدمة مصغرة فائقة السرعة بلغة Go مع كوبرنيتس وريديس",
  "proj-4-summary": "هندسة خدمة تخزين مؤقت فائقة الخفة بلغة Go. تقليص حجم الحاوية بنسبة ٩٧.٥٪ ونشر وحدات StatefulSets مرنة على كوبرنيتس مع وحدات تخزين دائمة.",
  "proj-4-h1": "تقليص حجم صورة الحاوية بنسبة <strong>٩٧.٥٪</strong> (من ١ جيجابايت إلى ٢٤.٥ ميجابايت)",
  "proj-4-h2": "تكوين StatefulSets و PVCs للتخزين الدائم وخدمات NodePort",
  "proj-4-h3": "طبقة تخزين مؤقت دائمة بزمن استجابة فائق السرعة تحت ضغط الحركة الافتراضية",
  "proj-blueprint-btn": "مخطط المعمارية السحابية &larr;",
  "labs-tag": "// ممارسات تقنية وتجارب معملية مستمرة",
  "labs-title": "مشاريع ديف أوبس مفتوحة المصدر وتجارب تقنية",
  "labs-gh-link": "عرض كافة المستودعات على GitHub <span>↗</span>",
  "lab-1-tag": "دوكر &bull; الحاويات المتقدمة",
  "lab-1-title": "معامل الدوكر متعدد المراحل والشبكات",
  "lab-1-desc": "مستودع شامل للتطبيقات العملية للحاويات: ملفات Dockerfile متعددة المراحل، واستمرارية التخزين، وشبكات الحاويات، وأتمتة Docker Compose.",
  "lab-2-tag": "كوبرنيتس &bull; إدارة العناقيد",
  "lab-2-title": "ملفات كوبرنيتس وهندسة العناقيد السحابية",
  "lab-2-desc": "ملفات كوبرنيتس بأنماط إنتاجية تغطي Deployments و StatefulSets ووحدات التخزين المستمر وتوجيه Ingress ونماذج صلاحيات RBAC.",
  "lab-3-tag": "برمجة &bull; أتمتة العمليات",
  "lab-3-badge": "أتمتة فاليو",
  "lab-3-title": "لوحة قياس مؤشرات الأداء وأتمتة العمليات",
  "lab-3-desc": "سكربتات مؤتمتة لإعداد التقارير ومتابعة سلامة المهام ونماذج القياس وفرت على قادة الفرق في فاليو أكثر من ٤ ساعات أسبوعياً.",
  "exp-tag": "٠٣ // المسار المهني والخبرات",
  "exp-title": "الخبرات العملية والمهنية",
  "exp-desc": "تحقيق أتمتة ملموسة، واستقرار تشغيلي، وتوافر عالٍ للأنظمة داخل فرق هندسية متقدمة.",
  "exp-1-role": "مهندس ديف أوبس متدرب",
  "exp-1-comp": "شركة فاليو (Valeo) &bull; القاهرة، مصر",
  "exp-1-b1": "أتمتة بناء صور Docker للأنظمة المتعددة وسير عمل CI باستخدام <strong>Bash و Python و Jenkins</strong>، مما قلص التدخل اليدوي للمهندسين بنسبة <strong>٤٠٪</strong>.",
  "exp-1-b2": "الحفاظ على اتصال SSH آمن ومستمر عبر أكثر من <strong>٢٠٠ جهاز وخادم</strong>، مما قضى على انقطاعات النشر واختناقات الوصول للأنظمة.",
  "exp-1-b3": "أتمتة ترقيات إصدارات Git عبر عقد CI ومزامنة إدارة المخرجات في <strong>Nexus</strong> عبر <strong>Ansible playbooks</strong>، مما قلل أخطاء المزامنة بنسبة <strong>٨٠٪</strong>.",
  "exp-1-b4": "توحيد أدوار وتكوين بيئات CI وتدقيق المتغيرات بواسطة Ansible، مما رفع كفاءة استكشاف الأخطاء وحلها بنسبة <strong>٥٠٪</strong>.",
  "exp-2-role": "مهندس ديف أوبس متدرب",
  "exp-2-comp": "مركز رواد الأعمال STEM &bull; القاهرة، مصر",
  "exp-2-b1": "تحزيم تطبيقات الخدمات المتعددة داخل حاويات <strong>Docker</strong> وأتمتة خطوط النشر المستمر بواسطة <strong>Jenkins</strong>.",
  "exp-2-b2": "تقديم ورش عمل تطبيقية وإرشاد تقني متخصص حول أفضل ممارسات الحاويات، واستراتيجيات تفرع Git، وخطوط CI/CD للمهندسين الواعدين.",
  "exp-3-role": "متدرب أتمتة العمليات والبرمجيات",
  "exp-3-comp": "شركة فاليو (Valeo) &bull; القاهرة، مصر",
  "exp-3-b1": "أتمتة تقارير إدارة المشاريع الداخلية ولوحات التحليلات باستخدام <strong>JavaScript و Google Apps Script</strong>، مما خفّض أعباء التقارير اليدوية بنسبة <strong>٦٠٪</strong>.",
  "exp-3-b2": "بناء نماذج قياس وتتبع بصرية (مؤشرات ومخططات بيانية)، موفراً على قادة الفرق <strong>أكثر من ٤ ساعات أسبوعياً</strong> من الحسابات اليدوية.",
  "skills-tag": "٠٤ // المنظومة التقنية والسحابية",
  "skills-title": "المصفوفة التقنية ومنظومة الأدوات السحابية",
  "skills-desc": "التقنيات والأدوات التي أطبقها يومياً في البيئات الإنتاجية الحقيقية.",
  "filter-all": "كافة الأدوات",
  "filter-cloud": "السحابة والحاويات",
  "filter-cicd": "الأتمتة وخطوط النشر",
  "filter-obs": "المراقبة وقياس الأداء",
  "filter-scripting": "البرمجة وقواعد البيانات",
  "skill-1-tag": "الحاويات",
  "skill-1-exp": "إنتاجي متقدم",
  "skill-1-desc": "بناء حاويات Alpine متعدد المراحل، استمرارية التخزين، عزل الشبكات، وخفض الحجم بنسبة ٩٧.٥٪.",
  "skill-2-tag": "إدارة العناقيد",
  "skill-2-exp": "مستوى متقدم",
  "skill-2-desc": "نشر وتوسيع Deployments و StatefulSets و PVCs و Ingress وتشفير الأسرار بـ KubeSeal.",
  "skill-3-tag": "مزود سحابي",
  "skill-3-exp": "إنتاجي معتمد",
  "skill-3-desc": "عناقيد EKS، خوادم EC2، تخزين S3، وسياسات أمان IAM وفق مبدأ الصلاحيات الأدنى.",
  "skill-4-tag": "سحابة غير خادمة",
  "skill-4-exp": "إنتاجي حقيقي",
  "skill-4-desc": "نشر حاويات Cloud Run دون توقف، توجيه حركة المرور الآمن، والتوسع التلقائي.",
  "skill-5-tag": "البنية ككود (IaC)",
  "skill-5-exp": "إنتاجي",
  "skill-5-desc": "توفير الموارد السحابية برمجياً، حالات سحابية قابلة للتكرار، وقفل الحالة عبر S3/DynamoDB.",
  "skill-6-tag": "إدارة الإعدادات",
  "skill-6-exp": "معتمد في فاليو",
  "skill-6-desc": "إدارة إعدادات أكثر من ٢٠٠ خادم، تشغيل Playbooks، وأتمتة ترقيات Git و Nexus.",
  "skill-7-tag": "خطوط النشر",
  "skill-7-exp": "مستوى متقدم",
  "skill-7-desc": "خطوط نشر Declarative، بناء مؤتمت للأنظمة المتعددة، وبنية وكلاء موزعة.",
  "skill-8-tag": "CI/CD سحابي حديث",
  "skill-8-exp": "إنتاجي معتمد",
  "skill-8-desc": "سير عمل مؤتمت للبناء والاختبار ودفع الحاويات المباشر نحو سحابة GCP و AWS.",
  "skill-9-tag": "إدارة أنظمة لينكس",
  "skill-9-exp": "خبرة عميقة",
  "skill-9-desc": "أنظمة Ubuntu و Alpine و Debian، قنوات SSH المستمرة، systemd، وتدقيق الصلاحيات.",
  "skill-10-tag": "مقاييس الأداء",
  "skill-10-exp": "إنتاجي",
  "skill-10-desc": "اكتشاف الخدمات، استخراج المقاييس، قواعد التنبيه بلغة PromQL، وجمع البيانات اللحظية.",
  "skill-11-tag": "لوحات القياس",
  "skill-11-exp": "إنتاجي",
  "skill-11-desc": "تصور بياني لحظي لسلامة الأنظمة، تتبع اتفاقيات SLA/SLO، وقنوات الإنذار الفوري.",
  "skill-12-tag": "تتبع الأعطال والسجلات",
  "skill-12-exp": "إنتاجي حقيقي",
  "skill-12-desc": "تشخيص لحظي للانهيارات، تتبع الطلبات الموزعة، والإدارة المركزية لسجلات النظام.",
  "skill-13-tag": "لغات الأنظمة",
  "skill-13-exp": "أنظمة متزامنة",
  "skill-13-desc": "خدمات مصغرة عالية التزامن، تجميع ملفات تنفيذية فائقة الخفة، وتكامل سريع مع Redis.",
  "skill-14-tag": "البرمجة والذكاء الاصطناعي",
  "skill-14-exp": "مستوى متقدم",
  "skill-14-desc": "سكربتات أتمتة طرفية، واجهات RAG/LLM، مهام cron الدورية، وتدفقات معالجة البيانات.",
  "skill-15-tag": "التخزين المؤقت وقواعد البيانات",
  "skill-15-exp": "إنتاجي",
  "skill-15-desc": "تخزين مؤقت عالي السرعة مع StatefulSets و PVCs، مخططات علائقية، و Prisma ORM.",
  "skill-16-tag": "تكامل الويب الكامل",
  "skill-16-exp": "كفاءة عالية",
  "skill-16-desc": "إشراف لحظي عبر Socket.IO، واجهات Express REST، وربط الواجهات الحديثة.",
  "certs-tag": "٠٥ // الاعتمادات والتكريمات الأكاديمية",
  "certs-title": "الشهادات والاعتمادات الرسمية",
  "certs-desc": "شهادات معتمدة للكفاءة التقنية، وبرامج تدريب حكومية متقدمة، وتفوق أكاديمي موثق.",
  "cert-valeo-org": "شركة فاليو &bull; قطاع نظم المعلومات والاتصالات (GISACC)",
  "cert-valeo-title": "شهادة تدريب مهندس ديف أوبس",
  "cert-valeo-desc": "مُنحت لإنجاز أتمتة CI/CD بنجاح، وتوحيد إعدادات أكثر من ٢٠٠ خادم عبر Ansible، وتطبيق حاويات Docker خلال صيف ٢٠٢٤.",
  "cert-depi-org": "وزارة الاتصالات وتكنولوجيا المعلومات المصرية",
  "cert-depi-title": "دبلومة هندسة الديف أوبس (DEPI)",
  "cert-depi-desc": "برنامج تدريبي عملي مكثف يغطي AWS وكوبرنيتس و Terraform كبنية ككود و Jenkins و Ansible ومراقبة Prometheus/Grafana.",
  "cert-kk-org": "منصة كود كلاود (KodeKloud)",
  "cert-kk-title": "أساسيات هندسة الديف أوبس (DevOps)",
  "cert-kk-desc": "إتقان ثقافة الديف أوبس، وخطوط التسليم المستمر، وممارسات البنية التحتية الرشيقة، ومقاييس الأتمتة السحابية.",
  "cert-dean-org": "جامعة النيل &bull; شرف العميد الأكاديمي",
  "cert-dean-title": "شهادة قائمة العميد للتميز والتفوق الأكاديمي",
  "cert-dean-desc": "مُنحت من د. أحمد المهدي، عميد كلية تكنولوجيا المعلومات وعلوم الحاسب، للتفوق الأكاديمي والترتيب الأول.",
  "cert-photo-org": "جامعة النيل &bull; عمادة كلية إدارة الأعمال",
  "cert-photo-title": "المركز الأول &mdash; مسابقة التصوير الفوتوغرافي الرسمية",
  "cert-photo-desc": "جائزة خاصة من د. حسن علي تقديراً للرؤية الإبداعية، والدقة، والتميز في التكوين البصري.",
  "recs-tag": "٠٦ // توصيات القادة والمهندسين (LinkedIn)",
  "recs-title": "شهادات وتوصيات القادة وزملاء العمل",
  "recs-desc": "آراء وتوصيات مباشرة من مديري المباشر، ومؤسسي شركات، وأعضاء هيئة التدريس بجامعة النيل، ومهندسي البرمجيات عبر LinkedIn.",
  "rec-1-quote": "احترافية عالية، مبرمج متميز، ومجتهد جداً في عمله.",
  "rec-1-rel": "المدير المباشر ليوسف",
  "rec-2-quote": "طوال فترة دراستنا معاً في جامعة النيل وتعاوننا في مشاريع هندسية متعددة، أثبت يوسف دائماً ذكاءه وتفانيه وأخلاقيات عمله العالية. سريع التعلم، شغوف بالتحديات، ولاعب فريق استثنائي يمتلك أساساً متيناً في علوم الحاسب وقدرة فائقة على حل المشكلات بشكل إبداعي.",
  "rec-2-rel": "زميل دراسة ومشارك في عدة مشاريع",
  "rec-3-quote": "أظهر يوسف تفوقاً استثنائياً في مادة الحوسبة المتقدمة مع التزام وأخلاقيات عمل عالية. فهم عميق للمفاهيم المعقدة وشغف لا ينقطع للتحديات البرمجية. تفانيه والتزامه بالتميز يجعله طالباً فريداً سينجح بلا شك ويترك بصمة إيجابية قوية في صناعة البرمجيات.",
  "rec-3-rel": "مدرس المادة ليوسف",
  "rec-4-quote": "يوسف من أكثر الطلاب تميزاً الذين قابلتهم طوال سنوات تدريسي. أبهرني بقدرته على صياغة وشرح المفاهيم الصعبة وقيادته للفريق في مشروع الفصل الدراسي. شخصية متعاونة تحترم آراء الجميع. موهوب، دقيق، متفانٍ، ومركز في أهدافه.",
  "rec-4-rel": "معيدة ومدرسة المساق الأكاديمي",
  "rec-5-quote": "يوسف طالب ممتاز ومجتهد جداً. يمتلك مهارات برمجية فائقة وحلاً متميزاً للمشكلات بلغات مثل Python و C++، بالإضافة إلى مهارات تواصل تجعله مؤهلاً لأي دور يتطلب كفاءة تقنية وشخصية.",
  "rec-5-rel": "معيد بالجامعة ومحلل بيانات",
  "rec-6-quote": "طالب ذكي جداً بمهارات عالية، دؤوب ومجتهد لأقصى درجة.",
  "rec-6-rel": "مدرسة ومرشدة أكاديمية",
  "rec-7-quote": "يسعدني معرفة يوسف على مدار ٣ سنوات، وكنت دائماً معجباً بذكائه وتفانيه وشغفه بعلوم الحاسب. مفكر مبدع ومبتكر ويمثل إضافة نوعية وقيمة لأي فريق أو مؤسسة يعمل بها.",
  "rec-7-rel": "زميل دراسة (٣+ سنوات)",
  "rec-8-quote": "بعد العمل مع يوسف أشرف في العديد من المشاريع، لاحظت أنه يبذل جهداً هائلاً في كل مهمة يقوم بها. مطور برمجيات بارع، متميز جداً في العمل الجماعي، ومتفوق للغاية في الرياضيات بكافة فروعها.",
  "rec-8-rel": "زميل في فريق المشروع",
  "cli-tag": "٠٧ // واجهة سطر الأوامر التفاعلية",
  "cli-title": "طرفية يوسف السحابية (Cloud Terminal)",
  "contact-title": "دعنا نبني بنية سحابية مرنة ومتطورة معاً",
  "contact-email-title": "البريد الإلكتروني المباشر",
  "contact-phone-title": "الهاتف والواتساب",
  "contact-loc-title": "الموقع والجاهزية للانتقال",
  "contact-loc-val": "السادس من أكتوبر، الجيزة / القاهرة، مصر &bull; متاح للعمل المكتبي، الهجين، عن بعد، والانتقال الدولي",
  "view-full-resume-btn": "استعراض السيرة الذاتية الرسمية (PDF)"
}
};

let currentLanguage = localStorage.getItem('portfolio-language') || 'en';

function setLanguage(lang, silent = false) {
  currentLanguage = lang;
  localStorage.setItem('portfolio-language', lang);
  const isAr = lang === 'ar';

  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', isAr ? 'rtl' : 'ltr');

  const navToggleText = document.getElementById('lang-switch-text');
  if (navToggleText) {
    navToggleText.textContent = isAr ? 'EN' : 'عربي';
  }

  const heroBadgeText = document.getElementById('hero-lang-badge-text');
  if (heroBadgeText) {
    heroBadgeText.textContent = isAr ? 'English ⇄' : 'AR / EN ⇄';
  }

  // Update translatable elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) {
      el.innerHTML = TRANSLATIONS[lang][key];
    }
  });

  if (!silent) {
    showToast(isAr ? 'تم تحويل الواجهة إلى اللغة العربية' : 'Switched to English language');
  }
}

function initLanguage() {
  const navToggle = document.getElementById('nav-lang-toggle');
  const heroBadge = document.getElementById('hero-lang-badge');

  function toggle() {
    setLanguage(currentLanguage === 'en' ? 'ar' : 'en', false);
  }

  if (navToggle) navToggle.addEventListener('click', toggle);
  if (heroBadge) heroBadge.addEventListener('click', toggle);

  // Set initial language if saved as Arabic
  if (currentLanguage === 'ar') {
    setLanguage('ar', true);
  }
}

/* ==========================================================================
   Resume Tabs Switcher (Real PDF vs ATS Text)
   ========================================================================== */
function initResumeTabs() {
  const tabPdf = document.getElementById('tab-btn-pdf');
  const tabText = document.getElementById('tab-btn-text');
  const panePdf = document.getElementById('resume-tab-pdf-content');
  const paneText = document.getElementById('resume-tab-text-content');

  if (tabPdf && tabText && panePdf && paneText) {
    tabPdf.addEventListener('click', () => {
      tabPdf.classList.add('active');
      tabText.classList.remove('active');
      panePdf.style.display = 'block';
      paneText.style.display = 'none';
    });

    tabText.addEventListener('click', () => {
      tabText.classList.add('active');
      tabPdf.classList.remove('active');
      panePdf.style.display = 'none';
      paneText.style.display = 'block';
    });
  }
}
