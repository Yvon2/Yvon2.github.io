


function saveToLocal() {
    localStorage["grid"] = JSON.stringify(grid);
    localStorage["flyingList"] = JSON.stringify(flyingList);
    localStorage["hotbarSelector"] = hotbarSelector;

    localStorage["gridHistory"] = JSON.stringify(gridHistory);
    localStorage["gridHistoryOffset"] = gridHistoryOffset;
    localStorage["gridHistoryActionCount"] = gridHistoryActionCount;
    
    localStorage["clipBoardFlyingList"] = JSON.stringify(clipBoardFlyingList);
    localStorage["clipBoardGrid"] = JSON.stringify(clipBoardGrid);
    localStorage["clipBoardGridWidth"] = clipBoardGridWidth;
    localStorage["clipBoardGridHeight"] = clipBoardGridHeight;
}

function loadFromLocal(alsoLoadHistory = true) {
    if (localStorage["grid"] != null) {
      selecting = false;
      isPasting = false;
      grid = JSON.parse(localStorage["grid"]);
      flyingList = JSON.parse(localStorage["flyingList"]);
      hotbarSelector = JSON.parse(localStorage["hotbarSelector"]);
      
      if (alsoLoadHistory) {
        gridHistory = JSON.parse(localStorage["gridHistory"]);
        gridHistoryOffset = JSON.parse(localStorage["gridHistoryOffset"]);
        gridHistoryActionCount = JSON.parse(localStorage["gridHistoryActionCount"]);
      }
      clipBoardFlyingList = JSON.parse(localStorage["clipBoardFlyingList"]);
      clipBoardGrid = JSON.parse(localStorage["clipBoardGrid"]);
      clipBoardGridWidth = JSON.parse(localStorage["clipBoardGridWidth"]);
      clipBoardGridHeight = JSON.parse(localStorage["clipBoardGridHeight"]);
    }
}

function copyToClipboard(indexX, indexY, width, height, log=true) {
    clipBoardGridWidth = width + Math.sign(2*width+1);
    clipBoardGridHeight = height+ Math.sign(2*height+1);
    clipBoardGrid = [];
    for (let i = 0; Math.abs(i - clipBoardGridWidth) > 0; i+= Math.sign(2*width+1)) {
      clipBoardGrid.push([]);
      for (let j = 0; Math.abs(j - clipBoardGridHeight) > 0; j+= Math.sign(2*height+1)) {
        clipBoardGrid[Math.abs(i)].push(grid[i+indexX][j+indexY]);
      }
    }
    clipBoardFlyingList = [];
    for (let i = 0; i < flyingList.length; i++) {
      if (isInsideRect(flyingList[i].x, flyingList[i].y, indexX, indexY, clipBoardGridWidth, clipBoardGridHeight)) {
        clipBoardFlyingList.push(makeCopyOfFlying(flyingList[i]));
        clipBoardFlyingList[clipBoardFlyingList.length-1].x -= indexX-gridSize;
        clipBoardFlyingList[clipBoardFlyingList.length-1].y -= indexY-gridSize;
        clipBoardFlyingList[clipBoardFlyingList.length-1].friend = null;
      }
    }
    
  if (log) {
    addActionToHistory({type:"macro", name:"copy"})
  }
}

function pasteFromClipboard(x, y, log = true) {
    for (let i = 0; Math.abs(i - clipBoardGridWidth) > 0; i+= Math.sign(clipBoardGridWidth)) {
      for (let j = 0; Math.abs(j - clipBoardGridHeight) > 0; j+= Math.sign(clipBoardGridHeight)) {
        if (clipBoardGrid[Math.abs(i)][Math.abs(j)] != 0) {
            gridSet(i+x, j+y, clipBoardGrid[Math.abs(i)][Math.abs(j)]);
        }
      }
    }
    for (let i = 0; i<clipBoardFlyingList.length; i++) {
      flyingList.push(makeCopyOfFlying(clipBoardFlyingList[i]));
      flyingList[flyingList.length-1].x = myMod(flyingList[flyingList.length-1].x+x, gridSize);
      flyingList[flyingList.length-1].y = myMod(flyingList[flyingList.length-1].y+y, gridSize);
    }
  if (log && false) {
    addActionToHistory({type:"macro", name:"paste", x:x, y:y})
  }
}

function deleteSelected(log = true) {
  var realWidth  = selectedWidth + Math.sign(2*selectedWidth+1);
  var realHeight  = selectedHeight + Math.sign(2*selectedHeight+1);
  for (let i = 0; Math.abs(i - realWidth) > 0; i+= Math.sign(2*realWidth+1)) {
    for (let j = 0; Math.abs(j - realHeight) > 0; j+= Math.sign(2*realHeight+1)) {
      gridSet(i+selectedStartPointX, j+selectedStartPointY);
    }
  }
  selecting = false;
  if (log) {
    addActionToHistory({type:"macro", name:"deleteSelected"})
  }
}