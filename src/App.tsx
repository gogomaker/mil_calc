/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { 
  Target, 
  MapPin, 
  Compass, 
  RotateCcw, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  Info, 
  Copy, 
  Check, 
  Sliders, 
  Crosshair, 
  HelpCircle, 
  FileText,
  Palette,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Theme Definitions
type MilitaryTheme = 'forest' | 'desert' | 'steel';

interface ThemePreset {
  id: MilitaryTheme;
  name: string;
  bg: string;
  cardBg: string;
  primary: string;
  borderColors: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  gridColor: string;
  canvasBg: string;
  btnColors: string;
  headerBg: string;
}

const THEMES: Record<MilitaryTheme, ThemePreset> = {
  forest: {
    id: 'forest',
    name: '야전 올리브 (Forest)',
    bg: 'bg-zinc-950',
    cardBg: 'bg-zinc-900/90 border border-emerald-800/40',
    primary: 'emerald',
    borderColors: 'border-emerald-800/30 text-emerald-400 focus:border-emerald-500 focus:ring-emerald-500/20',
    accent: 'emerald',
    textPrimary: 'text-zinc-100',
    textSecondary: 'text-zinc-400',
    gridColor: 'rgba(16, 185, 129, 0.08)',
    canvasBg: '#090d0b',
    btnColors: 'bg-emerald-600 hover:bg-emerald-500 text-zinc-950 font-bold shadow-lg shadow-emerald-900/20 shadow-inner',
    headerBg: 'bg-zinc-900 border-b border-emerald-800/30'
  },
  desert: {
    id: 'desert',
    name: '디지털 사막 (Desert)',
    bg: 'bg-amber-950/40 min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-900/20 via-zinc-950 to-zinc-950',
    cardBg: 'bg-zinc-900/95 border border-amber-700/40',
    primary: 'amber',
    borderColors: 'border-amber-700/30 text-amber-500 focus:border-amber-500 focus:ring-amber-500/20',
    accent: 'amber',
    textPrimary: 'text-amber-50/95',
    textSecondary: 'text-amber-200/60',
    gridColor: 'rgba(245, 158, 11, 0.08)',
    canvasBg: '#0a0805',
    btnColors: 'bg-amber-500 hover:bg-amber-400 text-amber-950 font-bold shadow-lg shadow-amber-900/35 shadow-inner',
    headerBg: 'bg-zinc-900 border-b border-amber-700/30'
  },
  steel: {
    id: 'steel',
    name: '스틸 실버 (Steel)',
    bg: 'bg-slate-950',
    cardBg: 'bg-slate-900/95 border border-blue-600/30',
    primary: 'blue',
    borderColors: 'border-slate-800 text-blue-400 focus:border-blue-500 focus:ring-blue-500/20',
    accent: 'blue',
    textPrimary: 'text-slate-100',
    textSecondary: 'text-slate-400',
    gridColor: 'rgba(59, 130, 246, 0.08)',
    canvasBg: '#070b12',
    btnColors: 'bg-blue-600 hover:bg-blue-500 text-white font-bold shadow-lg shadow-blue-900/30 shadow-inner',
    headerBg: 'bg-slate-900 border-b border-blue-600/20'
  }
};

// Preset scenarios for easier testing
interface Scenario {
  name: string;
  description: string;
  inputs: {
    Tx: number;
    Ty: number;
    Th: number;
    Mx: number;
    My: number;
    Mh: number;
    OTAZ: number;
  };
}

const PRESET_SCENARIOS: Scenario[] = [
  {
    name: '기본 화력 지원',
    description: '가장 빈번하게 설정되는 중거리 산악 작전 지역의 포격 훈련 시나리오',
    inputs: {
      Tx: 4250,
      Ty: 5780,
      Th: 240,
      Mx: 3120,
      My: 4510,
      Mh: 110,
      OTAZ: 1350
    }
  },
  {
    name: '고지대 적 표적 피격',
    description: '표적이 아군 진지보다 상당히 높은 고지대(능선 뒤편)에 배치된 가상 시나리오',
    inputs: {
      Tx: 6800,
      Ty: 7420,
      Th: 480,
      Mx: 5500,
      My: 5900,
      Mh: 150,
      OTAZ: 4200
    }
  },
  {
    name: '근거리 협곡 타격',
    description: '고도가 매우 낮고 골짜기 아래에 위치한 접근 경로 차단 화력 지원 시나리오',
    inputs: {
      Tx: 2150,
      Ty: 3220,
      Th: 80,
      Mx: 2900,
      My: 4100,
      Mh: 220,
      OTAZ: 2500
    }
  }
];

export default function App() {
  // Theme State
  const [themeId, setThemeId] = useState<MilitaryTheme>('forest');
  const currentTheme = THEMES[themeId];

  // Inputs state - initialized with first preset Scenario
  const [Tx, setTx] = useState<number | ''>(PRESET_SCENARIOS[0].inputs.Tx);
  const [Ty, setTy] = useState<number | ''>(PRESET_SCENARIOS[0].inputs.Ty);
  const [Th, setTh] = useState<number | ''>(PRESET_SCENARIOS[0].inputs.Th);

  const [Mx, setMx] = useState<number | ''>(PRESET_SCENARIOS[0].inputs.Mx);
  const [My, setMy] = useState<number | ''>(PRESET_SCENARIOS[0].inputs.My);
  const [Mh, setMh] = useState<number | ''>(PRESET_SCENARIOS[0].inputs.Mh);

  const [OTAZ, setO_TAZ] = useState<number | ''>(PRESET_SCENARIOS[0].inputs.OTAZ);

  // Scroll target ref for results focus
  const resultsRef = useRef<HTMLDivElement>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);

  // Interactive or UI helpers
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [calculationTrigger, setCalculationTrigger] = useState(1); // used to flash animation on click

  // Validations & math values computed in real-time
  const isInputsValid = 
    Tx !== '' && Ty !== '' && Th !== '' &&
    Mx !== '' && My !== '' && Mh !== '' &&
    OTAZ !== '';

  // Calculation variables (floating precision)
  const dx = isInputsValid ? (Number(Tx) - Number(Mx)) : 0;
  const dy = isInputsValid ? (Number(Ty) - Number(My)) : 0;
  
  // 도상거리 = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) * 10
  const mapDistance = isInputsValid ? Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) * 10 : 0;
  
  // 보조사거리 = (T_h - M_h) / 2
  const auxiliaryRange = isInputsValid ? (Number(Th) - Number(Mh)) / 2 : 0;
  
  // 사거리 = 도상거리 + 보조사거리
  const totalRange = mapDistance + auxiliaryRange;

  // 사격방위각(mil) 계산 알고리즘:
  // Math.atan2(dx, dy) 사용, mil_rad = atan2 * (3200 / PI), 음수일시 + 6400
  let firingAzimuthMil = 0;
  let firingAzimuthDeg = 0;
  
  if (isInputsValid) {
    const angleRadian = Math.atan2(dx, dy); // Y-axis starting, clockwise
    let mil = angleRadian * (3200 / Math.PI);
    if (mil < 0) {
      mil += 6400;
    }
    firingAzimuthMil = mil;
    // Deg representation for extra user convenience
    firingAzimuthDeg = (mil * 360) / 6400;
  }

  // Final rounded values (to display as integers as requested)
  const roundedMapDistance = Math.round(mapDistance);
  const roundedAuxiliaryRange = Math.round(auxiliaryRange);
  const roundedTotalRange = Math.round(totalRange);
  const roundedAzimuthMil = Math.round(firingAzimuthMil);

  // Load Scenario helper
  const handleLoadScenario = (scenario: Scenario) => {
    setTx(scenario.inputs.Tx);
    setTy(scenario.inputs.Ty);
    setTh(scenario.inputs.Th);
    setMx(scenario.inputs.Mx);
    setMy(scenario.inputs.My);
    setMh(scenario.inputs.Mh);
    setO_TAZ(scenario.inputs.OTAZ);
    setCalculationTrigger(prev => prev + 1);
  };

  // Clear inputs helper
  const handleClearInputs = () => {
    setTx('');
    setTy('');
    setTh('');
    setMx('');
    setMy('');
    setMh('');
    setO_TAZ('');
  };

  // Click calculate - focus results
  const handleCalculate = () => {
    setCalculationTrigger(prev => prev + 1);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Copy fire values to clipboard
  const handleCopyToClipboard = () => {
    if (!isInputsValid) return;
    const textToCopy = `[방안좌표법 사격 제원 결과]
----------------------------
■ 표적 좌표: X(${Tx}), Y(${Ty}), 고도(${Th}m)
■ 진지 좌표: X(${Mx}), Y(${My}), 고도(${Mh}m)
■ 관측소 방위각(OTAZ): ${OTAZ} mil
----------------------------
▶ 도상거리: ${roundedMapDistance.toLocaleString()} m
▶ 보조사거리: ${roundedAuxiliaryRange > 0 ? '+' : ''}${roundedAuxiliaryRange.toLocaleString()} m (고도차: ${Number(Th) - Number(Mh)}m)
▶ 최종 사거리: ${roundedTotalRange.toLocaleString()} m
▶ 사격 방위각: ${roundedAzimuthMil} mil (약 ${firingAzimuthDeg.toFixed(1)}°)`;

    navigator.clipboard.writeText(textToCopy)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      })
      .catch(err => {
        console.error('Failed to copy text: ', err);
      });
  };

  // Draw military layout on canvas
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset canvas contents
    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Dynamic scale and offsets
    // Handle standard view range if values are valid, else standard dummy layout
    let pTx = Number(Tx) || 4500;
    let pTy = Number(Ty) || 5800;
    let pMx = Number(Mx) || 3100;
    let pMy = Number(My) || 4500;

    // Ensure they are not on the exact same spot to avoid division by zero
    if (pTx === pMx && pTy === pMy) {
      pTx += 100;
      pTy += 100;
    }

    const minX = Math.min(pTx, pMx);
    const maxX = Math.max(pTx, pMx);
    const minY = Math.min(pTy, pMy);
    const maxY = Math.max(pTy, pMy);

    const diffX = maxX - minX;
    const diffY = maxY - minY;
    const maxDiff = Math.max(diffX, diffY, 500); // minimum scale envelope of 500m

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scale = (Math.min(width, height) * 0.65) / maxDiff;

    // Map math coords (Cartesian where Y goes up) to canvas screen coords (Y goes down)
    const mapToScreen = (x: number, y: number) => {
      const sx = width / 2 + (x - centerX) * scale;
      const sy = height / 2 - (y - centerY) * scale;
      return { x: sx, y: sy };
    };

    const screenM = mapToScreen(pMx, pMy);
    const screenT = mapToScreen(pTx, pTy);

    // 1. Draw grid lines inside canvas based on the primary theme colors
    ctx.strokeStyle = themeId === 'forest' ? 'rgba(16, 185, 129, 0.08)' : themeId === 'desert' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(59, 130, 246, 0.08)';
    ctx.lineWidth = 1;
    const gridSpacing = 200; // in coordinates meters
    const gridMinX = Math.floor((centerX - width / 2 / scale) / gridSpacing) * gridSpacing;
    const gridMaxX = Math.ceil((centerX + width / 2 / scale) / gridSpacing) * gridSpacing;
    const gridMinY = Math.floor((centerY - height / 2 / scale) / gridSpacing) * gridSpacing;
    const gridMaxY = Math.ceil((centerY + height / 2 / scale) / gridSpacing) * gridSpacing;

    for (let gx = gridMinX; gx <= gridMaxX; gx += gridSpacing) {
      const p1 = mapToScreen(gx, gridMinY);
      const p2 = mapToScreen(gx, gridMaxY);
      ctx.beginPath();
      ctx.moveTo(p1.x, 0);
      ctx.lineTo(p1.x, height);
      ctx.stroke();

      // Grid coordinate labels text
      ctx.fillStyle = themeId === 'forest' ? 'rgba(16, 185, 129, 0.3)' : themeId === 'desert' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)';
      ctx.font = '8px monospace';
      ctx.fillText(`${gx}`, p1.x + 2, height - 4);
    }

    for (let gy = gridMinY; gy <= gridMaxY; gy += gridSpacing) {
      const p1 = mapToScreen(gridMinX, gy);
      const p2 = mapToScreen(gridMaxX, gy);
      ctx.beginPath();
      ctx.moveTo(0, p1.y);
      ctx.lineTo(width, p1.y);
      ctx.stroke();

      ctx.fillStyle = themeId === 'forest' ? 'rgba(16, 185, 129, 0.3)' : themeId === 'desert' ? 'rgba(245, 158, 11, 0.3)' : 'rgba(59, 130, 246, 0.3)';
      ctx.font = '8px monospace';
      ctx.fillText(`${gy}`, 4, p1.y - 2);
    }

    // 2. Draw compass dial reticle centered around Mortar (M)
    const dialRadius = 38;
    ctx.strokeStyle = themeId === 'forest' ? 'rgba(16, 185, 129, 0.25)' : themeId === 'desert' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(59, 130, 246, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(screenM.x, screenM.y, dialRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Draw compass crosshairs from Mortar
    ctx.setLineDash([1, 4]);
    ctx.beginPath();
    ctx.moveTo(screenM.x, screenM.y - dialRadius - 10);
    ctx.lineTo(screenM.x, screenM.y + dialRadius + 10);
    ctx.moveTo(screenM.x - dialRadius - 10, screenM.y);
    ctx.lineTo(screenM.x + dialRadius + 10, screenM.y);
    ctx.stroke();
    ctx.setLineDash([]); // clear dash

    // Add Compass Cardinal directions text (0 / 16 / 32 / 48 mils)
    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = themeId === 'forest' ? '#10b981' : themeId === 'desert' ? '#f59e0b' : '#3b82f6';
    ctx.textAlign = 'center';
    ctx.fillText('0', screenM.x, screenM.y - dialRadius - 4); // North
    ctx.fillText('32', screenM.x, screenM.y + dialRadius + 10); // South
    ctx.fillText('16', screenM.x + dialRadius + 10, screenM.y + 3); // East
    ctx.fillText('48', screenM.x - dialRadius - 10, screenM.y + 3); // West

    // 3. Draw line of fire (M to T)
    ctx.strokeStyle = themeId === 'forest' ? '#10b981' : themeId === 'desert' ? '#f59e0b' : '#3b82f6';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(screenM.x, screenM.y);
    ctx.lineTo(screenT.x, screenT.y);
    ctx.stroke();

    // Fire vector arrow tip at Target
    const angle = Math.atan2(screenT.y - screenM.y, screenT.x - screenM.x);
    ctx.fillStyle = themeId === 'forest' ? '#10b981' : themeId === 'desert' ? '#f59e0b' : '#3b82f6';
    ctx.beginPath();
    ctx.moveTo(screenT.x, screenT.y);
    ctx.lineTo(screenT.x - 12 * Math.cos(angle - Math.PI / 6), screenT.y - 12 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(screenT.x - 12 * Math.cos(angle + Math.PI / 6), screenT.y - 12 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // 4. Draw OTAZ Observer Line from Target (Observer's Line of Sight)
    // OTAZ is specified in mils. Let's convert OTAZ value back to angle on canvas
    if (OTAZ !== '') {
      const oTazMil = Number(OTAZ);
      // mil to radian conversion: 1 mil = 2 * Math.PI / 6400
      // We want Y-axis starts at North (clockwise) to match our cartesian output.
      // Math.cos / Math.sin start from X-axis. So we subtract PI/2
      const oTazRad = (oTazMil * 2 * Math.PI) / 6400 - Math.PI / 2;
      const obsLength = 35;
      const obsX = screenT.x + obsLength * Math.cos(oTazRad);
      const obsY = screenT.y + obsLength * Math.sin(oTazRad);

      // Draw dashed reference observer line
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#ef4444'; // Red color for observer to distinguish from fire weapon line
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenT.x, screenT.y);
      ctx.lineTo(obsX, obsY);
      ctx.stroke();
      ctx.setLineDash([]); // clear

      // Draw Observer identifier circle & text
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(obsX, obsY, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.font = '8px sans-serif';
      ctx.fillText(`관측소(OTAZ: ${oTazMil})`, obsX, obsY - 5);
    }

    // 5. Draw and style Mortar M point symbol
    ctx.fillStyle = themeId === 'steel' ? '#1e293b' : '#18181b';
    ctx.strokeStyle = themeId === 'forest' ? '#10b981' : themeId === 'desert' ? '#f59e0b' : '#3b82f6';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenM.x, screenM.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Inner core to symbolize weapon
    ctx.fillStyle = themeId === 'forest' ? '#10b981' : themeId === 'desert' ? '#f59e0b' : '#3b82f6';
    ctx.beginPath();
    ctx.arc(screenM.x, screenM.y, 3, 0, Math.PI * 2);
    ctx.fill();

    // Symbol labels
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`진지 (M: ${pMx}, ${pMy})`, screenM.x + 12, screenM.y + 4);

    // 6. Draw and style Target T symbol (crosshair)
    ctx.strokeStyle = '#ef4444'; // Red crosshair of target
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(screenT.x, screenT.y, 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(screenT.x - 11, screenT.y);
    ctx.lineTo(screenT.x + 11, screenT.y);
    ctx.moveTo(screenT.x, screenT.y - 11);
    ctx.lineTo(screenT.x, screenT.y + 11);
    ctx.stroke();

    ctx.fillStyle = '#ef4444';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`표적 (T: ${pTx}, ${pTy})`, screenT.x + 12, screenT.y - 2);

    // Write numerical scale info on the bottom corner of canvas
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`거리 스케일: 100m ≒ ${Math.round(100 * scale)}px`, width - 8, height - 8);

  }, [Tx, Ty, Mx, My, OTAZ, themeId]);


  return (
    <div id="grid-calc-root" className={`min-h-screen ${currentTheme.bg} transition-colors duration-500 font-sans pb-16 text-zinc-100 flex flex-col antialiased`}>
      
      {/* Upper Sticky Tactical Header */}
      <header id="app-header" className={`sticky top-0 z-50 ${currentTheme.headerBg} backdrop-blur-md px-4 py-3 shadow-md transition-colors duration-500`}>
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-lg bg-${currentTheme.primary}-500/20 text-${currentTheme.primary}-400 border border-${currentTheme.primary}-500/30`}>
              <Crosshair className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5 font-display">
                방안좌표법 계산기 <span className="text-[10px] px-1.5 py-0.2 rounded bg-zinc-800 text-zinc-400 border border-zinc-700/80 font-mono">MILSPEC v1.5</span>
              </h1>
              <p className="text-[10px] text-zinc-400">포병·박격포 사격제원 모바일 계산 체계</p>
            </div>
          </div>

          {/* Theme Selector Popover / Button */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setThemeId('forest')}
              className={`p-1 rounded-md text-xs transition-all ${themeId === 'forest' ? 'bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Forest Theme"
            >
              야전
            </button>
            <button
              onClick={() => setThemeId('desert')}
              className={`p-1 rounded-md text-xs transition-all ${themeId === 'desert' ? 'bg-amber-500/20 text-amber-500 ring-1 ring-amber-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Desert Theme"
            >
              사막
            </button>
            <button
              onClick={() => setThemeId('steel')}
              className={`p-1 rounded-md text-xs transition-all ${themeId === 'steel' ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/30' : 'text-zinc-500 hover:text-zinc-300'}`}
              title="Steel Theme"
            >
              도시
            </button>
          </div>
        </div>
      </header>

      {/* Main Body content constrained to premium mobile viewport layout */}
      <main className="flex-grow max-w-md w-full mx-auto px-4 mt-4 flex flex-col gap-5">
        
        {/* Preset Tactical Scenarios Selector */}
        <div className={`${currentTheme.cardBg} rounded-xl p-3 shadow-l text-zinc-300 flex flex-col gap-2 transition-colors duration-500`}>
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-400">
            <Sliders className="w-3.5 h-3.5 text-zinc-400" />
            <span>신속 테스트용 요도 시나리오</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5">
            {PRESET_SCENARIOS.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleLoadScenario(s)}
                className="py-1 px-2 rounded-lg bg-zinc-800/80 hover:bg-zinc-800 border border-zinc-700/60 text-[11px] text-left transition-all active:scale-95 group"
              >
                <div className="font-bold text-white transition-colors group-hover:text-amber-400 truncate text-[10.5px]">
                  {s.name}
                </div>
                <div className="text-[9px] text-zinc-500 truncate mt-0.5">T: {s.inputs.Tx}/{s.inputs.Ty}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Inputs section (입력부) */}
        <section id="input-section" className={`${currentTheme.cardBg} rounded-2xl p-4 shadow-xl transition-all duration-500 relative`}>
          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2.5">
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span className={`w-1.5 h-3 bg-${currentTheme.primary}-500 rounded-full inline-block`}></span>
              사격 제원 입력부 (Inputs)
            </h2>
            <button
              type="button"
              onClick={handleClearInputs}
              className="text-zinc-400 hover:text-rose-400 text-xs flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-zinc-800/50 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              초기화
            </button>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleCalculate(); }} className="space-y-4">
            
            {/* TARGET COORDINATES CARD */}
            <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-3.5">
              <div className="flex items-center gap-1.5 text-rose-400 text-xs font-bold">
                <Target className="w-4 h-4 text-rose-500" />
                <span>표적 제원 (Target Position)</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="tx-input" className="block text-[11px] font-medium text-zinc-400 mb-1">X 좌표 (T_x)</label>
                  <div className="relative">
                    <input
                      id="tx-input"
                      type="number"
                      placeholder="예: 4250"
                      value={Tx}
                      onChange={(e) => setTx(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-2 pr-1.5 py-1.5 bg-zinc-900 border border-zinc-700/60 rounded-lg text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="ty-input" className="block text-[11px] font-medium text-zinc-400 mb-1">Y 좌표 (T_y)</label>
                  <div className="relative">
                    <input
                      id="ty-input"
                      type="number"
                      placeholder="예: 5780"
                      value={Ty}
                      onChange={(e) => setTy(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-2 pr-1.5 py-1.5 bg-zinc-900 border border-zinc-700/60 rounded-lg text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="th-input" className="block text-[11px] font-medium text-zinc-400 mb-1">고도 (T_h, m)</label>
                  <div className="relative">
                    <input
                      id="th-input"
                      type="number"
                      placeholder="예: 240"
                      value={Th}
                      onChange={(e) => setTh(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-2 pr-1.5 py-1.5 bg-zinc-900 border border-zinc-700/60 rounded-lg text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-rose-500 focus:ring-1 focus:ring-rose-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* MORTAR POSITION COORDINATES CARD */}
            <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl space-y-3.5">
              <div className="flex items-center gap-1.5 text-blue-400 text-xs font-bold">
                <MapPin className="w-4 h-4 text-blue-500" />
                <span>포진지 제원 (Mortar Position)</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label htmlFor="mx-input" className="block text-[11px] font-medium text-zinc-400 mb-1">X 좌표 (M_x)</label>
                  <div className="relative">
                    <input
                      id="mx-input"
                      type="number"
                      placeholder="예: 3120"
                      value={Mx}
                      onChange={(e) => setMx(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-2 pr-1.5 py-1.5 bg-zinc-900 border border-zinc-700/60 rounded-lg text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="my-input" className="block text-[11px] font-medium text-zinc-400 mb-1">Y 좌표 (M_y)</label>
                  <div className="relative">
                    <input
                      id="my-input"
                      type="number"
                      placeholder="예: 4510"
                      value={My}
                      onChange={(e) => setMy(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-2 pr-1.5 py-1.5 bg-zinc-900 border border-zinc-700/60 rounded-lg text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mh-input" className="block text-[11px] font-medium text-zinc-400 mb-1">고도 (M_h, m)</label>
                  <div className="relative">
                    <input
                      id="mh-input"
                      type="number"
                      placeholder="예: 110"
                      value={Mh}
                      onChange={(e) => setMh(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full pl-2 pr-1.5 py-1.5 bg-zinc-900 border border-zinc-700/60 rounded-lg text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* OBSERVATION POINT AZIMUTH CARD */}
            <div className="p-3 bg-zinc-950/70 border border-zinc-800/80 rounded-xl">
              <div className="flex items-center justify-between mb-2">
                <span className="flex items-center gap-1.5 text-amber-500 text-xs font-bold">
                  <Compass className="w-4 h-4 text-amber-500" />
                  <span>관측소 방위각 (OTAZ)</span>
                </span>
                <span className="text-[9px] text-zinc-500">포격 수정용 관측 기준 방위각</span>
              </div>
              
              <div className="relative">
                <input
                  id="otaz-input"
                  type="number"
                  placeholder="예: 1350 (단위: mil)"
                  value={OTAZ}
                  onChange={(e) => setO_TAZ(e.target.value === '' ? '' : Number(e.target.value))}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700/60 rounded-lg text-sm font-mono text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20"
                />
                <span className="absolute right-3 top-2.5 text-xs text-zinc-500 font-bold">mil</span>
              </div>
              <p className="text-[10px] text-zinc-500 mt-1.5">※ 군사 원형 밀눈(mil) 규격(360° = 6400 mil) 단위로 입력해 주세요.</p>
            </div>

            {/* ERROR WARNING IF ANY INPUT MISSING */}
            {!isInputsValid && (
              <div className="p-2.5 rounded-lg bg-rose-950/40 border border-rose-900/40 text-rose-400 text-xs flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0" />
                <span>계산을 완료하려면 7개의 모든 수치를 올바르게 입력해 주세요.</span>
              </div>
            )}

            {/* Action Buttons Frame */}
            <div className="pt-2">
              <motion.button
                id="calculate-button"
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={!isInputsValid}
                className={`w-full py-3.5 rounded-xl text-center uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isInputsValid 
                    ? currentTheme.btnColors
                    : 'bg-zinc-800 text-zinc-600 border border-zinc-700/40 cursor-not-allowed'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>제원 계산하기 (Calculate Fire Mission)</span>
              </motion.button>
            </div>
          </form>
        </section>

        {/* Dynamic Canvas Area (실시간 군사 투영 요도망) */}
        <section id="reticle-map" className={`${currentTheme.cardBg} rounded-2xl p-4 shadow-xl transition-all duration-500`}>
          <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
            <h2 className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
              <span className="w-1.5 h-3 bg-red-500 rounded-full inline-block animate-pulse"></span>
              실시간 전술 사격 요도 (Tactical Map)
            </h2>
            <span className="text-[10px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.2 rounded font-mono">GRID SCALE 10x</span>
          </div>

          <div 
            style={{ backgroundColor: currentTheme.canvasBg }} 
            className="w-full overflow-hidden rounded-xl border border-zinc-800 flex items-center justify-center aspect-square relative"
          >
            <canvas 
              ref={mapCanvasRef} 
              width={350} 
              height={350} 
              className="w-full h-full p-2 block"
            />
            {/* Visual Compass dial background overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-0.5 pointer-events-none drop-shadow-md">
              <span className="text-[9px] text-zinc-500 font-mono">AXIS GRAPH:</span>
              <span className="text-[10px] text-emerald-400 font-mono">▲ Y (북/N: 0)</span>
              <span className="text-[10px] text-emerald-400 font-mono">▶ X (동/E: 1600)</span>
            </div>
          </div>
          <p className="text-[10px] text-zinc-500 text-center mt-2.5">
            ※ 좌표축은 방안지도 도상 수치에 준하며, 북쪽행 방향이 사격방위각 0 mil의 기산점입니다. (OTAZ는 빨간 점선)
          </p>
        </section>

        {/* Output Section (결과부) */}
        <section 
          ref={resultsRef}
          id="output-section" 
          className={`${currentTheme.cardBg} rounded-2xl p-5 shadow-2xl transition-all duration-500 relative overflow-hidden`}
        >
          {/* Subtle decoration background accent */}
          <div className={`absolute -right-16 -bottom-16 w-36 h-36 rounded-full bg-${currentTheme.primary}-500/5 blur-3xl pointer-events-none`} />

          <div className="flex items-center justify-between mb-4 border-b border-zinc-800 pb-2.5 z-10">
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span className={`w-1.5 h-3 bg-${currentTheme.primary}-500 rounded-full inline-block`}></span>
              사격 제원 계산 결과 (Fire Mission Results)
            </h2>
            {isInputsValid && (
              <button
                type="button"
                onClick={handleCopyToClipboard}
                className={`text-xs px-2 py-1 rounded flex items-center gap-1.5 transition-all ${
                  copied 
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40' 
                    : 'bg-zinc-800/80 text-zinc-300 hover:text-white border border-zinc-700/60'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '복사 완료' : '제원 복사'}</span>
              </button>
            )}
          </div>

          {!isInputsValid ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-12 h-12 rounded-full bg-zinc-800/60 text-zinc-500 flex items-center justify-center mx-auto border border-zinc-700/30">
                <Crosshair className="w-6 h-6" />
              </div>
              <div>
                <p className="text-zinc-400 text-sm font-medium">계산된 결과가 없습니다</p>
                <p className="text-zinc-600 text-xs mt-1">입력 폼에 숫자를 입력하신 뒤 &apos;제원 계산하기&apos;를 터치해 주세요.</p>
              </div>
            </div>
          ) : (
            <div key={calculationTrigger} className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-3">
                
                {/* 1. 도상거리 카드 */}
                <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-3 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">도상거리 (Map Grid)</span>
                    <strong className="text-2xl font-black font-mono tracking-tight text-white block">
                      {roundedMapDistance.toLocaleString()} <span className="text-xs text-zinc-400">m</span>
                    </strong>
                  </div>
                  <div className="mt-2 border-t border-zinc-900 pt-1 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
                    <span>수평 계산값:</span>
                    <span className="font-mono text-zinc-400">{(mapDistance).toFixed(1)}m</span>
                  </div>
                </div>

                {/* 2. 보조사거리 카드 */}
                <div className="bg-zinc-950/70 border border-zinc-800/90 rounded-xl p-3 text-center flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider block mb-1">보조사거리 (Correction)</span>
                    <strong className={`text-2xl font-black font-mono tracking-tight block ${roundedAuxiliaryRange > 0 ? 'text-amber-500' : roundedAuxiliaryRange < 0 ? 'text-rose-400' : 'text-zinc-350'}`}>
                      {roundedAuxiliaryRange > 0 ? '+' : ''}{roundedAuxiliaryRange.toLocaleString()} <span className="text-xs text-zinc-400">m</span>
                    </strong>
                  </div>
                  <div className="mt-2 border-t border-zinc-900 pt-1 flex items-center justify-center gap-1 text-[10px] text-zinc-500">
                    <span>고도 차이:</span>
                    <span className="font-mono text-zinc-400">{Number(Th) - Number(Mh)}m</span>
                  </div>
                </div>

              </div>

              {/* 3. 최종 결정 사거리 카드 (Full-Span) */}
              <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-xl flex items-center justify-between relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${currentTheme.primary}-500`} />
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                    <TrendingUp className={`w-3.5 h-3.5 text-${currentTheme.primary}-400`} />
                    <span>최종 사거리 (Final Range)</span>
                  </div>
                  <strong className={`text-3xl font-black font-mono tracking-tight text-${currentTheme.primary}-400`}>
                    {roundedTotalRange.toLocaleString()} <span className="text-sm font-normal text-zinc-400">m</span>
                  </strong>
                </div>
                <div className="text-right">
                  <span className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-400 px-2 py-1 rounded font-mono">
                    도상 + 보조
                  </span>
                  <span className="block text-[9px] text-zinc-650 font-mono mt-1">
                    ({(mapDistance + auxiliaryRange).toFixed(1)}m)
                  </span>
                </div>
              </div>

              {/* 4. 최종 사격방위각 카드 (Full-Span) */}
              <div className="p-4 bg-zinc-950/90 border border-zinc-800 rounded-xl flex items-center justify-between relative overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-rose-500" />
                <div>
                  <div className="flex items-center gap-1 text-[11px] text-zinc-500 font-bold uppercase tracking-wider mb-1">
                    <Compass className="w-3.5 h-3.5 text-rose-400" />
                    <span>최종 사격 방위각 (Firing Azimuth)</span>
                  </div>
                  <strong className="text-3xl font-black font-mono tracking-tight text-white">
                    {roundedAzimuthMil} <span className="text-sm font-normal text-zinc-400">mil</span>
                  </strong>
                </div>
                <div className="text-right flex flex-col items-end">
                  <div className="px-2 py-0.5 rounded text-[11px] bg-orange-950/50 text-orange-400 font-bold border border-orange-900/40">
                    약 {firingAzimuthDeg.toFixed(1)}°
                  </div>
                  <div className="text-[9px] text-zinc-500 font-mono mt-1">
                    {themeId === 'forest' ? 'N' : 'Y'}축 기준 우회전각
                  </div>
                </div>
              </div>

              {/* Expandable detailed mathematical explanation formulas */}
              <div className="border border-zinc-800/80 rounded-xl overflow-hidden mt-3 bg-zinc-950/40">
                <button
                  type="button"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs text-zinc-400 hover:text-white transition-colors"
                >
                  <span className="flex items-center gap-1.5 font-semibold">
                    <FileText className="w-3.5 h-3.5 text-zinc-400" />
                    상세 수학적 연산 과정 보기
                  </span>
                  <span className="text-zinc-500">
                    {showExplanation ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>

                <AnimatePresence>
                  {showExplanation && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-zinc-800 text-[11px] text-zinc-400 p-3.5 space-y-3 font-mono leading-relaxed"
                    >
                      <div>
                        <div className="font-semibold text-zinc-200 mb-1 border-b border-zinc-900 pb-0.5">1단계: 좌표 편차 계산 (dx, dy)</div>
                        <p>dx = T_x - M_x = {Tx} - {Mx} = <span className="text-zinc-200">{dx}</span></p>
                        <p>dy = T_y - M_y = {Ty} - {My} = <span className="text-zinc-200">{dy}</span></p>
                      </div>

                      <div>
                        <div className="font-semibold text-zinc-200 mb-1 border-b border-zinc-900 pb-0.5">2단계: 수평 도상거리 계산</div>
                        <p className="text-[10px] text-zinc-500">공식: sqrt(dx² + dy²) × 10</p>
                        <p>sqrt({dx}² + {dy}²) × 10</p>
                        <p>= sqrt({dx*dx} + {dy*dy}) × 10</p>
                        <p>= sqrt({dx*dx + dy*dy}) × 10</p>
                        <p>= {Math.sqrt(dx*dx + dy*dy).toFixed(4)} × 10</p>
                        <p>= <span className="text-zinc-200">{mapDistance.toFixed(2)} m</span> (반올림: {roundedMapDistance} m)</p>
                      </div>

                      <div>
                        <div className="font-semibold text-zinc-200 mb-1 border-b border-zinc-900 pb-0.5">3단계: 보조사거리 계산 (고도차 보정)</div>
                        <p className="text-[10px] text-zinc-500">공식: (T_h - M_h) / 2</p>
                        <p>= ({Th} - {Mh}) / 2 = {Number(Th) - Number(Mh)} / 2</p>
                        <p>= <span className="text-zinc-200">{auxiliaryRange.toFixed(1)} m</span> (반올림: {roundedAuxiliaryRange} m)</p>
                      </div>

                      <div>
                        <div className="font-semibold text-zinc-200 mb-1 border-b border-zinc-900 pb-0.5">4단계: 최종 사거리 계산</div>
                        <p className="text-[10px] text-zinc-500">공식: 도상거리 + 보조사거리</p>
                        <p>= {mapDistance.toFixed(2)} + ({auxiliaryRange.toFixed(1)}) = {totalRange.toFixed(2)} m</p>
                        <p>= <span className="text-zinc-200 font-bold">{roundedTotalRange} m</span></p>
                      </div>

                      <div>
                        <div className="font-semibold text-zinc-200 mb-1 border-b border-zinc-900 pb-0.5">5단계: 군사용 사격방위각 계산</div>
                        <p className="text-[10px] text-zinc-500">공식: atan2(dx, dy) × (3200 / Math.PI)</p>
                        <p>라디안 각도 = atan2({dx}, {dy}) = {Math.atan2(dx, dy).toFixed(4)} rad</p>
                        <p>mil 환산값 = {Math.atan2(dx, dy).toFixed(4)} × {(3200 / Math.PI).toFixed(4)}</p>
                        <p>= { (Math.atan2(dx, dy) * (3200 / Math.PI)).toFixed(2) } mil</p>
                        { (Math.atan2(dx, dy) * (3200 / Math.PI)) < 0 ? (
                          <>
                            <p className="text-rose-400">※ 계산값이 음수이므로 +6400 mil 보정을 수행합니다.</p>
                            <p>= { (Math.atan2(dx, dy) * (3200 / Math.PI)).toFixed(2) } + 6400 = {firingAzimuthMil.toFixed(2)} mil</p>
                          </>
                        ) : null}
                        <p>= 최종 정수 변환: <span className="text-zinc-200 font-bold">{roundedAzimuthMil} mil</span> (약 {firingAzimuthDeg.toFixed(1)}°)</p>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}
        </section>

        {/* Informative manual block (학습 / 참고자료 안내) */}
        <section id="guide-section" className={`${currentTheme.cardBg} rounded-2xl overflow-hidden shadow-lg transition-colors duration-500`}>
          <button
            type="button"
            onClick={() => setShowGuide(!showGuide)}
            className="w-full text-left p-4 flex items-center justify-between font-bold text-white text-sm"
          >
            <span className="flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-emerald-400" />
              민간인 및 초임간부용 방안좌표법 실전 개념 요약
            </span>
            <span>
              {showGuide ? <ChevronUp className="w-5 h-5 text-zinc-400" /> : <ChevronDown className="w-5 h-5 text-zinc-400" />}
            </span>
          </button>

          <AnimatePresence>
            {showGuide && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="px-4 pb-4 border-t border-zinc-800 text-xs text-zinc-400 space-y-3 list-style-none font-sans leading-relaxed"
              >
                <div className="bg-zinc-950/50 p-3 rounded-lg border border-zinc-900 space-y-1 mt-3">
                  <h4 className="font-bold text-zinc-200 flex items-center gap-1">
                    <span className="w-1 h-3 bg-red-500 rounded-full inline-block"></span>
                    방안좌표법 (Grid Coordinate Method) 이란?
                  </h4>
                  <p className="text-[11px] text-zinc-400">
                    전술 지도 상의 가상의 방안 눈금 그리드(100m ~ 1km 간격) 좌표 차이를 활용해, 
                    관측소 또는 포진지의 절대 위치 좌표에서 표적까지의 수평 사거리와 진북/좌표북 대비 사격방위각(mil)을 신속하게 획득하는 야전 사격 전술 산출법입니다.
                  </p>
                </div>

                <div className="space-y-2 mt-3 text-[11.5px]">
                  <div>
                    <strong className="text-zinc-300 block">■ 도상거리 곱하기 10 배율의 이유</strong>
                    <p className="text-zinc-405">
                      수학적으로 x축, y축 좌표 단위가 전술 지도에서의 킬로미터(km) 또는 정방 좌표 단위의 변동(비율 10m 단위 등)일 때, 
                      도상에서의 가상 유클리드 스케일을 미터 단위 즉 실제 야전 사거리 수치로 확대 전환하기 위해 환산계수 <code className="text-amber-400 font-mono">* 10</code> 배율을 승산합니다.
                    </p>
                  </div>

                  <div>
                    <strong className="text-zinc-300 block">■ 보조사거리 고도 보정 (TH - MH) / 2</strong>
                    <p className="text-zinc-405">
                      표적지와 박격포 진지 사이의 고도 차이가 존재하면, 탄환의 비행 포물선 및 도달 시간이 연장되거나 단축됩니다. 
                      포병 관습적 보정공식에 기초하여 표적고도와 진지고도 편차의 절반(<code className="text-amber-400 font-mono">1/2</code>)에 해당하는 거리 보정값을 도상거리에 가감함으로써 비행 보정을 완료합니다.
                    </p>
                  </div>

                  <div>
                    <strong className="text-zinc-300 block">■ 밀(mil) 각도 지표</strong>
                    <p className="text-zinc-405">
                      군사용 각도 체계는 일반 360분법 각도 표시 대신 원 둘레를 6400등분한 <code className="text-rose-400 font-semibold">밀(mil) 단위</code>를 사용합니다. 
                      1밀은 약 1km 거리에서 1m 폭을 가지는 실질적 시야각으로, 정밀 포화 지향 조정에 최적화되어 있습니다.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
        
      </main>

      {/* Military safety watermark notice strictly static at the bottom */}
      <footer className="mt-8 text-center text-[10px] text-zinc-650 px-4 select-none">
        <p>전술용 모의 가상 연산기로써 실제 화포 조작 및 사격 훈련 시에는 국방 표준 장비 제원을 최우선 확인해야 합니다.</p>
        <p className="mt-1 font-mono text-[9px] text-zinc-700">COORD GRID CALCULATOR · ALLIED TACTICAL NAVIGATOR</p>
      </footer>

    </div>
  );
}
