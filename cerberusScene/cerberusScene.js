let renderer = null, 
scene = null, 
camera = null;

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
let gong_scene, gong_clicked;
let cerberus_loaded;
let loaded_torches, door_loaded, monsters_loaded;
let loading = false;

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
    // scene.fog = new THREE.Fog( 0x556A83, 0, 550 );

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 55, -350);
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

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
    raycaster = new THREE.Raycaster();

    createTorchs(scene).then(()=>{
        loaded_torches = true;
    });
    loadObjGong(scene, 0, 0, 2500, Math.PI/2).then((gong)=>{
        gong_scene = gong;
    });
    loadGLTFDoor(scene).then(()=>{
        door_loaded = true;
    });
    createAllMonsters(scene).then(()=>{
        monsters_loaded = true;
    });
    loadObjCerberus(scene, 2500, 0, 2000, -Math.PI/2, Math.PI/2).then((cerberus)=>{
        cerberus_loaded = cerberus;
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

async function createTorchs(scene){
    await loadObjTorch(scene, 1000, -2, 0);
    await loadObjTorch(scene, -1000, -2, 0);
    await loadObjTorch(scene, 0, -2, 1000);
    await loadObjTorch(scene, 0, -2, -1000);
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    KF.update();
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    animate();

    if(!loading && gong_scene && loaded_torches && door_loaded && monsters_loaded && cerberus_loaded)
        removeLoading();
    
    // Render the scene
    renderer.render( scene, camera );
    
    // Update the camera controller
    orbitControls.update();
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

// TODO
// Agregar personajes
// Cambiar controles
// Animación de cerberus que se mueve y del gong que desaparece