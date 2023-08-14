function gridSet(x, y, value = 0) {
  grid[((x%gridSize) + gridSize) % gridSize][((y%gridSize) + gridSize) % gridSize] = value;
}

function gridGet(x, y) {
  return grid[((x%gridSize) + gridSize) % gridSize][((y%gridSize) + gridSize) % gridSize];
}

function mySign(x) {
  if (x >= 0) {
    return 1
  } else {
    return -1
  }
}

function myMod(n, x) {
  return ((n%x) +x)%x
}

function isInsideInterval(y, x1, x2) {
  return (x1 <= y && y <= x2) || (x2 <= y && y <= x1)
}

function isInsideRect(px, py, x, y, w, h) {
  return (isInsideInterval(px, x, x+w-mySign(w)) &&
  isInsideInterval(py, y, y+h-mySign(h)));
}

function makeCopyOfFlying(fly) {
  return {type: fly.type, x: fly.x, y : fly.y, friend:fly.friend, orient:fly.orient, crowned:fly.crowned}
}

function moveFlying(fly) {
    if (fly.orient == 0) {
        fly.x = (fly.x + 1) % gridSize;
    } else if (fly.orient == 1) {
        fly.y = (fly.y + 1) % gridSize;
    } else if (fly.orient == 2) {
        fly.x = (fly.x - 1 +gridSize) % gridSize;
    } else if (fly.orient == 3) {
        fly.y = (fly.y - 1 + gridSize) % gridSize;
    }
}


function deleteFlyingFromIndex(index) {
    var fly = flyingList[index]
    if (fly.friend != null) {
      flyingList[fly.friend].friend = null;
    }
    for (let i = 0; i < flyingList.length; i++) {
      if (flyingList[i].friend > index) {
        flyingList[i].friend -= 1;
      }
    }
    flyingList.splice(index, 1);
  
  }

  
function initializeGrids() {
    grid = [];
    grid2 = [];
    for (let i = 0; i < gridSize; i++) {
      grid.push([]);
      grid2.push([]);
      for (let j = 0; j < gridSize; j++) {
        grid[i].push(0);
        grid2[i].push(0);
      }
    }
  }

  
function moveWall(x, y, orient) {
    if (orient == 0) {
      if (grid[(x+1) %gridSize][y] == 27) {
        moveWall((x+1) %gridSize, y, orient);
      }
      grid[(x+1) %gridSize][y] = 27;
      grid[x][y] = 0;
    }
    if (orient == 1) {
      if (grid[x][(y+1) % gridSize] == 27) {
        moveWall(x, (y+1) % gridSize, orient);
      }
      grid[x][(y+1) %gridSize] = 27;
      grid[x][y] = 0;
    }
    if (orient == 2) {
      if (grid[(x-1+gridSize) %gridSize][y] == 27) {
        moveWall((x-1+gridSize) %gridSize, y, orient);
      }
      grid[(x-1+gridSize) %gridSize][y] = 27;
      grid[x][y] = 0;
    }
    if (orient == 3) {
      if (grid[x][(y-1+gridSize) %gridSize] == 27) {
        moveWall(x, (y-1+gridSize) %gridSize, orient);
      }
      grid[x][(y-1+gridSize) %gridSize] = 27;
      grid[x][y] = 0;
    }
  }

  
function getSelectedBlockType() {
    return blockTypeList[menuIconBlockTypes[hotbarSelector]];
  }
  
  function getBlockTypeIndexFromGridValue(val) {
    var ret = -1;
    for (let i = 0; i < blockTypeList.length; i++) {
      if (baseGridValues[i] <= val) {
        ret +=1;
      }
    }
    return ret;
  }
  
  
function clearGrid(log = true) {
    initializeGrids();
    flyingList = [];
    if (log) {
      hotbarSelector = 0;
      addActionToHistory({type:"macro", name:"clearGrid"});
    }
  } 


function switchPause() {
    paused = !paused;
    blockTypeList[11].atlasIndex = 14 - blockTypeList[11].atlasIndex;
}
  
  
function moveCrownedFlies(orient) {
    for (let i = 0; i < flyingList.length; i++) {
      if (flyingList[i].crowned) {
        flyingList[i].orient = orient;
        moveFlying(flyingList[i]);
      }
    }
}



function clearCell(indexX, indexY) {
    grid[indexX][indexY] = 0;
    for (let i = 0; i < flyingList.length; i++) {
      if (indexX == flyingList[i].x && indexY == flyingList[i].y) {
        deleteFlyingFromIndex(i);
      }
    }
  }