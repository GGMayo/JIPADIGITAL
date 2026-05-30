'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Send, 
  Users, 
  Calendar, 
  TrendingUp, 
  Sparkles, 
  Layers, 
  Database, 
  ArrowRight, 
  CheckCircle, 
  Play, 
  Clock, 
  User, 
  Check, 
  Menu, 
  X, 
  Briefcase, 
  Mail, 
  Zap, 
  ArrowUpRight,
  Settings,
  ChevronRight,
  Activity,
  Plus,
  Sun,
  Moon
} from 'lucide-react';

// Canvas Particle Definition
interface CanvasParticle {
  x: number;
  y: number;
  z: number;
  color: string;
  size: number;
  // Layout coordinates (A: Helix, B: Screen Wireframe, C: Database Nodes, D: Funnel Graph, E: Core Sphere)
  layoutA: { x: number; y: number; z: number };
  layoutB: { x: number; y: number; z: number };
  layoutC: { x: number; y: number; z: number };
  layoutD: { x: number; y: number; z: number };
  layoutE: { x: number; y: number; z: number };
}

// Chat message format
interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// CRM Lead format
interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  needs: string;
  score: number;
  status: 'Cualificado' | 'En Conversación' | 'Agendado' | 'Hot Prospect';
  time: string;
}

// Staggered word animation component
function StaggerText({ text, className = '' }: { text: string; className?: string }) {
  const words = text.split(' ');
  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, i) => (
        <span
          key={i}
          className="stagger-word inline-block mr-[0.25em] translate-y-[30px] opacity-0"
        >
          {word}
        </span>
      ))}
    </span>
  );
}

