let renderer = null, 
scene = null, 
camera = null;

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let blocker,  instructions;
let prevTime = performance.now();
let velocity, direction;

let floorUrl = "../images/lava_floor.jpg";
let wolf, resultGLTF, wolfAnimations = {}, resultDoor, door, resultTree, tree;
let penguinObj, raycaster;
let mouse = new THREE.Vector2();
var door_snd = new Audio("../sounds/creaky_door.mp3");
var gong_snd = new Audio("../sounds/gong.mp3");
var fire_snd = new Audio("../sounds/fire-forest.wav");
var bark_snd = new Audio("../sounds/barks.wav");
fire_snd.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);
let gong_scene, gong_clicked, gong_animator;
let cerberus_loaded, cerberus_animator;
let loaded_torches, door_loaded, monsters_loaded;
let loading = false;
let deltax_change, deltaz_change;

let currentTime = Date.now();

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
        door.position.y = 0;
        door.position.x = 2500;
        door.position.z = 2500;
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
    
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Adding Milky Way Background
    scene.background = new THREE.TextureLoader().load("../images/Volcano-eruption.jpg");

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 55, -350);
    var geometry = new THREE.SphereGeometry( 0.3, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x407294} );
    var sphere = new THREE.Mesh( geometry, material );
    camera.add(sphere);
    sphere.position.set( 0, 0, -30 );
    scene.add(camera);

    velocity = new THREE.Vector3();
    direction = new THREE.Vector3();

    initPointerLock(scene, camera);
    // Descomentar y comentar pointerlock
    // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a texture map
    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;

    let color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(6000, 6000, 100, 100);
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

    createTorchsAndPhotos(scene).then(()=>{
        loaded_torches = true;
    });
    loadObjGong(scene, 0, 0, 2500, Math.PI/2).then((gong)=>{
        gong_scene = gong;
        movingBelowAnimator(gong).then((animator)=>{
            gong_animator = animator;
        });
    });
    loadGLTFDoor(scene).then(()=>{
        door_loaded = true;
    });
    createAllMonsters(scene).then(()=>{
        monsters_loaded = true;
    });
    loadObjCerberus(scene, 2500, 0, 2000, -Math.PI/2, Math.PI/2).then((cerberus)=>{
        cerberus_loaded = cerberus;
        movingForwardAnimator(cerberus).then((cerb_animator)=>{
            cerberus_animator = cerb_animator;
        });
    });
}

async function createAllMonsters(){
    await loadObjRockMoster(scene, 0, 0, -2500, 0);
    await loadObjMonster(scene, 1500, 0, -2500, 0);
    await loadObjMonster(scene, -1500, 0, -2500, 0);

    await loadObjRockMoster(scene, 0, 0, 2500, Math.PI);
    await loadObjMonster(scene, 1500, 0, 2500, Math.PI);
    await loadObjMonster(scene, -1500, 0, 2500, Math.PI);

    await loadObjRockMoster(scene, 2500, 0, 0, -Math.PI/2);
    await loadObjMonster(scene, 2500, 0, -1500, -Math.PI/2);

    await loadObjRockMoster(scene, -2500, 0, 0, Math.PI/2);
    await loadObjMonster(scene, -2500, 0, -1500, Math.PI/2);
    await loadObjMonster(scene, -2500, 0, 1500, Math.PI/2);
}

async function createTorchsAndPhotos(scene){
    await loadObjTorch(scene, 1000, -2, 0);
    await loadObjTorch(scene, -1000, -2, 0);
    await loadObjTorch(scene, 0, -2, 1000);
    await loadObjTorch(scene, 0, -2, -1000);

    await addPhotoElement(scene, "../images/characters/secondEigthCircle/ciacco.png", 0, 75, -2000, 0);
    await addPhotoElement(scene, "../images/characters/secondEigthCircle/cleopatra.png", 0, 75, 2000, Math.PI);
    await addPhotoElement(scene, "../images/characters/secondEigthCircle/elisa.png", 2000, 75, 0, -Math.PI/2);
    await addPhotoElement(scene, "../images/characters/secondEigthCircle/erinias.png", -2000, 75, 0, Math.PI/2);

    await addPhotoElement(scene, "../images/characters/secondEigthCircle/esposa_putifar.png", 1000, 75, 1000, Math.PI+Math.PI/4);
    await addPhotoElement(scene, "../images/characters/secondEigthCircle/farinata.png", -1000, 75, 1000, Math.PI-Math.PI/4);
    await addPhotoElement(scene, "../images/characters/secondEigthCircle/filippo.png", 1000, 75, -1000, -Math.PI/4);
    await addPhotoElement(scene, "../images/characters/secondEigthCircle/medusa.png", -1000, 75, -1000, Math.PI/4); //

    await addPhotoElement(scene, "../images/characters/secondEigthCircle/pier.png", 0, 75, 500, Math.PI);
    await addPhotoElement(scene, "../images/characters/secondEigthCircle/pluto.png", 0, 75, -500, 0);
}

function animate() {
    KF.update();
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    animate();

    if(!loading && gong_scene && loaded_torches && door_loaded && monsters_loaded && cerberus_loaded && gong_animator && cerberus_animator)
        removeLoading();
    
    // Render the scene
    renderer.render( scene, camera );
    
    // COMENTAR FUNCIÓN PARA ORBIT
    if ( controls.isLocked === true && loading) 
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
        if(camera.position.x + deltax_change * 3 > -2800 && camera.position.x + deltax_change * 3 < 2800 
            && camera.position.z + deltaz_change * 3 > -2800 && camera.position.z + deltaz_change * 3 < 2800){
            controls.moveRight(deltax_change);
            controls.moveForward(deltaz_change);
        }

        prevTime = time;
    }

    // Update the camera controller
    // DESCOMENTAR
    // orbitControls.update();
}

function removeLoading(){
    let blocker = document.getElementById( 'loading' );
    let instructions = document.getElementById( 'loading_text' );
    blocker.style.display = 'none';
    instructions.style.display = '';
    loading = true;
    fire_snd.play();
}

function onDocumentMouseDown(event)
{
    event.preventDefault();
    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );
    let intersects;
    intersects = raycaster.intersectObject( gong_scene, true );
    console.log(intersects);
    if(intersects.length > 0){
        console.log("intersects", intersects[0].distance);
        if(intersects[0].distance < 800){
            gong_snd.currentTime=0;
            gong_snd.play();
            gong_clicked = true;
            gong_snd.onended = function() {
                bark_snd.play();
                gong_animator.start();
                cerberus_animator.start();
            };
        }

    }
    intersects = raycaster.intersectObject( door, true );
    console.log(intersects);
    if(gong_clicked && intersects.length > 0){
        console.log("intersects", intersects[0].distance);
        if(intersects[0].distance < 800){
            door_snd.currentTime=0;
            door_snd.play();
            door_snd.onended = function() {
                window.location = '../iceScene/iceScene.html'
            };
        }
    }
}