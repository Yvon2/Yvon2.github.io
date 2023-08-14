"use strict";

var canvas;
var gl;
var positionBuffer;
var texcoordBuffer;

var atlasWidth = 8;
var atlasHeight = 8;
var aspectRatio = 21.0/20.0;
var gridSize = 20;

var gridHistory = [];
var gridHistoryOffset = 0;
var gridHistoryActionCount = 0;
var flyingList = [];
var grid = [];
var grid2 = [];
var lockKeyPresses = false;


var mouseX = 0;
var mouseY = 0;
var passedTime = 0.0;
var paused = true;
var Tps = 2.0;
var iterationCount = 0;

var hotbarSelector = 0;
var pressedkeys = {1:false, 3:    false};

var selectedStartPointX = null;
var selectedStartPointY = null;
var selecting= false;
var selectedWidth = null;
var selectedHeight = null;

var clipBoardFlyingList = [];
var clipBoardGrid = [];
var clipBoardGridWidth = 0;
var clipBoardGridHeight = 0;
var isPasting = false;

var linkedRobot = false;
var linkedRobotId = null;
var linkedDrone = false;
var linkedDroneId = null;


var blockTypeList = [{name:"void", atlasIndex : null, rotating : false, incrMod : 1, flyType : null, param : true, hasIco : false},
  {name:"bit", atlasIndex : 1, rotating : false, incrMod : 2, flyType : null, param : false, hasIco : true},
  {name:"robot", atlasIndex : 9, rotating : false, incrMod : 1, flyType : "robot", param : false, hasIco : true},
  {name:"drone", atlasIndex : 18, rotating : false, incrMod : 1, flyType : "drone", param : false, hasIco : true},
  {name:"link", atlasIndex : 26, rotating : false, incrMod : 1, flyType : null, param : true, hasIco : true},
  {name:"arrow", atlasIndex : 24, rotating : true, incrMod : 4, flyType : null, param : false, hasIco : true},
  {name:"droneArrow", atlasIndex : 16, rotating : true, incrMod : 4, flyType : null, param : false, hasIco : true},
  {name:"if0Arrow", atlasIndex : 17, rotating : true, incrMod : 4, flyType : null, param : false, hasIco : true},
  {name:"if1Arrow", atlasIndex : 8, rotating : true, incrMod : 4, flyType : null, param : false, hasIco : true},
  {name:"place0Command", atlasIndex : 10, rotating : false, incrMod : 1, flyType : null, param : false, hasIco : true},
  {name:"place1Command", atlasIndex : 0, rotating : false, incrMod : 1, flyType : null, param : false, hasIco : true},
  {name:"pause", atlasIndex : 11, rotating : false, incrMod : 1, flyType : null, param : true, hasIco : true},
  {name:"crownMenu", atlasIndex : 19, rotating : false, incrMod : 1, flyType : null, param : true, hasIco : true},
  {name:"deleteCommand", atlasIndex : 4, rotating : false, incrMod : 1, flyType : null, param : false, hasIco : true},
  {name:"wall", atlasIndex : 5, rotating : false, incrMod : 1, flyType : null, param : false, hasIco : true},
  {name:"select", atlasIndex : 6, rotating : false, incrMod : 1, flyType : null, param : false, hasIco : false},
  {name:"selectMenu", atlasIndex : 7, rotating : false, incrMod : 1, flyType : null, param : true, hasIco : true},
] 
var menuIconBlockTypes = [];
var baseGridValues = [0];

for (let i = 1; i < blockTypeList.length; i++) {
  var lastElem = baseGridValues[baseGridValues.length - 1];
  baseGridValues.push(lastElem + blockTypeList[i-1].incrMod);
  if (blockTypeList[i].hasIco) {
    menuIconBlockTypes.push(i);
  }
}

