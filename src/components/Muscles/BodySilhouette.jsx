import React from "react";

function FrontView({ selectedRegionId, onSelectRegion }) {
  const mc = (id) => `muscle${selectedRegionId === id ? " sel" : ""}`;

  return (
    <svg viewBox="0 0 220 520" className="muscle-silhouette" aria-label="Front body view">
      <defs>
        <linearGradient id="bodyBase" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2e2e36" />
          <stop offset="100%" stopColor="#1a1a20" />
        </linearGradient>
        <linearGradient id="limbGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#282830" />
          <stop offset="100%" stopColor="#1c1c22" />
        </linearGradient>
        <radialGradient id="shoulderGrad" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#323238" />
          <stop offset="100%" stopColor="#1e1e24" />
        </radialGradient>
      </defs>

      <g className="base">
        <ellipse cx="110" cy="26" rx="22" ry="24" fill="url(#bodyBase)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
        <ellipse cx="110" cy="38" rx="18" ry="14" fill="url(#bodyBase)" stroke="none" />
        <path d="M96,48 C96,44 124,44 124,48 L128,70 C128,74 92,74 92,70Z" fill="#252530" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        <path d="M90,62 C82,60 68,64 58,72 C52,78 52,84 58,88 C66,92 82,88 92,80Z" fill="#28282e" stroke="none" />
        <path d="M130,62 C138,60 152,64 162,72 C168,78 168,84 162,88 C154,92 138,88 128,80Z" fill="#28282e" stroke="none" />
        <path d="M88,66 C78,64 54,68 36,82 C22,92 18,108 22,122 C26,134 40,140 56,140 L164,140 C180,140 194,134 198,122 C202,108 198,92 184,82 C166,68 142,64 132,66 C126,72 120,76 110,76 C100,76 94,72 88,66Z" fill="url(#bodyBase)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
        <ellipse cx="34" cy="96" rx="20" ry="24" fill="url(#shoulderGrad)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
        <ellipse cx="186" cy="96" rx="20" ry="24" fill="url(#shoulderGrad)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
        <path d="M14,108 C6,120 2,144 2,164 C2,182 6,196 16,202 C26,206 40,198 44,180 C48,160 46,134 38,114 C32,100 22,98 14,108Z" fill="url(#limbGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        <path d="M206,108 C214,120 218,144 218,164 C218,182 214,196 204,202 C194,206 180,198 176,180 C172,160 174,134 182,114 C188,100 198,98 206,108Z" fill="url(#limbGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        <path d="M4,204 C-2,218 -4,240 -4,260 C-4,276 2,288 12,292 C22,296 36,288 40,272 C44,254 42,230 36,212 C30,198 14,196 4,204Z" fill="url(#limbGrad)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
        <path d="M216,204 C222,218 224,240 224,260 C224,276 218,288 208,292 C198,296 184,288 180,272 C176,254 178,230 184,212 C190,198 206,196 216,204Z" fill="url(#limbGrad)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
        <ellipse cx="18" cy="302" rx="14" ry="10" fill="url(#limbGrad)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <ellipse cx="202" cy="302" rx="14" ry="10" fill="url(#limbGrad)" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <path d="M58,138 C52,148 48,166 48,184 C48,202 54,216 64,222 L156,222 C166,216 172,202 172,184 C172,166 168,148 162,138Z" fill="#1e1e26" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
        <path d="M62,220 C56,228 52,240 52,254 L168,254 C168,240 164,228 158,220Z" fill="#222228" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <path d="M52,252 C42,262 32,282 28,308 C24,332 28,358 38,374 C46,388 62,396 76,390 C90,384 96,368 94,344 C92,318 86,290 78,268 C72,252 60,246 52,252Z" fill="url(#limbGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        <path d="M168,252 C178,262 188,282 192,308 C196,332 192,358 182,374 C174,388 158,396 144,390 C130,384 124,368 126,344 C128,318 134,290 142,268 C148,252 160,246 168,252Z" fill="url(#limbGrad)" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        <path d="M34,378 C26,392 18,414 18,436 C18,452 26,464 40,466 C54,468 66,456 70,438 C74,418 68,394 58,378 C52,366 42,366 34,378Z" fill="url(#limbGrad)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
        <path d="M186,378 C194,392 202,414 202,436 C202,452 194,464 180,466 C166,468 154,456 150,438 C146,418 152,394 162,378 C168,366 178,366 186,378Z" fill="url(#limbGrad)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
        <path d="M16,464 C6,468 0,476 4,482 C8,488 26,490 44,486 C58,482 64,474 58,466Z" fill="#222228" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        <path d="M204,464 C214,468 220,476 216,482 C212,488 194,490 176,486 C162,482 156,474 162,466Z" fill="#222228" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        <line x1="110" y1="70" x2="110" y2="118" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        <line x1="90" y1="148" x2="130" y2="148" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
        <line x1="88" y1="168" x2="132" y2="168" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
        <line x1="88" y1="188" x2="132" y2="188" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
        <line x1="110" y1="140" x2="110" y2="210" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
        <line x1="110" y1="254" x2="110" y2="370" stroke="rgba(255,255,255,0.04)" strokeWidth="0.8" />
      </g>

      <g className={mc("chest")} onClick={() => onSelectRegion("chest")}>
        <path className="r" d="M81,88 C96,86 108,96 108,110 C108,122 96,132 81,132 C66,132 54,122 54,110 C54,98 66,88 81,88Z" />
        <path className="r" d="M139,88 C124,86 112,96 112,110 C112,122 124,132 139,132 C154,132 166,122 166,110 C166,98 154,88 139,88Z" />
        <g className="lbl">
          <rect x="80" y="56" width="60" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="110" y="66.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">CHEST</text>
          <circle cx="110" cy="96" r="2.5" fill="#a3e635" />
          <line x1="110" y1="70" x2="110" y2="93" stroke="#a3e635" strokeWidth="0.8" strokeDasharray="2,2" />
        </g>
      </g>

      <g className={mc("shoulders")} onClick={() => onSelectRegion("shoulders")}>
        <path className="r" d="M84,66 C74,56 52,52 32,64 C18,74 14,90 20,104 C26,116 44,120 60,112 C74,104 84,88 84,66Z" />
        <path className="r" d="M136,66 C146,56 168,52 188,64 C202,74 206,90 200,104 C194,116 176,120 160,112 C146,104 136,88 136,66Z" />
        <g className="lbl">
          <rect x="4" y="72" width="52" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="30" y="82.5" textAnchor="middle" fill="#a3e635" fontSize="5.5" fontWeight="700" letterSpacing="0.04em">SHOULDER</text>
          <circle cx="34" cy="96" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("biceps")} onClick={() => onSelectRegion("biceps")}>
        <path className="r" d="M16,112 C8,126 4,150 4,170 C4,188 10,202 20,206 C30,210 44,202 48,184 C52,164 48,140 40,122 C34,108 26,104 16,112Z" />
        <path className="r" d="M204,112 C212,126 216,150 216,170 C216,188 210,202 200,206 C190,210 176,202 172,184 C168,164 172,140 180,122 C186,108 194,104 204,112Z" />
        <g className="lbl">
          <rect x="2" y="148" width="36" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="20" y="158.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">BICEP</text>
          <circle cx="16" cy="164" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("forearms")} onClick={() => onSelectRegion("forearms")}>
        <path className="r" d="M6,208 C0,224 -2,248 -2,268 C-2,284 4,296 14,300 C24,304 38,296 42,278 C46,258 44,234 38,216 C32,202 16,200 6,208Z" />
        <path className="r" d="M214,208 C220,224 222,248 222,268 C222,284 216,296 206,300 C196,304 182,296 178,278 C174,258 176,234 182,216 C188,202 204,200 214,208Z" />
        <g className="lbl">
          <rect x="2" y="244" width="46" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="25" y="254.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">FOREARM</text>
          <circle cx="10" cy="260" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("abs")} onClick={() => onSelectRegion("abs")}>
        <path className="r" d="M90,138 C90,132 100,128 110,128 C120,128 130,132 130,138 L132,212 C132,218 122,222 110,222 C98,222 88,218 88,212Z" />
        <g className="lbl">
          <rect x="84" y="160" width="52" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="110" y="170.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">ABS</text>
          <circle cx="110" cy="178" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("obliques")} onClick={() => onSelectRegion("obliques")}>
        <path className="r" d="M62,140 C54,150 48,168 46,188 C44,206 48,222 58,228 C68,234 80,228 84,214 C86,198 86,172 84,152 C82,138 72,132 62,140Z" />
        <path className="r" d="M158,140 C166,150 172,168 174,188 C176,206 172,222 162,228 C152,234 140,228 136,214 C134,198 134,172 136,152 C138,138 148,132 158,140Z" />
        <g className="lbl">
          <rect x="28" y="172" width="50" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="53" y="182.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">OBLIQUE</text>
          <circle cx="54" cy="188" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("quads")} onClick={() => onSelectRegion("quads")}>
        <path className="r" d="M54,256 C44,266 34,288 30,316 C26,342 30,368 42,382 C52,394 68,400 82,392 C96,384 102,366 100,340 C98,312 90,284 80,264 C72,250 62,248 54,256Z" />
        <path className="r" d="M166,256 C176,266 186,288 190,316 C194,342 190,368 178,382 C168,394 152,400 138,392 C124,384 118,366 120,340 C122,312 130,284 140,264 C148,250 158,248 166,256Z" />
        <g className="lbl">
          <rect x="26" y="310" width="46" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="49" y="320.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">QUAD</text>
          <circle cx="46" cy="326" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("calves")} onClick={() => onSelectRegion("calves")}>
        <path className="r" d="M36,384 C26,400 18,422 18,444 C18,458 24,470 36,472 C48,474 62,462 66,444 C70,424 64,400 54,384 C48,372 44,372 36,384Z" />
        <path className="r" d="M184,384 C194,400 202,422 202,444 C202,458 196,470 184,472 C172,474 158,462 154,444 C150,424 156,400 166,384 C172,372 176,372 184,384Z" />
        <g className="lbl">
          <rect x="18" y="420" width="40" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="38" y="430.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">CALF</text>
          <circle cx="36" cy="436" r="2.5" fill="#a3e635" />
        </g>
      </g>
    </svg>
  );
}

