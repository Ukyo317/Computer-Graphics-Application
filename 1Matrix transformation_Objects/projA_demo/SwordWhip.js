// Vertex shader program----------------------------------
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ModelMatrix;\n' +
  'varying vec4 v_Color;\n' +    //--------------
  'void main() {\n' +
  '  gl_Position = u_ModelMatrix * a_Position;\n' +
  '  v_Color = a_Color;\n' +     //--------------
  '}\n';

// Fragment shader program----------------------------------
var FSHADER_SOURCE =
	'precision mediump float;\n' +
  	'varying vec4 v_Color;\n' + 
  	'void main() {\n' +
	'gl_FragColor = v_Color;\n' +
  	'}\n';

	var xRotateAxis = 1.0;
	var yRotateAxis = 1.0;
	var zRotateAxis = 0.0;	
	var ANGLE_STEP = 20.0;
	var ANGLE_STEP_Six = 5.0;
	var Color_STEP = 1.0;
	var currentAngleSix = 0.0;
	var currentAngleOfObject = 0.0;
	var isDrag = false; // mouse-drag: true when user holds down mouse button
	var xMclik = 0;
	var yMclik = 0;
	var keyTranslateX = 0.0;
	var keyTranslateY = 0.0;
	var keyTranslateSpeed = 0.3;
	var xMdragTot = 0.0; // total (accumulated) mouse-drag amounts (in CVV coords).
	var yMdragTot = 0.0;
	var doubleclick = false;
	var step = 0.0;
	var stepOfSword = 0.0;
	var height = 0.0;
	var lengthOfHexahedron = 0.0;
	var HiltX = 0.0;
	var HiltY = 0.0;

function main() {
//==============================================================================
  // Retrieve <canvas> element
	var canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
	var gl = getWebGLContext(canvas);
	if (!gl) {
    	console.log('Failed to get the rendering context for WebGL');
		return;
	}

  // Initialize shaders
	if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
		console.log('Failed to intialize shaders.');
		return;
	}

  	// Write the positions of vertices into an array, transfer
  	// array contents to a Vertex Buffer Object created in the
  	// graphics hardware.
  	var n = initVertexBuffers(gl, currentColor);
  	if (n < 0) {
		console.log('Failed to set the positions of the vertices');
		return;
  	}

	// Specify the color for clearing <canvas>
  	gl.clearColor(0.6, 0.8, 0.8, 1.0);
	gl.enable(gl.DEPTH_TEST);

	
	window.addEventListener("keydown", myKeyDown, false);
  	canvas.onmousedown = function(ev) {
    myMouseDown(ev, gl, canvas)
  	};

	// when user's mouse button goes down call mouseDown() function
  	canvas.onmousemove = function(ev) {
    myMouseMove(ev, gl, canvas)
  	};

	// call mouseMove() function          
  	canvas.onmouseup = function(ev) {
    myMouseUp(ev, gl, canvas)
  	};

  	window.addEventListener("keydown", myKeyDown, false);
  	window.addEventListener("keyup", myKeyUp, false);
	
	// Get storage location of u_ModelMatrix
  	var u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  	if (!u_ModelMatrix) { 
    	console.log('Failed to get the storage location of u_ModelMatrix');
    	return;
  	}

  // Current rotation angle
  var currentAngle = 0.0;
  var currentColor = 0;
	
  // Model matrix
  var modelMatrix = new Matrix4();

  // Start drawing
  var tick = function() {
    currentAngle = animate(currentAngle);  // Update the rotation angle
	currentColor = animateColor(currentColor);  // Update the current color
	currentAngleOfObject = animateOfObject(currentAngleOfObject);  // Update the rotation angle of objects in the whip
	  
	var n = initVertexBuffers(gl, currentColor);  
	  
    drawRectangle(gl, n, currentAngle, modelMatrix, u_ModelMatrix);  // Draw the rectangle
	
	drawRectangleSide(gl, n, currentAngle, modelMatrix, u_ModelMatrix);  // Draw one side of the rectangle
	drawRectangleSide2(gl, n, currentAngle, modelMatrix, u_ModelMatrix);  // Draw another side of the rectangle
	 
	drawBlade(gl, n, currentAngle, modelMatrix, u_ModelMatrix, step);  // Draw the sword
	drawSwordSide(gl, n, currentAngle, modelMatrix, u_ModelMatrix, step);  // Draw the side of the sword
	  
	drawHexahedron(gl, n, currentAngle, modelMatrix, u_ModelMatrix);  //Draw the hexahedron
	drawSwordHilt(gl, n, height, currentAngle, modelMatrix, u_ModelMatrix);  // Draw the hilt
	  
	height += 0.1;  // Set a variable to change the phase of different objects 
	drawWave(gl, n, height, currentAngle, currentColor, currentAngleOfObject, modelMatrix, u_ModelMatrix);  // Draw the whip
    requestAnimationFrame(tick, canvas);   // Request that the browser calls tick
  };
  tick();
}