function main() {
  drawSetup();

  canvas.addEventListener('mousedown', clickListener, false);
  canvas.addEventListener('mouseup', clickUpListener, false);
  canvas.addEventListener('mousemove', dragListener, false);
  document.addEventListener('keydown', keyDownListener);
  document.addEventListener('keyup', keyUpListener);
  
  var then = 0;
  requestAnimationFrame(drawScene);
  var autoSave = 10; 
  var autoSavePassedTime = 0;
  
  function drawScene(now) {

    //Gérer le temps. passedTime = temps depuis dernière itération. now en secondes
    now *= 0.001;
    var deltaTime = now - then;

    
    autoSavePassedTime += deltaTime;
    if (autoSavePassedTime > autoSave) {
      //saveToLocal()
      autoSavePassedTime = 0;
    }
    if (!lockKeyPresses) {
      handleKeyPressed();
    }
    if (!paused) {
      passedTime += deltaTime;
      var maxTicks = 10;
      while (passedTime*Tps >= 1.0 && maxTicks > 0) {
        passedTime -= 1.0/Tps;
        maxTicks -= 1;
        iterateGrid();
      }
    }
    then = now;



    var gridCount = 0;
    var positions = [];
    var texPositions = [];

    for (let i = 0; i < gridSize; i++) {
      for (let j = 0; j < gridSize; j++) { 
        if (grid[i][j] >= 1) {
          gridCount += 1;
          var curBlockTypeId = getBlockTypeIndexFromGridValue(grid[i][j]);
          var curBlockType = blockTypeList[curBlockTypeId];
          if (curBlockType.rotating) {
            drawBlock(positions, texPositions, i, j, curBlockType.atlasIndex, grid[i][j]-baseGridValues[curBlockTypeId]);
          } else {
            drawBlock(positions, texPositions, i, j, curBlockType.atlasIndex + grid[i][j]- baseGridValues[curBlockTypeId]);
          }
        }
      } 
    }
    for (let i = 0; i < flyingList.length; i++) {
      var coords = flyingList[i];
      if (coords.type== "robot") {
        drawBlock(positions, texPositions, coords.x, coords.y, 9)
      } else if (coords.type== "drone") {
        drawBlock(positions, texPositions, coords.x, coords.y, 18)
      }
      if (coords.crowned) {
        gridCount+=1;
        drawBlock(positions, texPositions, coords.x, coords.y, 27)
      }
    }

    //dessiner les icones du menu
    var iconPos = 0;
    for (let i = 0; i < blockTypeList.length; i++) {
      if (blockTypeList[i].hasIco) {
        drawBlock(positions, texPositions, iconPos, -1, blockTypeList[i].atlasIndex, 0, 1, 1, true);
        iconPos++;
      }
    }

    drawBlock(positions, texPositions, hotbarSelector, -1, 25, 0, 1, 1, true);
    if (linkedDrone) {
      var lFly = flyingList[linkedDroneId]
      drawBlock(positions, texPositions, lFly.x, lFly.y, 25);
      gridCount++;
    }
    if (linkedRobot) {
      var lFly = flyingList[linkedRobotId]
      drawBlock(positions, texPositions, lFly.x, lFly.y, 25);
      gridCount++;
    }
    if (isPasting && mouseY >= 0) {
      for (let i = 0; Math.abs(i - clipBoardGridWidth) > 0; i+= Math.sign(2*clipBoardGridWidth+1)) {
        for (let j = 0; Math.abs(j - clipBoardGridHeight) > 0; j+= Math.sign(2*clipBoardGridHeight+1)) {
          if (clipBoardGrid[Math.abs(i)][Math.abs(j)] >= 1) {
            gridCount += 1;
            var curBlockTypeId = getBlockTypeIndexFromGridValue(clipBoardGrid[Math.abs(i)][Math.abs(j)]);
            var curBlockType = blockTypeList[curBlockTypeId];
            if (curBlockType.rotating) {
              drawBlock(positions, texPositions, i+mouseX, j+mouseY, curBlockType.atlasIndex, clipBoardGrid[Math.abs(i)][Math.abs(j)]-baseGridValues[curBlockTypeId]);
            } else {
              drawBlock(positions, texPositions, i+mouseX, j+mouseY, curBlockType.atlasIndex + clipBoardGrid[Math.abs(i)][Math.abs(j)]- baseGridValues[curBlockTypeId]);
            }
          }
        } 
      }
      for (let i = 0; i < clipBoardFlyingList.length; i++) {
        var coords = clipBoardFlyingList[i];
        if (coords.type== "robot") {
          gridCount += 1;
          drawBlock(positions, texPositions, coords.x+mouseX, coords.y+mouseY, 9)
        } else if (coords.type== "drone") {
          gridCount += 1;
          drawBlock(positions, texPositions, coords.x+mouseX, coords.y+mouseY, 18)
        }
        if (coords.crowned) {
          gridCount+=1;
          drawBlock(positions, texPositions, coords.x+mouseX, coords.y+mouseY, 27)
        }
      }
    }
    if (selecting) {
      var selectedWidthDraw = selectedWidth + mySign(selectedWidth);
      var selectedHeightDraw = selectedHeight + mySign(selectedHeight);
      var selectedXDraw = selectedStartPointX; 
      var selectedYDraw = selectedStartPointY;
      if (selectedWidth < 0) {
        selectedXDraw += selectedWidthDraw+1;
      }
      if (selectedHeight < 0) {
        selectedYDraw += selectedHeightDraw+1;
      }
      drawBlock(positions, texPositions, selectedXDraw, selectedYDraw, 6, 0, Math.abs(selectedWidthDraw), Math.abs(selectedHeightDraw));
      gridCount++;
    }
    
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(texPositions),gl.STATIC_DRAW);
    
    var count = (gridCount + flyingList.length+iconPos+1)* 6;
    gl.drawArrays(gl.TRIANGLES, 0, count);

    requestAnimationFrame(drawScene);
  }
}



initializeGrids();
loadFromLocal();
main();