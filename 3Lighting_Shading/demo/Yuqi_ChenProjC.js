// Vertex shader program
var VSHADER_SOURCE_1 =

    'precision highp float;\n' +
    'precision highp int;\n' +
    'struct LampT {\n' + // Describes one point-like Phong light source
    '  vec3 pos;\n' + // (x,y,z,w); w==1.0 for local light at x,y,z position
    '  vec3 ambi;\n' + // Ia ==  ambient light source strength (r,g,b)
    '  vec3 diff;\n' + // Id ==  diffuse light source strength (r,g,b)
    '  vec3 spec;\n' + // Is == specular light source strength (r,g,b)
    '}; \n' +
    'struct MatlT {\n' + // Describes one Phong material by its reflectances:
    '  vec3 emit;\n' + // Ke: emissive -- surface 'glow' amount (r,g,b);
    '  vec3 ambi;\n' + // Ka: ambient reflectance (r,g,b)
    '  vec3 diff;\n' + // Kd: diffuse reflectance (r,g,b)
    '  vec3 spec;\n' + // Ks: specular reflectance (r,g,b)
    '  int shiny;\n' + // Kshiny: specular exponent (integer >= 1; typ. <200)
    '};\n' +

    'uniform LampT u_LampSet;\n' + // Array of all light sources.
    'uniform LampT u_headLight;\n' + // Array of all light sources.
    'uniform MatlT u_MatlSet;\n' + // Array of all materials.

    'uniform vec3 u_eyePosWorld; \n' + // Camera/eye location in world coords.
    'uniform int lightMode;\n' +
    'uniform int shadeMode;\n' +

    'varying vec3 v_Kd;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec4 v_Color;\n' +

    'attribute vec4 a_Position;\n' +
    'attribute vec4 a_Normal;\n' + //surface normal vector

    'uniform mat4 u_MvpMatrix;\n' +
    'uniform mat4 u_ModelMatrix;\n' +
    'uniform mat4 u_NormalMatrix;\n' + //transformation matrix of the normal vector



    'void main() {\n' +
    'if(shadeMode == 0){\n' +
    '  gl_Position = u_MvpMatrix * a_Position;\n' +

    '  v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    '  v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '  v_Kd = u_MatlSet.diff; \n' + // find per-pixel diffuse reflectance from per-vertex
    '}\n' +

    'if(shadeMode == 1){\n' +
    '    gl_Position = u_MvpMatrix * a_Position;\n' +
    '    v_Position = vec3(u_ModelMatrix * a_Position);\n' +
    '    v_Normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
    '    v_Kd = u_MatlSet.diff; \n' + // find per-pixel diffuse reflectance from per-vertex
    // '\n' +
    '    vec3 normal = normalize(v_Normal);\n' +
    // '\n' +
    '    vec3 lightDirection = normalize(u_LampSet.pos - v_Position);\n' +
    '    vec3 lightDirection_2 = normalize(u_headLight.pos - v_Position);\n' +

    '    vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz); \n' +
    '    float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    '    float nDotL_2 = max(dot(lightDirection_2, normal), 0.0);\n' +
    '    float nDotH = 0.0; \n' +
    '    float nDotH_2 = 0.0; \n' +

    // Bilnn-Phong lighting
    '    if(lightMode == 0){\n' +
    '      vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '      nDotH = max(dot(H, normal), 0.0); \n' +
    '      vec3 H_2 = normalize(lightDirection_2 + eyeDirection); \n' +
    '      nDotH_2 = max(dot(H_2, normal), 0.0); \n' +
    '    }\n' +

    // Phong lighting
    '    if(lightMode == 1){\n' +
    '      vec3 L = normalize(lightDirection); \n' +
    '      vec3 C = dot(normal, L)*normal; \n' +
    '      vec3 R = C + C - L; \n' +
    '      nDotH = max(dot(eyeDirection, R), 0.0); \n' +
    '      vec3 L_2 = normalize(lightDirection_2); \n' +
    '      vec3 C_2 = dot(normal, L_2)*normal; \n' +
    '      vec3 R_2 = C_2 + C_2 - L_2; \n' +
    '      nDotH_2 = max(dot(eyeDirection, R_2), 0.0); \n' +
    '    }\n' +

    '      float e64 = pow(nDotH, float(u_MatlSet.shiny));\n' +
    '      float e64_2 = pow(nDotH_2, float(u_MatlSet.shiny));\n' +
    '      vec3 emissive = 	u_MatlSet.emit;\n' +
    '      vec3 ambient = u_LampSet.ambi * u_MatlSet.ambi + u_headLight.ambi * u_MatlSet.ambi ;\n' +
    '      vec3 diffuse = u_LampSet.diff * v_Kd * nDotL + u_headLight.diff * v_Kd * nDotL_2;\n' +
    '      vec3 speculr = u_LampSet.spec * u_MatlSet.spec * e64 + u_headLight.spec * u_MatlSet.spec * e64_2;\n' +
    '      v_Color = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
    '}\n' +
    '}\n';

// Fragment shader program
var FSHADER_SOURCE =

    'precision highp float;\n' +
    'precision highp int;\n' +
    'struct LampT {\n' + // Describes one point-like Phong light source
    '		vec3 pos;\n' + // (x,y,z,w); w==1.0 for local light at x,y,z position
    //		   w==0.0 for distant light from x,y,z direction
    ' 	vec3 ambi;\n' + // Ia ==  ambient light source strength (r,g,b)
    ' 	vec3 diff;\n' + // Id ==  diffuse light source strength (r,g,b)
    '		vec3 spec;\n' + // Is == specular light source strength (r,g,b)
    '}; \n' +

    'struct MatlT {\n' + // Describes one Phong material by its reflectances:
    '		vec3 emit;\n' + // Ke: emissive -- surface 'glow' amount (r,g,b);
    '		vec3 ambi;\n' + // Ka: ambient reflectance (r,g,b)
    '		vec3 diff;\n' + // Kd: diffuse reflectance (r,g,b)
    '		vec3 spec;\n' + // Ks: specular reflectance (r,g,b)
    '		int shiny;\n' + // Kshiny: specular exponent (integer >= 1; typ. <200)
    '		};\n' +

    'uniform LampT u_LampSet;\n' + // Array of all light sources.
    'uniform LampT u_headLight;\n' + // Array of all light sources.
    'uniform MatlT u_MatlSet;\n' + // Array of all materials.

    'uniform vec3 u_eyePosWorld; \n' + // Camera/eye location in world coords.
    'uniform int lightMode;\n' +
    'uniform int shadeMode;\n' +

    'varying vec3 v_Kd;\n' +
    'varying vec3 v_Normal;\n' +
    'varying vec3 v_Position;\n' +
    'varying vec4 v_Color;\n' +

    'void main() {\n' +
    ' if(shadeMode == 1){\n' +
    '  gl_FragColor = v_Color;\n' +
    '};\n' +

    ' if(shadeMode == 0){\n' +
    '  vec3 normal = normalize(v_Normal);\n' +
    '  vec3 lightDirection = normalize(u_LampSet.pos - v_Position);\n' +
    '  vec3 lightDirection_2 = normalize(u_headLight.pos - v_Position);\n' +
    '  vec3 eyeDirection = normalize(u_eyePosWorld - v_Position.xyz);\n' +
    '  float nDotL = max(dot(lightDirection, normal), 0.0);\n' +
    '  float nDotL_2 = max(dot(lightDirection_2, normal), 0.0);\n' +
    '  float nDotH = 0.0; \n' +
    '  float nDotH_2 = 0.0; \n' +

    // Bilnn-Phong lighting
    'if(lightMode == 0){\n' +
    '  vec3 H = normalize(lightDirection + eyeDirection); \n' +
    '  nDotH = max(dot(H, normal), 0.0); \n' +
    '  vec3 H_2 = normalize(lightDirection_2 + eyeDirection); \n' +
    '  nDotH_2 = max(dot(H_2, normal), 0.0); \n' +
    '}\n' +

    // Phong lighting
    'if(lightMode == 1){\n' +
    '  vec3 L = normalize(lightDirection); \n' +
    '  vec3 C = dot(normal, L)*normal; \n' +
    '  vec3 R = C + C - L; \n' +
    '  nDotH = max(dot(eyeDirection, R), 0.0); \n' +
    '  vec3 L_2 = normalize(lightDirection_2); \n' +
    '  vec3 C_2 = dot(normal, L_2)*normal; \n' +
    '  vec3 R_2 = C_2 + C_2 - L_2; \n' +
    '  nDotH_2 = max(dot(eyeDirection, R_2), 0.0); \n' +
    // '  nDotH = 100.0; \n' +
    '}\n' +

    '  float e64 = pow(nDotH, float(u_MatlSet.shiny));\n' +
    '  float e64_2 = pow(nDotH_2, float(u_MatlSet.shiny));\n' +
    '  vec3 emissive = 	u_MatlSet.emit;\n' +
    '  vec3 ambient = u_LampSet.ambi * u_MatlSet.ambi + u_headLight.ambi * u_MatlSet.ambi ;\n' +
    '  vec3 diffuse = u_LampSet.diff * v_Kd * nDotL + u_headLight.diff * v_Kd * nDotL_2;\n' +
    '  vec3 speculr = u_LampSet.spec * u_MatlSet.spec * e64 + u_headLight.spec * u_MatlSet.spec * e64_2;\n' +
    '  gl_FragColor = vec4(emissive + ambient + diffuse + speculr , 1.0);\n' +
    '}\n' +
    '}\n';

