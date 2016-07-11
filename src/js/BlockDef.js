var _init_fn = function(game, scene, undefined) {
    var defaultPalette = [
            0xeff3ff,
            0xc6dbef,
            0x9ecae1,
            0x6baed6,
            0x4292c6
        ],
        defaultDef = {
            width: 2,
            height: 1,
            depth: 2,
            materialType: 'MeshLambertMaterial',
            materialPara: {
                opacity: 0,
                transparent: true
            },
            direction: 'forward',
            palette: defaultPalette,
            gap: 0.15,
            maxy: 8,
            miny: -8,
            hovery: 0,
			interval: 750
        },
        hasOwnProperty = {}.hasOwnProperty,
        slice = [].slice,
        toString = {}.toString,
        isObject = function(o) {
            return toString.call(o) === '[object Object]';
        },
        isArray = Array.isArray || function(a) {
            return toString.call(a) === '[object Array]';
        };

    function each(obj, callback) {
        if (isArray(obj)) {
            if (typeof obj.length !== 'number' || obj.length < 0) {
                return obj;
            }
            for (var i = 0; i < obj.length; i++) {
                if (callback.call(obj[i], i, obj[i]) === false) {
                    break;
                }
            }
        } else if (isObject(obj)) {
            for (var p in obj) {
                if (hasOwnProperty.call(obj, p)) {
                    if (callback.call(obj[p], p, obj[p]) === false) {
                        break;
                    }
                }
            }
        }
        return obj;
    }

    function extend(target) {
        var sources = slice.call(arguments, 1);
        each(sources, function() {
            each(this, function(key, val) {
                target[key] = val;
            });
        });
        return target;
    }

    function createBlock(settings) {
        var def = JSON.parse(JSON.stringify(defaultDef));
        extend(def, settings);
        if (def.materialPara.color === undefined) {
            def.materialPara.color = def.palette[Math.floor(Math.random() * def.palette.length)];
        }
        var mesh = new THREE.Mesh(new THREE.CubeGeometry(
                def.width,
                def.height,
                def.depth
            ),
            new THREE[def.materialType](
                def.materialPara
            )
        );

        var dTable = ['x', 'z'],
            lTable = {
                x: 'width',
                z: 'depth'
            };
        mesh.position.x = this.data.position.x;
        mesh.position.y = def.maxy;
        mesh.position.z = this.data.position.z;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        var newAxis, newSign;
        switch (def.direction) {
            case 'forward':
                newAxis = this.axis;
                newSign = this.sign;
                break;
            case 'right':
                newAxis = this.axis === 0 ? 1 : 0;
                newSign = this.axis === 0 ? this.sign : -1 * this.sign;
                break;
            case 'left':
                newAxis = this.axis === 0 ? 1 : 0;
                newSign = this.axis === 0 ? -1 * this.sign : this.sign;
                break;
        }
        mesh.position[dTable[newAxis]] += (newSign) * (defaultDef[lTable[dTable[newAxis]]] + def.gap);
        scene.add(mesh);
        return (this[def.direction] = {
            forward: {},
            left: {},
            right: {},
            create: createBlock,
            animate: animate,
			destroy: destroyBlock,
            data: mesh,
            axis: newAxis,
            sign: newSign,
            miny: def.miny,
            maxy: def.maxy,
            hovery: def.hovery,
			interval: def.interval
        }).animate(def.interval);
    }

    function animate(time, callback) {
        var data = {
                y: this.data.position.y,
                opacity: this.data.material.opacity
            },
            dest = (data.y === this.hovery) ? {
				y: this.miny,
				opacity: 0.0
			} : {
                y: this.hovery,
                opacity: 1.0
            },
            tween = new TWEEN.Tween(data).to(dest, time),
			_this = this;
        tween.onUpdate(function() {
            _this.data.position.y = data.y;
            _this.data.material.opacity = data.opacity;
        });
        tween.onComplete(function() {
			if (callback !== undefined) {
				callback();
			}
        });
        tween.start();
		return this;
    }

    function destroyBlock() {
		animate.call(this, this.interval, function() {
			scene.remove(this.data);
		});
    }

    function init() {
        return {
            forward: {},
            left: {},
            right: {},
            create: createBlock,
            data: {
                position: {
                    x: -(defaultDef.width / 2),
                    y: 0,
                    z: 0
                }
            },
            axis: 0,
            sign: 1
        }.create({});
    }
    return (game.fn = {
        initBlock: init
    });
};
