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
        dirDef = {
            CW: 0,
            CCW: 1
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
        mesh.position[dTable[newAxis]] += (newSign) * (def[lTable[dTable[newAxis]]] + def.gap);
        scene.add(mesh);
        return (this[def.direction] = {
            width: def.width,
            height: def.height,
            depth: def.depth,
            forward: undefined,
            left: undefined,
            right: undefined,
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
        }).animate(def.interval, callback);
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
                callback.call(_this);
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

    function upon(position) {
        return Math.abs(position.x - this.data.position.x) <= this.width / 2 && Math.abs(position.z - this.data.position.z) <= this.depth / 2;
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
            axis: 0,
            sign: 1
        };
    }

    function createPlatform(pos, callback) {
        var geom = new THREE.CubeGeometry(8, 1, 8, 4, 1, 4);
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
            miny: defaultDef.miny,
            hovery: defaultDef.hovery,
            axis: 0,
            sign: 1,
            create: function(settings, callback) {
                init({
                    x: mesh.position.x + 4 - (defaultDef.width / 2),
                    z: mesh.position.z + 4 - (defaultDef.height / 2)
                }).create(settings, callback);
            },
            animate: function(time, callback) {
                var data = {
                        y: this.data.position.y,
                        opacity: this.data.material.opacity
                    },
                    dest = {
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
                        callback.call(_this);
                    }
                });
                tween.start();
                return this;
            },
            destroy: function() {
                scene.remove(this.data);
            }
        }.animate(1000, callback);
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
            return dirDef.CCW;
        }
        if (this.right !== undefined) {
            return dirDef.CW;
        }
        return this.forward.nextDirection();
    }

    return {
        load: loadMap,
        direction: dirDef,
        default: defaultDef
    };
};
