import { useState, useRef } from "react";

const THIS_YEAR = 2026;
const YEARS = [2024, 2025, 2026];

const USERS = [
  { empId:"10001", birth:"19850312", name:"김민준", dept:"개발팀", role:"worker" },
  { empId:"10002", birth:"19900522", name:"이수연", dept:"HR부",   role:"worker" },
  { empId:"admin", birth:"19800101", name:"홍관리", dept:"HR부",   role:"admin"  },
];

const INIT_DEPS_BY_EMP = { "10001":[], "10002":[] };

const NHIS_DEPS_BY_EMP = {
  "10001":[
    {id:"n1",name:"김영희",rel:"배우자",birth:"1985.03.12",acquired:"2015.06.01"},
    {id:"n2",name:"김서준",rel:"자녀",  birth:"2012.09.22",acquired:"2012.09.22"},
    {id:"n3",name:"김민재",rel:"자녀",  birth:"2015.04.11",acquired:"2015.04.11"},
  ],
  "10002":[
    {id:"n4",name:"이준호",rel:"배우자",birth:"1988.07.11",acquired:"2018.03.01"},
    {id:"n5",name:"이정숙",rel:"부모",  birth:"1955.09.20",acquired:"2020.06.15"},
  ],
};

const MOCK_SCRAPED_BY_EMP = {
  "10001":[
    {id:"s1",date:"2026-01-20",hospital:"서울대학교병원", dept:"정형외과",  disease:"추간판장애",   diseaseCode:"M51",amount:320000,type:"병원",targetName:"김민준",isHospital:true, room:"2"},
    {id:"s2",date:"2026-01-21",hospital:"서울대학교병원", dept:"정형외과",  disease:"추간판장애",   diseaseCode:"M51",amount:180000,type:"병원",targetName:"김민준",isHospital:true, room:"2"},
    {id:"s3",date:"2026-01-05",hospital:"연세세브란스병원",dept:"호흡기내과",disease:"급성기관지염", diseaseCode:"J20",amount:54000, type:"병원",targetName:"김민준",isHospital:false},
    {id:"s4",date:"2026-01-05",hospital:"연세세브란스병원",dept:"호흡기내과",disease:"급성기관지염", diseaseCode:"J20",amount:32000, type:"병원",targetName:"김영희(배우자)",isHospital:false},
    {id:"s5",date:"2025-12-15",hospital:"강남구보건소",   dept:"내과",     disease:"독감",        diseaseCode:"J11",amount:8000,  type:"병원",targetName:"김서준(자녀)",isHospital:false},
  ],
  "10002":[
    {id:"s6",date:"2026-01-12",hospital:"한양대학교병원",dept:"소화기내과",disease:"위염",diseaseCode:"K29",amount:89000,type:"병원",targetName:"이수연",isHospital:false},
    {id:"s7",date:"2026-01-12",hospital:"온누리약국",    dept:"-",       disease:"위염",diseaseCode:"K29",amount:28000,type:"약국",targetName:"이수연",isHospital:false},
  ],
};

const INIT_CLAIMS = [
  {id:1,empId:"10001",name:"김민준",dept:"개발팀",year:2026,q:"1분기",period:"2026.01.05~01.07",disease:"급성기관지염(J20)",requested:154000,approved:134000,status:"지급완료",bank:"확인완료",supplementNote:"",docs:["진료비 계산서 원본","진단서 원본"],target:"김민준",targetRel:"본인"},
  {id:2,empId:"10002",name:"이수연",dept:"HR부",  year:2026,q:"1분기",period:"2026.01.12~01.12",disease:"위염(K29)",        requested:89000, approved:null,  status:"보완요청",bank:"미확인", supplementNote:"진단서 원본 미제출입니다. 질병분류코드가 기재된 진단서 원본을 추가 제출해 주세요.",docs:["진료비 계산서 원본"],target:"이수연",targetRel:"본인"},
  {id:3,empId:"10001",name:"김민준",dept:"개발팀",year:2026,q:"1분기",period:"2026.01.20~01.25",disease:"추간판장애(M51)",  requested:420000,approved:210000,status:"예외검토",bank:"미확인", supplementNote:"",docs:["진료비 계산서 원본","진단서 원본","약제비 계산서 원본","처방전 사본"],target:"김민준",targetRel:"본인"},
  {id:4,empId:"10002",name:"이수연",dept:"HR부",  year:2025,q:"4분기",period:"2025.11.03~11.03",disease:"고혈압(I10)",      requested:67000, approved:67000, status:"지급완료",bank:"확인완료",supplementNote:"",docs:["진료비 계산서 원본","진단서 원본"],target:"이수연",targetRel:"본인"},
  {id:5,empId:"10001",name:"김민준",dept:"개발팀",year:2025,q:"4분기",period:"2025.10.15~10.15",disease:"알레르기비염(J30)",requested:45000, approved:45000, status:"지급완료",bank:"확인완료",supplementNote:"",docs:["진료비 계산서 원본"],target:"김민준",targetRel:"본인"},
  {id:6,empId:"10001",name:"김민준",dept:"개발팀",year:2026,q:"1분기",period:"2026.01.05~01.07",disease:"급성기관지염(J20)",requested:54000, approved:null,  status:"심사중",  bank:"미확인", supplementNote:"",docs:["진료비 계산서 원본","건강보험 자격확인서"],target:"김영희",targetRel:"배우자"},
  {id:7,empId:"10001",name:"김민준",dept:"개발팀",year:2026,q:"1분기",period:"2025.12.15~12.15",disease:"독감(J11)",        requested:8000,  approved:null,  status:"심사중",  bank:"미확인", supplementNote:"",docs:["진료비 계산서 원본","건강보험 자격확인서"],target:"김서준",targetRel:"자녀"},
  {id:8,empId:"10002",name:"이수연",dept:"HR부",  year:2026,q:"1분기",period:"2026.01.12~01.12",disease:"위염(K29)",        requested:28000, approved:null,  status:"심사중",  bank:"미확인", supplementNote:"",docs:["약제비 계산서 원본","처방전 사본"],target:"이수연",targetRel:"본인"},
];

const STATUSES = ["심사중","보완요청","예외검토","지급예정","지급완료","반려"];
const STATUS_COLOR = {"심사중":"bg-yellow-100 text-yellow-700","보완요청":"bg-orange-100 text-orange-600","예외검토":"bg-red-100 text-red-600","지급예정":"bg-blue-100 text-blue-700","지급완료":"bg-green-100 text-green-700","반려":"bg-gray-100 text-gray-500"};
const REL_COLOR = {"배우자":"bg-pink-100 text-pink-700","자녀":"bg-blue-100 text-blue-700","부모":"bg-purple-100 text-purple-700","배우자부모":"bg-indigo-100 text-indigo-700","본인":"bg-green-100 text-green-700"};
const TARGET_COLOR = {"본인":"bg-green-100 text-green-700","배우자":"bg-pink-100 text-pink-700","자녀":"bg-blue-100 text-blue-700","부모":"bg-purple-100 text-purple-700","배우자부모":"bg-indigo-100 text-indigo-700"};

const initPeriodsByYear = {
  2026:[{q:"1분기",start:"2026-01-01",end:"2026-03-31",deadline:"2026-04-07",active:true},{q:"2분기",start:"2026-04-01",end:"2026-06-30",deadline:"2026-07-07",active:false},{q:"3분기",start:"2026-07-01",end:"2026-09-30",deadline:"2026-10-07",active:false},{q:"4분기",start:"2026-10-01",end:"2026-12-31",deadline:"2026-12-07",active:false}],
  2025:[{q:"1분기",start:"2025-01-01",end:"2025-03-31",deadline:"2025-04-07",active:false},{q:"2분기",start:"2025-04-01",end:"2025-06-30",deadline:"2025-07-07",active:false},{q:"3분기",start:"2025-07-01",end:"2025-09-30",deadline:"2025-10-07",active:false},{q:"4분기",start:"2025-10-01",end:"2025-12-31",deadline:"2025-12-07",active:false}],
  2024:[{q:"1분기",start:"2024-01-01",end:"2024-03-31",deadline:"2024-04-07",active:false},{q:"2분기",start:"2024-04-01",end:"2024-06-30",deadline:"2024-07-07",active:false},{q:"3분기",start:"2024-07-01",end:"2024-09-30",deadline:"2024-10-07",active:false},{q:"4분기",start:"2024-10-01",end:"2024-12-31",deadline:"2024-12-07",active:false}],
};

const CRITERIA_TEXT = `[의료비 지원 기준]
지급대상: 본인, 배우자, 자녀, 건강보험 피부양자 등재 부모
지원한도: 연간 1천만원 (질병당 최대 10년 수혜) / 최초 신청 시 20만원 공제
전액지원: 급여 항목 본인부담금, 마취료, 검사·영상진단·수술료 등
전액미지원: 진찰료, 식대, 투약조제료, 주사료, 재활물리치료, 보철교정료
1인실: 해당병원 2인실 기준 지원 (없으면 1일 10만원)
50% 지원: 맘모툼, 경막성형술, 하지정맥류, 로봇수술
미지원 과목: 성형외과, 치과, 피부과, 요양병원 비급여
약국: 약제비 계산서 원본 + 처방전 사본 필수 / 처방전 없는 일반의약품 불가`;

// ── 공통 컴포넌트 ─────────────────────────────────────────
const Badge = ({label,color}) => <span className={`text-xs px-2 py-0.5 rounded-full ${color}`}>{label}</span>;
const Toast = ({msg}) => msg ? <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-white px-5 py-2 rounded-full z-50 text-xs shadow-lg">{msg}</div> : null;
const YearSelector = ({year,setYear}) => (
  <div className="flex gap-1">{YEARS.map(y=><button key={y} onClick={()=>setYear(y)} className={`text-xs px-3 py-1.5 rounded-lg font-medium border ${year===y?"text-white":"text-gray-500 border-gray-200 bg-white"}`} style={year===y?{background:"#1a5c3a"}:{}}>{y}년</button>)}</div>
);

// ── AI 지원기준 패널 ──────────────────────────────────────
function CriteriaPanel({onClose}) {
  const [q,setQ]=useState("");
  const [ans,setAns]=useState("");
  const [loading,setLoading]=useState(false);
  const ask = async () => {
    if(!q.trim()) return;
    setLoading(true); setAns("");
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:800,system:`의료비 지원 담당자입니다. 아래 기준으로 간결하게 답변하세요.\n${CRITERIA_TEXT}`,messages:[{role:"user",content:q}]})});
      const d = await res.json();
      setAns(d.content?.[0]?.text||"답변을 불러오지 못했습니다.");
    } catch { setAns("오류가 발생했습니다."); }
    setLoading(false);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-end justify-center">
      <div className="bg-white rounded-t-2xl w-full max-w-lg p-5 space-y-3 max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center">
          <div><div className="font-bold">📋 의료비 지원기준 AI 안내</div><div className="text-xs text-gray-400 mt-0.5">궁금한 지원기준을 질문하세요</div></div>
          <button onClick={onClose} className="text-gray-400 text-xl">✕</button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2">
          <div className="bg-gray-50 rounded-xl p-3 text-xs space-y-1">
            <div className="font-semibold text-gray-700 mb-1">빠른 질문</div>
            {["약국 비용도 지원되나요?","1인실 입원비 지원 기준은?","피부과 치료 지원 여부","처방전 없는 약은?","부모님 의료비 신청 방법"].map(ex=>(
              <button key={ex} onClick={()=>setQ(ex)} className="block w-full text-left px-3 py-1.5 bg-white rounded-lg border hover:border-green-400 hover:text-green-700 transition-colors">{ex}</button>
            ))}
          </div>
          {ans&&<div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{ans}</div>}
        </div>
        <div className="flex gap-2">
          <input className="flex-1 border rounded-lg px-3 py-2 text-xs" placeholder="질문 입력..." value={q} onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&ask()}/>
          <button onClick={ask} disabled={loading} className="px-4 py-2 rounded-lg text-white text-xs font-medium" style={{background:"#1a5c3a",opacity:loading?.7:1}}>{loading?"…":"질문"}</button>
        </div>
      </div>
    </div>
  );
}

