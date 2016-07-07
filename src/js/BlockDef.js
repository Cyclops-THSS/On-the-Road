var _init_fn = function(game, scene, undefined) {
    var defaultDef = {
        width: 2,
        height: 1,
        depth: 2,
        materialType: 'MeshLambertMaterial',
        materialPara: {},
        direction: 'forward'
    };

    function createBlock(def) {
        var mesh = new THREE.Mesh(new THREE.CubeGeometry(defaultDef.width, defaultDef.height, defaultDef.depth), new THREE[def.materialType || defaultDef.materialType](def.materialPara || defaultDef.materialPara));
        var dTable = ['x', 'z'],
            lTable = {
                x: 'width',
                z: 'depth'
            };
        mesh.position.x = this.data.position.x;
        mesh.position.y = this.data.position.y;
        mesh.position.z = this.data.position.z;
        var newAxis, newSign;
        switch (def.direction || defaultDef.direction) {
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
        mesh.position[dTable[newAxis]] += (newSign) * defaultDef[lTable[dTable[newAxis]]];
        scene.add(mesh);
        return (this[def.direction || defaultDef.direction] = {
            forward: {},
            left: {},
            right: {},
            createBlock: createBlock,
            data: mesh,
            axis: newAxis,
            sign: newSign
        });
    }

    function destroyBlock() {

    }

	function init() {
		return {
			forward: {},
            left: {},
            right: {},
            createBlock: createBlock,
            data: {
				position: {
					x: -(defaultDef.width / 2),
					y: 0,
					z: 0
				}
			},
            axis: 0,
            sign: 1
		}.createBlock({});
	}
    return (game.fn = {
        createBlock: createBlock,
        destroyBlock: destroyBlock,
		initBlock: init
    });
};
