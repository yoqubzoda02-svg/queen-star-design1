import { useState, useCallback } from 'react';
import { saveDesign, updateDesign, getDesigns, deleteDesign } from './firebase.js';

// ── Palette ──────────────────────────────────────────────────────────
const PALETTE = [
  '#000000','#1C1C1C','#3A3A3A','#666','#999','#CCC','#E8E8E8','#FFFFFF',
  '#4A2C17','#7A4A2C','#A06540','#C4956A','#E0BF9A','#F5E8D5',
  '#C1121F','#E53935','#EF9A9A','#FFCDD2',
  '#1565C0','#2196F3','#64B5F6','#BBDEFB',
  '#2E7D32','#43A047','#A5D6A7','#E8F5E9',
  '#E65100','#FB8C00','#FFB74D','#FFE0B2',
  '#6A1B9A','#8E24AA','#CE93D8','#F3E5F5',
  '#00695C','#00897B','#80CBC4','#E0F2F1',
  '#37474F','#546E7A','#90A4AE','#CFD8DC',
];

// ── Shoe data ────────────────────────────────────────────────────────
const DEFAULTS = {
  Туфли:    { Верх:'#8B5E3C', Носок:'#6B4423', Каблук:'#1C1C1C', Подошва:'#1C1C1C' },
  Балетки:  { Верх:'#E0BF9A', Носок:'#C4956A', Подошва:'#1C1C1C' },
  Кроссовки:{ Верх:'#FFFFFF', Язычок:'#F0F0F0', Задник:'#BBDEFB', Межподошва:'#F5E8D5', Подошва:'#1C1C1C' },
  Босоножки:{ Ремни:'#C4956A', Стелька:'#E0BF9A', Подошва:'#8B5E3C' },
  Сапоги:   { Голенище:'#1C1C1C', Верх:'#2A2A2A', Каблук:'#0A0A0A', Подошва:'#1C1C1C' },
};

const SVGS = {
  Туфли: {
    vb:'0 0 340 175',
    parts:[
      {id:'Верх',    d:'M 62,88 C 80,50 140,36 198,40 C 248,44 275,68 282,84 L 274,96 C 226,88 148,86 90,92 C 70,94 62,88 Z'},
      {id:'Носок',   d:'M 278,80 C 300,68 314,84 310,98 C 306,112 284,112 274,100 L 274,96 Z'},
      {id:'Каблук',  d:'M 55,90 L 47,158 L 64,158 L 68,90 Z'},
      {id:'Подошва', d:'M 47,156 L 312,96 L 312,104 L 47,164 Z'},
    ],
  },
  Балетки: {
    vb:'0 0 340 120',
    parts:[
      {id:'Верх',    d:'M 36,76 C 55,50 122,38 188,38 C 248,40 290,58 302,74 L 296,86 C 248,78 162,74 92,78 C 62,82 36,76 Z'},
      {id:'Носок',   d:'M 300,72 C 322,65 328,80 324,94 C 320,108 300,108 294,96 L 296,86 Z'},
      {id:'Подошва', d:'M 32,82 Q 178,86 298,86 L 298,98 Q 178,98 32,94 Z'},
    ],
  },
  Кроссовки: {
    vb:'0 0 340 185',
    parts:[
      {id:'Верх',       d:'M 46,80 C 64,44 124,28 182,30 C 238,33 280,58 292,76 L 284,88 C 236,74 154,68 86,76 C 62,80 46,80 Z'},
      {id:'Язычок',     d:'M 144,30 C 152,14 174,12 184,30 L 178,52 C 170,44 152,44 144,54 Z'},
      {id:'Задник',     d:'M 46,80 C 28,84 24,106 28,126 L 48,126 C 42,108 40,90 46,80 Z'},
      {id:'Межподошва', d:'M 42,88 Q 178,92 288,88 L 288,114 Q 178,116 42,114 Z'},
      {id:'Подошва',    d:'M 36,112 Q 178,116 290,114 L 290,126 Q 178,130 36,124 Z'},
    ],
  },
  Босоножки: {
    vb:'0 0 340 120',
    parts:[
      {id:'Стелька', d:'M 36,78 Q 178,74 302,76 L 302,90 Q 178,92 36,92 Z'},
      {id:'Ремни',   d:'M 50,62 C 56,48 78,48 82,62 L 78,78 C 72,72 56,72 50,78 Z M 150,64 C 156,50 178,50 182,64 L 178,78 C 172,72 156,72 150,78 Z M 252,62 C 258,48 278,48 282,62 L 278,78 C 272,72 258,72 252,78 Z'},
      {id:'Подошва', d:'M 32,88 Q 178,92 304,90 L 304,102 Q 178,106 32,100 Z'},
    ],
  },
  Сапоги: {
    vb:'0 0 260 320',
    parts:[
      {id:'Голенище', d:'M 50,36 Q 130,28 215,52 L 218,196 L 48,198 Z'},
      {id:'Верх',     d:'M 48,196 C 52,178 84,168 128,168 C 172,170 206,182 222,196 L 216,210 C 200,198 165,188 125,186 C 82,184 54,202 48,196 Z'},
      {id:'Каблук',   d:'M 44,206 L 38,262 L 58,262 L 62,210 Z'},
      {id:'Подошва',  d:'M 38,260 Q 140,266 218,215 L 218,225 Q 140,274 38,268 Z'},
    ],
  },
};

