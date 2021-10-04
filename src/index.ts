import {LifeWidget} from './life_widget.js';
let body = <HTMLBodyElement>document.getElementsByTagName("body")[0];
let lifeWidget = new LifeWidget();
body.appendChild(lifeWidget.createHtml());
lifeWidget.draw();