"use strict";

import * as THREE from 'https://unpkg.com/three@0.120.0/build/three.module.js';


let container;      	        // keeping here for easy access
let scene, camera, renderer;    // Three.js rendering basics.
let ray;                        // A yellow "ray" from the barrel of the gun.
let rayVector;                  // The gun and the ray point from (0,0,0) towards this vector
let ground;

let player, target, head, armLeft, armRight, legLeft, legRight;       //player model

let flip = false;
let rotX = 0;
let rotXTheta = 0.01;
let transY = 0.006;
let transZ = -.015;


let torch;                      //torch model (set as a single torch first)
let headBBoxHelper, headBBox;
let walls = [];                 //used for checking wall collisions

let collision = 0;
let cameraControls;
let overview = false;
let mousePos;
let rot = Math.PI / 45;

/**
 *  Creates the bouncing balls and the translucent cube in which the balls bounce,
 *  and adds them to the scene.  A light that shines from the direction of the
 *  camera's view is also bundled with the camera and added to the scene.
 */


function createWorld()
{
    renderer.setClearColor( 0 );  // black background
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(20, window.innerWidth/window.innerHeight, 1, 1000);

    /* Add the camera and a light to the scene, linked into one object. */
    let light = new THREE.DirectionalLight();
    light.position.set( 0, 0, 1);

    // camera.add(light);
    scene.add(new THREE.DirectionalLight(0x808080));

    ground = new THREE.Mesh(
        new THREE.PlaneGeometry(200, 200),
        new THREE.MeshLambertMaterial({
            color: "white",
            map: makeTexture("resources/spookyGround.png")
        })
    );

    ground.rotation.x = -Math.PI/2;
    ground.position.y = -1;
    scene.add(ground);

    player = playerCreation();
    torch = torchCreation();

    /* Attach camera to a new 3D mesh to track the player */
    target = new THREE.Object3D;  // Could be used to track/follow the player 

    // Camera distance controls
    camera.position.set(0, 5, 80);
    camera.rotation.x = -Math.PI/10; //camera looks down a bit
    camera.lookAt( 0, 3, 0 );
    head.add(target);
    head.add(camera);
  
    /* Setup head BBOx for collision detection.  Will likely need addition boxes for smaller objects unless floating. */
    headBBoxHelper = new THREE.BoxHelper(head, 'white');
    scene.add(headBBoxHelper)
    headBBox = new THREE.Box3().setFromObject(headBBoxHelper);

    createOuterWalls();
    createHorizontalWalls();

    const loader = new THREE.CubeTextureLoader();
    const texture = loader.load([
        'resources/skybox/posx.jpg',
        'resources/skybox/negx.jpg',
        'resources/skybox/posy.jpg',
        'resources/skybox/negy.jpg',
        'resources/skybox/posz.jpg',
        'resources/skybox/negz.jpg',
    ]);
    scene.background = texture;
    
    //modelMovement();

} // end createWorld



/**
 * Adds a boundary wall around the outside
 */
function createOuterWalls()
{
    // Overview for testing purposes
    changeCamera();
    // Material that the rest are cloned off of
    let g = new THREE.BoxGeometry(40, 20, 1);
    let m = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
    let c1 = new THREE.Mesh(g, m);
    c1.position.z = -20;
    // scene.add(c1);
    // walls.push(c1);

    // Clone all boundaries off that boundary
    let northBoundary = c1.clone();
    northBoundary.position.z = -100;
    northBoundary.scale.x = 5;
    northBoundary.scale.y = 1;
    northBoundary.scale.z = 1;
    scene.add(northBoundary);
    walls.push(northBoundary);

    let southBoundary = northBoundary.clone();
    southBoundary.position.z = 100;
    scene.add(southBoundary);
    walls.push(southBoundary);

    let eastBoundary = northBoundary.clone();
    eastBoundary.position.x = 100;
    eastBoundary.position.z = 0;
    eastBoundary.rotateY(Math.PI/2);
    scene.add(eastBoundary);
    walls.push(eastBoundary);

    let westBoundary = eastBoundary.clone();
    westBoundary.position.x = -100;
    scene.add(westBoundary);
    walls.push(westBoundary)

    let test = c1.clone();
    test.position.z = -85;
    test.position.x = -80;
    scene.add(test);
    walls.push(test);
}


