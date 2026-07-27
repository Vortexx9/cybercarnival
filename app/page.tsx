"use client";

import React, { useEffect, useRef, useState } from "react";
import { InfiniteSliderBasic } from "@/components/ui/demo";
import { HackingTerminal } from "@/components/ui/hacking-terminal";

// --- Types ---
interface Particle {
  x: number;
  y: number;
  size: number;
  speedY: number;
  opacity: number;
  drift: number;
}

interface GlobePoint {
  x: number;
  y: number;
  z: number;
  originalX: number;
  originalY: number;
  originalZ: number;
}

interface GlobeNode extends GlobePoint {
  color: string;
  size: number;
  pulse: number;
}

interface LogLine {
  time: string;
  type: "ALERT" | "SUCCESS" | "BOUNTY" | "CONN" | "WARN" | "SYS";
  user: string;
  challenge?: string;
  detail: string;
  points?: number;
}

interface TerminalLog {
  text: string;
  className?: string;
}

export default function Home() {
  // --- Refs ---
  const gridCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const globeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const statsRef = useRef<HTMLDivElement | null>(null);
  const timelineScrollRef = useRef<HTMLDivElement | null>(null);
  const timelineLineRef = useRef<HTMLDivElement | null>(null);
  const cursorRef = useRef<HTMLDivElement | null>(null);

  // --- States ---
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  
  // Stats Counters
  const [statComp, setStatComp] = useState(0);
  const [statEnth, setStatEnth] = useState(0);
  const [statChal, setStatChal] = useState(0);
  const [statsAnimated, setStatsAnimated] = useState(false);

  // FAQ Accordion
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Live Hacking Log Feed
  const [logFeed, setLogFeed] = useState<LogLine[]>([
    { time: "22:04:12", type: "SYS", user: "SYSTEM", detail: "Command Overwatch Online. Initializing terminal streams..." },
    { time: "22:04:15", type: "SYS", user: "SYSTEM", detail: "Listening to active battlefield nodes. Stand by..." }
  ]);

  // Modal Registration State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [registrationState, setRegistrationState] = useState({
    step: 0,
    codename: "",
    email: "",
    battlefield: "",
    confirm: "",
    token: ""
  });
  const [modalInput, setModalInput] = useState("");
  const [modalLogs, setModalLogs] = useState<TerminalLog[]>([]);
  const modalTerminalEndRef = useRef<HTMLDivElement | null>(null);

  // Mouse Coordinates for Grid Particle effects
  const mouseCoords = useRef({ x: 0, y: 0 });

  // --- Effect: Scrolling and Navigation ---
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);

      // Active Section Highlighting
      const sections = ["home", "events", "about", "timeline", "leaderboard", "sponsors", "faq"];
      let current = "home";

      for (const sectionId of sections) {
        const el = document.getElementById(sectionId);
        if (el) {
          const top = el.offsetTop;
          if (window.scrollY >= top - 150) {
            current = sectionId;
          }
        }
      }
      setActiveSection(current);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // --- Effect: Cursor Follower ---
  useEffect(() => {
    const handleMouseMove = (e: MouseMoveEvent | any) => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = "1";
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top = `${e.clientY}px`;
      }
    };
    
    const handleMouseLeave = () => {
      if (cursorRef.current) {
        cursorRef.current.style.opacity = "0";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  // --- Effect: Canvas 1 - scrolling perspective grid ---
  useEffect(() => {
    const canvas = gridCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const handleCanvasMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseCoords.current.x = e.clientX - rect.left;
      mouseCoords.current.y = e.clientY - rect.top;
    };
    document.addEventListener("mousemove", handleCanvasMouseMove);

    // Initial Particles
    const particles: Particle[] = [];
    const numParticles = 45;
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
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // 3D Perspective Grid
      ctx.strokeStyle = "rgba(157, 78, 223, 0.08)";
      ctx.lineWidth = 1;

      const horizon = height * 0.45;
      const numLines = 24;

      // Longitudinal lines
      for (let i = 0; i <= numLines; i++) {
        const xVal = (i / numLines) * width;
        ctx.beginPath();
        ctx.moveTo(xVal, horizon);
        const cursorForce = (xVal - mouseCoords.current.x) * 0.08;
        ctx.lineTo(xVal + (xVal - width / 2) * 1.5 + cursorForce, height);
        ctx.stroke();
      }

      // Horizontal lines moving down
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

      // Render and drift particles
      particles.forEach(p => {
        p.y -= p.speedY;
        p.x += p.drift + (mouseCoords.current.x - width / 2) * 0.0005;

        if (p.y < horizon) {
          p.y = height + Math.random() * 40;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.shadowBlur = 8;
        ctx.shadowColor = "#c77dff";
        ctx.fillStyle = `rgba(199, 125, 255, ${p.opacity})`;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousemove", handleCanvasMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- Effect: Canvas 2 - 3D Node Globe ---
  useEffect(() => {
    const canvas = globeCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = canvas.offsetWidth);
    let height = (canvas.height = canvas.offsetHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.offsetWidth;
      height = canvas.height = canvas.offsetHeight;
    };
    window.addEventListener("resize", handleResize);

    const points: GlobePoint[] = [];
    const globeRadius = 150;
    const numSegments = 14;
    const numRings = 14;

    // Generate sphere points
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

    // Dynamic node packets
    const nodes: GlobeNode[] = [];
    const numNodes = 20;
    for (let i = 0; i < numNodes; i++) {
      const phi = Math.random() * Math.PI;
      const theta = Math.random() * Math.PI * 2;
      const x = globeRadius * Math.sin(phi) * Math.cos(theta);
      const y = globeRadius * Math.cos(phi);
      const z = globeRadius * Math.sin(phi) * Math.sin(theta);
      nodes.push({
        x, y, z,
        originalX: x, originalY: y, originalZ: z,
        color: Math.random() > 0.45 ? "#9d4edf" : "#00f5ff",
        size: Math.random() * 3 + 2.5,
        pulse: Math.random() * Math.PI
      });
    }

    let angleY = 0.003;
    let angleX = 0.001;
    let targetAngleY = 0.003;
    let targetAngleX = 0.001;
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;

    const handleMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) {
        const rect = canvas.getBoundingClientRect();
        const relativeX = e.clientX - rect.left - width / 2;
        const relativeY = e.clientY - rect.top - height / 2;
        targetAngleY = relativeX * 0.00003;
        targetAngleX = relativeY * 0.00003;
        return;
      }
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      angleY += deltaX * 0.008;
      angleX += deltaY * 0.008;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const handleMouseUp = () => {
      isDragging = false;
    };

    canvas.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    const rotX = (p: GlobePoint, pitch: number) => {
      const cos = Math.cos(pitch);
      const sin = Math.sin(pitch);
      const y = p.y * cos - p.z * sin;
      const z = p.y * sin + p.z * cos;
      p.y = y;
      p.z = z;
    };

    const rotY = (p: GlobePoint, yaw: number) => {
      const cos = Math.cos(yaw);
      const sin = Math.sin(yaw);
      const x = p.x * cos - p.z * sin;
      const z = p.x * sin + p.z * cos;
      p.x = x;
      p.z = z;
    };

    const focalLength = 300;
    let animationFrameId: number;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      if (!isDragging) {
        angleY += (targetAngleY - angleY) * 0.05 + 0.0018;
        angleX += (targetAngleX - angleX) * 0.05 + 0.0005;
      }

      const projected: { screenX: number; screenY: number; depth: number }[] = [];

      points.forEach(p => {
        rotY(p, angleY);
        rotX(p, angleX);

        const scale = focalLength / (focalLength + p.z);
        projected.push({
          screenX: centerX + p.x * scale,
          screenY: centerY + p.y * scale,
          depth: p.z
        });
      });

      // Draw wireframe grid rings
      ctx.strokeStyle = "rgba(157, 78, 223, 0.07)";
      ctx.lineWidth = 0.5;

      // Draw horizontal bands
      for (let i = 0; i < numRings; i++) {
        ctx.beginPath();
        for (let j = 0; j < numSegments; j++) {
          const idx = i * numSegments + j;
          const nextIdx = i * numSegments + ((j + 1) % numSegments);
          if (projected[idx] && projected[nextIdx] && points[idx].z < 50) {
            ctx.moveTo(projected[idx].screenX, projected[idx].screenY);
            ctx.lineTo(projected[nextIdx].screenX, projected[nextIdx].screenY);
          }
        }
        ctx.stroke();
      }

      // Draw vertical lines
      for (let j = 0; j < numSegments; j++) {
        ctx.beginPath();
        for (let i = 0; i < numRings - 1; i++) {
          const idx = i * numSegments + j;
          const nextIdx = (i + 1) * numSegments + j;
          if (projected[idx] && projected[nextIdx] && points[idx].z < 50) {
            ctx.moveTo(projected[idx].screenX, projected[idx].screenY);
            ctx.lineTo(projected[nextIdx].screenX, projected[nextIdx].screenY);
          }
        }
        ctx.stroke();
      }

      // Draw active node packets
      nodes.forEach(n => {
        rotY(n, angleY);
        rotX(n, angleX);

        n.pulse += 0.05;
        const sizeOffset = Math.sin(n.pulse) * 1.5;

        const scale = focalLength / (focalLength + n.z);
        const screenX = centerX + n.x * scale;
        const screenY = centerY + n.y * scale;

        const opacity = n.z > 0 ? 0.2 : 0.85;

        ctx.fillStyle = n.color;
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.5, n.size + sizeOffset) * scale, 0, Math.PI * 2);

        if (n.z < 0) {
          ctx.shadowBlur = 10;
          ctx.shadowColor = n.color;
        }
        ctx.fillStyle = n.color === "#00f5ff" ? `rgba(0, 245, 255, ${opacity})` : `rgba(157, 78, 223, ${opacity})`;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Vector brackets
        if (n.z < -100 && Math.abs(sizeOffset) > 1.2) {
          ctx.strokeStyle = "rgba(0, 245, 255, 0.3)";
          ctx.lineWidth = 1;
          ctx.beginPath();
          const bracket = 8 * scale;
          ctx.moveTo(screenX - bracket, screenY - bracket / 2);
          ctx.lineTo(screenX - bracket, screenY - bracket);
          ctx.lineTo(screenX - bracket / 2, screenY - bracket);

          ctx.moveTo(screenX + bracket, screenY - bracket / 2);
          ctx.lineTo(screenX + bracket, screenY - bracket);
          ctx.lineTo(screenX + bracket / 2, screenY - bracket);
          ctx.stroke();
        }
      });

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // --- Effect: Card Tilt 3D Handlers ---
  const handleCardTiltMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const width = rect.width;
    const height = rect.height;

    const rotX = -((y - height / 2) / height) * 20; // 20 deg max
    const rotY = ((x - width / 2) / width) * 20;

    card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.02, 1.02, 1.02)`;
  };

  const handleCardTiltMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  // --- Effect: Stats count-up (IntersectionObserver) ---
  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting && !statsAnimated) {
            setStatsAnimated(true);

            // Animate Stats
            const animateVal = (target: number, setter: React.Dispatch<React.SetStateAction<number>>, duration: number) => {
              let start = 0;
              const stepTime = 16;
              const steps = duration / stepTime;
              const inc = target / steps;
              const timer = setInterval(() => {
                start += inc;
                if (start >= target) {
                  setter(target);
                  clearInterval(timer);
                } else {
                  setter(Math.floor(start));
                }
              }, stepTime);
            };

            animateVal(24, setStatComp, 1500);
            animateVal(1000, setStatEnth, 1800);
            animateVal(50, setStatChal, 1500);
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [statsAnimated]);

  // --- Timeline Scroll & Nodes light-up ---
  const handleTimelineScroll = () => {
    const scrollContainer = timelineScrollRef.current;
    const scrollLine = timelineLineRef.current;
    if (!scrollContainer || !scrollLine) return;

    const maxScroll = scrollContainer.scrollWidth - scrollContainer.clientWidth;
    const percent = maxScroll > 0 ? (scrollContainer.scrollLeft / maxScroll) * 100 : 0;

    // Line illumination
    scrollLine.style.background = `linear-gradient(90deg, #9d4edf 0%, #9d4edf ${percent}%, rgba(157, 78, 223, 0.1) ${percent + 8}%, rgba(157, 78, 223, 0.1) 100%)`;

    // Highlight timeline nodes in viewport
    const nodes = scrollContainer.querySelectorAll(".timeline-node");
    const containerRect = scrollContainer.getBoundingClientRect();
    nodes.forEach(node => {
      const rect = node.getBoundingClientRect();
      if (rect.left - containerRect.left < containerRect.width * 0.7) {
        node.classList.add("active");
      } else {
        node.classList.remove("active");
      }
    });
  };

  // Drag to scroll timeline
  const timelineDragState = useRef({ isDown: false, startX: 0, scrollLeft: 0 });
  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    const el = timelineScrollRef.current;
    if (!el) return;
    timelineDragState.current = {
      isDown: true,
      startX: e.pageX - el.offsetLeft,
      scrollLeft: el.scrollLeft
    };
  };

  const handleTimelineMouseMove = (e: React.MouseEvent) => {
    if (!timelineDragState.current.isDown) return;
    const el = timelineScrollRef.current;
    if (!el) return;
    e.preventDefault();
    const x = e.pageX - el.offsetLeft;
    const walk = (x - timelineDragState.current.startX) * 1.5;
    el.scrollLeft = timelineDragState.current.scrollLeft - walk;
    handleTimelineScroll();
  };

  const handleTimelineMouseUpOrLeave = () => {
    timelineDragState.current.isDown = false;
  };

  // --- Live telemetry feed simulator ---
  useEffect(() => {
    const users = ["USER_742", "TEAM_ZERO_DAY", "BUFF_OVERFLOW", "SYN_ATTACKERS", "NULL_POINTER", "GHOST_DEV", "SUDO_SUccess", "FLAG_HUNTER", "HEX_DEMON"];
    const chals = ["FLAG_WEB_03", "CRYPTO_05", "PWN_REVERSE_01", "FORENSICS_02", "OSINT_08", "INFRA_EXPLOIT", "BUFFER_SHELL"];
    const types: LogLine["type"][] = ["ALERT", "SUCCESS", "BOUNTY", "CONN", "WARN", "SYS"];

    const interval = setInterval(() => {
      const type = types[Math.floor(Math.random() * types.length)];
      const user = users[Math.floor(Math.random() * users.length)];
      const challenge = chals[Math.floor(Math.random() * chals.length)];
      
      const time = new Date();
      const timeStr = `${String(time.getHours()).padStart(2, "0")}:${String(time.getMinutes()).padStart(2, "0")}:${String(time.getSeconds()).padStart(2, "0")}`;

      let detail = "";
      switch (type) {
        case "ALERT":
          detail = `captured ${challenge} (+250 pts)`;
          break;
        case "SUCCESS":
          detail = `solved ${challenge} (+150 pts)`;
          break;
        case "BOUNTY":
          detail = `disclosed a vulnerability in ${challenge}`;
          break;
        case "CONN":
          detail = `connected to node NODE_0x${Math.floor(Math.random() * 255).toString(16).toUpperCase()}`;
          break;
        case "WARN":
          detail = `attempted injection blocked on ${challenge}`;
          break;
        default:
          detail = `Firewall status synced. Active tunnels: ${Math.floor(Math.random() * 40 + 20)}`;
      }

      setLogFeed(prev => {
        const next = [...prev, { time: timeStr, type, user, challenge, detail }];
        if (next.length > 15) next.shift(); // Limit logs length
        return next;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, []);

  // --- Modal CLI Terminal Interaction Flow ---
  const handleOpenRegistration = (defaultBf = "") => {
    setIsModalOpen(true);
    setModalLogs([
      { text: "=========================================================", className: "text-zinc-500" },
      { text: "CYBER CARNIVAL SECURE REGISTRATION NODE", className: "text-[#9d4edf] font-bold" },
      { text: "AUTHORIZED ACCESS ONLY. ALL INPUTS ARE SHIELDED.", className: "text-zinc-500" },
      { text: "=========================================================", className: "text-zinc-500" },
      { text: "Initializing authorization stage..." },
      { text: " " },
      { text: "INPUT CODENAME (OPERATIONAL HANDLE):", className: "text-[#00f5ff]" }
    ]);
    setRegistrationState({
      step: 1, // Start on step 1 (codename input)
      codename: "",
      email: "",
      battlefield: defaultBf,
      confirm: "",
      token: ""
    });
    setModalInput("");
  };

  const handleCloseRegistration = () => {
    setIsModalOpen(false);
  };

  // Submit terminal input
  const handleTerminalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const input = modalInput.trim();
    if (!input && registrationState.step !== 3) return; // Allow step 3 options clicking

    const currentLogs = [...modalLogs, { text: `>> ${input}`, className: "text-[#c77dff]" }];
    setModalLogs(currentLogs);
    setModalInput("");

    let nextStep = registrationState.step;
    let nextState = { ...registrationState };

    if (registrationState.step === 1) {
      // Codename submitted
      nextState.codename = input;
      nextStep = 2;
      setRegistrationState(nextState);
      setModalLogs(prev => [
        ...prev,
        { text: `>> ${input}`, className: "text-[#c77dff]" },
        { text: " " },
        { text: "INPUT FREQUENCY INTERFACE (EMAIL):", className: "text-[#00f5ff]" }
      ]);
      setRegistrationState(prev => ({ ...prev, codename: input, step: 2 }));
    } 
    else if (registrationState.step === 2) {
      // Email verification
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (emailRegex.test(input)) {
        nextState.email = input;
        setRegistrationState(nextState);

        if (nextState.battlefield) {
          // Pre-selected via card
          nextStep = 4;
          setRegistrationState(prev => ({ ...prev, email: input, step: 4 }));
          setModalLogs(prev => [
            ...prev,
            { text: `>> ${input}`, className: "text-[#c77dff]" },
            { text: " " },
            { text: "CONFIRM ENROLLMENT TELEMETRY:", className: "text-[#00f5ff]" },
            { text: `CODENAME: ${nextState.codename}` },
            { text: `FREQUENCY: ${input}` },
            { text: `BATTLEFIELD: ${nextState.battlefield.toUpperCase()}` },
            { text: " " },
            { text: "PROCEED WITH GENERATING GATEKEY? (Y/N):", className: "text-[#00f5ff]" }
          ]);
        } else {
          nextStep = 3;
          setRegistrationState(prev => ({ ...prev, email: input, step: 3 }));
          setModalLogs(prev => [
            ...prev,
            { text: `>> ${input}`, className: "text-[#c77dff]" },
            { text: " " },
            { text: "SELECT TARGET BATTLEFIELD PATHWAY:", className: "text-[#00f5ff]" },
            { text: "[1] HACKATHON: BUILD. BREAK. INNOVATE.", className: "cursor-pointer text-zinc-400 hover:text-[#00f5ff]" },
            { text: "[2] CAPTURE THE FLAG: FIND FLAGS AND PWN.", className: "cursor-pointer text-zinc-400 hover:text-[#00f5ff]" },
            { text: "[3] BUG BOUNTY: HUNT AND REPORT EXPLOITS.", className: "cursor-pointer text-zinc-400 hover:text-[#00f5ff]" },
            { text: "[4] CYBER WORKSHOPS: ETHICAL DEFENSE TRAINING.", className: "cursor-pointer text-zinc-400 hover:text-[#00f5ff]" },
            { text: "[5] TECH TALKS: ATTACK VECTORS PANELS.", className: "cursor-pointer text-zinc-400 hover:text-[#00f5ff]" },
            { text: " " },
            { text: "ENTER OPTION INDEX (1-5):", className: "text-[#00f5ff]" }
          ]);
        }
      } else {
        setModalLogs(prev => [
          ...prev,
          { text: `>> ${input}`, className: "text-[#c77dff]" },
          { text: "ERR: INVALID FREQUENCY FORMAT. TRY AGAIN.", className: "text-red-500 font-bold" }
        ]);
      }
    } 
    else if (registrationState.step === 3) {
      // Battlefield selector
      const val = parseInt(input);
      const fields = ["Hackathon", "Capture The Flag", "Bug Bounty", "Cyber Workshops", "Tech Talks"];
      if (val >= 1 && val <= 5) {
        const bf = fields[val - 1];
        nextState.battlefield = bf;
        nextStep = 4;
        setRegistrationState(prev => ({ ...prev, battlefield: bf, step: 4 }));
        setModalLogs(prev => [
          ...prev,
          { text: `>> ${input}`, className: "text-[#c77dff]" },
          { text: " " },
          { text: "CONFIRM ENROLLMENT TELEMETRY:", className: "text-[#00f5ff]" },
          { text: `CODENAME: ${registrationState.codename}` },
          { text: `FREQUENCY: ${registrationState.email}` },
          { text: `BATTLEFIELD: ${bf.toUpperCase()}` },
          { text: " " },
          { text: "PROCEED WITH GENERATING GATEKEY? (Y/N):", className: "text-[#00f5ff]" }
        ]);
      } else {
        setModalLogs(prev => [
          ...prev,
          { text: `>> ${input}`, className: "text-[#c77dff]" },
          { text: "ERR: SELECTION MUST BE BETWEEN 1 AND 5.", className: "text-red-500" }
        ]);
      }
    } 
    else if (registrationState.step === 4) {
      // Confirmation
      const ans = input.toLowerCase();
      if (ans === "y" || ans === "yes") {
        const token = `CC-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
        setRegistrationState(prev => ({ ...prev, token, step: 5 }));
        setModalLogs(prev => [
          ...prev,
          { text: `>> ${input}`, className: "text-[#c77dff]" },
          { text: " " },
          { text: "GENERATING CRYPTOGRAPHIC KEY CARD...", className: "text-[#00f5ff]" },
          { text: "===================================================", className: "text-green-500" },
          { text: "ACCESS GRANTED. ENROLLMENT COMMITTED TO MAINNET.", className: "text-green-500 font-bold" },
          { text: "===================================================", className: "text-green-500" },
          { text: `TARGET NODE: ${registrationState.battlefield.toUpperCase()}` },
          { text: `SECURE TOKEN ID: ${token}`, className: "text-[#9d4edf] font-bold" },
          { text: " " },
          { text: "*Save this secure token. Use it to authenticate at the registration deck.", className: "text-zinc-500 text-xs" }
        ]);
      } else if (ans === "n" || ans === "no") {
        // Restart
        setRegistrationState({
          step: 1,
          codename: "",
          email: "",
          battlefield: "",
          confirm: "",
          token: ""
        });
        setModalLogs([
          { text: "Resetting enrollment flow..." },
          { text: " " },
          { text: "INPUT CODENAME (OPERATIONAL HANDLE):", className: "text-[#00f5ff]" }
        ]);
      } else {
        setModalLogs(prev => [
          ...prev,
          { text: `>> ${input}`, className: "text-[#c77dff]" },
          { text: "ERR: RESPONSE MUST BE (Y)ES OR (N)O.", className: "text-red-500" }
        ]);
      }
    }
  };

  // Direct option click selector on step 3
  const handleTerminalOptionClick = (bfName: string, index: number) => {
    if (registrationState.step !== 3) return;
    setRegistrationState(prev => ({ ...prev, battlefield: bfName, step: 4 }));
    setModalLogs(prev => [
      ...prev,
      { text: `>> [Option selected: ${bfName}]`, className: "text-[#c77dff]" },
      { text: " " },
      { text: "CONFIRM ENROLLMENT TELEMETRY:", className: "text-[#00f5ff]" },
      { text: `CODENAME: ${registrationState.codename}` },
      { text: `FREQUENCY: ${registrationState.email}` },
      { text: `BATTLEFIELD: ${bfName.toUpperCase()}` },
      { text: " " },
      { text: "PROCEED WITH GENERATING GATEKEY? (Y/N):", className: "text-[#00f5ff]" }
    ]);
  };

  // Modal Auto-scroll
  useEffect(() => {
    if (modalTerminalEndRef.current) {
      modalTerminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [modalLogs]);

  return (
    <div className="cyber-theme relative min-h-screen bg-[#050509]">
      {/* Visual Overlay elements */}
      <div className="scanlines" />
      <div className="noise-overlay" />
      <div ref={cursorRef} className="glow-cursor" id="custom-cursor" />

      {/* Navigation Header */}
      <header className={`navbar ${scrolled ? "scrolled" : ""}`} id="site-header">
        <div className="nav-container">
          <a href="#home" className="nav-logo">
            <span className="glitch-text" data-text="CYBER">CYBER</span>
            <span className="logo-space text-[#c77dff]">CARNIVAL</span>
          </a>
          <nav className={`nav-links ${mobileMenuOpen ? "active" : ""}`} id="nav-menu">
            <a href="#home" className={`nav-link ${activeSection === "home" ? "active" : ""}`}>HOME</a>
            <a href="#events" className={`nav-link ${activeSection === "events" ? "active" : ""}`}>EVENTS</a>
            <a href="#about" className={`nav-link ${activeSection === "about" ? "active" : ""}`}>ABOUT</a>
            <a href="#timeline" className={`nav-link ${activeSection === "timeline" ? "active" : ""}`}>TIMELINE</a>
            <a href="#leaderboard" className={`nav-link ${activeSection === "leaderboard" ? "active" : ""}`}>LIVE FEED</a>
            <a href="#sponsors" className={`nav-link ${activeSection === "sponsors" ? "active" : ""}`}>SPONSORS</a>
            <a href="#faq" className={`nav-link ${activeSection === "faq" ? "active" : ""}`}>FAQ</a>
          </nav>
          
          <button onClick={() => handleOpenRegistration()} className="nav-cta-btn btn-magnetic">
            <span className="btn-brackets">[</span>
            <span className="btn-text">REGISTER NOW</span>
            <span className="btn-brackets">]</span>
          </button>

          {/* Hamburger toggle */}
          <button 
            className="mobile-toggle" 
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle Menu"
          >
            <span className="bar" style={{ transform: mobileMenuOpen ? "rotate(-45deg) translate(-5px, 6px)" : "none" }}></span>
            <span className="bar" style={{ opacity: mobileMenuOpen ? "0" : "1" }}></span>
            <span className="bar" style={{ transform: mobileMenuOpen ? "rotate(45deg) translate(-5px, -6px)" : "none" }}></span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section id="home" className="hero-section">
        <div className="absolute inset-0 z-0 pointer-events-none opacity-30">
          <HackingTerminal
            colorPurple="#9d4edf"
            colorCyan="#00f5ff"
            fontSize={14}
            speed={35}
          />
        </div>

        {/* HUD Elements */}
        <div className="hud-frame top-left">SYS_STATUS: ACTIVE // LATENCY: 12MS</div>
        <div className="hud-frame top-right">SECTOR: 0x4F // BATTLEGROUND_ONLINE</div>
        <div className="hud-frame bottom-left">SECURE_CHANNEL: SHIELDED</div>
        <div className="hud-frame bottom-right">COORD: 35.6895° N, 139.6917° E</div>
        <div className="hud-lines" />
        <div className="hud-crosshair" />

        <div className="hero-content">
          <div className="cyber-badge animate-flicker">
            <span className="badge-dot" /> SECURE NETWORK NODE OVERWATCH
          </div>
          <h1 className="hero-title glitch-heading" data-text="CYBER CARNIVAL">CYBER CARNIVAL</h1>
          <h2 className="hero-subtitle">ENTER THE DIGITAL BATTLEFIELD</h2>
          <p className="hero-description text-[#a9a9c2]">
            A cybersecurity symposium where hackers, developers, researchers, and security enthusiasts come together to compete, learn, exploit, and defend.
          </p>
          <div className="hero-tags font-mono">
            <span>CYBERSECURITY</span>
            <span className="divider">•</span>
            <span>COMPETITION</span>
            <span className="divider">•</span>
            <span>INNOVATION</span>
          </div>
          <div className="hero-cta-container">
            <button onClick={() => handleOpenRegistration()} className="btn btn-cyber btn-magnetic">
              <span className="btn-glow" />
              <span className="btn-inner">REGISTER NOW</span>
            </button>
            <a href="#events" className="btn btn-secondary btn-magnetic">
              <span className="btn-inner">EXPLORE EVENTS</span>
            </a>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <span className="scroll-text font-mono text-zinc-500">SCROLL TO EXPAND DATA</span>
          <div className="scroll-line">
            <div className="scroll-ball" />
          </div>
        </div>
      </section>

      {/* Events Section */}
      <section id="events" className="events-section section-padding">
        <div className="section-header container">
          <div className="section-badge">// BATTLEGROUND OPTIONS</div>
          <h2 className="section-title">CHOOSE YOUR BATTLEFIELD</h2>
          <div className="title-underline" />
        </div>

        <div className="events-grid container">
          {/* Card 1: Hackathon */}
          <div 
            className="event-card border-glow"
            onMouseMove={handleCardTiltMouseMove}
            onMouseLeave={handleCardTiltMouseLeave}
          >
            <div className="card-corner top-left-corner" />
            <div className="card-corner top-right-corner" />
            <div className="card-corner bottom-left-corner" />
            <div className="card-corner bottom-right-corner" />
            
            <div className="card-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
                <line x1="12" y1="2" x2="12" y2="22" />
              </svg>
            </div>
            <div className="card-badge font-mono">SYS_BUILD</div>
            <h3 className="card-title">HACKATHON</h3>
            <h4 className="card-slogan text-[#00f5ff]">"Build. Break. Innovate."</h4>
            <p className="card-desc text-[#a9a9c2]">
              Build innovative solutions to real-world problems using technology and cybersecurity. Collaborate under pressure and code the future.
            </p>
            <button onClick={() => handleOpenRegistration("Hackathon")} className="card-btn">
              <span className="btn-inner">ENTER HACKATHON</span>
            </button>
          </div>

          {/* Card 2: Capture The Flag */}
          <div 
            className="event-card border-glow"
            onMouseMove={handleCardTiltMouseMove}
            onMouseLeave={handleCardTiltMouseLeave}
          >
            <div className="card-corner top-left-corner" />
            <div className="card-corner top-right-corner" />
            <div className="card-corner bottom-left-corner" />
            <div className="card-corner bottom-right-corner" />
            
            <div className="card-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
                <line x1="4" y1="22" x2="4" y2="15" />
              </svg>
            </div>
            <div className="card-badge font-mono">SYS_ATTACK</div>
            <h3 className="card-title">CAPTURE THE FLAG</h3>
            <h4 className="card-slogan text-[#00f5ff]">"Find the Flag. Own the Challenge."</h4>
            <p className="card-desc text-[#a9a9c2]">
              Jeopardy-style hacking sandbox. Challenges in Web Exploitation, Cryptography, Reverse Engineering, Forensics, OSINT, and Binary Exploitation (Pwn).
            </p>
            <button onClick={() => handleOpenRegistration("Capture The Flag")} className="card-btn">
              <span className="btn-inner">JOIN THE CTF</span>
            </button>
          </div>

          {/* Card 3: Bug Bounty */}
          <div 
            className="event-card border-glow"
            onMouseMove={handleCardTiltMouseMove}
            onMouseLeave={handleCardTiltMouseLeave}
          >
            <div className="card-corner top-left-corner" />
            <div className="card-corner top-right-corner" />
            <div className="card-corner bottom-left-corner" />
            <div className="card-corner bottom-right-corner" />
            
            <div className="card-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M12 2v9" />
                <path d="M8 5h8" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div className="card-badge font-mono">SYS_HUNT</div>
            <h3 className="card-title">BUG BOUNTY</h3>
            <h4 className="card-slogan text-[#00f5ff]">"Think Like an Attacker."</h4>
            <p className="card-desc text-[#a9a9c2]">
              Discover vulnerabilities, exploit weaknesses, and report security flaws. Attack realistic sandbox web servers and secure rewards.
            </p>
            <button onClick={() => handleOpenRegistration("Bug Bounty")} className="card-btn">
              <span className="btn-inner">HUNT FOR BUGS</span>
            </button>
          </div>

          {/* Card 4: Workshops */}
          <div 
            className="event-card border-glow"
            onMouseMove={handleCardTiltMouseMove}
            onMouseLeave={handleCardTiltMouseLeave}
          >
            <div className="card-corner top-left-corner" />
            <div className="card-corner top-right-corner" />
            <div className="card-corner bottom-left-corner" />
            <div className="card-corner bottom-right-corner" />
            
            <div className="card-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <div className="card-badge font-mono">SYS_DEFEND</div>
            <h3 className="card-title">CYBER WORKSHOPS</h3>
            <h4 className="card-slogan text-[#00f5ff]">"Learn From The Defenders."</h4>
            <p className="card-desc text-[#a9a9c2]">
              Hands-on sessions covering ethical hacking, penetration testing, digital forensics, cloud security, and hardware exploit payloads.
            </p>
            <button onClick={() => handleOpenRegistration("Cyber Workshops")} className="card-btn">
              <span className="btn-inner">EXPLORE WORKSHOPS</span>
            </button>
          </div>

          {/* Card 5: Tech Talks */}
          <div 
            className="event-card border-glow"
            onMouseMove={handleCardTiltMouseMove}
            onMouseLeave={handleCardTiltMouseLeave}
          >
            <div className="card-corner top-left-corner" />
            <div className="card-corner top-right-corner" />
            <div className="card-corner bottom-left-corner" />
            <div className="card-corner bottom-right-corner" />
            
            <div className="card-icon">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <div className="card-badge font-mono">SYS_VISION</div>
            <h3 className="card-title">TECH TALKS</h3>
            <h4 className="card-slogan text-[#00f5ff]">"The Future Is Under Attack."</h4>
            <p className="card-desc text-[#a9a9c2]">
              Talks by cybersecurity professionals, security researchers, and industry leaders on state vulnerabilities and ransomware posture.
            </p>
            <button onClick={() => handleOpenRegistration("Tech Talks")} className="card-btn">
              <span className="btn-inner">VIEW SPEAKERS</span>
            </button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about-section section-padding">
        <div className="container about-container">
          <div className="about-content">
            <div className="section-badge">// CORE MISSION</div>
            <h2 className="section-title">MORE THAN A SYMPOSIUM.</h2>
            <div className="title-underline" />
            <p className="about-text text-[#a9a9c2]">
              CYBER CARNIVAL is a collaborative ecosystem designed to test the limits of your cybersecurity skills. Across structured battlefields, we unite red teams, blue teams, researchers, and developers in a unified mission to patch, exploit, secure, and defend tomorrow's infrastructure.
            </p>
            <p className="about-text text-[#a9a9c2]">
              Whether you are a seasoned exploit researcher or a curious junior programmer, our workshops and live hacking modules provide the ultimate platform to showcase talent, discover vulnerabilities, and gain critical insights from top-tier security executives.
            </p>
          </div>

          {/* Animated Statistics Counters */}
          <div ref={statsRef} className="about-stats" id="stats-container">
            <div className="stat-box">
              <div className="stat-gauge-wrapper">
                <svg className="stat-gauge" viewBox="0 0 100 100">
                  <circle className="gauge-bg" cx="50" cy="50" r="42" />
                  <circle 
                    className="gauge-bar gauge-purple" 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    style={{ strokeDashoffset: statsAnimated ? 264 - (95 / 100) * 264 : 264 }}
                  />
                </svg>
                <div className="stat-number font-mono text-white">{statComp}+</div>
              </div>
              <div className="stat-label">HOURS OF COMPETITION</div>
            </div>

            <div className="stat-box">
              <div className="stat-gauge-wrapper">
                <svg className="stat-gauge" viewBox="0 0 100 100">
                  <circle className="gauge-bg" cx="50" cy="50" r="42" />
                  <circle 
                    className="gauge-bar gauge-cyan" 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    style={{ strokeDashoffset: statsAnimated ? 264 - (85 / 100) * 264 : 264 }}
                  />
                </svg>
                <div className="stat-number font-mono text-white">{statEnth}+</div>
              </div>
              <div className="stat-label">CYBER ENTHUSIASTS</div>
            </div>

            <div className="stat-box">
              <div className="stat-gauge-wrapper">
                <svg className="stat-gauge" viewBox="0 0 100 100">
                  <circle className="gauge-bg" cx="50" cy="50" r="42" />
                  <circle 
                    className="gauge-bar gauge-purple" 
                    cx="50" 
                    cy="50" 
                    r="42" 
                    style={{ strokeDashoffset: statsAnimated ? 264 - (75 / 100) * 264 : 264 }}
                  />
                </svg>
                <div className="stat-number font-mono text-white">{statChal}+</div>
              </div>
              <div className="stat-label">DESIGNED CHALLENGES</div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section id="timeline" className="timeline-section section-padding">
        <div className="section-header container text-center">
          <div className="section-badge">// OPERATIONS MAP</div>
          <h2 className="section-title">OPERATIONAL TIMELINE</h2>
          <div className="title-underline" />
          <div className="timeline-scroll-hint font-mono text-zinc-400 mt-6 flex items-center justify-center gap-3 text-[11px] tracking-[0.2em] uppercase">
            <span className="h-[1px] w-8 bg-purple-500/30" />
            <span className="text-[#c77dff] animate-pulse">// DRAG OR SCROLL HORIZONTALLY TO EXPAND MAP</span>
            <span className="h-[1px] w-8 bg-purple-500/30" />
          </div>
        </div>

        {/* Timeline Horizontal Scroller */}
        <div 
          ref={timelineScrollRef}
          className="timeline-outer-container container" 
          id="timeline-scroll-area"
          onMouseDown={handleTimelineMouseDown}
          onMouseMove={handleTimelineMouseMove}
          onMouseUp={handleTimelineMouseUpOrLeave}
          onMouseLeave={handleTimelineMouseUpOrLeave}
          onScroll={handleTimelineScroll}
        >
          <div className="timeline-horizontal">
            <div ref={timelineLineRef} className="timeline-progress-line" id="timeline-line" />
            
            {/* Node 1 */}
            <div className="timeline-node active" data-node="0">
              <div className="node-glow" />
              <div className="node-number font-mono">01</div>
              <div className="node-content">
                <h4 className="node-title text-white">REGISTRATION OPEN</h4>
                <p className="node-desc text-zinc-400">Sign up and form your combat units. Complete validation.</p>
                <span className="node-date font-mono text-[#00f5ff]">JULY 24 - AUG 15</span>
              </div>
            </div>

            {/* Node 2 */}
            <div className="timeline-node active" data-node="1">
              <div className="node-glow" />
              <div className="node-number font-mono">02</div>
              <div className="node-content">
                <h4 className="node-title text-white">QUALIFIERS STAGE</h4>
                <p className="node-desc text-zinc-400">Online challenges in CTF web portals and algorithm filters.</p>
                <span className="node-date font-mono text-[#00f5ff]">AUGUST 18 - 20</span>
              </div>
            </div>

            {/* Node 3 */}
            <div className="timeline-node active" data-node="2">
              <div className="node-glow" />
              <div className="node-number font-mono">03</div>
              <div className="node-content">
                <h4 className="node-title text-white">THE BATTLE BEGINS</h4>
                <p className="node-desc text-zinc-400">Opening ceremony & live event keys released on site.</p>
                <span className="node-date font-mono text-[#00f5ff]">AUGUST 25, 09:00 AM</span>
              </div>
            </div>

            {/* Node 4 */}
            <div className="timeline-node" data-node="3">
              <div className="node-glow" />
              <div className="node-number font-mono">04</div>
              <div className="node-content">
                <h4 className="node-title text-white">FINAL SHOWDOWN</h4>
                <p className="node-desc text-zinc-400">Onsite hardware hackathon defense and live pwn challenges.</p>
                <span className="node-date font-mono text-[#00f5ff]">AUGUST 26, 02:00 PM</span>
              </div>
            </div>

            {/* Node 5 */}
            <div className="timeline-node" data-node="4">
              <div className="node-glow" />
              <div className="node-number font-mono">05</div>
              <div className="node-content">
                <h4 className="node-title text-white">WINNERS ANNOUNCED</h4>
                <p className="node-desc text-zinc-400">Bounty payouts, closing statements, and server shutdown.</p>
                <span className="node-date font-mono text-[#00f5ff]">AUGUST 26, 06:00 PM</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Leaderboard / Live activity feed section */}
      <section id="leaderboard" className="command-center-section section-padding">
        <div className="section-header container">
          <div className="section-badge">// COMMAND CENTER TELEMETRY</div>
          <h2 className="section-title">LIVE SYSTEMS OVERWATCH</h2>
          <div className="title-underline" />
        </div>

        <div className="command-grid container">
          {/* Left Panel: Live log monitor */}
          <div className="terminal-panel border-glow">
            <div className="panel-header">
              <div className="header-dots">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
              </div>
              <div className="panel-title font-mono text-zinc-400">SYS_LOG: live_activity_monitor</div>
              <div className="panel-indicator font-mono blink text-red-400 border border-red-500/20 bg-red-500/5">RECORDING</div>
            </div>
            <div className="panel-body font-mono" id="live-terminal-feed">
              {logFeed.map((log, i) => (
                <div key={i} className="log-line">
                  <span className="log-time text-zinc-500">[{log.time}] </span>
                  {log.type === "ALERT" && <span className="text-red-400 font-bold">[ALERT] </span>}
                  {log.type === "SUCCESS" && <span className="text-green-400 font-bold">[SUCCESS] </span>}
                  {log.type === "BOUNTY" && <span className="text-yellow-200 font-bold">[BOUNTY] </span>}
                  {log.type === "CONN" && <span className="text-blue-400">[CONN] </span>}
                  {log.type === "WARN" && <span className="text-orange-400 font-bold">[WARN] </span>}
                  {log.type === "SYS" && <span className="text-[#00f5ff]">[SYS] </span>}
                  <span className="text-[#c77dff]">{log.user} </span>
                  <span className="text-zinc-300">{log.detail}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Panel: CTF Leaderboard */}
          <div className="leaderboard-panel border-glow">
            <div className="panel-header">
              <div className="header-dots">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
              <div className="panel-title font-mono text-zinc-400">CTF_BOARD: live_rankings</div>
              <div className="panel-status font-mono text-[#00f5ff] border border-[#00f5ff]/20 bg-[#00f5ff]/5">SYNC: OK</div>
            </div>
            <div className="panel-body">
              <table className="leaderboard-table font-mono">
                <thead>
                  <tr className="text-zinc-500 text-xs border-b border-zinc-800">
                    <th className="pb-3 text-left">RANK</th>
                    <th className="pb-3 text-left">CODENAME / TEAM</th>
                    <th className="pb-3 text-left">SOLVED</th>
                    <th className="pb-3 text-left">SCORE</th>
                    <th className="pb-3 text-left">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-900/50">
                  <tr className="rank-first text-[#f1fa8c]">
                    <td className="py-4">01</td>
                    <td className="team-name font-bold">TEAM_ZERO_DAY</td>
                    <td>14/15</td>
                    <td className="accent-color font-bold">2950</td>
                    <td><span className="pulse-indicator online" />ACTIVE</td>
                  </tr>
                  <tr className="rank-second text-zinc-200">
                    <td className="py-4">02</td>
                    <td className="team-name font-bold">BUFF_OVERFLOW</td>
                    <td>12/15</td>
                    <td className="accent-color">2500</td>
                    <td><span className="pulse-indicator online" />ACTIVE</td>
                  </tr>
                  <tr className="rank-third text-[#ffb86c]">
                    <td className="py-4">03</td>
                    <td className="team-name font-bold">SYN_ATTACKERS</td>
                    <td>11/15</td>
                    <td className="accent-color">2350</td>
                    <td><span className="pulse-indicator online" />ACTIVE</td>
                  </tr>
                  <tr className="text-zinc-400">
                    <td className="py-4">04</td>
                    <td className="team-name font-bold">NULL_POINTER</td>
                    <td>10/15</td>
                    <td>2000</td>
                    <td><span className="pulse-indicator online" />ACTIVE</td>
                  </tr>
                  <tr className="text-zinc-400">
                    <td className="py-4">05</td>
                    <td className="team-name font-bold">SUDO_SUccess</td>
                    <td>09/15</td>
                    <td>1850</td>
                    <td><span className="pulse-indicator idle" />IDLE</td>
                  </tr>
                  <tr className="text-zinc-400">
                    <td className="py-4">06</td>
                    <td className="team-name font-bold">HACKER_MANS</td>
                    <td>08/15</td>
                    <td>1600</td>
                    <td><span className="pulse-indicator online" />ACTIVE</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* Sponsors Section */}
      <section id="sponsors" className="sponsors-section section-padding">
        <div className="section-header container">
          <div className="section-badge">// COGNITIVE BACKING</div>
          <h2 className="section-title">POWERED BY</h2>
          <div className="title-underline" />
        </div>
        <div className="w-full py-4 overflow-hidden relative">
          <InfiniteSliderBasic />
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section section-padding">
        <div className="section-header container">
          <div className="section-badge">// INTEL QUERY</div>
          <h2 className="section-title">FREQUENT QUESTIONS</h2>
          <div className="title-underline" />
        </div>

        <div className="faq-accordion container">
          {[
            {
              q: "WHO CAN PARTICIPATE IN CYBER CARNIVAL?",
              a: "CYBER CARNIVAL is open to students, developers, researchers, ethical hackers, and security enthusiasts of all skill levels. If you are passionate about security, code, and debugging infrastructure, you are welcome to enter the battlefield."
            },
            {
              q: "HOW DO THE CTF AND HACKATHON WORK TOGETHER?",
              a: "The CTF runs as a continuous jeopardy-style hacking challenge focused on exploiting specifically vulnerable systems. The Hackathon is a product development sprint where teams build utility prototypes to address critical defensive challenges. You may participate in either or both, provided schedules permit."
            },
            {
              q: "ARE THERE ENTRY FEES OR HARDWARE REQUIREMENTS?",
              a: "Registration and entry are completely free. You must bring your own development terminal (laptop) equipped with standard penetration testing tools or virtualization software suitable for CTF payloads."
            },
            {
              q: "WHAT KIND OF BOUNTIES AND PRIZES ARE OFFERED?",
              a: "We feature a comprehensive cash prize pool for top-performing teams across the CTF and Hackathon, alongside targeted Bug Bounty payouts for approved security disclosures in our designated test-range sandbox."
            }
          ].map((faq, idx) => (
            <div key={idx} className={`faq-item border-glow ${activeFaq === idx ? "active" : ""}`}>
              <button 
                onClick={() => setActiveFaq(prev => (prev === idx ? null : idx))}
                className="faq-question font-mono text-white"
                aria-expanded={activeFaq === idx}
              >
                <span>Q: {faq.q}</span>
                <span className="faq-icon text-[#00f5ff]">{activeFaq === idx ? "−" : "+"}</span>
              </button>
              <div 
                className="faq-answer text-zinc-400"
                style={{ 
                  maxHeight: activeFaq === idx ? "200px" : "0", 
                  paddingBottom: activeFaq === idx ? "24px" : "0",
                  transition: "max-height 0.4s cubic-bezier(0.25, 0.8, 0.25, 1), padding 0.4s ease"
                }}
              >
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Registration Portal Gate */}
      <section className="cta-gate-section section-padding">
        <div className="gate-portal-bg">
          <div className="portal-ring ring-1" />
          <div className="portal-ring ring-2" />
          <div className="portal-ring ring-3" />
        </div>
        
        <div className="container gate-content text-center">
          <h2 className="gate-title glitch-heading text-white" data-text="READY TO ENTER THE MATRIX?">READY TO ENTER THE MATRIX?</h2>
          <p className="gate-text text-[#a9a9c2]">
            Your skills are your weapon. Your curiosity is your advantage. The battlefield awaits your authentication.
          </p>
          <button onClick={() => handleOpenRegistration()} className="btn btn-cyber btn-large btn-magnetic">
            <span className="btn-glow" />
            <span className="btn-inner">INITIALIZE REGISTRATION</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="cyber-footer">
        <div className="container footer-grid">
          <div className="footer-info">
            <h3 className="footer-logo font-mono text-white">CYBER CARNIVAL</h3>
            <p className="footer-desc text-zinc-400">
              An elite symposium designed to test operational cybersecurity limits. Run and maintained by the Digital Defiance Union.
            </p>
            <div className="system-status font-mono text-green-400 border border-green-500/20 bg-green-500/5">
              <span className="status-indicator online animate-flicker" /> CORE SYSTEMS: OPERATIONAL
            </div>
          </div>

          <div className="footer-links">
            <h4 className="footer-title font-mono text-white">CHANNELS</h4>
            <div className="link-grid">
              <a href="#home">Home</a>
              <a href="#events">Events</a>
              <a href="#timeline">Timeline</a>
              <a href="#leaderboard">Live Feed</a>
            </div>
          </div>

          <div className="footer-socials font-mono text-zinc-600">
            <h4 className="footer-title font-mono text-white">SECURITY TELEMETRY</h4>
            <p className="telemetry-log">
              IP: 192.168.42.99<br />
              PORT: 8080<br />
              PROTOCOL: SECURE_WS
            </p>
          </div>
        </div>

        <div className="footer-bottom text-center">
          <p className="copyright font-mono text-zinc-500">&copy; 2026 CYBER CARNIVAL. ALL RIGHTS PRESERVED // DECRYPT_KEY: 0x9D4EDF</p>
        </div>
      </footer>

      {/* Interactive Registration CLI Terminal Modal */}
      {isModalOpen && (
        <div className="modal-overlay active" onClick={handleCloseRegistration}>
          <div className="terminal-modal border-glow" onClick={(e) => e.stopPropagation()}>
            <div className="terminal-header">
              <div className="terminal-dots">
                <span className="dot red bg-[#ff5555]" />
                <span className="dot yellow bg-[#ffb86c]" />
                <span className="dot green bg-[#50fa7b]" />
              </div>
              <div className="terminal-title font-mono text-zinc-400">SECURE_REGISTRATION: node_enrollment.sh</div>
              <button className="terminal-close text-zinc-500" onClick={handleCloseRegistration}>&times;</button>
            </div>
            
            <div className="terminal-body font-mono text-white" id="modal-terminal-content">
              <div className="terminal-interactive-flow">
                {modalLogs.map((log, index) => (
                  <div 
                    key={index} 
                    className={`terminal-line ${log.className || ""}`}
                    onClick={() => {
                      if (registrationState.step === 3) {
                        // Click matching target options directly in Step 3
                        if (log.text.includes("HACKATHON")) handleTerminalOptionClick("Hackathon", 1);
                        if (log.text.includes("CAPTURE THE FLAG")) handleTerminalOptionClick("Capture The Flag", 2);
                        if (log.text.includes("BUG BOUNTY")) handleTerminalOptionClick("Bug Bounty", 3);
                        if (log.text.includes("CYBER WORKSHOPS")) handleTerminalOptionClick("Cyber Workshops", 4);
                        if (log.text.includes("TECH TALKS")) handleTerminalOptionClick("Tech Talks", 5);
                      }
                    }}
                  >
                    {log.text}
                  </div>
                ))}

                {/* Input row (only visible during stages < 5) */}
                {registrationState.step < 5 && (
                  <form onSubmit={handleTerminalSubmit} className="terminal-line mt-2">
                    <div className="terminal-input-wrapper">
                      <span className="terminal-arrow text-[#9d4edf]">&gt;&gt;</span>
                      <input 
                        type={registrationState.step === 2 ? "email" : "text"} 
                        className="terminal-input bg-transparent border-none outline-none font-mono text-white text-sm w-full"
                        value={modalInput}
                        onChange={(e) => setModalInput(e.target.value)}
                        placeholder={
                          registrationState.step === 1 ? "Enter handle..." : 
                          registrationState.step === 2 ? "Enter email..." : 
                          registrationState.step === 3 ? "Enter choice (1-5)..." : 
                          registrationState.step === 4 ? "Y/N..." : ""
                        }
                        autoFocus
                      />
                    </div>
                  </form>
                )}
                <div ref={modalTerminalEndRef} />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