// Pure helpers to prevent impure warnings during render definitions
function getTimestampNow(): string {
  return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function getRandomBookingId(): number {
  return Math.floor(Math.random() * 900000 + 100000);
}

function getRandomLeadId(): string {
  return 'lead-' + Math.floor(Math.random() * 1000000);
}

export default function Home() {
  const [gsapLoaded, setGsapLoaded] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const isDarkModeRef = useRef(true);

  // Initialize dark mode from localStorage or media query asynchronously
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('theme');
      let targetTheme = true; // Default to dark mode
      
      if (savedTheme === 'light') {
        targetTheme = false;
      } else if (!savedTheme && !window.matchMedia('(prefers-color-scheme: dark)').matches) {
        targetTheme = false;
      }
      
      if (targetTheme !== isDarkMode) {
        setTimeout(() => {
          setIsDarkMode(targetTheme);
          isDarkModeRef.current = targetTheme;
        }, 0);
      } else {
        isDarkModeRef.current = targetTheme;
      }
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    const nextMode = !isDarkMode;
    setIsDarkMode(nextMode);
    isDarkModeRef.current = nextMode;
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', nextMode ? 'dark' : 'light');
    }
  };

  const mainRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressRef = useRef(0);
  const mouseRef = useRef({ x: 0, y: 0, prevX: 0, prevY: 0 });
  const particlesRef = useRef<CanvasParticle[]>([]);
  const requestRef = useRef<number | null>(null);

  // States for interactive custom cursor
  const [cursorHovered, setCursorHovered] = useState(false);
  const [activeSection, setActiveSection] = useState(0);
  const [scrollPercent, setScrollPercent] = useState(0);
  const [bookingId, setBookingId] = useState<number | null>(null);

  // Chat Demo State
  const [chatMessages, setChatMessages] = useState<Message[]>([
    {
      id: 'welcome-msg',
      role: 'assistant',
      content: '¡Hola! Bienvenido a JIPA Digital. Explora la demostración. Dime tu nombre y correo, y te mostraré cómo capturo leads y los registro en el CRM de inmediato.',
      timestamp: 'Ahora',
    },
  ]);
  const [userInput, setUserInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [extractedLead, setExtractedLead] = useState<{
    name: string | null;
    email: string | null;
    company: string | null;
    needs: string | null;
    interestLevel: string | null;
  }>({
    name: null,
    email: null,
    company: null,
    needs: null,
    interestLevel: null,
  });

  // CRM Leads Database State (updates in real-time based on Chat interactions)
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: 'lead-1',
      name: 'Sofia Castor',
      email: 's.castor@luxdev.com',
      company: 'LuxDev Inmobiliaria',
      needs: 'Sitio Web Corporativo + Bot de IA Agendador',
      score: 96,
      status: 'Agendado',
      time: 'Hace 5m',
    },
    {
      id: 'lead-2',
      name: 'Andrés Mendoza',
      email: 'mendoza.a@tech-ventures.co',
      company: 'TechVentures SaaS',
      needs: 'Landing Page de Producto + Calificador Leads 24/7',
      score: 88,
      status: 'En Conversación',
      time: 'Hace 12m',
    },
    {
      id: 'lead-3',
      name: 'Valeria Russo',
      email: 'valeria@clinicarusso.es',
      company: 'Clínica Dental Estética',
      needs: 'Web de citas médicas integrada con Google Calendar',
      score: 91,
      status: 'Cualificado',
      time: 'Hace 34m',
    },
  ]);

  // Lead qualification audio simulation feedback and score meter
  const [isLeadScoreExploding, setIsLeadScoreExploding] = useState(false);
  const [showQualifiedAlert, setShowQualifiedAlert] = useState(false);
  const [interactionShine, setInteractionShine] = useState(false);

  // Analytics Dynamic Optimizations State
  const [isAiOptimized, setIsAiOptimized] = useState(false);
  const [viewMetric, setViewMetric] = useState<'conversion' | 'leads' | 'speed'>('conversion');

  // Booking states
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [bookedStatus, setBookedStatus] = useState<string | null>(null);
  const [leadCreatedNotifier, setLeadCreatedNotifier] = useState<string | null>(null);

  // Load GSAP Libraries from CDN
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const loadScript = (src: string): Promise<void> => {
      return new Promise((resolve, reject) => {
        const existing = document.querySelector(`script[src="${src}"]`);
        if (existing) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };

    const initLibs = async () => {
      try {
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollTrigger.min.js');
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/ScrollToPlugin.min.js');
        setGsapLoaded(true);
      } catch (err) {
        console.error('Error loading GSAP scripts:', err);
      }
    };

    initLibs();
  }, []);

  // Initialize Canvas Particles & Setup Render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Resize tracking
    const handleResize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    handleResize();
    window.addEventListener('resize', handleResize);

    // Initialize 250 Particles with multiple layout targets
    const count = 200;
    const items: CanvasParticle[] = [];

    for (let i = 0; i < count; i++) {
      const colorProgress = Math.random();
      const rgbColor = colorProgress > 0.6 
        ? '16, 185, 129'  // JIPA Emerald Green
        : colorProgress > 0.2 
          ? '74, 130, 191'  // JIPA Steel Blue
          : '30, 41, 59';    // Dark Navy Slate

      // Helix coordinates (Layout A - Hero stage)
      const helixAngle = (i / count) * Math.PI * 16;
      const helixY = ((i / count) - 0.5) * 800;
      const helixRadius = 180 + Math.sin(i * 0.1) * 30;

      // Computer/Dialog Wireframe screen layout coordinates (Layout B)
      let screenX = 0;
      let screenY = 0;
      let screenZ = 0;

      if (i < 80) {
        // Screen Border
        const borderIndex = i;
        const side = Math.floor(borderIndex / 20);
        const ratio = (borderIndex % 20) / 20;
        const w = 400;
        const h = 260;
        if (side === 0) { screenX = -w / 2 + w * ratio; screenY = -h / 2; }
        else if (side === 1) { screenX = w / 2; screenY = -h / 2 + h * ratio; }
        else if (side === 2) { screenX = w / 2 - w * ratio; screenY = h / 2; }
        else { screenX = -w / 2; screenY = h / 2 - h * ratio; }
        screenZ = Math.sin(i * 0.05) * 10;
      } else if (i < 130) {
        // Dialogue Bubble Left (the chatbot)
        const bubbleIndex = i - 80;
        const angle = (bubbleIndex / 50) * Math.PI * 2;
        screenX = -120 + Math.cos(angle) * 70;
        screenY = -40 + Math.sin(angle) * 45;
        screenZ = 80 + Math.sin(i * 0.2) * 5;
      } else {
        // Keyboard/Bottom dock dots
        const gridIndex = i - 130;
        screenX = -180 + (gridIndex % 10) * 40;
        screenY = 160 + Math.floor(gridIndex / 10) * 15;
        screenZ = -50 + Math.sin(gridIndex) * 20;
      }

      // CRM Lead pipeline grid (Layout C)
      const row = i % 8;
      const col = Math.floor(i / 8);
      const crmX = -350 + col * 32;
      const crmY = -180 + row * 45 + Math.sin(col * 0.5) * 20;
      const crmZ = Math.cos(row * 0.5) * 60;

      // Analytics Dashboard Funnel layout coordinates (Layout D)
      let funnelX = 0;
      let funnelY = 0;
      let funnelZ = 0;
      if (i < 50) {
        // Large circle at top (traffic)
        const angle = (i / 50) * Math.PI * 2;
        funnelX = Math.cos(angle) * 240;
        funnelY = -200 + Math.sin(angle) * 30;
        funnelZ = Math.sin(angle) * 80;
      } else if (i < 110) {
        // Medium funnel circle (Bot actions)
        const angle = ((i - 50) / 60) * Math.PI * 2;
        funnelX = Math.cos(angle) * 140;
        funnelY = -40 + Math.sin(angle) * 20;
        funnelZ = Math.cos(angle) * 60;
      } else if (i < 160) {
        // Narrow lead score cylinder
        const angle = ((i - 110) / 50) * Math.PI * 2;
        funnelX = Math.cos(angle) * 60;
        funnelY = 100 + Math.sin(angle) * 10;
        funnelZ = Math.sin(angle) * 30;
      } else {
        // Bottom database glowing matrix array
        const gridIdx = i - 160;
        funnelX = -100 + (gridIdx % 8) * 30;
        funnelY = 220 + Math.floor(gridIdx / 8) * 15;
        funnelZ = -Math.sin(gridIdx) * 50;
      }

      // High-tech core sphere coordinates (Layout E)
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const sphereRadius = 220 + Math.sin(i * 0.2) * 25;
      const sphereX = sphereRadius * Math.sin(phi) * Math.cos(theta);
      const sphereY = sphereRadius * Math.sin(phi) * Math.sin(theta);
      const sphereZ = sphereRadius * Math.cos(phi);

      items.push({
        x: helixRadius * Math.cos(helixAngle),
        y: helixY,
        z: helixRadius * Math.sin(helixAngle),
        color: rgbColor,
        size: Math.random() * 2 + 1,
        layoutA: {
          x: helixRadius * Math.cos(helixAngle),
          y: helixY,
          z: helixRadius * Math.sin(helixAngle)
        },
        layoutB: { x: screenX, y: screenY, z: screenZ },
        layoutC: { x: crmX, y: crmY, z: crmZ },
        layoutD: { x: funnelX, y: funnelY, z: funnelZ },
        layoutE: { x: sphereX, y: sphereY, z: sphereZ }
      });
    }
    particlesRef.current = items;

    // Canvas drawing loop
    let rotationAngle = 0;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const progress = progressRef.current;
      
      rotationAngle += 0.003; // Auto rotation over time
      
      // Project mouse interaction tilt
      const targetMouseX = mouseRef.current.x - canvas.width / 2;
      const targetMouseY = mouseRef.current.y - canvas.height / 2;
      mouseRef.current.prevX += (targetMouseX - mouseRef.current.prevX) * 0.06;
      mouseRef.current.prevY += (targetMouseY - mouseRef.current.prevY) * 0.06;
      
      const mouseInfluenceX = (mouseRef.current.prevX / canvas.width) * 0.6;
      const mouseInfluenceY = (mouseRef.current.prevY / canvas.height) * 0.6;

      ctx.fillStyle = '#0a0a0a';
      ctx.strokeStyle = isDarkModeRef.current 
        ? 'rgba(255, 255, 255, 0.05)' 
        : 'rgba(15, 23, 42, 0.055)';
      ctx.lineWidth = 1;

      // Draw fixed radial cybernetic wireframe compass background
      ctx.beginPath();
      ctx.arc(centerX, centerY, 350, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(centerX, centerY, 150, 0, Math.PI * 2);
      ctx.stroke();

      // Plot particles
      particlesRef.current.forEach((p) => {
        let lx = p.layoutA.x;
        let ly = p.layoutA.y;
        let lz = p.layoutA.z;

        // Perform Layout Morphing on Scroll
        if (progress < 0.25) {
          // Transition Helix (0.0) -> screen wireframe (0.25)
          const ratio = progress / 0.25;
          lx = lx * (1 - ratio) + p.layoutB.x * ratio;
          ly = ly * (1 - ratio) + p.layoutB.y * ratio;
          lz = lz * (1 - ratio) + p.layoutB.z * ratio;
        } else if (progress < 0.50) {
          // Transition screen (0.25) -> CRM Database nodes (0.50)
          const ratio = (progress - 0.25) / 0.25;
          lx = p.layoutB.x * (1 - ratio) + p.layoutC.x * ratio;
          ly = p.layoutB.y * (1 - ratio) + p.layoutC.y * ratio;
          lz = p.layoutB.z * (1 - ratio) + p.layoutC.z * ratio;
        } else if (progress < 0.75) {
          // Transition CRM database (0.50) -> Funnel charts (0.75)
          const ratio = (progress - 0.50) / 0.25;
          lx = p.layoutC.x * (1 - ratio) + p.layoutD.x * ratio;
          ly = p.layoutC.y * (1 - ratio) + p.layoutD.y * ratio;
          lz = p.layoutC.z * (1 - ratio) + p.layoutD.z * ratio;
        } else {
          // Transition Funnel charts (0.75) -> Core Sphere (1.0)
          const ratio = (progress - 0.75) / 0.25;
          lx = p.layoutD.x * (1 - ratio) + p.layoutE.x * ratio;
          ly = p.layoutD.y * (1 - ratio) + p.layoutE.y * ratio;
          lz = p.layoutD.z * (1 - ratio) + p.layoutE.z * ratio;
        }

        // Apply 3D math and mouse parallax
        const cosY = Math.cos(rotationAngle + mouseInfluenceX);
        const sinY = Math.sin(rotationAngle + mouseInfluenceX);
        const cosX = Math.cos(mouseInfluenceY);
        const sinX = Math.sin(mouseInfluenceY);

        // Map around Y axis
        const x1 = lx * cosY - lz * sinY;
        const z1 = lx * sinY + lz * cosY;

        // Map around X axis
        const y2 = ly * cosX - z1 * sinX;
        const z2 = ly * sinX + z1 * cosX;

        // Projection mapping perspective
        const distance = 700;
        const scale = distance / (distance + z2);
        
        let screenProjX = centerX + x1 * scale;
        let screenProjY = centerY + y2 * scale;

        // Draw particle node
        const sizeMapped = p.size * scale;
        const alpha = Math.min(Math.max((distance + z2) / (distance * 1.5), 0.15), 0.95);

        ctx.fillStyle = `rgba(${p.color}, ${alpha})`;

        // Glow effects on scroll highlights
        if (progress > 0.45 && progress < 0.55 && p.color === '56, 189, 248') {
          ctx.shadowBlur = 8;
          ctx.shadowColor = 'rgb(56, 189, 248)';
        } else {
          ctx.shadowBlur = 0;
        }

        ctx.beginPath();
        // Shift left slightly on section 2 (bot demo) to frame layout nicely
        const layoutOffset = progress > 0.20 && progress < 0.45 ? -180 : 0;
        ctx.arc(screenProjX + layoutOffset, screenProjY, sizeMapped, 0, Math.PI * 2);
        ctx.fill();
      });

      // Ambient technological light sweeps
      ctx.shadowBlur = 0;
      requestRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gsapLoaded]);

  // Track dynamic mouse cursor coordinates with ultra-high-performance direct DOM manipulation
  useEffect(() => {
    const inner = document.getElementById('custom-cursor-inner');
    const outer = document.getElementById('custom-cursor-outer');
    
    const handleMouseMove = (e: MouseEvent) => {
      if (inner) {
        inner.style.left = `${e.clientX}px`;
        inner.style.top = `${e.clientY}px`;
      }
      if (outer) {
        outer.style.left = `${e.clientX}px`;
        outer.style.top = `${e.clientY}px`;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // GSAP ScrollTrigger Integration
  useEffect(() => {
    if (!gsapLoaded) return;

    const g = (window as any).gsap;
    const s = (window as any).ScrollTrigger;
    if (!g || !s) return;

    // Register ScrollTrigger and ScrollTo
    g.registerPlugin(s);

    let ctx = g.context(() => {
      // Direct bind to scroller updates
      g.to({}, {
        scrollTrigger: {
          trigger: 'body',
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.2,
          onUpdate: (self: any) => {
            progressRef.current = self.progress;
            setScrollPercent(self.progress * 100);
            
            // Map scroll index to active state
            const currentSection = Math.round(self.progress * 5);
            setActiveSection(currentSection);
          },
        },
      });

      // Stagger texts entrance animation in Hero
      g.to('.hero-title-word', {
        opacity: 1,
        y: 0,
        duration: 1.2,
        stagger: 0.08,
        ease: 'power4.out',
      });

      g.to('.stagger-word', {
        scrollTrigger: {
          trigger: '.hero-trigger',
          start: 'top center',
          end: 'bottom center',
          toggleActions: 'play none none none',
        },
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.02,
        ease: 'power3.out',
      });

      // Float interactions for premium cards
      g.fromTo('.floating-badge', 
        { y: 0 },
        { y: -8, duration: 2.2, repeat: -1, yoyo: true, ease: 'sine.inOut' }
      );

    }, mainRef);

    return () => {
      ctx.revert();
    };
  }, [gsapLoaded]);

  // Send message function to `/api/chat` using state-of-the-art framework guidelines
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    const userMsgId = 'user-' + getRandomLeadId();
    const newUserMsg: Message = {
      id: userMsgId,
      role: 'user',
      content: userInput,
      timestamp: getTimestampNow(),
    };

    setChatMessages((prev) => [...prev, newUserMsg]);
    setUserInput('');
    setIsChatLoading(true);
    setInteractionShine(true);
    setTimeout(() => {
      setInteractionShine(false);
    }, 4500);

    try {
      const chatHistory = [...chatMessages, newUserMsg].map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ messages: chatHistory }),
      });

      if (!res.ok) {
        throw new Error('Servidor offline o problemas de red');
      }

      const responseData = await res.json();

      // Add Model Response
      const assistantId = 'assistant-' + getRandomLeadId();
      const newAssistantMsg: Message = {
        id: assistantId,
        role: 'assistant',
        content: responseData.text,
        timestamp: getTimestampNow(),
      };

      setChatMessages((prev) => [...prev, newAssistantMsg]);

      // Handle extracted metadata and dynamically qualify leads in simulated CRM
      if (responseData.metadata) {
        const meta = responseData.metadata;
        setExtractedLead({
          name: meta.name || extractedLead.name,
          email: meta.email || extractedLead.email,
          company: meta.company || extractedLead.company,
          needs: meta.needs || extractedLead.needs,
          interestLevel: meta.interestLevel || extractedLead.interestLevel || 'medium',
        });

        // Trigger lead alerts or additions if new fields are detected
        if (meta.name || meta.email) {
          // Update simulated CRM leads database dynamically!
          const nameToUse = meta.name || extractedLead.name || 'Prospecto Web';
          const emailToUse = meta.email || extractedLead.email || 'interés@web.com';
          
          // Verify if this lead already exists in our array to prevent redundancy
          const alreadyExists = leads.some(
            (item) => item.email.toLowerCase() === emailToUse.toLowerCase()
          );

          if (!alreadyExists) {
            // Trigger beautiful lead qualifying sound wave explosion
            setIsLeadScoreExploding(true);
            setShowQualifiedAlert(true);
            setInteractionShine(true);
            setTimeout(() => {
              setIsLeadScoreExploding(false);
            }, 4500);
            setTimeout(() => {
              setInteractionShine(false);
            }, 4500);
            
            setLeads((prevLeads) => {
              const newLead: Lead = {
                id: getRandomLeadId(),
                name: nameToUse,
                email: emailToUse,
                company: meta.company || 'Interacción Directa',
                needs: meta.needs || 'Asistencia en tiempo real',
                score: meta.interestLevel === 'high' ? 95 : 82,
                status: meta.action === 'schedule' ? 'Agendado' : 'Hot Prospect',
                time: 'Hace 1s',
              };
              return [newLead, ...prevLeads];
            });

            // Set alert notifier
            setLeadCreatedNotifier(`Lead registrado: ${nameToUse} (${emailToUse})`);
            setTimeout(() => setLeadCreatedNotifier(null), 5000);
          } else {
            // Update existing lead metrics if they scheduling or changing score
            setLeads((prevLeads) => prevLeads.map((item) => {
              if (item.email.toLowerCase() === emailToUse.toLowerCase()) {
                return {
                  ...item,
                  name: nameToUse,
                  status: meta.action === 'schedule' ? 'Agendado' : item.status,
                  score: 98,
                };
              }
              return item;
            }));
          }
        }
      }

    } catch (err) {
      console.error('Chat error:', err);
      // Clean fallback in case of errors
      setTimeout(() => {
        setChatMessages((prev) => [
          ...prev,
          {
            id: 'fallback-' + getRandomLeadId(),
            role: 'assistant',
            content: 'He registrado tus preferencias en el CRM de manera interna para esta simulación. ¡Mira abajo cómo se crea tu perfil calificado!',
            timestamp: 'Ahora',
          },
        ]);
      }, 800);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Programmatic scroll to section
  const scrollTo = (percentage: number) => {
    if (typeof window === 'undefined') return;
    const g = (window as any).gsap;
    if (!g) return;
    
    // Page height logic
    const bodyHeight = document.documentElement.scrollHeight - window.innerHeight;
    g.to(window, {
      duration: 1.5,
      scrollTo: bodyHeight * percentage,
      ease: 'power3.inOut',
    });
  };

  // Handle slot reservation click
  const bookingTimes = ['09:00 AM', '11:30 AM', '02:00 PM', '04:30 PM', '06:00 PM'];
  const handleBooking = (slot: string) => {
    setSelectedSlot(slot);
    setBookedStatus('pending');
    setBookingId(getRandomBookingId());
    
    setTimeout(() => {
      setBookedStatus('confirmed');
      // Update custom lead in local array if available
      setLeads((prevLeads) => {
        return prevLeads.map((item, index) => {
          if (index === 0) {
            return {
              ...item,
              status: 'Agendado',
              score: 99,
            };
          }
          return item;
        });
      });
    }, 1200);
  };

  return (
    <main 
      id="aethera-main" 
      ref={mainRef} 
      className={`relative min-h-[550vh] overflow-x-hidden font-sans cursor-none select-none transition-colors duration-700 ${isDarkMode ? 'text-slate-100 bg-slate-950' : 'text-slate-900 bg-slate-50'}`}
    >
      {/* CAPA 0: Canvas Fijo de Fondo e Interacciones de partícula */}
      <div id="canvas-wrapper" className="fixed top-0 left-0 w-full h-full -z-20 pointer-events-none">
        <canvas 
          ref={canvasRef} 
          id="scrollytelling-canvas"
          className="w-full h-full object-cover transition-opacity duration-1000"
        />
        {/* Dynamic vignette and futuristic screen grid mask */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-700" 
          style={{
            background: isDarkMode 
              ? 'radial-gradient(circle at center, rgba(15, 23, 42, 0.15) 0%, rgba(2, 6, 23, 1) 97%)' 
              : 'radial-gradient(circle at center, rgba(248, 250, 252, 0.1) 0%, rgba(248, 250, 252, 1) 97%)'
          }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(99,102,241,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(99,102,241,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />
      </div>

      {/* CUSTOM CURSOR: High-Tech Glowing Dual Cursor (Ultra-Visible y 100% Fluido) */}
      <div 
        id="custom-cursor-inner"
        className={`hidden md:block fixed w-3 h-3 rounded-full z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2 shadow-lg transition-transform duration-100 ease-out ${
          isDarkMode ? 'bg-emerald-400 shadow-[0_0_12px_#10B981]' : 'bg-indigo-600 shadow-[0_0_12px_#4F46E5]'
        }`}
        style={{
          left: '-100px',
          top: '-100px',
          transform: `translate(-50%, -50%) scale(${cursorHovered ? 0.6 : 1})`,
        }}
      />
      <div 
        id="custom-cursor-outer"
        className={`hidden md:block fixed rounded-full z-[9999] pointer-events-none -translate-x-1/2 -translate-y-1/2 shadow-xl flex items-center justify-center border-2 transition-all duration-200 ease-out ${
          isDarkMode 
            ? 'border-emerald-400/90 bg-emerald-950/15' 
            : 'border-indigo-600/90 bg-indigo-50/15'
        }`}
        style={{
          left: '-100px',
          top: '-100px',
          width: cursorHovered ? '68px' : '36px',
          height: cursorHovered ? '68px' : '36px',
          transform: `translate(-50%, -50%)`,
        }}
      >
        {/* Pulsating background circle inside ring */}
        <span className={`absolute inset-0 rounded-full border transition-all duration-350 ${
          cursorHovered 
            ? isDarkMode 
              ? 'border-emerald-300 bg-emerald-500/15 shadow-[0_0_20px_rgba(16,185,129,0.6)]' 
              : 'border-indigo-400 bg-indigo-500/15 shadow-[0_0_20px_rgba(79,70,229,0.5)]'
            : isDarkMode
              ? 'border-dashed border-emerald-400/60 bg-transparent animate-spin'
              : 'border-dashed border-indigo-600/60 bg-transparent animate-spin'
        }`} style={{ animationDuration: '6s' }} />

        {/* Pulsing signal waves when hovering */}
        {cursorHovered && (
          <span className={`absolute -inset-1 rounded-full animate-ping opacity-60 ${
            isDarkMode ? 'bg-emerald-500/30' : 'bg-indigo-500/30'
          }`} />
        )}

        {/* Aiming corner reticle ticks that appear on hover, changing shape dynamically */}
        {cursorHovered && (
          <>
            <span className={`absolute top-1 left-1/2 -translate-x-1/2 w-2.5 h-0.5 rounded-full shadow-sm ${isDarkMode ? 'bg-emerald-300 shadow-[#10B981]' : 'bg-indigo-400 shadow-[#4F46E5]'}`} />
            <span className={`absolute bottom-1 left-1/2 -translate-x-1/2 w-2.5 h-0.5 rounded-full shadow-sm ${isDarkMode ? 'bg-emerald-300 shadow-[#10B981]' : 'bg-indigo-400 shadow-[#4F46E5]'}`} />
            <span className={`absolute left-1 top-1/2 -translate-y-1/2 h-2.5 w-0.5 rounded-full shadow-sm ${isDarkMode ? 'bg-emerald-300 shadow-[#10B981]' : 'bg-indigo-400 shadow-[#4F46E5]'}`} />
            <span className={`absolute right-1 top-1/2 -translate-y-1/2 h-2.5 w-0.5 rounded-full shadow-sm ${isDarkMode ? 'bg-emerald-300 shadow-[#10B981]' : 'bg-indigo-400 shadow-[#4F46E5]'}`} />
            {/* Holographic inner tech ring */}
            <span className={`w-5 h-5 rounded-full border animate-pulse ${isDarkMode ? 'border-emerald-400/40' : 'border-indigo-451/40 border-indigo-500/45'}`} />
          </>
        )}
      </div>

      {/* CRM Global Floating Toast */}
      <AnimatePresence>
        {leadCreatedNotifier && (
          <motion.div 
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -30, x: '-50%' }}
            className={`fixed top-24 left-1/2 z-50 px-5 py-3 rounded-full border backdrop-blur-xl transition-all duration-300 flex items-center gap-3 ${
              isDarkMode 
                ? 'bg-slate-900/95 border-emerald-950/70 shadow-2xl shadow-black/80 text-white' 
                : 'bg-white/95 border-emerald-100 shadow-xl shadow-emerald-100/20 text-slate-800'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-[#10B981] animate-ping" />
            <Sparkles className="w-4 h-4 text-[#10B981]" />
            <span className="text-sm font-medium tracking-wide font-mono">
              {leadCreatedNotifier}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* LIENZOS INDICADORES DE SCROLL LATERAL INTERACTIVO */}
      <div id="side-progress-rail" className="fixed right-6 lg:right-12 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col gap-5 items-center">
        <div className="text-[10px] font-mono tracking-widest text-slate-400 uppercase rotate-90 translate-y-12 mb-10">
          Navegación
        </div>
        {[0, 1, 2, 3, 4, 5].map((index) => {
          const labels = ['Inicio', 'AI Bot', 'CRM Live', 'Métricas', 'Agenda', 'Acceso'];
          return (
            <button
               key={index}
              onClick={() => scrollTo(index * 0.18)}
              onMouseEnter={() => setCursorHovered(true)}
              onMouseLeave={() => setCursorHovered(false)}
              className="group relative flex items-center justify-end"
            >
              <span className={`absolute right-6 px-2 py-0.5 rounded border text-[10px] font-mono opacity-0 group-hover:opacity-100 pointer-events-none transition-all duration-300 translate-x-2 group-hover:translate-x-0 shadow-sm ${
                isDarkMode 
                  ? 'bg-slate-900 border-slate-800 text-slate-300' 
                  : 'bg-white border-slate-200 text-slate-600'
              }`}>
                {labels[index]}
              </span>
              <div 
                className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${
                  activeSection === index 
                    ? `bg-[#10B981] ring-4 scale-150 ${isDarkMode ? 'ring-emerald-950/80 ring-emerald-500/25' : 'ring-emerald-100'}` 
                    : 'bg-slate-300 group-hover:bg-[#10B981]/50'
                }`} 
              />
            </button>
          );
        })}
      </div>

      {/* BARRA DE PROGRESO DE LECTURA SUPERIOR */}
      <div id="top-progress-bar" className="fixed top-0 left-0 w-full h-[3px] bg-slate-100 z-50">
        <div 
          className="h-full bg-gradient-to-r from-[#4A82BF] via-[#10B981] to-[#10B981] transition-all duration-100" 
          style={{ width: `${Math.min(scrollPercent, 100)}%` }}
        />
      </div>

      {/* NAV BAR GLOBAL */}
      <header className={`fixed top-0 left-0 w-full z-40 h-16 px-6 lg:px-16 flex justify-between items-center backdrop-blur-xl border-b select-none transition-all duration-750 ${isDarkMode ? 'bg-slate-950/45 border-white/5 text-slate-100 shadow-[0_4px_30px_rgba(0,0,0,0.15)]' : 'bg-white/45 border-slate-200/50 text-slate-900 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'}`}>
        <div 
          className="flex items-center gap-3 hover:opacity-80 transition-opacity cursor-pointer"
          onClick={() => scrollTo(0)}
          onMouseEnter={() => setCursorHovered(true)}
          onMouseLeave={() => setCursorHovered(false)}
        >
          <div className="relative w-9 h-9 rounded-full bg-[#10B981] flex items-center justify-center shadow-md shadow-emerald-100/40 overflow-hidden">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white relative z-10" aria-hidden="true">
              <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
            </svg>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(255,255,255,0.45)_50%,transparent_70%)] animate-shine pointer-events-none" />
          </div>
          <div>
            <div className="flex items-baseline font-sans text-base font-black tracking-tight leading-none">
              <span className="text-shine-emerald">JIPA</span>
              <span className={`${isDarkMode ? 'text-shine-white' : 'text-shine-slate'} ml-0.5`}>Digital</span>
            </div>
            <span className="text-[9px] block font-mono text-slate-400 tracking-wider">SI EN LÍNEA · V1.4</span>
          </div>
        </div>

        <nav className={`hidden md:flex items-center gap-8 text-sm font-sans font-medium transition-colors ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
          <button onClick={() => scrollTo(0.18)} className="hover:text-[#10B981] transition-colors">Agente IA</button>
          <button onClick={() => scrollTo(0.36)} className="hover:text-[#10B981] transition-colors">CRM</button>
          <button onClick={() => scrollTo(0.54)} className="hover:text-[#10B981] transition-colors">Métricas</button>
          <button onClick={() => scrollTo(0.72)} className="hover:text-[#10B981] transition-colors">Agenda</button>
        </nav>

        <div className="flex items-center gap-3">
          {/* Dark Mode Toggle Button */}
          <button
            onClick={toggleDarkMode}
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}
            className={`p-2 rounded-full border backdrop-blur-md transition-all cursor-pointer pointer-events-auto flex items-center justify-center ${
              isDarkMode 
                ? 'bg-white/5 border-white/10 text-amber-400 hover:bg-white/10 hover:border-white/20 shadow-inner' 
                : 'bg-slate-900/5 border-slate-900/10 text-slate-600 hover:bg-slate-900/10 hover:border-slate-900/20 shadow-inner'
            }`}
            title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
          >
            {isDarkMode ? <Sun className="w-4 h-4 animate-spin-slow" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => scrollTo(0.9)}
            onMouseEnter={() => setCursorHovered(true)}
            onMouseLeave={() => setCursorHovered(false)}
            className="px-5 py-2 bg-[#10B981] text-white text-sm font-semibold rounded-full shadow-lg shadow-emerald-150 hover:bg-[#0d9a6c] transition-all flex items-center gap-1 font-mono tracking-wider cursor-pointer pointer-events-auto"
          >
            <span>Crear mi Sitio</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      {/* CAPA 10: CONTENIDO SCROLLABLE */}
      <div id="scrollable-sections" className="relative z-10">
        
        {/* ================= SECTION 1: HERO (0.0 to 0.18) ================= */}
        <section id="hero-section" className="relative w-full h-[100vh] flex flex-col justify-center px-6 lg:px-20 pointer-events-none">
          <div className="absolute top-[35%] right-10 lg:right-24 z-10 w-80 pointer-events-auto hidden xl:block">
            {/* Bento-style Side Floating Panel */}
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1 }}
              className={`p-5 rounded-2xl border backdrop-blur-xl shadow-2xl relative overflow-hidden transition-all duration-750 ${
                isDarkMode 
                  ? 'bg-slate-950/40 border-white/10 text-slate-200 shadow-black/80' 
                  : 'bg-white/45 border-slate-200/80 text-slate-800 shadow-slate-200/40'
              }`}
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl" />
              <div className="flex items-center gap-2 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-500 relative">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 animate-ping" />
                </span>
                <span className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest font-semibold">CRM Activo</span>
              </div>
              <h4 className={`text-sm font-mono font-bold mb-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>MÉTRICAS EN VIVO</h4>
              <p className={`text-xs leading-relaxed mb-4 ${isDarkMode ? 'text-slate-350 bg-transparent' : 'text-slate-500'}`}>La conversión de tu sitio se duplica automáticamente mediante nuestro robot autónomo calificador.</p>
              
              <div className={`space-y-3 pt-3 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                <div className="flex justify-between text-xs font-mono">
                  <span className={`transition-colors ${isDarkMode ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>Tasa de Cierre:</span>
                  <span className="text-emerald-400 font-bold">+241%</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className={`transition-colors ${isDarkMode ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>Conversión Orgánica:</span>
                  <span className="text-violet-400 font-bold">18.4%</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className={`transition-colors ${isDarkMode ? 'text-slate-300 font-medium' : 'text-slate-500'}`}>Leads Hoy:</span>
                  <span className={`font-bold ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>142</span>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="max-w-4xl relative z-10 pointer-events-auto">
            {/* Dynamic decorative element */}
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm select-none mb-6 ${
              isDarkMode ? 'bg-emerald-950/30 border-emerald-900/60' : 'bg-emerald-50 border border-emerald-100/60'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-shine-emerald font-black">EL FUTURO DEL FRONTEND EXPERTO</span>
            </div>

            {/* Giant Title */}
            <h1 className="text-5xl md:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9]">
              <span className={`block hero-title-word overflow-hidden pb-1 ${isDarkMode ? 'text-shine-white' : 'text-shine-slate'}`}>WEBSITES</span>
              <span className="block hero-title-word text-shine-emerald pb-2 font-black">AUTÓNOMOS</span>
            </h1>

            {/* Cinematic subtitle using StaggerText */}
            <div className={`mt-8 text-lg md:text-xl max-w-xl font-normal leading-relaxed transition-colors duration-750 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-600'
            }`}>
              <StaggerText 
                text="Creamos plataformas de ultra alta conversión dotadas de Inteligencia Artificial que chatean, filtran leads, agendan llamadas de ventas y organizan todo en tu propio CRM 24/7." 
              />
            </div>

            {/* Motion button trigger */}
            <div className="mt-10 flex flex-wrap gap-4">
              <button 
                onClick={() => scrollTo(0.18)}
                onMouseEnter={() => setCursorHovered(true)}
                onMouseLeave={() => setCursorHovered(false)}
                className="px-8 py-4 rounded-full bg-[#10B981] hover:bg-[#0d9a6c] text-white font-sans font-semibold text-sm hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-3 pointer-events-auto shadow-lg shadow-emerald-100/40 cursor-pointer"
              >
                <span>Probar Bot en Vivo</span>
                <ArrowRight className="w-4 h-4 animate-pulse" />
              </button>

              <button 
                onClick={() => scrollTo(0.36)}
                onMouseEnter={() => setCursorHovered(true)}
                onMouseLeave={() => setCursorHovered(false)}
                className={`px-8 py-4 rounded-full border font-sans font-semibold text-sm pointer-events-auto transition-all shadow-sm cursor-pointer ${
                  isDarkMode 
                    ? 'border-slate-800 bg-slate-900 text-slate-200 hover:bg-slate-800' 
                    : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                Ver CRM Integrado
              </button>
            </div>
          </div>

          <div className={`absolute bottom-10 left-6 lg:left-20 text-[10px] font-mono flex items-center gap-2 transition-colors ${isDarkMode ? 'text-slate-350' : 'text-slate-500'}`}>
            <span>SCROLL PARA TRANSFORMAR EL CANVAS</span>
            <div className={`w-12 h-[1px] animate-pulse ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
          </div>
        </section>

        {/* Scroll Track spacing context (allows the canvas to draw and assemble) */}
        <div className="hero-trigger h-[50vh] w-full" />

        {/* ================= SECTION 2: AI INTERACTIVE CHAT (0.18 to 0.36) ================= */}
        <section id="bot-live-demo-section" className="relative w-full min-h-[100vh] py-24 px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm select-none mb-2 ${
              isDarkMode ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-400' : 'bg-emerald-50 border border-emerald-100/60'
            }`}>
              <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-shine-emerald font-black">SOPORTE AUTÓNOMO ACTIVO</span>
            </div>
            
            <h2 className={`text-3xl md:text-5xl font-black tracking-tight leading-tight transition-colors duration-750 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              Un vendedor incansable para tu negocio.
            </h2>
            
            <p className={`text-sm md:text-base leading-relaxed max-w-xl transition-colors duration-750 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Nuestros sitios integran un bot de IA personalizado que entiende perfectamente los objetivos de tus prospectos. No es un chatbot de árbol de decisión básico: es un verdadero experto entrenado que mantiene conversaciones fluidas y de alto impacto.
            </p>
 
            <div className={`space-y-4 pt-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200/80'}`}>
              <div className="flex gap-3 items-start">
                <div className={`p-2 rounded-lg border mt-1 transition-colors ${isDarkMode ? 'bg-emerald-950/40 border-emerald-900 text-[#10B981]' : 'bg-emerald-50 border border-emerald-100 text-[#10B981]'}`}>
                  <MessageCircleIcon className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-sm font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Comprensión de Lenguaje Natural</h4>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Resuelve dudas, maneja objeciones y explica tus servicios en segundos.</p>
                </div>
              </div>
 
              <div className="flex gap-3 items-start">
                <div className={`p-2 rounded-lg border mt-1 transition-colors ${isDarkMode ? 'bg-slate-900 border-slate-800 text-[#4A82BF]' : 'bg-blue-50 border border-blue-100 text-[#4A82BF]'}`}>
                  <TrendingUp className="w-4 h-4" />
                </div>
                <div>
                  <h4 className={`text-sm font-mono font-bold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Calificación de Lead de Extracción Profunda</h4>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Extrae silenciosamente nombre, correo, empresa e intención y calcula el lead-score dinámico.</p>
                </div>
              </div>
            </div>
          </div>

          {/* CHAT CONTAINER LIVE EMULATOR */}
          <div className="lg:col-span-12 xl:col-span-7">
            <div className={`rounded-3xl border overflow-hidden shadow-2xl transition-all duration-750 backdrop-blur-xl ${
              isDarkMode 
                ? 'bg-slate-950/35 border-white/10 shadow-black/80 shadow-[0_8px_32px_rgba(0,0,0,0.37)]' 
                : 'bg-white/45 border-slate-200/80 shadow-indigo-150 shadow-indigo-100/30'
            }`}>
              {/* Chat Header */}
              <div className={`py-4 px-6 border-b flex justify-between items-center transition-colors duration-750 ${
                isDarkMode ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border transition-colors duration-750 ${
                      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-indigo-50 border-indigo-100'
                    }`}>
                      <Bot className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-indigo-600'}`} />
                    </div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full animate-pulse" />
                  </div>
                  <div>
                    <h3 className={`text-sm font-bold font-mono leading-none flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                      <span>JIPA Demo Assistant</span>
                      <span className={`text-[8px] border px-1 py-0.2 rounded uppercase tracking-wider font-semibold ${
                        isDarkMode ? 'bg-emerald-950/40 text-[#10B981] border-emerald-900' : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                      }`}>AGENTE ACTIVO</span>
                    </h3>
                    <p className={`text-[10px] mt-1 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Responderá de forma inteligente y calificará tus datos abajo</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-[#10B981]' : 'bg-indigo-600'}`} />
                  <span className={`text-[10px] font-mono tracking-wider font-bold ${isDarkMode ? 'text-[#10B981]' : 'text-indigo-600'}`}>DEMO EN VIVO</span>
                </div>
              </div>

              {/* Chat Box Conversation */}
              <div className="p-6 h-[280px] overflow-y-auto space-y-4 font-sans text-xs scrollbar-thin">
                {chatMessages.map((msg) => (
                  <div 
                    key={msg.id}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] rounded-2xl p-4 leading-relaxed transition-all duration-300 ${
                      msg.role === 'user' 
                        ? isDarkMode 
                          ? 'bg-[#10B981] text-slate-950 rounded-tr-none shadow-md shadow-emerald-950/25 font-semibold'
                          : 'bg-indigo-600 text-white rounded-tr-none shadow-md shadow-indigo-100/30' 
                        : isDarkMode
                          ? 'bg-slate-950 text-slate-300 border border-slate-850 rounded-tl-none'
                          : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none'
                    }`}>
                      <p>{msg.content}</p>
                      <span className="text-[8px] opacity-40 mt-1.5 block text-right">
                        {msg.timestamp}
                      </span>
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className={`rounded-2xl rounded-tl-none p-4 flex items-center gap-2 border transition-colors ${
                      isDarkMode ? 'bg-slate-950 text-slate-400 border-slate-850' : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-[#10B981]' : 'bg-indigo-600'}`} style={{ animationDelay: '0ms' }} />
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-[#10B981]' : 'bg-indigo-600'}`} style={{ animationDelay: '150ms' }} />
                      <span className={`w-1.5 h-1.5 rounded-full animate-bounce ${isDarkMode ? 'bg-[#10B981]' : 'bg-indigo-600'}`} style={{ animationDelay: '300ms' }} />
                      <span className="font-mono text-[9px] uppercase tracking-widest ml-1">Escribiendo...</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Send Form */}
              <form onSubmit={handleSendMessage} className={`p-4 border-t flex gap-2 transition-all duration-300 backdrop-blur-md ${isDarkMode ? 'border-white/5 bg-slate-950/15' : 'border-slate-200/40 bg-slate-100/10'}`}>
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Escribe tu nombre, negocio o prueba ej. 'Hola, soy Roberto'"
                  onFocus={() => setCursorHovered(true)}
                  onBlur={() => setCursorHovered(false)}
                  disabled={isChatLoading}
                  className={`flex-1 px-4 py-3 text-xs rounded-xl focus:outline-none transition-all duration-300 backdrop-blur-md ${
                    isDarkMode 
                      ? 'bg-slate-950/40 border-white/10 text-slate-250 text-slate-200 placeholder-slate-650 focus:border-emerald-500/60 focus:bg-slate-950/70 shadow-inner' 
                      : 'bg-white/40 border-slate-200 text-slate-800 placeholder-slate-400 focus:border-indigo-500/60 focus:bg-white/70 shadow-inner'
                  }`}
                />
                <button
                  type="submit"
                  disabled={isChatLoading || !userInput.trim()}
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                  className={`px-4 font-semibold rounded-xl transition-all flex items-center justify-center shadow-md disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer ${
                    isDarkMode ? 'bg-[#10B981] text-slate-950 hover:bg-[#0d9a6c]' : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>

              {/* REAL-TIME AI BRAIN INDICATOR SECTION */}
              <div className={`border-t py-3.5 px-6 flex items-center justify-between flex-wrap gap-3 select-none transition-colors ${
                isDarkMode ? 'bg-slate-950 border-slate-800/80' : 'bg-slate-50 border-slate-100'
              }`}>
                <div className="flex items-center gap-2">
                  <Activity className={`w-3.5 h-3.5 animate-pulse ${isDarkMode ? 'text-emerald-400' : 'text-indigo-600'}`} />
                  <span className={`text-[9px] font-mono tracking-wider font-bold transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>DATOS EXTRAÍDOS EN TIEMPO REAL:</span>
                </div>
                
                <div className="flex items-center gap-3.5 text-[10px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className={`transition-colors ${isDarkMode ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>Nombre:</span>
                    <span className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                      extractedLead.name 
                        ? isDarkMode 
                          ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-900 font-bold' 
                          : 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold' 
                        : isDarkMode ? 'text-slate-350 font-medium' : 'text-slate-500'
                    }`}>
                      {extractedLead.name || 'Buscando...'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`transition-colors ${isDarkMode ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>Email:</span>
                    <span className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                      extractedLead.email 
                        ? isDarkMode 
                          ? 'bg-teal-950/40 text-teal-300 border border-teal-900 font-bold' 
                          : 'bg-violet-50 text-violet-700 border border-violet-100 font-bold' 
                        : isDarkMode ? 'text-slate-350 font-medium' : 'text-slate-500'
                    }`}>
                      {extractedLead.email || 'Buscando...'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className={`transition-colors ${isDarkMode ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>Interés:</span>
                    <span className={`px-1.5 py-0.5 rounded transition-all duration-300 ${
                      extractedLead.interestLevel 
                        ? isDarkMode 
                          ? 'bg-emerald-950/40 text-[#10B981] border border-emerald-900 font-bold' 
                          : 'bg-green-50 text-green-700 border border-green-100 font-bold' 
                        : isDarkMode ? 'text-slate-350 font-medium' : 'text-slate-500'
                    }`}>
                      {extractedLead.interestLevel ? extractedLead.interestLevel.toUpperCase() : 'Nulo'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 3: CRM INTEGRACION REAL-TIME (0.36 to 0.54) ================= */}
        <section id="crm-integration-section" className="relative w-full min-h-[100vh] py-24 px-6 lg:px-20 flex flex-col justify-center">
          <div className="max-w-4xl mb-12">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm select-none mb-4 ${
              isDarkMode ? 'bg-[#4A82BF]/10 border-[#4A82BF]/30 text-[#4A82BF]' : 'bg-blue-50 border border-blue-100/60'
            }`}>
              <Database className="w-3.5 h-3.5 text-[#4A82BF]" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-shine-steel font-black">CRM AUTÓNOMO PROPIO</span>
            </div>
            
            <h2 className={`text-3xl md:text-5xl font-black tracking-tight leading-tight transition-colors duration-750 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              Tus leads organizados al instante.
            </h2>
            
            <p className={`text-sm md:text-base leading-relaxed mt-4 transition-colors duration-750 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Cada dato de la conversación del paso anterior se procesa e introduce en tu propio panel CRM en tiempo real. No dependes de integraciones de terceros defectuosas. Toda la conversión de tu negocio unificada en un solo lugar.
            </p>
          </div>

          {/* DATABASE DATAGRID INTERACTIVE */}
          <div className={`w-full rounded-3xl border relative overflow-hidden transition-all duration-700 backdrop-blur-xl ${
            isDarkMode ? 'bg-slate-950/30' : 'bg-white/45'
          } ${
            interactionShine 
              ? 'border-[#10B981] shadow-2xl shadow-emerald-500/20 scale-[1.005]' 
              : isDarkMode ? 'border-white/10 shadow-2xl shadow-black/85' : 'border-slate-200/80 shadow-2xl shadow-slate-200/40'
          }`}>
            {interactionShine && (
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(16,185,129,0.12)_50%,transparent_70%)] animate-shine pointer-events-none z-10" />
            )}
            <div className={`py-5 px-6 border-b flex flex-col md:flex-row justify-between md:items-center gap-4 transition-colors duration-750 ${
              isDarkMode ? 'bg-slate-950/60 border-slate-850' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="flex items-center gap-3">
                <Users className={`w-5 h-5 ${isDarkMode ? 'text-[#10B981]' : 'text-indigo-600'}`} />
                <div>
                  <h4 className={`text-sm font-mono font-bold flex items-center gap-2 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                    <span>JIPA Digital CRM Dashboard</span>
                    {isLeadScoreExploding && (
                      <span className="text-[9px] bg-emerald-950 text-[#10B981] border border-emerald-900/60 px-2 py-0.5 rounded animate-bounce font-mono font-bold">
                        NUEVO LEAD DETECTADO
                      </span>
                    )}
                  </h4>
                  <p className={`text-[10px] mt-0.5 transition-colors ${isDarkMode ? 'text-slate-350' : 'text-slate-500'}`}>Base de datos en tiempo real de leads capturados por el Bot</p>
                </div>
              </div>

              <div className="flex gap-4 items-center">
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[11px] font-mono font-bold ${
                  isDarkMode ? 'bg-emerald-950/40 border border-emerald-900/50 text-emerald-400' : 'bg-green-50 border border-green-100 text-green-700'
                }`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-ping" />
                  <span>Sincronizando 100% cloud</span>
                </div>
              </div>
            </div>

            {/* Leads List Table */}
            <div className="overflow-x-auto font-mono text-xs">
              <table className={`w-full text-left transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                <thead className={`border-b uppercase tracking-widest text-[9px] font-bold transition-colors ${
                  isDarkMode ? 'bg-slate-950 text-slate-300 border-slate-800' : 'bg-slate-100/60 border-slate-200 text-slate-500'
                }`}>
                  <tr>
                    <th scope="col" className="py-4 px-6">Cliente & Email</th>
                    <th scope="col" className="py-4 px-6">Empresa / Rubro</th>
                    <th scope="col" className="py-4 px-6">Necesidades Detectadas</th>
                    <th scope="col" className="py-4 px-6">Interés</th>
                    <th scope="col" className="py-4 px-6">Estado</th>
                    <th scope="col" className="py-4 px-6 text-right">Contacto</th>
                  </tr>
                </thead>
                <tbody className={`divide-y transition-colors ${isDarkMode ? 'divide-slate-800/60' : 'divide-slate-100'}`}>
                  <AnimatePresence initial={false}>
                    {leads.map((lead, idx) => (
                      <motion.tr 
                        key={lead.id}
                        initial={{ opacity: idx === 0 && lead.time === 'Hace 1s' ? 0 : 1, y: idx === 0 && lead.time === 'Hace 1s' ? -20 : 0, backgroundColor: idx === 0 && lead.time === 'Hace 1s' ? 'rgba(16, 185, 129, 0.08)' : 'transparent' }}
                        animate={{ opacity: 1, y: 0, backgroundColor: 'transparent' }}
                        transition={{ duration: 0.6 }}
                        className={`transition-colors group ${isDarkMode ? 'hover:bg-slate-950/30' : 'hover:bg-slate-50/50'}`}
                      >
                        <td className="py-4 px-6 flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shadow-inner border transition-colors ${
                            isDarkMode ? 'bg-slate-950 border-slate-850 text-[#10B981]' : 'bg-indigo-50 border-indigo-100 text-indigo-600'
                          }`}>
                            {lead.name.charAt(0)}
                          </div>
                          <div>
                            <span className={`block font-bold transition-colors ${
                              isDarkMode ? 'text-slate-200 group-hover:text-[#10B981]' : 'text-slate-800 group-hover:text-indigo-600'
                            }`}>{lead.name}</span>
                            <span className={`text-[10px] transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>{lead.email}</span>
                          </div>
                        </td>
                        <td className={`py-4 px-6 font-semibold transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{lead.company}</td>
                        <td className={`py-4 px-6 leading-snug transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                          {lead.needs}
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <div className={`w-12 h-2 rounded-full overflow-hidden ${isDarkMode ? 'bg-slate-950' : 'bg-slate-100'}`}>
                              <div 
                                className={`h-full ${lead.score > 90 ? 'bg-[#10B981]' : 'bg-sky-500'}`} 
                                style={{ width: `${lead.score}%` }}
                              />
                            </div>
                            <span className={`text-[10px] font-bold ${
                              lead.score > 90 
                                ? 'text-[#10B981]' 
                                : isDarkMode ? 'text-sky-450 text-sky-400' : 'text-indigo-600'
                            }`}>
                              {lead.score}%
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2 py-0.5 rounded text-[9px] font-bold border transition-colors ${
                            lead.status === 'Agendado' 
                              ? isDarkMode 
                                ? 'bg-emerald-950/50 border-emerald-900/60 text-emerald-400 rounded-full'
                                : 'bg-green-50 border border-green-100 text-green-700 rounded-full' 
                              : lead.status === 'En Conversación' 
                                ? isDarkMode
                                  ? 'bg-slate-950 border border-slate-850 text-slate-300 rounded-full'
                                  : 'bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-full'
                                : isDarkMode
                                  ? 'bg-blue-950/50 border-blue-900/60 text-blue-400 rounded-full'
                                  : 'bg-blue-50 border border-blue-100 text-blue-700 rounded-full'
                          }`}>
                            {lead.status}
                          </span>
                        </td>
                        <td className={`py-4 px-6 text-right transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-400'}`}>
                          {lead.time}
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>

            {/* CRM Bottom Action bar details */}
            <div className={`border-t py-3 px-6 text-[10px] font-mono flex justify-between items-center transition-colors ${
              isDarkMode ? 'bg-slate-950/60 border-slate-850 text-slate-300' : 'bg-slate-50 border-slate-100 text-slate-450 text-slate-400'
            }`}>
              <span>LISTANDO ÚLTIMOS LEADS DETECTADOS EN EL ENTORNO DE PRUEBA</span>
              <span className="flex items-center gap-2">
                <span className={`w-1.5 h-1.5 rounded-full ${isDarkMode ? 'bg-[#10B981]' : 'bg-indigo-600'}`} />
                <span>Base Activa</span>
              </span>
            </div>
          </div>
        </section>

        {/* ================= SECTION 4: ANALYTIAL CONTROL (0.54 to 0.72) ================= */}
        <section id="analytics-section" className="relative w-full min-h-[100vh] py-24 px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm select-none mb-2 ${
              isDarkMode ? 'bg-emerald-950/30 border-emerald-900/60 text-emerald-400' : 'bg-emerald-50 border border-emerald-100/60'
            }`}>
              <TrendingUp className="w-3.5 h-3.5 text-[#10B981]" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-shine-emerald font-black">OPTIMIZACIÓN INTELIGENTE</span>
            </div>

            <h2 className={`text-3xl md:text-5xl font-black tracking-tight leading-tight transition-colors duration-750 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              Análisis profundo de conversión en un toque.
            </h2>

            <p className={`text-sm md:text-base leading-relaxed max-w-xl transition-colors duration-750 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Nuestra consola de control unifica el tráfico diario de tu sitio con el desempeño del Bot. Con un solo clic puedes encender la <strong>&quot;Optimización de Conversión Autónoma&quot;</strong> de la IA para ajustar el comportamiento del Bot según interacciones críticas.
            </p>

            {/* AI Control switch box */}
            <div className={`p-5 rounded-2xl border shadow-md relative overflow-hidden select-none transition-all duration-750 backdrop-blur-md ${
              isDarkMode ? 'bg-slate-950/50 border-white/5 shadow-inner' : 'bg-white/50 border-slate-200/70 shadow-inner'
            }`}>
              <div className="flex justify-between items-center mb-3">
                <span className={`text-xs font-mono font-bold flex items-center gap-1.5 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  <Zap className="w-4 h-4 text-amber-500 animate-pulse" />
                  <span>AUTOTUNING CON IA</span>
                </span>
                
                {/* Switch button */}
                <button
                  onClick={() => setIsAiOptimized(!isAiOptimized)}
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                  className={`w-12 h-6 rounded-full transition-all flex items-center px-1 cursor-pointer ${
                    isAiOptimized ? 'bg-[#10B981] justify-end shadow-md shadow-emerald-500/10' : isDarkMode ? 'bg-slate-950 border-slate-800 justify-start' : 'bg-slate-200 justify-start'
                  }`}
                >
                  <motion.div 
                    layout 
                    className="w-4 h-4 rounded-full bg-white" 
                  />
                </button>
              </div>
              <p className={`text-[11px] leading-relaxed font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                {isAiOptimized 
                  ? 'Modo IA Activo: El bot ha cambiado dinámicamente sus respuestas para enfocarse en prospectos High-Intent. Las conversiones crecen.' 
                  : 'Modo pasivo: Configuración de asistencia estándar. Pulsa para habilitar optimización predictiva.'}
              </p>
            </div>
          </div>

          {/* METRIC GRAPHICS PANEL */}
          <div className="lg:col-span-12 xl:col-span-7">
            <div className={`border rounded-3xl p-6 relative overflow-hidden shadow-2xl transition-all duration-750 backdrop-blur-xl ${
              isDarkMode ? 'bg-slate-955/35 bg-slate-950/40 border-white/10 shadow-black/90 shadow-[0_12px_40px_rgba(0,0,0,0.4)]' : 'bg-white/45 border-slate-200/80 shadow-indigo-120 shadow-indigo-100/30'
            }`}>
              {/* Graphic Header Selector */}
              <div className={`flex justify-between items-center border-b pb-5 mb-6 flex-wrap gap-4 ${isDarkMode ? 'border-slate-850' : 'border-slate-100'}`}>
                <div>
                  <h3 className={`text-sm font-bold font-mono ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>Consola Analítica Integrada</h3>
                  <p className={`text-[10px] font-mono mt-1 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Monitoreo de tráfico y leads para maximizar el ROI</p>
                </div>

                <div className={`flex gap-2 border p-1 rounded-xl transition-all duration-300 backdrop-blur-md ${
                  isDarkMode ? 'bg-slate-950/40 border-white/5' : 'bg-slate-50/50 border-slate-200/60'
                }`}>
                  {(['conversion', 'leads', 'speed'] as const).map((metric) => (
                    <button
                      key={metric}
                      onClick={() => setViewMetric(metric)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-mono leading-none tracking-wider text-center transition-all cursor-pointer ${
                        viewMetric === metric 
                          ? isDarkMode 
                            ? 'bg-slate-900 text-[#10B981] font-bold border border-slate-800 shadow-sm' 
                            : 'bg-white text-indigo-600 font-bold border border-slate-200/60 shadow-sm' 
                          : isDarkMode
                            ? 'text-slate-400 hover:text-slate-200'
                            : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      {metric === 'conversion' ? 'Conversión %' : metric === 'leads' ? 'Pipeline Leads' : 'Soporte Speed'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Graphical Content Dynamic */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center h-[280px]">
                <div className="md:col-span-5 flex flex-col items-center justify-center">
                  {/* Gauge representation using pure SVG for absolute React 19 safety */}
                  <div className="relative w-40 h-40 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r="65"
                        fill="transparent"
                        stroke={isDarkMode ? 'rgba(255,255,255,0.06)' : 'rgba(15,23,42,0.04)'}
                        strokeWidth="11"
                      />
                      <circle
                        cx="80"
                        cy="80"
                        r="65"
                        fill="transparent"
                        stroke={isAiOptimized ? 'url(#glowCyan)' : 'url(#glowPurple)'}
                        strokeWidth="10"
                        strokeDasharray={408}
                        strokeDashoffset={isAiOptimized ? 80 : 160} // Morph circular gauge on AI active
                        className="transition-all duration-1000 ease-in-out"
                      />
                      <defs>
                        <linearGradient id="glowCyan" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#4A82BF" />
                          <stop offset="100%" stopColor="#10B981" />
                        </linearGradient>
                        <linearGradient id="glowPurple" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#8b5cf6" />
                          <stop offset="100%" stopColor="#ec4899" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute flex flex-col items-center">
                      <span className={`text-[10px] font-mono uppercase tracking-widest leading-none font-bold transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Tasa Conversión</span>
                      <span className={`text-3xl font-black font-sans mt-1 ${isDarkMode ? 'text-slate-100' : 'text-slate-800'}`}>
                        {isAiOptimized ? '28.4%' : '18.4%'}
                      </span>
                      <span className="text-[9px] font-mono text-[#10B981] mt-0.5 flex items-center font-bold">
                        {isAiOptimized ? '▲ +54% Máximo AI' : '▲ +14% Base'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-7 space-y-5">
                  {/* Metric detailed bars */}
                  <div>
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span className={`transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Conversión Web Promedio</span>
                      <span className={`font-bold transition-colors ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>2.1%</span>
                    </div>
                    <div className={`w-full border h-2.5 rounded-full overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-200/50'}`}>
                      <div className="h-full bg-slate-500 rounded-full" style={{ width: '12%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span className={`transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>JIPA Digital (Modo Base)</span>
                      <span className={`font-bold transition-colors ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}>18.4%</span>
                    </div>
                    <div className={`w-full border h-2.5 rounded-full overflow-hidden transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-200/50'}`}>
                      <div className="h-full bg-[#4A82BF] rounded-full" style={{ width: '58%' }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-mono mb-2">
                      <span className="text-[#10B981] flex items-center gap-1 font-bold">
                        <Sparkles className="w-3 h-3 text-[#10B981]" />
                        <span>JIPA Digital (AI Optimización Activa)</span>
                      </span>
                      <span className="text-[#10B981] font-bold">28.4%</span>
                    </div>
                    <div className={`w-full border h-2.5 rounded-full overflow-hidden shadow-inner transition-colors ${isDarkMode ? 'bg-slate-950 border-slate-850' : 'bg-slate-100 border-slate-200/50'}`}>
                      <motion.div 
                        initial={{ width: '58%' }}
                        animate={{ width: isAiOptimized ? '85%' : '58%' }}
                        transition={{ duration: 1 }}
                        className="h-full bg-gradient-to-r from-indigo-500 via-emerald-500 to-[#10B981] rounded-full" 
                      />
                    </div>
                  </div>

                  <p className={`text-[10px] leading-normal font-mono pt-2 transition-colors ${isDarkMode ? 'text-slate-350' : 'text-slate-500'}`}>
                    *Tasa de conversión en base a número total de visitas redirigidas a leads calificados.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
          {/* ================= SECTION 5: SCHEDULER BOARD (0.72 to 0.90) ================= */}
        <section id="scheduler-section" className="relative w-full min-h-[100vh] py-24 px-6 lg:px-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-12 xl:col-span-5 space-y-6">
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border shadow-sm select-none mb-2 ${
              isDarkMode ? 'bg-[#4A82BF]/10 border-[#4A82BF]/30 text-[#4A82BF]' : 'bg-blue-50 border border-blue-100/60 shadow-sm'
            }`}>
              <Calendar className="w-3.5 h-3.5 text-[#4A82BF]" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-shine-steel font-black">AGENDADOR SIN FILTROS</span>
            </div>

            <h2 className={`text-3xl md:text-5xl font-black tracking-tight leading-tight transition-colors duration-750 ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
              Llamadas coordinadas de forma inteligente.
            </h2>

            <p className={`text-sm md:text-base leading-relaxed max-w-xl transition-colors duration-750 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              Nuestra plataforma automatiza la reserva de reuniones. Cuando el Bot identifica un prospecto calificado, le muestra dinámicamente un selector de agenda integrado con tu cuenta empresarial. Sin idas y vueltas de correos.
            </p>

            <div className={`flex gap-4 items-center pt-4 border-t transition-colors duration-750 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className={`flex items-center gap-2 text-xs font-mono transition-colors duration-750 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                <Clock className="w-4 h-4 text-[#4A82BF] animate-pulse" />
                <span>Conversión en 3 min</span>
              </div>
              <div className={`flex items-center gap-2 text-xs font-mono transition-colors duration-750 ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                <Check className="w-4 h-4 text-green-600 animate-bounce" />
                <span>Sincronización de Outlook & Google</span>
              </div>
            </div>
          </div>

          {/* DYNAMIC BOOKING SYSTEM COMPONENT */}
          <div className="lg:col-span-12 xl:col-span-7">
            <div className={`border rounded-3xl p-6 relative overflow-hidden shadow-2xl transition-all duration-750 backdrop-blur-xl ${
              isDarkMode ? 'bg-slate-950/40 border-white/10 shadow-black/90 shadow-[0_12px_40px_rgba(0,0,0,0.4)]' : 'bg-white/45 border-slate-200/80 shadow-indigo-100/30'
            }`}>
              <div className={`border-b pb-5 mb-6 transition-colors ${isDarkMode ? 'border-slate-850' : 'border-slate-100'}`}>
                <h3 className={`text-sm font-bold font-mono flex items-center gap-2 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                  <Calendar className="w-4 h-4 text-[#10B981]" />
                  <span>Demostración de Agenda Empresarial - JIPA Digital</span>
                </h3>
                <p className={`text-[10px] font-mono mt-1 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>Simula agendar tu consultoría estratégica de inmediato</p>
              </div>

              {/* Booking Layout slots */}
              <div className="space-y-6">
                <div>
                  <label className={`text-[10px] font-mono font-bold uppercase tracking-widest block mb-3 transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                    Selecciona Hora para Mañana:
                  </label>
                  
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {bookingTimes.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => handleBooking(slot)}
                        onMouseEnter={() => setCursorHovered(true)}
                        onMouseLeave={() => setCursorHovered(false)}
                        className={`py-3 px-1 rounded-xl text-xs font-mono border transition-all duration-300 text-center cursor-pointer backdrop-blur-sm ${
                          selectedSlot === slot 
                            ? 'bg-[#10B981] text-white font-bold border-[#10B981] shadow-lg shadow-emerald-500/25 scale-[1.03]' 
                            : isDarkMode 
                              ? 'bg-white/5 border-white/5 text-slate-300 hover:border-[#10B981] hover:text-[#10B981] hover:bg-white/12'
                              : 'bg-slate-900/5 border-slate-900/5 text-slate-600 hover:border-indigo-400 hover:text-indigo-600 hover:bg-slate-900/10'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Simulated booking results status area */}
                <AnimatePresence mode="wait">
                  {bookedStatus && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className={`rounded-2xl border p-5 mt-4 transition-all duration-300 backdrop-blur-md ${
                        isDarkMode ? 'bg-emerald-950/20 border-emerald-900/35 shadow-[0_4px_20px_rgba(16,185,129,0.05)]' : 'bg-indigo-50/40 border-indigo-100 shadow-[0_4px_20px_rgba(79,70,229,0.04)]'
                      }`}
                    >
                      {bookedStatus === 'pending' ? (
                        <div className="flex items-center gap-3">
                          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-ping" />
                          <span className={`text-xs font-mono ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Coordinando con tu calendario...</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className={`flex items-center gap-2.5 font-bold uppercase tracking-wider ${isDarkMode ? 'text-emerald-400' : 'text-green-700'}`}>
                            <CheckCircle className={`w-5 h-5 ${isDarkMode ? 'text-emerald-400' : 'text-green-600'}`} />
                            <span className="text-xs font-mono">¡CITA CREADA CON ÉXITO!</span>
                          </div>
                          
                          <p className={`text-xs leading-relaxed font-sans font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                            Hemos reservado tu consultoría para mañana a las <strong className={`inline-block font-bold px-1.5 py-0.5 rounded ${
                              isDarkMode ? 'text-emerald-400 bg-emerald-950 border border-emerald-900/60' : 'text-indigo-700 bg-indigo-50 border border-indigo-100'
                            }`}>{selectedSlot}</strong>. Nuestro robot autónomo ha enviado los detalles al CRM de forma interna y se ha generado la alerta en el panel de control.
                          </p>

                          <div className={`border p-3 rounded-lg text-[10px] font-mono shadow-sm font-semibold transition-colors ${
                            isDarkMode ? 'bg-slate-950 border-slate-850 text-slate-400' : 'bg-white border-slate-200 text-slate-400'
                          }`}>
                            REGISTRO ID: Æ-{bookingId || 104829}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </section>

        {/* ================= SECTION 6: CONVERSION & PRICING PLANS (0.90 to 1.0) ================= */}
        <section id="pricing-section" className="relative w-full min-h-[100vh] py-24 px-6 lg:px-20 flex flex-col justify-center">
          <div className="max-w-4xl mx-auto text-center mb-16">
            <span className="text-[10px] font-mono tracking-widest text-[#10B981] font-black uppercase">MODELOS DE INCORPORACIÓN</span>
            <h2 className={`text-3xl md:text-5xl font-black mt-3 transition-colors duration-750 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              Planes diseñados para la conversión premium.
            </h2>
            <p className={`text-xs md:text-sm max-w-xl mx-auto mt-4 leading-relaxed transition-colors duration-750 ${
              isDarkMode ? 'text-slate-300' : 'text-slate-500'
            }`}>
              Escoge el nivel de asistencia automática y analítica empresarial que necesitas para llevar la conversión de tu página a niveles récord.
            </p>
          </div>

          {/* Pricing cards grid */}
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 w-full select-none">
            {/* Plan 1 */}
            <div className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-500 relative overflow-hidden backdrop-blur-xl ${
              interactionShine 
                ? 'border-[#10B981] shadow-2xl shadow-emerald-500/15' 
                : isDarkMode 
                  ? 'border-white/10 bg-slate-950/40 text-slate-200 shadow-black/80' 
                  : 'border-slate-200 bg-white/45 text-slate-800 shadow-slate-200/40'
            } ${isDarkMode ? 'hover:border-[#10B981] hover:bg-slate-950/60' : 'hover:border-[#10B981] hover:bg-white/70 hover:shadow-xl'}`}>
              {interactionShine && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(16,185,129,0.08)_50%,transparent_70%)] animate-shine pointer-events-none z-10" />
              )}
              <div className="space-y-4">
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded transition-colors ${
                  isDarkMode ? 'bg-slate-950 text-slate-300 border border-slate-850/60' : 'bg-slate-100 text-slate-500'
                }`}>PRO BUILDER</span>
                <div className="flex items-baseline gap-1 pt-3">
                  <span className={`text-3xl font-black font-mono transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>$8,900</span>
                  <span className={`text-[10px] font-mono uppercase transition-colors ${isDarkMode ? 'text-slate-305 text-slate-300' : 'text-slate-400'}`}>MXN / mes</span>
                </div>
                <p className={`text-xs leading-relaxed font-sans transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  Ideal para startups y profesionales independientes que buscan lanzar un sitio web inmersivo moderno con soporte conversacional integrado.
                </p>

                <ul className={`text-[11px] font-mono space-y-3.5 pt-4 border-t transition-colors ${
                  isDarkMode ? 'text-slate-300 border-slate-850' : 'text-slate-600 border-slate-100'
                }`}>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Sitio Web Custom 1 Sección (Inmersivo)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Bot de IA para Consultas de Clientes</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>CRM Interno Base</span>
                  </li>
                  <li className={`flex items-center gap-2 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                    <X className="w-3.5 h-3.5 text-slate-400" />
                    <span>Optimización predictiva autónoma</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => scrollTo(0.18)}
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                  className={`w-full py-3 rounded-xl border font-sans font-semibold text-xs transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Probar Demo Interactiva
                </button>
              </div>
            </div>

            {/* Plan 2 (Highlighted) */}
            <div className={`rounded-3xl border-2 p-6 flex flex-col justify-between relative shadow-2xl scale-[1.03] md:-translate-y-2 overflow-hidden transition-all duration-500 backdrop-blur-xl ${
              interactionShine 
                ? 'border-emerald-400 bg-slate-950/60' 
                : isDarkMode 
                  ? 'border-emerald-600/80 bg-slate-950/50 shadow-black/85' 
                  : 'border-[#10B981] bg-white/60 shadow-indigo-100/40'
            }`}>
              <div className={`absolute top-0 right-6 -translate-y-1/2 px-3 py-1 rounded-full text-white font-mono font-bold text-[9px] tracking-widest uppercase shadow z-20 ${
                isDarkMode ? 'bg-emerald-600 shadow-emerald-950/40' : 'bg-[#10B981] shadow-emerald-100/40'
              }`}>
                RECOMENDADO
              </div>
              {interactionShine && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(16,185,129,0.14)_50%,transparent_70%)] animate-shine pointer-events-none z-10" />
              )}

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-mono font-bold border rounded px-2 py-0.5 transition-colors ${
                    isDarkMode ? 'bg-emerald-950/65 border-emerald-900/60 text-[#10B981]' : 'bg-emerald-50 border border-emerald-100 text-[#10B981]'
                  }`}>ENTERPRISE NEXUS</span>
                </div>
                <div className="flex items-baseline gap-1 pt-3">
                  <span className={`text-3xl font-black font-mono transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>$16,500</span>
                  <span className={`text-[10px] font-mono transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>MXN / mes</span>
                </div>
                <p className={`text-xs leading-relaxed font-sans transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                  Para comercios y empresas en crecimiento con alto volumen de visitas. Permite agendar llamadas directamente en calendarios corporativos de tu equipo.
                </p>

                <ul className={`text-[11px] font-mono space-y-3.5 pt-4 border-t transition-colors ${
                  isDarkMode ? 'text-slate-300 border-slate-800' : 'text-slate-700 border-slate-100'
                }`}>
                  <li className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Sitio Web Multi-Sección Completo</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Bot Calificador de Extracción Profunda</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Agendador Calendario Sincronizado</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>CRM Avanzado con Consola Analítica</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button 
                  onClick={() => scrollTo(1)}
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                  className={`w-full py-3 rounded-xl font-sans font-semibold text-xs shadow-lg transition-all cursor-pointer ${
                    isDarkMode 
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/20' 
                      : 'bg-[#10B981] hover:bg-[#0d9a6c] text-white shadow-emerald-100/40'
                  }`}
                >
                  Adquirir Plan Enterprise
                </button>
              </div>
            </div>

            {/* Plan 3 */}
            <div className={`rounded-2xl border p-6 flex flex-col justify-between transition-all duration-500 relative overflow-hidden backdrop-blur-xl ${
              interactionShine 
                ? 'border-[#10B981]' 
                : isDarkMode 
                  ? 'border-white/10 bg-slate-950/40 shadow-black/80' 
                  : 'border-slate-200 bg-white/45 shadow-slate-200/40'
            } ${isDarkMode ? 'hover:border-[#10B981] hover:bg-slate-950/60' : 'hover:border-[#10B981] hover:bg-white/70 hover:shadow-xl'}`}>
              {interactionShine && (
                <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_30%,rgba(16,185,129,0.08)_50%,transparent_70%)] animate-shine pointer-events-none z-10" />
              )}
              <div className="space-y-4">
                <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded transition-colors ${
                  isDarkMode ? 'bg-slate-950 text-slate-300 border border-slate-850/60' : 'bg-slate-100 text-slate-500'
                }`}>CUSTOM MATRIX</span>
                <div className="flex items-baseline gap-1 pt-3">
                  <span className={`text-3xl font-black font-mono transition-colors ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Consultar</span>
                </div>
                <p className={`text-xs leading-relaxed font-sans transition-colors ${isDarkMode ? 'text-slate-300' : 'text-slate-500'}`}>
                  Integraciones específicas (ERP, Salesforce, HubSpot), bases vectoriales dedicadas para entrenamiento masivo con documentos internos de soporte.
                </p>

                <ul className={`text-[11px] font-mono space-y-3.5 pt-4 border-t transition-colors ${
                  isDarkMode ? 'text-slate-300 border-slate-850' : 'text-slate-600 border-slate-100'
                }`}>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Agentes de IA ilimitados dedicados</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Entrenamiento masivo con PDFs / APIs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>Conexión bidireccional externa Salesforce/HubSpot</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-[#10B981]" />
                    <span>SLA Certificado de Operación</span>
                  </li>
                </ul>
              </div>

              <div className="pt-8">
                <button 
                  onMouseEnter={() => setCursorHovered(true)}
                  onMouseLeave={() => setCursorHovered(false)}
                  className={`w-full py-3 rounded-xl border font-sans font-semibold text-xs transition-colors cursor-pointer ${
                    isDarkMode 
                      ? 'border-slate-800 bg-slate-950 text-slate-300 hover:bg-slate-900 hover:text-white' 
                      : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  Contactar Ventas
                </button>
              </div>
            </div>
          </div>

          {/* Simple premium bottom design credit */}
          <footer className={`mt-32 max-w-6xl mx-auto w-full pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-mono transition-colors ${
            isDarkMode ? 'border-slate-850 text-slate-300' : 'border-slate-200 text-slate-400'
          }`}>
            <span>© 2026 AETHERA TECHNOLOGY INC. TODOS LOS DERECHOS RESERVADOS.</span>
            <div className="flex gap-6">
              <span className={`transition-colors cursor-pointer ${isDarkMode ? 'hover:text-slate-300' : 'hover:text-slate-500'}`}>TÉRMINOS DE SERVICIO</span>
              <span className={`transition-colors cursor-pointer ${isDarkMode ? 'hover:text-slate-300' : 'hover:text-slate-500'}`}>POLÍTICA DE PRIVACIDAD</span>
            </div>
          </footer>
        </section>

      </div>
    </main>
  );
}

// Simple Mini Icon Components for UI pairing
function MessageCircleIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2.5" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}
