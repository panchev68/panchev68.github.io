// ==UserScript==
// @name         Little Big Snike Auto Emote
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Emote само при рязка промяна на посоката на мишката - клик върху emoji елемент + backup digit клавиш
// @author       Bobby
// @match        https://littlebigsnake.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const STORAGE_ENABLED = 'lbs_auto_emote';
    const STORAGE_COOLDOWN = 'lbs_auto_emote_cooldown';
    const MIN_COOLDOWN = 500;
    const MAX_COOLDOWN = 30000;
    const COOLDOWN_STEP = 500;
    const DEFAULT_COOLDOWN = 5000;
    const EMOTE_KEYS = ['6', '0'];

    const SHARP_TURN_ANGLE_DEG = 120; // минимален ъгъл на завой, за да се брои "рязко"
    const SHARP_TURN_WINDOW_MS = 300; // прозорец от време, в който трябва да се случи завоят
    const SHARP_TURN_MIN_SPEED = 3;  // px между mousemove събития, за да игнорираме шум/стоене на място

    function loadEnabled() {
        return localStorage.getItem(STORAGE_ENABLED) === '1';
    }
    function loadCooldown() {
        const raw = parseFloat(localStorage.getItem(STORAGE_COOLDOWN));
        if (!isNaN(raw) && raw >= MIN_COOLDOWN && raw <= MAX_COOLDOWN) return raw;
        return DEFAULT_COOLDOWN;
    }

    let autoEmoteEnabled = loadEnabled();
    let sharpTurnCooldown = loadCooldown();
    let lastDirX = null;
    let lastDirY = null;
    let lastSharpTurnTime = 0;
    let cumulativeAngle = 0; // кумулативен ПОДПИСАН (net) ъгъл - отменя се при смяна на посоката,
                              // за да не броим напред-назад стъргане за "кръг"
    let lastMoveTime = 0;
    let spaceHeld = false;
    let firstTriggerPending = false; // след включване - следващият истински тригер праща START_KEY
    const START_KEY = '1';
    const FULL_CIRCLE_KEY = '8';
    const CIRCLE_END_KEY = '9';
    const CIRCLES_NEEDED = 2; // поне 2 пълни кръга (720°), за да гръмне бутон 8
    const CIRCLE_END_IDLE_MS = 400; // пауза в движението, за да броим въртенето за приключило
    const CIRCLE_END_MIN_ROTATION = 180; // минимално натрупано въртене, за да не е случаен шум
    const CIRCLING_SUPPRESS_THRESHOLD = 90; // над този праг на нетно въртене - вече сме "в кръг", спираме shuffle-bag тригера
    const ROTATION_IDLE_RESET_MS = 250; // пауза в движението, след която нулираме натрупания ъгъл (нов "сесия")

    // Кратка история от {time, dirX, dirY}, за да сравняваме текущата посока
    // с посоката отпреди SHARP_TURN_WINDOW_MS, а не само с предишния кадър.
    const dirHistory = [];

    window.addEventListener('keydown', function (e) {
        if (e.code === 'Space' || e.key === ' ') spaceHeld = true;
    }, true);
    window.addEventListener('keyup', function (e) {
        if (e.code === 'Space' || e.key === ' ') spaceHeld = false;
    }, true);
    window.addEventListener('blur', function () { spaceHeld = false; });

    function save() {
        try {
            localStorage.setItem(STORAGE_ENABLED, autoEmoteEnabled ? '1' : '0');
            localStorage.setItem(STORAGE_COOLDOWN, String(sharpTurnCooldown));
        } catch (e) { /* ignore */ }
    }

    function randomInt(min, max) {
        return Math.floor(min + Math.random() * (max - min + 1));
    }

    // Shuffle-bag: връща елементите в случаен ред, без повторение, докато не
    // се изчерпят - тогава разбърква отново. Избягва два еднакви emotes подред.
    function createShuffleBag() {
        let bag = [];
        return function next(items) {
            if (bag.length === 0) {
                bag = items.slice();
                for (let i = bag.length - 1; i > 0; i--) {
                    const j = randomInt(0, i);
                    const tmp = bag[i]; bag[i] = bag[j]; bag[j] = tmp;
                }
            }
            return bag.pop();
        };
    }
    const nextEmoteKey = createShuffleBag();

    // Намираме кандидати за emoji/emote елементи - тъй като не знаем точните
    // selector-и на играта, търсим широко по id/class.
    function findEmoteElements() {
        const all = Array.from(document.querySelectorAll('button, [role="button"], div, span'));
        return all.filter(el => {
            const id = (el.id || '').toLowerCase();
            const cls = (typeof el.className === 'string' ? el.className : '').toLowerCase();
            if (!(/emo(j|t)i?/.test(id) || /emo(j|t)i?/.test(cls))) return false;
            const rect = el.getBoundingClientRect();
            return rect.width > 0 && rect.height > 0;
        });
    }

    function sendEmoteKey(key) {
        const opts = { key: key, code: 'Digit' + key, keyCode: key.charCodeAt(0), which: key.charCodeAt(0), bubbles: true, cancelable: true };
        try {
            document.dispatchEvent(new KeyboardEvent('keydown', opts));
            document.dispatchEvent(new KeyboardEvent('keypress', opts));
        } catch (e) { /* ignore */ }
        setTimeout(function () {
            try { document.dispatchEvent(new KeyboardEvent('keyup', opts)); } catch (e) { /* ignore */ }
        }, 60);
    }

    function fireEmote(specificKey) {
        // 1) Клик върху случаен намерен emoji/emote елемент (ако има такъв).
        const candidates = findEmoteElements();
        if (candidates.length > 0) {
            const el = candidates[randomInt(0, candidates.length - 1)];
            try {
                el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true, cancelable: true, view: window }));
                el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true, cancelable: true, view: window }));
                el.click();
            } catch (e) { /* ignore */ }
        }

        // 2) Digit клавиш - или конкретен (напр. пълен кръг -> "8"), или от
        // shuffle-bag (случайна последователност без повторение). Оказа се, че
        // digit клавишите реално задействат emote-ите.
        const key = specificKey || nextEmoteKey(EMOTE_KEYS);
        sendEmoteKey(key);
    }

    // ==================== Тригер при рязка промяна на посоката на мишката ====================
    const MIN_TRACK_SPEED = 0.5; // почти всяко реално движение - за да не губим кадри от бавен кръг

    document.addEventListener('mousemove', function (e) {
        if (!autoEmoteEnabled || !spaceHeld) return;

        const dx = e.movementX || 0;
        const dy = e.movementY || 0;
        const speed = Math.sqrt(dx * dx + dy * dy);
        if (speed < MIN_TRACK_SPEED) return;

        const now = Date.now();

        // При пауза в движението третираме следващото завъртане като нова "сесия" -
        // иначе обикновено стъргане напред-назад по време на игра би задържало
        // натрупания ъгъл вечно, блокирайки останалите emotes.
        if (lastMoveTime && now - lastMoveTime > ROTATION_IDLE_RESET_MS) {
            cumulativeAngle = 0;
        }
        lastMoveTime = now;

        // ==================== Sharp-turn detection (изисква по-висока скорост) ====================
        if (speed >= SHARP_TURN_MIN_SPEED) {
            // Изчистваме от историята всичко по-старо от прозореца.
            while (dirHistory.length > 0 && now - dirHistory[0].time > SHARP_TURN_WINDOW_MS) {
                dirHistory.shift();
            }

            // Сравняваме текущата посока с най-старата в прозореца (~SHARP_TURN_WINDOW_MS
            // назад), за да хванем завой, случил се за кратко време, не само за 1 кадър.
            if (dirHistory.length > 0) {
                const ref = dirHistory[0];
                const refLen = Math.sqrt(ref.dirX * ref.dirX + ref.dirY * ref.dirY);
                const dot = (ref.dirX * dx + ref.dirY * dy) / (refLen * speed);
                const angleDeg = Math.acos(Math.max(-1, Math.min(1, dot))) * (180 / Math.PI);

                const alreadyCircling = Math.abs(cumulativeAngle) >= CIRCLING_SUPPRESS_THRESHOLD;
                if (angleDeg >= SHARP_TURN_ANGLE_DEG && (now - lastSharpTurnTime) > sharpTurnCooldown && !alreadyCircling) {
                    lastSharpTurnTime = now;
                    if (firstTriggerPending) {
                        firstTriggerPending = false;
                        fireEmote(START_KEY);
                    } else {
                        fireEmote();
                    }
                }
            }

            dirHistory.push({ time: now, dirX: dx, dirY: dy });
        }

        // ==================== Кръгово проследяване (на ВСЯКО движение, дори бавно) ====================
        // Сумираме ПОДПИСАНИЯ ъгъл между последователни кадри - при смяна на посоката
        // (напр. напред-назад стъргане) той се самоанулира вместо да продължава да
        // расте, така че реално отчита само истинско въртене.
        if (lastDirX !== null) {
            const cross = lastDirX * dy - lastDirY * dx;
            const signedDeltaDeg = Math.atan2(cross, lastDirX * dx + lastDirY * dy) * (180 / Math.PI);
            cumulativeAngle += signedDeltaDeg;

            if (Math.abs(cumulativeAngle) >= 360 * CIRCLES_NEEDED) {
                cumulativeAngle = 0;
                fireEmote(FULL_CIRCLE_KEY);
            }
        }

        lastDirX = dx;
        lastDirY = dy;
    }, { passive: true });

    // Проверяваме периодично дали въртенето е приключило (мишката е спряла след
    // забележимо натрупано въртене) - тогава пращаме бутон 9 и нулираме бройката.
    setInterval(function () {
        if (!autoEmoteEnabled || !spaceHeld) return;
        if (Math.abs(cumulativeAngle) < CIRCLE_END_MIN_ROTATION) return;
        if (Date.now() - lastMoveTime < CIRCLE_END_IDLE_MS) return;

        cumulativeAngle = 0;
        fireEmote(CIRCLE_END_KEY);
    }, 150);

    // ==================== Индикатор на екрана ====================
    let indicatorEl = null;
    function ensureIndicator() {
        if (indicatorEl || !document.body) return indicatorEl;
        indicatorEl = document.createElement('div');
        indicatorEl.id = 'lbs-auto-emote-status';
        indicatorEl.style.cssText = [
            'position:fixed', 'top:100px', 'left:10px', 'z-index:999999',
            'background:rgba(0,0,0,0.65)', 'font:bold 14px monospace',
            'padding:6px 10px', 'border-radius:6px', 'pointer-events:none'
        ].join(';');
        document.body.appendChild(indicatorEl);
        return indicatorEl;
    }

    function updateIndicator() {
        const el = ensureIndicator();
        if (!el) return;
        el.textContent = 'Auto Emote: ' + (autoEmoteEnabled ? ('ON (задръж SPACE + рязък завой, cooldown ' + sharpTurnCooldown + 'ms)') : 'OFF') + '  (E, [ / ])';
        el.style.color = autoEmoteEnabled ? '#0f0' : '#f44';
    }

    document.addEventListener('DOMContentLoaded', updateIndicator);
    if (document.readyState !== 'loading') updateIndicator();

    window.addEventListener('keydown', function (e) {
        const tag = (e.target && e.target.tagName) || '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return;

        if (e.key === 'e' || e.key === 'E') {
            autoEmoteEnabled = !autoEmoteEnabled;
            save();
            updateIndicator();
            if (autoEmoteEnabled) {
                cumulativeAngle = 0;
                firstTriggerPending = true;
            }
            console.log('[LBS AutoEmote] Auto emote:', autoEmoteEnabled ? 'ВКЛЮЧЕН' : 'ИЗКЛЮЧЕН');
        } else if (e.key === '[') {
            sharpTurnCooldown = Math.max(MIN_COOLDOWN, sharpTurnCooldown - COOLDOWN_STEP);
            save();
            updateIndicator();
        } else if (e.key === ']') {
            sharpTurnCooldown = Math.min(MAX_COOLDOWN, sharpTurnCooldown + COOLDOWN_STEP);
            save();
            updateIndicator();
        }
    }, true);

    console.log('[LBS AutoEmote] Стартиран. "E" = вкл/изкл, "[" / "]" = cooldown между тригери от рязък завой.',
        'Emote излиза само при рязка промяна на посоката на мишката (>=' + SHARP_TURN_ANGLE_DEG + '°), не на таймер.');
})();
