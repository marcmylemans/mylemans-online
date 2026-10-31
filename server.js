const express = require('express');
const path = require('path');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 80;
const RESEND_API_KEY = process.env.RESEND_API_KEY || '';
const NOTIFY_TO = process.env.NOTIFY_TO || 'info@mylemans.online';

// Internal notifications to Marc (no public display, can stay simple).
const NOTIFY_FROM =
  process.env.NOTIFY_FROM || 'Mylemans Online <noreply@mail.safetunnel.app>';

// User-facing newsletter From (the confirmation email and any future
// transactional newsletter-related mail). Display name "Mylemans Online"
// per the newsletter spec; the safetunnel.app sending domain is explained
// in the email body.
const NEWSLETTER_FROM =
  process.env.NEWSLETTER_FROM || 'Mylemans Online <noreply@mail.safetunnel.app>';

// Reply-To for newsletter mail: a monitored Mylemans Online inbox.
const NEWSLETTER_REPLY_TO =
  process.env.NEWSLETTER_REPLY_TO || 'info@mylemans.online';

let AUDIENCE_SAFETUNNEL = process.env.RESEND_AUDIENCE_ID_SAFETUNNEL || '';
// Newsletter captures go into the existing "SafeTunnel Early Access" audience
// (reused as the general subscriber list; set RESEND_AUDIENCE_ID_NEWSLETTER
// to override).
let AUDIENCE_NEWSLETTER =
  process.env.RESEND_AUDIENCE_ID_NEWSLETTER ||
  'f0bda345-9b4a-4400-b559-cc524c069e21';

app.set('trust proxy', true);
app.use(express.json());

// blog.mylemans.online lives here now. Any request arriving on the old host
// gets a permanent redirect to the same path on the canonical origin. Post
// permalinks (/posts/:title/), /categories/ and /tags/ are unchanged, so
// this is a straight host swap; only the old front page moves to /blog/.
const LEGACY_BLOG_HOST = (process.env.LEGACY_BLOG_HOST || 'blog.mylemans.online').toLowerCase();
const CANONICAL_ORIGIN = process.env.CANONICAL_ORIGIN || 'https://mylemans.online';

app.use((req, res, next) => {
  const host = (req.hostname || '').toLowerCase();
  if (host !== LEGACY_BLOG_HOST) return next();
  const path = req.originalUrl === '/' ? '/blog/' : req.originalUrl;
  res.set('Cache-Control', 'public, max-age=86400');
  return res.redirect(301, CANONICAL_ORIGIN + path);
});

// Paths that existed on the Chirpy blog but have no equivalent here. Google
// and Ahrefs still hold links to them (Search Console, Oct 2026), so send them
// somewhere useful instead of 404. Applies on every host.
const LEGACY_PATHS = [
  // Retired posts (Oct 2026): promo posts moved to pages, 2022 guides
  // superseded by their 2024 rewrites. Old URLs 301 to the replacement.
  [/^\/posts\/Support\/?$/i, '/#community'],
  [/^\/posts\/YoutubeMembers\/?$/i, '/youtube.html'],
  [/^\/posts\/DiscordServer\/?$/i, '/#community'],
  [/^\/posts\/T\-Shirt\-Collection\/?$/i, 'https://shop.mylemans.online/'],
  [/^\/posts\/HyperVGuide\/?$/i, '/posts/Hyper-V-Chapter1/'],
  [/^\/posts\/InstallingAD\/?$/i, '/posts/SettingUpActiveDirectoryServer2022/'],
  [/^\/posts\/RemoteDesktopPart1\/?$/i, '/posts/Remote-Desktop-Services-Part1/'],
  [/^\/posts\/RemoteDesktopPart2\/?$/i, '/posts/Remote-Desktop-Services-Part1/'],
  [/^\/posts\/RemoteDesktopPart3\/?$/i, '/posts/Remote-Desktop-Services-Part1/'],
  [/^\/posts\/RemoteDesktopPart4\/?$/i, '/posts/Remote-Desktop-Services-Part2/'],
  [/^\/archives\/?$/i, '/blog/'],
  [/^\/tags\/?$/i, '/blog/#tags'],
  [/^\/categories\/?$/i, '/blog/#categories'],
  [/^\/page(\d+)\/?$/i, '/blog/page$1/'],
  [/^\/referral-links\/?$/i, '/referral-links.html'],
  [/^\/join-our-community\/?$/i, 'https://www.youtube.com/@mylemansonline/join'],
  [/^\/newsletter\/?$/i, '/#newsletter'],
  [/^\/shop\/?$/i, 'https://shop.mylemans.online/'],
  [/^\/about\/?$/i, '/about.html'],
  [/^\/feed\/?$/i, '/feed.xml'],
  [/^\/posts\/?$/i, '/blog/'],
  [/^\/(assets\/)?media-kit-mylemans-online\.pdf$/i, '/sponsor.html'],   // media kit withdrawn Oct 2026
];
app.use((req, res, next) => {
  const p = req.path;
  for (const [re, target] of LEGACY_PATHS) {
    if (re.test(p)) return res.redirect(301, p.replace(re, target));
  }
  next();
});

