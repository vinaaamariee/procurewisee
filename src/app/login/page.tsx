"use client";

import React, { useState, useTransition, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { login } from '../actions/auth';
import { ThemeToggle } from '@/components/theme-toggle';
import { Mail, Lock, User, Building2, Phone, MapPin, Eye, EyeOff, ArrowRight } from 'lucide-react';

function NetworkVisualizer() {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Make canvas fill the container perfectly
    function resize() {
      if (!canvas || !container) return;
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
    
    resize();
    window.addEventListener('resize', resize);

    // Configuration
    const PARTICLE_COUNT = 40;
    const CONNECTION_DISTANCE = 140;

    class NetworkNode {
      baseX: number;
      baseY: number;
      x: number;
      y: number;
      angle: number;
      orbitRadius: number;
      orbitSpeed: number;
      radius: number;
      isGold: boolean;

      constructor(canvasWidth: number, canvasHeight: number) {
        // Set a permanent home base so the web structure never dismantles
        this.baseX = Math.random() * canvasWidth;
        this.baseY = Math.random() * canvasHeight;
        this.x = this.baseX;
        this.y = this.baseY;
        
        // Randomize orbit properties for organic breathing movement
        this.angle = Math.random() * Math.PI * 2;
        this.orbitRadius = Math.random() * 18 + 5; // Orbit between 5px and 23px
        this.orbitSpeed = (Math.random() * 0.008) + 0.004;
        
        this.radius = Math.random() * 2 + 1.5;
        this.isGold = Math.random() > 0.4;
      }

      update() {
        // Node orbits its home base instead of drifting away infinitely
        this.angle += this.orbitSpeed;
        this.x = this.baseX + Math.cos(this.angle) * this.orbitRadius;
        this.y = this.baseY + Math.sin(this.angle) * this.orbitRadius;
      }

      draw(context: CanvasRenderingContext2D) {
        context.beginPath();
        context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        context.fillStyle = this.isGold ? '#dcb353' : '#a52a2a';
        context.fill();
      }
    }

    // Initialize the nodes array
    const particles: NetworkNode[] = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new NetworkNode(canvas.width, canvas.height));
    }

    let animationFrameId: number;

    // The main animation loop
    function animate() {
      if (!canvas || !ctx) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Draw connecting lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < CONNECTION_DISTANCE) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);

            // Lines stretch and fade out slightly as nodes reach edge of orbit
            const opacity = 1 - (distance / CONNECTION_DISTANCE);

            if (particles[i].isGold && particles[j].isGold) {
              ctx.strokeStyle = `rgba(220, 179, 83, ${opacity * 0.35})`;
            } else {
              ctx.strokeStyle = `rgba(165, 42, 42, ${opacity * 0.35})`;
            }

            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Move and draw all nodes
      particles.forEach((node) => {
        node.update();
        node.draw(ctx);
      });

      animationFrameId = requestAnimationFrame(animate);
    }

    // Start the engine
    animate();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div ref={containerRef} id="network-container">
      <canvas ref={canvasRef} id="networkCanvas" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1 }} />
      <div className="network-labels" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none' }}>
        <div className="badge gold" style={{ top: '25%', left: '60%' }}>SUPPLIER A</div>
        <div className="badge red" style={{ top: '35%', left: '30%' }}>BID #4S911</div>
        <div className="badge red" style={{ top: '45%', left: '75%' }}>LOGISTICS</div>
        <div className="badge gold" style={{ top: '60%', left: '70%' }}>AUCTION LIVE</div>
        <div className="badge gold" style={{ top: '65%', left: '60%' }}>CONTRACT VALID</div>
        <div className="badge red" style={{ top: '75%', left: '20%' }}>SUPPLIER 1</div>
        <div className="raw-text" style={{ top: '45%', left: '55%' }}>PRICE DATA</div>
      </div>
    </div>
  );
}

function LoginPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  
  const error = searchParams.get('error');
  const success = searchParams.get('success');

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleClearParams = () => {
    router.replace('/login');
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>, action: (formData: FormData) => Promise<unknown>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      await action(formData);
    });
  };

  return (
    <div className="login-container-wrapper min-h-screen relative overflow-x-hidden">
      <style dangerouslySetInnerHTML={{ __html: `
        /* --- Stylesheet adapted for ProcureWise login layout --- */
        .login-container-wrapper {
            display: flex;
            min-height: 100vh;
            width: 100%;
            background-color: #f6f8fb;
            transition: background-color 0.3s ease;
        }
        .dark .login-container-wrapper {
            background-color: #070b13;
        }

        /* --- Left Panel --- */
        .left-panel {
            width: 50%;
            background: linear-gradient(180deg, #121316 0%, #1a1215 40%, #3e0b0e 100%);
            position: relative;
            padding: 40px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            overflow: hidden;
            border-right: 1px solid rgba(255, 255, 255, 0.05);
        }

        .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
            z-index: 10;
        }

        .logo-icon {
            width: 32px;
            height: 32px;
        }

        .logo-text {
            color: #ffffff;
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.5px;
        }

        .logo-text span {
            color: #dcb353;
        }

        .tagline {
            color: #a0a0a0;
            font-size: 14px;
            margin-top: 8px;
            z-index: 10;
        }

        /* --- Right Panel --- */
        .right-panel {
            width: 50%;
            background-color: #f6f8fb;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 40px;
            transition: background-color 0.3s ease;
        }
        .dark .right-panel {
            background-color: #070b13;
        }

        .right-panel-inner {
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            min-height: calc(100vh - 80px);
            width: 100%;
            max-width: 440px;
            z-index: 10;
        }
        @media (max-width: 900px) {
            .right-panel-inner {
                min-height: auto;
            }
        }

        /* Blurred Background Blobs */
        .blob {
            position: absolute;
            border-radius: 50%;
            filter: blur(60px);
            z-index: 0;
            opacity: 0.6;
            transition: background-color 0.3s ease;
        }

        .blob-1 {
            top: 15%;
            right: 20%;
            width: 250px;
            height: 250px;
            background: #d8c3af;
        }
        .dark .blob-1 {
            background: rgba(216, 195, 175, 0.15);
        }

        .blob-2 {
            top: 25%;
            right: 15%;
            width: 200px;
            height: 200px;
            background: #a96c73;
        }
        .dark .blob-2 {
            background: rgba(169, 108, 115, 0.15);
        }

        .blob-3 {
            bottom: 10%;
            left: 20%;
            width: 150px;
            height: 150px;
            background: #b26a6a;
        }
        .dark .blob-3 {
            background: rgba(178, 106, 106, 0.15);
        }

        /* Login Card */
        .login-card {
            background: rgba(255, 255, 255, 0.65);
            backdrop-filter: blur(24px);
            -webkit-backdrop-filter: blur(24px);
            border: 1px solid rgba(255, 255, 255, 0.8);
            border-radius: 20px;
            padding: 40px;
            width: 100%;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.03);
            z-index: 10;
            transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
            margin: auto 0;
        }
        .dark .login-card {
            background: rgba(15, 23, 42, 0.65);
            border-color: rgba(255, 255, 255, 0.08);
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
        }

        .card-header h2 {
            font-size: 13px;
            color: #dcb353;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 8px;
        }
        .dark .card-header h2 {
            color: #dcb353;
        }

        .card-header h1 {
            font-size: 30px;
            color: #111;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
        }
        .dark .card-header h1 {
            color: #ffffff;
        }

        .card-header p {
            font-size: 14px;
            color: #666;
            margin-bottom: 28px;
        }
        .dark .card-header p {
            color: #94a3b8;
        }

        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 16px;
        }
        @media (max-width: 480px) {
            .form-row {
                grid-template-columns: 1fr;
                gap: 0;
            }
        }

        .form-group {
            margin-bottom: 18px;
            position: relative;
        }

        .form-group label {
            display: block;
            font-size: 13px;
            font-weight: 600;
            color: #111;
            margin-bottom: 8px;
        }
        .dark .form-group label {
            color: #e2e8f0;
        }

        .input-wrapper {
            position: relative;
        }

        .form-group input, .form-group textarea {
            width: 100%;
            padding: 13px 40px 13px 16px;
            border: 1px solid #e0e0e0;
            border-radius: 10px;
            font-size: 14px;
            background-color: #ffffff;
            color: #111;
            outline: none;
            transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
        }
        .dark .form-group input, .dark .form-group textarea {
            border-color: rgba(255, 255, 255, 0.08);
            background-color: rgba(15, 23, 42, 0.4);
            color: #ffffff;
        }

        .form-group input::placeholder, .form-group textarea::placeholder {
            color: #999;
        }
        .dark .form-group input::placeholder, .dark .form-group textarea::placeholder {
            color: #556070;
        }

        .form-group input:focus, .form-group textarea:focus {
            border-color: #dcb353;
        }
        .dark .form-group input:focus, .dark .form-group textarea:focus {
            border-color: #dcb353;
        }

        .input-icon {
            position: absolute;
            right: 14px;
            top: 50%;
            transform: translateY(-50%);
            color: #888;
            width: 18px;
            height: 18px;
            cursor: pointer;
            transition: color 0.2s;
        }
        .input-icon:hover {
            color: #555;
        }
        .dark .input-icon:hover {
            color: #ccc;
        }

        .forgot-password {
            display: block;
            text-align: right;
            font-size: 13px;
            color: #555;
            text-decoration: none;
            margin-top: -6px;
            margin-bottom: 24px;
        }
        .forgot-password:hover {
            text-decoration: underline;
        }
        .dark .forgot-password {
            color: #94a3b8;
        }
        .dark .forgot-password:hover {
            color: #ffffff;
        }

        .btn-submit {
            width: 100%;
            padding: 14px;
            border: none;
            border-radius: 30px;
            background: linear-gradient(90deg, #621418 0%, #b88a1b 100%);
            color: white;
            font-size: 14px;
            font-weight: 600;
            letter-spacing: 0.5px;
            cursor: pointer;
            box-shadow: 0 10px 20px rgba(98, 20, 24, 0.15);
            transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
        }
        .btn-submit:hover {
            transform: translateY(-1px);
            filter: brightness(1.1);
            box-shadow: 0 12px 24px rgba(98, 20, 24, 0.25);
        }
        .btn-submit:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
        }

        .signup-text {
            text-align: center;
            font-size: 13px;
            color: #444;
            margin-top: 24px;
            margin-bottom: 16px;
        }
        .dark .signup-text {
            color: #94a3b8;
        }

        .signup-text a {
            color: #621418;
            font-weight: 600;
            text-decoration: none;
            transition: color 0.2s;
        }
        .signup-text a:hover {
            text-decoration: underline;
        }
        .dark .signup-text a {
            color: #dcb353;
        }

        .social-logins {
            display: flex;
            flex-direction: column;
            gap: 12px;
            align-items: center;
            border-top: 1px solid rgba(0, 0, 0, 0.05);
            padding-top: 20px;
        }
        .dark .social-logins {
            border-top-color: rgba(255, 255, 255, 0.08);
        }

        .social-btn {
            font-size: 13px;
            color: #555;
            text-decoration: none;
            font-weight: 500;
            border-bottom: 1px solid #777;
            padding-bottom: 2px;
            transition: color 0.2s, border-color 0.2s;
        }
        .social-btn:hover {
            color: #111;
            border-color: #111;
        }
        .dark .social-btn {
            color: #94a3b8;
            border-color: #555;
        }
        .dark .social-btn:hover {
            color: #ffffff;
            border-color: #ffffff;
        }

        /* --- Network Visualizer CSS --- */
        #network-container {
            position: relative;
            width: 100%;
            height: 100%;
            min-height: 450px;
            flex-grow: 1;
            overflow: hidden;
        }

        .badge {
            position: absolute;
            padding: 5px 10px;
            border-radius: 4px;
            font-size: 11px;
            font-weight: 500;
            letter-spacing: 0.5px;
            animation: pulseLabel 4s ease-in-out infinite alternate;
        }
        .badge.gold {
            border: 1px solid rgba(220, 179, 83, 0.5);
            color: rgba(255, 255, 255, 0.9);
            background: rgba(220, 179, 83, 0.08);
        }
        .badge.red {
            border: 1px solid rgba(165, 42, 42, 0.5);
            color: rgba(255, 255, 255, 0.9);
            background: rgba(165, 42, 42, 0.08);
        }
        .raw-text {
            position: absolute;
            font-size: 11px;
            color: rgba(255, 255, 255, 0.6);
            font-weight: 500;
            animation: pulseText 5s ease-in-out infinite alternate-reverse;
        }
        @keyframes pulseLabel {
            0% { transform: translateY(0px) scale(0.95); opacity: 0.7; box-shadow: 0 0 0px rgba(0,0,0,0); }
            100% { transform: translateY(-8px) scale(1.05); opacity: 1; box-shadow: 0 6px 15px rgba(220, 179, 83, 0.2); }
        }
        @keyframes pulseText {
            0% { transform: translateY(0px) scale(0.95); opacity: 0.4; text-shadow: 0 0 0px rgba(255,255,255,0); }
            100% { transform: translateY(6px) scale(1.05); opacity: 0.9; text-shadow: 0 0 8px rgba(255,255,255,0.4); }
        }

        /* Responsive Design */
        @media (max-width: 900px) {
            .login-container-wrapper {
                flex-direction: column;
            }
            .left-panel {
                width: 100%;
                min-height: 40vh;
                padding: 30px;
                border-right: none;
                border-bottom: 1px solid rgba(255, 255, 255, 0.05);
                display: flex;
                flex-direction: column;
                justify-content: space-between;
            }
            .right-panel {
                width: 100%;
                min-height: 60vh;
                padding: 30px 20px;
            }
            .login-card {
                padding: 30px 24px;
            }
            #network-container {
                min-height: 280px;
                max-height: 320px;
                width: 100%;
                margin-top: 20px;
                margin-bottom: 10px;
                align-self: center;
            }
        }
      `}} />

      {/* Left Panel */}
      <div className="left-panel">
        {/* Top Header Identity Group */}
        <div className="logo-container" style={{ display: 'flex', alignItems: 'center', gap: '14px', zIndex: 10, marginBottom: '20px' }}>
          <div style={{ backgroundColor: '#ffffff', border: '1.5px solid #e5e7eb', boxShadow: '0 4px 15px rgba(220, 179, 83, 0.15)', borderRadius: '14px', width: '52px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", fontWeight: 900, fontSize: '22px', letterSpacing: '-1px' }}>
            <span style={{ color: '#7e191b' }}>P</span><span style={{ color: '#dcb353' }}>W</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{ color: '#ffffff', fontSize: '26px', fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.5px' }}>ProcureWise</div>
            <div style={{ color: '#94a3b8', fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', marginTop: '2px' }}>BATANES STATE COLLEGE</div>
          </div>
        </div>

        {/* Network Constellation Graphic */}
        <NetworkVisualizer />

        {/* Copyright Footer */}
        <div className="relative z-10 text-xs font-semibold text-slate-500 tracking-wider">
          <span>© 2026 Batanes State College</span>
        </div>
      </div>


      {/* Right Panel */}
      <div className="right-panel">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>

        {/* Next.js Theme Toggle aligned with top-right position */}
        <div className="absolute top-10 right-10 z-10">
          <ThemeToggle />
        </div>

        <div className="right-panel-inner">
          <div className="login-card">
            <div className="card-header">
              <h2>Sign In</h2>
              <h1>Welcome Back!</h1>
              <p>Sign in to access your dashboard</p>
            </div>

            {/* Error and Success Alerts */}
            {error && (
              <div className="relative flex items-start gap-3 rounded-2xl border border-red-200 dark:border-red-950/40 bg-red-50/50 dark:bg-red-950/20 p-4 mb-5 text-xs text-red-600 dark:text-red-400 animate-in fade-in slide-in-from-top-1 duration-200">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-red-500 mt-0.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span className="pr-4 leading-relaxed font-semibold">{error}</span>
                <button onClick={handleClearParams} className="absolute right-3.5 top-3.5 text-red-400 hover:text-red-700 transition-colors cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {success && (
              <div className="relative flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-950/40 bg-emerald-50/50 dark:bg-emerald-950/20 p-4 mb-5 text-xs text-emerald-600 dark:text-emerald-400 animate-in fade-in slide-in-from-top-1 duration-200">
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 shrink-0 text-emerald-500 mt-0.5">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.06l2.5 2.5a.75.75 0 001.137-.089l4-5.5z" clipRule="evenodd" />
                </svg>
                <span className="pr-4 leading-relaxed font-semibold">{success}</span>
                <button onClick={handleClearParams} className="absolute right-3.5 top-3.5 text-emerald-400 hover:text-emerald-700 transition-colors cursor-pointer">
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4.5 w-4.5">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}

            {/* Forms */}
            <form onSubmit={(e) => handleFormSubmit(e, login)}>
              <div className="form-group">
                <label>Email Address</label>
                <div className="input-wrapper">
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="Email or Username"
                  />
                  <svg className="input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <circle cx="9" cy="10" r="3"></circle>
                    <path d="M15 10h2"></path>
                    <path d="M15 14h2"></path>
                    <path d="M4 18c2.67-1.33 5.33-2 8-2s5.33.67 8 2"></path>
                  </svg>
                </div>
              </div>

              <div className="form-group">
                <label>Password</label>
                <div className="input-wrapper">
                  <input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Enter your password"
                  />
                  {showPassword ? (
                    <EyeOff className="input-icon" onClick={() => setShowPassword(!showPassword)} />
                  ) : (
                    <Eye className="input-icon" onClick={() => setShowPassword(!showPassword)} />
                  )}
                </div>
              </div>

              <a href="#" className="forgot-password" onClick={(e) => { e.preventDefault(); alert("Please contact the Admin Support to reset your password."); }}>
                Forgot Password?
              </a>

              <button type="submit" className="btn-submit" disabled={isPending} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <div style={{ backgroundColor: '#ffffff', borderRadius: '8px', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '10px', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }}>
                  <span style={{ color: '#7e191b' }}>P</span><span style={{ color: '#dcb353' }}>W</span>
                </div>
                {isPending ? "Signing In..." : "Sign In to ProcureWise"}
              </button>
            </form>
          </div>

          {/* Right Footer Layout */}
          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-6 mt-8 border-t border-slate-200 dark:border-slate-800/60 font-semibold uppercase tracking-wider z-10">
            {/* Left element: Display on mobile, hide on desktop since left panel copy takes care of it */}
            <div className="lg:hidden">
              © 2026 Batanes State College
            </div>
            
            {/* Right element: Support and Dropdown */}
            <div className="flex items-center justify-between w-full lg:justify-end gap-5">
              <a 
                onClick={() => alert("Please contact the BSC Procurement Unit Helpdesk or System Admin to request support.")}
                className="hover:text-slate-800 dark:hover:text-white transition-colors duration-200 cursor-pointer"
              >
                Contact Admin Support
              </a>
              
              <div className="relative group cursor-pointer flex items-center gap-1 hover:text-slate-800 dark:hover:text-white transition-colors duration-200">
                <span>English</span>
                <svg className="w-3 h-3 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPageWrapper() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#FAF9F6] dark:bg-[#070b13]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--accent)] border-t-transparent" />
      </div>
    }>
      <LoginPage />
    </Suspense>
  );
}
