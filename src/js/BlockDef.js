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
            interval: 500
        },
		directionImpl = {
			'+x': {
				axis: 0,
				sign: 1,
				current_direction: {
					x: 1,
					z: 0
				},
				left: '-z',
				right: '+z',
				forward: '+x'
			},
			'-x': {
				axis: 0,
				sign: -1,
				current_direction: {
					x: -1,
					z: 0
				},
				left: '+z',
				right: '-z',
				forward: '-x'
			},
			'+z': {
				axis: 1,
				sign: 1,
				current_direction: {
					x: 0,
					z: 1
				},
				left: '+x',
				right: '-x',
				forward: '+z'
			},
			'-z': {
				axis: 1,
				sign: -1,
				current_direction: {
					x: 0,
					z: -1
				},
				left: '-x',
				right: '+x',
				forward: '-z'
			},
			get: function(current_direction) {
				switch (current_direction.x) {
					case 1:
						return '+x';
					case -1:
						return '-x';
				}
				switch (current_direction.z) {
					case 1:
						return '+z';
					case -1:
						return '-z';
				}
			}
		};

    function createBlock(settings, callback) {
        var def = jQuery.extend(true, {}, defaultDef, settings);
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
            ),
            dTable = ['x', 'z'],
            lTable = {
                x: 'width',
                z: 'depth'
            };
        mesh.position.x = this.data.position.x;
        mesh.position.y = def.maxy;
        mesh.position.z = this.data.position.z;
        mesh.receiveShadow = true;
        mesh.castShadow = true;
		var dir = directionImpl[directionImpl[this.direction][def.direction]];
        mesh.position[dTable[dir.axis]] += (dir.sign) * (def[lTable[dTable[dir.axis]]] + def.gap);
        scene.add(mesh);
        return (this[def.direction] = {
            width: def.width,
            height: def.height,
            depth: def.depth,
            forward: undefined,
            left: undefined,
            right: undefined,
			direction: dir.forward,
            create: createBlock,
            animate: animate,
            destroy: function() {
                this.animate.call(this, this.interval, { opacity: 0, y: def.miny },function() {
                    scene.remove(this.data);
                });
            },
			goodMove: function(dir) {
				if (this.forward && directionImpl[this.direction].forward === dir) {
					return this.forward;
				}
				if (this.left && directionImpl[this.direction].left === dir) {
					return this.left;
				}
				if (this.right && directionImpl[this.direction].right === dir) {
					return this.right;
				}
				return undefined;
			},
			upon: upon,
            nextDirection: nextDirection,
            data: mesh,
            interval: def.interval
        }).animate(def.interval, { opacity: 1, y: def.hovery }, callback);
    }

	function animate(time, dest, callback) {
		var data = {
				y: this.data.position.y,
				opacity: this.data.material.opacity
			},
			tween = new TWEEN.Tween(data).to(dest, time),
			_this = this;
		tween.onUpdate(function() {
			_this.data.position.y = data.y;
			_this.data.material.opacity = data.opacity;
		});
		tween.onComplete(function() {
			if (callback !== undefined) {
				callback.call(_this);
			}
		});
		tween.start();
		return this;
	}

    function upon(position) {
        return (Math.abs(position.x - this.data.position.x) <= this.width / 1.9) && (Math.abs(position.z - this.data.position.z) <= this.depth / 1.9);
    }

    function init(pos) {
        pos = jQuery.extend(true, {
            x: 0,
            y: 0,
            z: 0
        }, pos);
        return {
            create: createBlock,
            data: {
                position: {
                    x: pos.x,
                    y: pos.y,
                    z: pos.z
                }
            },
			direction: '+x'
        };
    }

    function createPlatform(pos, callback) {
        var geom = new THREE.CubeGeometry(16, 1, 16, 4, 1, 4);
        geom.mergeVertices();
        var mat = new THREE.MeshPhongMaterial({
            color: Colors.brown,
            shading: THREE.FlatShading,
            transparent: true,
            opacity: 0
        });
        var mesh = new THREE.Mesh(geom, mat);
        mesh.receiveShadow = true;
        pos = jQuery.extend(true, {
            x: 0,
            y: defaultDef.miny,
            z: 0
        }, pos);
        mesh.position.x = pos.x;
        mesh.position.y = pos.y;
        mesh.position.z = pos.z;
        var verts = geom.vertices;
        var l = verts.length;
        for (var i = 0; i < l; i++) {
            var v = verts[i];
            vprops = {
                y: v.y,
                x: v.x,
                z: v.z,
                ang: Math.random() * Math.PI * 2,
                amp: Math.random() * 1
            };
            v.x = vprops.x + Math.cos(vprops.ang) * vprops.amp;
            v.y = vprops.y + Math.sin(vprops.ang) * vprops.amp;
        }
        scene.add(mesh);
        return {
            data: mesh,
            interval: 1000,
			direction: '+x',
            forward: undefined,
            create: function(settings, callback) {
                this.forward = init({
                    x: mesh.position.x + 8 - (defaultDef.width / 2),
                    z: mesh.position.z + 8 - (defaultDef.height / 2)
                }).create(settings, callback);
            },
            animate: animate,
            destroy: function() {
				this.animate(1000, { opacity: 0, y: defaultDef.miny }, function() {
					scene.remove(this.data);
				});
            },
			goodMove: function(dir, pos) {
				if (pos.x > mesh.position.x + 8 + defaultDef.width || pos.x < mesh.position.x + 8 - defaultDef.width || pos.z > mesh.position.z + 8 || pos.z < mesh.position.z + 8 - defaultDef.height) {
					return undefined;
				}
				return this.forward;
			},
			upon: upon,
            nextDirection: nextDirection,
			width: 16,
			depth: 16
        }.animate(1000, { opacity: 1, y: defaultDef.hovery }, callback);
    }

    function loadMap(json) {
        var len = json.length,
            index = 0,
            callback = function() {
                this.create(json[++index], callback);
                if (index === len - 1) {
                    index = 0;
                }
            };
        return createPlatform({}, function() {
            this.create(json[index], callback);
        });
    }

    function nextDirection() {
        if (this.left !== undefined) {
            return directionImpl[this.direction].left;
        }
        if (this.right !== undefined) {
            return directionImpl[this.direction].right;
        }
        if (this.forward === undefined) {
            return directionImpl[this.direction].right;
        }
        return this.forward.nextDirection();
    }

    return {
        load: loadMap,
        direction: directionImpl,
        default: defaultDef,
    };
};
