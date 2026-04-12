import { NextResponse } from 'next/server';

const html = `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<meta http-equiv="refresh" content="0; url=/admin-dashboard.html">
</head>
<body>Redirigiendo...</body>
</html>
`;

export async function GET() {
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
