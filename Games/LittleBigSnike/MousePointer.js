// ==UserScript==
// @name         Mouse Pointer
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Показва курсор на мишката в играта LittleBigSnake
// @author       Bobby
// @match        https://littlebigsnake.com/*
// @grant        GM_addStyle
// @grant        unsafeWindow
// ==/UserScript==

(function () {
    function initScript() {
        // Добавяме CSS стил за курсора и канваса
        const cssStyle = `
            #mouse-pointer {
                position: fixed;
                width: 50px;
                height: 50px;
                border: 3px solid #ff0000;
                border-radius: 50%;
                background-color: rgba(255, 0, 0, 0.8);
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
        directionCanvas.width = window.innerWidth;
        directionCanvas.height = window.innerHeight;
        document.body.appendChild(directionCanvas);

        const dirCtx = directionCanvas.getContext('2d');
        let mouseX = window.innerWidth / 2;
        let mouseY = window.innerHeight / 2;
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
        let targetMouseX = window.innerWidth / 2;
        let targetMouseY = window.innerHeight / 2;
        let interpolationStartX = mouseX;
        let interpolationStartY = mouseY;

        // Преразмеряваме канаса при промяна на размера на прозореца
        window.addEventListener('resize', function () {
            directionCanvas.width = window.innerWidth;
            directionCanvas.height = window.innerHeight;
        });

        // Обновяване на интерполираното движение за оптимизирани завои
        setInterval(function () {
            if (isInterpolating && interpolationProgress < 1) {
                interpolationProgress += 0.4;

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
            const centerX = window.innerWidth / 2;
            const centerY = window.innerHeight / 2;

            // Рисуваме линия от центъра до мишката
            dirCtx.strokeStyle = '#00ff00';
            dirCtx.lineWidth = 3;
            dirCtx.beginPath();
            dirCtx.moveTo(centerX, centerY);
            dirCtx.lineTo(mouseX, mouseY);
            dirCtx.stroke();

            // Рисуваме кръг в центъра (главата на змията)
            dirCtx.fillStyle = '#00ff00';
            dirCtx.beginPath();
            dirCtx.arc(centerX, centerY, 10, 0, Math.PI * 2);
            dirCtx.fill();
        }

        // Проследяваме движението на мишката
        document.addEventListener('mousemove', function (e) {
            // Запазваме целевата позиция
            targetMouseX = e.clientX;
            targetMouseY = e.clientY;

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