// Old Chirpy category URLs. The migration reduced ~70 categories to 18, so the
// dropped ones are mapped to the closest canonical category page. Unknown
// categories fall through to the normal 404.
const CATEGORY_ALIASES = {
  'windows': 'windows-server', 'server': 'windows-server', 'server-2022': 'windows-server',
  'windows-server-2022': 'windows-server', 'server-2012r2': 'windows-server', 'file-servers': 'windows-server',
  'dfs': 'windows-server', 'dhcp': 'windows-server', 'group-policy': 'active-directory',
  'identity-management': 'active-directory', 'migration': 'windows-server', 'laps': 'security',
  'azure': 'entra-id-intune', 'azure-intune': 'entra-id-intune', 'intune': 'entra-id-intune',
  'entraid': 'entra-id-intune', 'endpoint-management': 'entra-id-intune', 'connect': 'entra-id-intune',
  'exchange': 'microsoft-365', 'office': 'microsoft-365', 'outlook': 'microsoft-365',
  'powershell': 'scripts', 'scripts-powershell': 'scripts', 'python-script': 'scripts',
  'python-scripts': 'scripts', 'automation': 'scripts',
  'virtualization': 'proxmox', 'ceph-upgrade': 'proxmox', 'upgrade-8-to-9': 'proxmox',
  'home-lab': 'homelab', 'homelab-hardware': 'hardware', 'homelab-projects': 'homelab',
  'hardware-upgrades': 'hardware', 'nas': 'hardware', 'storage': 'hardware', 'storeonce': 'backup',
  'urbackup-server': 'backup', 'desk-setup': 'hardware', '3d-printing': 'hardware', 'travel-routers': 'reviews',
  'docker': 'self-hosting', 'docker-unifi': 'self-hosting', 'open-source-software': 'self-hosting',
  'privateglue': 'self-hosting', 'vps': 'cloud', 'cloud-computing': 'cloud', 'cloud-hosting': 'cloud',
  'digitalocean': 'cloud', 'hetzner': 'cloud', 'routing-and-network-address-translation': 'networking',
  'vlans': 'networking', 'basics': 'networking', 'crowdstrike': 'security', 'csagent-sys': 'security',
  'bsod': 'windows-11', 'discord': 'community', 'shop': 'community', 'apparel': 'community',
  'learning': 'community', 'ai': 'self-hosting', 'machine-learning': 'self-hosting',
};
app.use((req, res, next) => {
  const m = req.path.match(/^\/categories\/([^/]+)\/?$/i);
  if (!m) return next();
  const target = CATEGORY_ALIASES[m[1].toLowerCase()];
  if (!target) return next();
  return res.redirect(301, '/categories/' + target + '/');
});

app.use(express.static(path.join(__dirname, 'public'), {
  extensions: ['html'],
}));

