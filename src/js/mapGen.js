var map = ["fflrlrlfffrlrlrffsfffflflrfrfrlfffrfflfrflfsffrlrlrlrffflfsf",
    "ffrlrlrfffrfflflffsffrlfflrfsff",
    "fffrffflrfflfsffrlrlfflrlrffsff",
    "ffrfffrfffrfffrlrlrffsffflrlrlrff",
    "ffrlrlrlrlfflrlrlrlrffrfffflffffsff"
];
var dd = [];

function toJson(map) {
    var d = [];
    for (var i = 0; i < map.length; i++) {
        switch (map[i]) {
            case 'f':
                d.push({});
                break;
            case 'l':
                d.push({
                    direction: 'left'
                });
                break;
            case 'r':
                d.push({
                    direction: 'right'
                });
                break;
            case 's':
                d.push({
                    platform: 'special'
                });
                break;
        }
    }
    dd.push(d);
}
for (var i = 0; i < map.length; i++) {
    toJson(map[i]);
}
require('fs').writeFile('./src/assets/map.json', JSON.stringify(dd), 'utf8');
