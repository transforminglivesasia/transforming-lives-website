// Cloudflare Pages middleware — serves correct og:image for social link previews
// Bots (WhatsApp, LinkedIn, Telegram, Slack, iMessage, etc.) read og:image from HTML;
// they don't execute JavaScript, so the SPA's dynamic meta updates never reach them.
// This middleware detects bot user-agents and returns a minimal HTML page with the
// correct og tags per profile URL. Human visitors fall through to the normal SPA.

const BASE = 'https://www.transforminglives.asia';

const PROFILES = {
  '/moonlakelee': {
    title: 'Moonlake Lee | Founder & CEO | Transforming Lives',
    desc: 'Moonlake Lee is the Founder & CEO of Transforming Lives — advocate, author, and psychoeducator on neurodivergence, executive function, and family resilience in Singapore.',
    image: `${BASE}/images/founder.jpg`,
  },
  '/ravenlim': {
    title: 'Raven Lim | Transforming Lives',
    desc: 'Raven Lim is a parent coach and psychoeducator at Transforming Lives, supporting families navigating neurodivergence and parent-youth relationships in Singapore.',
    image: `${BASE}/images/raven-lim.jpg`,
  },
  '/dasiyahdezwart': {
    title: 'Dasiyah de Zwart | Corporate Partnerships Lead | Transforming Lives',
    desc: 'Dasiyah de Zwart is the Corporate Partnerships Lead at Transforming Lives, building meaningful partnerships that advance neurodiversity, inclusion, and social impact.',
    image: `${BASE}/images/dasiyah-de-zwart.jpg`,
  },
  '/teresachua': {
    title: 'Teresa Chua | Transforming Lives',
    desc: 'Teresa Chua is a parent coach and executive function specialist at Transforming Lives, drawing on lived experience to support families navigating neurodivergence.',
    image: `${BASE}/images/teresa-chua.png`,
  },
  '/candicelim': {
    title: 'Candice Lim | Coaching & Capability Build Lead | Transforming Lives',
    desc: 'Candice Lim is the Coaching & Capability Build Lead at Transforming Lives, bringing strengths-based coaching and two decades of organisational experience to individuals and organisations.',
    image: `${BASE}/images/candice-lim.jpg`,
  },
  '/geniehoe': {
    title: 'Genie Hoe | Operations Administrator | Transforming Lives',
    desc: 'Genie Hoe is the Operations Administrator at Transforming Lives, bringing HR experience and lived experience as a parent of a neurodivergent child to her role.',
    image: `${BASE}/images/genie-hoe.png`,
  },
};

const BOT_UA = /facebookexternalhit|facebookcatalog|twitterbot|linkedinbot|whatsapp|slackbot|telegrambot|discordbot|applebot|googlebot|bingbot|yandex|pinterest|vkshare|iframely|embedly|w3c_validator|rogerbot|screaming.frog/i;

function escape(str) {
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const ua = request.headers.get('User-Agent') || '';
  const profile = PROFILES[url.pathname];

  if (profile && BOT_UA.test(ua)) {
    const t = escape(profile.title);
    const d = escape(profile.desc);
    const img = escape(profile.image);
    const pageUrl = escape(url.href);
    return new Response(
      `<!DOCTYPE html><html><head>
<meta charset="utf-8">
<title>${t}</title>
<meta name="description" content="${d}">
<meta property="og:type" content="profile">
<meta property="og:title" content="${t}">
<meta property="og:description" content="${d}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="800">
<meta property="og:image:height" content="800">
<meta property="og:url" content="${pageUrl}">
<meta property="og:site_name" content="Transforming Lives">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${t}">
<meta name="twitter:description" content="${d}">
<meta name="twitter:image" content="${img}">
</head><body></body></html>`,
      { headers: { 'Content-Type': 'text/html;charset=utf-8', 'Cache-Control': 'public,max-age=3600' } }
    );
  }

  return next();
}