// ── 전자서명 패드 ─────────────────────────────────────────
function SignaturePad({name,onSign,signed}) {
  const [drawing,setDrawing]=useState(false);
  const [strokes,setStrokes]=useState([]);
  const svgRef=useRef(null);
  const getPos=e=>{const r=svgRef.current.getBoundingClientRect();const src=e.touches?e.touches[0]:e;return{x:src.clientX-r.left,y:src.clientY-r.top};};
  const start=e=>{e.preventDefault();setDrawing(true);setStrokes(s=>[...s,{pts:[getPos(e)]}]);};
  const move=e=>{e.preventDefault();if(!drawing)return;const p=getPos(e);setStrokes(s=>{const n=[...s];n[n.length-1]={...n[n.length-1],pts:[...n[n.length-1].pts,p]};return n;});};
  const end=()=>setDrawing(false);
  const toPath=pts=>pts.length<2?"":`M ${pts[0].x} ${pts[0].y} `+pts.slice(1).map(p=>`L ${p.x} ${p.y}`).join(" ");
  if(signed) return <div className="border-2 border-green-400 rounded-xl p-3 text-center bg-green-50"><div className="text-green-700 font-medium text-sm">✅ 서명 완료</div><div className="text-xs text-gray-400 mt-0.5">{name}</div></div>;
  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500">서명란 (손가락 또는 마우스로 서명)</div>
      <div className="border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
        <svg ref={svgRef} width="100%" height="100" className="touch-none cursor-crosshair" onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end} onTouchStart={start} onTouchMove={move} onTouchEnd={end}>
          {strokes.map((s,i)=><path key={i} d={toPath(s.pts)} stroke="#1a5c3a" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>)}
          {strokes.length===0&&<text x="50%" y="55%" textAnchor="middle" fill="#ccc" fontSize="13">여기에 서명하세요</text>}
        </svg>
      </div>
      <div className="flex gap-2">
        <button onClick={()=>{setStrokes([]);onSign(false);}} className="flex-1 py-2 rounded-lg border text-xs text-gray-500">다시 서명</button>
        <button onClick={()=>{if(strokes.length>0)onSign(true);}} disabled={strokes.length===0} className="flex-1 py-2 rounded-lg text-white text-xs font-medium" style={{background:"#1a5c3a",opacity:strokes.length>0?1:.5}}>서명 확인</button>
      </div>
    </div>
  );
}

// ── 수기 항목 추가 폼 ─────────────────────────────────────
function ManualAddForm({onAdd,onCancel}) {
  const [f,setF]=useState({disease:"",diseaseCode:"",date:"",hospital:"",dept:"",amount:"",type:"병원",isHospital:false,room:"2"});
  const ok=f.disease&&f.date&&f.amount;
  return (
    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 space-y-3">
      <div className="text-xs font-semibold text-blue-700">✏️ 직접 입력 — 연동되지 않은 항목 추가</div>
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2"><label className="text-xs text-gray-500">병명 *</label><input className="w-full border rounded-lg px-3 py-2 text-xs mt-0.5" placeholder="예: 급성기관지염" value={f.disease} onChange={e=>setF({...f,disease:e.target.value})}/></div>
        <div><label className="text-xs text-gray-500">질병분류코드</label><input className="w-full border rounded-lg px-3 py-2 text-xs mt-0.5" placeholder="예: J20" value={f.diseaseCode} onChange={e=>setF({...f,diseaseCode:e.target.value})}/></div>
        <div><label className="text-xs text-gray-500">진료일 *</label><input type="date" className="w-full border rounded-lg px-3 py-2 text-xs mt-0.5" value={f.date} onChange={e=>setF({...f,date:e.target.value})}/></div>
        <div><label className="text-xs text-gray-500">병원/약국명</label><input className="w-full border rounded-lg px-3 py-2 text-xs mt-0.5" placeholder="예: 서울병원" value={f.hospital} onChange={e=>setF({...f,hospital:e.target.value})}/></div>
        <div><label className="text-xs text-gray-500">진료과</label><input className="w-full border rounded-lg px-3 py-2 text-xs mt-0.5" placeholder="예: 내과" value={f.dept} onChange={e=>setF({...f,dept:e.target.value})}/></div>
        <div className="col-span-2"><label className="text-xs text-gray-500">본인 납부금액 (원) *</label><input type="number" className="w-full border rounded-lg px-3 py-2 text-xs mt-0.5" placeholder="실제 납부한 금액" value={f.amount} onChange={e=>setF({...f,amount:e.target.value})}/></div>
        <div className="col-span-2">
          <label className="text-xs text-gray-500">구분</label>
          <div className="flex gap-2 mt-0.5">
            {[{v:"병원",l:"🏥 병원"},{v:"약국",l:"💊 약국"}].map(o=>(
              <button key={o.v} onClick={()=>setF({...f,type:o.v})} className={`flex-1 py-2 rounded-lg border text-xs ${f.type===o.v?"text-white":"border-gray-200 text-gray-600"}`} style={f.type===o.v?{background:"#1a5c3a"}:{}}>{o.l}</button>
            ))}
          </div>
        </div>
        {f.type==="병원"&&<div className="col-span-2">
          <label className="text-xs text-gray-500">입원 여부</label>
          <div className="flex gap-2 mt-0.5">
            {[{v:false,l:"외래"},{v:true,l:"입원"}].map(o=>(
              <button key={String(o.v)} onClick={()=>setF({...f,isHospital:o.v})} className={`flex-1 py-2 rounded-lg border text-xs ${f.isHospital===o.v?"text-white":"border-gray-200 text-gray-600"}`} style={f.isHospital===o.v?{background:"#1a5c3a"}:{}}>{o.l}</button>
            ))}
          </div>
          {f.isHospital&&<div className="flex gap-2 mt-1">{[{v:"1",l:"1인실"},{v:"2",l:"2인실 이하"}].map(o=><button key={o.v} onClick={()=>setF({...f,room:o.v})} className={`flex-1 py-1.5 rounded-lg border text-xs ${f.room===o.v?"text-white":"border-gray-200 text-gray-600"}`} style={f.room===o.v?{background:"#1a5c3a"}:{}}>{o.l}</button>)}</div>}
        </div>}
      </div>
      <div className="flex gap-2">
        <button onClick={()=>{if(ok)onAdd({...f,id:`m_${Date.now()}`,amount:Number(f.amount),isManual:true});}} disabled={!ok} className="flex-1 py-2 rounded-lg text-white text-xs font-medium" style={{background:"#1a5c3a",opacity:ok?1:.5}}>추가</button>
        <button onClick={onCancel} className="flex-1 py-2 rounded-lg border text-xs text-gray-500">취소</button>
      </div>
    </div>
  );
}

