// ==UserScript==
// @name         Little Big Snike Graphics Quality
// @namespace    http://tampermonkey.net/
// @version      1.5
// @description  Намалява render resolution (render scale) и форсира по-леки WebGL context attributes за по-добра performance
// @author       Bobby
// @match        https://littlebigsnake.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_ENABLED = 'lbs_gfx_low_enabled';
    const STORAGE_SCALE = 'lbs_gfx_render_scale';
    const MIN_SCALE = 0.3;
    const MAX_SCALE = 1;
    const SCALE_STEP = 0.05;
    const DEFAULT_SCALE = 0.65;

    function loadEnabled() {
        return localStorage.getItem(STORAGE_ENABLED) === '1';
    }
    function loadScale() {
        const raw = parseFloat(localStorage.getItem(STORAGE_SCALE));
        if (!isNaN(raw) && raw >= MIN_SCALE && raw <= MAX_SCALE) return raw;
        return DEFAULT_SCALE;
    }

    let lowGfxEnabled = loadEnabled();
    let renderScale = loadScale();

    function save() {
        try {
            localStorage.setItem(STORAGE_ENABLED, lowGfxEnabled ? '1' : '0');
            localStorage.setItem(STORAGE_SCALE, String(renderScale));
        } catch (e) { /* ignore */ }
    }

    // Собствените ни overlay canvas-и (от MousePointer.js) НЕ трябва да се засягат.
    const OWN_CANVAS_IDS = new Set(['trail-canvas', 'direction-line-canvas']);

    // ==================== Намаляване на резолюцията чрез devicePixelRatio ====================
    // Unity WebGL смята и framebuffer размера, и camera/viewport математиката от
    // window.devicePixelRatio - затова подмяната тук е безопасна (за разлика от
    // директно пипане на canvas.width/height, което им разминава и показва само
    // ъгъл от картината, разтеглен на целия екран).
    const realDPR = window.devicePixelRatio || 1;
    const dprDesc = Object.getOwnPropertyDescriptor(window, 'devicePixelRatio') ||
        Object.getOwnPropertyDescriptor(Window.prototype, 'devicePixelRatio');

    if (dprDesc && dprDesc.configurable) {
        Object.defineProperty(window, 'devicePixelRatio', {
            configurable: true,
            enumerable: true,
            get: function () {
                return lowGfxEnabled ? realDPR * renderScale : realDPR;
            }
        });
    }

    // ==================== По-леки WebGL context attributes ====================
    const origGetContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, attrs) {
        if (lowGfxEnabled && /webgl/i.test(type) && !OWN_CANVAS_IDS.has(this.id)) {
            attrs = Object.assign({}, attrs, {
                antialias: false
            });
        }
        return origGetContext.call(this, type, attrs);
    };

    function triggerGameResize() {
        try { window.dispatchEvent(new Event('resize')); } catch (e) { /* ignore */ }
    }

    // ==================== Индикатор на екрана ====================
    let indicatorEl = null;
    function ensureIndicator() {
        if (indicatorEl || !document.body) return indicatorEl;
        indicatorEl = document.createElement('div');
        indicatorEl.id = 'lbs-gfx-status';
        indicatorEl.style.cssText = [
            'position:fixed', 'top:70px', 'left:10px', 'z-index:999999',
            'background:rgba(0,0,0,0.65)', 'font:bold 14px monospace',
            'padding:6px 10px', 'border-radius:6px', 'pointer-events:none'
        ].join(';');
        document.body.appendChild(indicatorEl);
        return indicatorEl;
    }

    function updateIndicator() {
        const el = ensureIndicator();
        if (!el) return;
        el.textContent = 'Low Gfx: ' + (lowGfxEnabled ? ('ON (' + Math.round(renderScale * 100) + '%)') : 'OFF') + '  (G, , . 0)';
        el.style.color = lowGfxEnabled ? '#0f0' : '#f44';
    }

    document.addEventListener('DOMContentLoaded', updateIndicator);

    window.addEventListener('keydown', function (e) {
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        if (e.key === 'g' || e.key === 'G') {
            lowGfxEnabled = !lowGfxEnabled;
            save();
            updateIndicator();
            triggerGameResize();
            console.log('[LBS GfxQuality] Low graphics:', lowGfxEnabled ? 'ВКЛЮЧЕНО' : 'ИЗКЛЮЧЕНО',
                '- ако картината не се промени веднага, презареди страницата (F5), за да хване новата настройка при инициализация.');
        } else if (e.key === ',') {
            renderScale = Math.max(MIN_SCALE, Math.round((renderScale - SCALE_STEP) * 100) / 100);
            save();
            updateIndicator();
            triggerGameResize();
        } else if (e.key === '.') {
            renderScale = Math.min(MAX_SCALE, Math.round((renderScale + SCALE_STEP) * 100) / 100);
            save();
            updateIndicator();
            triggerGameResize();
        } else if (e.key === '0') {
            renderScale = DEFAULT_SCALE;
            save();
            updateIndicator();
            triggerGameResize();
        }
    }, true);

    console.log('[LBS GfxQuality] Стартиран. "G" = вкл/изкл намалено качество, "," / "." = render scale надолу/нагоре.',
        'Текущо: enabled=' + lowGfxEnabled, 'scale=' + renderScale,
        '- Настройката се прилага при следващото задаване на canvas resolution от играта (обикновено при зареждане). Ако включиш по средата на мач, презареди страницата.');
})();
