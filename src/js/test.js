//COLORS
var Colors = {
    red:0xf25346,
    white:0xd8d0d1,
    brown:0x59332e,
    brownDark:0x23190f,
    pink:0xF5986E,
    yellow:0xf4ce93,
    blue:0x68c3c0,
    purple:0x996699
  }

////////////////////////////////////////////////////////////////////////

// GAME VARIABLES
var game = {};

function resetGame(){
  game = {
    distance_for_hero_speed: 0.1,
    hero_height: 5,
    current_direction: {x: 1, z: 0},
    current_pos: {x: 0, z: 0},
    paused: false,
    interval: 30,

    camera_position: {x: -20, y: 30, z: -20},
    camera_distance: {x: -20, y: 20, z: -20}
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

  scene.fog = new THREE.Fog(Colors.blue, 100,950);
   camera.position.x = game.camera_position.x;
   camera.position.y = game.camera_position.y;
   camera.position.z = game.camera_position.z;

   camera.lookAt(new THREE.Vector3(
     game.current_pos.x,
     game.current_pos.y,
     game.current_pos.z));

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

// MOUSE, KEY AND SCREEN EVENTS
function handleKeyPress(event) {
  if (event.keyCode == 37) {updateToLeft(); console.log("left");}
  if (event.keyCode == 39) {updateToRight(); console.log("right");}
  if (event.keyCode == 32) {
    if (!game.paused) {
      clearInterval(intervalId);
      game.paused = true;
    }
    else  {
      intervalId = setInterval(loop, game.interval);
      game.paused = false;
    }
  }
}

////////////////////////////////////////////////////////////////////////

// LIGHTS

var ambientLight, hemisphereLight, shadowLight;

function createLights() {

  hemisphereLight = new THREE.HemisphereLight(0xffffff,0x000000, .8)

  ambientLight = new THREE.AmbientLight(0xdc8874, .5);

  directLight = new THREE.DirectionalLight(0xaaaaaa, .1);
  directLight.position.set(0, 10, 0);

  shadowLight = new THREE.SpotLight(0xaaaaaa, .6);
  shadowLight.target = hero;
  shadowLight.castShadow = true;
  shadowLight.position.set(0, 20, 0);
  // shadowLight.shadow.camera.left = -400;
  // shadowLight.shadow.camera.right = 400;
  // shadowLight.shadow.camera.top = 400;
  // shadowLight.shadow.camera.bottom = -400;
  // shadowLight.shadow.camera.near = 1;
  // shadowLight.shadow.camera.far = 1000;
  // shadowLight.shadow.mapSize.width = 4096;
  // shadowLight.shadow.mapSize.height = 4096;

  var ch = new THREE.CameraHelper(shadowLight.shadow.camera);

  //scene.add(ch);
  scene.add(hemisphereLight);
  scene.add(shadowLight);
  scene.add(directLight);
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
  this.mesh.castShadow = true;
  var geom = new THREE.CubeGeometry(20, 20, 20);
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.white,
    opacity: .85,
    transparent: true
  });

  //*
  var nBlocs = 5+Math.floor(Math.random()*3);
  for (var i=0; i<nBlocs; i++ ){
    var m = new THREE.Mesh(geom.clone(), mat);
    m.position.x = i*5 + Math.random()*2;
    m.position.y = Math.random()*6;
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

Platform = function() {
  var geom = new THREE.CubeGeometry(8, 1, 8, 4, 1, 4);
  geom.mergeVertices();
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.brown,
    shading:THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;


  // get the vertices
  var verts = geom.vertices;
  var l = verts.length;
  console.log(l);
  this.vex = [];

   for (var i = 0; i < l; i++) {
    if (i < 20 || (i >=20 && i <24) || (i >=32 && i < 38) || (i >=47))
     continue;
    var v = verts[i];
    // store some data associated to it
    vprops = { y:v.y,
               x:v.x,
               z:v.z,
               // a random distance
               ampx: -.8 + Math.random() * 1.6,
               ampy: -1 + Math.random() * 1.5,
               ampz: -.8 + Math.random() *1.6
               // a random speed between 0.016 and 0.048 radians / frame
               //speed:0.016 + Math.random()*0.032
              };
    v.x = vprops.x + vprops.ampx;
    v.y = vprops.y + vprops.ampy;
    v.z = vprops.z + vprops.ampz;
  }

}

SpecialPlatform = function() {
  var geom = new THREE.CubeGeometry(8, 1, 8, 4, 1, 4);
  geom.mergeVertices();
  var mat = new THREE.MeshPhongMaterial({
    color:Colors.brown,
    shading:THREE.FlatShading
  });

  this.mesh = new THREE.Mesh(geom, mat);
  this.mesh.receiveShadow = true;


  // get the vertices
  var verts = geom.vertices;
  var l = verts.length;
  console.log(l);
  this.vex = [];

   for (var i = 0; i < l; i++) {
    if (i < 20 || (i >=20 && i <24) || (i >=32 && i < 38) || (i >=47))
     continue;
    var v = verts[i];
    // store some data associated to it
    vprops = { y:v.y,
               x:v.x,
               z:v.z,
               // a random distance
               ampx: -.8 + Math.random() * 1.6,
               ampy: -1 + Math.random() * 1.5,
               ampz: -.8 + Math.random() *1.6
               // a random speed between 0.016 and 0.048 radians / frame
               //speed:0.016 + Math.random()*0.032
              };
    //v.x = vprops.x + vprops.ampx;
    v.y = vprops.y + vprops.ampy;
    //v.z = vprops.z + vprops.ampz;
  }
  verts[22].y += 7 + Math.random();
  verts[29].y += 4 + Math.random();
}

////////////////////////////////////////////////////////////////////////

// CREATE 3D Models

function createHero(){
  hero = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1),
      new THREE.MeshPhongMaterial({
          color: Colors.red,
          shading:THREE.FlatShading
      })
  );
  hero.position.x = game.current_pos.x;
  hero.position.y = game.hero_height;
  hero.position.z = game.current_pos.z;
  hero.castShadow = true;
  hero.receiveShadow = true;
  scene.add(hero);
}

