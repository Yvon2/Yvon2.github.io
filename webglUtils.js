function error(msg) {
    if (topWindow.console) {
      if (topWindow.console.error) {
        topWindow.console.error(msg);
      } else if (topWindow.console.log) {
        topWindow.console.log(msg);
      }
    }
  }
  function createProgram(
    gl, shaders, opt_attribs, opt_locations, opt_errorCallback) {
  const errFn = opt_errorCallback || error;
  const program = gl.createProgram();
  shaders.forEach(function(shader) {
    gl.attachShader(program, shader);
  });
  if (opt_attribs) {
    opt_attribs.forEach(function(attrib, ndx) {
      gl.bindAttribLocation(
          program,
          opt_locations ? opt_locations[ndx] : ndx,
          attrib);
    });
  }
  gl.linkProgram(program);

  // Check the link status
  const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
  if (!linked) {
      // something went wrong with the link
      const lastError = gl.getProgramInfoLog(program);
      errFn(`Error in program linking: ${lastError}\n${
        shaders.map(shader => {
          const src = addLineNumbersWithError(gl.getShaderSource(shader));
          const type = gl.getShaderParameter(shader, gl.SHADER_TYPE);
          return `${glEnumToString(gl, type)}:\n${src}`;
        }).join('\n')
      }`);

      gl.deleteProgram(program);
      return null;
  }
  return program;
}
const defaultShaderType = [
    "VERTEX_SHADER",
    "FRAGMENT_SHADER",
  ];
function loadShader(gl, shaderSource, shaderType, opt_errorCallback) {
    const errFn = opt_errorCallback || error;
    const shader = gl.createShader(shaderType);
    gl.shaderSource(shader, shaderSource);
    gl.compileShader(shader);
    const compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (!compiled) {
      const lastError = gl.getShaderInfoLog(shader);
      errFn(`Error compiling shader: ${lastError}\n${addLineNumbersWithError(shaderSource, lastError)}`);
      gl.deleteShader(shader);
      return null;
    }

    return shader;
  }
function createProgramFromSources(
    gl, shaderSources, opt_attribs, opt_locations, opt_errorCallback) {
  const shaders = [];
  for (let ii = 0; ii < shaderSources.length; ++ii) {
    shaders.push(loadShader(
        gl, shaderSources[ii], gl[defaultShaderType[ii]], opt_errorCallback));
  }
  return createProgram(gl, shaders, opt_attribs, opt_locations, opt_errorCallback);
}

var vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;
out vec2 v_texcoord;
void main() {
  gl_Position = a_position;
  v_texcoord = a_texcoord;
}
`;

var fragmentShaderSource = `#version 300 es
precision highp float;
in vec2 v_texcoord;
uniform sampler2D u_texture;
out vec4 outColor;
void main() {
  outColor = texture(u_texture, v_texcoord);
}
`;

