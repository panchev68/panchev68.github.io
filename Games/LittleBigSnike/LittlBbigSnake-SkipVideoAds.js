// ==UserScript==
// @name         Remove littlebigsnake video ads
// @namespace    http://tampermonkey.net/
// @version      0.4
// @description  remove video ads with optimized performance
// @author       Bobby
// @match        https://littlebigsnake.com/*
// @run-at       document-start
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    var lastskip = null;
    var seenVideos = new WeakSet();
    var hookedVideos = new WeakSet();
    var pendingNodes = new Set();
    var flushScheduled = false;
    var adsContainer = null;
    var isProcessing = false;

    function getAdsContainer() {
        if (!adsContainer || !adsContainer.isConnected) {
            adsContainer = document.getElementById('adsContainer');
        }
        return adsContainer;
    }

    function skipVideo(v) {
        if (!v || v.nodeType !== Node.ELEMENT_NODE) return;

        // Проверяваме дали вече е обработено
        if (hookedVideos.has(v)) return;

        hookedVideos.add(v);

        // Добавяме слушатели само веднъж
        v.addEventListener('canplay', (event) => {
            try {
                const video = event.currentTarget || event.target;
                if (video.currentTime < video.duration - 0.5) {
                    video.currentTime = video.duration;
                }
            } catch (e) { }
        }, { once: false, passive: true });

        v.addEventListener('playing', (event) => {
            try {
                const video = event.currentTarget || event.target;
                if (video.currentTime < video.duration - 0.5) {
                    video.currentTime = video.duration;
                }
            } catch (e) { }
        }, { once: false, passive: true });

        // Веднага пропускаме видеото
        try {
            if (v.currentTime < v.duration - 0.5) {
                v.currentTime = v.duration;
            }
            v.play().catch(() => { });
        } catch (e) { }

        // Скриваме реклама контейнер асинхронно
        if (getAdsContainer()) {
            requestAnimationFrame(() => {
                const c = getAdsContainer();
                if (c && c.style.display !== 'none') {
                    c.style.display = 'none';
                }
            });
        }
    }

    function isRelevantNode(n) {
        if (!n || n.nodeType !== Node.ELEMENT_NODE) return false;
        var tag = n.tagName && n.tagName.toLowerCase();
        if (tag === 'video' || tag === 'lima-video') return true;
        return !!(n.querySelector && n.querySelector('video, lima-video'));
    }

    function processNode(n) {
        if (!n || n.nodeType !== Node.ELEMENT_NODE) return;

        var tag = n.tagName && n.tagName.toLowerCase();
        if (tag === 'video') {
            if (!seenVideos.has(n)) {
                seenVideos.add(n);
                skipVideo(n);
            }
        }

        if (tag === 'lima-video' && n.shadowRoot) {
            for (const v of n.shadowRoot.querySelectorAll('video')) {
                if (!seenVideos.has(v)) {
                    seenVideos.add(v);
                    skipVideo(v);
                }
            }
        }
    }

    function flushPendingNodes() {
        flushScheduled = false;
        isProcessing = true;

        // Обработваме максимум 16 елемента по време на игра
        let processed = 0;
        for (const n of pendingNodes) {
            if (processed >= 16) break;
            processNode(n);
            pendingNodes.delete(n);
            processed++;
        }

        isProcessing = false;
    }

    function scheduleFlush() {
        if (flushScheduled || isProcessing) return;
        flushScheduled = true;

        // Използваме requestIdleCallback за максимална производителност
        if (typeof requestIdleCallback === 'function') {
            requestIdleCallback(flushPendingNodes, { timeout: 200 });
        } else {
            setTimeout(flushPendingNodes, 50);
        }
    }

    function mutCallback(mutationList, observer) {
        for (const m of mutationList) {
            for (const n of m.addedNodes) {
                if (!isRelevantNode(n)) continue;
                pendingNodes.add(n);
                if (pendingNodes.size >= 32) break;
            }
        }
        scheduleFlush();
    }

    // Наблюдавам само най-важните промени
    var mutObs = new MutationObserver(mutCallback);
    mutObs.observe(document.body || document.documentElement, {
        childList: true,
        subtree: true
    });

    // Обработваме съществуващите видеа асинхронно
    if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => {
            for (const v of document.querySelectorAll('video')) {
                seenVideos.add(v);
                skipVideo(v);
            }
        });
    } else {
        setTimeout(() => {
            for (const v of document.querySelectorAll('video')) {
                seenVideos.add(v);
                skipVideo(v);
            }
        }, 100);
    }

})();