var g_EyeX = 20.00,
    g_EyeY = 0.20,
    g_EyeZ = 2.00;
var g_LookAtX = 0.0,
    g_LookAtY = 0.0,
    g_LookAtZ = 0.0;
var g_LambAtX = 5.0,
    g_LambAtY = 5.0,
    g_LambAtZ = 20.0;
var lampAmbiR = 1.0,
    lampAmbiG = 1.0,
    lampAmbiB = 1.0;
var lampDiffR = 1.0,
    lampDiffG = 1.0,
    lampDiffB = 1.0;
var lampSpecR = 1.0,
    lampSpecG = 1.0,
    lampSpecB = 1.0;

var MOVE_STEP = 0.15;
var LOOK_STEP = 0.02;
var ANGLE_STEP = 45.0;
var floatsPerVertex = 7;
var PHI_NOW = 0;
var THETA_NOW = 0;
var LAST_UPDATE = -1;

var eyePosWorld = new Float32Array(3);

var modelMatrix = new Matrix4();
var viewMatrix = new Matrix4();
var projMatrix = new Matrix4();
var mvpMatrix = new Matrix4();
var normalMatrix = new Matrix4();

var lightMode = 0;
var lightMode_loc;
var lampOn = true;
var headLightOn = true;

var shadeMode = 0;
var shadeMode_loc;

var g_ShaderID;


var lamp_1 = new LightsT();
var headLight = new LightsT();
var mSphere = 1;

function main() {
    canvas = document.getElementById('webgl');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;
    console.log('User Guide: Press Up/Down/Left/Right keys to change the eye position.')
    // Get the rendering context for WebGL
    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    g_ShaderID = createProgram(gl, VSHADER_SOURCE_1, FSHADER_SOURCE); // for VBO1,
    // Initialize shaders
    if (!g_ShaderID) {
        console.log('Failed to intialize shaders.');
        return;
    }
    gl.useProgram(g_ShaderID);
    lightMode_loc = gl.getUniformLocation(g_ShaderID, 'lightMode');
    gl.uniform1i(lightMode_loc, lightMode);
    shadeMode_loc = gl.getUniformLocation(g_ShaderID, 'shadeMode');
    gl.uniform1i(shadeMode_loc, shadeMode);

    gl.enable(gl.DEPTH_TEST);

    // Set the vertex coordinates and color (the blue triangle is in the front)
    var n = initVBO(gl);

    if (n < 0) {
        console.log('Failed to specify the vertex infromation');
        return;
    }

    // Specify the color for clearing <canvas>
    gl.clearColor(0.2, 0.2, 0.2, 1.0);



    document.onkeydown = function(ev) {
        keydown(ev, gl, currentAngle, canvas);
    };

    var currentAngle = 0.0;
    var tick = function() {
        currentAngle = animate(currentAngle); // Update the rotation angle
        draw(gl, currentAngle, canvas); // Draw the triangles
        requestAnimationFrame(tick, canvas);
        // Request that the browser re-draw the webpage 
    };
    tick();

}


function initVBO(gl) {
    //==============================================================================
    makeSphere();
    makeSphere2();
    makeGroundGrid();
    makePyramid();
    makeHexagon();

    var mySiz = sphVerts.length + sphVerts2.length + gndVerts.length + pyrVerts.length + hexVerts.length;

    var nn = mySiz / floatsPerVertex;
    var shapes = new Float32Array(mySiz);
    i = 0
    sphStart = i;
    for (j = 0; j < sphVerts.length; i++, j++) {
        shapes[i] = sphVerts[j];
    }
    sphStart2 = i;
    for (j = 0; j < sphVerts2.length; i++, j++) {
        shapes[i] = sphVerts2[j];
    }
    gndStart = i;
    for (j = 0; j < gndVerts.length; i++, j++) {
        shapes[i] = gndVerts[j];
    }
    pyrStart = i;
    for (j = 0; j < pyrVerts.length; i++, j++) {
        shapes[i] = pyrVerts[j];
    }
    hexStart = i;
    for (j = 0; j < hexVerts.length; i++, j++) {
        shapes[i] = hexVerts[j];
    }

    var gBuffer = gl.createBuffer();
    if (!gBuffer) {
        console.log('Failed to create the shape buffer object');
        return false;
    }

    gl.bindBuffer(gl.ARRAY_BUFFER, gBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, shapes, gl.STATIC_DRAW);

    var u_modelLoc = gl.getUniformLocation(g_ShaderID, 'u_ModelMatrix');
    if (!u_modelLoc) {
        console.log('Failed to get GPU storage location1 of u_ModelMatrix uniform');
        return;
    }

    var FSIZE = shapes.BYTES_PER_ELEMENT; // how many bytes per stored value?

    var a_Position = gl.getAttribLocation(g_ShaderID, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return -1;
    }
    gl.vertexAttribPointer(a_Position, 4, gl.FLOAT, false, FSIZE * floatsPerVertex, 0);
    gl.enableVertexAttribArray(a_Position);

    var a_Normal = gl.getAttribLocation(g_ShaderID, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return -1;
    }
    gl.vertexAttribPointer(a_Normal, 3, gl.FLOAT, false, FSIZE * floatsPerVertex, 4 * FSIZE);
    gl.enableVertexAttribArray(a_Normal);

    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    return nn;
}