// ── Dropdown options ──────────────────────────────────────────────────
const MATS    = ['Натуральная кожа','Искусственная кожа','Замша','Нубук','Текстиль','Сетка','Лаковая кожа','Резина','ЭВА (EVA)','Полиуретан','Кожволон'];
const SEASONS = ['Весна/Лето','Осень/Зима','Всесезонная','Лето','Зима'];
const HEEL_H  = ['Без каблука','1–3 см (низкий)','4–6 см (средний)','7–10 см (высокий)','11+ см (шпилька)'];
const SOLE_A  = ['Клееная','Литьевая','Вулканизированная','Пришивная'];
const FAST    = ['Без застёжки','Молния','Шнурки','Пряжка','Резинка','Липучка'];

const today = new Date().toLocaleDateString('ru-RU');

// ── Shared styles ────────────────────────────────────────────────────
const INP = {
  width:'100%', padding:'8px 12px', background:'#1A1A1A',
  border:'1px solid #2A2A2A', borderRadius:8, color:'#F0EDE8',
  fontSize:13, boxSizing:'border-box', outline:'none',
};

// ── Toast notification ────────────────────────────────────────────────
function Toast({ msg, type }) {
  if (!msg) return null;
  const bg = type === 'error' ? '#C1121F' : type === 'loading' ? '#555' : '#2E7D32';
  return (
    <div style={{
      position:'fixed', bottom:20, left:'50%', transform:'translateX(-50%)',
      background:bg, color:'#FFF', padding:'10px 20px', borderRadius:10,
      fontSize:13, fontWeight:600, zIndex:9999, boxShadow:'0 4px 20px rgba(0,0,0,0.5)',
      pointerEvents:'none',
    }}>{msg}</div>
  );
}

