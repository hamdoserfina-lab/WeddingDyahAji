/* GSAP + ScrollTrigger premium cinematic animations
   - Adaptive: only runs where matching elements are found
   - Direction-aware: different entry animations on enter vs enterBack
   - Prefers-reduced-motion respected
   - Mobile reduced-complexity
   - Uses dynamic CDN loader if GSAP not present
   - Safe: does not change HTML structure
   - Author: copilot (prepared for hamdoserfina-lab/Undanganojlo)
*/

(function () {
  // CONFIG
  const GSAP_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js';
  const SCROLLTRIGGER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js';
  const MOBILE_BREAKPOINT = 768; // px
  const FIXED_NAV_SELECTOR = 'nav, .navbar, header'; // used to calculate offset when possible
  // Helper to load script
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) return resolve();
      const s = document.createElement('script');
      s.src = src;
      s.async = false;
      s.onload = () => resolve();
      s.onerror = () => reject(new Error('Failed to load ' + src));
      document.head.appendChild(s);
    });
  }

  async function ensureGSAP() {
    if (window.gsap && window.gsap.utils && window.gsap.core) {
      return;
    }
    await loadScript(GSAP_CDN);
    await loadScript(SCROLLTRIGGER_CDN);
  }

  // UTILITIES
  function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  function isMobile() {
    return window.matchMedia && window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`).matches;
  }
  function getNavOffset() {
    const nav = document.querySelector(FIXED_NAV_SELECTOR);
    if (!nav) return 80;
    return nav.getBoundingClientRect().height + 20;
  }
  function qs(selectors) {
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function qsa(selectors) {
    for (const sel of selectors) {
      const els = document.querySelectorAll(sel);
      if (els && els.length) return Array.from(els);
    }
    return [];
  }
  function addWillChange(el) {
    if (!el) return;
    el.style.willChange = 'transform, opacity';
    el.style.transform = 'translateZ(0)';
  }

  // Typewriter effect (non-blocking)
  function typewriter(el, text, opts = {}) {
    const speed = opts.speed || 30;
    const preserveHTML = opts.preserveHTML || false;
    if (!el || !text) return;
    // If already contains markup, fallback to fade-in sequence
    if (preserveHTML && /<\/?[a-z][\s\S]*>/i.test(text)) {
      // simple fade-in per child
      const tmp = document.createElement('div');
      tmp.innerHTML = text;
      const children = Array.from(tmp.childNodes);
      el.innerHTML = '';
      children.forEach((node, i) => {
        const wrapper = document.createElement('span');
        wrapper.style.display = 'inline-block';
        wrapper.style.opacity = 0;
        wrapper.appendChild(node.cloneNode(true));
        el.appendChild(wrapper);
        gsap.to(wrapper, {opacity: 1, duration: 0.5, delay: i * 0.07, ease: 'power2.out'});
      });
      return;
    }
    el.textContent = '';
    let i = 0;
    const chars = text.split('');
    function tick() {
      if (i >= chars.length) return;
      el.textContent += chars[i++];
      setTimeout(tick, speed);
    }
    tick();
  }

  // magnetic button hover
  function makeMagnetic(btn, strength = 0.25) {
    if (!btn || !('addEventListener' in btn)) return;
    btn.style.willChange = 'transform';
    btn.addEventListener('mousemove', (e) => {
      const rect = btn.getBoundingClientRect();
      const relX = (e.clientX - rect.left) - rect.width / 2;
      const relY = (e.clientY - rect.top) - rect.height / 2;
      gsap.to(btn, {x: relX * strength, y: relY * strength, duration: 0.25, ease: 'power2.out'});
    });
    btn.addEventListener('mouseleave', () => {
      gsap.to(btn, {x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.6)'});
    });
  }

  // main runner
  async function run() {
    try {
      await ensureGSAP();
    } catch (err) {
      console.warn('GSAP failed to load, aborting animations.', err);
      return;
    }
    const { gsap, ScrollTrigger } = window;
    if (!gsap || !ScrollTrigger) return;
    gsap.registerPlugin(ScrollTrigger);

    // Respect reduced motion
    if (prefersReducedMotion()) {
      // Minimal fades for accessibility
      const elements = document.querySelectorAll('[data-animate]');
      elements.forEach(el => {
        el.style.opacity = 1;
        el.style.transform = 'none';
      });
      return;
    }

    // Global settings
    const navOffset = getNavOffset();
    const mobile = isMobile();
    const directionState = { lastY: window.pageYOffset || 0, dir: 'down' };
    window.addEventListener('scroll', () => {
      const y = window.pageYOffset || 0;
      directionState.dir = y > directionState.lastY ? 'down' : 'up';
      directionState.lastY = y;
    }, { passive: true });

    // Shared defaults
    const baseEase = 'power2.out';
    const slowEase = 'power3.out';
    const subtleDuration = mobile ? 0.6 : 0.9;

    // Helper to build start value using navOffset
    function startAtOffset(percentage = 0.6) {
      // use "top center" variant but slightly offset
      return `top ${Math.round(window.innerHeight * percentage) - navOffset}px`;
    }

    // SECTION: VERSE (Ayat)
    (function verse() {
      const section = qs(['#verse', '.section-verse', '[data-section="verse"]', '.verse']);
      if (!section) return;
      // mark elements for fallback when reduced motion
      section.querySelectorAll('*').forEach(el => el.setAttribute('data-animate','true'));

      const glass = qs(['#verse .glass', '.section-verse .glass', '.verse .glass', '.glass-verse']) || section.querySelector('.glass');
      const stars = qsa(['#verse .star', '.section-verse .star', '.verse .star', '.icon-star']);
      const verseText = qs(['#verse .ayat', '.section-verse .ayat', '.verse .ayat', '#verse .verse-text', '.verse-text']) || section.querySelector('p, .text, .verse-content');
      const source = qs(['#verse .source', '.section-verse .source', '.verse .source', '.quote-source']);

      // Glass box: scale up + fade in
      if (glass) {
        addWillChange(glass);
        gsap.fromTo(glass, {scale: 0.95, opacity: 0}, {
          scale: 1, opacity: 1, duration: subtleDuration, ease: baseEase,
          scrollTrigger: {
            trigger: section,
            start: startAtOffset(0.7),
            toggleActions: 'play none none reverse'
          }
        });
      }

      // Icon stars: gentle rotate + glow
      if (stars.length) {
        stars.forEach((star, i) => {
          star.style.willChange = 'transform, filter';
          gsap.to(star, {
            rotation: 360,
            duration: 40 + i * 6,
            repeat: -1,
            ease: 'none',
            transformOrigin: '50% 50%'
          });
          // subtle glow pulse
          gsap.fromTo(star, {filter: 'drop-shadow(0 0 0px rgba(255,255,255,0))'}, {
            filter: 'drop-shadow(0 0 6px rgba(255, 245, 200, 0.18))',
            duration: 2.6,
            repeat: -1,
            yoyo: true,
            ease: 'sine.inOut'
          });
        });
      }

      // Verse text: try typewriter else stagger fade in
      if (verseText) {
        const txt = verseText.getAttribute('data-text') || verseText.textContent.trim();
        // clear existing if we will type
        const useTypewriter = !mobile && (verseText.classList.contains('typewriter') || verseText.dataset.type === 'typewriter' || txt.length < 400);
        ScrollTrigger.create({
          trigger: section,
          start: startAtOffset(0.75),
          onEnter: () => {
            if (useTypewriter) {
              typewriter(verseText, txt, {speed: 20, preserveHTML: false});
            } else {
              gsap.fromTo(verseText, {y: 18, opacity: 0}, {y:0, opacity:1, duration: 0.9, ease: baseEase});
            }
          },
          onEnterBack: () => {
            // reverse direction: fade from top
            if (!useTypewriter) {
              gsap.fromTo(verseText, {y: -18, opacity: 0}, {y:0, opacity:1, duration: 0.9, ease: baseEase});
            }
          }
        });
      }

      // Source quote slide up from below
      if (source) {
        addWillChange(source);
        gsap.fromTo(source, {y: 30, opacity: 0}, {
          y: 0, opacity: 1, duration: 0.9, ease: slowEase,
          scrollTrigger: { trigger: source, start: startAtOffset(0.85), toggleActions: 'play none none reverse' }
        });
      }
    })();

    // SECTION: MEMPELAI
    (function mempelai() {
      const section = qs(['#mempelai', '.section-mempelai', '[data-section="mempelai"]', '.mempelai']);
      if (!section) return;

      const title = qs(['.mempelai .section-title', '.mempelai h2', '.section-mempelai .title', '#mempelai .title']) || section.querySelector('h2, h3');
      const avatarsLeft = qsa(['.mempelai .avatar-left', '.mempelai .avatar--left', '.avatar-left']);
      const avatarsRight = qsa(['.mempelai .avatar-right', '.mempelai .avatar--right', '.avatar-right']);
      const connector = qs(['.mempelai .connector', '.avatar-connector']);
      const glassCard = qs(['.mempelai .glass-card', '.glass-card']);
      const photoFrame = qs(['.mempelai .photo-frame', '.photo-frame']);
      const infoTexts = qsa(['.mempelai .info li', '.mempelai .info p', '.mempelai .info .item', '.info-item']);
      const instaBtn = qs(['.mempelai .instagram', '.btn-instagram', '.instagram-btn']);

      if (title) {
        addWillChange(title);
        gsap.fromTo(title, {y: -36, opacity: 0}, {
          y: 0, opacity: 1, duration: 0.9, ease: 'back.out(1.2)',
          scrollTrigger: { trigger: title, start: startAtOffset(0.85), toggleActions: 'play none none reverse' }
        });
      }

      // avatars slide in from sides
      if (avatarsLeft.length || avatarsRight.length) {
        const lefts = avatarsLeft;
        const rights = avatarsRight;
        lefts.forEach((el, i) => {
          addWillChange(el);
          gsap.fromTo(el, {x: -60, opacity:0}, {x:0, opacity:1, duration: 0.9, ease: baseEase, delay: i*0.05,
            scrollTrigger:{ trigger: el, start: startAtOffset(0.85), toggleActions: 'play none none reverse'}
          });
        });
        rights.forEach((el, i) => {
          addWillChange(el);
          gsap.fromTo(el, {x: 60, opacity:0}, {x:0, opacity:1, duration: 0.9, ease: baseEase, delay: i*0.05,
            scrollTrigger:{ trigger: el, start: startAtOffset(0.85), toggleActions: 'play none none reverse'}
          });
        });
        if (connector) {
          connector.style.transformOrigin = 'left center';
          gsap.fromTo(connector, {scaleX: 0.2, opacity: 0}, {scaleX: 1, opacity:1, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: connector, start: startAtOffset(0.85), toggleActions: 'play none none reverse' }
          });
        }
      }

      // glass card scale + blur reveal
      if (glassCard) {
        addWillChange(glassCard);
        gsap.fromTo(glassCard, {scale: 0.96, opacity: 0, filter: 'blur(6px)'}, {
          scale: 1, opacity:1, filter: 'blur(0px)', duration: 0.9, ease: baseEase,
          scrollTrigger: { trigger: glassCard, start: startAtOffset(0.85), toggleActions: 'play none none reverse' }
        });
      }

      // photo frame rotate slight + glow border
      if (photoFrame) {
        photoFrame.style.willChange = 'transform, box-shadow';
        gsap.fromTo(photoFrame, {rotation: -6, opacity: 0, scale: 0.98}, {
          rotation: 0, opacity:1, scale:1, duration: 1, ease: 'back.out(0.8)',
          scrollTrigger: { trigger: photoFrame, start: startAtOffset(0.85), toggleActions: 'play none none reverse' }
        });
        // glow border on hover subtle
        photoFrame.addEventListener('mouseenter', () => {
          gsap.to(photoFrame, {boxShadow: '0 10px 30px rgba(0,0,0,0.18)', duration: 0.4, ease: 'power2.out'});
        });
        photoFrame.addEventListener('mouseleave', () => {
          gsap.to(photoFrame, {boxShadow: 'none', duration: 0.6, ease: 'power2.out'});
        });
      }

      // info text stagger fade in from left
      if (infoTexts.length) {
        infoTexts.forEach(el => addWillChange(el));
        gsap.from(infoTexts, {x: -26, opacity: 0, stagger: 0.12, duration: 0.7, ease: baseEase,
          scrollTrigger: { trigger: infoTexts[0], start: startAtOffset(0.9), toggleActions: 'play none none reverse' }
        });
      }

      if (instaBtn) {
        addWillChange(instaBtn);
        gsap.fromTo(instaBtn, {y: 24, opacity: 0}, {y:0, opacity:1, duration: 0.8, ease: 'power2.out',
          scrollTrigger: { trigger: instaBtn, start: startAtOffset(0.9), toggleActions: 'play none none reverse' }
        });
      }
    })();

    // SECTION: EVENTS
    (function events() {
      const section = qs(['#events', '.section-events', '[data-section="events"]', '.events']);
      if (!section) return;

      const cards = qsa(['.event-card', '#events .card', '.events .card']);
      const icons = qsa(['.event-icon', '.events .icon']);
      const title = qs(['#events .section-title', '.events h2', '.section-events .title']) || section.querySelector('h2, h3');
      const metaItems = qsa(['.event-meta li', '.event-meta .item', '.event-details .item']);

      if (title) {
        addWillChange(title);
        gsap.fromTo(title, {y: -26, opacity: 0}, {y: 0, opacity:1, duration: 0.9, ease: baseEase,
          scrollTrigger:{ trigger: title, start: startAtOffset(0.85), toggleActions: 'play none none reverse' }});
        // underline grow if element exists
        const underline = title.querySelector('.underline, .line');
        if (underline) {
          gsap.fromTo(underline, {scaleX:0, transformOrigin:'left center'}, {scaleX:1, duration:0.9, ease:baseEase, scrollTrigger:{trigger: title, start: startAtOffset(0.85)}});
        }
      }

      if (cards.length) {
        cards.forEach((card, i) => {
          addWillChange(card);
          const fromVars = (i % 2 === 0) ? {rotationY: -12, x: -40} : {rotationY: 12, x: 40};
          gsap.fromTo(card, {...fromVars, opacity: 0}, {
            rotationY: 0, x: 0, opacity: 1, duration: 0.9, ease: 'power2.out', transformPerspective: 800,
            scrollTrigger: { trigger: card, start: startAtOffset(0.9), toggleActions: 'play none none reverse' }
          });
        });
      }

      if (icons.length) {
        icons.forEach((ic, i) => {
          addWillChange(ic);
          gsap.fromTo(ic, {y: -18, opacity: 0}, {y:0, opacity:1, duration: 0.6, delay: i * 0.12, ease: 'elastic.out(1, 0.6)',
            scrollTrigger: { trigger: ic, start: startAtOffset(0.95) }});
        });
      }

      if (metaItems.length) {
        metaItems.forEach(el => addWillChange(el));
        gsap.from(metaItems, {y: 18, opacity: 0, stagger: 0.12, duration: 0.7, ease: baseEase, scrollTrigger:{trigger: metaItems[0], start: startAtOffset(0.95)}});
      }
    })();

    // SECTION: LOCATION
    (function locationSection() {
      const section = qs(['#location', '.section-location', '[data-section="location"]', '.location']);
      if (!section) return;

      const pin = qs(['.map-pin', '.pin', '#location .pin']);
      const mapCard = qs(['.map-card', '.location .map-card', '#location .map']);
      const iframe = section.querySelector('iframe') || section.querySelector('iframe.map, .map-iframe');
      const actionButtons = qsa(['.location .btn', '.map-actions .btn', '.action-btn']);

      if (pin) {
        pin.style.willChange = 'transform';
        gsap.to(pin, {y: -6, duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut'});
      }

      if (mapCard) {
        addWillChange(mapCard);
        gsap.fromTo(mapCard, {y: 26, opacity: 0, filter: 'blur(8px)'}, {
          y: 0, opacity: 1, filter: 'blur(0px)', duration: 1, ease: 'power3.out',
          scrollTrigger: { trigger: mapCard, start: startAtOffset(0.85), toggleActions: 'play none none reverse' }
        });
        // map iframe fade in after card
        if (iframe) {
          gsap.fromTo(iframe, {opacity: 0, scale: 0.995}, {
            opacity: 1, scale: 1, duration: 0.9, ease: baseEase,
            scrollTrigger: { trigger: mapCard, start: startAtOffset(0.85), toggleActions: 'play none none reverse' }
          });
        }
      }

      if (actionButtons.length) {
        actionButtons.forEach(btn => addWillChange(btn));
        gsap.from(actionButtons, {y: 18, opacity: 0, stagger: 0.12, duration: 0.7, ease: 'power2.out', scrollTrigger:{trigger: actionButtons[0], start: startAtOffset(0.95)}});
      }
    })();

    // SECTION: GIFT
    (function gift() {
      const section = qs(['#gift', '.section-gift', '[data-section="gift"]', '.gift']);
      if (!section) return;

      const cards = qsa(['.atm-card', '.gift .card', '#gift .card']);
      cards.forEach((card, idx) => {
        addWillChange(card);
        gsap.fromTo(card, {rotationX: -12, rotationZ: (idx % 2 === 0 ? -3 : 3), opacity: 0, y: 26}, {
          rotationX: 0, rotationZ: 0, opacity: 1, y: 0, duration: 0.9, ease: 'power2.out', stagger: 0.08,
          scrollTrigger: { trigger: card, start: startAtOffset(0.9), toggleActions: 'play none none reverse' }
        });

        // create shine overlay for hover (if not exists)
        if (card.querySelector('.card-shine') === null) {
          const shine = document.createElement('div');
          shine.className = 'card-shine';
          shine.setAttribute('aria-hidden','true');
          Object.assign(shine.style, {
            position: 'absolute', left: '-50%', top: '0', width: '60%', height: '100%', transform: 'skewX(-18deg) translateX(-120%)', pointerEvents: 'none',
            background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.18) 50%, rgba(255,255,255,0) 100%)', opacity: 0
          });
          card.style.position = card.style.position || 'relative';
          card.appendChild(shine);
          card.addEventListener('mouseenter', () => gsap.to(shine, {x: '220%', opacity: 1, duration: 0.9, ease: 'power2.out'}));
          card.addEventListener('mouseleave', () => gsap.to(shine, {x: '0%', opacity: 0, duration: 0.9, ease: 'power2.out'}));
        }
      });

      // card numbers typewriter
      const numbers = qsa(['.card-number', '#gift .card-number']);
      numbers.forEach((numEl, i) => {
        ScrollTrigger.create({
          trigger: numEl,
          start: startAtOffset(0.95),
          once: true,
          onEnter: () => {
            const text = numEl.textContent.trim();
            typewriter(numEl, text, {speed: 20});
          }
        });
      });

      // copy buttons pulse on load
      const copyBtns = qsa(['.copy-btn', '.btn-copy']);
      copyBtns.forEach((btn, i) => {
        gsap.fromTo(btn, {scale: 0.98, opacity: 0}, {scale:1, opacity:1, duration: 0.7, delay: 0.2 + i*0.08, ease: 'back.out(1.2)'});
        gsap.to(btn, {scale: 1.04, repeat: 1, yoyo: true, duration: 1.4, delay: 0.8 + i*0.12});
      });
    })();

    // SECTION: RSVP
    (function rsvp() {
      const section = qs(['#rsvp', '.section-rsvp', '[data-section="rsvp"]', '.rsvp']);
      if (!section) return;

      const form = qs(['.rsvp-form', '#rsvp form', '.section-rsvp form']) || section.querySelector('form');
      const commentsCard = qs(['.comments-card', '.rsvp .comments']);
      const inputs = qsa(['.rsvp input', '.rsvp textarea', '.rsvp select', '.rsvp .input']);
      const commentItems = qsa(['.comment-item', '.comments .item']);
      const submitBtn = qs(['.rsvp .btn-submit', '.rsvp button[type="submit"]', '#rsvp .submit']);

      if (form) {
        addWillChange(form);
        gsap.fromTo(form, {x: -26, opacity: 0}, {x:0, opacity:1, duration: 0.9, ease: baseEase, scrollTrigger:{trigger: form, start: startAtOffset(0.9)}});
      }
      if (commentsCard) {
        addWillChange(commentsCard);
        gsap.fromTo(commentsCard, {x: 26, opacity: 0}, {x:0, opacity:1, duration: 0.9, ease: baseEase, scrollTrigger:{trigger: commentsCard, start: startAtOffset(0.9)}});
      }

      if (inputs.length) {
        inputs.forEach(el => el.setAttribute('data-animate','true'));
        gsap.from(inputs, {y: 12, opacity: 0, stagger: 0.08, duration: 0.6, ease: baseEase, scrollTrigger:{trigger: inputs[0], start: startAtOffset(0.95)}});
        // border glow on focus via class toggle to keep CSS separate
        inputs.forEach(inp => {
          inp.addEventListener('focus', () => inp.classList.add('gsap-focus'));
          inp.addEventListener('blur', () => inp.classList.remove('gsap-focus'));
        });
      }

      if (commentItems.length) {
        commentItems.forEach(ci => addWillChange(ci));
        gsap.from(commentItems, {y: 12, opacity: 0, stagger: 0.12, duration: 0.7, ease: baseEase, scrollTrigger:{trigger: commentItems[0], start: startAtOffset(0.95)}});
      }

      if (submitBtn) {
        makeMagnetic(submitBtn, 0.18);
      }
    })();

    // SECTION: FOOTER
    (function footer() {
      const section = qs(['footer', '#footer', '.site-footer', '.section-footer']);
      if (!section) return;
      const content = qs(['footer .content', '.footer .content', '.footer-content']) || section;
      const closing = qs(['.closing-text', '.footer .closing', '#closing-text']);
      const signature = qs(['.signature', '.footer .signature']);
      const copy = qs(['.copyright', '.footer .copyright']);

      if (content) {
        addWillChange(content);
        gsap.fromTo(content, {scale: 0.98, opacity: 0}, {scale:1, opacity:1, duration: 0.9, ease: 'power2.out', scrollTrigger:{trigger: content, start: startAtOffset(0.95)}});
      }

      if (closing) {
        ScrollTrigger.create({
          trigger: closing,
          start: startAtOffset(0.95),
          once: true,
          onEnter: () => {
            typewriter(closing, closing.textContent.trim(), {speed: 20});
          }
        });
      }

      if (signature) {
        addWillChange(signature);
        gsap.fromTo(signature, {y: 18, opacity: 0}, {y:0, opacity:1, duration: 0.9, ease: 'back.out(1.2)', scrollTrigger:{trigger: signature, start: startAtOffset(0.95)}});
      }

      if (copy) {
        addWillChange(copy);
        gsap.fromTo(copy, {opacity: 0}, {opacity:1, duration: 0.7, delay: 0.2, ease: baseEase, scrollTrigger:{trigger: copy, start: startAtOffset(0.98)}});
      }
    })();

    // performance: refresh on resize
    ScrollTrigger.addEventListener('refreshInit', () => {
      // minimize heavy animations on very small screens
      if (isMobile()) {
        // if needed, reduce durations or kills certain tweens (we used mobile flags earlier)
      }
    });
    ScrollTrigger.refresh();
  }

  // Kickoff at DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', run);
  } else {
    run();
  }
})();