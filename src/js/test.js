//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    brownDark:0x23190f,
    pink:0xF5986E,
    yellow:0xf4ce93,
    blue:0x68c3c0,

};

////////////////////////////////////////////////////////////////////////

// GAME VARIABLES
var game;

function resetGame(){
  game = {
  		//TODO
         };

}

////////////////////////////////////////////////////////////////////////

//THREEJS RELATED VARIABLES

var scene,
    camera, fieldOfView, aspectRatio, nearPlane, farPlane,
    renderer,
    container,
    controls;

//SCREEN & MOUSE VARIABLES

var HEIGHT, WIDTH,
    mousePos = { x: 0, y: 0 };

//INIT THREE JS, SCREEN AND MOUSE EVENTS

function createScene() {

  HEIGHT = window.innerHeight;
  WIDTH = window.innerWidth;

  scene = new THREE.Scene();
  aspectRatio = WIDTH / HEIGHT;
  fieldOfView = 50;

  camera = new THREE.PerspectiveCamera(
    fieldOfView,
    aspectRatio,
    1,
    100
    );
  
  //scene.fog = new THREE.Fog(0xf7d9aa, 100,950);
   camera.position.set(-20, 20, -20);
   camera.lookAt(new THREE.Vector3(0, 10, 0));

  scene.add(camera);

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(WIDTH, HEIGHT);
  renderer.setClearColor(Colors.blue); 

  renderer.shadowMap.enabled = true;
  
  container = document.getElementById('world');
  container.appendChild(renderer.domElement);

  /*
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.minPolarAngle = -Math.PI / 2;
  controls.maxPolarAngle = Math.PI ;

  //controls.noZoom = true;
  //controls.noPan = true;
  //*/
}

////////////////////////////////////////////////////////////////////////

// MOUSE AND SCREEN EVENTS

////////////////////////////////////////////////////////////////////////

// LIGHTS

var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xaaaaaa,0x000000, .9)

  ambientLight = new THREE.AmbientLight(0xdc8874, .5);

  shadowLight = new THREE.DirectionalLight(0xffffff, .9);
  shadowLight.position.set(150, 350, 350);
  shadowLight.castShadow = true;
  shadowLight.shadow.camera.left = -400;
  shadowLight.shadow.camera.right = 400;
  shadowLight.shadow.camera.top = 400;
  shadowLight.shadow.camera.bottom = -400;
  shadowLight.shadow.camera.near = 1;
  shadowLight.shadow.camera.far = 1000;
  shadowLight.shadow.mapSize.width = 4096;
  shadowLight.shadow.mapSize.height = 4096;

  var ch = new THREE.CameraHelper(shadowLight.shadow.camera);

  //scene.add(ch);
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(ambientLight);

}

////////////////////////////////////////////////////////////////////////

// OBJECTS

Sky = function(){
  this.mesh = new THREE.Object3D();
  this.nClouds = 10;
  this.clouds = [];
  
  for(var i=0; i<this.nClouds; i++){
    var c = new Cloud();
    this.clouds.push(c);

    c.mesh.position.y = 20+Math.random()*10;
    c.mesh.position.x = -10+Math.random()*45;
    c.mesh.position.z = -10+Math.random()*45;
    var s = .05+Math.random()*0.05;
    c.mesh.scale.set(s,s,s);
    //c.mesh.rotation.z = Math.random()*Math.PI/2;
    this.mesh.add(c.mesh);
  }
}

Cloud = function(){
  this.mesh = new THREE.Object3D();
  this.mesh.name = "cloud";
  var geom = new THREE.CubeGeometry(20, 20, 20);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.white,

  });

  //*
  var nBlocs = 5+Math.floor(Math.random()*3);
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(geom.clone(), mat);
    m.position.x = i*5 + Math.random()*2;
    m.position.y = Math.random()*8;
    m.position.z = 18 - i*5 + Math.random()*2;

    m.rotation.x = Math.random()*Math.PI*2;
    m.rotation.z = Math.random()*Math.PI*2;
    m.rotation.y = Math.random()*Math.PI*2;
    var s = i < nBlocs/2 ? .2 + .4*2*i/nBlocs : .2 + .4*2*(nBlocs - i)/nBlocs ;
    m.scale.set(s,s,s);
    this.mesh.add(m);
    m.castShadow = true;
    m.receiveShadow = true;

  }
  //*/
}

Path = function(){
  

}

Path.prototype.dissapear = function (){
  
}

////////////////////////////////////////////////////////////////////////

// CREATE 3D Models

function createHero(){
}

function createPath(){
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -10;
  scene.add(sky.mesh);
}

function createCoins(){
}


function createCube() {
	cube = new THREE.Mesh(new THREE.CubeGeometry(3, 3, 3),
        new THREE.MeshPhongMaterial({
            color: Colors.red
        })
	);
	console.log("cube");
	scene.add(cube); 
}

////////////////////////////////////////////////////////////////////////

// ANIMATION

function loop(){

	renderer.render(scene, camera);
	//requestAnimationFrame(loop);
}

function updateDistance(){
}


function updateHero(){


}

var fieldDistance, energyBar, replayMessage, fieldLevel, levelCircle;



////////////////////////////////////////////////////////////////////////

// Init
function init(event){

  // UI

  createScene();
  createLights();
  createSky();
  createCube();

  loop();
}

window.addEventListener('load', init, false);

