'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Folder, FolderOpen, Briefcase, Inbox, Archive,
  Users, User, UserCheck, Heart, Handshake,
  Building, Building2, Landmark, Factory, Store,
  Newspaper, Radio, Tv, Mic, Camera,
  Film, Megaphone, MessageCircle, Mail, Send,
  Target, Crosshair, Flag, Compass, Rocket,
  TrendingUp, Activity, BarChart3, LineChart, Globe,
  MapPin, Map, Star, Award, Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { RadarFolder } from '@/lib/types/radares';

export const FOLDER_ICONS: { id: string; Icon: LucideIcon }[] = [
  { id: 'Folder',        Icon: Folder        },
  { id: 'FolderOpen',    Icon: FolderOpen    },
  { id: 'Briefcase',     Icon: Briefcase     },
  { id: 'Inbox',         Icon: Inbox         },
  { id: 'Archive',       Icon: Archive       },
  { id: 'Users',         Icon: Users         },
  { id: 'User',          Icon: User          },
  { id: 'UserCheck',     Icon: UserCheck     },
  { id: 'Heart',         Icon: Heart         },
  { id: 'Handshake',     Icon: Handshake     },
  { id: 'Building',      Icon: Building      },
  { id: 'Building2',     Icon: Building2     },
  { id: 'Landmark',      Icon: Landmark      },
  { id: 'Factory',       Icon: Factory       },
  { id: 'Store',         Icon: Store         },
  { id: 'Newspaper',     Icon: Newspaper     },
  { id: 'Radio',         Icon: Radio         },
  { id: 'Tv',            Icon: Tv            },
  { id: 'Mic',           Icon: Mic           },
  { id: 'Camera',        Icon: Camera        },
  { id: 'Film',          Icon: Film          },
  { id: 'Megaphone',     Icon: Megaphone     },
  { id: 'MessageCircle', Icon: MessageCircle },
  { id: 'Mail',          Icon: Mail          },
  { id: 'Send',          Icon: Send          },
  { id: 'Target',        Icon: Target        },
  { id: 'Crosshair',     Icon: Crosshair     },
  { id: 'Flag',          Icon: Flag          },
  { id: 'Compass',       Icon: Compass       },
  { id: 'Rocket',        Icon: Rocket        },
  { id: 'TrendingUp',    Icon: TrendingUp    },
  { id: 'Activity',      Icon: Activity      },
  { id: 'BarChart3',     Icon: BarChart3     },
  { id: 'LineChart',     Icon: LineChart     },
  { id: 'Globe',         Icon: Globe         },
  { id: 'MapPin',        Icon: MapPin        },
  { id: 'Map',           Icon: Map           },
  { id: 'Star',          Icon: Star          },
  { id: 'Award',         Icon: Award         },
  { id: 'Trophy',        Icon: Trophy        },
];

export const FOLDER_COLORS: string[] = [
  '#6B7280', '#9CA3AF', '#1F2937',
  '#3B82F6', '#1D4ED8', '#60A5FA',
  '#10B981', '#047857', '#34D399',
  '#14B8A6', '#0EA5E9',
  '#F59E0B', '#D97706', '#FCD34D',
  '#EF4444', '#B91C1C',
  '#EC4899', '#BE185D',
  '#8B5CF6', '#6D28D9',
];

export const DEFAULT_FOLDER_ICON = FOLDER_ICONS[0].id;
export const DEFAULT_FOLDER_COLOR = FOLDER_COLORS[0];

export function getFolderIcon(id: string | null | undefined): LucideIcon {
  if (!id) return Folder;
  return FOLDER_ICONS.find((i) => i.id === id)?.Icon ?? Folder;
}

interface FolderModalProps {
  folder?: RadarFolder | null;
  onClose: () => void;
  onSave: (name: string, icon: string, color: string) => Promise<void>;
}

