function clickListener(event) {
  pressedkeys[event.which] = true;
  var canX = event.x-canvas.offsetLeft;
  var canY = event.y-canvas.offsetTop;
  var indexX = Math.floor(gridSize*canX/canvas.width);
  var indexY = gridSize-1-Math.floor(gridSize*canY/canvas.height*aspectRatio);
  addActionToHistory({type:"click", x:indexX, y:indexY, which:event.which});

  if (indexY>=0) {
    if (event.which == 1) {
      handleGridLeftClick(indexX, indexY);
    } else if (event.which == 3) {
      clearCell(indexX, indexY);
    }
  } else {
    handleHotbarClick(indexX);
  }
}

function handleGridLeftClick(indexX, indexY){
  var selectedIcon = getSelectedBlockType();
  selecting = false;
  if (isPasting) {
    pasteFromClipboard(indexX, indexY);
    isPasting = false;
    return;
  }
  if (selectedIcon.name != "link") {
    linkedDrone = false;
    linkedDroneId = null;
    linkedRobot = false;
    linkedRobotId = null;
  }
  if (selectedIcon.flyType != null) {
    flyingList.push({x:indexX, y:indexY, orient:0, type:selectedIcon.flyType, friend:null, crowned : false});
  } else if (selectedIcon.name == "crownMenu") {
    var highestFlyIndex = -1;
    for (let i = 0; i < flyingList.length; i++) {
      if (flyingList[i].x == indexX && flyingList[i].y == indexY && flyingList[i].type != "crown") {
        highestFlyIndex = i;
      }
    }
    if (highestFlyIndex != -1) {
      var targetFly = flyingList[highestFlyIndex]
      targetFly.crowned = !targetFly.crowned;
    }
  } else if (!selectedIcon.param) {
    var cur = baseGridValues[menuIconBlockTypes[hotbarSelector]];
    if (grid[indexX][indexY] >=  cur && grid[indexX][indexY] < cur+selectedIcon.incrMod-1) {
      gridSet(indexX, indexY, ((grid[indexX][indexY]-cur+1) % selectedIcon.incrMod)+cur);
    } else if (grid[indexX][indexY] == cur+selectedIcon.incrMod-1) {
      gridSet(indexX, indexY);
    } else {
      gridSet(indexX, indexY, cur);
    }
  } else if (selectedIcon.name == "selectMenu") {
    selectedStartPointX = indexX;
    selectedStartPointY = indexY;
  } else if (selectedIcon.name == "link") {
    for (let i = 0; i < flyingList.length; i++) {
      if (indexX == flyingList[i].x && indexY == flyingList[i].y) {
        if (flyingList[i].type == "robot") {
          if (linkedDrone) {
            if (flyingList[i].friend != null) {
              flyingList[flyingList[i].friend].friend = null;
            }
            flyingList[i].friend = linkedDroneId;
            flyingList[linkedDroneId].friend = i;
            linkedDrone = false;
          } else {
            linkedRobot = true;
            linkedRobotId = i;
          }  
        } else if (flyingList[i].type == "drone") {
          if (linkedRobot) {
            if (flyingList[i].friend != null) {
              flyingList[flyingList[i].friend].friend = null;
            }
            flyingList[i].friend = linkedRobotId;
            flyingList[linkedRobotId].friend = i;
            linkedRobot = false;
          } else {
            linkedDrone = true;
            linkedDroneId = i;
          }
        }
      }
    }
  }
}
function handleGridRightClick(indexX, indexY){
  var selectedIcon = getSelectedBlockType();
}
function handleHotbarClick(indexX) {
  if (blockTypeList[menuIconBlockTypes[indexX]].name == "pause") {
    switchPause();
  } else {
    isPasting = false;
    hotbarSelector = indexX;
  }
}  
function clickUpListener(event) {
  pressedkeys[event.which] = false;
  var canX = event.x-canvas.offsetLeft;
  var canY = event.y-canvas.offsetTop;
  var indexX = Math.floor(gridSize*canX/canvas.width);
  var indexY = gridSize-1-Math.floor(gridSize*canY/canvas.height*aspectRatio);
  if (selecting) {
    addActionToHistory({type:"macro", name:"select", x:selectedStartPointX, y:selectedStartPointY, w:indexX-selectedStartPointX, h:indexY-selectedStartPointY})
  }
}

function dragListener(event) {
  var canX = event.x-canvas.offsetLeft;
  var canY = event.y-canvas.offsetTop;
  var indexX = Math.floor(gridSize*canX/canvas.width);
  var indexY = gridSize-1-Math.floor(gridSize*canY/canvas.height*aspectRatio);
  mouseX = indexX;
  mouseY = indexY;
  if (indexY>=0) {
    if (pressedkeys[3] == true) {
      clearCell(indexX, indexY);
    }
  }
  if (getSelectedBlockType().name == "selectMenu" && pressedkeys[1] == true && mouseY >=0) {
    selecting = true;
    selectedWidth = indexX-selectedStartPointX;
    selectedHeight = indexY-selectedStartPointY;
  }
}
