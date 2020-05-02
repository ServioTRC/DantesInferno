let renderer = null, 
scene = null, 
camera = null,
root = null
robotList = [],
robotListAnimators = [],
robotListAnimation = [],
robotListCruzado = [],
robotListDeathAnimators = [],
group = null,
orbitControls = null;
let CRUZO = "cruzo", MURIO = "murio", CORRIENDO = "corriendo";
let ROBOTS_NUM = 20;
let robot_actions = {};

let duration = 60 * 1000; // ms
let startTime = Date.now();
let currentTime = Date.now();
let resultGLTF;
let puntaje = 0;
let raycaster;
let mouse = new THREE.Vector2();
let loaded = false;

let floorUrl = "../images/grass_texture.jpg";

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
    // scene.fog = new THREE.Fog( 0x556A83, 0, 550 );

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 55, -350);
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    ambientLight = new THREE.AmbientLight ( 0xeeeeee );
    scene.add(ambientLight);

    // Create a texture map
    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(2, 2);

    let color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(5000, 5000, 100, 100);
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));

    mesh.rotation.x = -Math.PI / 2;
    mesh.position.y = -4.02;
    
    // Add the mesh to our group
    scene.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    window.addEventListener( 'resize', onWindowResize);
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );

    // Update the camera controller
    orbitControls.update();
}