function draw(gl, currentAngle, canvas) {

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.viewport(0, 0, canvas.width, canvas.height);
    viewMatrix.setLookAt(g_EyeX, g_EyeY, g_EyeZ, // eye position
        g_LookAtX, g_LookAtY, g_LookAtZ, // look-at point
        0, 1, 0); // up vector
    projMatrix.setPerspective(35, canvas.width / canvas.height, 0.01, 100);


    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    drawMyScene_1(gl, currentAngle, canvas);
}

function drawMySceneRepeat(gl, g_ShaderID, lamp, matl) {

    gl.uniform1i(lightMode_loc, lightMode);
    gl.uniform1i(shadeMode_loc, shadeMode);
    // Get the storage locations of u_ViewMatrix and u_ProjMatrix variables
    u_MvpMatrix = gl.getUniformLocation(g_ShaderID, 'u_MvpMatrix');
    u_ModelMatrix = gl.getUniformLocation(g_ShaderID, 'u_ModelMatrix');
    u_NormalMatrix = gl.getUniformLocation(g_ShaderID, 'u_NormalMatrix');
    u_eyePosWorld = gl.getUniformLocation(g_ShaderID, 'u_eyePosWorld');

    if (!u_MvpMatrix || !u_ModelMatrix || !u_NormalMatrix || !u_eyePosWorld) {
        console.log('Failed to get the location of uniform variables');
        return;
    }

    lamp.u_pos = gl.getUniformLocation(g_ShaderID, 'u_LampSet.pos');
    lamp.u_ambi = gl.getUniformLocation(g_ShaderID, 'u_LampSet.ambi');
    lamp.u_diff = gl.getUniformLocation(g_ShaderID, 'u_LampSet.diff');
    lamp.u_spec = gl.getUniformLocation(g_ShaderID, 'u_LampSet.spec');

    headLight.u_pos = gl.getUniformLocation(g_ShaderID, 'u_headLight.pos');
    headLight.u_ambi = gl.getUniformLocation(g_ShaderID, 'u_headLight.ambi');
    headLight.u_diff = gl.getUniformLocation(g_ShaderID, 'u_headLight.diff');
    headLight.u_spec = gl.getUniformLocation(g_ShaderID, 'u_headLight.spec');
    if (!lamp.u_pos || !lamp.u_ambi || !lamp.u_diff || !lamp.u_spec ||
        !headLight.u_pos || !headLight.u_ambi || !headLight.u_diff || !headLight.u_spec) {
        console.log('Failed to get GPUs lamp or headLight storage locations');
        return;
    }

    // ... for Phong material/reflectance:
    matl.uLoc_Ke = gl.getUniformLocation(g_ShaderID, 'u_MatlSet.emit');
    matl.uLoc_Ka = gl.getUniformLocation(g_ShaderID, 'u_MatlSet.ambi');
    matl.uLoc_Kd = gl.getUniformLocation(g_ShaderID, 'u_MatlSet.diff');
    matl.uLoc_Ks = gl.getUniformLocation(g_ShaderID, 'u_MatlSet.spec');
    matl.uLoc_Kshiny = gl.getUniformLocation(g_ShaderID, 'u_MatlSet.shiny');
    if (!matl.uLoc_Ke || !matl.uLoc_Ka || !matl.uLoc_Kd ||
        !matl.uLoc_Ks || !matl.uLoc_Kshiny
    ) {
        console.log('Failed to get GPUs Reflectance storage locations');
        return;
    }
    // Position the camera in world coordinates:
    eyePosWorld.set([g_EyeX, g_EyeY, g_EyeZ]);
    gl.uniform3fv(u_eyePosWorld, eyePosWorld); // use it to set our uniform
    // (Note: uniform4fv() expects 4-element float32Array as its 2nd argument)

    // Init World-coord. position & colors of first light source in global vars;

    lamp.I_pos.elements.set([g_LambAtX, g_LambAtY, g_LambAtZ]);
    if (lampOn) {
        lamp.I_ambi.elements.set([lampAmbiR, lampAmbiG, lampAmbiB]);
        lamp.I_diff.elements.set([lampDiffR, lampDiffG, lampDiffB]);
        lamp.I_spec.elements.set([lampSpecR, lampSpecG, lampSpecB]);
    } else {
        lamp.I_ambi.elements.set([0.0, 0.0, 0.0]);
        lamp.I_diff.elements.set([0.0, 0.0, 0.0]);
        lamp.I_spec.elements.set([0.0, 0.0, 0.0]);
    }

    // lamp.I_pos.elements.set([g_LambAtX, g_LambAtY, g_LambAtZ]);
    headLight.I_pos.elements.set([g_EyeX, g_EyeY, g_EyeZ]);
    if (headLightOn) {
        headLight.I_ambi.elements.set([1.0, 1.0, 1.0]);
        headLight.I_diff.elements.set([1.0, 1.0, 1.0]);
        headLight.I_spec.elements.set([1.0, 1.0, 1.0]);
    } else {
        headLight.I_ambi.elements.set([0.0, 0.0, 0.0]);
        headLight.I_diff.elements.set([0.0, 0.0, 0.0]);
        headLight.I_spec.elements.set([0.0, 0.0, 0.0]);
    }

    gl.uniform3fv(lamp.u_pos, lamp.I_pos.elements.slice(0, 3));
    gl.uniform3fv(lamp.u_ambi, lamp.I_ambi.elements); // ambient
    gl.uniform3fv(lamp.u_diff, lamp.I_diff.elements); // diffuse
    gl.uniform3fv(lamp.u_spec, lamp.I_spec.elements); // Specular
    gl.uniform3fv(headLight.u_pos, headLight.I_pos.elements.slice(0, 3));
    gl.uniform3fv(headLight.u_ambi, headLight.I_ambi.elements); // ambient
    gl.uniform3fv(headLight.u_diff, headLight.I_diff.elements); // diffuse
    gl.uniform3fv(headLight.u_spec, headLight.I_spec.elements); // Specular

    //---------------For the Material object(s):
    gl.uniform3fv(matl.uLoc_Ke, matl.K_emit.slice(0, 3)); // Ke emissive
    gl.uniform3fv(matl.uLoc_Ka, matl.K_ambi.slice(0, 3)); // Ka ambient
    gl.uniform3fv(matl.uLoc_Kd, matl.K_diff.slice(0, 3)); // Kd	diffuse
    gl.uniform3fv(matl.uLoc_Ks, matl.K_spec.slice(0, 3)); // Ks specular
    gl.uniform1i(matl.uLoc_Kshiny, parseInt(matl.K_shiny, 10)); // Kshiny

}

