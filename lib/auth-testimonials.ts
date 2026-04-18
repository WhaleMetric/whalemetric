export type Testimonial = {
  id: string;
  quote: string;        // máx ~220 caracteres
  name: string;
  role: string;
  company: string;
  sector: string;
  keywords: string[];
  avatarUrl?: string;
};

export const testimonials: Testimonial[] = [
  {
    id: 'gabinete-barcelona-01',
    quote:
      'Antes de WhaleMetric revisábamos decenas de webs a mano cada mañana. Ahora recibimos el clipping consolidado a las 7:00 con todo lo relevante del día anterior.',
    name: 'Marta Vidal',
    role: 'Directora de Comunicación',
    company: 'Ajuntament de Badalona',
    sector: 'Administración pública',
    keywords: ['Badalona', 'Rubén Guijarro', 'presupuestos 2026', 'Mossos'],
  },
  // Ejemplos preparados para cuando se quiera rotación real —
  // descomentar cuando los casos estén validados con clientes.
  //
  // {
  //   id: 'agencia-comms-02',
  //   quote:
  //     'Hemos reducido a cero el tiempo que dedicábamos a hacer capturas de pantalla de menciones: el dossier lo construye WhaleMetric y sólo validamos.',
  //   name: 'Pau Serrat',
  //   role: 'Head of Earned Media',
  //   company: 'NexoComms',
  //   sector: 'Agencia de comunicación',
  //   keywords: ['clientes retail', 'fashion week', 'ESG'],
  // },
  // {
  //   id: 'corporate-affairs-03',
  //   quote:
  //     'El radar de menciones críticas nos avisó de una crisis reputacional antes de que llegara al periódico. Tuvimos 3 horas de ventaja para responder.',
  //   name: 'Elena Arrieta',
  //   role: 'Corporate Affairs',
  //   company: 'Grupo Aragonés',
  //   sector: 'Gran consumo',
  //   keywords: ['reputación', 'crisis', 'RSC'],
  // },
];
