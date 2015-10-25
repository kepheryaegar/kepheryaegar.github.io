var game,
    map,
    layer,
    marker,
    cursors,
    fifo_queue = [],
    can_click = true,
    app = {
        preload: function preload() {
            game.load.tilemap('map', 'assets/tilemaps/maps/tile_properties.json', null, Phaser.Tilemap.TILED_JSON);
            game.load.image('tiles', 'assets/tilemaps/tiles/gridtiles.png');
        },
        create: function create() {

            game.physics.startSystem(Phaser.Physics.ARCADE);
            map = game.add.tilemap('map');
            map.addTilesetImage('tiles');
            layer = map.createLayer('Tile Layer 1');
            layer.resizeWorld();

            //  Our painting marker
            marker = game.add.graphics();
            marker.lineStyle(2, 0xFE4747, 1);
            marker.drawRect(0, 0, 32, 32);

            game.input.addMoveCallback(app.updateMarker, this);
            game.input.onDown.add(app.getTileProperties, this);
            cursors = game.input.keyboard.createCursorKeys();
        },
        getTileProperties: function getTileProperties() {
            var i;
            var x = layer.getTileX(game.input.activePointer.worldX);
            var y = layer.getTileY(game.input.activePointer.worldY);
            var tile = map.getTile(x, y, layer);
            var TARGET_DUMMY_INDEX = 10;

            if (tile === null || !can_click) {
                // when user click at dark spot
                return;
            }
            if (tile.index === TARGET_DUMMY_INDEX) {
                return;
            }

            // tile.properties.wibble = true;
            app.puTile(tile, TARGET_DUMMY_INDEX);
            app.floodfill(x, y, TARGET_DUMMY_INDEX, 1, 'ready ...go');
            app.reset_private_index_in_queue();

            if (fifo_queue.length > 2) {
                for (i = 0; i < fifo_queue.length; i++) {
                    setTimeout(app.deque, 125 * i);
                }
            } else {
                fifo_queue = [];
            }
        },
        reset_private_index_in_queue: function() {
            /* reset __index to either undefined or original state / index */
            for (var i = 0; i < fifo_queue.length; i++) {
                var coordxy = fifo_queue[i];
                _tile = map.getTile(coordxy.x, coordxy.y, layer);
                // _tile.__index = coordxy.original_index;
                _tile.__index = undefined;
            }
        },
        puTile: function(tile, type) {
            /* manually set private __index, 
            native tile.index already had native setter for it automatically */
            // tile.index = type;
            map.putTile(type, tile.x, tile.y, layer);
            tile.__index = type;
        },
        mergeTiles: function(x, y) {
            /* reset private __index after the tile has vanished */

            // update tile to blank
            tile = map.getTile(x, y, layer);
            tile.__index = undefined;
            map.putTile(1, x, y, layer);
        },
        deque: function deque() {
            /* not allow user click when animating */
            can_click = false;
            var coordxy = fifo_queue.pop();
            console.log(coordxy.status);
            app.mergeTiles(coordxy.x, coordxy.y);
            if (fifo_queue.length === 0) {
                can_click = true;
            }
        },
        floodfill: function floodfill(x, y, target_tile_index, replacement_tile_index, status) {
            var selected_tile = map.getTile(x, y, layer);
            if (selected_tile.__index === undefined) {
                selected_tile.__index = selected_tile.index;
            }
            console.log(selected_tile.__index, selected_tile.index, target_tile_index, status)
            if (selected_tile.__index !== target_tile_index ||
                target_tile_index === replacement_tile_index) {
                return;
            }
            if (fifo_queue.length > 0 && x === fifo_queue[0][0] && y === fifo_queue[0][1]) {
                return;
            }
            selected_tile.__index = replacement_tile_index;
            fifo_queue.push({
                x: x,
                y: y,
                status: status,
                original_index: selected_tile.index
            });
            app.floodfill(x + 1, y, target_tile_index, replacement_tile_index, 'go right');
            app.floodfill(x - 1, y, target_tile_index, replacement_tile_index, 'go left');
            app.floodfill(x, y + 1, target_tile_index, replacement_tile_index, 'go bottom');
            app.floodfill(x, y - 1, target_tile_index, replacement_tile_index, 'go top');
        },
        updateMarker: function updateMarker() {
            marker.x = layer.getTileX(game.input.activePointer.worldX) * 32;
            marker.y = layer.getTileY(game.input.activePointer.worldY) * 32;
            if (game.input.mousePointer.isDown) {}
        },
        update: function update() {},
        render: function render() {},
    };

game = new Phaser.Game(800, 600, Phaser.WEBGL, 'Triple Town Merge', app);
