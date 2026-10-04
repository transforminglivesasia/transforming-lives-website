// Link-preview crawlers (WhatsApp, LinkedIn, etc.) don't run JavaScript, so the SPA's
// per-page title/og tags must be written into the HTML itself for every request.

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
  '/alisacheng': {
    title: 'Alisa Cheng | Executive Function Associate Coach | Transforming Lives',
    desc: 'Alisa Cheng is an Executive Function Associate Coach at Transforming Lives, supporting students and young adults in building practical strategies to plan, prioritise, and follow through.',
    image: `${BASE}/images/alisa-cheng.jpg`,
  },
  '/coaching': {
    type: 'website',
    title: 'Parent & Executive Function Coaching | Our Coaches & Fees | Transforming Lives',
    desc: 'Parent and executive function coaching from people who get it, at a fee within reach.',
    shareTitle: 'Coaching | Transforming Lives',
    image: `${BASE}/images/coaching-share-wide.png`,
    imageWidth: 1200,
    imageHeight: 630,
    icon: '/images/coaching-favicon.png',
  },
  '/geniehoe': {
    title: 'Genie Hoe | Operations Administrator | Transforming Lives',
    desc: 'Genie Hoe is the Operations Administrator at Transforming Lives, bringing HR experience and lived experience as a parent of a neurodivergent child to her role.',
    image: `${BASE}/images/genie-hoe.png`,
  },
};

class SetAttr {
  constructor(attr, val) { this.attr = attr; this.val = val; }
  element(el) { el.setAttribute(this.attr, this.val); }
}

class SetText {
  constructor(content) { this.content = content; }
  element(el) { el.setInnerContent(this.content); }
}

class AppendHead {
  constructor(markup) { this.markup = markup; }
  element(el) { el.append(this.markup, { html: true }); }
}

export async function onRequest({ request, next }) {
  const url = new URL(request.url);
  const page = PROFILES[url.pathname.replace(/\/+$/, '')];
  const response = await next();
  if (!page || !(response.headers.get('Content-Type') || '').includes('text/html')) return response;

  const pageUrl = BASE + url.pathname.replace(/\/+$/, '');
  const shareTitle = page.shareTitle || page.title;
  let rw = new HTMLRewriter()
    .on('title', new SetText(page.title))
    .on('meta[name="description"]', new SetAttr('content', page.desc))
    .on('link[rel="canonical"]', new SetAttr('href', pageUrl))
    .on('meta[property="og:type"]', new SetAttr('content', page.type || 'profile'))
    .on('meta[property="og:url"]', new SetAttr('content', pageUrl))
    .on('meta[property="og:title"]', new SetAttr('content', shareTitle))
    .on('meta[property="og:description"]', new SetAttr('content', page.desc))
    .on('meta[property="og:image"]', new SetAttr('content', page.image))
    .on('meta[name="twitter:title"]', new SetAttr('content', shareTitle))
    .on('meta[name="twitter:description"]', new SetAttr('content', page.desc))
    .on('meta[name="twitter:image"]', new SetAttr('content', page.image))
    .on('meta[name="twitter:card"]', new SetAttr('content', page.imageWidth > page.imageHeight ? 'summary_large_image' : 'summary'))
    .on('head', new AppendHead(`<meta property="og:image:width" content="${page.imageWidth || 800}"><meta property="og:image:height" content="${page.imageHeight || 800}">`));
  if (page.icon) {
    rw = rw.on('link[rel="icon"]', new SetAttr('href', page.icon))
           .on('link[rel="shortcut icon"]', new SetAttr('href', page.icon));
  }

  const headers = new Headers(response.headers);
  headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  return rw.transform(new Response(response.body, { status: response.status, headers }));
}
