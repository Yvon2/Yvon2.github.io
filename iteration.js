
function gridInteractions() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          grid2[i][j] = grid[i][j];
        }
      }
}
function copyToMainGrid() {
    for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          grid[i][j] = grid2[i][j];
        }
    }
}

function addIterToHistory() {
  if (gridHistory.length > 0) {
    if (gridHistory[gridHistory.length-1].type == "iter") {
      gridHistory[gridHistory.length-1].count += 1;
    } else {
      gridHistory.push({type:"iter", count:1});
    }
  } else {
    gridHistory.push({type:"iter", count:1});
  }
  gridHistoryActionCount += 1;
}

function iterateGrid(log = true) {
  if (log) {
    addIterToHistory();
  }
    iterationCount++;
    //iteration de grid vers grid2
    gridInteractions();

    for (let i=0; i< flyingList.length; i++) {
      var gridValueUnder = grid[flyingList[i].x][flyingList[i].y];
      var nameUnder = blockTypeList[getBlockTypeIndexFromGridValue(gridValueUnder)].name;
      var orientUnder = grid[flyingList[i].x][flyingList[i].y] - baseGridValues[getBlockTypeIndexFromGridValue(gridValueUnder)];
      
      if (flyingList[i].type == "robot") {
        if (nameUnder == "arrow") {
          flyingList[i].orient = orientUnder;
        } else if (nameUnder == "droneArrow") {
          var fly = flyingList[i].friend;
          if (fly != null) {
            flyingList[fly].orient = orientUnder;
            moveFlying(flyingList[fly]);
          }
        } else if (nameUnder == "if0Arrow") {
          var fly = flyingList[i].friend;
          if (fly != null) {
            if (grid[flyingList[fly].x][flyingList[fly].y] == 1) {
              flyingList[i].orient = orientUnder
            }
          }
        } else if (nameUnder == "if1Arrow") {
          var fly = flyingList[i].friend;
          if (fly != null) {
            if (grid[flyingList[fly].x][flyingList[fly].y] == 2) {
              flyingList[i].orient = orientUnder;
            }
          }
        } else if (nameUnder == "place1Command") {
          var fly = flyingList[i].friend;
          if (fly != null) {
            grid2[flyingList[fly].x][flyingList[fly].y] = 2;
          }
        } else if (nameUnder == "place0Command") {
          var fly = flyingList[i].friend;
          if (fly != null) {
            grid2[flyingList[fly].x][flyingList[fly].y] = 1;
          }
        } else if (nameUnder == "deleteCommand") {
          var fly = flyingList[i].friend;
          if (fly != null) {
            grid2[flyingList[fly].x][flyingList[fly].y] = 0;
          }
        }
      }
    }
    //copie de grid2 vers grid
  
    copyToMainGrid();
  
    for (let i = 0; i < flyingList.length; i++) {
      if (flyingList[i].type == "robot") {
        moveFlying(flyingList[i]);
        var gridValueUnder = grid[flyingList[i].x][flyingList[i].y];
        var nameUnder = blockTypeList[getBlockTypeIndexFromGridValue(gridValueUnder)].name;
        if (nameUnder == "wall") {
          flyingList[i].orient = (flyingList[i].orient+2) % 4
          moveFlying(flyingList[i]);
        }
      } else if (flyingList[i].type == "drone") {
        var gridValueUnder = grid[flyingList[i].x][flyingList[i].y];
        var nameUnder = blockTypeList[getBlockTypeIndexFromGridValue(gridValueUnder)].name;
        if (nameUnder == "wall") {
          moveWall(flyingList[i].x, flyingList[i].y, flyingList[i].orient);
        }
      }
    }
  }
  