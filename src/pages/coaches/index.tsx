import { useEffect, useRef, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from '@dr.pogodin/react-helmet';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { supabase } from '@/lib/supabase';
import { type Coach } from './data';

const EASE = 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
const C = {
  dark900:     '#1A1A1A',
  dark800:     '#2E2E2E',
  offWhite:    '#F5F5F0',
  muted:       '#E8E8E2',
  tan:         '#D9CFBB',
  tanHover:    '#c4b9a4',
  textPrimary: '#1A1A1A',
  textMuted:   '#4A4A42',
  textFaint:   'rgba(26,26,26,0.45)',
  borderLight: 'rgba(26,26,26,0.10)',
  onDark:      '#F5F5F0',
  onDarkMuted: 'rgba(245,245,240,0.50)',
  onDarkFaint: 'rgba(245,245,240,0.25)',
  errorRed:    '#c0704a',
};


// ─── Blank coach template for "Add" form ─────────────────────────────────────
const blankCoach = (): Omit<Coach, 'id' | 'index'> => ({
  name: '', title: '', focus: '', tags: [], bio: '',
});

// ─── Reveal hooks ─────────────────────────────────────────────────────────────
function useReveal(ref: React.RefObject<Element | null>, threshold = 0.06) {
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { el.classList.add('is-visible'); obs.disconnect(); } },
      { threshold },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [ref, threshold]);
}

// ─── Admin: Edit modal ────────────────────────────────────────────────────────
interface EditModalProps {
  coach: Coach | null;
  isNew: boolean;
  onSave: (data: Omit<Coach, 'id' | 'index'>) => void | Promise<void>;
  onClose: () => void;
}