export function FolderModal({ folder, onClose, onSave }: FolderModalProps) {
  const [name, setName]   = useState(folder?.name ?? '');
  const [icon, setIcon]   = useState<string>(folder?.icon ?? DEFAULT_FOLDER_ICON);
  const [color, setColor] = useState<string>(folder?.color ?? DEFAULT_FOLDER_COLOR);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { inputRef.current?.focus(); }, []);

  useEffect(() => {
    const down = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', down);
    return () => window.removeEventListener('keydown', down);
  }, [onClose]);

  const trimmed = name.trim();
  const nameError = trimmed.length === 0
    ? 'El nombre es obligatorio'
    : trimmed.length > 40
      ? 'Máximo 40 caracteres'
      : '';

  const handleSave = async () => {
    if (nameError) { setError(nameError); return; }
    setSaving(true);
    setError('');
    try {
      await onSave(trimmed, icon, color);
      onClose();
    } catch (e) {
      const code = (e as { code?: string } | null)?.code;
      const msg = e instanceof Error ? e.message : 'Error al guardar';
      if (code === '23505' || /duplicate|unique/i.test(msg)) {
        setError('Ya tienes una carpeta con ese nombre');
      } else {
        setError(msg);
      }
      setSaving(false);
    }
  };

  const isEdit = !!folder;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--bg)', borderRadius: 14,
          padding: '22px 24px 20px', width: '100%', maxWidth: 460,
          boxShadow: '0 24px 72px rgba(0,0,0,0.2)',
          border: '1px solid var(--border)',
          maxHeight: '90vh', overflowY: 'auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--text-primary)' }}>
            {isEdit ? 'Editar carpeta' : 'Nueva carpeta'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Cerrar"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)', padding: 4 }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Name */}
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
          Nombre
        </label>
        <input
          ref={inputRef}
          value={name}
          onChange={(e) => { setName(e.target.value); if (error) setError(''); }}
          onKeyDown={(e) => { if (e.key === 'Enter') handleSave(); }}
          placeholder="Ej. Política, Competencia…"
          maxLength={40}
          style={{
            width: '100%', boxSizing: 'border-box',
            padding: '9px 12px', fontSize: 13,
            border: `1px solid ${error ? '#EF4444' : 'var(--border)'}`,
            borderRadius: 7, background: 'var(--bg-muted)',
            color: 'var(--text-primary)', outline: 'none',
            marginBottom: error ? 4 : 16,
          }}
        />
        {error && (
          <div style={{ fontSize: 12, color: '#EF4444', marginBottom: 14 }}>{error}</div>
        )}

        {/* Icon picker — 8 × 5 */}
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          Icono
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(8, 36px)',
          gap: 6, marginBottom: 18,
          justifyContent: 'start',
        }}>
          {FOLDER_ICONS.map(({ id, Icon }) => {
            const selected = icon === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setIcon(id)}
                title={id}
                style={{
                  width: 36, height: 36, borderRadius: 8, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: selected ? color : 'transparent',
                  color: selected ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${selected ? 'var(--accent)' : 'var(--border)'}`,
                  transition: 'background 0.12s, border-color 0.12s',
                }}
              >
                <Icon size={16} strokeWidth={selected ? 2 : 1.7} />
              </button>
            );
          })}
        </div>

        {/* Color picker — 10 × 2 */}
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: 8 }}>
          Color
        </label>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(10, 28px)',
          gap: 8, marginBottom: 22,
          justifyContent: 'start',
        }}>
          {FOLDER_COLORS.map((c) => {
            const selected = color === c;
            return (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                title={c}
                aria-label={`Color ${c}`}
                aria-pressed={selected}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: c, border: 'none', padding: 0,
                  cursor: 'pointer',
                  boxShadow: selected
                    ? `0 0 0 2px var(--bg), 0 0 0 4px var(--accent)`
                    : 'none',
                  transition: 'box-shadow 0.12s',
                }}
              />
            );
          })}
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
            disabled={saving || !!nameError}
            style={{
              padding: '8px 18px', fontSize: 13, fontWeight: 600,
              cursor: saving || nameError ? 'not-allowed' : 'pointer',
              border: 'none', borderRadius: 7,
              background: 'var(--accent)', color: 'var(--bg)',
              opacity: saving || nameError ? 0.6 : 1,
            }}
          >
            {saving ? 'Guardando…' : (isEdit ? 'Guardar' : 'Crear')}
          </button>
        </div>
      </div>
    </div>
  );
}