// ── Saved designs panel ───────────────────────────────────────────────
function SavedPanel({ designs, loading, onLoad, onDelete, onClose }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.7)',
      zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center',
    }} onClick={onClose}>
      <div style={{
        background:'#111', border:'1px solid #252525', borderRadius:14,
        width:'min(480px,92vw)', maxHeight:'80vh', overflow:'hidden',
        display:'flex', flexDirection:'column',
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          padding:'14px 18px', borderBottom:'1px solid #1E1E1E',
          display:'flex', justifyContent:'space-between', alignItems:'center',
        }}>
          <span style={{fontWeight:700, fontSize:14}}>📂 Сохранённые модели</span>
          <button onClick={onClose} style={{background:'none',border:'none',color:'#666',cursor:'pointer',fontSize:18}}>✕</button>
        </div>
        <div style={{overflowY:'auto', flex:1, padding:'8px'}}>
          {loading && (
            <div style={{textAlign:'center',padding:30,color:'#555'}}>Загрузка...</div>
          )}
          {!loading && designs.length === 0 && (
            <div style={{textAlign:'center',padding:30,color:'#555'}}>Пока нет сохранённых моделей</div>
          )}
          {designs.map(d => (
            <div key={d.id} style={{
              display:'flex', alignItems:'center', gap:12, padding:'10px 10px',
              borderRadius:10, marginBottom:6, background:'#161616',
              border:'1px solid #1E1E1E',
            }}>
              {/* Mini SVG preview */}
              <div style={{background:'#0A0A0A',borderRadius:8,padding:6,flexShrink:0}}>
                <svg viewBox={SVGS[d.shoeType]?.vb || '0 0 340 175'} style={{width:60,height:40,display:'block'}}>
                  {SVGS[d.shoeType]?.parts.map(p => (
                    <path key={p.id} d={p.d} fill={d.colors?.[p.id]||'#555'} stroke='rgba(255,255,255,0.08)' strokeWidth={0.7}/>
                  ))}
                </svg>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontWeight:600,fontSize:13,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis'}}>
                  {d.specs?.modelName || '(без названия)'}
                </div>
                <div style={{fontSize:11,color:'#666'}}>
                  {d.shoeType} · {d.specs?.sku || '—'} · {d.specs?.season}
                </div>
              </div>
              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <button onClick={() => onLoad(d)} style={{
                  padding:'5px 10px',background:'#C9A84C',color:'#0A0A0A',
                  border:'none',borderRadius:7,cursor:'pointer',fontSize:12,fontWeight:700,
                }}>Открыть</button>
                <button onClick={() => onDelete(d.id)} style={{
                  padding:'5px 8px',background:'#1E0A0A',color:'#EF9A9A',
                  border:'1px solid #3A1A1A',borderRadius:7,cursor:'pointer',fontSize:12,
                }}>🗑</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Spec Sheet section helper ─────────────────────────────────────────
function Section({ title, children }) {
  return (
    <div style={{marginBottom:20}}>
      <div style={{
        fontSize:11,fontWeight:700,letterSpacing:'0.1em',
        borderBottom:'1px solid #000',paddingBottom:5,marginBottom:10,
        fontFamily:'system-ui',
      }}>{title}</div>
      {children}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════
//  MAIN APP
// ═══════════════════════════════════════════════════════════════════════
export default function App() {
  // ── State ────────────────────────────────────────────────────────
  const [tab,       setTab]       = useState('design');
  const [shoeType,  setShoeType]  = useState('Туфли');
  const [colors,    setColors]    = useState({...DEFAULTS['Туфли']});
  const [selPart,   setSelPart]   = useState('Верх');
  const [specs,     setSpecs]     = useState({
    modelName:'', sku:'', season:'Весна/Лето',
    upperMat:'Натуральная кожа', soleMat:'Резина',
    liningMat:'Натуральная кожа', insoleMat:'ЭВА (EVA)',
    heelH:'Без каблука', soleA:'Клееная', fastening:'Без застёжки',
    sizeRange:'36–41', color1:'', pan1:'', color2:'', pan2:'',
    notes:'', designer:'', date:today,
  });

  // Firebase state
  const [currentId,    setCurrentId]    = useState(null);   // Firestore doc ID if loaded
  const [savedDesigns, setSavedDesigns] = useState([]);
  const [showPanel,    setShowPanel]    = useState(false);
  const [panelLoading, setPanelLoading] = useState(false);
  const [toast,        setToast]        = useState({msg:'',type:''});

  const showToast = (msg, type = 'ok', ms = 2200) => {
    setToast({msg,type});
    setTimeout(() => setToast({msg:'',type:''}), ms);
  };

  // ── Change shoe type ─────────────────────────────────────────────
  const changeType = (t) => {
    setShoeType(t);
    setColors({...DEFAULTS[t]});
    setSelPart(SVGS[t].parts[0].id);
  };

  const setS = (k, v) => setSpecs(p => ({...p, [k]:v}));

  // ── Firebase: SAVE ───────────────────────────────────────────────
  const handleSave = useCallback(async () => {
    if (!specs.modelName.trim()) {
      showToast('Введи название модели перед сохранением', 'error');
      return;
    }
    showToast('Сохраняем...', 'loading', 60000);
    try {
      const payload = { shoeType, colors, specs };
      if (currentId) {
        await updateDesign(currentId, payload);
        showToast('✅ Обновлено');
      } else {
        const id = await saveDesign(payload);
        setCurrentId(id);
        showToast('✅ Сохранено');
      }
    } catch (e) {
      console.error(e);
      showToast('Ошибка сохранения', 'error');
    }
  }, [shoeType, colors, specs, currentId]);

  // ── Firebase: LOAD LIST ──────────────────────────────────────────
  const handleOpenPanel = async () => {
    setShowPanel(true);
    setPanelLoading(true);
    try {
      const list = await getDesigns();
      setSavedDesigns(list);
    } catch (e) {
      console.error(e);
      showToast('Ошибка загрузки', 'error');
    }
    setPanelLoading(false);
  };

  // ── Firebase: LOAD ONE ───────────────────────────────────────────
  const handleLoad = (d) => {
    setShoeType(d.shoeType);
    setColors(d.colors || {...DEFAULTS[d.shoeType]});
    setSpecs(d.specs || {});
    setSelPart(SVGS[d.shoeType].parts[0].id);
    setCurrentId(d.id);
    setShowPanel(false);
    showToast(`📂 Загружено: ${d.specs?.modelName || d.shoeType}`);
  };

  // ── Firebase: DELETE ─────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Удалить эту модель?')) return;
    try {
      await deleteDesign(id);
      setSavedDesigns(p => p.filter(d => d.id !== id));
      if (currentId === id) setCurrentId(null);
      showToast('🗑 Удалено');
    } catch (e) {
      showToast('Ошибка удаления', 'error');
    }
  };

  // ── New design ───────────────────────────────────────────────────
  const handleNew = () => {
    if (!window.confirm('Начать новый дизайн? Несохранённые изменения потеряются.')) return;
    changeType('Туфли');
    setSpecs({
      modelName:'', sku:'', season:'Весна/Лето',
      upperMat:'Натуральная кожа', soleMat:'Резина',
      liningMat:'Натуральная кожа', insoleMat:'ЭВА (EVA)',
      heelH:'Без каблука', soleA:'Клееная', fastening:'Без застёжки',
      sizeRange:'36–41', color1:'', pan1:'', color2:'', pan2:'',
      notes:'', designer:'', date:today,
    });
    setCurrentId(null);
  };

  const svg = SVGS[shoeType];

  // ── Render ───────────────────────────────────────────────────────
  return (
    <div style={{minHeight:'100vh',background:'#0A0A0A',color:'#F0EDE8',
      fontFamily:'system-ui,-apple-system,sans-serif',display:'flex',flexDirection:'column'}}>

      <Toast msg={toast.msg} type={toast.type} />
      {showPanel && (
        <SavedPanel
          designs={savedDesigns}
          loading={panelLoading}
          onLoad={handleLoad}
          onDelete={handleDelete}
          onClose={() => setShowPanel(false)}
        />
      )}

      {/* ── Header ─────────────────────────────────────────────── */}
      <div style={{padding:'11px 16px',borderBottom:'1px solid #181818',
        display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
        <div style={{width:32,height:32,background:'#C9A84C',borderRadius:7,
          display:'flex',alignItems:'center',justifyContent:'center',
          fontWeight:800,fontSize:12,color:'#0A0A0A',letterSpacing:'0.05em'}}>QS</div>
        <div style={{flex:1}}>
          <div style={{fontWeight:700,fontSize:13,letterSpacing:'0.08em'}}>SHOE DESIGNER</div>
          <div style={{fontSize:10,color:'#444',letterSpacing:'0.1em'}}>
            QUEEN STAR · PRODUCTION TOOL
            {currentId && <span style={{color:'#C9A84C',marginLeft:8}}>● {specs.modelName||'загружено'}</span>}
          </div>
        </div>
        {/* Toolbar */}
        <div style={{display:'flex',gap:6}}>
          <Btn onClick={handleNew}    ghost>＋ Новый</Btn>
          <Btn onClick={handleOpenPanel} ghost>📂 Модели</Btn>
          <Btn onClick={handleSave}>💾 {currentId ? 'Обновить' : 'Сохранить'}</Btn>
        </div>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div style={{display:'flex',borderBottom:'1px solid #181818'}}>
        {[
          {id:'design', lbl:'🎨 Дизайн'},
          {id:'specs',  lbl:'📋 Характеристики'},
          {id:'preview',lbl:'📄 Спецификация'},
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding:'10px 16px',background:'none',border:'none',cursor:'pointer',
            fontSize:12,fontWeight:tab===t.id?600:400,
            color:tab===t.id?'#C9A84C':'#555',
            borderBottom:tab===t.id?'2px solid #C9A84C':'2px solid transparent',
          }}>{t.lbl}</button>
        ))}
      </div>

      {/* ════════════════ DESIGN ════════════════ */}
      {tab==='design' && (
        <div style={{flex:1,display:'flex',flexDirection:'column'}}>
          {/* Type pills */}
          <div style={{padding:'10px 14px',borderBottom:'1px solid #121212',
            display:'flex',gap:6,flexWrap:'wrap'}}>
            {Object.keys(SVGS).map(t => (
              <button key={t} onClick={() => changeType(t)} style={{
                padding:'5px 12px',borderRadius:20,cursor:'pointer',
                background:shoeType===t?'#C9A84C':'#161616',
                color:shoeType===t?'#0A0A0A':'#666',
                border:'1px solid '+(shoeType===t?'#C9A84C':'#222'),
                fontSize:12,fontWeight:shoeType===t?700:400,
              }}>{t}</button>
            ))}
          </div>

          <div style={{display:'flex',flex:1,flexWrap:'wrap'}}>
            {/* Canvas */}
            <div style={{flex:'1 1 280px',display:'flex',flexDirection:'column',
              alignItems:'center',justifyContent:'center',
              padding:'20px 14px',background:'#0C0C0C',borderRight:'1px solid #141414'}}>
              <div style={{background:'#161616',borderRadius:14,padding:'18px',
                border:'1px solid #202020',maxWidth:300,width:'100%'}}>
                <svg viewBox={svg.vb} style={{width:'100%',display:'block'}}>
                  {svg.parts.map(p => (
                    <path key={p.id} d={p.d}
                      fill={colors[p.id]||'#555'}
                      stroke={selPart===p.id?'#C9A84C':'rgba(255,255,255,0.1)'}
                      strokeWidth={selPart===p.id?2:0.7}
                      style={{cursor:'pointer'}}
                      onClick={() => setSelPart(p.id)}
                    />
                  ))}
                </svg>
              </div>
              <div style={{fontSize:10,color:'#333',marginTop:8}}>Кликни на деталь</div>
              <div style={{display:'flex',gap:4,flexWrap:'wrap',justifyContent:'center',marginTop:8}}>
                {svg.parts.map(p => (
                  <button key={p.id} onClick={() => setSelPart(p.id)} style={{
                    padding:'3px 9px',borderRadius:12,cursor:'pointer',
                    background:selPart===p.id?'#1E1A10':'#131313',
                    color:selPart===p.id?'#C9A84C':'#555',
                    border:'1px solid '+(selPart===p.id?'#C9A84C55':'#1C1C1C'),
                    fontSize:11,display:'flex',alignItems:'center',gap:4,
                  }}>
                    <span style={{width:7,height:7,borderRadius:'50%',
                      background:colors[p.id],display:'inline-block',
                      border:'1px solid rgba(255,255,255,0.1)'}}/>
                    {p.id}
                  </button>
                ))}
              </div>
            </div>

            {/* Colour panel */}
            <div style={{flex:'1 1 220px',padding:'14px',overflowY:'auto'}}>
              {/* Active part */}
              <div style={{display:'flex',alignItems:'center',gap:10,padding:'9px 12px',
                background:'#131313',borderRadius:10,marginBottom:12,border:'1px solid #1C1C1C'}}>
                <div style={{width:34,height:34,borderRadius:8,background:colors[selPart],
                  flexShrink:0,border:'1px solid rgba(255,255,255,0.1)'}}/>
                <div>
                  <div style={{fontSize:13,fontWeight:600}}>{selPart}</div>
                  <div style={{fontSize:11,color:'#555',fontFamily:'monospace'}}>
                    {(colors[selPart]||'').toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Picker */}
              <div style={{display:'flex',gap:8,marginBottom:12,alignItems:'center'}}>
                <input type="color" value={colors[selPart]||'#000000'}
                  onChange={e => setColors(p => ({...p,[selPart]:e.target.value}))}
                  style={{width:36,height:34,border:'none',borderRadius:8,
                    cursor:'pointer',padding:2,background:'#1A1A1A'}}/>
                <input type="text" value={colors[selPart]||''} placeholder="#000000"
                  onChange={e => {
                    if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value))
                      setColors(p => ({...p,[selPart]:e.target.value}));
                  }}
                  style={{...INP,flex:1,fontFamily:'monospace',fontSize:12}}/>
              </div>

              <div style={{fontSize:10,color:'#3A3A3A',marginBottom:7,letterSpacing:'0.1em'}}>ПАЛИТРА</div>
              <div style={{display:'flex',flexWrap:'wrap',gap:4,marginBottom:14}}>
                {PALETTE.map(c => (
                  <div key={c} onClick={() => setColors(p => ({...p,[selPart]:c}))}
                    style={{width:22,height:22,borderRadius:5,background:c,cursor:'pointer',
                      border:'2px solid '+(colors[selPart]===c?'#C9A84C':'transparent'),
                      boxSizing:'border-box'}} title={c}/>
                ))}
              </div>

              <div style={{fontSize:10,color:'#3A3A3A',marginBottom:7,letterSpacing:'0.1em'}}>ВСЕ ДЕТАЛИ</div>
              {Object.entries(colors).map(([part,col]) => (
                <div key={part} onClick={() => setSelPart(part)}
                  style={{display:'flex',alignItems:'center',gap:8,padding:'5px 0',
                    borderBottom:'1px solid #121212',cursor:'pointer'}}>
                  <div style={{width:13,height:13,borderRadius:3,background:col,
                    border:'1px solid rgba(255,255,255,0.08)',flexShrink:0}}/>
                  <span style={{fontSize:12,flex:1,color:selPart===part?'#C9A84C':'#AAA'}}>{part}</span>
                  <span style={{fontSize:10,color:'#444',fontFamily:'monospace'}}>{col.toUpperCase()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ════════════════ SPECS ════════════════ */}
      {tab==='specs' && (
        <div style={{flex:1,padding:'16px',maxWidth:600,width:'100%',
          margin:'0 auto',boxSizing:'border-box',overflowY:'auto'}}>
          {[
            {title:'Основная информация', fields:[
              {k:'modelName',lbl:'Название модели',  ph:'Summer Classic'},
              {k:'sku',      lbl:'Артикул (SKU)',     ph:'QS-001'},
              {k:'season',   lbl:'Сезон',             sel:SEASONS},
              {k:'date',     lbl:'Дата',              ph:'ДД.ММ.ГГГГ'},
              {k:'designer', lbl:'Дизайнер',          ph:'Имя'},
            ]},
            {title:'Материалы', fields:[
              {k:'upperMat', lbl:'Верх (upper)',       sel:MATS},
              {k:'soleMat',  lbl:'Подошва (sole)',      sel:MATS},
              {k:'liningMat',lbl:'Подкладка (lining)', sel:MATS},
              {k:'insoleMat',lbl:'Стелька (insole)',   sel:MATS},
            ]},
            {title:'Конструкция', fields:[
              {k:'heelH',    lbl:'Высота каблука',     sel:HEEL_H},
              {k:'soleA',    lbl:'Крепление подошвы',  sel:SOLE_A},
              {k:'fastening',lbl:'Застёжка',           sel:FAST},
              {k:'sizeRange',lbl:'Размерный ряд',      ph:'36–41'},
            ]},
            {title:'Цвета (производство)', fields:[
              {k:'color1',lbl:'Цвет 1 — название',     ph:'Чёрный / Black'},
              {k:'pan1',  lbl:'Цвет 1 — Pantone / код',ph:'#000000 или Pantone Black 6'},
              {k:'color2',lbl:'Цвет 2 — название',     ph:'Необязательно'},
              {k:'pan2',  lbl:'Цвет 2 — Pantone / код',ph:'Необязательно'},
            ]},
            {title:'Примечания', fields:[
              {k:'notes',lbl:'Особые требования',ph:'Строчка, фурнитура, упаковка...',ta:true},
            ]},
          ].map(sec => (
            <div key={sec.title} style={{marginBottom:16}}>
              <div style={{fontSize:10,color:'#C9A84C',marginBottom:9,letterSpacing:'0.12em',fontWeight:700}}>
                {sec.title.toUpperCase()}
              </div>
              <div style={{background:'#111',borderRadius:12,padding:'13px 15px',border:'1px solid #1A1A1A'}}>
                {sec.fields.map((f,i) => (
                  <div key={f.k} style={{marginBottom:i===sec.fields.length-1?0:10}}>
                    <label style={{fontSize:11,color:'#666',display:'block',marginBottom:4}}>{f.lbl}</label>
                    {f.sel ? (
                      <select value={specs[f.k]||''} onChange={e => setS(f.k,e.target.value)} style={INP}>
                        {f.sel.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : f.ta ? (
                      <textarea value={specs[f.k]||''} onChange={e => setS(f.k,e.target.value)}
                        rows={3} placeholder={f.ph} style={{...INP,resize:'vertical'}}/>
                    ) : (
                      <input type="text" value={specs[f.k]||''}
                        onChange={e => setS(f.k,e.target.value)}
                        placeholder={f.ph} style={INP}/>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ════════════════ PREVIEW ════════════════ */}
      {tab==='preview' && (
        <div style={{flex:1,padding:'16px',overflowY:'auto'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
            <div style={{fontSize:10,color:'#555',letterSpacing:'0.1em'}}>ГОТОВО К ПЕЧАТИ</div>
            <div style={{display:'flex',gap:8}}>
              <Btn onClick={handleSave}>💾 Сохранить</Btn>
              <Btn onClick={() => window.print()}>🖨 PDF</Btn>
            </div>
          </div>

          <div style={{background:'#FFF',color:'#000',borderRadius:10,padding:'32px 36px',
            maxWidth:660,fontFamily:"Georgia,'Times New Roman',serif",fontSize:13,lineHeight:1.55}}>
            {/* Header */}
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-end',
              borderBottom:'2.5px solid #000',paddingBottom:12,marginBottom:18}}>
              <div>
                <div style={{fontSize:21,fontWeight:700,letterSpacing:'0.12em',fontFamily:'system-ui'}}>QUEEN STAR</div>
                <div style={{fontSize:9,letterSpacing:'0.2em',color:'#888',fontFamily:'system-ui'}}>PRODUCTION SPECIFICATION SHEET</div>
              </div>
              <div style={{textAlign:'right',fontFamily:'system-ui',fontSize:12}}>
                <div style={{fontWeight:700}}>{specs.date}</div>
                <div style={{color:'#888'}}>{specs.designer||'—'}</div>
              </div>
            </div>

            {/* Info cards */}
            <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
              {[['Модель',specs.modelName||'—'],['Артикул',specs.sku||'—'],['Тип',shoeType],['Сезон',specs.season]].map(([l,v]) => (
                <div key={l} style={{background:'#F6F6F6',borderRadius:7,padding:'8px 12px',flex:1,minWidth:90}}>
                  <div style={{fontSize:9,color:'#AAA',letterSpacing:'0.12em',fontFamily:'system-ui',marginBottom:2}}>{l.toUpperCase()}</div>
                  <div style={{fontWeight:700,fontSize:14,fontFamily:'system-ui'}}>{v}</div>
                </div>
              ))}
            </div>

            {/* Sketch */}
            <div style={{border:'1px solid #E8E8E8',borderRadius:8,padding:'12px',
              marginBottom:20,textAlign:'center',background:'#FAFAFA'}}>
              <div style={{fontSize:9,letterSpacing:'0.15em',color:'#CCC',marginBottom:8,fontFamily:'system-ui'}}>ЭСКИЗ / COLOUR STORY</div>
              <svg viewBox={svg.vb} style={{height:85,display:'inline-block'}}>
                {svg.parts.map(p => (
                  <path key={p.id} d={p.d} fill={colors[p.id]||'#CCC'} stroke="rgba(0,0,0,0.12)" strokeWidth={0.7}/>
                ))}
              </svg>
            </div>

            <Section title="МАТЕРИАЛЫ">
              <table style={{width:'100%',borderCollapse:'collapse',fontSize:12,fontFamily:'system-ui'}}>
                <tbody>
                  {[['Верх (Upper)',specs.upperMat],['Подошва (Sole)',specs.soleMat],
                    ['Подкладка (Lining)',specs.liningMat],['Стелька (Insole)',specs.insoleMat]].map(([l,v]) => (
                    <tr key={l} style={{borderBottom:'1px solid #F0F0F0'}}>
                      <td style={{padding:'5px 6px',color:'#888',width:'42%'}}>{l}</td>
                      <td style={{padding:'5px 6px',fontWeight:600}}>{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Section>

            <Section title="КОНСТРУКЦИЯ">
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px 20px',fontFamily:'system-ui',fontSize:12}}>
                {[['Каблук',specs.heelH],['Крепление',specs.soleA],
                  ['Застёжка',specs.fastening],['Размерный ряд',specs.sizeRange||'—']].map(([l,v]) => (
                  <div key={l}>
                    <div style={{fontSize:9,color:'#BBB',letterSpacing:'0.1em',marginBottom:2}}>{l.toUpperCase()}</div>
                    <div style={{fontWeight:600}}>{v}</div>
                  </div>
                ))}
              </div>
            </Section>

            <Section title="ЦВЕТА ДЕТАЛЕЙ">
              <div style={{display:'flex',flexWrap:'wrap',gap:8,fontFamily:'system-ui',fontSize:12}}>
                {Object.entries(colors).map(([part,col]) => (
                  <div key={part} style={{display:'flex',alignItems:'center',gap:6,
                    background:'#F6F6F6',borderRadius:6,padding:'4px 9px'}}>
                    <div style={{width:15,height:15,borderRadius:3,background:col,border:'1px solid rgba(0,0,0,0.1)'}}/>
                    <span style={{fontWeight:600}}>{part}</span>
                    <span style={{color:'#BBB',fontFamily:'monospace',fontSize:10}}>{col.toUpperCase()}</span>
                  </div>
                ))}
              </div>
              {(specs.color1||specs.color2) && (
                <div style={{marginTop:8,fontSize:11,color:'#777',fontFamily:'system-ui'}}>
                  {specs.color1 && <span>Осн.: <b>{specs.color1}</b>{specs.pan1&&` (${specs.pan1})`}</span>}
                  {specs.color2 && <span style={{marginLeft:12}}>Доп.: <b>{specs.color2}</b>{specs.pan2&&` (${specs.pan2})`}</span>}
                </div>
              )}
            </Section>

            {specs.notes && (
              <Section title="ПРИМЕЧАНИЯ">
                <div style={{fontSize:12,color:'#444',lineHeight:1.7}}>{specs.notes}</div>
              </Section>
            )}

            <div style={{display:'flex',justifyContent:'space-between',
              borderTop:'1px solid #E0E0E0',paddingTop:12,marginTop:18,
              fontSize:11,color:'#AAA',fontFamily:'system-ui'}}>
              <div>
                <div>Подпись: ______________________</div>
                <div style={{marginTop:5}}>Дата утверждения: ______________</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontWeight:700,color:'#000',fontSize:12}}>Queen Star</div>
                <div>@queenstar.shop</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Button helper ─────────────────────────────────────────────────────
function Btn({ children, onClick, ghost }) {
  return (
    <button onClick={onClick} style={{
      padding:'7px 13px',
      background: ghost ? 'transparent' : '#C9A84C',
      color: ghost ? '#777' : '#0A0A0A',
      border: ghost ? '1px solid #2A2A2A' : 'none',
      borderRadius:8, cursor:'pointer', fontSize:12, fontWeight:700,
      whiteSpace:'nowrap',
    }}>{children}</button>
  );
}
