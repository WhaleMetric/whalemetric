export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const response = await fetch('https://api.whalemetric.com/api/health');
    const data = await response.json();
    return Response.json({ ok: true, status: response.status, data });
  } catch (error) {
    return Response.json({ ok: false, error: String(error) }, { status: 500 });
  }
}