// ── 신청 폼 ───────────────────────────────────────────────
function ApplicationForm({user,deps,onComplete,supplementNote="",isResubmit=false}) {
  const SCRAPED = MOCK_SCRAPED_BY_EMP[user.empId]||[];
  const [step,setStep]=useState(1);
  const [inputMode,setInputMode]=useState("");
  const [scraping,setScraping]=useState(false);
  const [scrapeDone,setScrapeDone]=useState(false);
  const [showCriteria,setShowCriteria]=useState(false);
  const [signed,setSigned]=useState(false);
  const [selectedIds,setSelectedIds]=useState(new Set());
  const [showManualAdd,setShowManualAdd]=useState(false);
  const [extraItems,setExtraItems]=useState([]);
  const [insuranceAmt,setInsuranceAmt]=useState("");
  const [isFirstClaim,setIsFirstClaim]=useState("yes");
  const [docs,setDocs]=useState({hasMedicalBill:false,hasDiagnosis:false,hasPharmacyBill:false,hasPrescription:false,hasDepCert:false});
  const [mf,setMf]=useState({startDate:"",endDate:"",targetId:"self",disease:"",diseaseCode:"",isHospital:"no",hospitalRoom:"",clinicAmt:"",pharmacyAmt:"",insuranceAmt:"",isFirstClaim:"yes"});

  const dset=(k,v)=>setDocs(d=>({...d,[k]:v}));
  const mfset=(k,v)=>setMf(f=>({...f,[k]:v}));
  const toggleSelect=id=>setSelectedIds(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});

  const targetList=[{id:"self",name:user.name,rel:"본인"},...(deps||[]).filter(d=>d.status==="유효"||d.status==="등록완료").map(d=>({id:String(d.id),name:d.name,rel:d.rel}))];
  const allItems=[...SCRAPED,...extraItems];
  const selectedItems=allItems.filter(it=>selectedIds.has(it.id));
  const hospitalItems=selectedItems.filter(it=>it.type==="병원");
  const pharmacyItems=selectedItems.filter(it=>it.type==="약국");
  const hasPharmacy=pharmacyItems.length>0;
  const clinicTotal=hospitalItems.reduce((s,it)=>s+it.amount,0);
  const pharmacyTotal=pharmacyItems.reduce((s,it)=>s+it.amount,0);
  const grandTotal=clinicTotal+pharmacyTotal-(Number(insuranceAmt)||0);
  const expectedPay=Math.max(0,grandTotal-(isFirstClaim==="yes"?200000:0));
  const mfTotal=(Number(mf.clinicAmt)||0)+(Number(mf.pharmacyAmt)||0)-(Number(mf.insuranceAmt)||0);
  const mfExpected=Math.max(0,mfTotal-(mf.isFirstClaim==="yes"?200000:0));
  const needFirstClaim=inputMode==="manual"?mf.isFirstClaim==="yes":isFirstClaim==="yes";

  const STEP_LABELS=inputMode==="manual"?["수집방법","기본정보","금액입력","서류첨부","서명완료"]:["수집방법","연동결과","추가입력","서류첨부","서명완료"];

  return (
    <div className="space-y-4">
      {showCriteria&&<CriteriaPanel onClose={()=>setShowCriteria(false)}/>}
      {isResubmit&&supplementNote&&(
        <div className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
          <div className="flex items-center gap-2 font-semibold text-orange-700 text-sm">⚠ 보완 요청 사항</div>
          <p className="text-xs text-orange-700 mt-1 leading-relaxed">{supplementNote}</p>
        </div>
      )}
      <button onClick={()=>setShowCriteria(true)} className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-700">
        <span>📋 의료비 지원기준 확인</span><span>→</span>
      </button>

      {/* 스텝 인디케이터 */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {STEP_LABELS.map((l,i)=>{const s=i+1;return(
          <div key={s} className="flex items-center gap-1 shrink-0">
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${step>=s?"text-white":"bg-gray-200 text-gray-400"}`} style={step>=s?{background:"#1a5c3a"}:{}}>{s}</div>
            <span className={`text-xs whitespace-nowrap ${step>=s?"text-green-700 font-medium":"text-gray-400"}`}>{l}</span>
            {s<5&&<div className="w-3 h-px bg-gray-200"/>}
          </div>
        );})}
      </div>

      {/* STEP 1 */}
      {step===1&&<div className="space-y-3">
        <div className="text-sm font-semibold text-gray-700">진료 내역 수집 방법</div>
        <div className="bg-gray-50 rounded-xl p-3 text-xs text-gray-500 space-y-1">
          <div className="font-medium text-gray-600">💡 이렇게 이용하세요</div>
          <div>① <span className="text-green-700 font-medium">자동 연동</span> — 진료내역을 가져온 후 신청할 항목을 직접 선택합니다.</div>
          <div>② <span className="text-blue-700 font-medium">직접 입력</span> — 연동이 어렵거나 약국비 등 별도 항목만 있을 때 사용합니다.</div>
        </div>
        {[{mode:"auto",icon:"🔗",title:"건강보험공단 자동 연동",desc:"간편인증으로 진료내역 자동 수집 후 신청 항목 선택",tag:"추천"},{mode:"manual",icon:"✏️",title:"직접 입력",desc:"연동 없이 직접 병명·금액·서류를 입력",tag:null}].map(o=>(
          <button key={o.mode} onClick={()=>setInputMode(o.mode)} className={`w-full text-left p-4 rounded-xl border-2 transition-all ${inputMode===o.mode?"border-green-500 bg-green-50":"border-gray-200 bg-white"}`}>
            <div className="flex items-center justify-between">
              <div className={`text-sm font-medium ${inputMode===o.mode?"text-green-700":"text-gray-700"}`}>{o.icon} {o.title}</div>
              {o.tag&&<span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">{o.tag}</span>}
            </div>
            <div className="text-xs text-gray-400 mt-0.5">{o.desc}</div>
          </button>
        ))}
        {inputMode==="auto"&&<button onClick={()=>{setScraping(true);setTimeout(()=>{setScraping(false);setScrapeDone(true);setStep(2);},1800);}} disabled={scraping} className="w-full py-3 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2" style={{background:"#1a5c3a",opacity:scraping?.7:1}}>
          {scraping?<><span>⏳</span><span>건강보험공단 연동 중...</span></>:"간편인증으로 연동 시작"}
        </button>}
        {inputMode==="manual"&&<button onClick={()=>setStep(2)} className="w-full py-3 rounded-lg text-white text-sm font-medium" style={{background:"#1a5c3a"}}>직접 입력 시작 →</button>}
      </div>}

      {/* STEP 2 — 자동 연동 결과 */}
      {step===2&&inputMode==="auto"&&<div className="space-y-3">
        <div><div className="text-sm font-semibold text-gray-700">연동된 진료내역</div><div className="text-xs text-gray-400 mt-0.5">신청할 항목에 체크하세요. 목록에 없으면 하단 '직접 추가'를 이용하세요.</div></div>
        <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-xs">
          <span className="text-green-600 font-bold">✅</span><span className="text-green-700 font-medium">연동 완료</span>
          <span className="text-green-600">— {SCRAPED.length}건 수집됨</span>
        </div>
        {/* 병원 */}
        {[...SCRAPED,...extraItems].filter(it=>it.type==="병원").length>0&&<>
          <div className="text-xs font-semibold text-gray-500 px-1">🏥 병원 진료내역</div>
          {[...SCRAPED,...extraItems].filter(it=>it.type==="병원").map(it=>(
            <div key={it.id} onClick={()=>toggleSelect(it.id)} className={`bg-white rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedIds.has(it.id)?"border-green-500 bg-green-50":"border-gray-200"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedIds.has(it.id)?"border-green-500 bg-green-500":"border-gray-300"}`}>{selectedIds.has(it.id)&&<span className="text-white text-xs">✓</span>}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div><span className="text-xs font-semibold text-gray-700">{it.disease}</span>{it.diseaseCode&&<span className="text-xs text-gray-400 ml-1">({it.diseaseCode})</span>}{it.isManual&&<span className="text-xs ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">직접입력</span>}</div>
                    <span className={`text-xs font-bold ${selectedIds.has(it.id)?"text-green-700":"text-gray-600"}`}>{it.amount.toLocaleString()}원</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{it.date} · {it.hospital}{it.dept&&it.dept!=="-"?` · ${it.dept}`:""}</div>
                  <div className="flex gap-1 mt-1 flex-wrap">
                    <Badge label={it.targetName} color="bg-gray-100 text-gray-500"/>
                    <Badge label={it.isHospital?"입원":"외래"} color={it.isHospital?"bg-purple-100 text-purple-600":"bg-blue-100 text-blue-600"}/>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </>}
        {/* 약국 */}
        {[...SCRAPED,...extraItems].filter(it=>it.type==="약국").length>0&&<>
          <div className="text-xs font-semibold text-gray-500 px-1">💊 약국 내역</div>
          {[...SCRAPED,...extraItems].filter(it=>it.type==="약국").map(it=>(
            <div key={it.id} onClick={()=>toggleSelect(it.id)} className={`bg-white rounded-xl border-2 p-3 cursor-pointer transition-all ${selectedIds.has(it.id)?"border-orange-400 bg-orange-50":"border-gray-200"}`}>
              <div className="flex items-start gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${selectedIds.has(it.id)?"border-orange-500 bg-orange-400":"border-gray-300"}`}>{selectedIds.has(it.id)&&<span className="text-white text-xs">✓</span>}</div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div><span className="text-xs font-semibold text-gray-700">{it.disease}</span>{it.isManual&&<span className="text-xs ml-1 bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full">직접입력</span>}</div>
                    <span className={`text-xs font-bold ${selectedIds.has(it.id)?"text-orange-600":"text-gray-600"}`}>{it.amount.toLocaleString()}원</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{it.date} · {it.hospital}</div>
                  <div className="mt-1"><Badge label={it.targetName} color="bg-gray-100 text-gray-500"/></div>
                  {selectedIds.has(it.id)&&<div className="mt-1.5 bg-orange-100 rounded-lg px-2 py-1 text-xs text-orange-700">📎 약제비 계산서 + 처방전 사본 첨부 필요</div>}
                </div>
              </div>
            </div>
          ))}
        </>}
        {/* 직접 추가 */}
        <div className="border-t pt-3">
          <div className="flex items-center justify-between mb-2">
            <div><div className="text-xs font-semibold text-gray-600">연동 목록에 없는 항목 추가</div><div className="text-xs text-gray-400">약국비, 비급여 등 연동되지 않은 항목</div></div>
            {!showManualAdd&&<button onClick={()=>setShowManualAdd(true)} className="text-xs px-3 py-1.5 rounded-lg text-white shrink-0" style={{background:"#1a5c3a"}}>+ 직접 추가</button>}
          </div>
          {showManualAdd&&<ManualAddForm onAdd={it=>{setExtraItems(e=>[...e,it]);setSelectedIds(s=>{const n=new Set(s);n.add(it.id);return n;});setShowManualAdd(false);}} onCancel={()=>setShowManualAdd(false)}/>}
        </div>
        {selectedIds.size>0&&<div className="bg-green-50 border border-green-200 rounded-xl p-3 text-xs space-y-1">
          <div className="font-semibold text-gray-700">선택한 항목 요약</div>
          {clinicTotal>0&&<div className="flex justify-between text-gray-600"><span>병원 진료비 ({hospitalItems.length}건)</span><span>{clinicTotal.toLocaleString()}원</span></div>}
          {pharmacyTotal>0&&<div className="flex justify-between text-gray-600"><span>약국비 ({pharmacyItems.length}건)</span><span>{pharmacyTotal.toLocaleString()}원</span></div>}
          <div className="border-t pt-1 flex justify-between font-bold text-green-700"><span>합계</span><span>{(clinicTotal+pharmacyTotal).toLocaleString()}원</span></div>
        </div>}
        <div className="flex gap-2">
          <button onClick={()=>setStep(1)} className="flex-1 py-3 rounded-lg border text-sm text-gray-500">← 이전</button>
          <button onClick={()=>setStep(3)} disabled={selectedIds.size===0} className="flex-1 py-3 rounded-lg text-white font-medium text-sm" style={{background:"#1a5c3a",opacity:selectedIds.size>0?1:.5}}>다음 ({selectedIds.size}건) →</button>
        </div>
      </div>}

      {/* STEP 2 — 직접 입력 */}
      {step===2&&inputMode==="manual"&&<div className="space-y-3">
        <div className="text-sm font-semibold text-gray-700">진료 정보 직접 입력</div>
        <div className="bg-white rounded-xl p-4 border shadow-sm space-y-2">
          <div className="text-xs font-semibold text-gray-600">📅 진료기간</div>
          <div className="flex gap-2 items-center">
            <div className="flex-1"><div className="text-xs text-gray-400 mb-1">첫 진료일</div><input type="date" className="w-full border rounded-lg px-3 py-2 text-xs" value={mf.startDate} onChange={e=>mfset("startDate",e.target.value)}/></div>
            <div className="text-gray-300 mt-5">~</div>
            <div className="flex-1"><div className="text-xs text-gray-400 mb-1">마지막 진료일</div><input type="date" className="w-full border rounded-lg px-3 py-2 text-xs" value={mf.endDate} onChange={e=>mfset("endDate",e.target.value)}/></div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm space-y-2">
          <div className="text-xs font-semibold text-gray-600">👤 지급대상자</div>
          {targetList.map(t=>(
            <button key={t.id} onClick={()=>mfset("targetId",t.id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-xs transition-all ${mf.targetId===t.id?"border-green-500 bg-green-50":"border-gray-200"}`}>
              <div className="flex items-center gap-2"><span className={`font-medium ${mf.targetId===t.id?"text-green-700":"text-gray-700"}`}>{t.name}</span><Badge label={t.rel} color={REL_COLOR[t.rel]||"bg-gray-100 text-gray-500"}/></div>
              {mf.targetId===t.id&&<span className="text-green-500">✓</span>}
            </button>
          ))}
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm space-y-2">
          <div className="text-xs font-semibold text-gray-600">🏥 병명 / 질병분류코드</div>
          <input className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="병명 (예: 급성기관지염)" value={mf.disease} onChange={e=>mfset("disease",e.target.value)}/>
          <input className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="질병분류코드 (예: J20)" value={mf.diseaseCode} onChange={e=>mfset("diseaseCode",e.target.value)}/>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm space-y-2">
          <div className="text-xs font-semibold text-gray-600">🛏 입원 여부</div>
          <div className="flex gap-2">{[{v:"no",l:"외래"},{v:"yes",l:"입원"}].map(o=><button key={o.v} onClick={()=>mfset("isHospital",o.v)} className={`flex-1 py-2 rounded-lg border text-xs ${mf.isHospital===o.v?"text-white":"border-gray-200 text-gray-600"}`} style={mf.isHospital===o.v?{background:"#1a5c3a"}:{}}>{o.l}</button>)}</div>
          {mf.isHospital==="yes"&&<div className="flex gap-2">{[{v:"1",l:"1인실"},{v:"2",l:"2인실 이하"}].map(o=><button key={o.v} onClick={()=>mfset("hospitalRoom",o.v)} className={`flex-1 py-2 rounded-lg border text-xs ${mf.hospitalRoom===o.v?"text-white":"border-gray-200 text-gray-600"}`} style={mf.hospitalRoom===o.v?{background:"#1a5c3a"}:{}}>{o.l}</button>)}</div>}
        </div>
        <button onClick={()=>{if(!mf.startDate||!mf.disease)return;setStep(3);}} className="w-full py-3 rounded-lg text-white font-medium text-sm" style={{background:"#1a5c3a"}}>다음 →</button>
      </div>}

      {/* STEP 3 — 자동: 추가입력 */}
      {step===3&&inputMode==="auto"&&<div className="space-y-3">
        <div><div className="text-sm font-semibold text-gray-700">추가 입력</div><div className="text-xs text-gray-400 mt-0.5">보험금 수령액, 최초 신청 여부를 입력하세요.</div></div>
        <div className="bg-gray-50 border rounded-xl p-3 text-xs">
          <div className="font-semibold text-gray-600 mb-2">✅ 선택한 항목 ({selectedItems.length}건)</div>
          {selectedItems.map(it=><div key={it.id} className="flex justify-between py-1 border-b last:border-0"><span className="text-gray-500">{it.date} · {it.disease} ({it.targetName})</span><span className="font-medium">{it.amount.toLocaleString()}원</span></div>)}
          <div className="flex justify-between font-bold text-green-700 pt-1.5 mt-0.5 border-t"><span>소계</span><span>{(clinicTotal+pharmacyTotal).toLocaleString()}원</span></div>
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm space-y-3">
          <div><div className="text-xs font-semibold text-gray-600 mb-1">🏦 보험금 수령액</div><input type="number" className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="실비보험 등 수령액 (없으면 0)" value={insuranceAmt} onChange={e=>setInsuranceAmt(e.target.value)}/><div className="text-xs text-gray-400 mt-1">실비보험 등으로 이미 수령한 금액을 입력하세요.</div></div>
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">최초 신청 여부</div>
            <div className="flex gap-2">{[{v:"yes",l:"최초 신청"},{v:"no",l:"2회차 이상"}].map(o=><button key={o.v} onClick={()=>setIsFirstClaim(o.v)} className={`flex-1 py-2 rounded-lg border text-xs ${isFirstClaim===o.v?"text-white":"border-gray-200 text-gray-600"}`} style={isFirstClaim===o.v?{background:"#1a5c3a"}:{}}>{o.l}</button>)}</div>
            {isFirstClaim==="yes"&&<div className="text-xs text-orange-600 bg-orange-50 border border-orange-200 rounded-lg p-2 mt-1">최초 신청 시 20만원이 공제됩니다.</div>}
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-xs space-y-1.5">
          <div className="font-semibold text-gray-700">💰 예상 지급액</div>
          {clinicTotal>0&&<div className="flex justify-between text-gray-500"><span>병원 진료비</span><span>{clinicTotal.toLocaleString()}원</span></div>}
          {pharmacyTotal>0&&<div className="flex justify-between text-gray-500"><span>약국비</span><span>{pharmacyTotal.toLocaleString()}원</span></div>}
          {Number(insuranceAmt)>0&&<div className="flex justify-between text-red-500"><span>보험금 차감</span><span>-{Number(insuranceAmt).toLocaleString()}원</span></div>}
          {isFirstClaim==="yes"&&<div className="flex justify-between text-red-500"><span>최초 20만원 공제</span><span>-200,000원</span></div>}
          <div className="border-t pt-1.5 flex justify-between font-bold text-green-700 text-sm"><span>예상 지급액</span><span>{expectedPay.toLocaleString()}원</span></div>
          <div className="text-gray-400">* 심사 후 실제 지급액은 변경될 수 있습니다</div>
        </div>
        <div className="flex gap-2"><button onClick={()=>setStep(2)} className="flex-1 py-3 rounded-lg border text-sm text-gray-500">← 이전</button><button onClick={()=>setStep(4)} className="flex-1 py-3 rounded-lg text-white font-medium text-sm" style={{background:"#1a5c3a"}}>다음 →</button></div>
      </div>}

      {/* STEP 3 — 수동: 금액입력 */}
      {step===3&&inputMode==="manual"&&<div className="space-y-3">
        <div className="text-sm font-semibold text-gray-700">납부 금액 입력</div>
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700">💡 비급여 포함 본인 실제 결제 금액만 입력하세요.</div>
        <div className="bg-white rounded-xl p-4 border shadow-sm space-y-3">
          <div><div className="text-xs font-semibold text-gray-600 mb-1">🏥 진료비 납부금액</div><input type="number" className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="진료비 계산서 본인 납부 금액 (원)" value={mf.clinicAmt} onChange={e=>mfset("clinicAmt",e.target.value)}/></div>
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">💊 약국 납부금액</div>
            <input type="number" className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="약제비 납부 금액 (없으면 0)" value={mf.pharmacyAmt} onChange={e=>mfset("pharmacyAmt",e.target.value)}/>
            {Number(mf.pharmacyAmt)>0&&<div className="mt-1 text-xs text-orange-600 bg-orange-50 border border-orange-100 rounded-lg p-2">📎 약제비 계산서 원본 + 처방전 사본 첨부 필요</div>}
          </div>
          <div><div className="text-xs font-semibold text-gray-600 mb-1">🏦 보험금 수령액</div><input type="number" className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="실비보험 등 수령액 (없으면 0)" value={mf.insuranceAmt} onChange={e=>mfset("insuranceAmt",e.target.value)}/></div>
          <div>
            <div className="text-xs font-semibold text-gray-600 mb-1">최초 신청 여부</div>
            <div className="flex gap-2">{[{v:"yes",l:"최초 신청"},{v:"no",l:"2회차 이상"}].map(o=><button key={o.v} onClick={()=>mfset("isFirstClaim",o.v)} className={`flex-1 py-2 rounded-lg border text-xs ${mf.isFirstClaim===o.v?"text-white":"border-gray-200 text-gray-600"}`} style={mf.isFirstClaim===o.v?{background:"#1a5c3a"}:{}}>{o.l}</button>)}</div>
          </div>
        </div>
        {(Number(mf.clinicAmt)+Number(mf.pharmacyAmt))>0&&<div className="bg-green-50 border border-green-200 rounded-xl p-4 text-xs space-y-1">
          <div className="font-semibold text-gray-700 mb-1">💰 예상 지급액</div>
          {Number(mf.clinicAmt)>0&&<div className="flex justify-between text-gray-500"><span>진료비</span><span>{Number(mf.clinicAmt).toLocaleString()}원</span></div>}
          {Number(mf.pharmacyAmt)>0&&<div className="flex justify-between text-gray-500"><span>약국비</span><span>{Number(mf.pharmacyAmt).toLocaleString()}원</span></div>}
          {Number(mf.insuranceAmt)>0&&<div className="flex justify-between text-red-500"><span>보험금 차감</span><span>-{Number(mf.insuranceAmt).toLocaleString()}원</span></div>}
          {mf.isFirstClaim==="yes"&&<div className="flex justify-between text-red-500"><span>최초 20만원 공제</span><span>-200,000원</span></div>}
          <div className="border-t pt-1 flex justify-between font-bold text-green-700"><span>예상 지급액</span><span>{mfExpected.toLocaleString()}원</span></div>
          <div className="text-gray-400">* 심사 후 실제 지급액은 변경될 수 있습니다</div>
        </div>}
        <div className="flex gap-2"><button onClick={()=>setStep(2)} className="flex-1 py-3 rounded-lg border text-sm text-gray-500">← 이전</button><button onClick={()=>setStep(4)} className="flex-1 py-3 rounded-lg text-white font-medium text-sm" style={{background:"#1a5c3a"}}>다음 →</button></div>
      </div>}

      {/* STEP 4 — 서류 첨부 */}
      {step===4&&<div className="space-y-3">
        <div><div className="text-sm font-semibold text-gray-700">서류 첨부</div><div className="text-xs text-gray-400 mt-0.5">필수 서류를 첨부해 주세요.</div></div>
        {[{key:"hasMedicalBill",label:"진료비 계산서 원본",required:true,note:"항목별 금액 기재된 원본",icon:"📄"},{key:"hasDiagnosis",label:"진단서 원본",required:needFirstClaim,note:needFirstClaim?"최초 신청 필수 — 질병명+질병코드 기재":"2회차 이상 생략 가능",icon:"📋"}].map(doc=>(
          <div key={doc.key} className={`bg-white rounded-xl p-4 border shadow-sm ${!docs[doc.key]&&doc.required?"border-red-200":docs[doc.key]?"border-green-300":""}`}>
            <div className="flex justify-between items-start mb-2">
              <div><div className="flex items-center gap-2"><span className="text-xs font-semibold text-gray-700">{doc.icon} {doc.label}</span>{doc.required?<Badge label="필수" color="bg-red-100 text-red-600"/>:<Badge label="해당시" color="bg-gray-100 text-gray-500"/>}</div><div className="text-xs text-gray-400 mt-0.5">{doc.note}</div></div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${docs[doc.key]?"border-green-500 bg-green-500":"border-gray-300"}`} onClick={()=>dset(doc.key,!docs[doc.key])}>{docs[doc.key]&&<span className="text-white text-xs">✓</span>}</div>
            </div>
            <input type="file" accept="image/*,.pdf" className="w-full text-xs text-gray-400" onChange={e=>{if(e.target.files.length>0)dset(doc.key,true);}}/>
          </div>
        ))}
        {(hasPharmacy||(inputMode==="manual"&&Number(mf.pharmacyAmt)>0))&&<>
          <div className="text-xs font-semibold text-orange-600 px-1">💊 약국 서류 필수</div>
          {[{key:"hasPharmacyBill",label:"약제비 계산서 원본",note:"약국 발행 계산서/영수증",icon:"💊"},{key:"hasPrescription",label:"처방전 사본",note:"처방전 없는 일반의약품 불가",icon:"📝"}].map(doc=>(
            <div key={doc.key} className={`bg-white rounded-xl p-4 border border-orange-200 shadow-sm ${docs[doc.key]?"border-green-300":""}`}>
              <div className="flex justify-between items-start mb-2">
                <div><div className="flex items-center gap-2"><span className="text-xs font-semibold text-gray-700">{doc.icon} {doc.label}</span><Badge label="필수" color="bg-orange-100 text-orange-600"/></div><div className="text-xs text-gray-400 mt-0.5">{doc.note}</div></div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center cursor-pointer ${docs[doc.key]?"border-green-500 bg-green-500":"border-gray-300"}`} onClick={()=>dset(doc.key,!docs[doc.key])}>{docs[doc.key]&&<span className="text-white text-xs">✓</span>}</div>
              </div>
              <input type="file" accept="image/*,.pdf" className="w-full text-xs text-gray-400" onChange={e=>{if(e.target.files.length>0)dset(doc.key,true);}}/>
            </div>
          ))}
        </>}
        <div className="flex gap-2"><button onClick={()=>setStep(3)} className="flex-1 py-3 rounded-lg border text-sm text-gray-500">← 이전</button><button onClick={()=>setStep(5)} className="flex-1 py-3 rounded-lg text-white font-medium text-sm" style={{background:"#1a5c3a"}}>다음 →</button></div>
      </div>}

      {/* STEP 5 — 서명 */}
      {step===5&&<div className="space-y-3">
        <div className="text-sm font-semibold text-gray-700">최종 확인 및 서명</div>
        <div className="bg-gray-50 border rounded-xl p-4 text-xs space-y-1.5 text-gray-600">
          <div className="font-semibold text-gray-700 mb-2">📋 신청 내용 최종 확인</div>
          {inputMode==="auto"?<>
            <div className="flex justify-between"><span className="text-gray-400">신청 방법</span><span>건강보험공단 자동 연동</span></div>
            <div className="flex justify-between"><span className="text-gray-400">선택 항목</span><span>{selectedItems.length}건</span></div>
            {clinicTotal>0&&<div className="flex justify-between"><span className="text-gray-400">병원 진료비</span><span>{clinicTotal.toLocaleString()}원</span></div>}
            {pharmacyTotal>0&&<div className="flex justify-between"><span className="text-gray-400">약국비</span><span>{pharmacyTotal.toLocaleString()}원</span></div>}
            {Number(insuranceAmt)>0&&<div className="flex justify-between text-red-500"><span>보험금 차감</span><span>-{Number(insuranceAmt).toLocaleString()}원</span></div>}
            {isFirstClaim==="yes"&&<div className="flex justify-between text-red-500"><span>최초 공제</span><span>-200,000원</span></div>}
            <div className="border-t pt-1.5 flex justify-between font-bold text-green-700"><span>예상 지급액</span><span>{expectedPay.toLocaleString()}원</span></div>
          </>:<>
            <div className="flex justify-between"><span className="text-gray-400">신청 방법</span><span>직접 입력</span></div>
            <div className="flex justify-between"><span className="text-gray-400">진료기간</span><span>{mf.startDate} ~ {mf.endDate}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">병명</span><span>{mf.disease}{mf.diseaseCode&&` (${mf.diseaseCode})`}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">진료비</span><span>{Number(mf.clinicAmt||0).toLocaleString()}원</span></div>
            {Number(mf.pharmacyAmt)>0&&<div className="flex justify-between"><span className="text-gray-400">약국비</span><span>{Number(mf.pharmacyAmt).toLocaleString()}원</span></div>}
            <div className="border-t pt-1.5 flex justify-between font-bold text-green-700"><span>예상 지급액</span><span>{mfExpected.toLocaleString()}원</span></div>
          </>}
        </div>
        <div className="bg-white rounded-xl p-4 border shadow-sm">
          <div className="text-xs text-gray-500 mb-3">위 신청 내용이 사실임을 확인하고 서명합니다.</div>
          <SignaturePad name={user.name} onSign={v=>setSigned(v)} signed={signed}/>
        </div>
        {signed&&<button onClick={onComplete} className="w-full py-3 rounded-lg text-white font-bold text-sm" style={{background:"#1a5c3a"}}>✅ {isResubmit?"보완 서류 재제출":"의료비 신청 제출"}</button>}
        <button onClick={()=>setStep(4)} className="w-full py-2 rounded-lg border text-xs text-gray-400">← 이전</button>
      </div>}
    </div>
  );
}

// ── 피부양자 탭 ───────────────────────────────────────────
function DepTab({user,deps,setDeps,st}) {
  const NHIS_DEPS = NHIS_DEPS_BY_EMP[user.empId]||[];
  const [nhisLoaded,setNhisLoaded]=useState(false);
  const [nhisLoading,setNhisLoading]=useState(false);
  const [showDepForm,setShowDepForm]=useState(false);
  const [nd,setNd]=useState({name:"",rel:"배우자",birth:"",verifyMode:""});

  const nhisAuthenticated = deps.some(d=>d.type==="건보인증")||nhisLoaded;
  const nhisDeps   = deps.filter(d=>d.type==="건보인증");
  const manualDeps = deps.filter(d=>d.type!=="건보인증");

  const doNhisAuth = () => {
    setNhisLoading(true);
    setTimeout(()=>{
      const toAdd = NHIS_DEPS.filter(n=>!deps.some(d=>d.name===n.name));
      setDeps(prev=>[...prev.filter(d=>d.type!=="건보인증"),...toAdd.map(n=>({...n,type:"건보인증",status:"유효"}))]);
      setNhisLoaded(true); setNhisLoading(false);
      st(`건강보험공단 연동 완료 — ${toAdd.length}명 불러옴`);
    },1800);
  };

  return (
    <div className="space-y-4">
      <div className="text-sm font-semibold text-gray-700">피부양자 관리</div>

      {!nhisAuthenticated
        ? <div className="bg-white border-2 border-green-200 rounded-xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background:"#e8f5ee"}}><span className="text-xl">🏥</span></div>
              <div>
                <div className="font-semibold text-gray-800 text-sm">건강보험공단 피부양자 자동 불러오기</div>
                <div className="text-xs text-gray-500 mt-1 leading-relaxed">간편인증 1회로 건강보험에 등재된 가족 전원을 한번에 등록합니다. 등재되지 않은 가족은 수기 등록을 이용하세요.</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg px-3 py-2 text-xs text-gray-500 space-y-1">
              <div className="font-medium text-gray-600 mb-1">📋 인증 후 자동 확인 항목</div>
              <div>· 피부양자 성명 / 관계 / 생년월일</div>
              <div>· 자격취득일 (등재 시점)</div>
              <div>· 피부양자 자격 유효 여부</div>
            </div>
            <button onClick={doNhisAuth} disabled={nhisLoading} className="w-full py-3 rounded-xl text-white font-medium text-sm flex items-center justify-center gap-2" style={{background:"#1a5c3a",opacity:nhisLoading?.7:1}}>
              {nhisLoading?<><span>⏳</span><span>건강보험공단 조회 중...</span></>:<><span>📱</span><span>간편인증으로 피부양자 불러오기</span></>}
            </button>
            <button onClick={()=>setShowDepForm(true)} className="w-full py-2.5 rounded-xl border border-gray-200 text-xs text-gray-500">인증 없이 수기 등록만 하기</button>
          </div>
        : <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-2.5">
            <div className="flex items-center gap-2 text-xs text-green-700">
              <span>✅</span><span className="font-medium">건강보험공단 연동 완료</span>
              <span className="text-green-500">— {nhisDeps.length}명 등재 확인</span>
            </div>
            <button onClick={doNhisAuth} className="text-xs text-green-600 border border-green-300 rounded-lg px-2.5 py-1 bg-white">재조회</button>
          </div>
      }

      {nhisDeps.length>0&&<>
        <div className="flex items-center justify-between">
          <div className="text-xs font-semibold text-gray-500">건강보험 등재 피부양자 ({nhisDeps.length}명)</div>
          <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">🔗 건보인증</span>
        </div>
        <div className="space-y-2">
          {nhisDeps.map(d=>(
            <div key={d.id} className="bg-white rounded-xl p-4 border border-green-200 shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{background:"#1a5c3a"}}>{d.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{d.name}</span>
                      <Badge label={d.rel} color={REL_COLOR[d.rel]||"bg-gray-100 text-gray-500"}/>
                      <span className="text-xs bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full font-medium">🔗 건보인증</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">생년월일 {d.birth}</div>
                    {d.acquired&&<div className="text-xs text-gray-400">자격취득일 {d.acquired}</div>}
                  </div>
                </div>
                <Badge label="유효" color="bg-green-100 text-green-700"/>
              </div>
            </div>
          ))}
        </div>
      </>}

      {nhisAuthenticated&&<div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700 space-y-1">
        <div className="font-semibold">건강보험에 미등재된 가족이 있나요?</div>
        <div className="leading-relaxed text-blue-600">자격취득일이 늦거나 아직 등재 처리 중인 경우, 수기 등록 후 서류를 첨부하면 심사 후 의료비 신청이 가능합니다.</div>
      </div>}

      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-semibold text-gray-500">수기 등록 피부양자 {manualDeps.length>0&&`(${manualDeps.length}명)`}</div>
          <button onClick={()=>setShowDepForm(!showDepForm)} className="text-xs px-3 py-1.5 rounded-lg text-white" style={{background:"#1a5c3a"}}>+ 수기 등록</button>
        </div>
        {showDepForm&&<div className="bg-white rounded-xl p-4 border-2 border-dashed border-gray-300 shadow-sm space-y-2 mb-2">
          <div className="text-xs font-semibold text-gray-600">✏️ 수기 피부양자 등록</div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 text-xs text-yellow-700">건강보험 등재가 늦어진 경우 수기로 등록하고 서류를 첨부하세요.</div>
          <input className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="성명 *" value={nd.name} onChange={e=>setNd({...nd,name:e.target.value})}/>
          <select className="w-full border rounded-lg px-3 py-2 text-xs" value={nd.rel} onChange={e=>setNd({...nd,rel:e.target.value})}>{["배우자","자녀","부모","배우자부모"].map(r=><option key={r}>{r}</option>)}</select>
          <input className="w-full border rounded-lg px-3 py-2 text-xs" placeholder="생년월일 (예: 1985.01.01) *" value={nd.birth} onChange={e=>setNd({...nd,birth:e.target.value})}/>
          <div className="text-xs text-gray-500 font-medium mt-1">자격 확인 방법</div>
          <div className="flex gap-2">{[{v:"simple",l:"📱 간편인증"},{v:"doc",l:"📎 서류 첨부"}].map(o=><button key={o.v} onClick={()=>setNd({...nd,verifyMode:o.v})} className={`flex-1 py-2 rounded-lg border text-xs ${nd.verifyMode===o.v?"text-white":"border-gray-200 text-gray-500"}`} style={nd.verifyMode===o.v?{background:"#1a5c3a"}:{}}>{o.l}</button>)}</div>
          {nd.verifyMode==="doc"&&<><div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-700">⚠ 건강보험 자격확인서 원본 첨부 필수</div><input type="file" accept="image/*,.pdf" className="w-full text-xs text-gray-400"/></>}
          <div className="flex gap-2">
            <button onClick={()=>{
              if(!nd.name||!nd.birth)return;
              setDeps(prev=>[...prev,{...nd,id:Date.now(),type:"수기"+(nd.verifyMode?"(검토중)":""),status:nd.verifyMode?"검토중":"등록완료",acquired:""}]);
              setShowDepForm(false); setNd({name:"",rel:"배우자",birth:"",verifyMode:""});
              st("수기 등록 완료 — 검토 후 의료비 신청 가능");
            }} disabled={!nd.name||!nd.birth} className="flex-1 py-2 rounded-lg text-white text-xs" style={{background:"#1a5c3a",opacity:(nd.name&&nd.birth)?1:.5}}>등록</button>
            <button onClick={()=>setShowDepForm(false)} className="flex-1 py-2 rounded-lg border text-xs text-gray-500">취소</button>
          </div>
        </div>}
        {manualDeps.length===0&&!showDepForm&&<div className="text-xs text-gray-400 py-3 text-center">수기 등록된 피부양자가 없습니다.</div>}
        <div className="space-y-2">
          {manualDeps.map(d=>(
            <div key={d.id} className="bg-white rounded-xl p-4 border shadow-sm">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0" style={{background:"#6b7280"}}>{d.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-gray-800 text-sm">{d.name}</span>
                      <Badge label={d.rel} color={REL_COLOR[d.rel]||"bg-gray-100 text-gray-500"}/>
                      <span className="text-xs bg-orange-100 text-orange-600 border border-orange-200 px-1.5 py-0.5 rounded-full font-medium">✏️ 수기</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">생년월일 {d.birth}</div>
                    {d.acquired&&<div className="text-xs text-gray-400">자격취득일 {d.acquired}</div>}
                  </div>
                </div>
                <Badge label={d.status} color={d.status==="유효"||d.status==="등록완료"?"bg-green-100 text-green-700":"bg-yellow-100 text-yellow-600"}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 관리자 신청내역 탭 ────────────────────────────────────
function AdminClaimsTab({claims,listYear,setListYear,listQ,setListQ,listSt,setListSt,setStatusModal,setNextSt,setStNote,setBankModal,setBankMsg,expandedId,setExpandedId,st}) {
  const listFiltered = claims.filter(c=>c.year===listYear&&(listQ==="전체"||c.q===listQ)&&(listSt==="전체"||c.status===listSt));

  // 근로자별 그룹핑
  const empOrder=[];
  const empMap={};
  listFiltered.forEach(c=>{
    if(!empMap[c.empId]){empMap[c.empId]=[];empOrder.push(c.empId);}
    empMap[c.empId].push(c);
  });

  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <span className="font-semibold text-gray-700 text-sm">전체 신청내역 ({listFiltered.length}건)</span>
        <button onClick={()=>st("엑셀 다운로드 완료")} className="text-xs px-3 py-1.5 rounded-lg border text-green-700 border-green-300 bg-green-50">⬇ 엑셀</button>
      </div>
      <YearSelector year={listYear} setYear={y=>{setListYear(y);setListQ("전체");setListSt("전체");}}/>
      <div className="flex gap-2 flex-wrap">
        {["전체","1분기","2분기","3분기","4분기"].map(q=><button key={q} onClick={()=>setListQ(q)} className={`text-xs px-3 py-1 rounded-full border ${listQ===q?"text-white":"text-gray-500 border-gray-200"}`} style={listQ===q?{background:"#1a5c3a"}:{}}>{q}</button>)}
        <select className="text-xs border rounded-full px-3 py-1 text-gray-500" value={listSt} onChange={e=>setListSt(e.target.value)}>{["전체",...STATUSES].map(s=><option key={s}>{s}</option>)}</select>
      </div>

      {listFiltered.length===0&&<div className="bg-white rounded-xl border px-4 py-8 text-center text-xs text-gray-400">{listYear}년 내역 없음</div>}

      {empOrder.map(empId=>{
        const empClaims=empMap[empId];
        const emp=empClaims[0];
        const totalReq=empClaims.reduce((s,c)=>s+c.requested,0);
        const totalApp=empClaims.filter(c=>c.approved).reduce((s,c)=>s+(c.approved||0),0);
        const hasIssue=empClaims.some(c=>c.status==="보완요청"||c.status==="예외검토");
        const hasFamilyClaim=empClaims.some(c=>c.targetRel&&c.targetRel!=="본인");
        return (
          <div key={empId} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${hasIssue?"border-orange-200":""}`}>
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{background:"#f8faf9"}}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{background:"#1a5c3a"}}>{emp.name[0]}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-800 text-sm">{emp.name}</span>
                    <span className="text-xs text-gray-400">{emp.dept}</span>
                    {hasFamilyClaim&&<span className="text-xs bg-blue-50 text-blue-600 border border-blue-200 px-2 py-0.5 rounded-full">가족 신청 포함</span>}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">총 {empClaims.length}건 · 신청 {totalReq.toLocaleString()}원{totalApp>0&&` · 지급 ${totalApp.toLocaleString()}원`}</div>
                </div>
              </div>
              <span className="text-xs text-gray-400">{emp.q}</span>
            </div>
            {empClaims.map(c=>{
              const isFamily=c.targetRel&&c.targetRel!=="본인";
              return (
                <div key={c.id} className={`border-b last:border-0 ${isFamily?"bg-blue-50/30":""}`}>
                  <div className="flex items-start justify-between px-4 py-3 hover:bg-gray-50 gap-2">
                    <div className="flex items-start gap-2 flex-1 min-w-0">
                      <div className="shrink-0 mt-0.5">
                        {isFamily
                          ? <div className="flex flex-col items-center gap-0.5"><div className="w-1.5 h-1.5 rounded-full bg-gray-300"/><div className="w-px h-3 bg-gray-200"/><div className="w-4 h-4 rounded-full border-2 border-blue-300 flex items-center justify-center bg-white"><span className="text-blue-400" style={{fontSize:"8px"}}>가</span></div></div>
                          : <div className="w-4 h-4 rounded-full border-2 border-green-400 flex items-center justify-center bg-white"><span className="text-green-600" style={{fontSize:"8px"}}>본</span></div>
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                          <Badge label={`${c.target||c.name} (${c.targetRel||"본인"})`} color={TARGET_COLOR[c.targetRel||"본인"]||"bg-gray-100 text-gray-500"}/>
                          <Badge label={c.status} color={STATUS_COLOR[c.status]}/>
                        </div>
                        <div className="text-xs font-medium text-gray-700">{c.disease}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{c.period}</div>
                        <div className="flex gap-3 mt-0.5 text-xs">
                          <span className="text-gray-400">신청 <span className="text-gray-600 font-medium">{c.requested.toLocaleString()}원</span></span>
                          {c.approved&&<span className="text-green-600 font-medium">지급 {c.approved.toLocaleString()}원</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 mt-0.5">
                      <button onClick={()=>setExpandedId(expandedId===c.id?null:c.id)} className="text-xs px-2 py-1 rounded border border-gray-200 text-gray-500">서류{expandedId===c.id?"▲":"▼"}</button>
                      <button onClick={()=>{setStatusModal(c);setNextSt("");setStNote("");}} className="text-xs px-2 py-1 rounded border border-blue-200 text-blue-600 bg-blue-50">상태</button>
                      <button onClick={()=>{setBankModal(c);setBankMsg("");}} className="text-xs px-2 py-1 rounded border border-orange-200 text-orange-600 bg-orange-50">통보</button>
                    </div>
                  </div>
                  {expandedId===c.id&&<div className="bg-gray-50 px-4 py-3 border-t space-y-2">
                    <div className="text-xs font-semibold text-gray-600">📎 제출 서류 목록</div>
                    {c.docs&&c.docs.length>0?<div className="flex flex-wrap gap-1.5">{c.docs.map((d,i)=><span key={i} className="text-xs bg-white border border-gray-200 text-gray-600 px-2.5 py-1 rounded-lg flex items-center gap-1">📄 {d}</span>)}</div>:<div className="text-xs text-gray-400">서류 없음</div>}
                    {c.supplementNote&&<div className="bg-orange-50 border border-orange-200 rounded-lg p-2 text-xs text-orange-700"><span className="font-semibold">보완요청 내용:</span> {c.supplementNote}</div>}
                  </div>}
                  {c.status==="보완요청"&&c.supplementNote&&expandedId!==c.id&&<div className="px-4 pb-2"><div className="bg-orange-50 border border-orange-200 rounded-lg px-3 py-2 text-xs text-orange-700">⚠ {c.supplementNote}</div></div>}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── 근로자 앱 ─────────────────────────────────────────────
const WORKER_TABS=["홈","신청하기","피부양자","내 신청내역"];
function WorkerApp({user,onLogout,periodsByYear,claims,setClaims}) {
  const [tab,setTab]=useState(0);
  const [submitted,setSubmitted]=useState(false);
  const [toast,setToast]=useState("");
  const [deps,setDeps]=useState(INIT_DEPS_BY_EMP[user.empId]||[]);
  const [resubmitId,setResubmitId]=useState(null);

  const myClaims=claims.filter(c=>c.empId===user.empId);
  const activePeriod=Object.values(periodsByYear).flat().find(p=>p.active);
  const totalPaid=myClaims.filter(c=>c.approved&&c.year===THIS_YEAR).reduce((s,c)=>s+(c.approved||0),0);
  const st=msg=>{setToast(msg);setTimeout(()=>setToast(""),2500);};
  const resubmitClaim=resubmitId?myClaims.find(c=>c.id===resubmitId):null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toast msg={toast}/>
      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"#1a5c3a"}}><span className="text-white text-xs font-bold">W</span></div><span className="text-sm font-bold text-gray-800">워크드 의료비</span></div>
        <div className="flex items-center gap-2"><span className="text-xs text-gray-500">{user.name}</span><button onClick={onLogout} className="text-xs text-gray-400 border rounded px-2 py-1">로그아웃</button></div>
      </div>
      {activePeriod&&<div className="mx-4 mt-3 rounded-xl px-4 py-3 flex items-center justify-between text-white text-xs" style={{background:"#1a5c3a"}}>
        <div><div className="font-bold text-sm">📋 현재 신청 분기: {activePeriod.q}</div><div className="opacity-80 mt-0.5">{activePeriod.start} ~ {activePeriod.end}</div></div>
        <div className="text-right"><div className="opacity-70">마감</div><div className="font-bold">{activePeriod.deadline}</div></div>
      </div>}
      <div className="bg-white border-b px-4 flex mt-3">
        {WORKER_TABS.map((t,i)=><button key={i} onClick={()=>{setTab(i);setSubmitted(false);setResubmitId(null);}} className={`px-4 py-3 text-xs font-medium border-b-2 ${tab===i?"border-green-700 text-green-700":"border-transparent text-gray-400"}`}>{t}</button>)}
      </div>
      <div className="flex-1 p-4 max-w-lg mx-auto w-full">
        {tab===0&&<div className="space-y-3">
          <div className="rounded-2xl p-5 text-white" style={{background:"#1a5c3a"}}>
            <div className="text-xs opacity-70">{user.name}님 {THIS_YEAR}년 누계</div>
            <div className="text-2xl font-bold mt-1">{totalPaid.toLocaleString()}원</div>
            <div className="text-xs opacity-60 mt-1">연간 한도 10,000,000원</div>
          </div>
          {myClaims.filter(c=>c.status==="보완요청").map(c=>(
            <div key={c.id} className="bg-orange-50 border-2 border-orange-300 rounded-xl p-4">
              <div className="flex items-center gap-2 font-semibold text-orange-700 text-sm mb-1">⚠ 보완 요청</div>
              <div className="text-xs text-gray-600 mb-2">{c.disease} · {c.q}</div>
              <p className="text-xs text-orange-700 mb-3">{c.supplementNote}</p>
              <button onClick={()=>setTab(3)} className="text-xs text-orange-700 underline font-medium">신청내역에서 재제출 →</button>
            </div>
          ))}
          <div className="bg-white rounded-xl p-4 border shadow-sm">
            <div className="text-xs font-semibold text-gray-600 mb-2">최근 신청</div>
            {myClaims.slice(0,3).map(c=><div key={c.id} className="flex justify-between items-center py-2 border-b last:border-0 text-xs"><div><div className="font-medium text-gray-700">{c.disease}</div><div className="text-gray-400">{c.year}년 {c.q}</div></div><div className="text-right space-y-0.5"><div>{(c.approved??c.requested).toLocaleString()}원</div><Badge label={c.status} color={STATUS_COLOR[c.status]}/></div></div>)}
          </div>
        </div>}

        {tab===1&&(submitted
          ? <div className="bg-white rounded-xl p-6 border shadow-sm text-center space-y-3"><div className="text-4xl">✅</div><div className="font-bold text-gray-700">신청 완료</div><p className="text-xs text-gray-400">서류 검토 후 매월 10일 급여일에 지급됩니다.</p><button onClick={()=>setSubmitted(false)} className="text-xs text-green-700 underline">새 신청하기</button></div>
          : <ApplicationForm user={user} deps={deps} onComplete={()=>{setSubmitted(true);st("신청 완료!");}}/>
        )}

        {tab===2&&<DepTab user={user} deps={deps} setDeps={setDeps} st={st}/>}

        {tab===3&&<div className="space-y-3">
          <div className="font-semibold text-gray-700 text-sm">내 신청내역</div>
          {resubmitId&&resubmitClaim?(
            <div className="space-y-3">
              <div className="flex items-center gap-2"><button onClick={()=>setResubmitId(null)} className="text-xs text-gray-400 border rounded px-2 py-1">← 목록</button><span className="text-sm font-semibold text-orange-700">보완 서류 재제출</span></div>
              <ApplicationForm user={user} deps={deps} supplementNote={resubmitClaim.supplementNote} isResubmit={true}
                onComplete={()=>{setClaims(claims.map(c=>c.id===resubmitId?{...c,status:"심사중",supplementNote:""}:c));setResubmitId(null);st("재제출 완료 — 심사 중으로 변경되었습니다");}}/>
            </div>
          ):(
            myClaims.map(c=>(
              <div key={c.id} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${c.status==="보완요청"?"border-orange-300":""}`}>
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div><div className="font-medium text-gray-700">{c.disease}</div><div className="text-gray-400 text-xs">{c.year}년 {c.q} · {c.period}</div></div>
                    <Badge label={c.status} color={STATUS_COLOR[c.status]}/>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">신청 {c.requested.toLocaleString()}원</span>
                    {c.approved&&<span className="text-green-700 font-semibold">지급 {c.approved.toLocaleString()}원</span>}
                  </div>
                  {c.docs&&c.docs.length>0&&<div className="mt-2 pt-2 border-t"><div className="text-xs text-gray-400 mb-1">📎 제출 서류</div><div className="flex flex-wrap gap-1">{c.docs.map((d,i)=><span key={i} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">{d}</span>)}</div></div>}
                </div>
                {c.status==="보완요청"&&c.supplementNote&&<div className="bg-orange-50 border-t border-orange-200 px-4 py-3 space-y-2">
                  <div className="text-xs font-semibold text-orange-700">⚠ 보완 요청 사항</div>
                  <p className="text-xs text-orange-700 leading-relaxed">{c.supplementNote}</p>
                  <button onClick={()=>setResubmitId(c.id)} className="w-full py-2 rounded-lg text-white text-xs font-medium mt-1" style={{background:"#c2410c"}}>📤 보완 서류 재제출하기</button>
                </div>}
              </div>
            ))
          )}
        </div>}
      </div>
    </div>
  );
}

// ── 관리자 앱 ─────────────────────────────────────────────
const ADMIN_TABS=["대시보드","전체 신청내역","피부양자 현황","분기 히스토리","지급 관리","분기 설정","알림"];
const INIT_ADMIN_DEPS=Object.entries(NHIS_DEPS_BY_EMP).flatMap(([empId,deps])=>deps.map(d=>({...d,empId,type:"건보인증",status:"유효",empName:USERS.find(u=>u.empId===empId)?.name||empId})));

function AdminApp({user,onLogout,periodsByYear,setPeriodsByYear,claims,setClaims}) {
  const [tab,setTab]=useState(0);
  const [toast,setToast]=useState("");
  const [dashYear,setDashYear]=useState(THIS_YEAR);
  const [listYear,setListYear]=useState(THIS_YEAR);
  const [listQ,setListQ]=useState("전체");
  const [listSt,setListSt]=useState("전체");
  const [histYear,setHistYear]=useState(THIS_YEAR);
  const [payYear,setPayYear]=useState(THIS_YEAR);
  const [payQ,setPayQ]=useState("전체");
  const [setYr,setSetYr]=useState(THIS_YEAR);
  const [expandedId,setExpandedId]=useState(null);
  const [statusModal,setStatusModal]=useState(null);
  const [nextSt,setNextSt]=useState("");
  const [stNote,setStNote]=useState("");
  const [bankModal,setBankModal]=useState(null);
  const [bankMsg,setBankMsg]=useState("");
  const [editId,setEditId]=useState(null);
  const [editAmt,setEditAmt]=useState("");
  const [editPIdx,setEditPIdx]=useState(null);
  const [editP,setEditP]=useState({});

  const st=msg=>{setToast(msg);setTimeout(()=>setToast(""),2500);};
  const activePeriod=Object.values(periodsByYear).flat().find(p=>p.active);
  const dashClaims=claims.filter(c=>c.year===dashYear);
  const dashQStats=["1분기","2분기","3분기","4분기"].map(q=>({q,count:dashClaims.filter(c=>c.q===q).length,total:dashClaims.filter(c=>c.q===q&&c.approved).reduce((s,c)=>s+c.approved,0),done:dashClaims.filter(c=>c.q===q&&c.status==="지급완료").length}));
  const payFiltered=claims.filter(c=>c.year===payYear&&c.approved&&(payQ==="전체"||c.q===payQ));

  const saveStatus=()=>{
    if(!nextSt)return;
    setClaims(claims.map(c=>c.id===statusModal.id?{...c,status:nextSt,supplementNote:nextSt==="보완요청"?stNote:c.supplementNote}:c));
    st(`상태 변경: ${nextSt}`);setStatusModal(null);setNextSt("");setStNote("");
  };
  const confirmAmt=id=>{
    if(editId===id){setClaims(claims.map(c=>c.id===id?{...c,approved:Number(editAmt),bank:"확인완료"}:c));setEditId(null);setEditAmt("");st("금액 확정");}
    else{setEditId(id);const c=claims.find(x=>x.id===id);setEditAmt(c.approved??c.requested);}
  };
  const setActiveQ=(year,idx)=>{setPeriodsByYear({...periodsByYear,[year]:periodsByYear[year].map((p,i)=>({...p,active:i===idx}))});st(`${periodsByYear[year][idx].q} 활성화`);};
  const savePeriod=()=>{setPeriodsByYear({...periodsByYear,[setYr]:periodsByYear[setYr].map((p,i)=>i===editPIdx?{...p,...editP}:p)});setEditPIdx(null);st("저장 완료");};

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Toast msg={toast}/>

      {statusModal&&<div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-3">
          <div className="font-semibold">상태 변경</div>
          <div className="text-xs text-gray-400">{statusModal.name} · {statusModal.disease}</div>
          <div className="flex items-center gap-2"><span className="text-xs text-gray-500">현재</span><Badge label={statusModal.status} color={STATUS_COLOR[statusModal.status]}/></div>
          <div className="text-xs text-gray-500 mb-1">변경할 상태</div>
          <div className="flex flex-wrap gap-2">{STATUSES.filter(s=>s!==statusModal.status).map(s=><button key={s} onClick={()=>setNextSt(s)} className={`text-xs px-3 py-1.5 rounded-full border ${nextSt===s?"text-white":"border-gray-200 text-gray-600"}`} style={nextSt===s?{background:"#1a5c3a"}:{}}>{s}</button>)}</div>
          {nextSt==="보완요청"&&<div className="space-y-1"><div className="text-xs font-semibold text-orange-600">⚠ 보완 요청 사항 작성</div><textarea className="w-full border-2 border-orange-300 rounded-lg px-3 py-2 text-xs h-24 resize-none" placeholder="보완 요청 내용 작성..." value={stNote} onChange={e=>setStNote(e.target.value)}/></div>}
          {nextSt&&nextSt!=="보완요청"&&<textarea className="w-full border rounded-lg px-3 py-2 text-xs h-14 resize-none" placeholder="변경 사유 (선택)" value={stNote} onChange={e=>setStNote(e.target.value)}/>}
          <div className="flex gap-2"><button onClick={saveStatus} disabled={!nextSt||(nextSt==="보완요청"&&!stNote)} className="flex-1 py-2 rounded-lg text-white text-xs" style={{background:"#1a5c3a",opacity:(nextSt&&(nextSt!=="보완요청"||stNote))?1:.5}}>저장</button><button onClick={()=>{setStatusModal(null);setNextSt("");setStNote("");}} className="flex-1 py-2 rounded-lg border text-xs text-gray-500">취소</button></div>
        </div>
      </div>}

      {bankModal&&<div className="fixed inset-0 bg-black bg-opacity-40 z-40 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-5 w-full max-w-sm shadow-xl space-y-3">
          <div className="font-semibold">신한은행 통보 — {bankModal.name}</div>
          <textarea className="w-full border rounded-lg px-3 py-2 text-xs h-20 resize-none" placeholder="검토 요청 내용 입력" value={bankMsg} onChange={e=>setBankMsg(e.target.value)}/>
          <div className="flex gap-2"><button onClick={()=>{st(`신한은행 통보 완료: ${bankModal.name}`);setBankModal(null);setBankMsg("");}} disabled={!bankMsg} className="flex-1 py-2 rounded-lg text-white text-xs" style={{background:"#1a5c3a",opacity:bankMsg?1:.5}}>발송</button><button onClick={()=>setBankModal(null)} className="flex-1 py-2 rounded-lg border text-xs text-gray-500">취소</button></div>
        </div>
      </div>}

      <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2"><div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{background:"#1a5c3a"}}><span className="text-white text-xs font-bold">W</span></div><span className="text-sm font-bold">워크드 관리자</span></div>
        <div className="flex items-center gap-2"><span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">관리자</span><span className="text-xs text-gray-500">{user.name}</span><button onClick={onLogout} className="text-xs text-gray-400 border rounded px-2 py-1">로그아웃</button></div>
      </div>
      {activePeriod&&<div className="mx-4 mt-3 rounded-xl px-4 py-3 flex items-center justify-between text-white text-xs" style={{background:"#1a5c3a"}}><div><div className="font-bold">📋 현재 신청 분기: {activePeriod.q}</div><div className="opacity-80">{activePeriod.start} ~ {activePeriod.end}</div></div><div className="text-right"><div className="opacity-70">마감</div><div className="font-bold">{activePeriod.deadline}</div></div></div>}
      <div className="bg-white border-b px-4 flex overflow-x-auto mt-3">{ADMIN_TABS.map((t,i)=><button key={i} onClick={()=>setTab(i)} className={`px-3 py-3 text-xs font-medium border-b-2 whitespace-nowrap ${tab===i?"border-green-700 text-green-700":"border-transparent text-gray-400"}`}>{t}</button>)}</div>

      <div className="flex-1 p-4 max-w-4xl mx-auto w-full">
        {tab===0&&<div className="space-y-4">
          <div className="flex items-center justify-between"><span className="font-semibold text-gray-700 text-sm">대시보드</span><YearSelector year={dashYear} setYear={setDashYear}/></div>
          <div className="grid grid-cols-2 gap-3">{[{label:`${dashYear}년 총 신청`,value:`${dashClaims.length}건`,color:"text-blue-600"},{label:"지급 완료",value:`${dashClaims.filter(c=>c.status==="지급완료").length}건`,color:"text-green-600"},{label:"보완/검토 중",value:`${dashClaims.filter(c=>["심사중","예외검토","보완요청"].includes(c.status)).length}건`,color:"text-yellow-600"},{label:"총 집행액",value:`${(dashClaims.filter(c=>c.approved).reduce((s,c)=>s+c.approved,0)/10000).toLocaleString()}만원`,color:"text-purple-600"}].map((s,i)=><div key={i} className="bg-white rounded-xl p-4 border shadow-sm"><div className="text-xs text-gray-400 mb-1">{s.label}</div><div className={`text-xl font-bold ${s.color}`}>{s.value}</div></div>)}</div>
          <div className="bg-white rounded-xl p-4 border shadow-sm"><div className="font-semibold text-gray-700 text-sm mb-3">{dashYear}년 분기별 요약</div><table className="w-full text-xs"><thead className="text-gray-400 border-b"><tr><th className="py-2 text-left">분기</th><th className="py-2 text-center">신청</th><th className="py-2 text-center">완료</th><th className="py-2 text-right">집행액</th><th className="py-2 text-right">마감</th></tr></thead><tbody>{dashQStats.map(r=>{const p=periodsByYear[dashYear]?.find(p=>p.q===r.q);return<tr key={r.q} className="border-b last:border-0"><td className="py-2 font-medium text-gray-700">{r.q}{p?.active&&<span className="ml-1 text-xs bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full">진행중</span>}</td><td className="py-2 text-center">{r.count}</td><td className="py-2 text-center text-green-600">{r.done}</td><td className="py-2 text-right">{(r.total/10000).toLocaleString()}만원</td><td className="py-2 text-right text-gray-400">{p?.deadline||"-"}</td></tr>;})}</tbody></table></div>
        </div>}

        {tab===1&&<AdminClaimsTab claims={claims} listYear={listYear} setListYear={setListYear} listQ={listQ} setListQ={setListQ} listSt={listSt} setListSt={setListSt} setStatusModal={setStatusModal} setNextSt={setNextSt} setStNote={setStNote} setBankModal={setBankModal} setBankMsg={setBankMsg} expandedId={expandedId} setExpandedId={setExpandedId} st={st}/>}

        {tab===2&&<div className="space-y-3">
          <div className="font-semibold text-gray-700 text-sm">전체 피부양자 현황 ({INIT_ADMIN_DEPS.length}명)</div>
          {INIT_ADMIN_DEPS.map(d=>(
            <div key={d.id} className="bg-white rounded-xl border shadow-sm p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0" style={{background:"#1a5c3a"}}>{d.name[0]}</div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap"><span className="font-semibold text-gray-800">{d.name}</span><Badge label={d.rel} color={REL_COLOR[d.rel]||"bg-gray-100 text-gray-500"}/><span className="text-xs bg-green-100 text-green-700 border border-green-200 px-1.5 py-0.5 rounded-full">🔗 건보인증</span></div>
                    <div className="text-xs text-gray-400 mt-0.5">생년월일 {d.birth}</div>
                    {d.acquired&&<div className="text-xs text-gray-400">자격취득일 {d.acquired}</div>}
                    <div className="text-xs text-gray-400 mt-0.5">근로자: <span className="font-medium text-gray-600">{d.empName}</span></div>
                  </div>
                </div>
                <Badge label="유효" color="bg-green-100 text-green-700"/>
              </div>
            </div>
          ))}
        </div>}

        {tab===3&&<div className="space-y-4">
          <div className="flex items-center justify-between"><span className="font-semibold text-gray-700 text-sm">분기별 히스토리</span><YearSelector year={histYear} setYear={setHistYear}/></div>
          {["1분기","2분기","3분기","4분기"].map(q=>{const qc=claims.filter(c=>c.year===histYear&&c.q===q);const total=qc.filter(c=>c.approved).reduce((s,c)=>s+c.approved,0);const isActive=periodsByYear[histYear]?.find(p=>p.q===q)?.active;
            return<div key={q} className="bg-white rounded-xl border shadow-sm overflow-hidden"><div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50"><div className="flex items-center gap-2"><span className="font-semibold text-gray-700">{histYear}년 {q}</span>{isActive&&<span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">진행중</span>}</div><div className="flex items-center gap-3 text-xs text-gray-400"><span>{qc.length}건</span><span className="text-green-600 font-medium">{(total/10000).toLocaleString()}만원</span></div></div>
            {qc.length===0?<div className="px-4 py-3 text-xs text-gray-400">내역 없음</div>:qc.map(c=><div key={c.id} className="flex justify-between items-center px-4 py-2 border-b last:border-0 text-xs"><div><span className="font-medium text-gray-700">{c.name}</span><span className="text-gray-400 ml-2">{c.disease}</span></div><div className="flex items-center gap-2"><span>{(c.approved??c.requested).toLocaleString()}원</span><Badge label={c.status} color={STATUS_COLOR[c.status]}/><button onClick={()=>{setStatusModal(c);setNextSt("");setStNote("");}} className="text-xs px-1.5 py-0.5 rounded border border-blue-200 text-blue-600">변경</button></div></div>)}
            </div>;
          })}
        </div>}

        {tab===4&&<div className="space-y-3">
          <div className="flex justify-between items-center"><span className="font-semibold text-gray-700 text-sm">지급 관리</span><button onClick={()=>st("엑셀 다운로드 완료")} className="text-xs px-3 py-1.5 rounded-lg border text-green-700 border-green-300 bg-green-50">⬇ 급여반영 엑셀</button></div>
          <div className="flex items-center justify-between"><YearSelector year={payYear} setYear={y=>{setPayYear(y);setPayQ("전체");}}/><div className="flex gap-1">{["전체","1분기","2분기","3분기","4분기"].map(q=><button key={q} onClick={()=>setPayQ(q)} className={`text-xs px-2.5 py-1 rounded-full border ${payQ===q?"text-white":"text-gray-500 border-gray-200"}`} style={payQ===q?{background:"#1a5c3a"}:{}}>{q==="전체"?"전체":q.replace("분기","Q")}</button>)}</div></div>
          <div className="bg-white rounded-xl border shadow-sm overflow-auto"><table className="w-full text-xs min-w-[520px]"><thead className="bg-gray-50 text-gray-400"><tr><th className="px-3 py-2 text-left">성명</th><th className="px-3 py-2 text-left">분기</th><th className="px-3 py-2 text-right">신청</th><th className="px-3 py-2 text-right">지급</th><th className="px-3 py-2 text-center">은행확인</th><th className="px-3 py-2 text-center">액션</th></tr></thead><tbody>
            {payFiltered.length===0&&<tr><td colSpan={6} className="px-3 py-6 text-center text-gray-400">내역 없음</td></tr>}
            {payFiltered.map(c=><tr key={c.id} className="border-t hover:bg-gray-50"><td className="px-3 py-2 font-medium text-gray-700">{c.name}</td><td className="px-3 py-2 text-gray-500">{c.q}</td><td className="px-3 py-2 text-right text-gray-500">{c.requested.toLocaleString()}</td><td className="px-3 py-2 text-right">{editId===c.id?<input type="number" className="w-24 border rounded px-1 py-0.5 text-xs text-right" value={editAmt} onChange={e=>setEditAmt(e.target.value)}/>:<span className="font-medium">{c.approved.toLocaleString()}</span>}</td><td className="px-3 py-2 text-center"><span className={c.bank==="확인완료"?"text-green-600 font-medium":"text-gray-400"}>{c.bank}</span></td><td className="px-3 py-2 text-center"><div className="flex gap-1 justify-center"><button onClick={()=>confirmAmt(c.id)} className={`text-xs px-2 py-1 rounded border ${editId===c.id?"bg-green-600 text-white":"border-gray-300 text-gray-600"}`}>{editId===c.id?"저장":"수정"}</button><button onClick={()=>{setBankModal(c);setBankMsg("");}} className="text-xs px-2 py-1 rounded border border-orange-200 text-orange-600 bg-orange-50">통보</button></div></td></tr>)}
          </tbody></table></div>
        </div>}

        {tab===5&&<div className="space-y-3">
          <div className="flex items-center justify-between"><span className="font-semibold text-gray-700 text-sm">분기 설정</span><YearSelector year={setYr} setYear={y=>{setSetYr(y);setEditPIdx(null);}}/></div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-600">💡 활성 분기 변경 시 근로자 화면에 즉시 반영됩니다.</div>
          {(periodsByYear[setYr]||[]).map((p,i)=><div key={p.q} className={`bg-white rounded-xl border shadow-sm overflow-hidden ${p.active?"border-green-400":""}`}><div className="flex justify-between items-center px-4 py-3 border-b"><div className="flex items-center gap-2"><span className="font-semibold text-gray-700">{setYr}년 {p.q}</span>{p.active&&<span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">✅ 진행중</span>}</div><div className="flex gap-2">{!p.active&&<button onClick={()=>setActiveQ(setYr,i)} className="text-xs px-3 py-1 rounded-lg text-white" style={{background:"#1a5c3a"}}>활성화</button>}<button onClick={()=>{setEditPIdx(i);setEditP({start:p.start,end:p.end,deadline:p.deadline});}} className="text-xs px-3 py-1 rounded-lg border border-gray-300 text-gray-600">수정</button></div></div>{editPIdx===i?<div className="p-4 space-y-2 bg-gray-50">{[["진료 시작일","start"],["진료 종료일","end"],["마감일","deadline"]].map(([label,key])=><div key={key} className="flex items-center gap-2 text-xs"><label className="text-gray-500 w-20 shrink-0">{label}</label><input type="date" className="border rounded px-2 py-1 text-xs flex-1" value={editP[key]} onChange={e=>setEditP({...editP,[key]:e.target.value})}/></div>)}<div className="flex gap-2 pt-1"><button onClick={savePeriod} className="flex-1 py-2 rounded-lg text-white text-xs" style={{background:"#1a5c3a"}}>저장</button><button onClick={()=>setEditPIdx(null)} className="flex-1 py-2 rounded-lg border text-xs text-gray-500">취소</button></div></div>:<div className="px-4 py-3 text-xs text-gray-500 flex gap-4"><span>진료: {p.start} ~ {p.end}</span><span>마감: {p.deadline}</span></div>}</div>)}
        </div>}

        {tab===6&&<div className="space-y-3">
          <div className="font-semibold text-gray-700 text-sm">알림 발송</div>
          {[{target:"1분기 미신청자 142명",msg:"마감 D-7 알림톡",sent:"2026.03.31",ch:"카카오"},{target:"이수연 (보완요청)",msg:"보완 서류 제출 안내",sent:"2026.02.18",ch:"카카오"},{target:"심사 반려자 8명",msg:"반려 사유 안내",sent:"2026.02.15",ch:"이메일"}].map((a,i)=>(
            <div key={i} className="bg-white rounded-xl p-4 border shadow-sm flex justify-between items-center text-xs"><div><div className="font-medium text-gray-700">{a.msg}</div><div className="text-gray-400">{a.target} · {a.ch} · {a.sent}</div></div><Badge label="발송완료" color="bg-green-100 text-green-700"/></div>
          ))}
          <div className="bg-white rounded-xl p-4 border shadow-sm space-y-2">
            <div className="text-xs font-semibold text-gray-600">직접 발송</div>
            <select className="w-full border rounded-lg px-3 py-2 text-xs"><option>보완요청 대상자</option><option>1분기 미신청자</option><option>전체 임직원</option></select>
            <textarea className="w-full border rounded-lg px-3 py-2 text-xs h-16 resize-none" placeholder="메시지 입력..."/>
            <button onClick={()=>st("알림톡 발송 완료")} className="w-full py-2 rounded-lg text-white text-xs font-medium" style={{background:"#1a5c3a"}}>알림톡 발송</button>
          </div>
        </div>}
      </div>
    </div>
  );
}

// ── 메인 ─────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [periodsByYear,setPeriodsByYear]=useState(initPeriodsByYear);
  const [claims,setClaims]=useState(INIT_CLAIMS);
  if(!user) return <LoginScreen onLogin={setUser}/>;
  if(user.role==="admin") return <AdminApp user={user} onLogout={()=>setUser(null)} periodsByYear={periodsByYear} setPeriodsByYear={setPeriodsByYear} claims={claims} setClaims={setClaims}/>;
  return <WorkerApp user={user} onLogout={()=>setUser(null)} periodsByYear={periodsByYear} claims={claims} setClaims={setClaims}/>;
}

function LoginScreen({onLogin}) {
  const [empId,setEmpId]=useState("");
  const [birth,setBirth]=useState("");
  const [err,setErr]=useState("");
  const [mode,setMode]=useState("login");
  const [done,setDone]=useState(false);
  const [form,setForm]=useState({empId:"",birth:"",name:"",dept:""});
  const login=()=>{const u=USERS.find(u=>u.empId===empId&&u.birth===birth.replace(/-/g,""));if(u){onLogin(u);}else setErr("사번 또는 생년월일이 올바르지 않습니다.");};
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6"><div className="w-12 h-12 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{background:"#1a5c3a"}}><span className="text-white text-xl font-bold">W</span></div><div className="text-lg font-bold text-gray-800">워크드 의료비 지원</div><div className="text-xs text-gray-400 mt-1">임직원 복지 플랫폼</div></div>
        <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4">
          <div className="flex rounded-lg border overflow-hidden text-xs">{["login","signup"].map(m=><button key={m} onClick={()=>{setMode(m);setErr("");setDone(false);}} className={`flex-1 py-2 font-medium ${mode===m?"text-white":"text-gray-400"}`} style={mode===m?{background:"#1a5c3a"}:{}}>{m==="login"?"로그인":"회원가입"}</button>)}</div>
          {mode==="login"&&<><input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="사번" value={empId} onChange={e=>setEmpId(e.target.value)}/><input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="생년월일 (예: 19850312)" value={birth} onChange={e=>setBirth(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()}/>{err&&<p className="text-xs text-red-500">{err}</p>}<button onClick={login} className="w-full py-3 rounded-lg text-white font-medium text-sm" style={{background:"#1a5c3a"}}>로그인</button><p className="text-xs text-gray-400 text-center">근로자: 10001 / 19850312<br/>관리자: admin / 19800101</p></>}
          {mode==="signup"&&!done&&<><input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="사번 *" value={form.empId} onChange={e=>setForm({...form,empId:e.target.value})}/><input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="생년월일 *" value={form.birth} onChange={e=>setForm({...form,birth:e.target.value})}/><input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="성명 *" value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/><input className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="부서" value={form.dept} onChange={e=>setForm({...form,dept:e.target.value})}/><button onClick={()=>{if(!form.empId||!form.birth||!form.name)return;setDone(true);}} className="w-full py-3 rounded-lg text-white font-medium text-sm" style={{background:"#1a5c3a"}}>가입하기</button></>}
          {mode==="signup"&&done&&<div className="text-center py-4 space-y-2"><div className="text-2xl">✅</div><div className="text-sm font-medium">가입 완료</div><button onClick={()=>setMode("login")} className="text-xs text-green-700 underline">로그인하러 가기</button></div>}
        </div>
      </div>
    </div>
  );
}