function BackView({ selectedRegionId, onSelectRegion }) {
  const mc = (id) => `muscle${selectedRegionId === id ? " sel" : ""}`;

  return (
    <svg viewBox="0 0 220 520" className="muscle-silhouette" aria-label="Back body view">
      <defs>
        <linearGradient id="bodyBase2" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor="#2e2e36" />
          <stop offset="100%" stopColor="#1a1a20" />
        </linearGradient>
        <radialGradient id="shoulderGrad2" cx="50%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#323238" />
          <stop offset="100%" stopColor="#1e1e24" />
        </radialGradient>
      </defs>

      <g className="base">
        <ellipse cx="110" cy="26" rx="22" ry="24" fill="url(#bodyBase2)" stroke="rgba(255,255,255,0.1)" strokeWidth="0.7" />
        <ellipse cx="110" cy="38" rx="18" ry="14" fill="url(#bodyBase2)" stroke="none" />
        <path d="M96,48 C96,44 124,44 124,48 L128,70 C128,74 92,74 92,70Z" fill="#252530" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        <path d="M88,66 C78,64 54,68 36,82 C22,92 18,108 22,122 C26,134 40,140 56,140 L164,140 C180,140 194,134 198,122 C202,108 198,92 184,82 C166,68 142,64 132,66 C126,72 120,76 110,76 C100,76 94,72 88,66Z" fill="url(#bodyBase2)" stroke="rgba(255,255,255,0.07)" strokeWidth="0.7" />
        <ellipse cx="34" cy="96" rx="20" ry="24" fill="url(#shoulderGrad2)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
        <ellipse cx="186" cy="96" rx="20" ry="24" fill="url(#shoulderGrad2)" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" />
        <path d="M14,108 C6,120 2,144 2,164 C2,182 6,196 16,202 C26,206 40,198 44,180 C48,160 46,134 38,114 C32,100 22,98 14,108Z" fill="#242430" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        <path d="M206,108 C214,120 218,144 218,164 C218,182 214,196 204,202 C194,206 180,198 176,180 C172,160 174,134 182,114 C188,100 198,98 206,108Z" fill="#242430" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        <path d="M4,204 C-2,218 -4,240 -4,260 C-4,276 2,288 12,292 C22,296 36,288 40,272 C44,254 42,230 36,212 C30,198 14,196 4,204Z" fill="#242430" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
        <path d="M216,204 C222,218 224,240 224,260 C224,276 218,288 208,292 C198,296 184,288 180,272 C176,254 178,230 184,212 C190,198 206,196 216,204Z" fill="#242430" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
        <path d="M58,138 C52,148 48,166 48,184 C48,202 54,216 64,222 L156,222 C166,216 172,202 172,184 C172,166 168,148 162,138Z" fill="#1e1e26" stroke="rgba(255,255,255,0.06)" strokeWidth="0.6" />
        <path d="M62,220 C56,228 52,240 52,254 L168,254 C168,240 164,228 158,220Z" fill="#222228" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <path d="M52,252 C42,262 32,282 28,308 C24,332 28,358 38,374 C46,388 62,396 76,390 C90,384 96,368 94,344 C92,318 86,290 78,268 C72,252 60,246 52,252Z" fill="#242430" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        <path d="M168,252 C178,262 188,282 192,308 C196,332 192,358 182,374 C174,388 158,396 144,390 C130,384 124,368 126,344 C128,318 134,290 142,268 C148,252 160,246 168,252Z" fill="#242430" stroke="rgba(255,255,255,0.08)" strokeWidth="0.6" />
        <path d="M34,378 C26,392 18,414 18,436 C18,452 26,464 40,466 C54,468 66,456 70,438 C74,418 68,394 58,378 C52,366 42,366 34,378Z" fill="#242430" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
        <path d="M186,378 C194,392 202,414 202,436 C202,452 194,464 180,466 C166,468 154,456 150,438 C146,418 152,394 162,378 C168,366 178,366 186,378Z" fill="#242430" stroke="rgba(255,255,255,0.07)" strokeWidth="0.6" />
        <ellipse cx="18" cy="304" rx="14" ry="10" fill="#242430" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <ellipse cx="202" cy="304" rx="14" ry="10" fill="#242430" stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
        <path d="M16,464 C6,468 0,476 4,482 C8,488 26,490 44,486 C58,482 64,474 58,466Z" fill="#222228" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        <path d="M204,464 C214,468 220,476 216,482 C212,488 194,490 176,486 C162,482 156,474 162,466Z" fill="#222228" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
        <line x1="110" y1="70" x2="110" y2="220" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
      </g>

      <g className={mc("traps")} onClick={() => onSelectRegion("traps")}>
        <path className="r" d="M88,66 C90,58 100,52 110,50 C120,52 130,58 132,66 C148,76 172,88 174,102 C174,114 158,120 138,112 C128,108 110,106 92,112 C72,120 56,114 56,102 C58,88 80,76 88,66Z" />
        <g className="lbl">
          <rect x="78" y="56" width="64" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="110" y="66.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">TRAPS</text>
          <circle cx="110" cy="84" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("rearDelts")} onClick={() => onSelectRegion("rearDelts")}>
        <path className="r" d="M82,66 C70,56 46,54 28,66 C14,76 12,96 18,110 C24,122 42,126 60,116 C74,108 84,92 82,66Z" />
        <path className="r" d="M138,66 C150,56 174,54 192,66 C206,76 208,96 202,110 C196,122 178,126 160,116 C146,108 136,92 138,66Z" />
        <g className="lbl">
          <rect x="2" y="74" width="56" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="30" y="84.5" textAnchor="middle" fill="#a3e635" fontSize="5.5" fontWeight="700" letterSpacing="0.04em">REAR DELT</text>
          <circle cx="38" cy="98" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("lats")} onClick={() => onSelectRegion("lats")}>
        <path className="r" d="M56,102 C44,116 34,140 32,166 C30,192 36,218 48,228 C60,236 76,232 82,216 C88,198 86,168 82,142 C78,120 68,106 56,102Z" />
        <path className="r" d="M164,102 C176,116 186,140 188,166 C190,192 184,218 172,228 C160,236 144,232 138,216 C132,198 134,168 138,142 C142,120 152,106 164,102Z" />
        <g className="lbl">
          <rect x="16" y="150" width="40" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="36" y="160.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">LATS</text>
          <circle cx="40" cy="168" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("triceps")} onClick={() => onSelectRegion("triceps")}>
        <path className="r" d="M16,112 C8,126 4,152 4,172 C4,190 10,206 20,210 C30,214 46,206 50,186 C54,164 50,138 42,118 C36,104 26,102 16,112Z" />
        <path className="r" d="M204,112 C212,126 216,152 216,172 C216,190 210,206 200,210 C190,214 174,206 170,186 C166,164 170,138 178,118 C184,104 194,102 204,112Z" />
        <g className="lbl">
          <rect x="2" y="150" width="46" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="25" y="160.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">TRICEP</text>
          <circle cx="14" cy="166" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("lowerBack")} onClick={() => onSelectRegion("lowerBack")}>
        <path className="r" d="M88,140 C88,134 98,130 110,130 C122,130 132,134 132,140 L134,216 C134,222 124,226 110,226 C96,226 86,222 86,216Z" />
        <g className="lbl">
          <rect x="62" y="164" width="96" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="110" y="174.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">LOWER BACK</text>
          <circle cx="110" cy="182" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("glutes")} onClick={() => onSelectRegion("glutes")}>
        <path className="r" d="M66,228 C54,236 44,254 42,276 C40,296 50,312 68,318 C84,322 102,312 108,292 C114,312 132,322 148,318 C166,312 176,296 174,276 C172,254 162,236 150,228 C136,220 108,236 122,254 C136,236 108,220 66,228Z" />
        <g className="lbl">
          <rect x="72" y="260" width="76" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="110" y="270.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">GLUTES</text>
          <circle cx="110" cy="280" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("hamstrings")} onClick={() => onSelectRegion("hamstrings")}>
        <path className="r" d="M52,268 C42,280 32,304 30,330 C28,356 34,378 46,388 C58,398 74,394 82,376 C90,356 88,326 80,302 C74,282 62,262 52,268Z" />
        <path className="r" d="M168,268 C178,280 188,304 190,330 C192,356 186,378 174,388 C162,398 146,394 138,376 C130,356 132,326 140,302 C146,282 158,262 168,268Z" />
        <g className="lbl">
          <rect x="14" y="314" width="68" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="48" y="324.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">HAMSTRING</text>
          <circle cx="44" cy="330" r="2.5" fill="#a3e635" />
        </g>
      </g>

      <g className={mc("calves")} onClick={() => onSelectRegion("calves")}>
        <path className="r" d="M36,392 C26,408 18,430 18,452 C18,468 26,478 40,480 C54,482 68,470 72,450 C76,430 70,406 60,390 C52,378 46,378 36,392Z" />
        <path className="r" d="M184,392 C194,408 202,430 202,452 C202,468 194,478 180,480 C166,482 152,470 148,450 C144,430 150,406 160,390 C168,378 174,378 184,392Z" />
        <g className="lbl">
          <rect x="18" y="428" width="40" height="14" rx="4" fill="rgba(5,5,5,0.92)" stroke="#a3e635" strokeWidth="0.9" />
          <text x="38" y="438.5" textAnchor="middle" fill="#a3e635" fontSize="6.5" fontWeight="700" letterSpacing="0.06em">CALF</text>
          <circle cx="36" cy="444" r="2.5" fill="#a3e635" />
        </g>
      </g>
    </svg>
  );
}

export function BodySilhouette({ view, selectedRegionId, onSelectRegion }) {
  return (
    <div className="muscle-silhouette-card">
      {view === "front"
        ? <FrontView selectedRegionId={selectedRegionId} onSelectRegion={onSelectRegion} />
        : <BackView selectedRegionId={selectedRegionId} onSelectRegion={onSelectRegion} />
      }
    </div>
  );
}