import { LifeWidget } from './life_widget.js';
let body = document.getElementsByTagName("body")[0];
let lifeWidget = new LifeWidget(100, 100, 4);
body.appendChild(lifeWidget.createHtml());
lifeWidget.draw();
const updateRate = 5.0;
let lastUpdate;
function draw(timestamp) {
    if (lastUpdate === undefined)
        lastUpdate = timestamp;
    const elapsed = timestamp - lastUpdate;
    if ((elapsed / 1000.0) >= (1.0 / updateRate)) {
        lifeWidget.stepAndRedraw();
        lastUpdate = timestamp;
    }
    window.requestAnimationFrame(draw);
}
window.requestAnimationFrame(draw);