function createHorizontalWalls()
{
    // Material to clone into all wall shapes
    // let g = new THREE.BoxGeometry(10, 20, 3);
    // let m = new THREE.MeshBasicMaterial( {color: 0x00ff00} )\

    let v = getWall(); v.rotateY(Math.PI/0);
    v.position.x = -50;
    v.position.z = -85;
    v.scale.x = 3;
    addWall(v);

    let h1 = getWall();
    h1.position.x = -77
    h1.position.z = -72;
    h1.scale.x = 3;
    addWall(h1);

    let h2 = getWall();
    h2.position.x = -56;
    h2.position.z = -57;
    h2.scale.x = 9;
    addWall(h2);

    let h3 = getWall();
    h3.position.x = 33;
    h3.position.z = -85;
    h3.scale.x = 10;
    addWall(h3);
    
    let v1 = getWall(); v1.rotateY(Math.PI/2);
    v1.position.x = -34;
    v1.position.z = -74;
    v1.scale.x = 3;
    addWall(v1);

    let h4 = getWall();
    setWall(h4, 27, -72);
    h4.scale.x = 9;

    let v2 = getWall();
    setWall(v2, 39, -31, true)
    v2.scale.x = 11

    let h5 = getWall();
    setWall(h5, 23, -30); 
    h5.scale.x = 15;

    let v3 = getWall();
    setWall(v3, 69, -53, true);
    v3.scale.x = 1.5;

    let v4 = getWall();
    setWall(v4, 14, -55, true);
    v4.scale.x = 3;

    let v5 = getWall();
    setWall(v5, -78, -25, true);
    v5.scale.x = 4.5;
    
    let v6 = getWall();
    setWall(v6, -18, -13, true);
    v6.scale.x = 3
}



/**
 * The following 3 functions are helper functions we implemented once it was clear
 * the best way to create a maze in a short amount of time is to hand pick the coordinates
 */
function setWall(w, x, z, rotate=false)
{
    // Set wall to scene with the given coords
    w.position.x = x;
    w.position.z = z;

    // Check for rotation
    if (rotate) w.rotateY(Math.PI/2);


    addWall(w);
}


function getWall()
{
    // Returns a basic wall object
    let g = new THREE.BoxGeometry(10, 20, 3);
    let m = new THREE.MeshBasicMaterial( {color: 0x00ff00} )
    return new THREE.Mesh(g, m);
}


function addWall(wall)
{
    // Adds the wall to the scene and the array holding the walls
    scene.add(wall);
    walls.push(wall);
}


/**
 * This is the function used to create the player model
 */
function playerCreation()
{
    //player head
    const headWidth = 2;
    const headHeight = 2;
    const headDepth = 2;
    const headGeometry = new THREE.BoxGeometry( headWidth, headHeight, headDepth);

    const headMaterial = new THREE.MeshPhongMaterial ( {color: 0xDB1E62} );

    head = new THREE.Mesh(headGeometry, headMaterial);
    scene.add(head);
    head.position.y = 7;

    //player body
    const bodyWidth = 3;
    const bodyHeight = 4;
    const bodyDepth = 1;

    const bodyGeometry = new THREE.BoxGeometry( bodyWidth, bodyHeight, bodyDepth );
    const bodyMaterial = new THREE.MeshPhongMaterial ( {color: 0xDB1E62} );

    let body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    head.add(body);
    body.position.y = -3;

    //arms
    const armWidth = 1;
    const armHeight = 4;
    const armDepth = 1;

    //need double because with the matrix they modify both limbs when adjusting
    //the matrices so we can have control over each individual arm.
    let armRightGeometry = new THREE.BoxGeometry( armWidth, armHeight, armDepth );
    let armRightMaterial = new THREE.MeshPhongMaterial ( {color: 0xDB1E62} );

    let armLeftGeometry = new THREE.BoxGeometry( armWidth, armHeight, armDepth );
    let armLeftMaterial = new THREE.MeshPhongMaterial ( {color: 0xDB1E62} );

    armLeft = new THREE.Mesh(armLeftGeometry, armLeftMaterial);
    armRight = new THREE.Mesh(armRightGeometry, armRightMaterial);

    body.add(armLeft);
    armLeft.position.x = -1.5;
    body.add(armRight);
    armRight.position.x = 1.5;

    //legs
    const legWidth = 1.3;
    const legHeight = 4;
    const legDepth = 1;

    let legGeometry = new THREE.BoxGeometry( legWidth, legHeight, legDepth );
    let legMaterial = new THREE.MeshPhongMaterial ( {color: 0xDB1E62} );

    legLeft = new THREE.Mesh(legGeometry, legMaterial);
    legRight = new THREE.Mesh(legGeometry, legMaterial);

    body.add(legLeft);
    legLeft.position.y = -3;
    legLeft.position.x = 0.75;

    body.add(legRight);
    legRight.position.y = -3;
    legRight.position.x = -0.75;

}//end of playerCreation