function initVertexBuffers(gl, currentColor) {
//==============================================================================
	currentColor = currentColor * 2;
	//console.log(currentColor);
	
  	var verticesOfRectangle = new Float32Array ([
		//---------------------Rectangle--------------------  
		0.00, 0.30, 0.00, 1.00,	1.0, 0.84, 0.00,	// first triangle   (x,y,z,w==1)
		0.00, 0.00, 0.00, 1.00,    1.0, 0.42, 0.42,
		0.10,  0.30, 0.00, 1.00,   1.0, 0.84, 0.00,
		0.10, 0.00, 0.00, 1.00,    1.0, 0.42, 0.42,  //4
	  
		//---------------------Sword--------------------  
		-0.18, 0.00, 0.00, 1.00,	1.0, 0.27, 0.0,	
		-0.35, 0.00, 0.00, 1.00,    1.0, 0.27, 0.0,
		-0.25,  0.15, 0.00, 1.00,   1.0, 0.27, 0.0,
		-0.35, 0.05, 0.00, 1.00,    1.0, 0.45, 0.25,
		-0.35, 0.15, 0.00, 1.00,    1.0, 0.45, 0.25,
		-0.70, 0.05, 0.00, 1.00,    1.0, 0.45, 0.25,
		-0.75, 0.15, 0.00, 1.00,    1.0, 0.27, 0.0,	
		-0.70, 0.0, 0.00, 1.00,     1.0, 0.27, 0.0,
		-0.90, 0.0, 0.00, 1.00,     1.0, 0.27, 0.0,//9
  
		//---------------------Swordside-----------------  
		-0.18, 0.00, 0.025, 1.00,   1.0, 0.15, 0.15,
		-0.18, 0.00, 0.075, 1.00,   1.0, 0.15, 0.15,
		-0.35, 0.00, 0.025, 1.00,   1.0, 0.15, 0.15,
		-0.35, 0.00, 0.075, 1.00,   1.0, 0.15, 0.15,
		-0.35, 0.05, 0.025, 1.00,   1.0, 0.15, 0.15,
		-0.35, 0.05, 0.075, 1.00,   1.0, 0.15, 0.15,
		-0.70, 0.05, 0.025, 1.00,   1.0, 0.15, 0.15,
		-0.70, 0.05, 0.075, 1.00,   1.0, 0.15, 0.15,
		-0.70, 0.00, 0.025, 1.00,   1.0, 0.15, 0.15,
		-0.70, 0.00, 0.075, 1.00,   1.0, 0.15, 0.15,
		-0.90, 0.00, 0.025, 1.00,   1.0, 0.15, 0.15,
		-0.90, 0.00, 0.075, 1.00,   1.0, 0.15, 0.15,
		-0.75, 0.15, 0.025, 1.00,   1.0, 0.15, 0.15,
		-0.75, 0.15, 0.075, 1.00,   1.0, 0.15, 0.15,
		-0.25, 0.15, 0.025, 1.00,   1.0, 0.15, 0.15,
		-0.25, 0.15, 0.075, 1.00,   1.0, 0.15, 0.15,
		-0.18, 0.00, 0.025, 1.00,   1.0, 0.15, 0.15,
		-0.18, 0.00, 0.075, 1.00,   1.0, 0.15, 0.15,  //18
	  
	  
		0.00, 0.00, 0.00, 1.00,   1.0, 0.84, 0.00,
		0.00, 0.00, 0.10, 1.00,   1.0, 0.42, 0.42,
		0.00, 0.30, 0.00, 1.00,   1.0, 0.84, 0.00,
		0.00, 0.30, 0.10, 1.00,   1.0, 0.42, 0.42,  //4

		0.00, 0.00, 0.00, 1.00,   1.0, 0.84, 0.00,
		0.00, 0.00, 0.10, 1.00,   1.0, 0.42, 0.42,
		0.10, 0.00, 0.00, 1.00,   1.0, 0.84, 0.00,
		0.10, 0.00, 0.10, 1.00,   1.0, 0.42, 0.42,  //4
	
		//--------------------Hexahedron------------------
	  	0.00, 0.00, -0.06, 1.00,  1.0, 0.65, 0.0,	   
		0.3,  0.00, -0.06, 1.00,  1.0, 0.85, 0.73,   
		0.00, 0.052, -0.03, 1.00,  1.0, 0.85, 0.73, 
		0.3, 0.052, -0.03, 1.00,  1.0, 0.65, 0.0,	 
		0.00, 0.052, 0.03, 1.00,  1.0, 0.65, 0.0,
		0.3, 0.052, 0.03, 1.00,  1.0, 0.85, 0.73,

		0.00, 0.00, 0.06, 1.00,  1.0, 0.85, 0.73,
		0.3, 0.00, 0.06, 1.00,  1.0, 0.65, 0.0,

		0.00, -0.052, 0.03, 1.00,  1.0, 0.65, 0.0,
		0.3, -0.052, 0.03, 1.00,  1.0, 0.85, 0.73,

		0.00, -0.052, -0.03, 1.00,  1.0, 0.85, 0.73,
		0.3, -0.052, -0.03, 1.00,   1.0, 0.65, 0.0,

		0.00, 0.00, -0.06, 1.00,  1.0, 0.65, 0.0,
		0.3, 0.00, -0.06, 1.00,  1.0, 0.85, 0.73,  //14
	  
	  
		//----------------------Whip-----------------
	  	-0.04, -0.20, -0.04, 1.00,  0.6, 0.8, 1.0,
		-0.04, 0.20, -0.04, 1.00,  0.44, 0.54, 0.72,
		0.04, -0.20, -0.04, 1.00,   0.6, 0.8, 1.0,
		0.04, 0.20, -0.04, 1.00,  1.0, 1.0, 1.0,
	  
		0.04, 0.20, 0.04, 1.00,  0.6, 0.8, 1.0,
		-0.04, 0.20, -0.04, 1.00,  0.6, 0.8, 1.0,
	  	-0.04, 0.20, 0.04, 1.00,  0.6, 0.8, 1.0,
		-0.04, -0.20, -0.04, 1.00,  1.0, 1.0, 1.0,
	  	-0.04, -0.20, 0.04, 1.00,  1.0, 1.0, 1.0,
	  	0.04, -0.20, -0.04, 1.00,  0.44, 0.54, 0.72,
	  	0.04, -0.20, 0.04, 1.00,  0.44, 0.54, 0.72,
		0.04, 0.20, 0.04, 1.00,  1.0, 1.0, 1.0,
		-0.04, -0.20, 0.04, 1.00,  0.44, 0.54, 0.72,
		-0.04, 0.20, 0.04, 1.00,  0.44, 0.54, 0.72,  //14
	  
	  	-0.04, -0.20, -0.04, 1.00,  1 - currentColor, 0 + currentColor, 0,
	  	-0.04, 0.20, -0.04, 1.00,  1 - currentColor, 0 + currentColor, 0,
	  	0.04, -0.20, -0.04, 1.00, 1, 1, 1,
		0.04, 0.20, -0.04, 1.00,  1 - currentColor, 0 + currentColor, 0,
	  
		0.04, 0.20, 0.04, 1.00,  1 - currentColor, 0 + currentColor, 0,
	  	-0.04, 0.20, -0.04, 1.00,  0.6, 0.8, 1.0,
	  	-0.04, 0.20, 0.04, 1.00,  0.73, 0.90, 0.73,
		-0.04, -0.20, -0.04, 1.00,  1.0, 1.0, 1.0,
		-0.04, -0.20, 0.04, 1.00,  1.0, 1.0, 1.0,
		0.04, -0.20, -0.04, 1.00,  0.44, 0.54, 0.72,
		0.04, -0.20, 0.04, 1.00,  0.44, 0.54, 0.72,
		0.04, 0.20, 0.04, 1.00,  1.0, 1.0, 1.0,
		-0.04, -0.20, 0.04, 1.00,  0.44, 0.54, 0.72,
		-0.04, 0.20, 0.04, 1.00,  0.44, 0.54, 0.72, //14

		//---------------------Whip handle----------------------
	   -0.04, -0.20, -0.04, 1.00,  1.0, 0.6, 0.0,
	   -0.04, 0.20, -0.04, 1.00,  1.0, 0.6, 0.0,
	   0.04, -0.20, -0.04, 1.00, 1.0, 0.75, 0.75,
	   0.04, 0.20, -0.04, 1.00,  1.0, 0.75, 0.75,
	  
	   0.04, 0.20, 0.04, 1.00,  1.0, 0.6, 0.0,
	   -0.04, 0.20, -0.04, 1.00,  1.0, 0.6, 0.0,
	   -0.04, 0.20, 0.04, 1.00,  1.0, 1.0, 1.0,
	   -0.04, -0.20, -0.04, 1.00,  1.0, 1.0, 1.0,
	   -0.04, -0.20, 0.04, 1.00,  1.0, 1.0, 1.0,
	   0.04, -0.20, -0.04, 1.00,  1.0, 1.0, 1.0,
	   0.04, -0.20, 0.04, 1.00,  1.0, 0.6, 0.0,
	   0.04, 0.20, 0.04, 1.00,  1.0, 0.6, 0.0,
	   -0.04, -0.20, 0.04, 1.00,  1.0, 0.6, 0.0,
	   -0.04, 0.20, 0.04, 1.00,  1.0, 0.6, 0.0, //14
	  
		//---------------------Sword decoration----------------------
	   -0.04, -0.20, -0.04, 1.00, 0.8, 0.2 + currentColor, 0.2 + currentColor,
	   -0.04, 0.20, -0.04, 1.00,  0.8, 0.2 + currentColor, 0.2 + currentColor,
	   0.04, -0.20, -0.04, 1.00, 0.8 + currentColor, 0, 0.2,
	   0.04, 0.20, -0.04, 1.00,  0.8 + currentColor, 0, 0.2,
	  
	   0.04, 0.20, 0.04, 1.00,  1.0, 1.0, 1.0,
	   -0.04, 0.20, -0.04, 1.00,  1.0, 1.0, 1.0,
	   -0.04, 0.20, 0.04, 1.00,  1.0, 1.0, 1.0,
	   -0.04, -0.20, -0.04, 1.00,  1.0, 1.0, 1.0,
	   -0.04, -0.20, 0.04, 1.00,  1.0, 1.0, 1.0,
	   0.04, -0.20, -0.04, 1.00,  1.0, 1.0, 1.0,
	   0.04, -0.20, 0.04, 1.00,  1.0, 0.6, 0.0,
	   0.04, 0.20, 0.04, 1.00,  1.0, 0.6, 0.0,
	   -0.04, -0.20, 0.04, 1.00,  1.0, 0.6, 0.0,
	   -0.04, 0.20, 0.04, 1.00,  1.0, 0.6, 0.0, //14
  ]);
  	var n = 87;   // The number of vertices
	
  // Create a buffer object
  	var vertexBuffer = gl.createBuffer();    //-------------vertex coordinate
  	if (!vertexBuffer) {
		console.log('Failed to create the buffer object');
		return -1;
	}
  
	// Bind the buffer object to target
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  	// Write date into the buffer object
  	gl.bufferData(gl.ARRAY_BUFFER, verticesOfRectangle, gl.STATIC_DRAW);
	
	var FSIZE = verticesOfRectangle.BYTES_PER_ELEMENT;
	
	// Assign the buffer object to a_Position variable
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  	if(a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
  	}
  	gl.vertexAttribPointer(
		a_Position,  // choose Vertex Shader attribute to fill with data
		4,  // how many values? 1,2,3 or 4.  (we're using x,y,z,w)
		gl.FLOAT,  // data type for each value: usually gl.FLOAT 
		false,  // did we supply fixed-point data AND it needs normalizing?
		FSIZE*7,  // Stride -- how many bytes used to store each vertex?
    	// (x,y,z,w, r,g,b) * bytes/value
		0);
	gl.enableVertexAttribArray(a_Position);
	
	// Assign the buffer object to a_Color variable
	var a_Color = gl.getAttribLocation(gl.program, 'a_Color');
	if(a_Color < 0) {
		console.log('Failed to get the storage location of a_Color');
		return -1;
  	}
  	gl.vertexAttribPointer(
		a_Color,  // choose Vertex Shader attribute to fill with data
		3,  // how many values? 1,2,3 or 4.  (we're using x,y,z,w)
		gl.FLOAT,  // data type for each value: usually gl.FLOAT
		false,  // did we supply fixed-point data AND it needs normalizing?
		FSIZE*7,  // Stride -- how many bytes used to store each vertex?
		// (x,y,z,w, r,g,b) * bytes/value
		FSIZE*4// Offset -- how many bytes from START of buffer to the
  		// value we will actually use?  Need to skip over x,y,z,w
	);

	
  	// Enable the assignment to a_Color variable
  	gl.enableVertexAttribArray(a_Color);  

	//--------------------------------DONE!
  	// Unbind the buffer object 
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
  	return n;
}

