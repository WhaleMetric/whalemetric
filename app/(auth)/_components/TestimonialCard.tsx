import { Quote } from 'lucide-react';
import type { Testimonial } from '@/lib/auth-testimonials';

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('') || '?';
}

export default function TestimonialCard({ data }: { data: Testimonial }) {
  return (
    <article className="testimonial-card" aria-label={`Testimonio de ${data.name}`}>
      <Quote
        className="testimonial-card-quote-icon"
        strokeWidth={1.5}
        style={{ width: 28, height: 28 }}
        aria-hidden
      />

      <p className="testimonial-quote">“{data.quote}”</p>

      <div className="testimonial-divider" />

      <div className="testimonial-identity">
        {data.avatarUrl ? (
          <img
            className="testimonial-avatar"
            src={data.avatarUrl}
            alt={data.name}
            style={{ objectFit: 'cover' }}
          />
        ) : (
          <div className="testimonial-avatar" aria-hidden>
            {initials(data.name)}
          </div>
        )}
        <div className="testimonial-identity-text">
          <div className="testimonial-identity-name">{data.name}</div>
          <div className="testimonial-identity-role">
            {data.role} · {data.company}
          </div>
        </div>
      </div>

      <div className="testimonial-meta">
        <span className="testimonial-sector">{data.sector}</span>
        {data.keywords.map((kw) => (
          <span key={kw} className="testimonial-pill">
            <span className="testimonial-pill-hash">#</span>
            {kw}
          </span>
        ))}
      </div>
    </article>
  );
}