function drawMyScene_1(gl, currentAngle, canvas) {
    gl.useProgram(g_ShaderID);

    //---------------------Ground grid----------------------------------
    var matl_1 = new Material(14);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_1);
    viewMatrix.rotate(-90.0, 1, 0, 0);
    // modelMatrix.rotate(90, 0, 1, 1);

    modelMatrix.setTranslate(0.0, 0.0, 0.0);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    // modelMatrix = modelMatrix.multiply(viewMatrix);
    // mvpMatrix = projMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.LINES, gndStart / floatsPerVertex, gndVerts.length / floatsPerVertex);


    //---------------------Sphere----------------------------------
    // var matl_1 = new Material(mSphere);
    var matl_1 = new Material(1);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_1);
    modelMatrix.setTranslate(0.0, 3.5, 0.0);
    viewMatrix.rotate(90.0, 1, 0, 0);
    // modelMatrix.setTranslate(0.0, 1.0, 0.0);
    // modelMatrix.scale(0.3, 0.3, 0.3);
    
    //modelMatrix.rotate(currentAngle, 0, 0, 1)
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    // modelMatrix = modelMatrix.multiply(viewMatrix);
    // mvpMatrix = projMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart / floatsPerVertex, sphVerts.length / floatsPerVertex)

    //---------------------small sphere1----------------------------------
    // var matl_1 = new Material(mSphere);
    var matl_1 = new Material(mSphere + 5);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_1);
    modelMatrix.setTranslate(0.0, 3.5, 0.0);
    modelMatrix.scale(0.3, 0.3, 0.3);
    modelMatrix.rotate(currentAngle * 2, 1, 0, 0)
    modelMatrix.translate(0.0, 0.0, 4.5);
    //viewMatrix.rotate(90.0, 1, 0, 0);
    // modelMatrix.setTranslate(0.0, 1.0, 0.0);
    // modelMatrix.scale(0.3, 0.3, 0.3);
    
    //modelMatrix.rotate(currentAngle, 0, 0, 1)
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    // modelMatrix = modelMatrix.multiply(viewMatrix);
    // mvpMatrix = projMatrix.multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart2 / floatsPerVertex, sphVerts2.length / floatsPerVertex);

    //---------------------small sphere2----------------------------------
    modelMatrix.setTranslate(0.0, 3.5, 0.0);
    modelMatrix.scale(0.3, 0.3, 0.3);
    modelMatrix.rotate(currentAngle * 2 + 40, 1, 0, 0)
    modelMatrix.translate(0.0, 0.0, 4.5);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart2 / floatsPerVertex, sphVerts2.length / floatsPerVertex);
    //---------------------small sphere3----------------------------------
    modelMatrix.setTranslate(0.0, 3.5, 0.0);
    modelMatrix.scale(0.3, 0.3, 0.3);
    modelMatrix.rotate(currentAngle * 2 + 80, 1, 0, 0)
    modelMatrix.translate(0.0, 0.0, 4.5);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart2 / floatsPerVertex, sphVerts2.length / floatsPerVertex);
    //---------------------small sphere4----------------------------------
    modelMatrix.setTranslate(0.0, 3.5, 0.0);
    modelMatrix.scale(0.3, 0.3, 0.3);
    modelMatrix.rotate(currentAngle * 2 + 120, 1, 0, 0)
    modelMatrix.translate(0.0, 0.0, 4.5);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart2 / floatsPerVertex, sphVerts2.length / floatsPerVertex);
    //---------------------small sphere5----------------------------------
    modelMatrix.setTranslate(0.0, 3.5, 0.0);
    modelMatrix.scale(0.3, 0.3, 0.3);
    modelMatrix.rotate(currentAngle * 2 + 160, 1, 0, 0)
    modelMatrix.translate(0.0, 0.0, 4.5);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart2 / floatsPerVertex, sphVerts2.length / floatsPerVertex);
    //---------------------small sphere6----------------------------------
    modelMatrix.setTranslate(0.0, 3.5, 0.0);
    modelMatrix.scale(0.3, 0.3, 0.3);
    modelMatrix.rotate(currentAngle * 2 + 200, 1, 0, 0)
    modelMatrix.translate(0.0, 0.0, 4.5);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart2 / floatsPerVertex, sphVerts2.length / floatsPerVertex);
    //---------------------small sphere7----------------------------------
    modelMatrix.setTranslate(0.0, 3.5, 0.0);
    modelMatrix.scale(0.3, 0.3, 0.3);
    modelMatrix.rotate(currentAngle * 2 + 240, 1, 0, 0)
    modelMatrix.translate(0.0, 0.0, 4.5);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart2 / floatsPerVertex, sphVerts2.length / floatsPerVertex);
    //---------------------small sphere8----------------------------------
    modelMatrix.setTranslate(0.0, 3.5, 0.0);
    modelMatrix.scale(0.3, 0.3, 0.3);
    modelMatrix.rotate(currentAngle * 2 + 280, 1, 0, 0)
    modelMatrix.translate(0.0, 0.0, 4.5);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart2 / floatsPerVertex, sphVerts2.length / floatsPerVertex);
    //---------------------small sphere9----------------------------------
    modelMatrix.setTranslate(0.0, 3.5, 0.0);
    modelMatrix.scale(0.3, 0.3, 0.3);
    modelMatrix.rotate(currentAngle * 2 + 320, 1, 0, 0)
    modelMatrix.translate(0.0, 0.0, 4.5);

    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, sphStart2 / floatsPerVertex, sphVerts2.length / floatsPerVertex);

    //-----------------------pyramid---------------------------------
    var matl_4 = new Material(12);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_4);

    modelMatrix.setTranslate(8.0, 0.0, 5.0);
    //modelMatrix.rotate(90.0, 1, 0, 1);
    // modelMatrix.rotate(90.0, 1, 0, 0);
    modelMatrix.scale(1.0, 1.0, 1.0);
    modelMatrix.rotate(-90, 1, 0, 0);
    modelMatrix.rotate(1 * currentAngle, 0, 0, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, pyrStart / floatsPerVertex, pyrVerts.length / floatsPerVertex);

    //-----------------------small pyramid1, 2, 3---------------------------------
    var matl_4 = new Material(12);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_4);
    modelMatrix.setTranslate(10, 0.0, 2.7);
    modelMatrix.scale(0.6, 0.6, 0.6);
    modelMatrix.rotate(-90, 1, 0, 0);
    modelMatrix.rotate(1 * currentAngle, 0, 0, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    normalMatrix.setInverseOf(modelMatrix);
    normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, pyrStart / floatsPerVertex, pyrVerts.length / floatsPerVertex);

    modelMatrix.setTranslate(12, 0.0, 4.3);
    modelMatrix.scale(0.3, 0.3, 0.3);
    modelMatrix.rotate(-90, 1, 0, 0);
    modelMatrix.rotate(1 * currentAngle, 0, 0, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    //normalMatrix.setInverseOf(modelMatrix);
    //normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, pyrStart / floatsPerVertex, pyrVerts.length / floatsPerVertex);

    modelMatrix.setTranslate(11, 0.0, 5.5);
    modelMatrix.scale(0.2, 0.2, 0.2);
    modelMatrix.rotate(-90, 1, 0, 0);
    modelMatrix.rotate(1 * currentAngle, 0, 0, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    //normalMatrix.setInverseOf(modelMatrix);
    //normalMatrix.transpose();
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, pyrStart / floatsPerVertex, pyrVerts.length / floatsPerVertex);
//--------------------------------------------------------------------------------------------------

    //-------------------------Hexagon1------------------------------------------
    var matl_9 = new Material(9);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_9);

    modelMatrix.setTranslate(1.0, 0.0, -5.0);
    modelMatrix.scale(0.2, 0.2, 0.2);
    modelMatrix.rotate(-90, 1, 0, 0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, 1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

    var matl_10 = new Material(10);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_10);
    modelMatrix.translate(0.0, 0.0, 4.0);
    modelMatrix.scale(0.9, 0.9, 1.0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, 1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

    var matl_11 = new Material(12);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_11);
    modelMatrix.translate(0.0, 0.0, 4.0);
    modelMatrix.scale(0.9, 0.9, 1.0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, 1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

    var matl_11 = new Material(13);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_11);
    modelMatrix.translate(0.0, 0.0, 4.0);
    modelMatrix.scale(0.9, 0.9, 1.0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, 1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

    var matl_11 = new Material(14);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_11);
    modelMatrix.translate(0.0, 0.0, 4.0);
    modelMatrix.scale(0.9, 0.9, 1.0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, 1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

    var matl_11 = new Material(15);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_11);
    modelMatrix.translate(0.0, 0.0, 4.0);
    modelMatrix.scale(0.9, 0.9, 1.0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, 1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);


    //-------------------------Hexagon2------------------------------------------
    var matl_9 = new Material(9);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_9);

    modelMatrix.setTranslate(-0.0, 0.0, -5.0);
    modelMatrix.scale(0.2, 0.2, 0.2);
    modelMatrix.rotate(-90, 1, 0, 0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, -1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

    var matl_10 = new Material(10);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_10);
    modelMatrix.translate(0.0, 0.0, 4.0);
    modelMatrix.scale(0.9, 0.9, 1.0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, -1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

    var matl_11 = new Material(12);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_11);
    modelMatrix.translate(0.0, 0.0, 4.0);
    modelMatrix.scale(0.9, 0.9, 1.0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, -1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

    var matl_11 = new Material(13);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_11);
    modelMatrix.translate(0.0, 0.0, 4.0);
    modelMatrix.scale(0.9, 0.9, 1.0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, -1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

    var matl_11 = new Material(14);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_11);
    modelMatrix.translate(0.0, 0.0, 4.0);
    modelMatrix.scale(0.9, 0.9, 1.0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, -1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

    var matl_11 = new Material(15);
    drawMySceneRepeat(gl, g_ShaderID, lamp_1, matl_11);
    modelMatrix.translate(0.0, 0.0, 4.0);
    modelMatrix.scale(0.9, 0.9, 1.0);
    modelMatrix.rotate(-0.1 * currentAngle, 0, -1, 1);
    mvpMatrix.set(projMatrix).multiply(viewMatrix).multiply(modelMatrix);
    gl.uniformMatrix4fv(u_MvpMatrix, false, mvpMatrix.elements);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLES, hexStart / floatsPerVertex, hexVerts.length / floatsPerVertex);

}