function modelMovement()
{
    //rotation x of the right arm
     let armMatrix = new THREE.Matrix4();

if(rotX <= 1 && flip == false) {
    // console.log("rotX = " +rotX);
    // console.log("flip = "+flip);
    armMatrix.set(
        1, 0, 0, 0,
        0, Math.cos(-rotXTheta), Math.sin(-rotXTheta), 0,
        0, -1 * (Math.sin(-rotXTheta)), Math.cos(-rotXTheta), 0,
        0, 0, 0, 1
    );

    armRight.geometry.applyMatrix4(armMatrix);
    armRight.geometry.verticesNeedUpdate = true;
    rotX += rotXTheta;

        //now for the translations to appear connected
        //specifically the y and z translations
        armMatrix.set(
            1, 0, 0, 0, //d messes with x translation
            0, 1, 0,transY, //h messes with y translation
            0, 0, 1, transZ, //p messes with z translation
            0, 0,0,1

        );

        armRight.geometry.applyMatrix4(armMatrix);
        armRight.geometry.verticesNeedUpdate = true;

    if(rotX > 1)
    {
        rotXTheta *= -1;
        transY *= -1;
        transZ *= -1;
        flip = true;
        // console.log("flip = "+flip);
    }
}else if(rotX >= -1 && flip == true)
{
    armMatrix.set(
        1, 0, 0, 0,
        0, Math.cos(-rotXTheta), Math.sin(-rotXTheta), 0,
        0, -1 * (Math.sin(-rotXTheta)), Math.cos(-rotXTheta), 0,
        0, 0, 0, 1
    );

    armRight.geometry.applyMatrix4(armMatrix);
    armRight.geometry.verticesNeedUpdate = true;
    rotX += rotXTheta;

    //now for the translations to appear connected
    //specifically the y and z translations
    armMatrix.set(
        1, 0, 0, 0, //d messes with x translation
        0, 1, 0,transY, //h messes with y translation
        0, 0, 1, transZ, //p messes with z translation
        0, 0,0,1

    );

    armRight.geometry.applyMatrix4(armMatrix);
    armRight.geometry.verticesNeedUpdate = true;

    if(rotX < -1)
    {
        rotXTheta *= -1;
        transY *= -1;
        transZ *= -1;
        flip = false;
        // console.log("Flip = "+flip);
    }
}
    //armRight.position.y = .6;
    //armRight.position.z = -1.5;

}

function torchCreation()
{
    const handleWidth = 0.5;
    const handleHeight = 3.5;
    const handleDepth = 0.5;

    const handleGeometry = new THREE.BoxGeometry( handleWidth, handleHeight, handleDepth);
    const handleMaterial = new THREE.MeshPhongMaterial ( {color: 0x6F4E16} );

    let handle = new THREE.Mesh(handleGeometry, handleMaterial);

    scene.add(handle);
    handle.position.z = 10;

    const cubeWidth = 1;
    const cubeHeight = 1;
    const cubeDepth = 1;

    const flameGeometry = new THREE.BoxGeometry( cubeWidth, cubeHeight, cubeDepth);
    const flameRedMaterial = glowRedShader();

    let flameRed = new THREE.Mesh(flameGeometry, flameRedMaterial);
    handle.add(flameRed);

    const flameYellMaterial = glowYellowShader();
    let flameYell = new THREE.Mesh(flameGeometry, flameYellMaterial);
    handle.add(flameYell);

    flameYell.position.y = 1.75;
    flameYell.rotation.y = 3*(Math.PI)/2;
    flameYell.rotation.x = Math.sin(2);
    flameYell.rotation.z = -Math.sin(2);
    flameRed.position.y = 1.75;

}

