'use client';

import { useEffect, useRef, useState } from 'react';
import { Briefcase, AlertTriangle, Target, Users, Rocket, Flag, Megaphone, TrendingUp, Shield, Bookmark, Star, Zap } from 'lucide-react';
import type { RadarFolder } from '@/lib/types/radares';

const ICONS = [
  { id: 'Briefcase',     Icon: Briefcase },
  { id: 'AlertTriangle', Icon: AlertTriangle },
  { id: 'Target',        Icon: Target },
  { id: 'Users',         Icon: Users },
  { id: 'Rocket',        Icon: Rocket },
  { id: 'Flag',          Icon: Flag },
  { id: 'Megaphone',     Icon: Megaphone },
  { id: 'TrendingUp',    Icon: TrendingUp },
  { id: 'Shield',        Icon: Shield },
  { id: 'Bookmark',      Icon: Bookmark },
  { id: 'Star',          Icon: Star },
  { id: 'Zap',           Icon: Zap },
];

const COLORS = [
  '#3B82F6', '#EF4444', '#10B981',
  '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280',
];

interface FolderModalProps {
  folder?: RadarFolder | null;
  onClose: () => void;
  onSave: (name: string, icon: string | null, color: string | null) => Promise<void>;
}

export function FolderModal({ folder, onClose, onSave }: FolderModalProps) {
  const [name, setName]   = useState(folder?.name ?? '');
  const [icon, setIcon]   = useState<string | null>(folder?.icon ?? null);
  const [color, setColor] = useState<string | null>(folder?.color ?? COLORS[0]);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [onClose]);

  const handleSave = async () => {
    if (!name.trim()) { setError('El nombre es obligatorio'); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(name.trim(), icon, color);
      onClose();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error al guardar';
      setError(msg.includes('unique') ? 'Ya tienes una carpeta con ese nombre' : msg);
      setSaving(false);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)', borderRadius: 12,
          padding: '24px 28px', width: 380,
          boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
          border: '1px solid var(--border)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {folder ? 'Editar carpeta' : 'Nueva carpeta'}
          </h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Name */}
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>Nombre</label>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          placeholder="Nombre de la carpeta"
          maxLength={60}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '9px 12px', fontSize: 13,
            border: `1px solid ${error ? '#EF4444' : 'var(--border)'}`,
            borderRadius: 7, background: 'var(--bg-muted)',
            color: 'var(--text-primary)', outline: 'none',
            marginBottom: error ? 4 : 16,
          }}
        />
        {error && <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 14 }}>{error}</div>}

        {/* Icon */}
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Icono</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 18 }}>
          {ICONS.map(({ id, Icon }) => (
            <button
              key={id}
              onClick={() => setIcon(icon === id ? null : id)}
              title={id}
              style={{
                width: 34, height: 34, borderRadius: 7, cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                background: icon === id ? 'var(--accent)' : 'var(--bg-muted)',
                color: icon === id ? 'var(--bg)' : 'var(--text-secondary)',
                border: `1px solid ${icon === id ? 'var(--accent)' : 'var(--border)'}`,
              }}
            >
              <Icon size={14} />
            </button>
          ))}
        </div>

        {/* Color */}
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>Color</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              style={{
                width: 24, height: 24, borderRadius: '50%', background: c, border: 'none',
                cursor: 'pointer', outline: color === c ? `2px solid ${c}` : 'none',
                outlineOffset: 2, boxSizing: 'border-box',
              }}
            />
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px', fontSize: 13, cursor: 'pointer',
              border: '1px solid var(--border)', borderRadius: 7,
              background: 'none', color: 'var(--text-secondary)',
            }}
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: 'none', borderRadius: 7,
              background: 'var(--accent)', color: 'var(--bg)',
              opacity: saving ? 0.7 : 1,
            }}
          >
            {saving ? 'Guardando…' : (folder ? 'Guardar' : 'Crear')}
          </button>
        </div>
      </div>
    </div>
  );
}