function keydown(ev, gl, currentAngle, canvas) {
    //------------------------------------------------------
    //HTML calls this'Event handler' or 'callback function' when we press a key:

    if (ev.keyCode == 39) { // right arrow - step right
        up = new Vector3();
        up = new Float32Array([0, 1, 0]);

        look = new Vector3();
        look = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookAtX, g_LookAtY, g_LookAtZ);

        tmpVec3 = new Vector3();
        tmpVec3 = vec3CrossProduct(up, look);

        g_EyeX -= MOVE_STEP * tmpVec3[0];
        g_EyeY -= MOVE_STEP * tmpVec3[1];
        g_EyeZ -= MOVE_STEP * tmpVec3[2];

        g_LookAtX -= MOVE_STEP * tmpVec3[0];
        g_LookAtY -= MOVE_STEP * tmpVec3[1];
        g_LookAtZ -= MOVE_STEP * tmpVec3[2];

        console.log('eyeX=', g_EyeX, 'eyeY=', g_EyeY, 'eyeZ=', g_EyeZ, 'lookAtX=', g_LookAtX, 'lookAtY=', g_LookAtY, 'lookAtZ=', g_LookAtZ);
    } else
    if (ev.keyCode == 37) { // left arrow - step left
        up = new Vector3();
        up = new Float32Array([0, 1, 0]);

        look = new Vector3();
        look = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookAtX, g_LookAtY, g_LookAtZ);

        tmpVec3 = new Vector3();
        tmpVec3 = vec3CrossProduct(up, look);

        g_EyeX += MOVE_STEP * tmpVec3[0];
        g_EyeY += MOVE_STEP * tmpVec3[1];
        g_EyeZ += MOVE_STEP * tmpVec3[2];

        g_LookAtX += MOVE_STEP * tmpVec3[0];
        g_LookAtY += MOVE_STEP * tmpVec3[1];
        g_LookAtZ += MOVE_STEP * tmpVec3[2];

        console.log('eyeX=', g_EyeX, 'eyeY=', g_EyeY, 'eyeZ=', g_EyeZ, 'lookAtX=', g_LookAtX, 'lookAtY=', g_LookAtY, 'lookAtZ=', g_LookAtZ);
    } else
    if (ev.keyCode == 38) { // up arrow - step forward
        tmpVec3 = new Vector3();
        tmpVec3 = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookAtX, g_LookAtY, g_LookAtZ);

        g_EyeX += MOVE_STEP * tmpVec3[0];
        g_EyeY += MOVE_STEP * tmpVec3[1];
        g_EyeZ += MOVE_STEP * tmpVec3[2];

        g_LookAtX += MOVE_STEP * tmpVec3[0];
        g_LookAtY += MOVE_STEP * tmpVec3[1];
        g_LookAtZ += MOVE_STEP * tmpVec3[2];

        console.log('eyeX=', g_EyeX, 'eyeY=', g_EyeY, 'eyeZ=', g_EyeZ, 'lookAtX=', g_LookAtX, 'lookAtY=', g_LookAtY, 'lookAtZ=', g_LookAtZ);

    } else
    if (ev.keyCode == 40) { // down arrow - step backward
        tmpVec3 = new Vector3();
        tmpVec3 = vec3FromEye2LookAt(g_EyeX, g_EyeY, g_EyeZ, g_LookAtX, g_LookAtY, g_LookAtZ);

        g_EyeX -= MOVE_STEP * tmpVec3[0];
        g_EyeY -= MOVE_STEP * tmpVec3[1];
        g_EyeZ -= MOVE_STEP * tmpVec3[2];

        g_LookAtX -= MOVE_STEP * tmpVec3[0];
        g_LookAtY -= MOVE_STEP * tmpVec3[1];
        g_LookAtZ -= MOVE_STEP * tmpVec3[2];

        console.log('eyeX=', g_EyeX, 'eyeY=', g_EyeY, 'eyeZ=', g_EyeZ, 'lookAtX=', g_LookAtX, 'lookAtY=', g_LookAtY, 'lookAtZ=', g_LookAtZ);
    } else
    if (ev.keyCode == 65) { // a - look left
        if (LAST_UPDATE == -1 || LAST_UPDATE == 0) {
            a = g_LookAtX - g_EyeX;
            b = g_LookAtY - g_EyeY;
            c = g_LookAtZ - g_EyeZ;
            l = Math.sqrt(a * a + b * b + c * c);

            lzx = Math.sqrt(a * a + c * c);
            sin_phi = lzx / l;

            theta0 = Math.PI - Math.asin(a / lzx);

            THETA_NOW = theta0 + LOOK_STEP;

            LAST_UPDATE = 1;
        } else {
            THETA_NOW += LOOK_STEP;
        }

        g_LookAtY = b + g_EyeY;
        g_LookAtX = l * sin_phi * Math.sin(THETA_NOW) + g_EyeX;
        g_LookAtZ = l * sin_phi * Math.cos(THETA_NOW) + g_EyeZ;
        console.log(g_LookAtY, g_LookAtX, g_LookAtZ);
    } else
    if (ev.keyCode == 68) { //d - look right
        if (LAST_UPDATE == -1 || LAST_UPDATE == 0) {
            a = g_LookAtX - g_EyeX;
            b = g_LookAtY - g_EyeY;
            c = g_LookAtZ - g_EyeZ;
            l = Math.sqrt(a * a + b * b + c * c);
            lzx = Math.sqrt(a * a + c * c);
            sin_phi = lzx / l;

            theta0 = Math.PI - Math.asin(a / lzx);

            THETA_NOW = theta0 - LOOK_STEP;

            LAST_UPDATE = 1;
        } else {
            THETA_NOW -= LOOK_STEP;
        }

        g_LookAtY = b + g_EyeY;
        g_LookAtX = l * sin_phi * Math.sin(THETA_NOW) + g_EyeX;
        g_LookAtZ = l * sin_phi * Math.cos(THETA_NOW) + g_EyeZ;
    } else
    if (ev.keyCode == 87) { //w - look up
        if (LAST_UPDATE == -1 || LAST_UPDATE == 1) {
            a = g_LookAtX - g_EyeX;
            b = g_LookAtY - g_EyeY;
            c = g_LookAtZ - g_EyeZ;
            l = Math.sqrt(a * a + b * b + c * c);
            cos_theta = c / Math.sqrt(a * a + c * c);
            sin_theta = a / Math.sqrt(a * a + c * c);

            phi0 = Math.asin(b / l);

            PHI_NOW = phi0 + LOOK_STEP;
            LAST_UPDATE = 0;
        } else {
            PHI_NOW += LOOK_STEP;
        }

        g_LookAtY = l * Math.sin(PHI_NOW) + g_EyeY;
        g_LookAtX = l * Math.cos(PHI_NOW) * sin_theta + g_EyeX;
        g_LookAtZ = l * Math.cos(PHI_NOW) * cos_theta + g_EyeZ;
    } else
    if (ev.keyCode == 83) { //s-look down
        if (LAST_UPDATE == -1 || LAST_UPDATE == 1) {
            a = g_LookAtX - g_EyeX;
            b = g_LookAtY - g_EyeY;
            c = g_LookAtZ - g_EyeZ;
            l = Math.sqrt(a * a + b * b + c * c);

            cos_theta = c / Math.sqrt(a * a + c * c);
            sin_theta = a / Math.sqrt(a * a + c * c);

            phi0 = Math.asin(b / l);

            PHI_NOW = phi0 - LOOK_STEP;


            LAST_UPDATE = 0;
        } else {
            PHI_NOW -= LOOK_STEP;
        }

        g_LookAtY = l * Math.sin(PHI_NOW) + g_EyeY;
        g_LookAtX = l * Math.cos(PHI_NOW) * sin_theta + g_EyeX;
        g_LookAtZ = l * Math.cos(PHI_NOW) * cos_theta + g_EyeZ;
    } else
    if (ev.keyCode == 72) {     //key h
        g_LambAtX += MOVE_STEP;
        // g_LambAtY -= MOVE_STEP;
    } else
    if (ev.keyCode == 70) {     //key f
        g_LambAtX -= MOVE_STEP;
        // g_LambAtY += MOVE_STEP;
    } else
    if (ev.keyCode == 84) {    //key t
        // g_LambAtX += MOVE_STEP * look[0];
        g_LambAtY += MOVE_STEP;
    } else
    if (ev.keyCode == 71) {    //key g
        // g_LambAtX -= MOVE_STEP;
        g_LambAtY -= MOVE_STEP;
    } else
    if (ev.keyCode == 32) { // space key
        lampOn = lampOn ? false : true;
        console.log("lampOn " + lampOn);
    } else
    if (ev.keyCode == 13) { // enter key
        headLightOn = headLightOn ? false : true;
        console.log("headLightOn " + headLightOn);
    } else
    if (ev.keyCode == 77) { // enter key m
        mSphere = (mSphere + 1) % 20;
        console.log("change the material");
    } else {
        console.log("keyDown: " + ev.keyCode);
        return;
    } // Prevent the unnecessary drawing
    draw(gl, currentAngle, canvas);
}

