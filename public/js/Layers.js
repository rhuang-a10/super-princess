export function createBackgroundLayer(level, sprites) {
  const tiles = level.tiles;
  const resolver = level.tileCollider.tiles;
  const buffer = document.createElement("canvas");
  buffer.width = 256 + 16;
  buffer.height = 240;

  const context = buffer.getContext("2d");
  let startIndex, endIndex;
  function redraw(drawFrom, drawTo) {
    // only redraw when you need to
    // if (drawFrom === startIndex && drawTo === endIndex) {
    //   return;
    // }

    startIndex = drawFrom;
    endIndex = drawTo;

    for (let x = startIndex; x <= endIndex; x++) {
      const col = tiles.grid[x];
      if (col) {
        col.forEach((tile, y) => {
          if (sprites.animations.has(tile.name)) {
            sprites.drawAnimation(
              tile.name,
              context,
              x - startIndex,
              y,
              level.totalTime
            );
          } else {
            sprites.drawTile(tile.name, context, x - startIndex, y);
          }
        });
      }
    }
  }

  return function drawBackgroundLayer(context, camera) {
    const drawWidth = resolver.toIndex(camera.size.x);
    const drawFrom = resolver.toIndex(camera.pos.x);
    const drawTo = drawFrom + drawWidth;
    redraw(drawFrom, drawTo); // redraw when moving left or right, row by row! thanks to modulo op
    context.drawImage(buffer, -camera.pos.x % 16, -camera.pos.y);
  };
}

export function createSpriteLayer(entities, width = 64, height = 64) {
  // temp buffer to draw on
  const spriteBuffer = document.createElement("canvas");
  spriteBuffer.width = width;
  spriteBuffer.height = height;

  const spriteBufferContext = spriteBuffer.getContext("2d");

  return function drawSpriteLayer(context, camera) {
    entities.forEach((entity) => {
      // clear previous rect
      spriteBufferContext.clearRect(0, 0, width, height);
      // draw onto temp buffer
      entity.draw(spriteBufferContext);
      // draw the sprite buffer onto our context
      context.drawImage(
        spriteBuffer,
        entity.pos.x - camera.pos.x,
        entity.pos.y - camera.pos.y
      );
    });
  };
}

// talk to tile resolver
export function createCollisionLayer(level) {
  const resolvedTiles = [];
  const tileResolver = level.tileCollider.tiles;
  const tileSize = tileResolver.tileSize;

  const getIndexByOriginal = tileResolver.getByIndex;
  // override
  tileResolver.getByIndex = function getByFake(x, y) {
    resolvedTiles.push({ x, y });
    return getIndexByOriginal.call(tileResolver, x, y);
  };

  return function drawCollision(context, camera) {
    context.strokeStyle = "blue";
    resolvedTiles.forEach(({ x, y }) => {
      context.beginPath();
      context.rect(
        x * tileSize - camera.pos.x,
        y * tileSize - camera.pos.y,
        tileSize,
        tileSize
      );
      context.stroke();
    });

    context.strokeStyle = "red";
    level.entities.forEach((entity) => {
      context.beginPath();
      context.rect(
        entity.pos.x - camera.pos.x,
        entity.pos.y - camera.pos.y,
        entity.size.x,
        entity.size.y
      );
      context.stroke();
    });

    resolvedTiles.length = 0;
  };
}

export function createCameraLayer(cameraToDraw) {
  //
  return function drawCameraRect(context, fromCamera) {
    context.strokeStyle = "purple";
    context.beginPath();
    context.rect(
      cameraToDraw.pos.x - fromCamera.pos.x,
      cameraToDraw.pos.y - fromCamera.pos.y,
      cameraToDraw.size.x,
      cameraToDraw.size.y
    );
    context.stroke();
  };
}
