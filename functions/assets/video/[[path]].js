// Serves /assets/video/* with byte-range support (206 Partial Content).
//
// Why: Cloudflare Pages answers a Range request for a static file with 200 and
// the whole file (see "Serving Pages" in Cloudflare's docs). Browsers then cannot
// seek in a video until it has fully downloaded, and Safari can refuse to play
// MP4 at all. Cloudflare's documented fix is to fetch the file from the asset
// store and return only the requested bytes, which is what this does.
//
// Only /assets/video/* runs through this function (Pages builds its routes from
// this file's path); every other page and asset is served as before. Headers in
// _headers are not applied to function responses, so the global ones are set
// here too. Keep SITE_HEADERS in sync with the /* block in _headers.

const SITE_HEADERS = {
  'X-Frame-Options': 'SAMEORIGIN',
  'Content-Security-Policy': "frame-ancestors 'self'",
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
};

function withSiteHeaders(from) {
  const headers = new Headers(from);
  for (const [k, v] of Object.entries(SITE_HEADERS)) headers.set(k, v);
  headers.set('Accept-Ranges', 'bytes');
  return headers;
}

// "bytes=START-END", "bytes=START-" or "bytes=-SUFFIX" (one range only).
// Returns {start, end} (inclusive), 'unsatisfiable', or null to ignore the header.
function parseRange(header, size) {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim());
  if (!m || (m[1] === '' && m[2] === '')) return null;
  if (m[1] === '') {
    const n = Number(m[2]);
    if (n === 0) return 'unsatisfiable';
    return { start: Math.max(size - n, 0), end: size - 1 };
  }
  const start = Number(m[1]);
  const end = m[2] === '' ? size - 1 : Math.min(Number(m[2]), size - 1);
  if (start >= size || start > end) return 'unsatisfiable';
  return { start, end };
}

export async function onRequest({ request, env }) {
  const rangeHeader = request.headers.get('Range');

  // No range asked for (or not a GET): serve the file as Pages would, and say
  // that ranges are supported so the player can ask for them next.
  if (!rangeHeader || request.method !== 'GET') {
    const res = await env.ASSETS.fetch(request);
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: withSiteHeaders(res.headers) });
  }

  // Fetch the whole file, without the Range or conditional headers.
  const res = await env.ASSETS.fetch(new Request(request.url));
  if (res.status !== 200) {
    return new Response(res.body, { status: res.status, statusText: res.statusText, headers: withSiteHeaders(res.headers) });
  }
  const headers = withSiteHeaders(res.headers);
  headers.delete('Content-Length');
  headers.delete('Transfer-Encoding');

  // The asset store does not always send Content-Length, so read the file to
  // learn its size (the videos are under 25 MB, the Pages file limit).
  const buf = await res.arrayBuffer();
  const size = buf.byteLength;

  // If-Range: send the whole file when the browser's copy is out of date.
  const ifRange = request.headers.get('If-Range');
  const range = !ifRange || ifRange === res.headers.get('ETag') ? parseRange(rangeHeader, size) : null;

  if (range === null) return new Response(buf, { status: 200, headers });
  if (range === 'unsatisfiable') {
    headers.set('Content-Range', `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }
  headers.set('Content-Range', `bytes ${range.start}-${range.end}/${size}`);
  return new Response(new Uint8Array(buf, range.start, range.end - range.start + 1), { status: 206, headers });
}