function changeLighting() {

    lightMode = lightMode == 1 ? 0 : 1;
    document.getElementById('lightMode').innerHTML = lightMode == 0 ? "Blinn-Phong lighting" : "Phong lighting";
    console.log("change lighting mode to " + lightMode);
}

function changeShading() {

    shadeMode = shadeMode == 1 ? 0 : 1;
    document.getElementById('shadeMode').innerHTML = shadeMode == 0 ? "Phong shadinging" : "Gouraud shading";
    console.log("change shading mode to " + shadeMode);
}

function onSubmit() {
    console.log("before change: ", lampAmbiR, lampAmbiG, lampAmbiB, lampDiffR,
        lampDiffG, lampDiffB, lampSpecR, lampSpecG, lampSpecB);
    lampAmbiR = Number(document.getElementById("lampAmbiR").value);
    lampAmbiG = Number(document.getElementById("lampAmbiG").value);
    lampAmbiB = Number(document.getElementById("lampAmbiB").value);
    lampDiffR = Number(document.getElementById("lampDiffR").value);
    lampDiffG = Number(document.getElementById("lampDiffG").value);
    lampDiffB = Number(document.getElementById("lampDiffB").value);
    lampSpecR = Number(document.getElementById("lampSpecR").value);
    lampSpecG = Number(document.getElementById("lampSpecG").value);
    lampSpecB = Number(document.getElementById("lampSpecB").value);
    console.log("before change: ", lampAmbiR, lampAmbiG, lampAmbiB, lampDiffR,
        lampDiffG, lampDiffB, lampSpecR, lampSpecG, lampSpecB);
}

function vec3FromEye2LookAt(eyeX, eyeY, eyeZ, lookAtX, lookAtY, lookAtZ) {
    result = new Vector3();

    dx = lookAtX - eyeX;
    dy = lookAtY - eyeY;
    dz = lookAtZ - eyeZ;
    amp = Math.sqrt(dx * dx + dy * dy + dz * dz) + 0.000001;

    result[0] = dx / amp;
    result[1] = dy / amp;
    result[2] = dz / amp;

    return result;
}

function vec3CrossProduct(up, look) //UpVec x LookVec --> Left Vec
{
    r = new Vector3();

    r[0] = up[1] * look[2] - up[2] * look[1];
    //console.log('up1', up[1]);
    r[1] = up[2] * look[0] - up[0] * look[2];
    r[2] = up[0] * look[1] - up[1] * look[0];

    amp = Math.sqrt(r[0] * r[0] + r[1] * r[1] + r[2] * r[2]) + 0.000001;

    r[0] /= amp;
    r[1] /= amp;
    r[2] /= amp;

    return r;
}

var g_last = Date.now();

