var Colors = {
        red: 0xf25346,
        white: 0xd8d0d1,
        brown: 0x59332e,
        brownDark: 0x23190f,
        pink: 0xF5986E,
        yellow: 0xf4ce93,
        blue: 0x68c3c0
    },

    statusDef = {
        running: 0,
        paused: 1,
        over: 2,
        dying: 3,
        entry: 4
    },
    defaultGame = {
        distance_for_hero_speed: 0.2,
        hero_height: 10,
        current_direction: {
            x: 1,
            z: 0
        },
        current_pos: {
            x: 0,
            z: 0
        },
        status: statusDef.entry,
        interval: 30,
        camera_position: {
            x: -20,
            y: 10,
            z: -20
        },
        camera_distance: {
            x: -20,
            y: 20,
            z: -20
        },
        drop: true,
        drop_delta: 0,
        ticks: 0,
        score: 0,
        resources: 0
    },
    game, scene, camera, fieldOfView, aspectRatio,
    renderer, container,
    intervalId, hero, currentBlock, bgminstance,
    HEIGHT, WIDTH, fn,
    Objects = {
        Sky: function() {
            this.mesh = new THREE.Object3D();
            this.nClouds = 80;
            this.clouds = [];
            for (var i = 0; i < this.nClouds; i++) {
                var c = new Objects.Cloud();
                this.clouds.push(c);
                c.mesh.position.y = 20 + Math.random() * 10;
                c.mesh.position.x = -60 + Math.random() * 180;
                c.mesh.position.z = -50 + Math.random() * 180;
                var s = 0.05 + Math.random() * 0.05;
                c.mesh.scale.set(s, s, s);
                this.mesh.add(c.mesh);
            }
            this.mesh.position.y = -10;
        },
        Cloud: function() {
            this.mesh = new THREE.Object3D();
            this.mesh.name = "cloud";
            this.mesh.castShadow = true;
            var geom = new THREE.CubeGeometry(20, 20, 20);
            var mat = new THREE.MeshPhongMaterial({
                color: Colors.white,
                opacity: 0.85,
                transparent: true
            });
            var nBlocs = 5 + Math.floor(Math.random() * 3);
            for (var i = 0; i < nBlocs; i++) {
                var m = new THREE.Mesh(geom.clone(), mat);
                m.position.x = i * 5 + Math.random() * 2;
                m.position.y = Math.random() * 6;
                m.position.z = 18 - i * 5 + Math.random() * 2;
                m.rotation.x = Math.random() * Math.PI * 2;
                m.rotation.z = Math.random() * Math.PI * 2;
                m.rotation.y = Math.random() * Math.PI * 2;
                var s = i < nBlocs / 2 ? 0.2 + 0.4 * 2 * i / nBlocs : 0.2 + 0.4 * 2 * (nBlocs - i) / nBlocs;
                m.scale.set(s, s, s);
                this.mesh.add(m);
                m.castShadow = true;
                m.receiveShadow = true;
            }
        },
        Hero: function() {
            this.mesh = new THREE.Mesh(new THREE.CubeGeometry(1, 1, 1),
                new THREE.MeshPhongMaterial({
                    color: Colors.red,
                    shading: THREE.FlatShading
                })
            );
            var _this = this;
            this.mesh.position.x = game.current_pos.x;
            this.mesh.position.y = game.hero_height / 2 + fn.default.height / 2;
            this.mesh.position.z = game.current_pos.z;
            this.mesh.castShadow = true;
            this.mesh.receiveShadow = true;
            this.destroy = function(interval, callback) {
                _this.mesh.material.transparent = true;
                var dat = {
                        y: _this.mesh.position.y,
                        opacity: 1
                    },
                    dest = {
                        y: -10,
                        opacity: 0
                    },
                    tween = new TWEEN.Tween(dat).to(dest, interval),
                    __this = _this;
                tween.onUpdate(function() {
                    __this.mesh.position.y = dat.y;
                    __this.mesh.material.opacity = dat.opacity;
                });
                tween.onComplete(function() {
                    if (callback !== undefined) {
                        callback.call(__this);
                        scene.remove(__this.mesh);
                    }
                });
                tween.start();
            };
        }
    };

function resetGame() {
    game = jQuery.extend(true, {}, defaultGame);
}

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
    scene.fog = new THREE.Fog(Colors.blue, 100, 950);
    camera.position.x = game.camera_position.x;
    camera.position.y = game.camera_position.y;
    camera.position.z = game.camera_position.z;
    camera.lookAt(new THREE.Vector3(0, 1, 0));
    scene.add(camera);
    renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true
    });
    renderer.setSize(WIDTH, HEIGHT);
    renderer.setClearColor(Colors.blue);
    renderer.shadowMap.enabled = true;
    container = document.getElementById('world');
    container.appendChild(renderer.domElement);
}

function handleKeyPress(event) {
    var table = {
        SPACE: 32,
        ESC: 27
    };
    if (event.keyCode === table.ESC) {
        if (game.status !== statusDef.paused) {
            clearInterval(intervalId);
            game.status = statusDef.paused;
            bgminstance.setPaused(true);
        } else {
            intervalId = setInterval(loop, game.interval);
            game.status = statusDef.running;
            bgminstance.setPaused(false);
        }
    }
    if (game.status == statusDef.running && event.keyCode === table.SPACE) {
        updateDirection();
    } else if (game.status === statusDef.entry && game.resources === 3) {
        initializeGame();
    } else if (game.status === statusDef.over) {
        window.location.reload();
    }
}