// On startup, ensure both audiences exist in Resend
async function ensureAudiences() {
  if (!RESEND_API_KEY) return;

  const resend = new Resend(RESEND_API_KEY);

  try {
    const { data } = await resend.audiences.list();
    const existing = data || [];

    // Find or create SafeTunnel audience
    if (!AUDIENCE_SAFETUNNEL) {
      const found = existing.find(a => a.name === 'SafeTunnel Early Access');
      if (found) {
        AUDIENCE_SAFETUNNEL = found.id;
      } else {
        const { data: created } = await resend.audiences.create({ name: 'SafeTunnel Early Access' });
        AUDIENCE_SAFETUNNEL = created.id;
        console.log(`[startup] Created audience "SafeTunnel Early Access": ${AUDIENCE_SAFETUNNEL}`);
      }
    }

    // Find or create Newsletter audience
    if (!AUDIENCE_NEWSLETTER) {
      const found = existing.find(a => a.name === 'Newsletter');
      if (found) {
        AUDIENCE_NEWSLETTER = found.id;
      } else {
        const { data: created } = await resend.audiences.create({ name: 'Newsletter' });
        AUDIENCE_NEWSLETTER = created.id;
        console.log(`[startup] Created audience "Newsletter": ${AUDIENCE_NEWSLETTER}`);
      }
    }

    console.log(`[startup] Audiences ready. SafeTunnel: ${AUDIENCE_SAFETUNNEL}, Newsletter: ${AUDIENCE_NEWSLETTER}`);
  } catch (err) {
    console.error('[startup] Could not set up audiences:', err.message || err);
  }
}

const rateLimitMap = new Map();
const RATE_WINDOW_MS = 60_000;
const RATE_MAX = 3;

function rateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress;
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (entry) {
    entry.ts = entry.ts.filter(t => now - t < RATE_WINDOW_MS);
    if (entry.ts.length >= RATE_MAX) {
      return res.status(429).json({ error: 'Too many requests. Try again in a minute.' });
    }
    entry.ts.push(now);
  } else {
    rateLimitMap.set(ip, { ts: [now] });
  }
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of rateLimitMap) {
    entry.ts = entry.ts.filter(t => now - t < RATE_WINDOW_MS);
    if (entry.ts.length === 0) rateLimitMap.delete(ip);
  }
}, 60_000);

