/* Supportive CSS for GSAP animations
   - Focus glow styles
   - Card shine helper
   - Minimal styles only (do not alter layout)
*/

/* Focus glow for inputs used by JS */
.gsap-focus {
  box-shadow: 0 6px 20px rgba(99, 102, 241, 0.12), 0 1px 0 rgba(99,102,241,0.04);
  border-color: rgba(99, 102, 241, 0.9);
  transition: box-shadow 0.25s ease, border-color 0.25s ease;
  outline: none;
}

/* cards: shine overlay class used by JS */
.atm-card, .card {
  position: relative;
  overflow: visible;
}
.card-shine {
  pointer-events: none;
  will-change: transform, opacity;
}

/* small accessibility helper for reduced motion preference */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.001ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001ms !important;
    scroll-behavior: auto !important;
  }
}

/* Mobile-specific simplifications (fewer intense shadows) */
@media (max-width: 768px) {
  .card-shine { display: none; }
}

/* Button scaling for copy/micro interactions */
.copy-btn {
  transition: transform 0.28s cubic-bezier(.22,.9,.35,1), box-shadow 0.28s;
}
.copy-btn:active { transform: scale(0.98); }

/* Make sure elements that will animate are using transform for GPU */
[data-animate] {
  backface-visibility: hidden;
  transform-style: preserve-3d;
  -webkit-font-smoothing: antialiased;
                     }
