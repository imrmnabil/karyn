/**
 * cms-inject.js — Karyn Wilkins Hypnotherapy
 * Fetches /_data/content.json and injects all editable content into the page.
 */

fetch('/api/content')
  .then(r => (r.ok ? r.json() : Promise.reject(new Error('API unavailable'))))
  .catch(() => fetch('/_data/content.json').then(r => r.json()))
  .then(data => {
    const s  = data.site;
    const h  = data.home;
    const a  = data.about;
    const wl = data.weightloss;
    const m  = data.menopause;
    const b  = data.booking;

    // ── SITE-WIDE ─────────────────────────────────────────────
    setAll('.cms-phone',     s.phone);
    setAll('.cms-email-text', s.email);
    setAllHref('.cms-email-link', 'mailto:' + s.email);
    setAll('.cms-copyright', s.copyright);
      // Site logo (nav id + footer class)
      setAllSrc('#cms-img-logo, .cms-img-logo', s.logo_url);

    // ── HOME PAGE ─────────────────────────────────────────────
    set('cms-hero-eyebrow',        h.hero_eyebrow);
    set('cms-hero-heading',        h.hero_heading + ' ');
    set('cms-hero-heading-italic', h.hero_heading_italic);
    set('cms-hero-para',           h.hero_para);
    set('cms-pillar1-title',       h.pillar1_title);
    set('cms-pillar1-desc',        h.pillar1_desc);
    set('cms-pillar2-title',       h.pillar2_title);
    set('cms-pillar2-desc',        h.pillar2_desc);
    set('cms-pillar3-title',       h.pillar3_title);
    set('cms-pillar3-desc',        h.pillar3_desc);
    set('cms-quote-text',          '\u201C' + h.quote_text + '\u201D');
    set('cms-editorial-eyebrow',   h.editorial_eyebrow);
    set('cms-editorial-heading',   h.editorial_heading);
    set('cms-editorial-para1',     h.editorial_para1);
    set('cms-editorial-para2',     h.editorial_para2);
    set('cms-home-cta-eyebrow',    h.cta_eyebrow);
    set('cms-home-cta-heading',    h.cta_heading);
    set('cms-home-cta-para',       h.cta_para);
  // ── HOME IMAGES ─────────────────────────────────────────
  setSrc('cms-img-hero',      h.img_hero);
  setSrc('cms-img-card-wl',   h.img_card_wl);
  setSrc('cms-img-card-meno', h.img_card_meno);
  setSrc('cms-img-editorial', h.img_editorial);

    // ── ABOUT PAGE ────────────────────────────────────────────
    set('cms-bio-p1',           a.bio_para1);
    set('cms-bio-p2',           a.bio_para2);
    set('cms-approach-intro',   a.approach_intro);
    set('cms-approach1-title',  a.approach1_title);
    set('cms-approach1-desc',   a.approach1_desc);
    set('cms-approach2-title',  a.approach2_title);
    set('cms-approach2-desc',   a.approach2_desc);
    set('cms-approach3-title',  a.approach3_title);
    set('cms-approach3-desc',   a.approach3_desc);
    set('cms-t1-text',          a.t1_text);
    set('cms-t1-author',        '— ' + a.t1_author);
    set('cms-t2-text',          a.t2_text);
    set('cms-t2-author',        '— ' + a.t2_author);
    set('cms-t3-text',          a.t3_text);
    set('cms-t3-author',        '— ' + a.t3_author);
    set('cms-t4-text',          a.t4_text);
    set('cms-t4-author',        '— ' + a.t4_author);
    set('cms-about-cta-eyebrow', a.cta_eyebrow);
    set('cms-about-cta-heading', a.cta_heading);
    set('cms-about-cta-para',    a.cta_para);
  // ── ABOUT IMAGES ──────────────────────────────────────
  setSrc('cms-img-headshot', a.img_headshot);

    // ── WEIGHT LOSS PAGE ──────────────────────────────────────
    set('cms-wl-hero-eyebrow',      wl.hero_eyebrow);
    set('cms-wl-hero-heading',      wl.hero_heading);
    set('cms-wl-hero-heading-italic', wl.hero_heading_italic);
    set('cms-wl-hero-para',         wl.hero_para);
    set('cms-prog1-heading',        wl.prog1_heading);
    set('cms-prog1-intro',          wl.prog1_intro);
    set('cms-prog1-detail',         wl.prog1_detail);
    set('cms-prog2-heading',        wl.prog2_heading);
    set('cms-prog2-intro',          wl.prog2_intro);
    set('cms-prog2-detail',         wl.prog2_detail);
    set('cms-explainer-heading',    wl.explainer_heading);
    set('cms-explainer-para',       wl.explainer_para);
    set('cms-wl-cta-eyebrow',       wl.cta_eyebrow);
    set('cms-wl-cta-heading',       wl.cta_heading);
    set('cms-wl-cta-para',          wl.cta_para);
  // ── WEIGHT LOSS IMAGES ────────────────────────────────
  setSrc('cms-img-prog1',      wl.img_prog1);
  setSrc('cms-img-prog2',      wl.img_prog2);
  setSrc('cms-img-wl-sidebar', wl.img_sidebar);

    // ── MENOPAUSE PAGE ────────────────────────────────────────
    set('cms-meno-hero-heading',        m.hero_heading);
    set('cms-meno-hero-heading-italic', m.hero_heading_italic);
    set('cms-meno-hero-para',           m.hero_para);
    set('cms-meno-stat-number',         m.stat_number);
    set('cms-meno-stat-label',          m.stat_label);
    set('cms-meno-stat-source',         m.stat_source);
    set('cms-meno-intro-heading',       m.intro_heading);
    set('cms-meno-intro-para1',         m.intro_para1);
    set('cms-meno-intro-para2',         m.intro_para2);
    set('cms-meno-intro-italic',        m.intro_italic);
    set('cms-meno-evidence-para1',      m.evidence_para1);
    set('cms-meno-evidence-para2',      m.evidence_para2);
    set('cms-meno-quote',               m.featured_quote);
    set('cms-meno-quote-author',        m.featured_quote_author);
    set('cms-meno-cta-eyebrow',         m.cta_eyebrow);
    set('cms-meno-cta-heading',         m.cta_heading);
    set('cms-meno-cta-para',            m.cta_para);
  // ── MENOPAUSE IMAGES ──────────────────────────────────
  setSrc('cms-img-meno-1', m.img_gallery1);
  setSrc('cms-img-meno-2', m.img_gallery2);

    // ── BOOKING PAGE ──────────────────────────────────────────
    set('cms-booking-hero-heading', b.hero_heading);
    set('cms-booking-hero-para',    b.hero_para);
    set('cms-consult-heading',      b.consult_heading);
    set('cms-consult-para',         b.consult_para);
    set('cms-s1-name',  b.s1_name);
    set('cms-s1-dur',   b.s1_dur);
    set('cms-s2-name',  b.s2_name);
    set('cms-s2-dur',   b.s2_dur);
    set('cms-s3-name',  b.s3_name);
    set('cms-s3-dur',   b.s3_dur);
    set('cms-s4-name',  b.s4_name);
    set('cms-s4-dur',   b.s4_dur);
    set('cms-booking-note', b.booking_note);
  })
  .catch(err => console.warn('CMS content not loaded:', err));

// ── HELPERS ──────────────────────────────────────────────────
function set(id, val) {
  const el = document.getElementById(id);
  if (el && val !== undefined) el.textContent = val;
}
function setAll(selector, val) {
  document.querySelectorAll(selector).forEach(el => { if (val !== undefined) el.textContent = val; });
}
function setAllHref(selector, href) {
  document.querySelectorAll(selector).forEach(el => el.setAttribute('href', href));
}
function setSrc(id, url) {
  const el = document.getElementById(id);
  if (!el || !url) return;
  el.addEventListener('load', () => el.classList.add('loaded'), { once: true });
  el.addEventListener('error', () => el.classList.add('loaded'), { once: true });
  el.src = url;
}
function setAllSrc(selector, url) {
  if (!url) return;
  document.querySelectorAll(selector).forEach(el => {
    el.addEventListener('load', () => el.classList.add('loaded'), { once: true });
    el.addEventListener('error', () => el.classList.add('loaded'), { once: true });
    el.src = url;
  });
}