function animate(angle) {
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;

    if (angle > 0.0 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
    if (angle < -180.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;

    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight * 0.8;
}

function makeGroundGrid() {
    var xcount = 100; // # of lines to draw in x,y to make the grid.
    var ycount = 100;
    var xymax = 20.0; // grid size; extends to cover +/-xymax in x and y.

    gndVerts = new Float32Array(floatsPerVertex * 2 * (xcount + ycount));

    var xgap = xymax / (xcount - 1); // HALF-spacing between lines in x,y;
    var ygap = xymax / (ycount - 1); // (why half? because v==(0line number/2))

    for (v = 0, j = 0; v < 2 * xcount; v++, j += floatsPerVertex) {
        gndVerts[j] = -xymax + (v - v % 2) * xgap; // x
        gndVerts[j + 1] = (v % 2 == 0) ? -xymax : xymax; // y
        gndVerts[j + 2] = 0.0; // z
        gndVerts[j + 3] = 1.0;
        gndVerts[j + 4] = 0; //dx
        gndVerts[j + 5] = 0; //dy
        gndVerts[j + 6] = 1; //dz
    }

    for (v = 0; v < 2 * ycount; v++, j += floatsPerVertex) {
        gndVerts[j] = (v % 2 == 0) ? -xymax : xymax;
        gndVerts[j + 1] = -xymax + (v - v % 2) * ygap;
        gndVerts[j + 2] = 0.0; // z
        gndVerts[j + 3] = 1.0;
        gndVerts[j + 4] = 0; //dx
        gndVerts[j + 5] = 0; //dy
        gndVerts[j + 6] = 1; //dz
    }
}


function makeSphere() {

    var slices = 19; // # of slices of the sphere along the z axis. >=3 req'd
    var sliceVerts = 27; // # of vertices around the top edge of the slice
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    sphVerts = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);

    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))
                sphVerts[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                sphVerts[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                sphVerts[j + 2] = cos0;
                sphVerts[j + 3] = 1.0;
                sphVerts[j + 4] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                sphVerts[j + 5] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                sphVerts[j + 6] = cos0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                // 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                sphVerts[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                sphVerts[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                sphVerts[j + 2] = cos1; // z
                sphVerts[j + 3] = 1.0; // w.
                sphVerts[j + 4] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                sphVerts[j + 5] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                sphVerts[j + 6] = cos1; // z
            }
        }
    }
}

function makeSphere2() {
    var slices = 19; // # of slices of the sphere along the z axis. >=3 req'd
    var sliceVerts = 27; // # of vertices around the top edge of the slice
    var sliceAngle = Math.PI / slices; // lattitude angle spanned by one slice.

    // Create a (global) array to hold this sphere's vertices:
    sphVerts2 = new Float32Array(((slices * 2 * sliceVerts) - 2) * floatsPerVertex);
   
    var sin0 = 0.0;
    var cos1 = 0.0;
    var sin1 = 0.0;
    var j = 0; // initialize our array index
    var isLast = 0;
    var isFirst = 1;
    for (s = 0; s < slices; s++) { // for each slice of the sphere,
        // find sines & cosines for top and bottom of this slice
        if (s == 0) {
            isFirst = 1; // skip 1st vertex of 1st slice.
            cos0 = 1.0; // initialize: start at north pole.
            sin0 = 0.0;
        } else { // otherwise, new top edge == old bottom edge
            isFirst = 0;
            cos0 = cos1;
            sin0 = sin1;
        } // & compute sine,cosine for new bottom edge.
        cos1 = Math.cos((s + 1) * sliceAngle);
        sin1 = Math.sin((s + 1) * sliceAngle);
        // go around the entire slice, generating TRIANGLE_STRIP verts
        // (Note we don't initialize j; grows with each new attrib,vertex, and slice)
        if (s == slices - 1) isLast = 1; // skip last vertex of last slice.
        for (v = isFirst; v < 2 * sliceVerts - isLast; v++, j += floatsPerVertex) {
            if (v % 2 == 0) { // put even# vertices at the the slice's top edge
                // (why PI and not 2*PI? because 0 <= v < 2*sliceVerts
                // and thus we can simplify cos(2*PI(v/2*sliceVerts))
                sphVerts2[j] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                sphVerts2[j + 1] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                sphVerts2[j + 2] = cos0;
                sphVerts2[j + 3] = 1.0;
                sphVerts2[j + 4] = sin0 * Math.cos(Math.PI * (v) / sliceVerts);
                sphVerts2[j + 5] = sin0 * Math.sin(Math.PI * (v) / sliceVerts);
                sphVerts2[j + 6] = cos0;
            } else { // put odd# vertices around the slice's lower edge;
                // x,y,z,w == cos(theta),sin(theta), 1.0, 1.0
                // 					theta = 2*PI*((v-1)/2)/capVerts = PI*(v-1)/capVerts
                sphVerts2[j] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                sphVerts2[j + 1] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                sphVerts2[j + 2] = cos1; // z
                sphVerts2[j + 3] = 1.0; // w.
                sphVerts2[j + 4] = sin1 * Math.cos(Math.PI * (v - 1) / sliceVerts); // x
                sphVerts2[j + 5] = sin1 * Math.sin(Math.PI * (v - 1) / sliceVerts); // y
                sphVerts2[j + 6] = cos1; // z
            }
        }
    }
}

function makePyramid() {

    var c30 = Math.sqrt(0.75);					// == cos(30deg) == sqrt(3) / 2
    var sq2	= Math.sqrt(2.0);						 
    // for surface normals:
    var sq23 = Math.sqrt(2.0/3.0)
    var sq29 = Math.sqrt(2.0/9.0)
    var sq89 = Math.sqrt(8.0/9.0)
    var thrd = 1.0/3.0;

    pyrVerts = new Float32Array([

        1.0, 1.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n0
        -1.0, 1.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n1
        0.0, 0.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n5

        -1.0, 1.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n1
        -1.0, -1.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n2
        0.0, 0.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n5

        -1.0, -1.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n2
        1.0, -1.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n3
        0.0, 0.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n5

        1.0, -1.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n3
        1.0, 1.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n0
        0.0, 0.0, 0.0, 1.0,    0.0, 0.0, 1.0,    //n5
    
        1.0, 1.0, 0.0, 1.0,   0.0, 4.0, 2.0,//n0
        -1.0, 1.0, 0.0, 1.0,       0.0, 4.0, 2.0,  //n1
        0.0, 0.0, 2.0, 1.0,   0.0, 4.0, 2.0,
    
        -1.0, 1.0, 0.0, 1.0,    -4.0, 0.0, 2.0,    //n1
        -1.0, -1.0, 0.0, 1.0,    -4.0, 0.0, 2.0,   //n2
        0.0, 0.0, 2.0, 1.0,   -4.0, 0.0, 2.0,
    
        -1.0, -1.0, 0.0, 1.0,    0.0, -4.0, 2.0,    //n2
        1.0, -1.0, 0.0, 1.0,    0.0, -4.0, 2.0,    //n3
        0.0, 0.0, 2.0, 1.0,    0.0, -4.0, 2.0,
    
        1.0, 1.0, 0.0, 1.0,    -4.0, 0.0, -2.0,    //n0
        1.0, -1.0, 0.0, 1.0,    -4.0, 0.0, -2.0,   //n3
        0.0, 0.0, 2.0, 1.0,   -4.0, 0.0, -2.0,
                
    ]);
}