function EditModal({ coach, isNew, onSave, onClose }: EditModalProps) {
  const [form, setForm] = useState<Omit<Coach, 'id' | 'index'>>(
    coach ? { name: coach.name, title: coach.title, focus: coach.focus, tags: coach.tags, bio: coach.bio }
           : blankCoach(),
  );
  const [tagsRaw, setTagsRaw] = useState(coach?.tags.join(', ') ?? '');
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on overlay click
  const handleOverlay = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSave = () => {
    if (!form.name.trim()) return;
    onSave({ ...form, tags: tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) });
  };

  const fieldStyle: React.CSSProperties = {
    width: '100%', background: 'transparent', border: 'none',
    borderBottom: `1px solid rgba(245,245,240,0.15)`, borderRadius: 0,
    padding: '10px 0', fontFamily: 'var(--font-sans)', fontSize: '15px',
    color: C.onDark, outline: 'none', caretColor: C.tan,
  };
  const labelStyle: React.CSSProperties = {
    fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700,
    textTransform: 'uppercase', letterSpacing: '0.12em', color: C.onDarkMuted,
    display: 'block', marginBottom: '6px',
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={isNew ? 'Add coach' : 'Edit coach'}
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: C.dark800, borderRadius: '4px', padding: 'clamp(24px,4vw,40px)', width: '100%', maxWidth: '520px', maxHeight: '90vh', overflowY: 'auto', border: `1px solid rgba(245,245,240,0.08)` }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px' }}>
          <h2 style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: '20px', fontWeight: 400, color: C.onDark, margin: 0 }}>
            {isNew ? 'Add coach' : 'Edit coach'}
          </h2>
          <button onClick={onClose} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: C.onDarkMuted, fontSize: '20px', lineHeight: 1, padding: '4px' }}>×</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {([
            ['Name',       'name',  'text',     'Jessie Li'],
            ['Title',      'title', 'text',     'Founder & Lead Coach'],
            ['Focus area', 'focus', 'text',     'Executive Leadership'],
          ] as const).map(([label, field, type, ph]) => (
            <div key={field}>
              <label style={labelStyle}>{label}</label>
              <input type={type} placeholder={ph} value={(form as unknown as Record<string, string>)[field]}
                onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                style={fieldStyle} />
            </div>
          ))}

          <div>
            <label style={labelStyle}>Tags (comma-separated)</label>
            <input type="text" placeholder="Leadership, Venture Building" value={tagsRaw}
              onChange={(e) => setTagsRaw(e.target.value)}
              style={fieldStyle} />
          </div>

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea placeholder="Short bio…" value={form.bio}
              onChange={(e) => setForm((p) => ({ ...p, bio: e.target.value }))}
              rows={4}
              style={{ ...fieldStyle, resize: 'vertical', minHeight: '80px', lineHeight: 1.6 }} />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '32px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: 'none', border: `1px solid rgba(245,245,240,0.15)`, borderRadius: '2px', padding: '10px 24px', color: C.onDarkMuted, fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={handleSave} disabled={!form.name.trim()}
            style={{ background: C.tan, border: 'none', borderRadius: '2px', padding: '10px 24px', color: C.dark900, fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: form.name.trim() ? 'pointer' : 'not-allowed', opacity: form.name.trim() ? 1 : 0.5 }}>
            {isNew ? 'Add coach' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Admin: Delete confirm ────────────────────────────────────────────────────
function DeleteConfirm({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onCancel]);

  return (
    <div role="dialog" aria-modal="true" aria-label="Confirm delete"
      style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ background: C.dark800, borderRadius: '4px', padding: '32px', maxWidth: '380px', width: '100%', border: `1px solid rgba(245,245,240,0.08)` }}>
        <h2 style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: '18px', fontWeight: 400, color: C.onDark, marginBottom: '12px' }}>Remove coach?</h2>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '14px', color: C.onDarkMuted, lineHeight: 1.6, marginBottom: '28px' }}>
          This will remove <strong style={{ color: C.onDark }}>{name}</strong> from the directory. This cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button onClick={onCancel} style={{ background: 'none', border: `1px solid rgba(245,245,240,0.15)`, borderRadius: '2px', padding: '10px 20px', color: C.onDarkMuted, fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
            Cancel
          </button>
          <button onClick={onConfirm} style={{ background: C.errorRed, border: 'none', borderRadius: '2px', padding: '10px 20px', color: '#fff', fontFamily: 'var(--font-sans)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer' }}>
            Remove
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function CoachesPage() {
  const { user, logout, isAdmin } = useAuth();
  const { toast } = useToast();
  const headerRef = useRef<HTMLElement>(null);

  const [coaches,      setCoaches]     = useState<Coach[]>([]);
  const [loadingData,  setLoadingData] = useState(true);
  const [dataError,    setDataError]   = useState<string | null>(null);
  const [editTarget,   setEditTarget]  = useState<Coach | null>(null);
  const [showAdd,      setShowAdd]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Coach | null>(null);
  const [dragging,     setDragging]    = useState<string | null>(null);
  const [dragOver,     setDragOver]    = useState<string | null>(null);

  useReveal(headerRef, 0.01);

  // ── Fetch coaches from Supabase ────────────────────────────────────────────
  const fetchCoaches = useCallback(async () => {
    setLoadingData(true);
    setDataError(null);
    const { data, error } = await supabase
      .from('coaches')
      .select('*')
      .order('index');
    if (error) {
      setDataError('Failed to load coaches. Please refresh.');
    } else {
      setCoaches((data as Coach[]) ?? []);
    }
    setLoadingData(false);
  }, []);

  useEffect(() => { void fetchCoaches(); }, [fetchCoaches]);

  // Reindex after any order change
  const reindex = (list: Coach[]): Coach[] =>
    list.map((c, i) => ({ ...c, index: String(i + 1).padStart(2, '0') }));

  // ── Admin actions ──────────────────────────────────────────────────────────
  const handleSaveEdit = useCallback(async (data: Omit<Coach, 'id' | 'index'>) => {
    if (!editTarget) return;
    const { error } = await supabase
      .from('coaches')
      .update(data)
      .eq('id', editTarget.id);
    if (error) { toast('Failed to update coach.', 'error' as never); return; }
    setEditTarget(null);
    toast('Coach updated.', 'success');
    await fetchCoaches();
  }, [editTarget, toast, fetchCoaches]);

  const handleAdd = useCallback(async (data: Omit<Coach, 'id' | 'index'>) => {
    const newIndex = String(coaches.length + 1).padStart(2, '0');
    const { error } = await supabase
      .from('coaches')
      .insert({ ...data, index: newIndex });
    if (error) { toast('Failed to add coach.', 'error' as never); return; }
    setShowAdd(false);
    toast(`${data.name || 'Coach'} added.`, 'success');
    await fetchCoaches();
  }, [coaches.length, toast, fetchCoaches]);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    const name = deleteTarget.name;
    const { error } = await supabase
      .from('coaches')
      .delete()
      .eq('id', deleteTarget.id);
    if (error) { toast('Failed to remove coach.', 'error' as never); return; }
    setDeleteTarget(null);
    toast(`${name} removed.`, 'info');
    await fetchCoaches();
  }, [deleteTarget, toast, fetchCoaches]);

  // ── Drag-to-reorder ────────────────────────────────────────────────────────
  const handleDragStart = (id: string) => setDragging(id);
  const handleDragOver  = (e: React.DragEvent, id: string) => { e.preventDefault(); setDragOver(id); };
  const handleDrop      = async (targetId: string) => {
    if (!dragging || dragging === targetId) { setDragging(null); setDragOver(null); return; }
    const list = [...coaches];
    const fromIdx = list.findIndex((c) => c.id === dragging);
    const toIdx   = list.findIndex((c) => c.id === targetId);
    const [item] = list.splice(fromIdx, 1);
    list.splice(toIdx, 0, item);
    const reindexed = reindex(list);
    setCoaches(reindexed);
    setDragging(null);
    setDragOver(null);
    await Promise.all(
      reindexed.map((c) =>
        supabase.from('coaches').update({ index: c.index }).eq('id', c.id),
      ),
    );
    toast('Order updated.', 'info', 2000);
  };
  const handleDragEnd = () => { setDragging(null); setDragOver(null); };

  return (
    <>
      <Helmet>
        <title>Our Coaches — Unlsh</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <style>{`
        .ch-header { opacity: 0; transform: translateY(14px); transition: opacity 700ms ${EASE}, transform 700ms ${EASE}; }
        .ch-header.is-visible { opacity: 1; transform: translateY(0); }
        .ch-rule { display: block; width: 28px; height: 1px; background: ${C.tan}; transform: scaleX(0); transform-origin: left; transition: transform 450ms ${EASE} 160ms; }
        .ch-header.is-visible .ch-rule { transform: scaleX(1); }

        .coach-row {
          display: grid;
          grid-template-columns: 3rem 1fr auto;
          align-items: center;
          gap: clamp(12px, 2vw, 28px);
          padding: clamp(20px, 3vw, 36px) 0;
          border-top: 1px solid ${C.borderLight};
          text-decoration: none;
          color: inherit;
          transition: background-color 280ms ${EASE};
        }
        .coach-row-link:hover { background-color: ${C.muted}; }
        .coach-row:focus-visible { outline: 2px solid ${C.dark900}; outline-offset: 2px; }

        .coach-arrow { width: 18px; height: 18px; color: ${C.textFaint}; transition: color 220ms ${EASE}, transform 220ms ${EASE}; }
        .coach-row-link:hover .coach-arrow { color: ${C.textPrimary}; transform: translate(3px,-3px); }

        .coach-tag { display: inline-block; padding: 3px 10px; border: 1px solid ${C.borderLight}; border-radius: 999px; font-family: var(--font-sans); font-size: 10px; font-weight: 500; letter-spacing: 0.08em; text-transform: uppercase; color: ${C.textFaint}; white-space: nowrap; }

        .ch-logout { background: none; border: none; cursor: pointer; font-family: var(--font-sans); font-size: 11px; font-weight: 500; text-transform: uppercase; letter-spacing: 0.12em; padding: 0; transition: color 200ms ${EASE}; }
        .ch-logout:focus-visible { outline: 2px solid currentColor; outline-offset: 3px; }

        .admin-btn { background: none; border: none; cursor: pointer; font-family: var(--font-sans); font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; padding: 5px 10px; border-radius: 2px; transition: background 180ms ${EASE}, color 180ms ${EASE}; }
        .admin-btn:focus-visible { outline: 2px solid ${C.dark900}; outline-offset: 2px; }
        .admin-btn-edit  { color: ${C.textMuted}; }
        .admin-btn-edit:hover  { background: rgba(26,26,26,0.06); color: ${C.textPrimary}; }
        .admin-btn-delete { color: ${C.errorRed}; }
        .admin-btn-delete:hover { background: rgba(192,112,74,0.08); }

        .drag-handle { cursor: grab; color: ${C.textFaint}; padding: 4px; display: flex; align-items: center; }
        .drag-handle:active { cursor: grabbing; }
        .drag-over-top    { border-top: 2px solid ${C.tan} !important; }
        .drag-over-bottom { border-bottom: 2px solid ${C.tan} !important; }
        .dragging-row { opacity: 0.4; }

        .add-coach-btn {
          display: inline-flex; align-items: center; gap: 8px;
          background: ${C.dark900}; color: ${C.onDark};
          font-family: var(--font-sans); font-size: 12px; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.12em;
          padding: 11px 24px; border: none; border-radius: 2px; cursor: pointer;
          transition: background 220ms ${EASE};
        }
        .add-coach-btn:hover { background: ${C.dark800}; }
        .add-coach-btn:focus-visible { outline: 2px solid ${C.dark900}; outline-offset: 3px; }

        @media (max-width: 600px) {
          .coach-row { grid-template-columns: 2.5rem 1fr auto; }
          .coach-tags { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
        }
      `}</style>

      <main style={{ backgroundColor: C.offWhite, minHeight: '100vh' }}>

        {/* Members bar */}
        <div style={{ backgroundColor: C.dark900, padding: '10px clamp(24px,5vw,80px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.12em', color: C.onDarkFaint }}>
              Members area
            </span>
            {isAdmin && (
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' as const, letterSpacing: '0.1em', color: C.tan, background: 'rgba(217,207,187,0.12)', padding: '3px 8px', borderRadius: '2px' }}>
                Admin
              </span>
            )}
            {user?.email && (
              <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', color: C.onDarkFaint }}>
                · {user.email}
              </span>
            )}
          </div>
          <button className="ch-logout" onClick={logout}
            style={{ color: C.onDarkFaint }}
            onMouseEnter={(e) => (e.currentTarget.style.color = C.onDark)}
            onMouseLeave={(e) => (e.currentTarget.style.color = C.onDarkFaint)}>
            Sign out
          </button>
        </div>

        {/* Page header */}
        <header ref={headerRef} className="ch-header" style={{ padding: 'clamp(56px,8vw,100px) clamp(24px,5vw,80px) clamp(32px,4vw,48px)', maxWidth: '800px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '18px' }}>
            <span className="ch-rule" aria-hidden="true" />
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: '11px', fontWeight: 500, textTransform: 'uppercase' as const, letterSpacing: '0.14em', color: C.textFaint }}>
              Our coaches
            </span>
          </div>
          <h1 style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: 'clamp(32px,5.5vw,52px)', fontWeight: 400, lineHeight: 1.06, letterSpacing: '0.01em', color: C.textPrimary, marginBottom: '16px' }}>
            World-class guidance
          </h1>
          <p style={{ fontFamily: 'var(--font-sans)', fontSize: '15px', lineHeight: 1.7, color: C.textMuted, maxWidth: '52ch', letterSpacing: '0.01em' }}>
            {isAdmin
              ? 'Manage the coach directory below. Drag rows to reorder, or use the controls to edit and add coaches.'
              : 'Each coach has operated at the highest levels of business and leadership. Select a profile to learn more and book a session.'}
          </p>
        </header>

        {/* Coach list */}
        <section style={{ padding: '0 clamp(24px,5vw,80px) clamp(64px,9vw,120px)' }} aria-label="Coach directory">

          {loadingData && (
            <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: C.textFaint, padding: '24px 0' }}>
              Loading…
            </p>
          )}
          {dataError && (
            <p role="alert" style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: C.errorRed, padding: '24px 0' }}>
              {dataError}
            </p>
          )}

          {/* Admin: add button */}
          {isAdmin && (
            <div style={{ marginBottom: '24px' }}>
              <button className="add-coach-btn" onClick={() => setShowAdd(true)}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                  <path d="M7 1v12M1 7h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                Add coach
              </button>
              {isAdmin && (
                <span style={{ marginLeft: '12px', fontFamily: 'var(--font-sans)', fontSize: '11px', color: C.textFaint, letterSpacing: '0.02em' }}>
                  Drag rows to reorder
                </span>
              )}
            </div>
          )}

          <ol style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {coaches.map((coach) => {
              const isDraggingThis = dragging === coach.id;
              const isDragTarget   = dragOver === coach.id;

              return (
                <li
                  key={coach.id}
                  draggable={isAdmin}
                  onDragStart={isAdmin ? () => handleDragStart(coach.id) : undefined}
                  onDragOver={isAdmin ? (e) => handleDragOver(e, coach.id) : undefined}
                  onDrop={isAdmin ? () => handleDrop(coach.id) : undefined}
                  onDragEnd={isAdmin ? handleDragEnd : undefined}
                  className={[
                    isDraggingThis ? 'dragging-row' : '',
                    isDragTarget   ? 'drag-over-top' : '',
                  ].join(' ')}>

                  {isAdmin ? (
                    /* Admin view — row with controls, not a link */
                    <div className="coach-row" style={{ cursor: 'default' }}>
                      {/* Drag handle + index */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="drag-handle" aria-label="Drag to reorder" title="Drag to reorder">
                          <svg width="12" height="16" viewBox="0 0 12 16" fill="none" aria-hidden="true">
                            <circle cx="4" cy="3" r="1.2" fill="currentColor"/>
                            <circle cx="8" cy="3" r="1.2" fill="currentColor"/>
                            <circle cx="4" cy="8" r="1.2" fill="currentColor"/>
                            <circle cx="8" cy="8" r="1.2" fill="currentColor"/>
                            <circle cx="4" cy="13" r="1.2" fill="currentColor"/>
                            <circle cx="8" cy="13" r="1.2" fill="currentColor"/>
                          </svg>
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.textFaint, letterSpacing: '0.04em' }}>
                          {coach.index}
                        </span>
                      </div>

                      {/* Content */}
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' as const }}>
                          <span style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: 'clamp(16px,2.2vw,20px)', fontWeight: 400, color: C.textPrimary, letterSpacing: '0.01em' }}>
                            {coach.name}
                          </span>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: C.textFaint }}>
                            {coach.title} · {coach.focus}
                          </span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: C.textMuted, lineHeight: 1.55, maxWidth: '52ch', marginBottom: '8px' }}>
                          {coach.bio}
                        </p>
                        <div className="coach-tags" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' as const }}>
                          {coach.tags.map((t) => <span key={t} className="coach-tag">{t}</span>)}
                        </div>
                      </div>

                      {/* Admin controls */}
                      <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
                        <button className="admin-btn admin-btn-edit" onClick={() => setEditTarget(coach)} aria-label={`Edit ${coach.name}`}>
                          Edit
                        </button>
                        <button className="admin-btn admin-btn-delete" onClick={() => setDeleteTarget(coach)} aria-label={`Delete ${coach.name}`}>
                          Delete
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* User view — clickable link row */
                    <Link to={`/coaches/${coach.id}`} className="coach-row coach-row-link" aria-label={`${coach.name} — ${coach.focus}`}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '12px', color: C.textFaint, letterSpacing: '0.04em' }}>
                        {coach.index}
                      </span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginBottom: '4px', flexWrap: 'wrap' as const }}>
                          <span style={{ fontFamily: "Futura,'Trebuchet MS',sans-serif", fontSize: 'clamp(16px,2.2vw,20px)', fontWeight: 400, color: C.textPrimary, letterSpacing: '0.01em' }}>{coach.name}</span>
                          <span style={{ fontFamily: 'var(--font-sans)', fontSize: '12px', color: C.textFaint }}>{coach.title}</span>
                        </div>
                        <p style={{ fontFamily: 'var(--font-sans)', fontSize: '13px', color: C.textMuted, lineHeight: 1.55, maxWidth: '52ch', marginBottom: '8px' }}>{coach.bio}</p>
                        <div className="coach-tags" style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' as const }}>
                          {coach.tags.map((t) => <span key={t} className="coach-tag">{t}</span>)}
                        </div>
                      </div>
                      <svg className="coach-arrow" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                        <path d="M4 16L16 4M16 4H8M16 4v8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  )}
                </li>
              );
            })}
            <li aria-hidden="true" style={{ borderTop: `1px solid ${C.borderLight}` }} />
          </ol>
        </section>
      </main>

      {/* Modals */}
      {(editTarget) && (
        <EditModal coach={editTarget} isNew={false} onSave={handleSaveEdit} onClose={() => setEditTarget(null)} />
      )}
      {showAdd && (
        <EditModal coach={null} isNew={true} onSave={handleAdd} onClose={() => setShowAdd(false)} />
      )}
      {deleteTarget && (
        <DeleteConfirm name={deleteTarget.name} onConfirm={handleDelete} onCancel={() => setDeleteTarget(null)} />
      )}
    </>
  );
}
