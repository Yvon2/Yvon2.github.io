
function handleKeyPressed() {
    //handle key press frequency
    if (pressedkeys["Space"]) {
      iterateGrid();
    }
    if (pressedkeys["KeyP"]) {
      lockKeyPresses = true;
      switchPause();
    }
    if (pressedkeys["ArrowUp"]) {
      moveCrownedFlies(1);
    }
    if (pressedkeys["ArrowDown"]) {
      moveCrownedFlies(3);
    }
    if (pressedkeys["ArrowLeft"]) {
      moveCrownedFlies(2);
    }
    if (pressedkeys["ArrowRight"]) {
      moveCrownedFlies(0);
    }
    if (pressedkeys["KeyC"] && (pressedkeys["ControlLeft"] || pressedkeys["ControlRight"])) {
      lockKeyPresses = true;
      if (selecting) {
        copyToClipboard(selectedStartPointX, selectedStartPointY, selectedWidth, selectedHeight);
      }
    }
    if (pressedkeys["KeyV"] && (pressedkeys["ControlLeft"] || pressedkeys["ControlRight"])) {
      lockKeyPresses = true;
      isPasting = true;
      addActionToHistory({type:"macro", name:"paste"})
    }
    if (pressedkeys["KeyX"] && (pressedkeys["ControlLeft"] || pressedkeys["ControlRight"])) {
      lockKeyPresses = true;
      if (selecting) {
        copyToClipboard(selectedStartPointX, selectedStartPointY, selectedWidth, selectedHeight);
        deleteSelected();
      }
    }
    if (pressedkeys["Delete"]) {
      lockKeyPresses = true;
      deleteSelected();
    }
    if (pressedkeys["KeyW"] && (pressedkeys["ControlLeft"] || pressedkeys["ControlRight"])) {
      var howManyTimes = 1;
      if (pressedkeys["ShiftLeft"] || pressedkeys["ShiftRight"]) {
        howManyTimes = 10
      }
      lockKeyPresses = true;
      for (let i = 0; i < howManyTimes; i++) {
        gridHistoryOffset -= 1;
        if (gridHistoryOffset + gridHistoryActionCount < 0) {
          gridHistoryOffset += 1;
        }
        loadGridHistory();
      }
    }
    
    if (pressedkeys["KeyY"] && (pressedkeys["ControlLeft"] || pressedkeys["ControlRight"])) {
      var howManyTimes = 1;
      if (pressedkeys["ShiftLeft"] || pressedkeys["ShiftRight"]) {
        howManyTimes = 10
      }
      lockKeyPresses = true;
      for (let i = 0; i < howManyTimes; i++) {
        gridHistoryOffset += 1;
        if (gridHistoryOffset > 0) {
          gridHistoryOffset -= 1;
        }
        loadGridHistory();
      }
    }
  }
  
  function keyUpListener(event) {
    lockKeyPresses = false;
    pressedkeys[event.code] = false;
  }
  
  
  function keyDownListener(event) {
    console.log(event.code);
      pressedkeys[event.code] = true;
  }
  
  