function makeHexagon() {

    hexVerts = new Float32Array([

        //face0
        1.0, 1.732, 0.0, 1.0,    0.0, 0.0, -1.0,    //n0
        -1.0, 1.732, 0.0, 1.0,   0.0, 0.0, -1.0,    //n1
        0.0, 0.0, 0.0, 1.0,      0.0, 0.0, -1.0,   //n6
    
        -1.0, 1.732, 0.0, 1.0,   0.0, 0.0, -1.0,    //n1
        -2.0, 0.0, 0.0, 1.0,     0.0, 0.0, -1.0,   //n2
        0.0, 0.0, 0.0, 1.0,      0.0, 0.0, -1.0,   //n6
    
        -2.0, 0.0, 0.0, 1.0,     0.0, 0.0, -1.0,   //n2
        -1.0, -1.732, 0.0, 1.0,      0.0, 0.0, -1.0,   //n3
        0.0, 0.0, 0.0, 1.0,     0.0, 0.0, -1.0,   //n6
    
        -1.0, -1.732, 0.0,  1.0,     0.0, 0.0, -1.0,   //n3
        1.0, -1.732, 0.0, 1.0,   0.0, 0.0, -1.0,   //n4
        0.0, 0.0, 0.0, 1.0,     0.0, 0.0, -1.0,   //n6
    
        1.0, -1.732, 0.0, 1.0,   0.0, 0.0, -1.0,   //n4
        2.0, 0.0, 0.0, 1.0,      0.0, 0.0, -1.0,   //n5
        0.0, 0.0, 0.0, 1.0,      0.0, 0.0, -1.0,   //n6
    
        2.0, 0.0, 0.0, 1.0,      0.0, 0.0, -1.0,   //n5
        1.0, 1.732, 0.0, 1.0,    0.0, 0.0, -1.0,    //n0
        0.0, 0.0, 0.0, 1.0,      0.0, 0.0, -1.0,   //n6
        
        //face1
        1.0, 1.732, 0.0, 1.0,    0.0, 8.0, 0.0,    //n0
        -1.0, 1.732, 0.0, 1.0,   0.0, 8.0, 0.0,    //n1
        -1.0, 1.732, 4.0, 1.0,   0.0, 8.0, 0.0,    //n7

        -1.0, 1.732, 4.0, 1.0,   0.0, 8.0, 0.0,    //n7
        1.0, 1.732, 4.0, 1.0,    0.0, 8.0, 0.0,    //n12
        1.0, 1.732, 0.0, 1.0,    0.0, 8.0, 0.0,    //n0
        
        //face2
        -1.0, 1.732, 0.0, 1.0,   -6.928, 4.0, 0.0,    //n1
        -1.0, 1.732, 4.0, 1.0,   -6.928, 4.0, 0.0,    //n7
        -2.0, 0.0, 4.0, 1.0,     -6.928, 4.0, 0.0,    //n8

        -2.0, 0.0, 4.0, 1.0,     -6.928, 4.0, 0.0,   //n8
        -2.0, 0.0, 0.0, 1.0,     -6.928, 4.0, 0.0,   //n2
        -1.0, 1.732, 0.0, 1.0,   -6.928, 4.0, 0.0,    //n1
        
        //face3
        -2.0, 0.0, 4.0, 1.0,     -6.928, -4.0, 0.0,   //n8
        -2.0, 0.0, 0.0, 1.0,     -6.928, -4.0, 0.0,   //n2
        -1.0, -1.732, 0.0, 1.0,  -6.928, -4.0, 0.0,     //n3

        -2.0, 0.0, 4.0, 1.0,     -6.928, -4.0, 0.0,   //n8
        -1.0, -1.732, 0.0,  1.0, -6.928, -4.0, 0.0,       //n3
        -1.0, -1.732, 4.0, 1.0,  -6.928, -4.0, 0.0,   //n9

        //face4
        -1.0, -1.732, 0.0,  1.0,  0.0, -8.0, 0.0,       //n3
        -1.0, -1.732, 4.0, 1.0,   0.0, -8.0, 0.0,   //n9
        1.0, -1.732, 0.0, 1.0,    0.0, -8.0, 0.0,   //n4

        -1.0, -1.732, 4.0, 1.0,   0.0, -8.0, 0.0,   //n9
        1.0, -1.732, 0.0, 1.0,    0.0, -8.0, 0.0,   //n4
        1.0, -1.732, 4.0, 1.0,    0.0, -8.0, 0.0,   //n10

        //face5
        1.0, -1.732, 0.0, 1.0,    6.928, -4.0, 0.0,   //n4
        1.0, -1.732, 4.0, 1.0,    6.928, -4.0, 0.0,   //n10
        2.0, 0.0, 0.0, 1.0,       6.928, -4.0, 0.0,   //n5

        1.0, -1.732, 4.0, 1.0,    6.928, -4.0, 0.0,   //n10
        2.0, 0.0, 0.0, 1.0,       6.928, -4.0, 0.0,   //n5
        2.0, 0.0, 4.0, 1.0,       6.928, -4.0, 0.0,   //n11

        //face6
        2.0, 0.0, 0.0, 1.0,       6.928, 4.0, 0.0,   //n5
        2.0, 0.0, 4.0, 1.0,       6.928, 4.0, 0.0,   //n11
        1.0, 1.732, 0.0, 1.0,     6.928, 4.0, 0.0,    //n0

        1.0, 1.732, 0.0, 1.0,     6.928, 4.0, 0.0,    //n0
        2.0, 0.0, 4.0, 1.0,       6.928, 4.0, 0.0,   //n11
        1.0, 1.732, 4.0, 1.0,     6.928, 4.0, 0.0,    //n12

        //face7
        1.0, 1.732, 4.0, 1.0,    0.0, 0.0, 5.0,    //n0
        -1.0, 1.732, 4.0, 1.0,   0.0, 0.0, 5.0,    //n1
        0.0, 0.0, 4.0, 1.0,      0.0, 0.0, 5.0,   //n6
    
        -1.0, 1.732, 4.0, 1.0,   0.0, 0.0, 5.0,    //n1
        -2.0, 0.0, 4.0, 1.0,     0.0, 0.0, 5.0,   //n2
        0.0, 0.0, 4.0, 1.0,      0.0, 0.0, 5.0,   //n6
    
        -2.0, 0.0, 4.0, 1.0,     0.0, 0.0, 5.0,   //n2
        -1.0, -1.732, 4.0, 1.0,      0.0, 0.0, 5.0,   //n3
        0.0, 0.0, 4.0, 1.0,     0.0, 0.0, 5.0,   //n6
    
        -1.0, -1.732, 4.0,  1.0,     0.0, 0.0, 5.0,   //n3
        1.0, -1.732, 4.0, 1.0,   0.0, 0.0, 5.0,   //n4
        0.0, 0.0, 4.0, 1.0,     0.0, 0.0, 5.0,   //n6
    
        1.0, -1.732, 4.0, 1.0,   0.0, 0.0, 5.0,   //n4
        2.0, 0.0, 4.0, 1.0,      0.0, 0.0, 5.0,   //n5
        0.0, 0.0, 4.0, 1.0,      0.0, 0.0, 5.0,   //n6
    
        2.0, 0.0, 4.0, 1.0,      0.0, 0.0, 5.0,   //n5
        1.0, 1.732, 4.0, 1.0,    0.0, 0.0, 5.0,    //n0
        0.0, 0.0, 4.0, 1.0,      0.0, 0.0, 5.0,   //n6
    ]);
}