function drawRectangle(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//========================Draw the rectangle=================================
  // Clear <canvas>
  	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	modelMatrix.setTranslate(0.0, 0.0, 0.0);
	var dist = Math.sqrt(xMdragTot * xMdragTot + yMdragTot * yMdragTot);
  	modelMatrix.rotate(dist * 120.0, -yMdragTot + 0.0001, xMdragTot + 0.0001, 0.0);
	
	pushMatrix(modelMatrix);
	
//-------Draw The Top Rectangles---------------	
  	modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
  	modelMatrix.translate(0.0, 0.015, -0.05)
  	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);	
  	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
  	modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
  	modelMatrix.translate(-0.13, 0.015, -0.05);
  	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
  	modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
  	modelMatrix.translate(0.0,-0.315, -0.05);
  	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(-0.13,-0.315, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
	
//-------Draw The Bottom Rectangles---------------	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(0.0, 0.015, 0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(-0.13, 0.015, 0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(0.0,-0.315, 0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(-0.13,-0.315, 0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}

function drawRectangleSide(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//========================Draw one side of the rectangle=================================
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(0.0, 0.015, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 31, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(0.10, 0.015, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 31, 4);
    
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.translate(-0.03, 0.015, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 31, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(-0.13, 0.015, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 31, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.translate(0.0, -0.315, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 31, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.translate(0.10, -0.315, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 31, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(-0.03, -0.315, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 31, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.translate(-0.13, -0.315, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 31, 4);
}

function drawRectangleSide2(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//========================Draw another side of the rectangle=================================
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.translate(0.0, 0.015, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 35, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(0.0, 0.315, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 35, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(0.0, -0.015, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 35, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(-0.13, 0.015, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 35, 4);
	   
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(0.0, -0.315, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 35, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(-0.13, 0.315, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 35, 4);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.translate(-0.13, -0.015, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 35, 4);
    
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.translate(-0.13, -0.315, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 35, 4);
}

function drawBlade(gl, n, currentAngle, modelMatrix, u_ModelMatrix, step) {
//========================Draw the Sword===============================	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.translate(0.0, 0.015 + stepOfSword, 0.025);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 4, 9);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.translate(0.0, 0.015 + stepOfSword, -0.025);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 4, 9);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.rotate(180.0, 1, 0, 0);
    modelMatrix.translate(0.0, 0.015 + stepOfSword, 0.025);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 4, 9);
	
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);	
    modelMatrix.rotate(180.0, 1, 0, 0);
    modelMatrix.translate(0.0, 0.015 + stepOfSword, -0.025);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 4, 9);
}

function drawSwordSide(gl, n, currentAngle, modelMatrix, u_ModelMatrix, step) {
//========================Draw the side of the sword=================================
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(0.0, 0.015 + stepOfSword, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 13, 18);
  
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.rotate(180.0, 1, 0, 0);
    modelMatrix.translate(0.0, 0.015 + stepOfSword, -0.05);
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 13, 18);
}

function drawHexahedron(gl, n, currentAngle, modelMatrix, u_ModelMatrix) {
//========================Draw the hexahedron===============================		
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.translate(-0.67, 0, 0);
    modelMatrix.rotate(3 * currentAngleSix, 1, 0, 0);
	
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 39, 14);
  
    var newAngle = (currentAngleSix + ANGLE_STEP_Six) % 360;
    currentAngleSix = newAngle;
	
    for(i = 0; i < 30; i++){
        modelMatrix.scale(1.0, 0.9, 0.99);
  	    modelMatrix.rotate(5 * currentAngleSix, 1, 0, 0);
	    modelMatrix.translate(-0.01*lengthOfHexahedron, 0.0, 0.0);
	    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawArrays(gl.TRIANGLE_STRIP, 39, 14);
    }	
}

function drawSwordHilt(gl, n, height, currentAngle, modelMatrix, u_ModelMatrix) {
//========================Draw the hilt of the sword===============================	
    if (doubleclick){
        modelMatrix.setTranslate(HiltX, HiltY, 0.0);
    } 
    else modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);;

    pushMatrix(modelMatrix);
	
    modelMatrix.translate(0.16, 0, 0);
	
    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
    gl.drawArrays(gl.TRIANGLE_STRIP, 53, 14);
	
    for (var j = 1; j < 4; j++) {
        modelMatrix.scale(1.0, 0.55, 1.0);
	    modelMatrix.translate(0.08, 0, 0);
	    gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  	    gl.drawArrays(gl.TRIANGLE_STRIP, 53, 14);
    }
	
	modelMatrix.scale(4.0, 0.55, 0.4);
	modelMatrix.translate(0.04, 0, 0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, 53, 14);
	
	modelMatrix.scale(0.25, 4.0, 3.0);
	modelMatrix.translate(0.12, 0, 0);  
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, 53, 14);
	
	modelMatrix = popMatrix();
	modelMatrix.scale(0.6, 0.17, 0.5);
	modelMatrix.translate(1.24, 0.0, 0.0);
	pushMatrix(modelMatrix);
		
//------------------draw the decoration------------------------
	for(i = 0; i <= 5; i++){
        modelMatrix = popMatrix();
		pushMatrix(modelMatrix);

		modelMatrix.translate(0.08*i, 0, 0.07 * Math.cos(height/2.5 + 0.5*i));	
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  		gl.drawArrays(gl.TRIANGLE_STRIP, 95, 14);
	}
}

function drawWave(gl, n, height, currentAngle, currentColor, currentOfObject, modelMatrix, u_ModelMatrix){
//========================Draw the whip===============================	
    
    //========================Draw the handle of the whip===============================
    modelMatrix.setRotate(currentAngle, xRotateAxis, yRotateAxis, zRotateAxis);
    modelMatrix.setTranslate(0.0, 0.0, 0.0);
	var dist = Math.sqrt(xMdragTot * xMdragTot + yMdragTot * yMdragTot);
    modelMatrix.rotate(dist * 120.0, -yMdragTot + 0.0001, xMdragTot + 0.0001, 0.0);
	
    pushMatrix(modelMatrix);
	modelMatrix.scale(0.8, 0.3, 1.0);
    modelMatrix.translate(-1.0, 2.13, 0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, 81, 14);
	
	modelMatrix.scale(3.82, 0.7, 1.0);
    modelMatrix.translate(0.048, 0, 0);

	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, 81, 14);
	
	modelMatrix.scale(0.35, 0.08 * currentAngleOfObject, 0.08 * currentAngleOfObject);
    modelMatrix.translate(0.154, 0, 0);
	gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
  	gl.drawArrays(gl.TRIANGLE_STRIP, 81, 14);
	
	modelMatrix = popMatrix();
	
    modelMatrix.scale(0.6, 0.17, 1.0);
    modelMatrix.translate(-0.7, 3.8, 0);
    pushMatrix(modelMatrix);
	
    //========================Draw the whip===============================
    for(i = 0; i <= 27; i++){	
        modelMatrix = popMatrix();
        pushMatrix(modelMatrix);

        modelMatrix.translate(0.08*i, 0.3 * Math.sin(height + 0.5*i), 0);
		gl.uniformMatrix4fv(u_ModelMatrix, false, modelMatrix.elements);
        gl.drawArrays(gl.TRIANGLE_STRIP, 67, 14);
	}
}

// Last time that this function was called:  (used for animation timing)
var g_last = Date.now();
function animate(angle) {
//==============================================================================
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - g_last;
    g_last = now;
  
    // Update the current rotation angle (adjusted by the elapsed time)
    //  limit the angle to move smoothly between +120 and -10 degrees:
    if(angle >  120 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
    if(angle <  -10.0 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}

var o_last = Date.now();
function animateOfObject(angle) {
//==============================================================================
    // Calculate the elapsed time
    var now = Date.now();
    var elapsed = now - o_last;
    o_last = now;
  
    // Update the current rotation angle (adjusted by the elapsed time)
    //  limit the angle to move smoothly between +70 and +20 degrees:
    if(angle >  70 && ANGLE_STEP > 0) ANGLE_STEP = -ANGLE_STEP;
    if(angle <  20 && ANGLE_STEP < 0) ANGLE_STEP = -ANGLE_STEP;
  
    var newAngle = angle + (ANGLE_STEP * elapsed) / 1000.0;
    return newAngle %= 360;
}

var t_last = Date.now();
function animateColor(colorchange) { // for color change, from 0-0.5

    var t_now = Date.now();
    var t_elapsed = t_now - t_last;
    t_last = t_now;
    if (colorchange < 0.0 && Color_STEP < 0) Color_STEP = -Color_STEP;
    if (colorchange > 0.5 && Color_STEP > 0) Color_STEP = -Color_STEP;
    var newcolor = colorchange + (Color_STEP * t_elapsed) / 9000.0;
    return newcolor;
}

function steps() {
	stepOfSword += 0.5;
}

function spinUp() {
// Called when user presses the 'Spin >>' button on our webpage.
    ANGLE_STEP += 25; 
}

function spinDown() {
// Called when user presses the 'Spin <<' button
    ANGLE_STEP -= 25; 
}

function runStop() {
// Called when user presses the 'Run/Stop' button
    if(ANGLE_STEP*ANGLE_STEP > 1) {
        myTmp = ANGLE_STEP;
        ANGLE_STEP = 0;
    }
    else {
        ANGLE_STEP = myTmp;
    }
}

//===================Mouse and Keyboard event-handling Callbacks===================

function myMouseDown(ev, gl, canvas) {
//==============================================================================
// Called when user PRESSES down any mouse button;
// 									(Which button?    console.log('ev.button='+ev.button);   )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

//  Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
    var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
    var xp = ev.clientX - rect.left;   // x==0 at canvas left edge
    var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseDown(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
//	console.log('myMouseDown(CVV coords  ):  x, y=\t',x,',\t',y);
	if (xMclik == x && yMclik == y) {   // double-click
    doubleclick = true;
    HiltX = x;
    HiltY = y;
  }
	isDrag = true;  // set our mouse-dragging flag
	xMclik = x;  // record where mouse-dragging began
	yMclik = y;
};


function myMouseMove(ev, gl, canvas) {
//==============================================================================
// Called when user MOVES the mouse with a button already pressed down.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

	if(isDrag==false) return;				// IGNORE all mouse-moves except 'dragging'

	// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
    var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
    var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseMove(pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
//	console.log('myMouseMove(CVV coords  ):  x, y=\t',x,',\t',y);

	// find how far we dragged the mouse:
	xMdragTot += (x - xMclik);					// Accumulate change-in-mouse-position,&
	yMdragTot += (y - yMclik);
	xMclik = x;													// Make next drag-measurement from here.
	yMclik = y;
};

function myMouseUp(ev, gl, canvas) {
//==============================================================================
// Called when user RELEASES mouse button pressed previously.
// 									(Which button?   console.log('ev.button='+ev.button);    )
// 		ev.clientX, ev.clientY == mouse pointer location, but measured in webpage 
//		pixels: left-handed coords; UPPER left origin; Y increases DOWNWARDS (!)  

// Create right-handed 'pixel' coords with origin at WebGL canvas LOWER left;
    var rect = ev.target.getBoundingClientRect();	// get canvas corners in pixels
    var xp = ev.clientX - rect.left;									// x==0 at canvas left edge
	var yp = canvas.height - (ev.clientY - rect.top);	// y==0 at canvas bottom edge
//  console.log('myMouseUp  (pixel coords): xp,yp=\t',xp,',\t',yp);
  
	// Convert to Canonical View Volume (CVV) coordinates too:
    var x = (xp - canvas.width/2)  / 		// move origin to center of canvas and
  						 (canvas.width/2);			// normalize canvas to -1 <= x < +1,
	var y = (yp - canvas.height/2) /		//										 -1 <= y < +1.
							 (canvas.height/2);
	console.log('myMouseUp  (CVV coords  ):  x, y=\t',x,',\t',y);
	
	isDrag = false;											// CLEAR our mouse-dragging flag, and
	// accumulate any final bit of mouse-dragging we did:
	xMdragTot += (x - xMclik);
	yMdragTot += (y - yMclik);
	console.log('myMouseUp: xMdragTot,yMdragTot =',xMdragTot,',\t',yMdragTot);
};


function myKeyDown(ev) {
    switch (ev.keyCode) {
        case 65:// a
            console.log('left-arrow');
			if(stepOfSword > 0.009 && lengthOfHexahedron <= 0.1) {  //  Limit the range of the 
				stepOfSword -= 0.01;
			}
            break;
        case 87: // w
            console.log('upper-arrow');
			if(stepOfSword > 0.04) {
				lengthOfHexahedron += 0.1;
			}		
            break;
        case 68:// d
            console.log('right-arrow');
            stepOfSword += 0.01;
            break;
        case 83://s
            console.log('down-arrow');
			if(lengthOfHexahedron > 0.009) {
				lengthOfHexahedron -= 0.1;
			}
            break;
        case 83:
      if(ANGLE_STEP*ANGLE_STEP > 1) {
        myTmp = ANGLE_STEP;
        ANGLE_STEP = 0;
      }
      else {
        ANGLE_STEP = myTmp;
      }
      break;
        default:
            console.log("This key doesn't do anything!");
            break;
    }
}

function myKeyUp(ev) {
    //===============================================================================
    // Called when user releases ANY key on the keyboard; captures scancodes well
    console.log('myKeyUp()--keyCode=' + ev.keyCode + ' released.');
}