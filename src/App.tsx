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
  Zap,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/// Preset Scenarios adapted for each of the three methods
interface GridScenario {
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

interface PolarScenario {
  name: string;
  description: string;
  inputs: {
    Ox: number;
    Oy: number;
    Oh: number;
    Mx: number;
    My: number;
    Mh: number;
    polarDist: number;
    polarAzimuth: number;
    polarVert: number;
  };
}

interface RpScenario {
  name: string;
  description: string;
  inputs: {
    Rx: number;
    Ry: number;
    Rh: number;
    Mx: number;
    My: number;
    Mh: number;
    rpShiftLat: number;
    rpShiftDist: number;
    rpShiftVert: number;
    rpOtaz: number;
  };
}

const GRID_PRESETS: GridScenario[] = [
  {
    name: '기본 화력 지원',
    description: '가장 빈번하게 설정되는 중거리 산악 작전 지역의 포격 훈련 시나리오 (사거리 1765m)',
    inputs: { Tx: 4250, Ty: 5780, Th: 240, Mx: 3120, My: 4510, Mh: 110, OTAZ: 1350 }
  },
  {
    name: '고지대 능선 사격',
    description: '표적이 아군 진지보다 상당히 높은 고지대(능선 뒤편)에 배치된 가상 시나리오 (사거리 2165m)',
    inputs: { Tx: 6800, Ty: 7420, Th: 480, Mx: 5500, My: 5900, Mh: 150, OTAZ: 4200 }
  },
  {
    name: '근거리 협곡 격퇴',
    description: '고도가 매우 낮고 골짜기 아래에 위치한 접근 경로 차단 화력 지원 시나리오 (사거리 1086m)',
    inputs: { Tx: 2150, Ty: 3220, Th: 80, Mx: 2900, My: 4100, Mh: 220, OTAZ: 2500 }
  }
];

const POLAR_PRESETS: PolarScenario[] = [
  {
    name: 'OP-1 전방 침투',
    description: '관측소 전방 골짜기의 침투적 탐지 타격 시나리오 (최종 사거리 1474m)',
    inputs: { Ox: 3800, Oy: 5000, Oh: 180, Mx: 3000, My: 4000, Mh: 100, polarDist: 1500, polarAzimuth: 1200, polarVert: 40 }
  },
  {
    name: '능선 하단 포격',
    description: '원거리 관측소에서 탐지한 후방 적 박격포 진지 시나리오 (최종 사거리 1961m)',
    inputs: { Ox: 4500, Oy: 6100, Oh: 310, Mx: 3200, My: 4800, Mh: 130, polarDist: 2500, polarAzimuth: 2100, polarVert: -110 }
  },
  {
    name: '근접 고수 미션',
    description: '관측소 인접 경계초소 침투 차단을 위한 단거리 제원 획득 시나리오 (최종 사거리 609m)',
    inputs: { Ox: 2700, Oy: 3600, Oh: 95, Mx: 2500, My: 3100, Mh: 80, polarDist: 900, polarAzimuth: 5800, polarVert: 15 }
  }
];

const RP_PRESETS: RpScenario[] = [
  {
    name: 'RP-A 동방 이동',
    description: '제1기록점(RP-A) 기준 우측 400m 정밀 관목선 전이 사격 (최종 사거리 1518m)',
    inputs: { Rx: 4100, Ry: 5200, Rh: 160, Mx: 3000, My: 4200, Mh: 110, rpShiftLat: 400, rpShiftDist: 100, rpShiftVert: 20, rpOtaz: 1200 }
  },
  {
    name: '골짜기 삼거리 타격',
    description: '기록점 기준 뒤쪽 골짜기로 전이해 아군 퇴로 확보 화력 사격 시나리오 (최종 사거리 1822m)',
    inputs: { Rx: 5500, Ry: 6100, Rh: 240, Mx: 4000, My: 5000, Mh: 140, rpShiftLat: -300, rpShiftDist: 500, rpShiftVert: -60, rpOtaz: 4800 }
  },
  {
    name: '종심 적 지휘부 사격',
    description: '지상 기록점 기준 관목 외각 북동쪽 종심 진지로 정밀 전이 사격 (최종 사거리 1273m)',
    inputs: { Rx: 3300, Ry: 4500, Rh: 110, Mx: 2500, My: 3500, Mh: 90, rpShiftLat: 600, rpShiftDist: -200, rpShiftVert: 80, rpOtaz: 2400 }
  }
];

type MilitaryMethod = 'grid' | 'polar' | 'rp';

export default function App() {
  // Method state
  const [calcMode, setCalcMode] = useState<MilitaryMethod>('grid');

  // Unified military "야전 올리브" theme variables locked for consistent aesthetic appeal
  const currentTheme = {
    phoneBg: 'bg-[#0d1410]',
    bg: 'bg-[#f2f6f4]',
    cardBg: 'bg-white border border-[#d1ded7]',
    primary: 'emerald',
    borderColors: 'border-[#b1c7bc] text-slate-800 focus:border-[#10b981] focus:ring-[#10b981]/20',
    accent: 'emerald',
    accentText: 'text-emerald-700',
    textPrimary: 'text-slate-800',
    textSecondary: 'text-slate-550',
    gridColor: 'rgba(16, 185, 129, 0.08)',
    canvasBg: '#0d1410',
    btnColors: 'bg-[#10b981] hover:bg-[#059669] text-white font-bold shadow-lg shadow-emerald-100',
    headerBg: 'bg-white border-b border-[#cbdad0]',
    resultCardBg: 'bg-[#13221a]',
    resultLabelColor: 'text-[#a1bfae]',
    resultValueColor: 'text-[#34d399]'
  };

  // State for METHOD 1: 방안좌표법 (Direct Target Core Coordinates) - All empty by default
  const [Tx, setTx] = useState<number | ''>('');
  const [Ty, setTy] = useState<number | ''>('');
  const [Th, setTh] = useState<number | ''>('');
  const [OTAZ, setOTAZ] = useState<number | ''>('');

  // State for METHOD 2: 극표정법 (Observer Coordinates + Polar Vector) - All empty by default
  const [Ox, setOx] = useState<number | ''>('');
  const [Oy, setOy] = useState<number | ''>('');
  const [Oh, setOh] = useState<number | ''>('');
  const [polarDist, setPolarDist] = useState<number | ''>('');
  const [polarDistSign, setPolarDistSign] = useState<1 | -1>(1);
  const [polarAzimuth, setPolarAzimuth] = useState<number | ''>('');
  const [polarVert, setPolarVert] = useState<number | ''>('');
  const [polarVertSign, setPolarVertSign] = useState<1 | -1>(1);

  // State for METHOD 3: 기록점전이법 (Registration Point Coordinates + Cartesian Shift Vector) - All empty by default
  const [Rx, setRx] = useState<number | ''>('');
  const [Ry, setRy] = useState<number | ''>('');
  const [Rh, setRh] = useState<number | ''>('');
  const [rpShiftLat, setRpShiftLat] = useState<number | ''>('');
  const [rpShiftLatSign, setRpShiftLatSign] = useState<1 | -1>(1);
  const [rpShiftDist, setRpShiftDist] = useState<number | ''>('');
  const [rpShiftDistSign, setRpShiftDistSign] = useState<1 | -1>(1);
  const [rpShiftVert, setRpShiftVert] = useState<number | ''>('');
  const [rpOtaz, setRpOtaz] = useState<number | ''>('');
  const [rpShiftVertSign, setRpShiftVertSign] = useState<1 | -1>(1);

  // Constants (always required for mortar emplacement) - All empty by default
  const [Mx, setMx] = useState<number | ''>('');
  const [My, setMy] = useState<number | ''>('');
  const [Mh, setMh] = useState<number | ''>('');

  // Interactive helper states
  const [copied, setCopied] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [calculationTrigger, setCalculationTrigger] = useState(1);

  const handlePolarDistChange = (val: string) => {
    if (val === '') {
      setPolarDist('');
      return;
    }
    const stripped = val.replace(/[-+]/g, '');
    if (stripped === '') {
      setPolarDist('');
    } else {
      const num = Number(stripped);
      setPolarDist(isNaN(num) ? '' : num);
    }
  };

  const handlePolarVertChange = (val: string) => {
    if (val === '') {
      setPolarVert('');
      return;
    }
    const stripped = val.replace(/[-+]/g, '');
    if (stripped === '') {
      setPolarVert('');
    } else {
      const num = Number(stripped);
      setPolarVert(isNaN(num) ? '' : num);
    }
  };

  const handleRpShiftLatChange = (val: string) => {
    if (val === '') {
      setRpShiftLat('');
      return;
    }
    const stripped = val.replace(/[-+]/g, '');
    if (stripped === '') {
      setRpShiftLat('');
    } else {
      const num = Number(stripped);
      setRpShiftLat(isNaN(num) ? '' : num);
    }
  };

  const handleRpShiftDistChange = (val: string) => {
    if (val === '') {
      setRpShiftDist('');
      return;
    }
    const stripped = val.replace(/[-+]/g, '');
    if (stripped === '') {
      setRpShiftDist('');
    } else {
      const num = Number(stripped);
      setRpShiftDist(isNaN(num) ? '' : num);
    }
  };

  const handleRpShiftVertChange = (val: string) => {
    if (val === '') {
      setRpShiftVert('');
      return;
    }
    const stripped = val.replace(/[-+]/g, '');
    if (stripped === '') {
      setRpShiftVert('');
    } else {
      const num = Number(stripped);
      setRpShiftVert(isNaN(num) ? '' : num);
    }
  };

  const resultsRef = useRef<HTMLDivElement>(null);
  const mapCanvasRef = useRef<HTMLCanvasElement>(null);

  // 1. Validation Logic
  const isInputsValid = (() => {
    const isBaseValid = Mx !== '' && My !== '' && Mh !== '';
    if (!isBaseValid) return false;

    if (calcMode === 'grid') {
      return Tx !== '' && Ty !== '' && Th !== '' && OTAZ !== '';
    }
    if (calcMode === 'polar') {
      return Ox !== '' && Oy !== '' && Oh !== '' && polarDist !== '' && polarAzimuth !== '' && polarVert !== '';
    }
    if (calcMode === 'rp') {
      return Rx !== '' && Ry !== '' && Rh !== '' && rpShiftLat !== '' && rpShiftDist !== '' && rpShiftVert !== '' && rpOtaz !== '';
    }
    return false;
  })();

  // 2. Target Coordinates Resolution
  const resolvedTarget = (() => {
    if (calcMode === 'grid') {
      return {
        x: Number(Tx) || 0,
        y: Number(Ty) || 0,
        h: Number(Th) || 0,
        otaz: Number(OTAZ) || 0
      };
    }
    if (calcMode === 'polar') {
      const oX = Number(Ox) || 0;
      const oY = Number(Oy) || 0;
      const oH = Number(Oh) || 0;
      const mX = Number(Mx) || 0;
      const mY = Number(My) || 0;
      const dist = (Number(polarDist) || 0) * polarDistSign;
      const azMil = Number(polarAzimuth) || 0;
      const vert = (Number(polarVert) || 0) * polarVertSign;

      // 1. (0,0)을 M(포진지)으로 설정.
      // 2. (OP-M)을 상대좌표로써의 OP로 설정.
      const opRelX = oX - mX;
      const opRelY = oY - mY;

      // 3. OP를 원점을 기준으로 관목방위각만큼 돌려 OP'을 설정. 이 때, 극좌표계로 변환하여 연산할 것.
      const r_op = Math.sqrt(opRelX * opRelX + opRelY * opRelY);
      const alpha_op = Math.atan2(opRelX, opRelY); // angle from North (Y-axis), clockwise (radians)
      const angleRad = (azMil * 2 * Math.PI) / 6400; // 관목방위각 θ

      // Rotate counter-clockwise (subtracting target azimuth) to align the azimuth line with the Y-axis
      const alpha_prime = alpha_op - angleRad;
      const opPrimeX = r_op * Math.sin(alpha_prime);
      const opPrimeY = r_op * Math.cos(alpha_prime);

      // 4. OP'의 Y값에 거리전이량/10을 더할 것. 해당 지점은 T(target)로 표시.
      const tPrimeX = opPrimeX;
      const tPrimeY = opPrimeY + (dist / 10);

      // 5. T를 관목방위각만큼 역으로 돌림. 다시 기준점을 0mil에 맞추기 위함.
      const r_t = Math.sqrt(tPrimeX * tPrimeX + tPrimeY * tPrimeY);
      const alpha_t_prime = Math.atan2(tPrimeX, tPrimeY);
      const alpha_t = alpha_t_prime + angleRad;

      const tX = r_t * Math.sin(alpha_t);
      const tY = r_t * Math.cos(alpha_t);

      // 6. T를 기준으로 도상거리 및 사격방위각 계산을 위해 절대 좌표 x, y, 고도 h 산출
      const x = mX + tX;
      const y = mY + tY;
      const h = oH + vert;

      return { x, y, h, otaz: azMil };
    }
    // rp coordinate shift mode - Calculates using the new 4-step shift formula
    const rX = Number(Rx) || 0;
    const rY = Number(Ry) || 0;
    const rH = Number(Rh) || 0;
    const shiftLat = (Number(rpShiftLat) || 0) * rpShiftLatSign;
    const shiftDist = (Number(rpShiftDist) || 0) * rpShiftDistSign;
    const shiftVert = (Number(rpShiftVert) || 0) * rpShiftVertSign;
    const oTazMil = Number(rpOtaz) || 0;

    // 1. RP의 포진지에 대한 상대좌표를 RP(X,Y)로 기억한다.
    const rpX = rX - (Number(Mx) || 0);
    const rpY = rY - (Number(My) || 0);

    // angle in radians (North/Y-axis is 0, clockwise)
    const angleRad = (oTazMil * 2 * Math.PI) / 6400;

    // 2. RP를 원점에 대하여 관목방위각만큼 돌려서 표시한 RP'을 기억한다.
    // 군사 방위각 기준 시계방향 회전 변환 적용
    const rpPrimeX = rpX * Math.cos(angleRad) + rpY * Math.sin(angleRad);
    const rpPrimeY = rpY * Math.cos(angleRad) - rpX * Math.sin(angleRad);

    // 3. RP'에서 좌우로 수평전이량(m), 상하로 거리전이량(m)만큼 움직인 점을 T로 표시한다.
    // 수평전이량과 거리전이량은 미터 단위이므로 10으로 나누어 좌표 스케일에 맞춤
    const tX = rpPrimeX + (shiftLat / 10);
    const tY = rpPrimeY + (shiftDist / 10);

    // 4. T를 기준으로 도상거리 및 사격방위각 계산을 위해 절대 좌표 x, y, 고도 h 산출
    const x = (Number(Mx) || 0) + tX;
    const y = (Number(My) || 0) + tY;
    const h = rH + shiftVert;

    return { x, y, h, otaz: oTazMil };
  })();

  // 3. Artillery Vector Calculation
  const dx = isInputsValid ? (resolvedTarget.x - Number(Mx)) : 0;
  const dy = isInputsValid ? (resolvedTarget.y - Number(My)) : 0;

  // Map Grid distance (도상거리) = sqrt(dx² + dy²) * 10
  const mapDistance = isInputsValid ? Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2)) * 10 : 0;

  // Auxiliary range (보조사거리) = (T_h - M_h) / 2
  const auxiliaryRange = isInputsValid ? (resolvedTarget.h - Number(Mh)) / 2 : 0;

  // Final Range = map distance + auxiliary correction
  const totalRange = mapDistance + auxiliaryRange;

  // Firing azimuth in mils (atan2 dy, dx clockwise matching military grid orientation)
  let firingAzimuthMil = 0;
  let firingAzimuthDeg = 0;

  if (isInputsValid) {
    const angleRadian = Math.atan2(dx, dy); // starting north, clockwise 
    let mil = angleRadian * (3200 / Math.PI);
    if (mil < 0) {
      mil += 6400;
    }
    firingAzimuthMil = mil;
    firingAzimuthDeg = (mil * 360) / 6400;
  }

  const roundedMapDistance = Math.round(mapDistance);
  const roundedAuxiliaryRange = Math.round(auxiliaryRange);
  const roundedTotalRange = Math.round(totalRange);
  const roundedAzimuthMil = Math.round(firingAzimuthMil);

  // Scenario loading triggers
  const handleLoadGridPreset = (sc: GridScenario) => {
    setTx(sc.inputs.Tx);
    setTy(sc.inputs.Ty);
    setTh(sc.inputs.Th);
    setMx(sc.inputs.Mx);
    setMy(sc.inputs.My);
    setMh(sc.inputs.Mh);
    setOTAZ(sc.inputs.OTAZ);
    setCalculationTrigger(prev => prev + 1);
  };

  const handleLoadPolarPreset = (sc: PolarScenario) => {
    setOx(sc.inputs.Ox);
    setOy(sc.inputs.Oy);
    setOh(sc.inputs.Oh);
    setMx(sc.inputs.Mx);
    setMy(sc.inputs.My);
    setMh(sc.inputs.Mh);
    setPolarDist(Math.abs(sc.inputs.polarDist));
    setPolarDistSign(sc.inputs.polarDist >= 0 ? 1 : -1);
    setPolarAzimuth(sc.inputs.polarAzimuth);
    setPolarVert(Math.abs(sc.inputs.polarVert));
    setPolarVertSign(sc.inputs.polarVert >= 0 ? 1 : -1);
    setCalculationTrigger(prev => prev + 1);
  };

  const handleLoadRpPreset = (sc: RpScenario) => {
    setRx(sc.inputs.Rx);
    setRy(sc.inputs.Ry);
    setRh(sc.inputs.Rh);
    setMx(sc.inputs.Mx);
    setMy(sc.inputs.My);
    setMh(sc.inputs.Mh);
    setRpShiftLat(Math.abs(sc.inputs.rpShiftLat));
    setRpShiftLatSign(sc.inputs.rpShiftLat >= 0 ? 1 : -1);
    setRpShiftDist(Math.abs(sc.inputs.rpShiftDist));
    setRpShiftDistSign(sc.inputs.rpShiftDist >= 0 ? 1 : -1);
    setRpShiftVert(Math.abs(sc.inputs.rpShiftVert));
    setRpShiftVertSign(sc.inputs.rpShiftVert >= 0 ? 1 : -1);
    setRpOtaz(sc.inputs.rpOtaz);
    setCalculationTrigger(prev => prev + 1);
  };

  const handleClearInputs = () => {
    if (calcMode === 'grid') {
      setTx(''); setTy(''); setTh(''); setOTAZ('');
    } else if (calcMode === 'polar') {
      setOx(''); setOy(''); setOh(''); setPolarDist(''); setPolarDistSign(1); setPolarAzimuth(''); setPolarVert(''); setPolarVertSign(1);
    } else {
      setRx(''); setRy(''); setRh(''); setRpShiftLat(''); setRpShiftLatSign(1); setRpShiftDist(''); setRpShiftDistSign(1); setRpShiftVert(''); setRpOtaz(''); setRpShiftVertSign(1);
    }
    setMx(''); setMy(''); setMh('');
  };

  const handleCalculate = () => {
    setCalculationTrigger(prev => prev + 1);
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // Clipboard copies
  const handleCopyToClipboard = () => {
    if (!isInputsValid) return;

    let title = '';
    let detailSection = '';

    if (calcMode === 'grid') {
      title = '[방안좌표법 사격 제원 결과]';
      detailSection = `■ 표적 좌표: X(${resolvedTarget.x.toFixed(1)}), Y(${resolvedTarget.y.toFixed(1)}), 고도(${resolvedTarget.h}m)
■ 관측소 방위각(OTAZ): ${resolvedTarget.otaz} mil`;
    } else if (calcMode === 'polar') {
      title = '[극표정법 사격 제원 결과]';
      detailSection = `■ 관측소(OP) 좌표: X(${Ox}), Y(${Oy}), 고도(${Oh}m)
■ 거리전이량: ${(Number(polarDist) || 0) * polarDistSign} m / 관목방위각: ${polarAzimuth} mil / 수직전이량: ${(Number(polarVert) || 0) * polarVertSign} m
■ 연산된 표적좌표: X(${resolvedTarget.x.toFixed(1)}), Y(${resolvedTarget.y.toFixed(1)}), 고도(${resolvedTarget.h}m)`;
    } else {
      title = '[기록점전이법 사격 제원 결과]';
      detailSection = `■ 기록점(RP) 좌표: X(${Rx}), Y(${Ry}), 고도(${Rh}m)
■ 기록점 관목방위각: ${rpOtaz} mil
■ 수평전이량(편의): ${(Number(rpShiftLat) || 0) * rpShiftLatSign} m / 거리전이량: ${(Number(rpShiftDist) || 0) * rpShiftDistSign} m / 수직전이량: ${(Number(rpShiftVert) || 0) * rpShiftVertSign} m
■ 연산된 표적좌표: X(${resolvedTarget.x.toFixed(1)}), Y(${resolvedTarget.y.toFixed(1)}), 고도(${resolvedTarget.h}m)`;
    }

    const textToCopy = `${title}
----------------------------
■ 아군 포진지: X(${Mx}), Y(${My}), 고도(${Mh}m)
${detailSection}
----------------------------
▶ 도상거리: ${roundedMapDistance.toLocaleString()} m
▶ 보조사거리: ${roundedAuxiliaryRange > 0 ? '+' : ''}${roundedAuxiliaryRange.toLocaleString()} m (고도차: ${resolvedTarget.h - Number(Mh)}m)
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

  // Redraw tactical visualization map in Forest style
  useEffect(() => {
    const canvas = mapCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    ctx.clearRect(0, 0, width, height);

    // Positions mapping configuration
    let pMx = Number(Mx) || 3000;
    let pMy = Number(My) || 4000;
    let pTx = resolvedTarget.x || 4200;
    let pTy = resolvedTarget.y || 5500;

    // Anchor node references to adapt grid scope
    let anchorX = pTx;
    let anchorY = pTy;
    let hasAnchor = false;
    let anchorLabel = '';
    let screenAnchor = { x: 0, y: 0 };

    if (calcMode === 'polar') {
      anchorX = Number(Ox) || 3500;
      anchorY = Number(Oy) || 4800;
      hasAnchor = true;
      anchorLabel = `관측소 (OP: ${anchorX}, ${anchorY})`;
    } else if (calcMode === 'rp') {
      anchorX = Number(Rx) || 3800;
      anchorY = Number(Ry) || 4700;
      hasAnchor = true;
      anchorLabel = `기록점 (RP: ${anchorX}, ${anchorY})`;
    }

    if (pMx === pTx && pMy === pTy) {
      pTx += 100;
      pTy += 100;
    }

    const pointsX = [pMx, pTx];
    const pointsY = [pMy, pTy];
    if (hasAnchor) {
      pointsX.push(anchorX);
      pointsY.push(anchorY);
    }

    const minX = Math.min(...pointsX);
    const maxX = Math.max(...pointsX);
    const minY = Math.min(...pointsY);
    const maxY = Math.max(...pointsY);

    const diffX = maxX - minX;
    const diffY = maxY - minY;
    const maxDiff = Math.max(diffX, diffY, 400);

    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;

    const scale = (Math.min(width, height) * 0.65) / maxDiff;

    const mapToScreen = (x: number, y: number) => {
      const sx = width / 2 + (x - centerX) * scale;
      const sy = height / 2 - (y - centerY) * scale;
      return { x: sx, y: sy };
    };

    const screenM = mapToScreen(pMx, pMy);
    const screenT = mapToScreen(pTx, pTy);
    if (hasAnchor) {
      screenAnchor = mapToScreen(anchorX, anchorY);
    }

    // 1. Grid rendering with delicate military alpha
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.08)';
    ctx.lineWidth = 1;
    const gridSpacing = 200;
    const gridMinX = Math.floor((centerX - width / 2 / scale) / gridSpacing) * gridSpacing;
    const gridMaxX = Math.ceil((centerX + width / 2 / scale) / gridSpacing) * gridSpacing;
    const gridMinY = Math.floor((centerY - height / 2 / scale) / gridSpacing) * gridSpacing;
    const gridMaxY = Math.ceil((centerY + height / 2 / scale) / gridSpacing) * gridSpacing;

    for (let gx = gridMinX; gx <= gridMaxX; gx += gridSpacing) {
      const p1 = mapToScreen(gx, gridMinY);
      ctx.beginPath();
      ctx.moveTo(p1.x, 0);
      ctx.lineTo(p1.x, height);
      ctx.stroke();

      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.font = '8px monospace';
      ctx.fillText(`${gx}`, p1.x + 2, height - 4);
    }

    for (let gy = gridMinY; gy <= gridMaxY; gy += gridSpacing) {
      const p1 = mapToScreen(gridMinX, gy);
      ctx.beginPath();
      ctx.moveTo(0, p1.y);
      ctx.lineTo(width, p1.y);
      ctx.stroke();

      ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
      ctx.font = '8px monospace';
      ctx.fillText(`${gy}`, 4, p1.y - 2);
    }

    // 2. Weapon dial reticle around Base (M)
    const dialRadius = 38;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(screenM.x, screenM.y, dialRadius, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([1, 4]);
    ctx.beginPath();
    ctx.moveTo(screenM.x, screenM.y - dialRadius - 10);
    ctx.lineTo(screenM.x, screenM.y + dialRadius + 10);
    ctx.moveTo(screenM.x - dialRadius - 10, screenM.y);
    ctx.lineTo(screenM.x + dialRadius + 10, screenM.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.font = 'bold 9px monospace';
    ctx.fillStyle = '#10b981';
    ctx.textAlign = 'center';
    ctx.fillText('0', screenM.x, screenM.y - dialRadius - 4);
    ctx.fillText('32', screenM.x, screenM.y + dialRadius + 11);
    ctx.fillText('16', screenM.x + dialRadius + 11, screenM.y + 3);
    ctx.fillText('48', screenM.x - dialRadius - 11, screenM.y + 3);

    // 3. Optional visual connection paths based on calculation mode
    if (calcMode === 'polar') {
      // OP Observer line in red
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#f43f5e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenAnchor.x, screenAnchor.y);
      ctx.lineTo(screenT.x, screenT.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // OP Anchor layout circle
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(screenAnchor.x, screenAnchor.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(anchorLabel, screenAnchor.x + 8, screenAnchor.y + 3);
    } else if (calcMode === 'rp') {
      // Offset vector line in amber
      ctx.setLineDash([3, 3]);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(screenAnchor.x, screenAnchor.y);
      ctx.lineTo(screenT.x, screenT.y);
      ctx.stroke();
      ctx.setLineDash([]);

      // RP Anchor node
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(screenAnchor.x, screenAnchor.y, 5, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px sans-serif';
      ctx.textAlign = 'left';
      ctx.fillText(anchorLabel, screenAnchor.x + 8, screenAnchor.y + 3);
    } else {
      // Direct grid mode Observer representation from direct target OTAZ range if entered
      if (Tx !== '' && OTAZ !== '') {
        const oTazMil = Number(OTAZ);
        const oTazRad = (oTazMil * 2 * Math.PI) / 6400 - Math.PI / 2;
        const obsLength = 35;
        const obsX = screenT.x + obsLength * Math.cos(oTazRad);
        const obsY = screenT.y + obsLength * Math.sin(oTazRad);

        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = '#f43f5e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(screenT.x, screenT.y);
        ctx.lineTo(obsX, obsY);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = '#f43f5e';
        ctx.beginPath();
        ctx.arc(obsX, obsY, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = '8px sans-serif';
        ctx.fillText(`관측소 (OTAZ: ${oTazMil})`, obsX, obsY - 5);
      }
    }

    // 4. Primary Firing Weapon Line (M to T)
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(screenM.x, screenM.y);
    ctx.lineTo(screenT.x, screenT.y);
    ctx.stroke();

    // Fire arrow tip
    const angle = Math.atan2(screenT.y - screenM.y, screenT.x - screenM.x);
    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.moveTo(screenT.x, screenT.y);
    ctx.lineTo(screenT.x - 11 * Math.cos(angle - Math.PI / 6), screenT.y - 11 * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(screenT.x - 11 * Math.cos(angle + Math.PI / 6), screenT.y - 11 * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fill();

    // 5. Mortar Emplacement Spot
    ctx.fillStyle = '#13221a';
    ctx.strokeStyle = '#10b981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(screenM.x, screenM.y, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#10b981';
    ctx.beginPath();
    ctx.arc(screenM.x, screenM.y, 3, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`아군진지 (M: ${pMx}, ${pMy})`, screenM.x + 12, screenM.y + 4);

    // 6. Target Crosshair Designation
    ctx.strokeStyle = '#f43f5e';
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

    ctx.fillStyle = '#f43f5e';
    ctx.font = 'bold 10px sans-serif';
    ctx.fillText(`표적 T (${Math.round(pTx)}, ${Math.round(pTy)})`, screenT.x + 12, screenT.y - 2);

    // Grid Scale Note
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.font = '10px monospace';
    ctx.textAlign = 'right';
    ctx.fillText(`거리 배율: 100m ≒ ${Math.round(100 * scale)}px`, width - 8, height - 8);

  }, [Mx, My, resolvedTarget, calcMode, Tx, OTAZ]);

  return (
    <div id="grid-calc-root" className={`min-h-screen w-full ${currentTheme.phoneBg} transition-colors duration-500 font-sans flex items-center justify-center p-0 xs:p-2 sm:p-4 md:p-6 antialiased`}>
      {/* Outer Tactical Device Frame mimicking ultra-aesthetic smartphone */}
      <div className="w-full max-w-[430px] min-h-screen sm:min-h-[820px] sm:max-h-[880px] sm:border-[12px] sm:border-slate-800 sm:rounded-[3rem] shadow-2xl relative flex flex-col overflow-y-auto overflow-x-hidden" style={{ background: currentTheme.bg }}>
        
        {/* Device Top Status Bar (High Fidelity Mock) */}
        <div className="hidden sm:flex h-11 px-6 justify-between items-center text-[11px] font-bold select-none border-b border-slate-200/40" style={{ color: currentTheme.textSecondary }}>
          <span>12:00 ⚡</span>
          <div className="flex gap-1.5 items-center">
            <span className="opacity-80">FM-NET</span>
            <span className="text-[9px] bg-emerald-100 px-1.5 py-0.2 rounded text-emerald-800 font-bold">ALPHA-SEC</span>
          </div>
        </div>

        {/* Upper Sticky Tactical Header */}
        <header id="app-header" className={`sticky top-0 z-40 ${currentTheme.headerBg} backdrop-blur-md px-4 py-3.5 shadow-sm transition-colors duration-500`}>
          <div className="w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                <Crosshair className="w-4.5 h-4.5 animate-pulse" />
              </div>
              <div>
                <h1 className={`text-base font-extrabold tracking-tight ${currentTheme.textPrimary} flex items-center gap-1.5 font-display`}>
                  야전 사격제원 계산기
                </h1>
                <p className="text-[9.5px] text-slate-500 font-bold">Field Artillery Tactical Calculator</p>
              </div>
            </div>
            {/* Version label */}
            <span className="text-[9px] bg-[#10b981]/15 text-[#10b981] font-mono border border-[#10b981]/30 rounded font-black px-1.5 py-0.5 uppercase">
              V3.0 PRO
            </span>
          </div>
        </header>

        {/* Main Body content constrained to premium mobile viewport layout */}
        <main className="flex-grow w-full px-4 py-4 flex flex-col gap-4">
          
          {/* Methodology Selector Tabs */}
          <div className="bg-slate-100 border border-slate-200/60 rounded-xl p-1 grid grid-cols-3 gap-1">
            <button
              onClick={() => { setCalcMode('grid'); setCalculationTrigger(prev => prev + 1); }}
              className={`py-1.5 text-[10.5px] font-extrabold rounded-lg transition-all ${calcMode === 'grid' ? 'bg-[#10b981] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              방안좌표법
            </button>
            <button
              onClick={() => { setCalcMode('polar'); setCalculationTrigger(prev => prev + 1); }}
              className={`py-1.5 text-[10.5px] font-extrabold rounded-lg transition-all ${calcMode === 'polar' ? 'bg-[#10b981] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              극표정법
            </button>
            <button
              onClick={() => { setCalcMode('rp'); setCalculationTrigger(prev => prev + 1); }}
              className={`py-1.5 text-[10.5px] font-extrabold rounded-lg transition-all ${calcMode === 'rp' ? 'bg-[#10b981] text-white shadow' : 'text-slate-600 hover:text-slate-900'}`}
            >
              기록점전이법
            </button>
          </div>

          {/* Preset Tactical Scenarios Selector dynamically rendered based on calculation mode */}
          <div className={`${currentTheme.cardBg} rounded-xl p-3 shadow-sm flex flex-col gap-2 transition-colors duration-500`}>
            <div className="flex items-center gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
              <Sliders className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {calcMode === 'grid' ? '방안좌표법 신속 요도 시나리오' : calcMode === 'polar' ? '극표정법 신속 요도 시나리오' : '기록점전이법 신속 요도 시나리오'}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-1.5">
              {calcMode === 'grid' && GRID_PRESETS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadGridPreset(s)}
                  className="py-1 px-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all active:scale-95 group"
                >
                  <div className="font-bold text-slate-700 transition-colors group-hover:text-emerald-600 truncate text-[10px]">
                    {s.name}
                  </div>
                  <div className="text-[8px] text-slate-400 truncate mt-0.5">T: {s.inputs.Tx}/{s.inputs.Ty}</div>
                </button>
              ))}

              {calcMode === 'polar' && POLAR_PRESETS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadPolarPreset(s)}
                  className="py-1 px-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all active:scale-95 group"
                >
                  <div className="font-bold text-slate-700 transition-colors group-hover:text-emerald-600 truncate text-[10px]">
                    {s.name}
                  </div>
                  <div className="text-[8px] text-slate-400 truncate mt-0.5">거리: {s.inputs.polarDist}m</div>
                </button>
              ))}

              {calcMode === 'rp' && RP_PRESETS.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleLoadRpPreset(s)}
                  className="py-1 px-1.5 rounded border border-slate-200 bg-slate-50 hover:bg-slate-100 text-left transition-all active:scale-95 group"
                >
                  <div className="font-bold text-slate-700 transition-colors group-hover:text-emerald-600 truncate text-[10px]">
                    {s.name}
                  </div>
                  <div className="text-[8px] text-slate-400 truncate mt-0.5">수평: {s.inputs.rpShiftLat > 0 ? '+' : ''}{s.inputs.rpShiftLat}m</div>
                </button>
              ))}
            </div>
          </div>

          {/* Inputs section (입력부) */}
          <section id="input-section" className={`${currentTheme.cardBg} rounded-2xl p-5 shadow-sm transition-all duration-500 relative bg-white`}>
            <div className="flex items-center justify-between mb-2 pb-1 bg-white">
              <h2 className="text-xs font-black tracking-widest text-[#1e293b] uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-emerald-500 rounded-full inline-block"></span>
                사격 제원 입력부 (Inputs)
              </h2>
              <button
                type="button"
                onClick={handleClearInputs}
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 border border-rose-200 bg-rose-50/50 text-[11px] font-extrabold flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all active:scale-95 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                입력 초기화
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); handleCalculate(); }} className="space-y-4">
              
              {/* FIXED COMPONENT: Gun Emplacement Base (포진지 좌표) */}
              <div className="space-y-2 border-b border-slate-100 pb-3">
                <div className="text-[11px] font-bold text-[#10b981] uppercase tracking-widest flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5" />
                  <span>아군 포진지 좌표 및 고도 (Mortar Base)</span>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label htmlFor="mx-input" className="block text-[10px] font-bold text-slate-500 mb-1">M_X (X좌표)</label>
                    <input
                      id="mx-input"
                      type="number"
                      placeholder="X 좌표"
                      value={Mx}
                      onChange={(e) => setMx(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="my-input" className="block text-[10px] font-bold text-slate-500 mb-1">M_Y (Y좌표)</label>
                    <input
                      id="my-input"
                      type="number"
                      placeholder="Y 좌표"
                      value={My}
                      onChange={(e) => setMy(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                    />
                  </div>

                  <div>
                    <label htmlFor="mh-input" className="block text-[10px] font-bold text-slate-500 mb-1">M_H (고도)</label>
                    <input
                      id="mh-input"
                      type="number"
                      placeholder="고도(m)"
                      value={Mh}
                      onChange={(e) => setMh(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              {/* METHOD-SPECIFIC DYNAMIC INPUT FIELDS */}

              {/* METHOD 1: 방안좌표법 (Grid Coordinate Method) Inputs */}
              {calcMode === 'grid' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Target specification */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 after:content-[''] after:flex-grow after:h-[1px] after:bg-slate-200 mt-1">
                      <Target className="w-3.5 h-3.5 text-[#f43f5e]" />
                      <span>표적 물리 좌표 및 고도 (Target)</span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor="tx-input" className="block text-[10px] font-bold text-slate-500 mb-1">T_X (X좌표)</label>
                        <input
                          id="tx-input"
                          type="number"
                          placeholder="X 좌표"
                          value={Tx}
                          onChange={(e) => setTx(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="ty-input" className="block text-[10px] font-bold text-slate-500 mb-1">T_Y (Y좌표)</label>
                        <input
                          id="ty-input"
                          type="number"
                          placeholder="Y 좌표"
                          value={Ty}
                          onChange={(e) => setTy(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="th-input" className="block text-[10px] font-bold text-slate-500 mb-1">T_H (고도)</label>
                        <input
                          id="th-input"
                          type="number"
                          placeholder="고도(m)"
                          value={Th}
                          onChange={(e) => setTh(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Observer specs (OTAZ) */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 after:content-[''] after:flex-grow after:h-[1px] after:bg-slate-200 mt-1">
                      <Compass className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span>관측소 소피 방위각 (OTAZ)</span>
                    </div>
                    
                    <div className="w-1/2">
                      <label htmlFor="otaz-input" className="block text-[10px] font-bold text-slate-500 mb-1">OTAZ (방위각)</label>
                      <div className="relative">
                        <input
                          id="otaz-input"
                          type="number"
                          placeholder="mil"
                          value={OTAZ}
                          onChange={(e) => setOTAZ(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                        <span className="absolute right-2.5 top-1.5 text-xs text-slate-400 font-bold">mil</span>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* METHOD 2: 극표정법 (Polar Coordinate Method) Inputs */}
              {calcMode === 'polar' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Observation Point OP specs */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 after:content-[''] after:flex-grow after:h-[1px] after:bg-slate-200 mt-1">
                      <Target className="w-3.5 h-3.5 text-[#f43f5e]" />
                      <span>관측소 (OP) 위치 좌표 및 고도</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor="ox-input" className="block text-[10px] font-bold text-slate-500 mb-1">O_X (X좌표)</label>
                        <input
                          id="ox-input"
                          type="number"
                          placeholder="X 좌표"
                          value={Ox}
                          onChange={(e) => setOx(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="oy-input" className="block text-[10px] font-bold text-slate-500 mb-1">O_Y (Y좌표)</label>
                        <input
                          id="oy-input"
                          type="number"
                          placeholder="Y 좌표"
                          value={Oy}
                          onChange={(e) => setOy(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="oh-input" className="block text-[10px] font-bold text-slate-500 mb-1">O_H (고도)</label>
                        <input
                          id="oh-input"
                          type="number"
                          placeholder="고도(m)"
                          value={Oh}
                          onChange={(e) => setOh(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Distance, Azimuth, and vertical transition properties */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 after:content-[''] after:flex-grow after:h-[1px] after:bg-slate-200 mt-1">
                      <Compass className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span>표적 관측 전이량 (OP to Target Vector)</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor="polar-dist-input" className="block text-[9.5px] font-bold text-slate-500 mb-1">거리전이량 (m)</label>
                        <div className="flex border border-slate-300 rounded-lg bg-slate-50 overflow-hidden shadow-sm h-[32px]">
                          <div className="flex flex-col border-r border-slate-200 shrink-0 select-none">
                            <button
                              type="button"
                              onClick={() => setPolarDistSign(1)}
                              className={`h-4 w-6 text-[9px] font-extrabold flex items-center justify-center transition-all ${polarDistSign === 1 ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => setPolarDistSign(-1)}
                              className={`h-4 w-6 text-[9px] font-extrabold flex items-center justify-center transition-all border-t border-slate-200 ${polarDistSign === -1 ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                              -
                            </button>
                          </div>
                          <input
                            id="polar-dist-input"
                            type="number"
                            placeholder="m"
                            value={polarDist}
                            onChange={(e) => handlePolarDistChange(e.target.value)}
                            className="w-full px-1.5 py-1 bg-white text-slate-800 text-sm font-mono placeholder-slate-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="polar-az-input" className="block text-[9.5px] font-bold text-slate-500 mb-1">관목방위각 (mil)</label>
                        <div className="relative">
                          <input
                            id="polar-az-input"
                            type="number"
                            placeholder="mil"
                            value={polarAzimuth}
                            onChange={(e) => setPolarAzimuth(e.target.value === '' ? '' : Number(e.target.value))}
                            className="w-full px-1.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] shadow-sm"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="polar-vert-input" className="block text-[9.5px] font-bold text-slate-500 mb-1">수직전이량 (m)</label>
                        <div className="flex border border-slate-300 rounded-lg bg-slate-50 overflow-hidden shadow-sm h-[32px]">
                          <div className="flex flex-col border-r border-slate-200 shrink-0 select-none">
                            <button
                              type="button"
                              onClick={() => setPolarVertSign(1)}
                              className={`h-4 w-6 text-[9px] font-extrabold flex items-center justify-center transition-all ${polarVertSign === 1 ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => setPolarVertSign(-1)}
                              className={`h-4 w-6 text-[9px] font-extrabold flex items-center justify-center transition-all border-t border-slate-200 ${polarVertSign === -1 ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                              -
                            </button>
                          </div>
                          <input
                            id="polar-vert-input"
                            type="number"
                            placeholder="m"
                            value={polarVert}
                            onChange={(e) => handlePolarVertChange(e.target.value)}
                            className="w-full px-1.5 py-1 bg-white text-slate-800 text-sm font-mono placeholder-slate-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* METHOD 3: 기록점전이법 (Registration Point Shift Method) Inputs */}
              {calcMode === 'rp' && (
                <div className="space-y-4 animate-fade-in">
                  
                  {/* Reference Point RP specs */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 after:content-[''] after:flex-grow after:h-[1px] after:bg-slate-200 mt-1">
                      <Target className="w-3.5 h-3.5 text-[#f43f5e]" />
                      <span>기록점 (RP) 기준 좌표 및 고도</span>
                    </div>

                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label htmlFor="rx-input" className="block text-[10px] font-bold text-slate-500 mb-1">R_X (X좌표)</label>
                        <input
                          id="rx-input"
                          type="number"
                          placeholder="X 좌표"
                          value={Rx}
                          onChange={(e) => setRx(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="ry-input" className="block text-[10px] font-bold text-slate-500 mb-1">R_Y (Y좌표)</label>
                        <input
                          id="ry-input"
                          type="number"
                          placeholder="Y 좌표"
                          value={Ry}
                          onChange={(e) => setRy(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="rh-input" className="block text-[10px] font-bold text-slate-500 mb-1">R_H (고도)</label>
                        <input
                          id="rh-input"
                          type="number"
                          placeholder="고도(m)"
                          value={Rh}
                          onChange={(e) => setRh(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                      </div>

                      <div>
                        <label htmlFor="rp-otaz-input" className="block text-[10px] font-bold text-slate-500 mb-1">관목방위각 (mil)</label>
                        <input
                          id="rp-otaz-input"
                          type="number"
                          placeholder="mil"
                          value={rpOtaz}
                          onChange={(e) => setRpOtaz(e.target.value === '' ? '' : Number(e.target.value))}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 text-slate-800 rounded-lg text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-[#10b981] focus:ring-2 focus:ring-[#10b981]/10 transition-all shadow-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Horizontal, Range and Height adjustments */}
                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2 after:content-[''] after:flex-grow after:h-[1px] after:bg-slate-200 mt-1">
                      <Compass className="w-3.5 h-3.5 text-[#f59e0b]" />
                      <span>기록점 대비 전이량 (RP to Target Shifts)</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label htmlFor="rp-lat-input" className="block text-[9.5px] font-bold text-slate-500 mb-1">수평전이량 (m)</label>
                        <div className="flex border border-slate-300 rounded-lg bg-slate-50 overflow-hidden shadow-sm h-[32px]">
                          <div className="flex flex-col border-r border-slate-200 shrink-0 select-none">
                            <button
                              type="button"
                              onClick={() => setRpShiftLatSign(1)}
                              className={`h-4 w-6 text-[9px] font-extrabold flex items-center justify-center transition-all ${rpShiftLatSign === 1 ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => setRpShiftLatSign(-1)}
                              className={`h-4 w-6 text-[9px] font-extrabold flex items-center justify-center transition-all border-t border-slate-200 ${rpShiftLatSign === -1 ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                              -
                            </button>
                          </div>
                          <input
                            id="rp-lat-input"
                            type="number"
                            placeholder="m"
                            value={rpShiftLat}
                            onChange={(e) => handleRpShiftLatChange(e.target.value)}
                            className="w-full px-1.5 py-1 bg-white text-slate-800 text-sm font-mono placeholder-slate-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="rp-dist-input" className="block text-[9.5px] font-bold text-slate-500 mb-1">거리전이량 (m)</label>
                        <div className="flex border border-slate-300 rounded-lg bg-slate-50 overflow-hidden shadow-sm h-[32px]">
                          <div className="flex flex-col border-r border-slate-200 shrink-0 select-none">
                            <button
                              type="button"
                              onClick={() => setRpShiftDistSign(1)}
                              className={`h-4 w-6 text-[9px] font-extrabold flex items-center justify-center transition-all ${rpShiftDistSign === 1 ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => setRpShiftDistSign(-1)}
                              className={`h-4 w-6 text-[9px] font-extrabold flex items-center justify-center transition-all border-t border-slate-200 ${rpShiftDistSign === -1 ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                              -
                            </button>
                          </div>
                          <input
                            id="rp-dist-input"
                            type="number"
                            placeholder="m"
                            value={rpShiftDist}
                            onChange={(e) => handleRpShiftDistChange(e.target.value)}
                            className="w-full px-1.5 py-1 bg-white text-slate-800 text-sm font-mono placeholder-slate-400 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="rp-vert-input" className="block text-[9.5px] font-bold text-slate-500 mb-1">수직전이량 (m)</label>
                        <div className="flex border border-slate-300 rounded-lg bg-slate-50 overflow-hidden shadow-sm h-[32px]">
                          <div className="flex flex-col border-r border-slate-200 shrink-0 select-none">
                            <button
                              type="button"
                              onClick={() => setRpShiftVertSign(1)}
                              className={`h-4 w-6 text-[9px] font-extrabold flex items-center justify-center transition-all ${rpShiftVertSign === 1 ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                              +
                            </button>
                            <button
                              type="button"
                              onClick={() => setRpShiftVertSign(-1)}
                              className={`h-4 w-6 text-[9px] font-extrabold flex items-center justify-center transition-all border-t border-slate-200 ${rpShiftVertSign === -1 ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'}`}
                            >
                              -
                            </button>
                          </div>
                          <input
                            id="rp-vert-input"
                            type="number"
                            placeholder="m"
                            value={rpShiftVert}
                            onChange={(e) => handleRpShiftVertChange(e.target.value)}
                            className="w-full px-1.5 py-1 bg-white text-slate-800 text-sm font-mono placeholder-slate-400 focus:outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* Status information or helper triggers */}
              {!isInputsValid && (
                <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center gap-2 transition-all">
                  <Info className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                  <span>
                    {calcMode === 'grid' && '정보: 포진지 및 표적 좌표를 포함한 7가지 사격 변수를 모두 입력하십시오.'}
                    {calcMode === 'polar' && '정보: 관측소 및 표적 소해 극좌표, 거리/방위각 변수를 모두 입력하십시오.'}
                    {calcMode === 'rp' && '정보: 알려진 지상 기준지 기록점 좌표와 전이 변수량을 모두 입력하십시오.'}
                  </span>
                </div>
              )}

              {/* ACTION EXECUTE BUTTON */}
              <div className="pt-2">
                <motion.button
                  id="calculate-button"
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={!isInputsValid}
                  className={`w-full py-3.5 rounded-xl text-center uppercase tracking-wide flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isInputsValid 
                      ? currentTheme.btnColors
                      : 'bg-[#10b981]/10 text-slate-400 border border-[#10b981]/25 cursor-not-allowed'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>제원 산출하기</span>
                </motion.button>
              </div>

            </form>
          </section>

          {/* Dynamic Tactical Map Area */}
          <section id="reticle-map" className={`${currentTheme.cardBg} rounded-2xl p-5 shadow-sm bg-white`}>
            <div className="flex items-center justify-between mb-3 pb-1 border-b border-slate-100">
              <h2 className="text-xs font-black tracking-widest text-[#1e293b] uppercase flex items-center gap-1.5 font-display">
                <span className="w-1.5 h-3 bg-[#10b981] rounded-full inline-block animate-pulse"></span>
                실시간 야전 전술 투영 요도 (Tactical Plan)
              </h2>
              <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-1.5 py-0.2 rounded font-mono font-bold">GRID SCALE 10x</span>
            </div>

            <div 
              style={{ backgroundColor: currentTheme.canvasBg }} 
              className="w-full overflow-hidden rounded-xl border border-slate-200 flex items-center justify-center aspect-square relative shadow-inner"
            >
              <canvas 
                ref={mapCanvasRef} 
                width={350} 
                height={350} 
                className="w-full h-full p-2 block"
              />
              {/* Graphical compass orientation axis background overlays */}
              <div className="absolute top-2 left-2 flex flex-col gap-0.5 pointer-events-none drop-shadow">
                <span className="text-[9px] text-[#a1bfae] font-mono font-bold">GRID GRAPH AXIS:</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">▲ Y (북/N: 0 mil 기산점)</span>
                <span className="text-[9px] text-emerald-400 font-mono font-bold">▶ X (동/E: 1600 mil 기산점)</span>
              </div>
            </div>
            <p className="text-[9.5px] text-slate-400 text-center mt-2.5 leading-relaxed">
              ※ Y북행 방향전이가 사격기준각 0 mil선입니다.
              {calcMode === 'polar' && ' (빨간 점선은 관측소-표적 간의 관측 전이선)'}
              {calcMode === 'rp' && ' (노란 점선은 기준기록점-표적 간의 전이 축선)'}
              {calcMode === 'grid' && ' (빨간 점선은 관측소 관측 조준선)'}
            </p>
          </section>

          {/* Results Area */}
          <section
            ref={resultsRef}
            id="output-section"
            className={`rounded-2xl p-5 shadow-xl transition-all duration-500 relative overflow-hidden ${currentTheme.resultCardBg}`}
          >
            {/* Dark abstract overlay highlight */}
            <div className="absolute -right-16 -bottom-16 w-36 h-36 rounded-full bg-[#10b981]/5 blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2 z-10">
              <h2 className="text-xs font-black tracking-widest text-[#f8fafc] uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-3 bg-[#10b981] rounded-full inline-block animate-pulse"></span>
                사격 제원 산출 결과 (Outputs)
              </h2>
              {isInputsValid && (
                <button
                  type="button"
                  onClick={handleCopyToClipboard}
                  className="text-[10px] font-bold px-2.5 py-1 rounded bg-[#17251e] border border-emerald-800/40 text-emerald-400 hover:bg-[#1a3826] transition-all flex items-center gap-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '복사 완료' : '제원 복사'}</span>
                </button>
              )}
            </div>

            {!isInputsValid ? (
              <div className="text-center py-10 space-y-2">
                <div className="w-10 h-10 rounded-full bg-white/5 text-slate-400 flex items-center justify-center mx-auto border border-white/10">
                  <Crosshair className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div>
                  <p className="text-slate-300 text-xs font-bold">산출된 사격 제원이 없습니다</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">상단 입력 폼에 모든 사격 연산 수치를 입력해주십시오.</p>
                </div>
              </div>
            ) : (
              <div key={calculationTrigger} className="space-y-3.5 animate-fade-in text-white">
                
                {/* Embedded target coordinates derived summary display */}
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-800/30 text-[10px] flex flex-col gap-1 text-[#a1bfae]">
                  <span className="font-extrabold uppercase tracking-wide text-emerald-400">결정완료 연산 표적 좌표 (Resolved Target Coordinates)</span>
                  <div className="grid grid-cols-3 gap-1 font-mono">
                    <span>X: {resolvedTarget.x.toFixed(1)}</span>
                    <span>Y: {resolvedTarget.y.toFixed(1)}</span>
                    <span>H (고도): {resolvedTarget.h} m</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  {/* 1. 도상거리 */}
                  <div className="bg-[#0b1410]/80 border border-emerald-900/40 rounded-xl p-3 text-center flex flex-col justify-between shadow-inner">
                    <div>
                      <span className={`text-[10px] ${currentTheme.resultLabelColor} font-bold uppercase tracking-widest block mb-1`}>도상거리 (Grid Range)</span>
                      <strong className="text-xl font-black font-mono tracking-tight text-white block">
                        {roundedMapDistance.toLocaleString()} <span className="text-xs text-slate-400">m</span>
                      </strong>
                    </div>
                    <div className="mt-1.5 border-t border-emerald-950/80 pt-1 flex items-center justify-center gap-1 text-[9px] text-slate-500">
                      <span>수평 변위:</span>
                      <span className="font-mono text-slate-400">{(mapDistance).toFixed(1)}m</span>
                    </div>
                  </div>

                  {/* 2. 보조사거리 */}
                  <div className="bg-[#0b1410]/80 border border-emerald-900/40 rounded-xl p-3 text-center flex flex-col justify-between shadow-inner">
                    <div>
                      <span className={`text-[10px] ${currentTheme.resultLabelColor} font-bold uppercase tracking-widest block mb-1`}>보조사거리 (Correction)</span>
                      <strong className={`text-xl font-black font-mono tracking-tight block ${roundedAuxiliaryRange > 0 ? 'text-amber-400' : roundedAuxiliaryRange < 0 ? 'text-rose-400' : 'text-slate-350'}`}>
                        {roundedAuxiliaryRange > 0 ? '+' : ''}{roundedAuxiliaryRange.toLocaleString()} <span className="text-xs text-slate-400">m</span>
                      </strong>
                    </div>
                    <div className="mt-1.5 border-t border-emerald-950/80 pt-1 flex items-center justify-center gap-1 text-[9px] text-slate-500">
                      <span>표고편차:</span>
                      <span className="font-mono text-slate-400">{resolvedTarget.h - Number(Mh)}m</span>
                    </div>
                  </div>
                </div>

                {/* 3. 최종 사거리 (Full-Span) */}
                <div className="p-3.5 bg-[#0b1410] border border-emerald-800/40 rounded-xl flex items-center justify-between relative overflow-hidden shadow">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#10b981]" />
                  <div>
                    <div className={`flex items-center gap-1 text-[9.5px] ${currentTheme.resultLabelColor} font-bold uppercase tracking-widest mb-1`}>
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                      <span>최종 결정 사거리 (Final Range)</span>
                    </div>
                    <strong className={`text-2xl font-black font-mono tracking-tight ${currentTheme.resultValueColor}`}>
                      {roundedTotalRange.toLocaleString()} <span className="text-xs font-normal text-slate-400">m</span>
                    </strong>
                  </div>
                  <div className="text-right">
                    <span className="text-[8.5px] bg-[#1a3826] border border-emerald-800/40 text-emerald-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      도상 + 보조
                    </span>
                    <span className="block text-[8.5px] text-slate-500 font-mono mt-0.5">
                      ({(mapDistance + auxiliaryRange).toFixed(1)}m)
                    </span>
                  </div>
                </div>



                {/* 4. 최종 사격방위각 (Full-Span) */}
                <div className="p-3.5 bg-[#0b1410] border border-emerald-800/40 rounded-xl flex items-center justify-between relative overflow-hidden shadow">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#ef4444]" />
                  <div>
                    <div className={`flex items-center gap-1 text-[9.5px] ${currentTheme.resultLabelColor} font-bold uppercase tracking-widest mb-1`}>
                      <Compass className="w-3.5 h-3.5 text-rose-450" />
                      <span>최종 사격 방위각 (Firing Azimuth)</span>
                    </div>
                    <strong className="text-2xl font-black font-mono tracking-tight text-white font-mono">
                      {roundedAzimuthMil} <span className="text-xs font-semibold text-slate-400">mil</span>
                    </strong>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <div className="px-1.5 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-400 font-bold border border-amber-500/20">
                      약 {firingAzimuthDeg.toFixed(1)}°
                    </div>
                    <span className="block text-[8px] text-slate-500 font-mono mt-1 uppercase">
                      Y북축 기준 우회전각
                    </span>
                  </div>
                </div>

                {/* Expandable detailed mathematical explanation formulas */}
                <div className="border border-emerald-900/35 rounded-xl overflow-hidden mt-3 bg-emerald-950/10">
                  <button
                    type="button"
                    onClick={() => setShowExplanation(!showExplanation)}
                    className="w-full text-left px-3.5 py-2.5 flex items-center justify-between text-xs text-slate-300 hover:text-white transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-semibold">
                      <FileText className="w-3.5 h-3.5 text-emerald-500" />
                      상세 수학적 사격연산 과정 보기
                    </span>
                    <span className="text-slate-500 font-mono">
                      {showExplanation ? '접기 ▲' : '펼치기 ▼'}
                    </span>
                  </button>

                  <AnimatePresence>
                    {showExplanation && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="border-t border-emerald-950 text-[11px] text-[#a1bfae] p-3.5 space-y-3 font-mono leading-relaxed"
                      >
                        {/* Core intermediate target derivation walkthrough */}
                        <div className="bg-[#0b1410]/50 p-2.5 rounded border border-emerald-950">
                          <div className="font-bold text-white mb-1">【0단계】 변동표적 좌표 결정 유도식</div>
                          {calcMode === 'grid' && (
                            <p className="text-[10px]">직접 입력된 기정 표적 좌표값을 그대로 채용합니다.<br />Tx={resolvedTarget.x}, Ty={resolvedTarget.y}, Th={resolvedTarget.h} m</p>
                          )}
                          {calcMode === 'polar' && (
                            <div className="space-y-1.5 text-[10px]">
                              <p className="font-semibold text-emerald-400">교안: M17계산판 방식 극표정법 8단계 연산:</p>
                              <p>θ_rad = polarAzimuth({polarAzimuth}) × (2*PI/6400) = {((Number(polarAzimuth) || 0) * 2 * Math.PI / 6400).toFixed(4)} rad</p>

                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>1단계 (M을 기준 원점으로 설정):</strong><br />
                                Mx = {Mx}, My = {My}
                              </p>

                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>2단계 (상대좌표 OP 설정):</strong><br />
                                OP_relX = Ox({Ox}) - Mx({Mx}) = {(Number(Ox) || 0) - (Number(Mx) || 0)}<br />
                                OP_relY = Oy({Oy}) - My({My}) = {(Number(Oy) || 0) - (Number(My) || 0)}
                              </p>

                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>3단계 (OP 원점 기준 관목방위각 θ 회전하여 OP' 산출 - 극좌표계 변환):</strong><br />
                                r_op = {Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)).toFixed(2)}<br />
                                α_op = {Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)).toFixed(4)} rad ({((Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) * 6400) / (2 * Math.PI)).toFixed(1)} mil)<br />
                                α'_op (회전각) = α_op - θ = {(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400).toFixed(4)} rad<br />
                                OP'_X = r_op × sin(α') = {(Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)) * Math.sin(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400)).toFixed(2)}<br />
                                OP'_Y = r_op × cos(α') = {(Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)) * Math.cos(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400)).toFixed(2)}
                              </p>

                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>4단계 (OP' Y값에 거리전이량/10 더하기):</strong><br />
                                거리전이량 (미터) = {((Number(polarDist) || 0) * polarDistSign)}m (좌표계 격자전이값 = {((Number(polarDist) || 0) * polarDistSign) / 10})<br />
                                T'_X = OP'_X = {(Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)) * Math.sin(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400)).toFixed(2)}<br />
                                T'_Y = OP'_Y + d/10 = {(Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)) * Math.cos(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400) + ((Number(polarDist) || 0) * polarDistSign) / 10).toFixed(2)}
                              </p>

                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>5단계 (T'을 관목방위각만큼 역으로 돌려 사격 방위각 기준점 0mil 원복):</strong><br />
                                r_t = {Math.sqrt(Math.pow(Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)) * Math.sin(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400), 2) + Math.pow(Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)) * Math.cos(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400) + ((Number(polarDist) || 0) * polarDistSign) / 10, 2)).toFixed(2)}<br />
                                α'_t = {Math.atan2(Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)) * Math.sin(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400), Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)) * Math.cos(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400) + ((Number(polarDist) || 0) * polarDistSign) / 10).toFixed(4)} rad<br />
                                α_t (최종 방향각) = α'_t + θ = {(Math.atan2(Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)) * Math.sin(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400), Math.sqrt(Math.pow((Number(Ox) || 0) - (Number(Mx) || 0), 2) + Math.pow((Number(Oy) || 0) - (Number(My) || 0), 2)) * Math.cos(Math.atan2((Number(Ox) || 0) - (Number(Mx) || 0), (Number(Oy) || 0) - (Number(My) || 0)) - ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400) + ((Number(polarDist) || 0) * polarDistSign) / 10) + ((Number(polarAzimuth) || 0) * 2 * Math.PI) / 6400).toFixed(4)} rad
                              </p>

                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>6단계 (M을 환원하여 절대 표적 좌표 Tx, Ty 및 Th 결정):</strong><br />
                                Tx = Mx + tX = <span className="text-white font-bold">{resolvedTarget.x.toFixed(2)}</span><br />
                                Ty = My + tY = <span className="text-white font-bold">{resolvedTarget.y.toFixed(2)}</span><br />
                                Th = OP_h({Oh}) + 수직전이량({(Number(polarVert) || 0) * polarVertSign}) = <span className="text-white font-bold">{resolvedTarget.h} m</span>
                              </p>

                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>7단계 (보조사거리 산출 - OP_h + 수직전이량 - M_h / 2):</strong><br />
                                보조사거리 = (OP_h({Oh}) - M_h({Mh}) + 수직전이량({(Number(polarVert) || 0) * polarVertSign})) / 2 = <span className="text-white font-bold">{auxiliaryRange.toFixed(1)} m</span>
                              </p>

                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>8단계 (사거리산출):</strong><br />
                                사거리 = 도상거리({mapDistance.toFixed(2)} m) + 보조사거리({auxiliaryRange.toFixed(1)} m) = <span className="text-white font-black">{totalRange.toFixed(2)} m</span>
                              </p>
                            </div>
                          )}
                          {calcMode === 'rp' && (
                            <div className="space-y-1.5 text-[10px]">
                              <p className="font-semibold text-emerald-400">기록점전이법 신규 4단계 공식 적용:</p>
                              <p>θ_rad = rpOtaz({rpOtaz}) × (2*PI/6400) = {((rpOtaz as number) * 2 * Math.PI / 6400).toFixed(4)} rad</p>
                              
                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>1단계 (상대좌표 RP 구하기):</strong><br />
                                RP_X = Rx({Rx}) - Mx({Mx}) = {(Number(Rx) || 0) - (Number(Mx) || 0)}<br />
                                RP_Y = Ry({Ry}) - My({My}) = {(Number(Ry) || 0) - (Number(My) || 0)}
                              </p>
                              
                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>2단계 (관목선 각도 θ_rad 회전):</strong><br />
                                RP'_X = RP_X × cos(θ) + RP_Y × sin(θ) = {(( (Number(Rx) || 0) - (Number(Mx) || 0) ) * Math.cos(((Number(rpOtaz) || 0) * 2 * Math.PI) / 6400) + ( (Number(Ry) || 0) - (Number(My) || 0) ) * Math.sin(((Number(rpOtaz) || 0) * 2 * Math.PI) / 6400)).toFixed(2)}<br />
                                RP'_Y = RP_Y × cos(θ) - RP_X × sin(θ) = {(( (Number(Ry) || 0) - (Number(My) || 0) ) * Math.cos(((Number(rpOtaz) || 0) * 2 * Math.PI) / 6400) - ( (Number(Rx) || 0) - (Number(Mx) || 0) ) * Math.sin(((Number(rpOtaz) || 0) * 2 * Math.PI) / 6400)).toFixed(2)}
                              </p>

                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>3단계 (수평/거리 전이):</strong><br />
                                T_X = RP'_X + (shiftLat({(Number(rpShiftLat) || 0) * rpShiftLatSign}) / 10) = {(( (Number(Rx) || 0) - (Number(Mx) || 0) ) * Math.cos(((Number(rpOtaz) || 0) * 2 * Math.PI) / 6400) + ( (Number(Ry) || 0) - (Number(My) || 0) ) * Math.sin(((Number(rpOtaz) || 0) * 2 * Math.PI) / 6400) + ((Number(rpShiftLat) || 0) * rpShiftLatSign) / 10).toFixed(2)}<br />
                                T_Y = RP'_Y + (shiftDist({(Number(rpShiftDist) || 0) * rpShiftDistSign}) / 10) = {(( (Number(Ry) || 0) - (Number(My) || 0) ) * Math.cos(((Number(rpOtaz) || 0) * 2 * Math.PI) / 6400) - ( (Number(Rx) || 0) - (Number(Mx) || 0) ) * Math.sin(((Number(rpOtaz) || 0) * 2 * Math.PI) / 6400) + ((Number(rpShiftDist) || 0) * rpShiftDistSign) / 10).toFixed(2)}
                              </p>

                              <p className="border-l-2 border-emerald-800 pl-1.5 py-0.5">
                                <strong>4단계 (절대 표적 좌표 Tx, Ty 및 고도 Th 산출):</strong><br />
                                Tx = Mx({Mx}) + T_X = <span className="text-white font-bold">{resolvedTarget.x.toFixed(2)}</span><br />
                                Ty = My({My}) + T_Y = <span className="text-white font-bold">{resolvedTarget.y.toFixed(2)}</span><br />
                                Th = Rh({Rh}) + (shiftVert({(Number(rpShiftVert) || 0) * rpShiftVertSign})) = <span className="text-white font-bold">{resolvedTarget.h} m</span>
                              </p>
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="font-semibold text-slate-100 mb-1 border-b border-emerald-950 pb-0.5">1단계: 포진지-표적 좌표 편차 계산 (dx, dy)</div>
                          <p>dx = T_x - M_x = {resolvedTarget.x.toFixed(2)} - {Mx} = <span className="text-[#34d399] font-bold">{dx.toFixed(2)}</span></p>
                          <p>dy = T_y - M_y = {resolvedTarget.y.toFixed(2)} - {My} = <span className="text-[#34d399] font-bold">{dy.toFixed(2)}</span></p>
                        </div>

                        <div>
                          <div className="font-semibold text-slate-100 mb-1 border-b border-emerald-950 pb-0.5">2단계: 수평 도상거리 계산</div>
                          <p className="text-[10px] text-slate-500">공식: sqrt(dx² + dy²) × 10</p>
                          <p>sqrt({dx.toFixed(2)}² + {dy.toFixed(2)}²) × 10</p>
                          <p>= sqrt({(dx*dx).toFixed(1)} + {(dy*dy).toFixed(1)}) × 10</p>
                          <p>= sqrt({(dx*dx + dy*dy).toFixed(1)}) × 10</p>
                          <p>= {Math.sqrt(dx*dx + dy*dy).toFixed(4)} × 10</p>
                          <p>= <span className="text-[#34d399] font-bold">{mapDistance.toFixed(2)} m</span> (반올림: {roundedMapDistance} m)</p>
                        </div>

                        <div>
                          <div className="font-semibold text-slate-100 mb-1 border-b border-emerald-950 pb-0.5">3단계: 보조사거리 계산 (고도차 보정)</div>
                          <p className="text-[10px] text-slate-500">공식: (T_h - M_h) / 2</p>
                          <p>= ({resolvedTarget.h} - {Mh}) / 2 = {(resolvedTarget.h - Number(Mh))} / 2</p>
                          <p>= <span className="text-[#34d399] font-bold">{auxiliaryRange.toFixed(1)} m</span> (반올림: {roundedAuxiliaryRange} m)</p>
                        </div>

                        <div>
                          <div className="font-semibold text-slate-100 mb-1 border-b border-emerald-950 pb-0.5">4단계: 최종 정합 사거리 결정</div>
                          <p className="text-[10px] text-slate-500">공식: 도상거리 + 보조사거리</p>
                          <p>= {mapDistance.toFixed(2)} + ({auxiliaryRange.toFixed(1)}) = {totalRange.toFixed(2)} m</p>
                          <p>= 최종 정수 변환: <span className="text-[#34d399] font-black underline">{roundedTotalRange} m</span></p>
                        </div>

                        <div>
                          <div className="font-semibold text-slate-100 mb-1 border-b border-emerald-950 pb-0.5">5단계: 군사용 사격방위각 계산</div>
                          <p className="text-[10px] text-slate-500">공식: atan2(dx, dy) × (3200 / Math.PI)</p>
                          <p>라디안 각도 = atan2({dx.toFixed(2)}, {dy.toFixed(2)}) = {Math.atan2(dx, dy).toFixed(4)} rad</p>
                          <p>mil 환산값 = {Math.atan2(dx, dy).toFixed(4)} × {(3200 / Math.PI).toFixed(4)}</p>
                          <p>= { (Math.atan2(dx, dy) * (3200 / Math.PI)).toFixed(2) } mil</p>
                          { (Math.atan2(dx, dy) * (3200 / Math.PI)) < 0 ? (
                            <>
                              <p className="text-rose-450 font-bold">※ 연산각이 음수이므로 +6400 mil 방향 가산 보정을 수행합니다.</p>
                              <p>= { (Math.atan2(dx, dy) * (3200 / Math.PI)).toFixed(2) } + 6400 = {firingAzimuthMil.toFixed(2)} mil</p>
                            </>
                          ) : null}
                          <p>= 최종 정수 변환: <span className="text-[#34d399] font-black underline">{roundedAzimuthMil} mil</span> (약 {firingAzimuthDeg.toFixed(1)}°)</p>
                        </div>

                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>
            )}
          </section>

          {/* Educational Military Guides */}
          <section id="guide-section" className={`${currentTheme.cardBg} rounded-2xl overflow-hidden shadow-sm transition-colors duration-500 bg-white`}>
            <button
              type="button"
              onClick={() => setShowGuide(!showGuide)}
              className="w-full text-left p-4 flex items-center justify-between font-bold text-slate-850 text-xs bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-1.5 uppercase tracking-wider font-extrabold text-[#1a3a2a] font-display">
                <HelpCircle className="w-4 h-4 text-emerald-600 animate-bounce" />
                <span>야전 사격수 산출법 전술 참고사항</span>
              </span>
              <span>
                {showGuide ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
              </span>
            </button>

            <AnimatePresence>
              {showGuide && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-4 pb-4 border-t border-slate-100 text-[11px] text-slate-650 space-y-3 font-sans leading-relaxed bg-white"
                >
                  <div className="bg-[#f0fcf5] p-3 rounded-lg border border-emerald-100 space-y-1.5 mt-3">
                    <h4 className="font-extrabold text-emerald-800 flex items-center gap-1 text-[11px]">
                      <span className="w-1 h-3 bg-emerald-600 rounded-full inline-block animate-pulse"></span>
                      야전 3대 사격 계산방법 (Artillery Calculus)
                    </h4>
                    <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[10.5px]">
                      <li>
                        <strong>방안좌표법 (Grid Method):</strong> 아군 포진지와 표적의 전술 격자 절대좌표(x, y) 차이를 유클리드 거릭법으로 산출하여 신속 정비하는 정석 계산입니다.
                      </li>
                      <li>
                        <strong>극표정법 (Polar Method):</strong> 고지대 관측소(OP)의 좌표를 토대로 관측소와 표적까지의 관측거리(거리전이량) 및 관측방위각을 백터합산해 표적 좌표를 도출 후 사격 제원을 결정합니다.
                      </li>
                      <li>
                        <strong>기록점전이법 (RP Shift):</strong> 기 정비된 고정 기록점(RP)으로부터 표적까지의 편위 수평전이량(m), 거리전이량(m)을 지형 오프셋 가감해 신속하게 수정 제원을 편차 수렵하는 방법입니다.
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-2 mt-3 text-[10.5px] text-slate-600">
                    <div>
                      <strong className="text-[#1a3a2a] block font-bold">■ 도상거리 환산계수 (*10) 배율의 수학적 원리</strong>
                      <p>
                        한국 군사 작전용 1:50,000 지도의 가상 도상 격자 좌표 단위(4자리 수치)는 기본 10m 단위 차이량을 기준으로 함에 따라, 좌표차에 비율 승산인 <code className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-mono font-bold">* 10</code> 배율을 곱해 실제 야전 미터 단위 거리로 스케일업합니다.
                      </p>
                    </div>

                    <div>
                      <strong className="text-[#1a3a2a] block font-bold">■ 보조사거리 탄도 고정식 (Target Height - Base Height) / 2</strong>
                      <p>
                        박격포탄은 발사각이 큰 고각 곡사 화기로써 고도 차이가 사거리에 큰 영향을 미칩니다. 표적과 포 진지 고도차의 절반(<code className="text-emerald-700 bg-emerald-50 px-1 py-0.2 rounded font-mono font-bold">1/2</code>)을 유클리드 미터 거리에 탄도 보정값(보조사거리)으로 대입하여 상호 가감 수렴합니다.
                      </p>
                    </div>

                    <div>
                      <strong className="text-[#1a3a2a] block font-bold">■ 밀 (mil) 군사용 각도 규격</strong>
                      <p>
                        도분초를 쓰는 360분법 대신 원주를 6400등분한 군사 각도 체계 <code className="text-rose-600 font-bold">밀(mil)</code>을 채용합니다. 1밀은 1km 거리에서 1m 가로 폭을 지니므로, 신속 정밀한 화포 방위각 정렬에 최고의 기동성을 보장합니다.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

        </main>

        {/* Military safety notice static at the bottom */}
        <footer className="py-5 text-center text-[9px] text-slate-400 select-none bg-slate-50/50 border-t border-slate-100">
          <p>전술용 모의 가상 연산기로써 실제 화포 조작 시 국방 연병 표준 장비 제원을 최우선 준수해야 합니다.</p>
          <p className="mt-1 font-mono text-[8.5px] text-[#10b981] font-extrabold uppercase tracking-widest">W_GEN DEFENSE CALCULATOR · TACTICAL ARTI GCM V3</p>
        </footer>

      </div>
    </div>
  );
}
