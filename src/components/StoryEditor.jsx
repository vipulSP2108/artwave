import { useState, useRef, useEffect } from 'react';
import { Image as ImageIcon, Type, AlignLeft, AlignCenter, AlignRight, X, Plus, Move } from 'lucide-react';
import { fileToBase64 } from '../utils';

const DEFAULT_BGS = [
  'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', // Deep Indigo
  'linear-gradient(135deg, #4c1d95 0%, #8b5cf6 100%)', // Purple
  'linear-gradient(135deg, #831843 0%, #e11d48 100%)', // Rose
  'linear-gradient(135deg, #14532d 0%, #22c55e 100%)', // Green
  'linear-gradient(135deg, #78350f 0%, #f59e0b 100%)', // Amber
  '#000000', // Black
];

const COLORS = ['#ffffff', '#000000', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6'];
const FONT_SIZES = [16, 20, 24, 32, 48, 64];

export default function StoryEditor({ onChange, initialData }) {
  const [bg, setBg] = useState(initialData?.bg || DEFAULT_BGS[0]);
  const [elements, setElements] = useState(initialData?.elements || []);
  const [selectedId, setSelectedId] = useState(null);
  
  const containerRef = useRef(null);
  const fileRef = useRef(null);
  const [dragging, setDragging] = useState(null);
  const [resizing, setResizing] = useState(null); // { id, type: 'scale'|'width', startX, initVal }

  useEffect(() => {
    // Report changes to parent
    onChange({ bg, elements });
  }, [bg, elements, onChange]);

  const handleBgUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const base64 = await fileToBase64(file);
    setBg(`url(${base64})`);
  };

  const addTextElement = () => {
    const newEl = {
      id: Date.now().toString(),
      text: 'Double click to edit',
      x: 50, // % from left
      y: 50, // % from top
      align: 'center',
      color: '#ffffff',
      fontSize: 24,
      width: 100
    };
    setElements([...elements, newEl]);
    setSelectedId(newEl.id);
  };

  const updateSelected = (updates) => {
    if (!selectedId) return;
    setElements(els => els.map(el => el.id === selectedId ? { ...el, ...updates } : el));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements(els => els.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  // Drag logic
  const onPointerDown = (e, id) => {
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find(x => x.id === id);
    if (!el || !containerRef.current) return;
    
    setDragging({
      id,
      startX: e.clientX,
      startY: e.clientY,
      initElemX: el.x,
      initElemY: el.y
    });
  };

  const onResizeDown = (e, id, type) => {
    e.stopPropagation();
    setSelectedId(id);
    const el = elements.find(x => x.id === id);
    if (!el || !containerRef.current) return;
    
    setResizing({
      id,
      type,
      startX: e.clientX,
      initVal: type === 'scale' ? el.fontSize : (el.width || 100)
    });
  };

  const onPointerMove = (e) => {
    if (!containerRef.current) return;

    if (resizing) {
      const dx = e.clientX - resizing.startX;
      if (resizing.type === 'scale') {
        const newFontSize = Math.max(12, Math.min(150, resizing.initVal + dx * 0.5));
        setElements(els => els.map(el => el.id === resizing.id ? { ...el, fontSize: newFontSize } : el));
      } else if (resizing.type === 'width') {
        const rect = containerRef.current.getBoundingClientRect();
        const dxPct = (dx / rect.width) * 100;
        const newWidth = Math.max(10, Math.min(100, resizing.initVal + dxPct));
        setElements(els => els.map(el => el.id === resizing.id ? { ...el, width: newWidth } : el));
      }
      return;
    }

    if (dragging) {
      const rect = containerRef.current.getBoundingClientRect();
      const dx = e.clientX - dragging.startX;
      const dy = e.clientY - dragging.startY;
      
      const dxPct = (dx / rect.width) * 100;
      const dyPct = (dy / rect.height) * 100;
      
      let newX = dragging.initElemX + dxPct;
      let newY = dragging.initElemY + dyPct;
      
      newX = Math.max(0, Math.min(100, newX));
      newY = Math.max(0, Math.min(100, newY));

      setElements(els => els.map(el => el.id === dragging.id ? { ...el, x: newX, y: newY } : el));
    }
  };

  const onPointerUp = () => {
    if (dragging) setDragging(null);
    if (resizing) setResizing(null);
  };

  const selectedEl = elements.find(x => x.id === selectedId);

  return (
    <div className="bg-ink-900 border border-ink-700 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-xl">
      
      {/* Canvas Area */}
      <div className="flex-1 p-4 flex items-center justify-center bg-ink-950 bg-[radial-gradient(#ffffff11_1px,transparent_1px)] [background-size:16px_16px]">
        <div 
          ref={containerRef}
          className="relative w-full max-w-[360px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-ink-800 touch-none"
          style={{ 
            background: bg.startsWith('url') ? `${bg} center/cover no-repeat` : bg 
          }}
          onPointerDown={() => setSelectedId(null)}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerLeave={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {elements.map(el => (
            <div
              key={el.id}
              className={`absolute px-2 py-1 select-none border-2 transition-colors duration-150 ${selectedId === el.id ? 'border-amber-400 border-dashed bg-black/20 z-20' : 'border-transparent hover:border-white/30 z-10'}`}
              style={{
                left: `${el.x}%`,
                top: `${el.y}%`,
                transform: 'translate(-50%, -50%)',
                color: el.color,
                fontSize: `${el.fontSize}px`,
                textAlign: el.align,
                whiteSpace: 'pre-wrap',
                minWidth: '50px',
                width: el.width ? `${el.width}%` : 'auto',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                textShadow: '0 2px 10px rgba(0,0,0,0.5)',
              }}
            >
              <div 
                className="w-full h-full cursor-move pointer-events-auto" 
                onPointerDown={(e) => onPointerDown(e, el.id)}
              >
                {el.text || 'Empty text'}
              </div>

              {selectedId === el.id && (
                <>
                  {/* Scale Handle (Bottom Right) */}
                  <div 
                    className="absolute -bottom-2 -right-2 w-4 h-4 bg-amber-400 rounded-full border-2 border-ink-900 cursor-nwse-resize z-30 pointer-events-auto hover:scale-125 transition-transform"
                    onPointerDown={(e) => onResizeDown(e, el.id, 'scale')}
                    title="Drag to scale font size"
                  />
                  {/* Width Handle (Right Edge) */}
                  <div 
                    className="absolute top-1/2 -right-2 w-2 h-6 bg-white rounded border border-ink-900 -translate-y-1/2 cursor-ew-resize z-30 pointer-events-auto hover:bg-amber-400 transition-colors"
                    onPointerDown={(e) => onResizeDown(e, el.id, 'width')}
                    title="Drag to change box width"
                  />
                </>
              )}
            </div>
          ))}
          
          {/* Instructions overlay if empty */}
          {elements.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50">
              <div className="text-center font-ui text-white/70">
                <p>Click "Add Text" to start</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Toolbar / Controls */}
      <div className="w-full md:w-80 bg-ink-800 border-t md:border-t-0 md:border-l border-ink-700 p-5 flex flex-col gap-6 overflow-y-auto max-h-[600px]">
        
        {/* Background controls */}
        <div>
          <h3 className="text-xs font-ui font-semibold text-ink-400 uppercase tracking-wider mb-3">Background</h3>
          <div className="grid grid-cols-4 gap-2 mb-3">
            {DEFAULT_BGS.map((b, i) => (
              <button 
                key={i} 
                onClick={() => setBg(b)}
                className={`h-10 rounded-lg border-2 transition-all ${bg === b ? 'border-amber-400 scale-110 shadow-lg z-10' : 'border-transparent hover:border-ink-500'}`}
                style={{ background: b }}
              />
            ))}
          </div>
          <button 
            onClick={() => fileRef.current?.click()}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-ink-600 bg-ink-900 text-ink-300 hover:text-white hover:border-ink-400 transition-all font-ui text-sm"
          >
            <ImageIcon size={16}/> Upload Custom Background
          </button>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleBgUpload} className="hidden" />
        </div>

        <hr className="border-ink-700" />

        {/* Element controls */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-ui font-semibold text-ink-400 uppercase tracking-wider">Text Elements</h3>
            <button 
              onClick={addTextElement}
              className="flex items-center gap-1 px-2 py-1 bg-amber-400/10 text-amber-400 rounded hover:bg-amber-400/20 transition-colors text-xs font-bold"
            >
              <Plus size={12}/> Add Text
            </button>
          </div>

          {selectedEl ? (
            <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-200">
              
              {/* Text Content */}
              <div>
                <label className="block text-xs font-ui text-ink-500 mb-1.5">Text Content</label>
                <textarea
                  value={selectedEl.text}
                  onChange={(e) => updateSelected({ text: e.target.value })}
                  className="w-full bg-ink-900 border border-ink-700 rounded-lg p-2.5 text-sm text-ink-200 font-ui resize-none focus:outline-none focus:border-amber-400 transition-colors"
                  rows={3}
                  placeholder="Enter text..."
                />
              </div>



              {/* Align & Color */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-ui text-ink-500 mb-1.5">Alignment</label>
                  <div className="flex bg-ink-900 rounded p-1">
                    {[
                      { v: 'left', i: AlignLeft },
                      { v: 'center', i: AlignCenter },
                      { v: 'right', i: AlignRight }
                    ].map(a => (
                      <button key={a.v} onClick={() => updateSelected({ align: a.v })}
                        className={`flex-1 flex items-center justify-center py-1.5 rounded transition-colors ${selectedEl.align === a.v ? 'bg-ink-700 text-white' : 'text-ink-500 hover:text-ink-300'}`}
                      >
                        <a.i size={14}/>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-ui text-ink-500 mb-1.5">Color</label>
                  <div className="flex flex-wrap items-center gap-1">
                    {COLORS.map(c => (
                      <button key={c} onClick={() => updateSelected({ color: c })}
                        className={`w-6 h-6 rounded-full border-2 transition-transform ${selectedEl.color === c ? 'border-amber-400 scale-125' : 'border-transparent hover:scale-110'}`}
                        style={{ backgroundColor: c, boxShadow: c==='#000000'?'inset 0 0 0 1px #333':'' }}
                      />
                    ))}
                    <div className="relative w-6 h-6 ml-1 rounded-full overflow-hidden border-2 border-ink-600 hover:border-amber-400 transition-colors cursor-pointer" style={{ background: 'conic-gradient(red, yellow, lime, aqua, blue, magenta, red)' }}>
                      <input 
                        type="color" 
                        value={selectedEl.color} 
                        onChange={(e) => updateSelected({ color: e.target.value })}
                        className="absolute inset-[-10px] w-[50px] h-[50px] cursor-pointer opacity-0"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Position hints */}
              <div className="p-3 bg-ink-900 rounded-lg border border-ink-800 flex items-start gap-2 text-xs font-ui text-ink-400">
                <Move size={14} className="mt-0.5 flex-shrink-0 opacity-70"/>
                <p>Drag the text box directly on the canvas to move it.</p>
              </div>

              <button 
                onClick={deleteSelected}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-rose-900/20 text-rose-400 hover:bg-rose-900/40 hover:text-rose-300 transition-colors text-sm font-ui"
              >
                <X size={14}/> Delete Element
              </button>

            </div>
          ) : (
            <div className="text-center py-8 bg-ink-900/50 rounded-lg border border-dashed border-ink-700">
              <Type size={24} className="mx-auto text-ink-600 mb-2" />
              <p className="text-sm font-ui text-ink-500">Select a text element to edit its properties.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
