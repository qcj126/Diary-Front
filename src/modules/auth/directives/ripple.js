const RIPPLE_STYLE_ID = 'auth-ripple-style'

function ensureRippleStyle() {
  if (document.getElementById(RIPPLE_STYLE_ID)) return

  const style = document.createElement('style')
  style.id = RIPPLE_STYLE_ID
  style.textContent = `
    @keyframes auth-ripple {
      to {
        transform: scale(var(--auth-ripple-scale, 3));
        opacity: 0;
      }
    }

    .ani_ripple {
      transform: scale(0.18);
      opacity: 0.88;
      filter: blur(0.5px);
      mix-blend-mode: screen;
      will-change: transform, opacity;
      background:
        radial-gradient(circle,
          rgba(255, 255, 255, 0.34) 0%,
          var(--auth-ripple-water-color, rgba(125, 211, 252, 0.22)) 14%,
          transparent 24%,
          var(--auth-ripple-ring-color, rgba(125, 211, 252, 0.32)) 28%,
          transparent 32%,
          transparent 46%,
          var(--auth-ripple-ring-color, rgba(125, 211, 252, 0.28)) 50%,
          transparent 54%,
          transparent 68%,
          var(--auth-ripple-ring-color, rgba(255, 255, 255, 0.2)) 72%,
          transparent 76%,
          transparent 100%
        );
      box-shadow:
        0 0 18px var(--auth-ripple-water-color, rgba(125, 211, 252, 0.22)),
        inset 0 0 18px rgba(255, 255, 255, 0.14);
    }

    .ani_ripple::before,
    .ani_ripple::after {
      content: "";
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
    }

    .ani_ripple::before {
      background:
        repeating-radial-gradient(circle,
          transparent 0 9%,
          var(--auth-ripple-ring-color, rgba(125, 211, 252, 0.18)) 10% 11%,
          transparent 12% 19%
        );
      animation: auth-ripple-shimmer 2700ms linear infinite;
      opacity: 0.62;
    }

    .ani_ripple::after {
      inset: 10%;
      background:
        radial-gradient(ellipse at 35% 32%, rgba(255, 255, 255, 0.38), transparent 28%),
        radial-gradient(ellipse at 68% 66%, var(--auth-ripple-water-color, rgba(56, 189, 248, 0.2)), transparent 34%);
      animation: auth-ripple-glide 2700ms ease-in-out infinite alternate;
      opacity: 0.56;
    }

    @keyframes auth-ripple-shimmer {
      from {
        transform: rotate(0deg) scale(0.96);
      }

      to {
        transform: rotate(18deg) scale(1.04);
      }
    }

    @keyframes auth-ripple-glide {
      from {
        transform: translate(-5%, -3%) scale(0.96);
      }

      to {
        transform: translate(5%, 4%) scale(1.06);
      }
    }
  `
  document.head.appendChild(style)
}

function createRipple(el, event, options = {}) {
  if (el.hasAttribute('disabled') || el.getAttribute('aria-disabled') === 'true') return

  const rect = el.getBoundingClientRect()
  const size = options.size ?? Math.max(el.clientWidth, el.clientHeight) / 3
  const rippleEl = document.createElement('span')
  const ringColor = options.ringColor ?? options.color ?? 'rgba(125,211,252,.32)'
  const waterColor = options.waterColor ?? 'rgba(56,189,248,.22)'

  Object.assign(rippleEl.style, {
    position: 'absolute',
    borderRadius: '50%',
    backgroundColor: 'transparent',
    width: `${size}px`,
    height: `${size}px`,
    left: `${event.clientX - rect.left - size / 2}px`,
    top: `${event.clientY - rect.top - size / 2}px`,
    animation: `auth-ripple ${options.duration ?? 2700}ms ease-out`,
    pointerEvents: 'none',
    zIndex: options.zIndex ?? '2',
    opacity: options.opacity ?? '1',
    '--auth-ripple-scale': String(options.scale ?? 3),
    '--auth-ripple-ring-color': ringColor,
    '--auth-ripple-water-color': waterColor,
  })

  rippleEl.classList.add('ani_ripple')
  el.appendChild(rippleEl)
  rippleEl.addEventListener('animationend', () => rippleEl.remove(), { once: true })
}

export const ripple = {
  mounted(el, binding) {
    ensureRippleStyle()

    const options = binding.value ?? {}
    const trigger = options.trigger ?? 'down'
    const previousPosition = el.style.position
    const previousOverflow = el.style.overflow

    if (getComputedStyle(el).position === 'static') {
      el.style.position = 'relative'
    }
    el.style.overflow = 'hidden'

    let last = 0
    const interval = options.interval ?? 360

    const handler = (event) => {
      if (trigger === 'move') {
        const now = performance.now()
        if (now - last < interval) return
        last = now
      }
      createRipple(el, event, options)
    }

    const eventName = trigger === 'move' ? 'mousemove' : 'mousedown'
    el.addEventListener(eventName, handler)
    el.__authRippleCleanup = () => {
      el.removeEventListener(eventName, handler)
      el.style.position = previousPosition
      el.style.overflow = previousOverflow
    }
  },
  unmounted(el) {
    el.__authRippleCleanup?.()
    delete el.__authRippleCleanup
  },
}
