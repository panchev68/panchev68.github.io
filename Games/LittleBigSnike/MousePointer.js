// ==UserScript==
// @name         Mouse Pointer
// @namespace    http://tampermonkey.net/
// @version      0.9
// @description  Показва курсор на мишката в играта LittleBigSnake
// @author       Bobby
// @match        https://littlebigsnake.com/*
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    // Ако Zoom.js е активен, той подменя window.innerWidth/innerHeight за играта,
    // затова тук ползваме истинските размери на екрана, за да не се разбъркат
    // координатите на курсора и линията.
    function winWidth() {
        return typeof window.__lbsRealInnerWidth === 'function' ? window.__lbsRealInnerWidth() : window.innerWidth;
    }

    function winHeight() {
        return typeof window.__lbsRealInnerHeight === 'function' ? window.__lbsRealInnerHeight() : window.innerHeight;
    }

    function initScript() {
        // Добавяме CSS стил за курсора и канваса
        const cssStyle = `
            #mouse-pointer {
                position: fixed;
                width: 20px;
                height: 20px;
                border: 2px solid #ff0000;
                border-radius: 60%;
                background-color: rgba(255, 0, 0, 0.9);
                pointer-events: none;
                z-index: 10000;
                box-shadow: 0 0 10px #ff0000, inset 0 0 5px #ff0000;
                transform: translate(-50%, -50%);
            }
            #trail-canvas {
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 9999;
            }
            #direction-line-canvas {
                position: fixed;
                top: 0;
                left: 0;
                pointer-events: none;
                z-index: 9998;
            }
        `;
        GM_addStyle(cssStyle);

        // Проверяме дали body съществува
        if (!document.body) {
            setTimeout(initScript, 100);
            return;
        }

        // Създаваме елемента за курсора
        const mousePointer = document.createElement('div');
        mousePointer.id = 'mouse-pointer';
        document.body.appendChild(mousePointer);

        // Създаваме канас за линията от центъра до мишката
        const directionCanvas = document.createElement('canvas');
        directionCanvas.id = 'direction-line-canvas';
        directionCanvas.width = winWidth();
        directionCanvas.height = winHeight();
        document.body.appendChild(directionCanvas);

        const dirCtx = directionCanvas.getContext('2d');
        let mouseX = winWidth() / 2;
        let mouseY = winHeight() / 2;
        let prevMouseX = mouseX;
        let prevMouseY = mouseY;

        // Променливи за кръговото движение
        let circleMode = false;
        let circleAngle = 0;
        const circleRadius = 1000;
        const circleSpeed = 0.1;

        // Променливи за интерполация на движението
        let isInterpolating = false;
        let interpolationProgress = 0;
        let targetMouseX = winWidth() / 2;
        let targetMouseY = winHeight() / 2;
        let interpolationStartX = mouseX;
        let interpolationStartY = mouseY;

        // Преразмеряваме канаса при промяна на размера на прозореца
        window.addEventListener('resize', function () {
            directionCanvas.width = winWidth();
            directionCanvas.height = winHeight();
        });

        // Скорост на завиване - по-високата стойност означава по-бързо завиване на змията
        const TURN_SPEED = 1;

        // ==================== Ограничение на курсора в кръг около центъра ====================
        const CLAMP_STORAGE_KEY = 'lbs_mouse_clamp';
        const CLAMP_RADIUS_STORAGE_KEY = 'lbs_mouse_clamp_radius';
        const MIN_CLAMP_RADIUS = 50;
        const MAX_CLAMP_RADIUS = 2000;
        const CLAMP_RADIUS_STEP = 20;

        function loadClampEnabled() {
            return localStorage.getItem(CLAMP_STORAGE_KEY) === '1';
        }
        function loadClampRadius() {
            const raw = parseFloat(localStorage.getItem(CLAMP_RADIUS_STORAGE_KEY));
            if (!isNaN(raw) && raw >= MIN_CLAMP_RADIUS && raw <= MAX_CLAMP_RADIUS) return raw;
            return 300;
        }

        let clampEnabled = loadClampEnabled();
        let clampRadius = loadClampRadius();

        function saveClampState() {
            try {
                localStorage.setItem(CLAMP_STORAGE_KEY, clampEnabled ? '1' : '0');
                localStorage.setItem(CLAMP_RADIUS_STORAGE_KEY, String(clampRadius));
            } catch (e) { /* ignore */ }
        }

        // Индикатор на екрана за статуса на ограничението.
        const clampStatusEl = document.createElement('div');
        clampStatusEl.id = 'lbs-mouse-clamp-status';
        clampStatusEl.style.cssText = [
            'position:fixed', 'top:40px', 'left:10px', 'z-index:999999',
            'background:rgba(0,0,0,0.65)', 'font:bold 14px monospace',
            'padding:6px 10px', 'border-radius:6px', 'pointer-events:none'
        ].join(';');
        document.body.appendChild(clampStatusEl);

        function updateClampIndicator() {
            clampStatusEl.textContent = 'Visual Limit: ' + (clampEnabled ? ('ON (' + clampRadius + 'px)') : 'OFF') + '  (R, scroll)';
            clampStatusEl.style.color = clampEnabled ? '#0f0' : '#f44';
        }
        updateClampIndicator();

        function clampToRadius(x, y) {
            if (!clampEnabled) return { x: x, y: y };
            const centerX = winWidth() / 2;
            const centerY = winHeight() / 2;
            const dx = x - centerX;
            const dy = y - centerY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist <= clampRadius || dist === 0) return { x: x, y: y };
            const factor = clampRadius / dist;
            return { x: centerX + dx * factor, y: centerY + dy * factor };
        }

        window.addEventListener('keydown', function (e) {
            const tag = (e.target && e.target.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            if (e.key === 'r' || e.key === 'R') {
                clampEnabled = !clampEnabled;
                saveClampState();
                updateClampIndicator();
                drawDirectionLine();
            } else if (e.key === '[') {
                clampRadius = Math.max(MIN_CLAMP_RADIUS, clampRadius - CLAMP_RADIUS_STEP);
                saveClampState();
                updateClampIndicator();
                drawDirectionLine();
            } else if (e.key === ']') {
                clampRadius = Math.min(MAX_CLAMP_RADIUS, clampRadius + CLAMP_RADIUS_STEP);
                saveClampState();
                updateClampIndicator();
                drawDirectionLine();
            }
        }, true);

        // Радиусът на кръга се управлява и със скрола на мишката.
        window.addEventListener('wheel', function (e) {
            // Игнорираме synthetic (untrusted) wheel events, напр. тези, които Zoom.js
            // пробва да прати към играта - иначе те погрешно местят радиуса тук.
            if (!e.isTrusted) return;

            const tag = (e.target && e.target.tagName) || '';
            if (tag === 'INPUT' || tag === 'TEXTAREA') return;

            const delta = e.deltaY > 0 ? -CLAMP_RADIUS_STEP : CLAMP_RADIUS_STEP;
            clampRadius = Math.min(MAX_CLAMP_RADIUS, Math.max(MIN_CLAMP_RADIUS, clampRadius + delta));
            saveClampState();
            updateClampIndicator();
            drawDirectionLine();
            e.preventDefault();
        }, { passive: false, capture: true });

        // Обновяване на интерполираното движение за оптимизирани завои
        setInterval(function () {
            if (isInterpolating && interpolationProgress < 1) {
                interpolationProgress += TURN_SPEED;

                // Линейна еазинг за незабавно реверсиране при промяна на посоката
                const easedFactor = Math.min(interpolationProgress, 1);

                prevMouseX = mouseX;
                prevMouseY = mouseY;

                mouseX = interpolationStartX + (targetMouseX - interpolationStartX) * easedFactor;
                mouseY = interpolationStartY + (targetMouseY - interpolationStartY) * easedFactor;

                // Актуализираме показалеца
                mousePointer.style.left = mouseX + 'px';
                mousePointer.style.top = mouseY + 'px';

                drawDirectionLine();
            } else if (interpolationProgress >= 1) {
                isInterpolating = false;
                // Постигаме целевата позиция
                mouseX = targetMouseX;
                mouseY = targetMouseY;
                drawDirectionLine();
            }
        }, 16);

        // Функция за рисуване на линията
        function drawDirectionLine() {
            // Изчищаме канаса
            dirCtx.clearRect(0, 0, directionCanvas.width, directionCanvas.height);

            // Центъра на екрана е позицията на главата на змията
            const centerX = winWidth() / 2;
            const centerY = winHeight() / 2;

            // Рисуваме линия от центъра до мишката
            dirCtx.strokeStyle = 'rgba(0, 255, 0, 0.35)';
            dirCtx.lineWidth = 3;
            dirCtx.beginPath();
            dirCtx.moveTo(centerX, centerY);
            dirCtx.lineTo(mouseX, mouseY);
            dirCtx.stroke();

            // Рисуваме кръг в центъра (главата на змията)
            dirCtx.fillStyle = 'rgba(0, 255, 0, 0.35)';
            dirCtx.beginPath();
            dirCtx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            dirCtx.fill();

            // Рисуваме границата на ограничението, ако е включено
            if (clampEnabled) {
                dirCtx.strokeStyle = 'rgba(255, 255, 0, 0.3)';
                dirCtx.lineWidth = 2;
                dirCtx.setLineDash([8, 6]);
                dirCtx.beginPath();
                dirCtx.arc(centerX, centerY, clampRadius, 0, Math.PI * 2);
                dirCtx.stroke();
                dirCtx.setLineDash([]);
            }
        }

        // Проследяваме движението на мишката
        document.addEventListener('mousemove', function (e) {
            // Ограничаваме целевата позиция в кръг около центъра, ако е включено
            const clamped = clampToRadius(e.clientX, e.clientY);
            targetMouseX = clamped.x;
            targetMouseY = clamped.y;

            // Започваме интерполацията за оптимизирани завои
            interpolationStartX = mouseX;
            interpolationStartY = mouseY;
            interpolationProgress = 0;
            isInterpolating = true;

            // Актуализираме показалеца незабавно
            mousePointer.style.left = targetMouseX + 'px';
            mousePointer.style.top = targetMouseY + 'px';

            // Рисуваме линията
            drawDirectionLine();
        }, { passive: true });

        // Скриваме линията когато мишката напуска прозореца
        document.addEventListener('mouseleave', function () {
            mousePointer.style.display = 'none';
            dirCtx.clearRect(0, 0, directionCanvas.width, directionCanvas.height);
        });

        // Показваме линията когато мишката е върху прозореца
        document.addEventListener('mouseenter', function () {
            mousePointer.style.display = 'block';
        });
    }

    // Инициализираме скриптът когато DOM е готов
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initScript);
    } else {
        initScript();
    }
})();
