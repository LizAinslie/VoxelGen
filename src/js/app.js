import Detector from './utils/detector';
import App from './app/index';

// Styles
import './../css/app.scss';

if(!Detector.webgl) Detector.addGetWebGLMessage();
else {
  const container = document.getElementById('appContainer');
  const app = new App(container);
  app.render();
}
