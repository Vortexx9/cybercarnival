/* ==========================================================================
   CYBER CARNIVAL - HIGH-PERFORMANCE INTERACTIVE SCRIPTS (VANILLA JS)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    // --- STICKY NAVBAR GLASSMORPHISM & LINK ACTIVE CLASS ---
    const header = document.getElementById('site-header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.pageYOffset >= (sectionTop - 150)) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });

    // Mobile Navigation Toggle
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            menuToggle.classList.toggle('active');
            const bars = menuToggle.querySelectorAll('.bar');
            if (menuToggle.classList.contains('active')) {
                bars[0].style.transform = 'rotate(-45deg) translate(-5px, 6px)';
                bars[1].style.opacity = '0';
                bars[2].style.transform = 'rotate(45deg) translate(-5px, -6px)';
            } else {
                bars[0].style.transform = 'none';
                bars[1].style.opacity = '1';
                bars[2].style.transform = 'none';
            }
        });

        navMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                navMenu.classList.remove('active');
                menuToggle.classList.remove('active');
                menuToggle.querySelectorAll('.bar').forEach(bar => bar.style.transform = 'none');
                menuToggle.querySelectorAll('.bar')[1].style.opacity = '1';
            });
        });
    }

    // --- CUSTOM CURSOR GLOW EFFECT ---
    const customCursor = document.getElementById('custom-cursor');
    document.addEventListener('mousemove', (e) => {
        customCursor.style.opacity = '1';
        customCursor.style.left = `${e.clientX}px`;
        customCursor.style.top = `${e.clientY}px`;
    });
    
    document.addEventListener('mouseleave', () => {
        customCursor.style.opacity = '0';
    });

    // --- CANVAS 1: HERO SCROLLING PERSPECTIVE GRID & PARTICLES ---
    const gridCanvas = document.getElementById('grid-canvas');
    if (gridCanvas) {
        const ctx = gridCanvas.getContext('2d');
        let width = gridCanvas.width = gridCanvas.offsetWidth;
        let height = gridCanvas.height = gridCanvas.offsetHeight;
        
        let mouseX = width / 2;
        let mouseY = height / 2;
        
        window.addEventListener('resize', () => {
            if (!gridCanvas) return;
            width = gridCanvas.width = gridCanvas.offsetWidth;
            height = gridCanvas.height = gridCanvas.offsetHeight;
        });

        document.addEventListener('mousemove', (e) => {
            const rect = gridCanvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;
        });

        const particles = [];
        const numParticles = 40;
        for (let i = 0; i < numParticles; i++) {
            particles.push({
                x: Math.random() * width,
                y: Math.random() * height + height,
                size: Math.random() * 2 + 1,
                speedY: Math.random() * 1.5 + 0.5,
                opacity: Math.random() * 0.5 + 0.2,
                drift: Math.random() * 0.5 - 0.25
            });
        }

        let gridOffset = 0;
        
        function animateGrid() {
            ctx.clearRect(0, 0, width, height);
            ctx.strokeStyle = 'rgba(157, 78, 223, 0.08)';
            ctx.lineWidth = 1;
            
            const horizon = height * 0.45;
            const numLines = 24;
            
            for (let i = 0; i <= numLines; i++) {
                const xVal = (i / numLines) * width;
                ctx.beginPath();
                ctx.moveTo(xVal, horizon);
                const cursorForce = (xVal - mouseX) * 0.08;
                ctx.lineTo(xVal + (xVal - width/2) * 1.5 + cursorForce, height);
                ctx.stroke();
            }
            
            gridOffset += 0.8;
            if (gridOffset >= 60) gridOffset = 0;
            
            const numHorizontal = 12;
            for (let i = 0; i < numHorizontal; i++) {
                const progress = (i * 60 + gridOffset) / (numHorizontal * 60);
                const yVal = horizon + (height - horizon) * Math.pow(progress, 2.5);
                ctx.beginPath();
                ctx.moveTo(0, yVal);
                ctx.lineTo(width, yVal);
                ctx.stroke();
            }
            
            ctx.fillStyle = 'rgba(199, 125, 255, 0.4)';
            particles.forEach(p => {
                p.y -= p.speedY;
                p.x += p.drift + (mouseX - width/2) * 0.0005;
                
                if (p.y < horizon) {
                    p.y = height + Math.random() * 40;
                    p.x = Math.random() * width;
                }
                
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.shadowBlur = 8;
                ctx.shadowColor = '#c77dff';
                ctx.fillStyle = `rgba(199, 125, 255, ${p.opacity})`;
                ctx.fill();
                ctx.shadowBlur = 0;
            });
            
            requestAnimationFrame(animateGrid);
        }
        
        animateGrid();
    }

    // --- CANVAS 2: INTERACTIVE 3D GLOBE / NETWORK ---
    const globeCanvas = document.getElementById('globe-canvas');
    if (globeCanvas) {
        const gCtx = globeCanvas.getContext('2d');
        let gWidth = globeCanvas.width = globeCanvas.offsetWidth;
        let gHeight = globeCanvas.height = globeCanvas.offsetHeight;
        
        window.addEventListener('resize', () => {
            if (!globeCanvas) return;
            gWidth = globeCanvas.width = globeCanvas.offsetWidth;
            gHeight = globeCanvas.height = globeCanvas.offsetHeight;
        });

        const points = [];
        const globeRadius = 160;
        const numSegments = 16;
        const numRings = 16;
        
        for (let i = 0; i < numRings; i++) {
            const phi = (Math.PI * i) / numRings;
            for (let j = 0; j < numSegments; j++) {
                const theta = (Math.PI * 2 * j) / numSegments;
                const x = globeRadius * Math.sin(phi) * Math.cos(theta);
                const y = globeRadius * Math.cos(phi);
                const z = globeRadius * Math.sin(phi) * Math.sin(theta);
                points.push({ x, y, z, originalX: x, originalY: y, originalZ: z });
            }
        }
        
        const nodes = [];
        const numNodes = 25;
        for (let i = 0; i < numNodes; i++) {
            const phi = Math.random() * Math.PI;
            const theta = Math.random() * Math.PI * 2;
            const x = globeRadius * Math.sin(phi) * Math.cos(theta);
            const y = globeRadius * Math.cos(phi);
            const z = globeRadius * Math.sin(phi) * Math.sin(theta);
            nodes.push({
                x, y, z,
                originalX: x, originalY: y, originalZ: z,
                color: Math.random() > 0.4 ? '#9d4edf' : '#00f5ff',
                size: Math.random() * 3 + 2,
                pulse: Math.random() * Math.PI
            });
        }

        let angleY = 0.003;
        let angleX = 0.001;
        let targetAngleY = 0.003;
        let targetAngleX = 0.001;
        let isDragging = false;
        let previousMouseX = 0;
        let previousMouseY = 0;
        
        globeCanvas.addEventListener('mousedown', (e) => {
            isDragging = true;
            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
        });
        
        document.addEventListener('mousemove', (e) => {
            if (!isDragging) {
                const rect = globeCanvas.getBoundingClientRect();
                const relativeX = (e.clientX - rect.left) - gWidth / 2;
                const relativeY = (e.clientY - rect.top) - gHeight / 2;
                targetAngleY = relativeX * 0.00003;
                targetAngleX = relativeY * 0.00003;
                return;
            }
            
            const deltaX = e.clientX - previousMouseX;
            const deltaY = e.clientY - previousMouseY;
            
            angleY += deltaX * 0.008;
            angleX += deltaY * 0.008;
            
            previousMouseX = e.clientX;
            previousMouseY = e.clientY;
        });
        
        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        function rotateX(point, pitch) {
            const cos = Math.cos(pitch);
            const sin = Math.sin(pitch);
            const y = point.y * cos - point.z * sin;
            const z = point.y * sin + point.z * cos;
            point.y = y;
            point.z = z;
        }

        function rotateY(point, yaw) {
            const cos = Math.cos(yaw);
            const sin = Math.sin(yaw);
            const x = point.x * cos - point.z * sin;
            const z = point.x * sin + point.z * cos;
            point.x = x;
            point.z = z;
        }
        
        const focalLength = 300;
        const centerX = gWidth / 2;
        const centerY = gHeight / 2;

        function animateGlobe() {
            gCtx.clearRect(0, 0, gWidth, gHeight);
            
            if (!isDragging) {
                angleY += (targetAngleY - angleY) * 0.05 + 0.002;
                angleX += (targetAngleX - angleX) * 0.05 + 0.0005;
            }
            
            gCtx.strokeStyle = 'rgba(157, 78, 223, 0.07)';
            gCtx.lineWidth = 0.5;
            
            const projected = [];
            
            points.forEach(p => {
                rotateY(p, angleY);
                rotateX(p, angleX);
                
                const scale = focalLength / (focalLength + p.z);
                const screenX = centerX + p.x * scale;
                const screenY = centerY + p.y * scale;
                
                projected.push({ screenX, screenY, depth: p.z });
            });

            for (let i = 0; i < numRings; i++) {
                gCtx.beginPath();
                for (let j = 0; j < numSegments; j++) {
                    const idx = i * numSegments + j;
                    const nextIdx = i * numSegments + ((j + 1) % numSegments);
                    if (projected[idx] && projected[nextIdx] && points[idx].z < 50) {
                        gCtx.moveTo(projected[idx].screenX, projected[idx].screenY);
                        gCtx.lineTo(projected[nextIdx].screenX, projected[nextIdx].screenY);
                    }
                }
                gCtx.stroke();
            }

            for (let j = 0; j < numSegments; j++) {
                gCtx.beginPath();
                for (let i = 0; i < numRings - 1; i++) {
                    const idx = i * numSegments + j;
                    const nextIdx = (i + 1) * numSegments + j;
                    if (projected[idx] && projected[nextIdx] && points[idx].z < 50) {
                        gCtx.moveTo(projected[idx].screenX, projected[idx].screenY);
                        gCtx.lineTo(projected[nextIdx].screenX, projected[nextIdx].screenY);
                    }
                }
                gCtx.stroke();
            }

            nodes.forEach(n => {
                rotateY(n, angleY);
                rotateX(n, angleX);
                
                n.pulse += 0.05;
                const sizeOffset = Math.sin(n.pulse) * 1.5;
                
                const scale = focalLength / (focalLength + n.z);
                const screenX = centerX + n.x * scale;
                const screenY = centerY + n.y * scale;
                
                const opacity = n.z > 0 ? 0.2 : 0.8;
                
                gCtx.fillStyle = n.color;
                gCtx.beginPath();
                gCtx.arc(screenX, screenY, Math.max(0.5, n.size + sizeOffset) * scale, 0, Math.PI * 2);
                
                if (n.z < 0) {
                    gCtx.shadowBlur = 10;
                    gCtx.shadowColor = n.color;
                }
                gCtx.fillStyle = n.color === '#00f5ff' ? `rgba(0, 245, 255, ${opacity})` : `rgba(157, 78, 223, ${opacity})`;
                gCtx.fill();
                gCtx.shadowBlur = 0;
                
                if (n.z < -100 && Math.abs(sizeOffset) > 1.2) {
                    gCtx.strokeStyle = 'rgba(0, 245, 255, 0.3)';
                    gCtx.lineWidth = 1;
                    gCtx.beginPath();
                    const bracketSize = 10 * scale;
                    gCtx.moveTo(screenX - bracketSize, screenY - bracketSize/2);
                    gCtx.lineTo(screenX - bracketSize, screenY - bracketSize);
                    gCtx.lineTo(screenX - bracketSize/2, screenY - bracketSize);
                    
                    gCtx.moveTo(screenX + bracketSize, screenY - bracketSize/2);
                    gCtx.lineTo(screenX + bracketSize, screenY - bracketSize);
                    gCtx.lineTo(screenX + bracketSize/2, screenY - bracketSize);
                    gCtx.stroke();
                }
            });
            
            requestAnimationFrame(animateGlobe);
        }
        
        animateGlobe();
    }

    // --- 3D TILT EFFECT ON CARDS ---
    const cards = document.querySelectorAll('[data-tilt]');
    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const width = rect.width;
            const height = rect.height;
            const rotateX = -((y - height / 2) / height) * 20;
            const rotateY = ((x - width / 2) / width) * 20;
            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
        });
    });

    // --- ABOUT SECTION STATS COUNTER ANIMATION ---
    const statsSection = document.getElementById('stats-container');
    const compCounter = document.getElementById('stat-competition');
    const enthCounter = document.getElementById('stat-enthusiasts');
    const chalCounter = document.getElementById('stat-challenges');
    
    const compCircle = document.getElementById('gauge-comp-circle');
    const enthCircle = document.getElementById('gauge-enth-circle');
    const chalCircle = document.getElementById('gauge-chal-circle');

    let animationTriggered = false;

    function countUp(element, target, duration, callback) {
        let start = 0;
        const increment = target / (duration / 16);
        const timer = setInterval(() => {
            start += increment;
            if (start >= target) {
                element.textContent = target + (target === 1000 ? '+' : target === 24 ? '+' : '+');
                clearInterval(timer);
                if (callback) callback();
            } else {
                element.textContent = Math.floor(start);
            }
        }, 16);
    }
    
    function setGaugeProgress(circle, percentage) {
        const circumference = 264;
        const offset = circumference - (percentage / 100) * circumference;
        circle.style.strokeDashoffset = offset;
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animationTriggered) {
                animationTriggered = true;
                countUp(compCounter, 24, 1500, () => {
                    setGaugeProgress(compCircle, 95);
                });
                countUp(enthCounter, 1000, 1800, () => {
                    setGaugeProgress(enthCircle, 85);
                });
                countUp(chalCounter, 50, 1500, () => {
                    setGaugeProgress(chalCircle, 75);
                });
                setGaugeProgress(compCircle, 50);
                setGaugeProgress(enthCircle, 40);
                setGaugeProgress(chalCircle, 30);
            }
        });
    }, { threshold: 0.2 });

    if (statsSection) {
        observer.observe(statsSection);
    }

    // --- TIMELINE SECTION: HORIZONTAL SCROLL INTERACTION ---
    const timelineArea = document.getElementById('timeline-scroll-area');
    const timelineLine = document.getElementById('timeline-line');
    const timelineNodes = document.querySelectorAll('.timeline-node');
    
    let isDown = false;
    let startX;
    let scrollLeft;
    
    if (timelineArea) {
        timelineArea.addEventListener('mousedown', (e) => {
            isDown = true;
            startX = e.pageX - timelineArea.offsetLeft;
            scrollLeft = timelineArea.scrollLeft;
        });
        timelineArea.addEventListener('mouseleave', () => {
            isDown = false;
        });
        timelineArea.addEventListener('mouseup', () => {
            isDown = false;
        });
        timelineArea.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - timelineArea.offsetLeft;
            const walk = (x - startX) * 1.5;
            timelineArea.scrollLeft = scrollLeft - walk;
            updateTimelineScroll();
        });
        
        timelineArea.addEventListener('scroll', updateTimelineScroll);
    }

    function updateTimelineScroll() {
        const scrollWidth = timelineArea.scrollWidth - timelineArea.clientWidth;
        const scrollPercent = (timelineArea.scrollLeft / scrollWidth) * 100;
        
        timelineLine.style.background = `linear-gradient(90deg, #9d4edf 0%, #9d4edf ${scrollPercent}%, rgba(157, 78, 223, 0.1) ${scrollPercent + 10}%, rgba(157, 78, 223, 0.1) 100%)`;
        
        timelineNodes.forEach(node => {
            const nodeRect = node.getBoundingClientRect();
            const areaRect = timelineArea.getBoundingClientRect();
            
            if (nodeRect.left - areaRect.left < areaRect.width * 0.7) {
                node.classList.add('active');
            } else {
                node.classList.remove('active');
            }
        });
    }
    
    updateTimelineScroll();

    // --- LEADERBOARD & LIVE SYSTEM TELEMETRY MONITOR ---
    const liveLogContainer = document.getElementById('live-terminal-feed');
    
    const exploitUserNames = ['USER_742', 'TEAM_ZERO_DAY', 'BUFF_OVERFLOW', 'SYN_ATTACKERS', 'NULL_POINTER', 'GHOST_DEV', 'SUDO_SUccess', 'FLAG_HUNTER', 'HEX_DEMON', 'CRACK_JACK'];
    const exploitChallenges = ['FLAG_WEB_03', 'CRYPTO_05', 'PWN_REVERSE_01', 'FORENSICS_02', 'OSINT_08', 'INFRA_EXPLOIT', 'BUFFER_SHELL', 'SQL_GATEWAY'];
    const exploitTypes = [
        'captured',
        'solved',
        'disclosed a vulnerability in',
        'connected to node',
        'attempted injection on',
        'bypassed firewall of'
    ];
    
    function appendLiveLog() {
        if (!liveLogContainer) return;
        
        const timestamp = new Date();
        const hrs = String(timestamp.getHours()).padStart(2, '0');
        const mins = String(timestamp.getMinutes()).padStart(2, '0');
        const secs = String(timestamp.getSeconds()).padStart(2, '0');
        const timeStr = `[${hrs}:${mins}:${secs}]`;
        
        const randomUser = exploitUserNames[Math.floor(Math.random() * exploitUserNames.length)];
        const randomChallenge = exploitChallenges[Math.floor(Math.random() * exploitChallenges.length)];
        const randomType = exploitTypes[Math.floor(Math.random() * exploitTypes.length)];
        
        let logText = '';
        if (randomType === 'captured') {
            logText = `${timeStr} <span class="log-info">[ALERT]</span> <span class="accent-color">${randomUser}</span> captured <span class="log-flag">${randomChallenge}</span> (+250 pts)`;
        } else if (randomType === 'solved') {
            logText = `${timeStr} <span class="log-info">[SUCCESS]</span> <span class="accent-color">${randomUser}</span> solved <span class="cyan-color">${randomChallenge}</span> (+150 pts)`;
        } else if (randomType === 'disclosed a vulnerability in') {
            logText = `${timeStr} <span class="log-info">[BOUNTY]</span> <span class="accent-color">${randomUser}</span> submitted patch for <span class="cyan-color">${randomChallenge}</span>`;
        } else if (randomType === 'connected to node') {
            logText = `${timeStr} <span class="log-time">[CONN]</span> Remote terminal <span class="accent-color">${randomUser}</span> synchronized with NODE_0x${Math.floor(Math.random() * 255).toString(16).toUpperCase()}`;
        } else if (randomType === 'attempted injection on') {
            logText = `${timeStr} <span class="log-time">[WARN]</span> WAF block: <span class="accent-color">${randomUser}</span> blocked on <span class="log-flag">${randomChallenge}</span>`;
        } else {
            logText = `${timeStr} <span class="log-info">[SYS]</span> Integrity monitor: Firewall verified. Active tunnels: ${Math.floor(Math.random() * 50 + 20)}`;
        }
        
        const logLine = document.createElement('div');
        logLine.className = 'log-line';
        logLine.innerHTML = logText;
        
        liveLogContainer.appendChild(logLine);
        if (liveLogContainer.childNodes.length > 25) {
            liveLogContainer.removeChild(liveLogContainer.firstChild);
        }
        
        liveLogContainer.scrollTop = liveLogContainer.scrollHeight;
    }
    
    setInterval(appendLiveLog, 2500);

    // --- FAQ ACCORDION TRANSITION ---
    const faqQuestions = document.querySelectorAll('.faq-question');
    faqQuestions.forEach(question => {
        question.addEventListener('click', () => {
            const faqItem = question.parentElement;
            const answer = faqItem.querySelector('.faq-answer');
            const isOpen = faqItem.classList.contains('active');
            
            document.querySelectorAll('.faq-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.faq-answer').style.maxHeight = '0';
            });
            
            if (!isOpen) {
                faqItem.classList.add('active');
                answer.style.maxHeight = `${answer.scrollHeight}px`;
            }
        });
    });

    // --- INTERACTIVE TERMINAL REGISTRATION MODAL ---
    const registerModal = document.getElementById('register-modal');
    const modalClose = document.getElementById('modal-close');
    const openModalBtns = [
        document.getElementById('nav-register-btn'),
        document.getElementById('hero-register-btn'),
        document.getElementById('gate-register-btn')
    ];
    
    const eventTriggerBtns = document.querySelectorAll('.event-trigger-btn');
    const terminalFlow = document.getElementById('terminal-flow');
    
    let registrationData = {
        codename: '',
        email: '',
        battlefield: '',
        confirm: ''
    };
    
    let currentStep = 0;

    function openModal(defaultBattlefield = '') {
        if (defaultBattlefield) {
            registrationData.battlefield = defaultBattlefield;
        }
        
        registerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        currentStep = 0;
        terminalFlow.innerHTML = '';
        
        runTerminalStep();
    }

    function closeModal() {
        registerModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (registerModal && modalClose) {
        openModalBtns.forEach(btn => {
            if (btn) btn.addEventListener('click', () => openModal());
        });
        
        eventTriggerBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const eventName = btn.getAttribute('data-event');
                openModal(eventName);
            });
        });
        
        modalClose.addEventListener('click', closeModal);
        registerModal.addEventListener('click', (e) => {
            if (e.target === registerModal) closeModal();
        });
    }

    function runTerminalStep() {
        if (!terminalFlow) return;
        
        const line = document.createElement('div');
        line.className = 'terminal-line';
        
        switch (currentStep) {
            case 0:
                typeText(line, '> INITIALIZING AUTHORIZATION STAGE...', 'cyan-color', () => {
                    setTimeout(() => {
                        currentStep = 1;
                        runTerminalStep();
                    }, 500);
                });
                terminalFlow.appendChild(line);
                break;
                
            case 1:
                line.innerHTML = `
                    <span class="terminal-prompt">> INPUT CODENAME (OPERATIONAL HANDLE):</span>
                    <div class="terminal-input-wrapper">
                        <span class="terminal-arrow">&gt;&gt;</span>
                        <input type="text" class="terminal-input" id="input-codename" autocomplete="off" autofocus>
                    </div>
                `;
                terminalFlow.appendChild(line);
                const codenameInput = document.getElementById('input-codename');
                codenameInput.focus();
                
                codenameInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && codenameInput.value.trim() !== '') {
                        registrationData.codename = codenameInput.value.trim();
                        codenameInput.disabled = true;
                        currentStep = 2;
                        runTerminalStep();
                    }
                });
                break;
                
            case 2:
                line.innerHTML = `
                    <span class="terminal-prompt">> INPUT FREQUENCY INTERFACE (EMAIL):</span>
                    <div class="terminal-input-wrapper">
                        <span class="terminal-arrow">&gt;&gt;</span>
                        <input type="email" class="terminal-input" id="input-email" autocomplete="off">
                    </div>
                `;
                terminalFlow.appendChild(line);
                const emailInput = document.getElementById('input-email');
                emailInput.focus();
                
                emailInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' && validateEmail(emailInput.value.trim())) {
                        registrationData.email = emailInput.value.trim();
                        emailInput.disabled = true;
                        if (registrationData.battlefield) {
                            currentStep = 4;
                        } else {
                            currentStep = 3;
                        }
                        runTerminalStep();
                    } else if (e.key === 'Enter') {
                        const err = document.createElement('div');
                        err.className = 'terminal-prompt';
                        err.style.color = '#ff5555';
                        err.textContent = 'ERR: INVALID FREQUENCY FORMAT. TRY AGAIN.';
                        terminalFlow.appendChild(err);
                        emailInput.value = '';
                    }
                });
                break;
                
            case 3:
                line.innerHTML = `
                    <span class="terminal-prompt">> SELECT TARGET BATTLEFIELD PATHWAY:</span>
                    <ul class="terminal-options">
                        <li class="terminal-option-item" data-opt="Hackathon">[1] HACKATHON: BUILD. BREAK. INNOVATE.</li>
                        <li class="terminal-option-item" data-opt="Capture The Flag">[2] CAPTURE THE FLAG: FIND FLAGS.</li>
                        <li class="terminal-option-item" data-opt="Bug Bounty">[3] BUG BOUNTY: HUNT AND REPORT.</li>
                        <li class="terminal-option-item" data-opt="Cyber Workshops">[4] WORKSHOPS: DEFENSIVE TRAINING.</li>
                        <li class="terminal-option-item" data-opt="Tech Talks">[5] TECH TALKS: INDUSTRIAL SESSIONS.</li>
                    </ul>
                    <div class="terminal-input-wrapper" style="margin-top: 10px;">
                        <span class="terminal-arrow">&gt;&gt;</span>
                        <input type="text" class="terminal-input" id="input-battlefield" autocomplete="off" placeholder="Enter option index (1-5)">
                    </div>
                `;
                terminalFlow.appendChild(line);
                
                const bfInput = document.getElementById('input-battlefield');
                const bfOptions = document.querySelectorAll('.terminal-option-item');
                
                bfInput.focus();
                
                bfOptions.forEach((opt, idx) => {
                    opt.addEventListener('click', () => {
                        registrationData.battlefield = opt.getAttribute('data-opt');
                        bfInput.value = idx + 1;
                        bfInput.disabled = true;
                        currentStep = 4;
                        runTerminalStep();
                    });
                });
                
                bfInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const val = parseInt(bfInput.value.trim());
                        if (val >= 1 && val <= 5) {
                            const selectedOpt = bfOptions[val - 1];
                            registrationData.battlefield = selectedOpt.getAttribute('data-opt');
                            bfInput.disabled = true;
                            currentStep = 4;
                            runTerminalStep();
                        } else {
                            const err = document.createElement('div');
                            err.className = 'terminal-prompt';
                            err.style.color = '#ff5555';
                            err.textContent = 'ERR: VAL MUST BE BETWEEN 1 AND 5.';
                            terminalFlow.appendChild(err);
                            bfInput.value = '';
                        }
                    }
                });
                break;
                
            case 4:
                line.innerHTML = `
                    <span class="terminal-prompt">> CONFIRM ENROLLMENT TELEMETRY:</span>
                    <div style="margin: 8px 0 8px 14px; color: #a9a9c2;">
                        CODENAME: ${registrationData.codename}<br>
                        FREQUENCY: ${registrationData.email}<br>
                        BATTLEFIELD: ${registrationData.battlefield.toUpperCase()}<br>
                    </div>
                    <div class="terminal-input-wrapper">
                        <span class="terminal-prompt">PROCEED WITH GENERATING GATEKEY? (Y/N):</span>
                        <span class="terminal-arrow" style="margin-left: 8px;">&gt;&gt;</span>
                        <input type="text" class="terminal-input" id="input-confirm" autocomplete="off">
                    </div>
                `;
                terminalFlow.appendChild(line);
                
                const confirmInput = document.getElementById('input-confirm');
                confirmInput.focus();
                
                confirmInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        const ans = confirmInput.value.trim().toLowerCase();
                        if (ans === 'y' || ans === 'yes') {
                            confirmInput.disabled = true;
                            currentStep = 5;
                            runTerminalStep();
                        } else if (ans === 'n' || ans === 'no') {
                            terminalFlow.innerHTML = '';
                            currentStep = 1;
                            runTerminalStep();
                        } else {
                            confirmInput.value = '';
                        }
                    }
                });
                break;
                
            case 5:
                const finalToken = `CC-${Math.floor(1000 + Math.random()*9000)}-${Math.floor(1000 + Math.random()*9000)}`;
                typeText(line, `> GENERATING CRYPTOGRAPHIC KEY CARD...`, 'cyan-color', () => {
                    setTimeout(() => {
                        const successLine = document.createElement('div');
                        successLine.innerHTML = `
                            <p style="color: #50fa7b; margin-top: 10px;">===================================================</p>
                            <p style="color: #50fa7b; font-weight: bold;">ACCESS GRANTED. ENROLLMENT COMMITTED TO MAINNET.</p>
                            <p style="color: #50fa7b;">===================================================</p>
                            <p style="margin-top: 12px; color: #fff;">
                                TARGET NODE: <span class="cyan-color">${registrationData.battlefield.toUpperCase()}</span><br>
                                SECURE TOKEN ID: <span class="accent-color font-mono">${finalToken}</span>
                            </p>
                            <p style="margin-top: 14px; font-size: 11px; color: var(--color-text-muted);">
                                *Save this secure token. Use it to authenticate at the registration deck.
                            </p>
                        `;
                        terminalFlow.appendChild(successLine);
                    }, 800);
                });
                terminalFlow.appendChild(line);
                break;
        }
        
        const terminalBody = document.getElementById('modal-terminal-content');
        if (terminalBody) {
            terminalBody.scrollTop = terminalBody.scrollHeight;
        }
    }

    function typeText(element, text, className, callback) {
        element.className = `terminal-line ${className}`;
        let charIndex = 0;
        const timer = setInterval(() => {
            element.textContent += text[charIndex];
            charIndex++;
            if (charIndex >= text.length) {
                clearInterval(timer);
                if (callback) callback();
            }
        }, 30);
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
});
