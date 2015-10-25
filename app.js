
var game = new Phaser.Game(800, 600, Phaser.AUTO, 'phaser-example', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.tilemap('map', 'assets/tilemaps/maps/tile_properties.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/tilemaps/tiles/gridtiles.png');

}

var map;
var layer;
var marker;
var cursors;
var queue = [];
var can_click = true;

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);

    map = game.add.tilemap('map');

    map.addTilesetImage('tiles');

    // map.setCollisionBetween(1, 12);

    layer = map.createLayer('Tile Layer 1');

    layer.resizeWorld();

    //  Our painting marker
    marker = game.add.graphics();
    marker.lineStyle(2, 0xFE4747, 1);
    marker.drawRect(0, 0, 32, 32);

    game.input.addMoveCallback(updateMarker, this);

    game.input.onDown.add(getTileProperties, this);

    cursors = game.input.keyboard.createCursorKeys();

}

function getTileProperties() {
    var x = layer.getTileX(game.input.activePointer.worldX);
    var y = layer.getTileY(game.input.activePointer.worldY);
    var tile = map.getTile(x, y, layer);
    if (tile === null || !can_click) {
        return;
    }
    tile.properties.wibble = true;
    floodfill(x, y, 1, 10);
    console.log(JSON.stringify(queue));
    // map.putTile(10, 1, 1, layer);

    for (var i = 0; i < queue.length ; i++) {
        setTimeout(function() {
            can_click = false;
            var coordxy = queue.shift();
            console.log(coordxy[2]);
            game.debug.text('' + coordxy[2], 16, 550);
            map.putTile(10, coordxy[0], coordxy[1], layer);
            if (queue.length === 0) {
                game.debug.text('Done', 700, 550);
                can_click = true;
            }
        }, 50 * i);
    }
}

function pause() {
    var $q = $.Deferred();
    setTimeout(function() {
        game.paused = false;
        $q.resolve();
    }, 300);
    return $q.promise();
}


function floodfill(x, y, target_index, replacement_index, status) {
    // console.log(x, y, target_index, replacement_index, status);
    if (map.getTile(x, y, layer).__index === undefined) {
        map.getTile(x, y, layer).__index = map.getTile(x, y, layer).index;
    }
    if (map.getTile(x, y, layer).__index !== target_index) {
        return;
    }
    if (target_index === replacement_index) {
        return;
    }
    // map.putTile(replacement_index, x, y, layer);
    map.getTile(x, y, layer).__index = replacement_index;
    queue.push([x, y, status]);
    floodfill(x+1, y, target_index, replacement_index, 'go right');
    floodfill(x-1, y, target_index, replacement_index, 'go left');
    floodfill(x, y+1, target_index, replacement_index, 'go bottom');
    floodfill(x, y-1, target_index, replacement_index, 'go top');
}

function updateMarker() {

    marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
    marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;

    if (game.input.mousePointer.isDown) {
        // map.putTile(44, layer.getTileX(marker.x), layer.getTileY(marker.y), layer);
        // console.log(layer.getTileX(marker.x), layer.getTileX(marker.y))
        // map.fill(currentTile, layer.getTileX(marker.x), layer.getTileY(marker.y), 4, 4, layer);
    }
}

function update() {

    if (cursors.left.isDown)
    {
        game.camera.x -= 4;
    }
    else if (cursors.right.isDown)
    {
        game.camera.x += 4;
    }

    if (cursors.up.isDown)
    {
        game.camera.y -= 4;
    }
    else if (cursors.down.isDown)
    {
        game.camera.y += 4;
    }

}

function render() {

    // game.debug.text('Current Layer: ' + layer.name, 16, 550);
    // game.debug.text('1-3 Switch Layers. SPACE = Show All. Cursors = Move Camera', 16, 570);

}