function glowRedShader()
{
    let     vShader = document.getElementById('vGlow').innerHTML;
    let     fShader = document.getElementById('fGlow').innerHTML;
    let     itemMaterial = new THREE.ShaderMaterial({
        uniforms:
            {

                "c": {type: "f", value: 1.0},
                "p": {type: "f", value: 1.4},
                glowColor:{type: "c", value: new THREE.Color(0xF35A31)},
                vVector:{type: "v3", value: camera.position},

            },

        vertexShader:   vShader,
        fragmentShader: fShader,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,

    });

    return itemMaterial;

}

function glowYellowShader()
{
    let     vShader = document.getElementById('vGlow').innerHTML;
    let     fShader = document.getElementById('fGlow').innerHTML;
    let     itemMaterial = new THREE.ShaderMaterial({
        uniforms:
            {

                "c": {type: "f", value: 1.0},
                "p": {type: "f", value: 1.4},
                glowColor:{type: "c", value: new THREE.Color(0xE2EF17)},
                vVector:{type: "v3", value: camera.position},

            },

        vertexShader:   vShader,
        fragmentShader: fShader,
        side: THREE.FrontSide,
        blending: THREE.AdditiveBlending,
        transparent: true,

    });

    return itemMaterial;

}
/**
 * Checks for collisions against the walls of the maze by preventing movements
 * into walls.  If any collisions are detected from 0.5 z in FRONT of the head,
 * it returns true and the movement key will automatically "bounce" the player
 * in the opposite direction. 
 * 
 * Note: we need to check as if the player has already moved to prevent clipping
 *       INTO the wall by adding one to the length of the ray angle 
 */
function checkWallCollisions(rev=false)
{
    // Create the head pos and "predict" its next location
    let headPos = head.position.clone();

    // Loop through the head's vertices -> also covers backwards movement prediction
    for (let i = 0; i < head.geometry.vertices.length; i++)
    {
        // Create the raycasting angles and the raycaster
        let localPos = head.geometry.vertices[i].clone();
        let globalAngle = localPos.applyMatrix4(head.matrix);
        let rayAngle = globalAngle.sub(head.position);

        // Get any collisions
        let raycaster = new THREE.Raycaster(headPos, rayAngle.clone().normalize());
        let collisions = raycaster.intersectObjects(walls);

        // Check if the the collision is TOUCHING the actual wall (or less)
        if (collisions.length > 0)
        {
            if (collisions[0].distance < rayAngle.length() + 2)
            {
                return true;
            }
        }
    }
}


/**
 *  When an animation is in progress, this function is called just before rendering each
 *  frame of the animation.
 */
function updateForFrame()
{
    let time = clock.getElapsedTime(); // time, in seconds, since clock was created
    let timeFloor = Math.floor(time); //for testing timer going up
    let timeCeiling = Math.ceil(time); //for the count down

    /**
     * For this section this is where we are going transfer
     * time left in the game/progression to the player
     * so that they can see a count down
     **/

    document.getElementById("timeLeft").innerHTML = "" + timeFloor;
    document.getElementById("collected").innerHTML = "" + collision;
}


/**
 *  Render the scene.  This is called for each frame of the animation, after updating
 *  the position and velocity data of the balls.
 */
function render()
{
    renderer.render(scene, camera);
}


/**
 *  Creates and returns a Texture object that will read its image from the
 *  specified URL. If the second parameter is provided, the texture will be
 *  applied to the material when the
 */
function makeTexture( imageURL, material )
{
    function callback()
    {
        if (material) {
            material.map = texture;
            material.needsUpdate = true;
        }
        // not necessary to call render() since the scene is continually updating.
    }
    let loader = new THREE.TextureLoader();
    let texture = loader.load(imageURL, callback);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat = new THREE.Vector2(10,10);
    texture.anisotropy = renderer.getMaxAnisotropy();
    return texture;
}


function changeCamera() 
{
    if (overview)
    {
        overview = false;
        camera.position.set(0, 5, 80);
        camera.rotation.x = -Math.PI/10; //camera looks down a bit
        camera.lookAt( 0, 3, 0 )
    }
    else
    {
        overview = true;
        camera.position.set(0, 600, 0);
        camera.lookAt(0, 0, 0);
    }
}


//----------------------------- mouse and key support -------------------------------

// Prints mouse click locations in the top down view
function doMouseDown(event)
{
    let mouse = {x: 0, y: 0};
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    let raycaster = new THREE.Raycaster();
    raycaster.setFromCamera( mouse, camera );
    let point = raycaster.intersectObjects( [ground] );
    for (let i = 0; i < point.length; i++)
    {
        console.log(point[i].point)
    }
}


