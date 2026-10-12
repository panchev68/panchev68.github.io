// ==UserScript==
// @name         Little Big Snike Auto Emote
// @namespace    http://tampermonkey.net/
// @version      4.3
// @description  Десен клик -> бутон 1, двоен -> бутон 2, троен -> бутон 3
// @author       Bobby
// @match        https://littlebigsnake.com/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    function sendEmoteKey(key) {
        const opts = { key: key, code: 'Digit' + key, keyCode: key.charCodeAt(0), which: key.charCodeAt(0), bubbles: true, cancelable: true };
        try {
            document.dispatchEvent(new KeyboardEvent('keydown', opts));
            document.dispatchEvent(new KeyboardEvent('keypress', opts));
        } catch (e) { /* ignore */ }
        setTimeout(function () {
            try { document.dispatchEvent(new KeyboardEvent('keyup', opts)); } catch (e) { /* ignore */ }
        }, 10);
    }

    const DOUBLE_CLICK_MS = 350;
    const CLICK_KEYS = { 1: '1', 2: '2', 3: '3' };
    let clickCount = 0;
    let clickTimer = null;

    // Десен клик -> бутон 1, двоен -> бутон 2, троен -> бутон 3.
    // Спираме и контекстното меню на браузъра.
    window.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    }, true);

    window.addEventListener('mousedown', function (e) {
        if (e.button !== 2) return;

        clickCount++;
        clearTimeout(clickTimer);

        if (clickCount >= 3) {
            // Троен клик - гърми веднага, няма нужда да чакаме повече.
            clickCount = 0;
            sendEmoteKey(CLICK_KEYS[3]);
            return;
        }

        // Изчакваме малко - ако не дойде следващ клик навреме, броим текущия брой.
        clickTimer = setTimeout(function () {
            const count = clickCount;
            clickCount = 0;
            if (CLICK_KEYS[count]) sendEmoteKey(CLICK_KEYS[count]);
        }, DOUBLE_CLICK_MS);
    }, true);

    console.log('[LBS AutoEmote] Стартиран. Десен клик -> бутон 1, двоен -> бутон 2, троен -> бутон 3.');
})();