function createLights() {
    var ambientLight, hemisphereLight, shadowLight;
    hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.9);
    ambientLight = new THREE.AmbientLight(0xdc8874, 0.5);
    directLight = new THREE.DirectionalLight(0xaaaaaa, 0.2);
    directLight.position.set(0, 10, 0);
    shadowLight = new THREE.SpotLight(0xaaaaaa, 0.6);
    shadowLight.target = hero.mesh;
    shadowLight.castShadow = true;
    shadowLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);
    scene.add(shadowLight);
    scene.add(directLight);
    scene.add(ambientLight);
}

function createObject(objName) {
    var ref = new Objects[objName]();
    scene.add(ref.mesh);
    return ref;
}

function loop() {
    if (game.status == statusDef.entry) {
        if (game.drop === true) {
            if (hero.mesh.position.y <= 1) {
                game.drop = false;
                game.drop_delta = 0;
            } else {
                game.drop_delta++;
                hero.mesh.position.y -= 50 * (2 * game.drop_delta - 1) * 0.0009;
            }
        }
        if (game.drop === false) {
            if (0.9 - 50 * (2 * game.drop_delta - 1) * 0.0009 <= 0) {
                game.drop = true;
                game.drop_delta = 0;
            }
            game.drop_delta++;
            hero.mesh.position.y += 0.9 - 50 * (2 * game.drop_delta - 1) * 0.0009;
        }
    } else {
        ++game.ticks;
        if (game.ticks % 500 === 0 && game.distance_for_hero_speed < 0.35) {
            game.distance_for_hero_speed += 0.01;
            game.ticks = 0;
        }
        updatePosition();
        updateCamera();
    }
    TWEEN.update();
    renderer.render(scene, camera);
}

function updateDirection() {
    game.current_direction = game.current_direction === fn.direction[currentBlock.direction].current_direction ? fn.direction[currentBlock.nextDirection()].current_direction : fn.direction[currentBlock.direction].current_direction;
}

function updatePosition() {
    if (game.status !== statusDef.running) {
        return;
    }
    game.current_pos.x += game.distance_for_hero_speed * game.current_direction.x;
    game.current_pos.z += game.distance_for_hero_speed * game.current_direction.z;
    hero.mesh.position.x = game.current_pos.x;
    hero.mesh.position.z = game.current_pos.z;
    if (!currentBlock.upon(hero.mesh.position)) {
        var next = currentBlock.goodMove(fn.direction.get(game.current_direction), hero.mesh.position);
        if (next === undefined) {
            hero.destroy(1000, function() {
                clearInterval(intervalId);
                game.status = statusDef.over;
                $('#title').fadeIn(600);
                $('#replay').fadeIn(600);
                $('#total_score')[0].innerHTML = 'Your total score is ' + game.score.toString();
                $('#total_score').fadeIn(600);
            });
            game.status = statusDef.dying;
            createjs.Sound.stop();
            createjs.Sound.play('drop');
        }
        currentBlock.destroy();
        currentBlock = next;
        ++game.score;
    }
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

function initializeGame() {
    game.status = statusDef.running;
    game.current_pos.x = -currentBlock.width / 2;
    bgminstance = createjs.Sound.play('bgm', {
        loop: -1
    });
    game.hero_height = 1;
    currentBlock.destroy(1);
    currentBlock = loadMap();
    camera.lookAt(new THREE.Vector3(
        game.current_pos.x,
        game.hero_height,
        game.current_pos.z));
    var data = {
            camera_y: game.camera_position.y,
            hero_y: hero.mesh.position.y
        },
        dest = {
            camera_y: game.camera_distance.y + game.hero_height,
            hero_y: game.hero_height
        },
        tween = new TWEEN.Tween(data).to(dest, 1000);
    tween.onUpdate(function() {
        camera.position.y = data.camera_y;
        hero.mesh.position.y = data.hero_y;
        camera.lookAt(new THREE.Vector3(0, 1, 0));
    });
    tween.start();
    $('#title').fadeOut(600);
    $('#tutorial').fadeOut(600);
}

function loadMap() {
    return fn.load(game.maps);
}

function init(event) {
    $.getJSON('./src/assets/map.json', function(data) {
        game.maps = data;
        ++game.resources;
    });
    createjs.Sound.registerSound('./src/assets/bgm.mp3', 'bgm');
    createjs.Sound.registerSound('./src/assets/drop.wav', 'drop');
    createjs.Sound.on('fileload', function() {
        ++game.resources;
    });
    resetGame();
    createScene();
    fn = _init_fn(game, scene);
    createObject('Sky');
    hero = createObject('Hero');
    createLights(); // must after hero
    document.addEventListener('keydown', handleKeyPress, false);
    currentBlock = fn.createPlatform();
    intervalId = setInterval(loop, game.interval);
}

window.addEventListener('load', init, false);