function createPlatform(){
  start = new SpecialPlatform();
  scene.add(start.mesh);
}

function createSky(){
  sky = new Sky();
  sky.mesh.position.y = -10;
  scene.add(sky.mesh);
}

function createCoins(){
}

////////////////////////////////////////////////////////////////////////

// ANIMATION

function loop(){
   updatePosition();
   updateCamera();
	TWEEN.update();
	renderer.render(scene, camera);
}

function updateToLeft(){
    if (game.current_direction.x != 0) {
      game.current_direction.z = game.current_direction.z - game.current_direction.x;
      game.current_direction.x = 0;
    }else {
      game.current_direction.x = game.current_direction.z - game.current_direction.x;
      game.current_direction.z = 0;
    }
}

function updateToRight() {
    if (game.current_direction.x != 0) {
    game.current_direction.z = game.current_direction.x - game.current_direction.z;
    game.current_direction.x = 0;
   } else {
    game.current_direction.x = game.current_direction.x - game.current_direction.z;
    game.current_direction.z = 0;
   }
}

function updatePosition(){
  game.current_pos.x += game.distance_for_hero_speed * game.current_direction.x;
  game.current_pos.z += game.distance_for_hero_speed * game.current_direction.z;
  hero.position.x = game.current_pos.x;
  hero.position.z = game.current_pos.z;
}

function updateCamera() {
  camera.position.x = game.current_pos.x + game.camera_distance.x;
  camera.position.y = game.hero_height + game.camera_distance.y;
  camera.position.z = game.current_pos.z + game.camera_distance.z;

   camera.lookAt(new THREE.Vector3(
     game.current_pos.x,
     game.current_pos.y,
     game.current_pos.z));

}

function updateHero(){

}


var fieldDistance, energyBar, replayMessage, fieldLevel, levelCircle;
var intervalId;

function _test() {
	var block = game.fn.initBlock();
	block = block.create({});
	block = block.create({});
	block = block.create({direction: 'left'});
	block = block.create({direction: 'right'});
	block = block.create({});
	setTimeout(function () {
		block.destroy();
	}, 5000);
}

////////////////////////////////////////////////////////////////////////

// Start and end



////////////////////////////////////////////////////////////////////////

// Init
function init(event){

  // UI
  resetGame();
  createScene();
  
  createSky();
  createHero();
  createLights();// must after hero
  createPlatform();
  _init_fn(game, scene);
 // _test();
  document.addEventListener('keydown', handleKeyPress);
 
  // var loader = new THREE.JSONLoader();
  // loader.load(
  //   '../ext/cube2.json', 
  //   function (geometry, materials) {
  //     var material = new THREE.MultiMaterial( materials );
  //     var object = new THREE.Mesh( geometry, material );
  //     scene.add( object );
  //   }
  // );

  loop();
  intervalId = setInterval(loop, game.interval);
}

window.addEventListener('load', init, false);
