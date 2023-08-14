
function addActionToHistory(action) {
  // on confond actioncount et history.length cela crée des erreurs
  

  for (let i = gridHistory.length+gridHistoryOffset; i < gridHistory.length; i++) {
    if (gridHistory[i].type == "iter") {
      gridHistoryActionCount -= gridHistory[i].count;
    } else {
      gridHistoryActionCount -= 1;
    }
  }
  gridHistory = gridHistory.slice(0, gridHistory.length+gridHistoryOffset)
  gridHistoryOffset = 0;
  gridHistory.push(action);
  gridHistoryActionCount++;
  console.log(gridHistory);
}
  
  function clearGridHistory() {
    gridHistory = [];
    gridHistoryOffset = 0;
    gridHistoryActionCount = 0;
  }
  
  function loadGridHistory() {
    loadFromLocal(false);
    var curHistIndex = 0;
    var curIterCount = 0;
    for (let i = 0; i < gridHistoryActionCount+gridHistoryOffset; i++) {
      if (gridHistory[curHistIndex].type == "iter") {
        iterateGrid(false);
        curIterCount += 1;
        if (gridHistory[curHistIndex].count == curIterCount) {
          curIterCount = 0;
          curHistIndex++;
        }
      } else if (gridHistory[curHistIndex].type == "click") {
        if (gridHistory[curHistIndex].y >= 0) {
          if (gridHistory[curHistIndex].which == 1) {
            handleGridLeftClick(gridHistory[curHistIndex].x, gridHistory[curHistIndex].y);
          } else if (gridHistory[curHistIndex].which == 3) {
            clearCell(gridHistory[curHistIndex].x, gridHistory[curHistIndex].y);
          }
        } else {
          handleHotbarClick(gridHistory[curHistIndex].x);
        }
        curHistIndex ++;
      } else if (gridHistory[curHistIndex].type == "macro") {
        if (gridHistory[curHistIndex].name == "clearGrid") {
          clearGrid(false);
        } else if (gridHistory[curHistIndex].name == "deleteSelected") {
          deleteSelected(false);
        } else if (gridHistory[curHistIndex].name == "copy") {
          copyToClipboard(selectedStartPointX, selectedStartPointY, selectedWidth, selectedHeight, false);
        } else if (gridHistory[curHistIndex].name == "select") {
          selectedWidth = gridHistory[curHistIndex].w;
          selectedHeight = gridHistory[curHistIndex].h;
          selectedStartPointX = gridHistory[curHistIndex].x;
          selectedStartPointY = gridHistory[curHistIndex].y;
          selecting = true;
        } else if (gridHistory[curHistIndex].name == "paste") {
          isPasting = true;
        } else {
          console.log("erreur : type de macro inconnu")
        }
        curHistIndex ++;
      } else {
        console.log("erreur : type d'action d'historique inconnu")
      }
    }
  }
  