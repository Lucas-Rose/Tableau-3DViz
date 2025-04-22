//IMPORTING THREE JS ESSENTIALS
import * as THREE from 'https://cdn.skypack.dev/three@0.132.2';
import { OrbitControls } from "https://cdn.skypack.dev/three@0.132.2/examples/jsm/controls/OrbitControls.js"
let scene = new THREE.Scene();
let lastUpdate = Date.now();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
const blueMaterial = new THREE.LineBasicMaterial({ color: "#4996B2" });
const redMaterial = new THREE.LineBasicMaterial({ color: "#EB4454" });
const greenMaterial = new THREE.LineBasicMaterial({ color: "#00B180" });
const marksMaterial = new THREE.LineBasicMaterial({ color: "#367E9C" });
const lineMaterial = new THREE.LineBasicMaterial({ color: "#666666" });
const size = 5;
const markSize = 0.1;
renderer.render(scene, camera);
controls.target = new THREE.Vector3(size, size /2, size)
controls.autoRotate = true;


//INIT CAMERA
camera.position.set(-size * 2, 5, size/2);
controls.rotateSpeed /= 2
controls.update();

// Wrap everything in an anonymous function to avoid polluting the global namespace
(function () {
  $(document).ready(function () {
    tableau.extensions.initializeAsync().then(function () {
      const worksheet = tableau.extensions.worksheetContent.worksheet;
      redraw();
      worksheet.addEventListener(tableau.TableauEventType.SummaryDataChanged, function (event) {
        redraw();
      });
      window.onresize = function (event) {
        init()
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
      };
      function redraw() {
        worksheet.getSummaryDataAsync().then((result) => {
          RecreateScene(result)
        })
      }
      function RecreateScene(result) {
        scene = new THREE.Scene();
        scene.background = new THREE.Color("#FAFAFA");
        drawAxis()
        drawMarks(result)
      }

      function drawAxis() {
        drawLine(blueMaterial, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, size * 2))
        drawLine(greenMaterial, new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, size * 2, 0))
        drawLine(redMaterial, new THREE.Vector3(0, 0, 0), new THREE.Vector3(size * 2, 0, 0))
        for(let i = 0; i <= size * 2; i += 1){
          drawLine(lineMaterial, new THREE.Vector3(0, 0, i), new THREE.Vector3(size * 2, 0, i))
        }
        for(let i = 0; i <= size * 2; i += 1){
          drawLine(lineMaterial, new THREE.Vector3(i, 0, 0), new THREE.Vector3(i, 0, size * 2))
        }
      }

      function drawLine(material, start, end){
        let points = []
        points.push(start)
        points.push(end)
        let geometry = new THREE.BufferGeometry().setFromPoints(points);
        let line = new THREE.Line(geometry, material);
        scene.add(line);
      }

      function drawMarks(result) {
        console.log(result)
        let columnMinMax = getMinMaxColumnValues(result)
        let dimensions = getDimensions(result)
        let geometry = null
        let mark = null
        let xPos = 0;
        let yPos = 0;
        let zPos = 0;
        for (let i = 0; i < result.data.length; i++) {
          for (let j = 0; j < result.columns.length; j++) {
            if (result.columns[j].index == dimensions.length) {
              xPos = (result.data[i][j].value / columnMinMax[j][2]) * size
            }
            if (result.columns[j].index == dimensions.length + 1) {
              yPos = (result.data[i][j].value / columnMinMax[j][2]) * size
            }
            if (result.columns[j].index == dimensions.length + 2) {
              zPos = (result.data[i][j].value / columnMinMax[j][2]) * size
            }
          }
          geometry = new THREE.SphereGeometry(markSize, 16, 8);
          mark = new THREE.Mesh(geometry, marksMaterial);
          mark.position.x = xPos;
          mark.position.y = yPos;
          mark.position.z = zPos;
          scene.add(mark);
        }
      }
      function getMinMaxColumnValues(result) {
        let ret = []
        for (let i = 0; i < result.columns.length; i++) {
          let maxValue = null;
          let minValue = null;
          for (let j = 0; j < result.data.length; j++) {
            if (maxValue == null && minValue == null) {
              maxValue = result.data[j][i].value
              minValue = result.data[j][i].value
            }
            if (result.data[j][i].value > maxValue) {
              maxValue = result.data[j][i].value
            }
            if (result.data[j][i].value < minValue) {
              minValue = result.data[j][i].value
            }
          }
          let pair = []
          pair.push(maxValue)
          pair.push(minValue)
          pair.push(Math.max(Math.abs(maxValue), Math.abs(minValue)))
          ret.push(pair)
        }
        return ret;
      }
      function getDimensions(result) {
        let ret = []
        for (let i = 0; i < result.columns.length; i++) {
          if (result.columns[i].dataType == 'string') {
            ret.push(result.columns[i])
          }
        }
        return ret;
      }








      //CORE THREE JS FUNCTIONS
      function init() {
        renderer.setSize(window.innerWidth, window.innerHeight);
        let env = document.body.appendChild(renderer.domElement);
        env.class = "canvas"
      }
      function render() {
        renderer.render(scene, camera);
      }
      function animate() {
        let now = Date.now();
        let dt = now - lastUpdate;
        lastUpdate = now;
        controls.update(dt);
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
        requestAnimationFrame(render);
      }
      init()
      animate()
    }, function (err) {
      // Something went wrong in initialization
      console.log('Error while Initializing: ' + err.toString());
    });
  });
})();