function doMouseMove(evt)
{
/*
    let fn = "[doMouseMove]: ";
    console.log( fn )    let x = evt.clientX;
    let y = evt.clientY;
    // mouse was moved to (x,y)
    let rotZ = 5*Math.PI/6 * (window.innerWidth/2 - x)/window.innerWidth;
    let rotX = 5*Math.PI/6 * (y - window.innerHeight/2)/window.innerHeight;
    let rcMatrix = new THREE.Matrix4(); // The matrix representing the gun rotation,
    rayVector = new THREE.Vector3(0,1,0);  // Untransformed rayVector
    rayVector.applyMatrix4(rcMatrix);  // Apply the rotation matrix
    ray.geometry.vertices[1].set(rayVector.x*100,rayVector.y*100,rayVector.z*100);
    ray.geometry.verticesNeedUpdate = true;
*/
}


function doKeyDown( event )
{
    // let fn = "[doKeyDown]: ";
    // console.log( fn + "Key pressed with code " + event.key );
    // https://www.cambiaresearch.com/articles/15/javascript-char-codes-key-codes

    //this will be for movement of player model
    const code = event.key;
    // console.log("Key pressed with code " + code);
    if( code === 'a' || code === 'ArrowLeft' )           // 'a' and 'left arrow'
    {
        head.rotateY(rot);
        headBBoxHelper.update();
    }
    else if( code === 'd' || code === 'ArrowRight' )     // 'd' and 'right arrow'
    {
        head.rotateY(-rot);
        headBBoxHelper.update();
    }
    /* These alter how close you can get to the maze */
    else if (code == 'w' || code == 'ArrowUp')
    {
        // if (checkWallCollisions(0, 0, -1.50) || checkWallCollisions(1.50, 0, 0) || checkWallCollisions(-1.50, 0, 0))
        if (checkWallCollisions())
        {
            for (let i = 0 ; i < 20; i++)
            {
                head.translateZ(0.10);
            }
        }
        else 
        {
            head.translateZ(-1);
        }
    }
    else if (code == 'q')
    {
        if (checkWallCollisions())
        {
            for (let i = 0 ; i < 5; i++)
            {
                head.translateZ(0.05);
            }
        }
        else 
        {
            head.translateZ(-2);
        }
    }
    else if (code == '=')
    {
        changeCamera();
    }
    else if (code == 's' || code == 'ArrowDown')
    {    
        if (checkWallCollisions())
        {
            for (let i = 0; i < 20; i++)
                head.translateZ(-0.10);
        }
        else 
        {
            head.translateZ(1);
        }
    }

}

//--------------------------- animation support -----------------------------------

let clock;  // Keeps track of elapsed time of animation.

function doFrame()
{
    updateForFrame();
    // checkWallCollisions();
    modelMovement();

    render();
    requestAnimationFrame(doFrame);
}

//----------------------- respond to window resizing -------------------------------

/* When the window is resized, we need to adjust the aspect ratio of the camera.
 * We also need to reset the size of the canvas that used by the renderer to
 * match the new size of the window.
 */
function doResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); // Need to call this for the change in aspect to take effect.
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function createRenderer()
{
    //renderer = new THREE.WebGLRenderer();
    renderer = new THREE.WebGLRenderer( { antialias: true } );
    // we set this according to the div container.
    renderer.setSize( container.clientWidth, container.clientHeight );
    renderer.setClearColor( 0x000000, 1.0 );
    container.appendChild( renderer.domElement );  // adding 'canvas; to container here
    // render, or 'create a still image', of the scene
}

//----------------------------------------------------------------------------------

/**
 *  This init() function is called when by the onload event when the document has loaded.
 */
function init()
{
    container = document.querySelector('#scene-container');

    // Create & Install Renderer ---------------------------------------
    createRenderer();
    mousePos = new THREE.Vector2();


    window.addEventListener( 'resize', doResize );  // Set up handler for resize event
    document.addEventListener("keydown",doKeyDown);
    window.addEventListener(    "mousedown",doMouseDown );
    window.addEventListener(    "mousemove",doMouseMove );

    createWorld();

    clock = new THREE.Clock(); // For keeping time during the animation.


    requestAnimationFrame(doFrame);  // Start the animation.

}

init()

