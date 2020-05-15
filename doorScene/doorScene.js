let renderer = null, 
scene = null, 
camera = null,
controls;

let floorUrl = "../images/grass_texture.jpg";
let wolf, resultGLTF, wolfAnimations = {}, resultDoor, door, resultTree, tree;
let penguinObj, raycaster;
let mouse = new THREE.Vector2();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let blocker,  instructions;
let prevTime = performance.now();
let velocity, direction;

let currentTime = Date.now();
let torchLoaded = false, wolfLoaded = false, doorLoaded = false, bearLoaded = false, treesLoaded = false;
var door_snd = new Audio("../sounds/creaky_door.mp3");
let deltax_change, deltaz_change;
let loading = false;

var forest_snd = new Audio("../sounds/forest.wav");
forest_snd.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

function initPointerLock()
{
    blocker = document.getElementById( 'blocker' );
    instructions = document.getElementById( 'instructions' );

    controls = new THREE.PointerLockControls( camera, document.body );

    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
    } );
    
    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
    } );

    instructions.addEventListener( 'click', function () {
        controls.lock();
    }, false );

    scene.add( controls.getObject() );
}

async function loadGLTFWolf(scene)
{
    let gltfLoader = new THREE.GLTFLoader();
    let loader = promisifyLoader(gltfLoader);

    try
    {
        resultGLTF = await loader.load("../models/wolf/scene.gltf");
        resultGLTF.scene.children[0].name = "wolf";
        wolf = resultGLTF.scene.children[0];
        wolf.scale.set(200, 200, 200);
        wolf.position.y = 65;
        wolf.position.z = 900;
        wolf.position.x = 300;
        wolf.rotation.z -= Math.PI/2 - Math.PI/6;
        wolf.traverse(child =>{
            if(child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        resultGLTF.animations.forEach(element => {
            wolfAnimations[element.name] = new THREE.AnimationMixer( scene ).clipAction(element, wolf);
            wolfAnimations[element.name].play();
        });
        wolf.castShadow = true;
        wolf.receiveShadow = true;
        scene.add(wolf);
    }
    catch(err)
    {
        console.error(err);
    }
}

async function loadGLTFDoor(scene)
{
    let gltfLoader = new THREE.GLTFLoader();
    let loader = promisifyLoader(gltfLoader);

    try
    {
        let resultDoor = await loader.load("../models/hell_gate/scene.gltf");
        resultDoor.scene.children[0].name = "wolf";
        door = resultDoor.scene.children[0];
        door.scale.set(180, 180, 180);
        door.rotation.z += Math.PI;
        door.position.z = 1000;
        door.traverse(child =>{
            if(child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        door.castShadow = true;
        door.receiveShadow = true;
        scene.add(door);
    }
    catch(err)
    {
        console.error(err);
    }
}

function createScene(canvas) 
{    

    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    velocity = new THREE.Vector3();
    direction = new THREE.Vector3();
    
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Adding Milky Way Background
    scene.background = new THREE.TextureLoader().load("../images/stars.jpg");
    // scene.fog = new THREE.Fog( 0x556A83, 0, 550 );

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 55, -350);
    var geometry = new THREE.SphereGeometry( 0.3, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x407294} );
    var sphere = new THREE.Mesh( geometry, material );
    camera.add(sphere);
    sphere.position.set( 0, 0, -30 );
    // scene.add(sphere);
    scene.add(camera);

    // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a texture map
    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(2, 2);

    let color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(3000, 3000, 100, 100);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    
    // Add the mesh to our group
    scene.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    window.addEventListener( 'resize', onWindowResize);
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    raycaster = new THREE.Raycaster();
    initPointerLock();


    loadGLTFWolf(scene).then(() => {
        wolfLoaded = true;
    });
    loadGLTFDoor(scene).then(() => {
        doorLoaded = true;
    });
    createTrees(scene).then(() => {
        treesLoaded = true;
    });
    createTorchs(scene).then(() => {
        torchLoaded = true;
    });
    loadObjBear(scene, -300, 0, 900, Math.PI + Math.PI/6).then(() => {
        bearLoaded = true;
    });
}

async function createTrees(scene){
    let x, z;
    let backNfront = 10, laterals = 50;
    for(let i = 0; i < laterals; i++){
        x = Math.floor(Math.random() * 900) + 500;
        z = Math.floor(Math.random() * 2800) - 1400;
        await loadObjTree(scene, x, 0, z);
    }
    for(let i = 0; i < laterals; i++){
        x = Math.floor(Math.random() * -900) - 500;
        z = Math.floor(Math.random() * 2800) - 1400;
        await loadObjTree(scene, x, 0, z);
    }
    for(let i = 0; i < backNfront; i++){
        x = Math.floor(Math.random() * -1000) + 500;
        z = Math.floor(Math.random() * 200) + 1200;
        await loadObjTree(scene, x, 0, z);
    }
    for(let i = 0; i < backNfront; i++){
        x = Math.floor(Math.random() * -1000) + 500;
        z = Math.floor(Math.random() * -200) - 1200;
        await loadObjTree(scene, x, 0, z);
    }
}

async function createTorchs(scene){
    await loadObjTorch(scene, 300, -2, 0);
    await loadObjTorch(scene, -300, -2, 0);
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    if(wolfAnimations["04_Idle"])
        wolfAnimations["04_Idle"].getMixer().update(deltat * 0.001);
    if(torchLoaded)
        KF.update();
}

function removeLoading(){
    let blocker = document.getElementById( 'loading' );
    let instructions = document.getElementById( 'loading_text' );
    blocker.style.display = 'none';
    instructions.style.display = '';
    loading = true;
    forest_snd.play();
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    animate();

    if(!loading && torchLoaded && wolfLoaded && doorLoaded && bearLoaded && treesLoaded)
        removeLoading();

    if ( controls.isLocked === true && torchLoaded && wolfLoaded && doorLoaded && bearLoaded && treesLoaded) 
    {
        let time = performance.now();
        let delta = ( time - prevTime ) / 1000;

        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        direction.z = Number( moveForward ) - Number( moveBackward );
        direction.x = Number( moveRight ) - Number( moveLeft );

        direction.normalize();
        if ( moveForward || moveBackward ) velocity.z -= direction.z * 4000.0 * delta;
        if ( moveLeft || moveRight ) velocity.x -= direction.x * 4000.0 * delta;

        deltax_change = - velocity.x * delta;
        deltaz_change = - velocity.z * delta;
        if(camera.position.x + deltax_change * 3 > -1300 && camera.position.x + deltax_change * 3 < 1300 
            && camera.position.z + deltaz_change * 3 > -1300 && camera.position.z + deltaz_change * 3 < 1300){
            controls.moveRight(deltax_change);
            controls.moveForward(deltaz_change);
        }

        prevTime = time;
    }

    // Render the scene
    renderer.render( scene, camera );
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );
    if(!door)
        return;
    let intersects = raycaster.intersectObject( door, true );
    console.log(intersects);
    if(intersects.length > 0){
        console.log("intersects", intersects[0].distance);
        if(intersects[0].distance < 800)
            door_snd.currentTime=0;
            door_snd.play();
            door_snd.onended = function() {
                window.location = '../caronteScene/caronteScene.html'
            }; 
    }
}

function onKeyDown ( event )
{
    switch ( event.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = true;
            break;

        case 37: // left
        case 65: // a
            moveLeft = true; 
            break;

        case 40: // down
        case 83: // s
            moveBackward = true;
            break;

        case 39: // right
        case 68: // d
            moveRight = true;
            break;
    }

}

function onKeyUp( event ) {

    switch( event.keyCode ) {

        case 38: // up
        case 87: // w
            moveForward = false;
            break;

        case 37: // left
        case 65: // a
            moveLeft = false;
            break;

        case 40: // down
        case 83: // s
            moveBackward = false;
            break;

        case 39: // right
        case 68: // d
            moveRight = false;
            break;

    }
}
