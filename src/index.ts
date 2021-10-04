import {LifeWidget} from './life_widget.js';
let body = <HTMLBodyElement>document.getElementsByTagName("body")[0];
let lifeWidget = new LifeWidget(100, 100, 4);
body.appendChild(lifeWidget.createHtml());
lifeWidget.draw();