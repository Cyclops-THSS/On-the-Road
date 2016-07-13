var map = "fflrlrlfffrlrlrffsfflffrfflfrf";
function toJson(map) {
	var d = [];
	for (var i = 0; i < map.length; i++) {
		switch (map[i]) {
			case 'f':
				d.push({});
				break;
			case 'l':
				d.push({direction: 'left'});
				break;
			case 'r':
				d.push({direction: 'right'});
				break;
			case 's':
				d.push({platform: 'special'});
				break;
		}
	}
	require('fs').writeFile('./src/js/map.json', JSON.stringify(d), 'utf8');
}
toJson(map);
