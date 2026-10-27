"use client";

/** Original hand-drawn-inspired vector illustration, not a copied image or a GLB. */
export function ShopIllustration() {
 const green="#4e8468",dark="#4b5443",ink="#605649",cream="#fff3d5";
 return <svg className="ve2d-art" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 810" preserveAspectRatio="xMidYMid meet" aria-hidden="true" focusable="false">
  <defs>
   <linearGradient id="ve2d-sky" x1="0" x2="0" y1="0" y2="1">
    <stop stopColor="#e2edce"/><stop offset=".7" stopColor="#f8efcf"/><stop offset="1" stopColor="#f1dfb5"/>
   </linearGradient>
   <linearGradient id="ve2d-wall" x1="0" x2="1">
    <stop stopColor="#f7e7c7"/><stop offset=".55" stopColor="#fff1d5"/><stop offset="1" stopColor="#eed5af"/>
   </linearGradient>
   <linearGradient id="ve2d-awning" x1="0" x2="0" y1="0" y2="1">
    <stop stopColor="#fff5d4"/><stop offset="1" stopColor="#e6cda6"/>
   </linearGradient>
   <pattern id="ve2d-speckles" width="80" height="70" patternUnits="userSpaceOnUse">
    <circle cx="12" cy="30" r="1.5" fill="#937d5b" opacity=".12"/>
    <circle cx="57" cy="7" r="1.1" fill="#588765" opacity=".13"/>
   </pattern>
   <filter id="ve2d-soft-shadow" x="-30%" y="-30%" width="160%" height="180%">
    <feGaussianBlur stdDeviation="12"/>
   </filter>
  </defs>
  {/* Painted morning sky and sunbeams. */}
  <rect width="1440" height="810" fill="url(#ve2d-sky)"/>
  <circle cx="185" cy="121" r="66" fill="#ffedb3" opacity=".76"/>
  <path d="M0 305Q158 237 335 289T682 274T1118 290T1440 264V612H0Z" fill="#dbe3bd" opacity=".72"/>
  <path d="M0 526Q162 480 338 515T734 508T1190 481T1440 510V810H0Z" fill="#c4d1a0" opacity=".35"/>
  {/* Quiet paper grain; entirely deterministic vector patterns. */}
  <rect width="1440" height="810" fill="url(#ve2d-speckles)"/>
  <path d="M0 649Q420 626 750 649T1440 634V810H0Z" fill="#e8d8b4"/>
  <path d="M0 705Q423 694 728 708T1440 698" stroke="#f7e8c8" strokeWidth="17" fill="none" opacity=".74"/>
  <g opacity=".20" fill="#9e9a6e">
   {Array.from({length:18},(_,i)=><ellipse key={i} cx={35+i*79} cy={716+(i%3)*21} rx={19+(i%4)*5} ry="4"/>)}
  </g>

  {/* Left fence, hand-painted electrical pole and curved shop lighting. */}
  <g stroke={ink} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
   <path d="M64 145L70 657" stroke="#af9871" strokeWidth="13"/>
   <path d="M24 170Q108 147 190 170" fill="none" strokeWidth="3"/>
   <path d="M24 189Q112 165 199 187" fill="none" strokeWidth="2"/>
   <path d="M70 212h38v35H70zM66 393h42v55H66z" fill="#e3d2b4" strokeWidth="3"/>
   <path d="M69 132l32 4M76 150l31 10M73 113h79q14 0 14 15v23" fill="none"/>
   <path d="M167 149q-26-32-51-12" fill="none"/>
   <path d="M135 160q5-23 29-18t14 29q-19 23-43-11Z" fill="#e4d0a9" strokeWidth="3"/>
   <circle cx="161" cy="164" r="13" fill="#ffebb7" stroke="none"/>
  </g>

  {/* Back building and shop sign. */}
  <g stroke={ink} strokeWidth="4" strokeLinejoin="round">
   <path d="M250 228L320 181H1063L1138 230V642H247Z" fill="url(#ve2d-wall)"/>
   <path d="M248 250H1136" stroke="#c8b893" strokeWidth="6"/>
   <path d="M300 229V628M1092 227V627" stroke="#d5c2a0" strokeWidth="3" opacity=".5"/>
   <path d="M440 110L925 104L937 214L443 222Z" fill="#f9eed6"/>
   <path d="M448 125Q675 129 921 119" stroke="#ded1ae" strokeWidth="3" fill="none"/>
  </g>
  <g fill="#b9473d" fontWeight="800" textAnchor="middle" fontFamily="Georgia, serif">
   <text x="681" y="178" fontSize="57" letterSpacing="12">VƯỜN ÉP</text>
   <text x="682" y="204" fontSize="19" letterSpacing="3" fill="#6d8960">NƯỚC ÉP THEO MÙA • TƯƠI MỖI NGÀY</text>
  </g>

  {/* Storefront interior: shelf layers, dark green wood & jars. */}
  <g stroke={dark} strokeWidth="4" strokeLinejoin="round">
   <rect x="354" y="305" width="667" height="304" rx="9" fill="#658166"/>
   <rect x="376" y="325" width="624" height="254" fill="#344f3c"/>
   <rect x="389" y="335" width="302" height="236" fill="#55714f"/>
   <path d="M390 400H697M390 470H697M390 539H697" stroke="#cfaa78" strokeWidth="10"/>
   <rect x="704" y="337" width="273" height="232" fill="#42634d"/>
  </g>
  {/* Colorful juice ingredients and small products */}
  {Array.from({length:23},(_,i)=>{
   const col=i%8,row=Math.floor(i/8);
   const colors=["#d8ae72","#d4684f","#c5d58e","#e7c273","#b9c89a","#a85e51","#eac884","#a3ae81"];
   return <g key={i}>
    <rect x={400+col*36} y={364+row*70} width={26+(i%3)*2} height={27+(i%4)*4}
      rx="3" fill={colors[i%colors.length]} stroke="#6a5c45" strokeWidth="2"/>
    <path d={`M${405+col*36} ${382+row*70}h16`} stroke="#fff1cd" strokeWidth="3"/>
   </g>;
  })}
  {/* Interior blackboard and chalk writing */}
  <rect x="785" y="345" width="152" height="151" rx="4" fill="#284b39" stroke="#d1ac77" strokeWidth="7"/>
  <g fontFamily="Georgia, serif" textAnchor="middle" fill="#ffedcd">
   <text x="862" y="385" fontSize="20">FRESH</text>
   <text x="862" y="416" fontSize="25">JUICE</text>
   <text x="862" y="446" fontSize="17">🍊 ✿ 🍐</text>
  </g>
  {/* Fabric awning, scalloped trim and sunny stripes. */}
  <g stroke={ink} strokeWidth="3" strokeLinejoin="round">
   <path d="M314 271L1090 267L1141 341L278 344Z" fill="url(#ve2d-awning)"/>
   {Array.from({length:12},(_,i)=>{
    const x=313+i*65;
    return <path key={i} d={`M${x} 273L${x-27} 341h68l-4-68Z`}
     fill={i%2===0?"#f4e5c2":"#98b58e"} stroke="none" opacity=".8"/>;
   })}
   <path d="M280 342Q302 369 325 342Q350 371 373 342Q400 370 427 342Q455 373 484 342Q515 374 544 342Q575 375 604 342Q635 371 665 342Q694 370 725 342Q757 374 787 342Q818 373 846 342Q879 373 910 342Q941 376 968 342Q1001 374 1032 342Q1065 372 1097 342Q1125 363 1141 341"
    fill="none" stroke="#5e8d74" strokeWidth="10"/>
  </g>

  {/* Employee inside the service window: single original cream mascot. */}
  <g className="ve2d-clerk" stroke={ink} strokeWidth="3.5" strokeLinejoin="round">
   <ellipse cx="745" cy="483" rx="89" ry="22" fill="#223d33" opacity=".15" stroke="none"/>
   <path d="M690 452Q682 393 716 391H782Q822 401 805 464Z" fill="#f0d9a4"/>
   <path d="M712 412L717 482L776 482L779 412" fill="#75a178" strokeWidth="3"/>
   <path d="M716 417Q749 433 782 415" stroke="white" strokeWidth="5" fill="none"/>
   <g className="ve2d-clerk-wave">
    <path d="M688 425Q665 432 658 404Q649 387 635 393Q624 402 640 417Q652 451 685 451Z" fill="#f1d6a2"/>
    <ellipse cx="633" cy="394" rx="17" ry="14" fill="#f1d6a2"/>
   </g>
   <path d="M804 421Q823 448 808 472Q796 476 793 456Z" fill="#efd5a0"/>
   <path d="M706 382Q695 379 697 363Q690 347 705 343Q702 317 733 322Q749 307 766 325Q797 313 801 341Q819 342 811 364Q813 385 797 388Z"
     fill="#f6e4bd"/>
   <ellipse cx="726" cy="323" rx="20" ry="19" fill="#f6e4bd"/>
   <ellipse cx="782" cy="323" rx="20" ry="19" fill="#f6e4bd"/>
   <path d="M709 361q13 10 24 0M764 361q13 10 24 0" fill="none" stroke={ink} strokeWidth="4" strokeLinecap="round"/>
   <path d="M733 378Q751 399 770 378" fill="none" stroke="#ab6554" strokeWidth="4" strokeLinecap="round"/>
   <ellipse cx="710" cy="375" rx="10" ry="5" fill="#ebad9a" stroke="none"/>
   <ellipse cx="792" cy="375" rx="10" ry="5" fill="#ebad9a" stroke="none"/>
   <path d="M743 403h25" stroke="#e9be89" strokeWidth="4"/>
  </g>

  {/* Service counter and handwritten sale board. */}
  <g stroke={ink} strokeWidth="4" strokeLinejoin="round">
   <path d="M335 481L1027 480L1019 623L345 624Z" fill="#a8bf9a"/>
   <path d="M333 475Q693 465 1032 472V503H333Z" fill="#e9d2a4"/>
   {Array.from({length:16},(_,i)=><path key={i}
     d={`M${353+i*43} 507L${355+i*43} 618`} stroke="#7ca38c" strokeWidth="2.4" opacity=".72"/>)}
   <path d="M347 624H1020" stroke="#708f72" strokeWidth="7"/>
  </g>
  <g transform="translate(411 488)" stroke={ink} strokeWidth="2.5">
   {["#f2af52","#b3c576","#d66d50","#ecc765","#e9a457"].map((c,i)=>
     <g key={i} transform={`translate(${i*57} 0)`}>
      <rect x="0" y="-30" width="43" height="41" rx="8" fill="#f7e7c9"/>
      <ellipse cx="22" cy="-8" rx="15" ry="15" fill={c}/>
      <ellipse cx="25" cy="-22" rx="8" ry="3" fill="#678a57" transform="rotate(-24 25 -22)" stroke="none"/>
     </g>)}
  </g>

  {/* Hand drawn drink display and chalkboard at the right */}
  <g stroke={ink} strokeWidth="3">
   <path d="M889 435h99v60h-99z" fill="#eecb90"/>
   <path d="M907 450h63" stroke="#f5e9be" strokeWidth="4"/>
   {Array.from({length:3},(_,i)=><g key={i}>
    <path d={`M${902+i*27} 453h18l-3 31h-13Z`} fill={["#e8a553","#d77955","#abc370"][i]}/>
    <path d={`M${910+i*27} 456l9-17`} stroke="#f4efcf" strokeWidth="3"/>
   </g>)}
  </g>

  {/* Crates, baskets and fresh produce below left side */}
  <g stroke={ink} strokeWidth="3.6" strokeLinejoin="round">
   <path d="M185 594h187l-9 119H201Z" fill="#bc8358"/>
   <path d="M196 611h168M196 651h171M235 609v99M323 607v98" stroke="#e9bb82" strokeWidth="9"/>
   {Array.from({length:11},(_,i)=>{
    const cx=214+(i%5)*31,cy=580+Math.floor(i/5)*25;
    return <g key={i}>
     <circle cx={cx} cy={cy} r="16" fill={i%3===0?"#d46e47":i%3===1?"#ebb15e":"#95b567"}/>
     <path d={`M${cx} ${cy-16}q3-12 13-7`} fill="none" stroke="#668a55" strokeWidth="3"/>
    </g>;
   })}
  </g>
  {/* Right refrigerated bottles on a low stall table. */}
  <g stroke={ink} strokeWidth="3" strokeLinejoin="round">
   <path d="M1025 552h180v14h-180zM1032 566l-17 137M1192 566l18 137" fill="#b58b60"/>
   {Array.from({length:6},(_,i)=>{
    const x=1040+i*27;
    return <g key={i}>
     <rect x={x+4} y="494" width="14" height="11" rx="3" fill="#448860"/>
     <path d={`M${x+5} 505h12l5 48h-22Z`} fill={["#e69c48","#a8c878","#df7653"][i%3]}/>
     <rect x={x+2} y="522" width="18" height="13" fill="#f8eccd" stroke="none"/>
    </g>;
   })}
  </g>

  {/* Fridge and drink colours on the right side wall */}
  <g stroke={ink} strokeWidth="4" strokeLinejoin="round">
   <rect x="1041" y="340" width="74" height="220" rx="8" fill="#c4d8cb"/>
   <rect x="1049" y="363" width="58" height="162" fill="#d5e6d7"/>
   <path d="M1057 436h43M1057 483h43" stroke="#8caaa3"/>
   {Array.from({length:9},(_,i)=><rect key={i}
      x={1055+i%3*15} y={398+Math.floor(i/3)*48} width="11" height="25" rx="4"
      fill={["#ecaf6a","#96c58a","#de8265"][i%3]} strokeWidth="1.5"/>)}
  </g>

  {/* Large tree canopy and its warm textured trunk frame the store. */}
  <g stroke={ink} strokeLinejoin="round" strokeLinecap="round">
   <path d="M1229 694Q1239 585 1217 458T1194 229Q1186 150 1147 86"
    stroke="#94734b" strokeWidth="77" fill="none"/>
   <path d="M1209 392Q1285 296 1380 236M1192 290Q1126 228 1083 140M1183 228Q1223 138 1254 51"
    stroke="#80653e" strokeWidth="23" fill="none"/>
   <path d="M1236 686Q1238 535 1217 432T1198 254" stroke="#c7a06f" strokeWidth="17" fill="none" opacity=".55"/>
  </g>
  <g className="ve2d-treetop">
   {[
    [1046,78,142,82],[1194,70,174,103],[1357,104,169,109],
    [1286,207,155,90],[1062,212,131,84],[1401,261,140,87],
    [1209,182,188,117],[1349,52,154,88]
   ].map(([x,y,rx,ry],i)=><ellipse key={i} cx={x} cy={y} rx={rx} ry={ry}
     fill={["#92ae6c","#748e54","#a9bf7c","#849c5d","#a5b977","#79975d","#95aa6a","#bad08a"][i]}
     opacity=".94"/>)}
   {Array.from({length:52},(_,i)=>{
    const x=1030+(i*83)%430,y=20+(i*47)%270;
    return <ellipse key={i} cx={x} cy={y} rx={6+(i%5)*3} ry={4+(i%4)*2}
       fill={i%3===0?"#c9cd85":"#527b4e"} opacity={.25+(i%4)*.1}
       transform={`rotate(${(i*41)%90} ${x} ${y})`}/>;
   })}
  </g>
  {/* Outdoor customer seating for the open-plan 30m² shop (2 patio tables, 4 chairs). */}
  <g stroke={ink} strokeLinejoin="round" strokeLinecap="round">
   {/* Warm timber chairs, planted under the shop's overhanging canopy. */}
   {[[476,677],[753,689],[801,706],[1121,724]].map(([x,y],i)=><g key={i} transform={`translate(${x} ${y})`}>
     <path d="M-39-58L-34 31M39-58L33 31" stroke="#95704b" strokeWidth="7" fill="none"/>
     <path d="M-43-62Q0-75 42-60L44-28Q2-14-43-28Z" fill="#b98d5c" strokeWidth="3"/>
     <path d="M-39-15Q0-23 36-13L30 2H-32Z" fill="#d8ad72" strokeWidth="3"/>
     <path d="M-18-55v31M0-58v33M18-57v31" stroke="#e5c18f" strokeWidth="5"/>
     <path d="M-30 0l-13 66M30 0l12 66" stroke="#8b6948" strokeWidth="6"/>
     <path d="M-25-3Q0-10 25-3" stroke="#f2e0b8" strokeWidth="5"/>
    </g>)}
   {/* Low coffee tables and a few freshly served juices */}
   {[610,956].map((x,i)=><g key={i} transform={`translate(${x} ${i?727:710})`}>
    <ellipse cx="0" cy="68" rx="106" ry="11" fill="#9e9b6e" stroke="none" opacity=".18"/>
    <path d="M-60-9l-15 79M60-9l14 79" fill="none" stroke="#9d754d" strokeWidth="9"/>
    <ellipse cx="0" cy="-6" rx="110" ry="28" fill="#d8b080" strokeWidth="4"/>
    <ellipse cx="0" cy="-14" rx="102" ry="19" fill="#f3d9a8" strokeWidth="2"/>
    {[[-21,"#eaaa59"],[25,"#9abf80"]].map(([dx,col],j)=><g key={j} transform={`translate(${dx} -49)`}>
      <path d="M-13-18h28l-4 43H-9Z" fill={col as string} strokeWidth="2"/>
      <path d="M1-18L12-43" stroke="#f5efcf" strokeWidth="3"/>
      <ellipse cx="0" cy="-18" rx="14" ry="4" fill="#fff1d6" stroke="none"/>
     </g>)}
   </g>)}
  </g>
  {/* One tiny customer strolls softly through the illustrated storefront. */}
  <g className="ve2d-walker" stroke={ink} strokeWidth="3.1" strokeLinejoin="round">
   <ellipse cx="101" cy="732" rx="24" ry="5" fill="#aa9a73" opacity=".17" stroke="none"/>
   <path d="M94 717L88 746M109 717L115 746" stroke="#8b9e7f" strokeWidth="9"/>
   <path d="M77 689Q101 676 121 692L115 723H88Z" fill="#d5b69b"/>
   <path d="M83 700L70 720M119 698l13 16" stroke="#e2b99d" strokeWidth="8"/>
   <ellipse cx="102" cy="665" rx="19" ry="22" fill="#ecc7a7"/>
   <path d="M82 665Q77 634 99 638Q126 635 122 662Q106 654 82 665Z" fill="#5e5948"/>
   <circle cx="96" cy="669" r="2.5" fill={ink} stroke="none"/>
   <circle cx="109" cy="669" r="2.5" fill={ink} stroke="none"/>
  </g>
  {/* Floor pots, fallen leaves and a gentle wandering animal */}
  <path d="M1202 659h81l-9 59h-60Z" fill="#d2b18c" stroke={ink} strokeWidth="3"/>
  <g fill="#7c9e6f">{Array.from({length:5},(_,i)=><ellipse key={i} cx={1240+(i-2)*9} cy={647-(i%2)*20} rx="16" ry="27" transform={`rotate(${i*19-40} ${1240+(i-2)*9} ${647-(i%2)*20})`}/>)}</g>
  <g className="ve2d-dog" stroke={ink} strokeWidth="3.5" strokeLinejoin="round">
   <ellipse cx="972" cy="707" rx="74" ry="11" fill="#9d8d68" stroke="none" opacity=".22"/>
   <path d="M910 687Q905 661 936 655Q961 650 973 664Q1003 658 1006 682L996 708H919Z" fill="#f8e9ca"/>
   <ellipse cx="925" cy="660" rx="26" ry="29" fill="#f5e2bd"/>
   <ellipse cx="985" cy="658" rx="20" ry="25" fill="#f5e2bd"/>
   <ellipse cx="945" cy="676" rx="39" ry="24" fill="#f8e9ca"/>
   <path d="M945 669q13 12 24 0" strokeWidth="3" fill="none"/>
   <circle cx="925" cy="665" r="3.5" fill={ink} stroke="none"/>
   <circle cx="979" cy="664" r="3.5" fill={ink} stroke="none"/>
   <ellipse cx="952" cy="681" rx="5" ry="3" fill="#b88475" stroke="none"/>
   <path d="M929 705v8M983 705v8" strokeWidth="8"/>
  </g>
  <g fill="#a6aa70" opacity=".72">
   {Array.from({length:14},(_,i)=><ellipse key={i} cx={40+i*101} cy={734+(i%3)*15} rx="11" ry="3"
      transform={`rotate(${i*21} ${40+i*101} ${734+(i%3)*15})`}/>)}
  </g>
  <text x="76" y="785" fill="#7f8c6e" fontSize="18" fontFamily="Georgia,serif" fontStyle="italic">Một buổi sáng ở Vườn Ép ✿</text>
 </svg>;
}