function isValidEmail(email) {
  return typeof email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Capture metadata for consent recording (single opt-in needs evidence
// of when and where someone subscribed).
function consentMetadata(req) {
  return {
    timestamp: new Date().toISOString(),
    ip: req.ip || req.socket.remoteAddress || 'unknown',
    userAgent: req.headers['user-agent'] || 'unknown',
    referer: req.headers.referer || req.headers.referrer || 'unknown',
    host: req.headers.host || 'unknown',
  };
}

// SafeTunnel early access signup (currently no UI form posts to this,
// kept in case the waitlist is reintroduced).
app.post('/api/notify', rateLimit, async (req, res) => {
  const { email } = req.body || {};

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!RESEND_API_KEY) {
    console.error('[notify] RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  try {
    const resend = new Resend(RESEND_API_KEY);

    if (AUDIENCE_SAFETUNNEL) {
      await resend.contacts.create({
        audienceId: AUDIENCE_SAFETUNNEL,
        email: email,
      });
      console.log(`[notify] Added ${email} to SafeTunnel audience`);
    }

    await resend.emails.send({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      subject: `SafeTunnel early access: ${email}`,
      html: [
        '<h2>New SafeTunnel early access signup</h2>',
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
        `<p><strong>Time:</strong> ${new Date().toISOString()}</p>`,
        '<p>This person wants to be notified when SafeTunnel launches publicly.</p>',
      ].join('\n'),
    });

    console.log(`[notify] Sent notification for ${email}`);
    res.json({ ok: true });
  } catch (err) {
    console.error('[notify] Resend error:', err.message || err);
    res.status(500).json({ error: 'Failed to send notification. Please try again.' });
  }
});

// Newsletter subscription (single opt-in per spec).
//
// Two emails are sent: a notification to Marc with the consent record,
// and a confirmation to the subscriber that doubles as part of the
// consent evidence trail.
//
// IMPORTANT: This confirmation send is operationally transactional (a
// one-off triggered by user action). The bulk newsletter itself is
// sent later as a Resend Broadcast and must carry the managed
// unsubscribe link {{{RESEND_UNSUBSCRIBE_URL}}} so this confirmation's
// promise ("every email has a one-click unsubscribe at the bottom")
// holds true. The magic-link sign-in path is separate and must never
// be suppressed by the newsletter Audience or any unsubscribe state.
app.post('/api/subscribe', rateLimit, async (req, res) => {
  const { email } = req.body || {};

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }

  if (!RESEND_API_KEY) {
    console.error('[subscribe] RESEND_API_KEY is not set');
    return res.status(500).json({ error: 'Email service is not configured.' });
  }

  const consent = consentMetadata(req);

  try {
    const resend = new Resend(RESEND_API_KEY);

    if (AUDIENCE_NEWSLETTER) {
      await resend.contacts.create({
        audienceId: AUDIENCE_NEWSLETTER,
        email: email,
      });
      console.log(`[subscribe] Added ${email} to Newsletter audience`);
    }

    // Notify Marc with consent metadata (timestamp + source) so there is
    // an auditable record of the single opt-in.
    await resend.emails.send({
      from: NOTIFY_FROM,
      to: NOTIFY_TO,
      subject: `New newsletter subscriber: ${email}`,
      html: [
        '<h2>New newsletter subscriber</h2>',
        `<p><strong>Email:</strong> ${escapeHtml(email)}</p>`,
        '<h3>Consent record</h3>',
        '<ul>',
        `  <li><strong>Time:</strong> ${escapeHtml(consent.timestamp)}</li>`,
        `  <li><strong>IP:</strong> ${escapeHtml(consent.ip)}</li>`,
        `  <li><strong>User agent:</strong> ${escapeHtml(consent.userAgent)}</li>`,
        `  <li><strong>Referer:</strong> ${escapeHtml(consent.referer)}</li>`,
        `  <li><strong>Host:</strong> ${escapeHtml(consent.host)}</li>`,
        '</ul>',
        '<p>Single opt-in via the on-page newsletter form. A confirmation email was sent to the subscriber.</p>',
      ].join('\n'),
    });

    // Welcome / confirmation to the subscriber (copy per newsletter spec).
    await resend.emails.send({
      from: NEWSLETTER_FROM,
      to: email,
      replyTo: NEWSLETTER_REPLY_TO,
      subject: "You're subscribed, Mylemans Online",
      text: [
        'Hey,',
        '',
        "Quick confirmation that you're on the list for the Mylemans Online newsletter.",
        '',
        "You'll get one email when there's something genuinely worth sending: a new tutorial, a new path on Labs, a tool, or a war story from the field. No spam, no upsells, no weekly filler.",
        '',
        "If anything ever lands that you didn't want, every email has a one-click unsubscribe at the bottom.",
        '',
        'Talk soon,',
        'Marc',
        '',
        '***',
        "You're getting this because someone signed up with this email at mylemans.online. If that wasn't you, just ignore it, you won't be added to anything else. Sent via our mail service safetunnel.app, on behalf of Mylemans Online. Replies go to info@mylemans.online.",
      ].join('\n'),
      html: [
        '<div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif; max-width: 560px; line-height: 1.6; color: #1f2937;">',
        '  <p>Hey,</p>',
        "  <p>Quick confirmation that you're on the list for the Mylemans Online newsletter.</p>",
        "  <p>You'll get one email when there's something genuinely worth sending: a new tutorial, a new path on Labs, a tool, or a war story from the field. <strong>No spam, no upsells, no weekly filler.</strong></p>",
        "  <p>If anything ever lands that you didn't want, every email has a one-click unsubscribe at the bottom.</p>",
        '  <p>Talk soon,<br>Marc</p>',
        '  <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e5e7eb;">',
        '  <p style="font-size: 0.82rem; color: #6b7280; font-style: italic;">You\'re getting this because someone signed up with this email at <a href="https://mylemans.online" style="color:#2563eb; text-decoration:none;">mylemans.online</a>. If that wasn\'t you, just ignore it, you won\'t be added to anything else. Sent via our mail service safetunnel.app, on behalf of Mylemans Online. Replies go to <a href="mailto:info@mylemans.online" style="color:#2563eb; text-decoration:none;">info@mylemans.online</a>.</p>',
        '</div>',
      ].join('\n'),
    });

    console.log(`[subscribe] Sent notification + welcome for ${email} (consent: ${consent.timestamp}, ${consent.ip})`);
    res.json({ ok: true });
  } catch (err) {
    console.error('[subscribe] Resend error:', err.message || err);
    res.status(500).json({ error: 'Failed to subscribe. Please try again.' });
  }
});

// Custom 404: anything that reached this point is not a file, not a
// redirect and not an API route. Serve the Jekyll-built 404.html with a
// real 404 status (noindex is set in the page itself). API paths get JSON.
app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'Not found' });
  res.status(404).sendFile(path.join(__dirname, 'public', '404.html'), err => {
    if (err) res.status(404).type('text').send('Not found');
  });
});

app.listen(PORT, '0.0.0.0', async () => {
  console.log(`Mylemans Online running on port ${PORT}`);
  await ensureAudiences();
});
