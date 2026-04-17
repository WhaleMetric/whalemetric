'use client';

import { useState, useRef } from 'react';

export type WeekSchedule = boolean[][]; // [7 days][48 half-hours]

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const HOUR_LABELS = ['00', '02', '04', '06', '08', '10', '12', '14', '16', '18', '20', '22'];

export function emptyWeekSchedule(): WeekSchedule {
  return Array.from({ length: 7 }, () => Array(48).fill(false));
}

function halfHourToLabel(i: number) {
  const h = String(Math.floor(i / 2)).padStart(2, '0');
  const m = i % 2 === 0 ? '00' : '30';
  return `${h}:${m}`;
}

export function getActiveRanges(mask: boolean[]): string {
  const ranges: string[] = [];
  let start: number | null = null;
  for (let i = 0; i <= 48; i++) {
    const on = i < 48 && mask[i];
    if (on && start === null) { start = i; }
    else if (!on && start !== null) {
      ranges.push(`${halfHourToLabel(start)}–${halfHourToLabel(i)}`);
      start = null;
    }
  }
  if (!ranges.length) return 'Sin grabación';
  return 'Activo: ' + ranges.join(', ');
}

interface Props {
  schedule: WeekSchedule;
  onChange: (next: WeekSchedule) => void;
}

export default function ScheduleGrid({ schedule, onChange }: Props) {
  const [activeDay, setActiveDay] = useState(0);
  const dragging = useRef(false);
  const dragValue = useRef(false);

  function applySlot(slot: number, value: boolean) {
    onChange(
      schedule.map((d, di) =>
        di === activeDay ? d.map((v, si) => (si === slot ? value : v)) : d
      )
    );
  }

  function handleMouseDown(slot: number) {
    dragging.current = true;
    dragValue.current = !schedule[activeDay][slot];
    applySlot(slot, dragValue.current);
  }

  function handleMouseEnter(slot: number) {
    if (!dragging.current) return;
    applySlot(slot, dragValue.current);
  }

  function stopDrag() {
    dragging.current = false;
  }

  const mask = schedule[activeDay];
  const rangeText = getActiveRanges(mask);
  const activeCount = mask.filter(Boolean).length;

  return (
    <div onMouseUp={stopDrag} onMouseLeave={stopDrag} style={{ userSelect: 'none' }}>
      {/* Day selector pills */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 10 }}>
        {DAYS.map((d, i) => {
          const dayActive = schedule[i].some(Boolean);
          return (
            <button
              key={i}
              className={`day-btn${activeDay === i ? ' active' : ''}`}
              onClick={() => setActiveDay(i)}
              title={`${d}${dayActive ? ' (tiene grabación)' : ''}`}
              style={{ position: 'relative' }}
            >
              {d}
              {dayActive && activeDay !== i && (
                <span style={{
                  position: 'absolute', top: 1, right: 1,
                  width: 5, height: 5, borderRadius: '50%',
                  background: 'var(--accent)',
                }} />
              )}
            </button>
          );
        })}
      </div>

      {/* 48-square grid */}
      <div className="schedule-grid">
        {mask.map((active, slot) => (
          <div
            key={slot}
            className={`sq ${active ? 'sq-active' : 'sq-inactive'}`}
            title={halfHourToLabel(slot)}
            onMouseDown={() => handleMouseDown(slot)}
            onMouseEnter={() => handleMouseEnter(slot)}
          />
        ))}
      </div>

      {/* Hour labels — 12 labels for 24h (one every 2h = 4 slots) */}
      <div className="hour-labels">
        {HOUR_LABELS.map((h) => (
          <div key={h} className="hour-label">{h}</div>
        ))}
      </div>

      {/* Active range summary */}
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-tertiary)', display: 'flex', justifyContent: 'space-between' }}>
        <span>
          <strong style={{ color: 'var(--text-secondary)' }}>{DAYS[activeDay]}</strong>{' '}
          — {rangeText}
        </span>
        {activeCount > 0 && (
          <span style={{ color: 'var(--text-secondary)' }}>
            {(activeCount * 30)} min/día
          </span>
        )}
      </div>
    </div>
  );
}
