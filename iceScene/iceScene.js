let renderer = null, 
scene = null, 
camera = null;

let floorUrl = "../images/ice.jpg";
let wolf, resultGLTF, wolfAnimations = {}, resultDoor, door, resultTree, tree;
let penguinObj, raycaster;
let mouse = new THREE.Vector2();


let currentTime = Date.now();

async function loadGLTFDoor(scene)
{
    let gltfLoader = new THREE.GLTFLoader();
    let loader = promisifyLoader(gltfLoader);

    try
    {
        let resultDoor = await loader.load("../models/hell_gate/scene.gltf");
        resultDoor.scene.children[0].name = "door";
        door = resultDoor.scene.children[0];
        door.scale.set(100, 100, 100);
        door.position.z = -1800;
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
    // scene.fog = new THREE.Fog( 0x556A83, 0, 550 );

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 55, -350);
    var geometry = new THREE.SphereGeometry( 0.3, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0xffff00} );
    var sphere = new THREE.Mesh( geometry, material );
    camera.add(sphere);
    sphere.position.set( 0, 0, -30 );

    var spotLight = new THREE.SpotLight( 0xffffff, 5, 500, Math.PI);
    spotLight.position.copy( sphere.position );
    spotLight.castShadow = true;
    spotLight.shadow.camera.near = 500;
    spotLight.shadow.camera.far = 4000;
    spotLight.shadow.camera.fov = 30;
    spotLight.target = sphere;
    camera.add(spotLight);
    scene.add(camera);

    var light = new THREE.AmbientLight( 0xffffff );
    scene.add(light);

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

    loadGLTFDoor(scene);
    // loadObjCthulu(scene, 0, -250, -1200, 0);
    // createTorchs(scene);
    // loadObjIcebergs(scene);
    // createGargoyles(scene);
}
    
function loadObjIcebergs(scene){
    let x, z;
    for(let i = 0; i < 30; i++){
        x = Math.floor(Math.random() * 5000) - 2500;
        z = Math.floor(Math.random() * 5000) - 2500;
        loadObjIceberg(scene, x, 0, z);
    }
}

function createTorchs(scene){
    loadObjTorch(scene, 300, -2, 0);
    loadObjTorch(scene, -300, -2, 0);
}

function createGargoyles(scene){
    loadObjGargoyle(scene, -2700, 0, -2700, Math.PI/4);
    for(let i = -2200; i < 2700; i += 500){
        loadObjGargoyle(scene, i, 0, -2700, 0);
    }
    loadObjGargoyle(scene, 2700, 0, -2700, -Math.PI/4);


    loadObjGargoyle(scene, -2700, 0, 2700, Math.PI - Math.PI/4);
    for(let i = -2200; i < 2700; i += 500){
        loadObjGargoyle(scene, i, 0, 2700, Math.PI);
    }
    loadObjGargoyle(scene, 2700, 0, 2700, Math.PI + Math.PI/4);

    for(let i = -2200; i < 2700; i += 500){
        loadObjGargoyle(scene, -2700, 0, i, Math.PI - Math.PI/2);
    }

    for(let i = -2200; i < 2700; i += 500){
        loadObjGargoyle(scene, 2700, 0, i, Math.PI + Math.PI/2);
    }

}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
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