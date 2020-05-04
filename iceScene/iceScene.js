let renderer = null, 
scene = null, 
camera = null;

let floorUrl = "../images/ice.jpg";
let wolf, resultGLTF, wolfAnimations = {}, resultDoor, door, resultTree, tree;
let penguinObj, raycaster;
let mouse = new THREE.Vector2();


let currentTime = Date.now();

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
    
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Adding Milky Way Background
    // scene.background = new THREE.TextureLoader().load("../images/stars.jpg");
    // scene.fog = new THREE.Fog( 0x556A83, 0, 550 );

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 55, -350);
    scene.add(camera);

    // var light = new THREE.AmbientLight( 0xffffff );
    // scene.add(light);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // Create a texture map
    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    // map.repeat.set(2);

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

    // loadGLTFWolf(scene);
    // loadGLTFDoor(scene);
    loadObjCthulu(scene, 0, 0, -500, 0);
    loadObjGargoyle(scene, 0, 0, 0);
    // createTrees(scene);
    loadObjIceberg(scene, 0, 0, 100);
    createTorchs(scene);
}

function createTorchs(scene){
    loadObjTorch(scene, 300, -2, 0);
    loadObjTorch(scene, -300, -2, 0);
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    if(wolfAnimations["04_Idle"])
        wolfAnimations["04_Idle"].getMixer().update(deltat * 0.001);
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );
    animate();
    // Update the camera controller
    orbitControls.update();
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
            window.location = '../finalScene/finalScene.html'
    }
}