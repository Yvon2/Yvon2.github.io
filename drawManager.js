const basicVertexArray = [[0, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0],
                         [0, 1, 1, 1, 0, 0, 1, 1, 1, 0, 0, 0], 
                         [1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 1],
                         [1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 1], ];

function getTexCoordsFromIndexes(i, j, orient = 1) {
  var ret = [];
  for (let k = 0; k < 6; k++) {
    ret.push((basicVertexArray[orient][2*k]+i)/atlasWidth, (basicVertexArray[orient][2*k+1]+j)/atlasHeight);
  }
  return ret;
}

function drawSetup() {
  canvas = document.querySelector("#canvas");
  gl = canvas.getContext("webgl2", {
    alpha: true,
    premultipliedAlpha: false,
  });
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  var program = createProgramFromSources(gl, [vertexShaderSource, fragmentShaderSource]);
  var positionAttributeLocation = gl.getAttribLocation(program, "a_position");
  var texcoordAttributeLocation = gl.getAttribLocation(program, "a_texcoord");

  
  var vao = gl.createVertexArray();
  gl.bindVertexArray(vao);
  gl.enableVertexAttribArray(positionAttributeLocation);

  positionBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    
  texcoordBuffer = gl.createBuffer();
  
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  
  gl.enableVertexAttribArray(texcoordAttributeLocation);
  gl.vertexAttribPointer(texcoordAttributeLocation, 2, gl.FLOAT, true, 0, 0);
  
  var texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.activeTexture(gl.TEXTURE0 + 0);
  
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0, 0, 255, 255]));
  var image = new Image();
  
  
  image.src = "fleur.png";
  image.addEventListener('load', function() {
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  });

  

  gl.useProgram(program);
  gl.bindVertexArray(vao);
  gl.clearColor(0.9, 0.9, 0.9, 1.0);


}

function drawBlock(posList, texList, xCoord, yCoord, texId, orient=0, width=1, height=1, menu = false) {
  if (menu){
    for (let k = 0; k < 6; k++) {
      posList.push(xCoord*0.1-1. + basicVertexArray[0][2*k]*0.1*width);
      posList.push((yCoord*0.1)/aspectRatio-1.+0.1 + basicVertexArray[0][2*k+1]*0.1/aspectRatio*height);
    }
    texList.push(...getTexCoordsFromIndexes(texId %atlasWidth, Math.floor(texId/atlasWidth), orient));
  
  } else {
    for (let k = 0; k < 6; k++) {
      posList.push(((xCoord%gridSize+gridSize)%gridSize)*0.1-1. + basicVertexArray[0][2*k]*0.1*width);
      posList.push((((yCoord%gridSize+gridSize)%gridSize)*0.1)/aspectRatio-1.+0.1 + basicVertexArray[0][2*k+1]*0.1/aspectRatio*height);
    }
    texList.push(...getTexCoordsFromIndexes(texId %atlasWidth, Math.floor(texId/atlasWidth), orient));
  }
}

//ne fonctionne pas :(
function glDraw(count) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
  gl.bindBuffer(gl.ARRAY_BUFFER, texcoordBuffer);
  gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(texPositions),gl.STATIC_DRAW);
  gl.drawArrays(gl.TRIANGLES, 0, count);
}