let renderer = null, 
scene = null, 
camera = null;

let floorUrl = "../images/ice.jpg";
let wolf, resultGLTF, wolfAnimations = {}, resultDoor, door, resultTree, tree;
let penguinObj, raycaster;
let mouse = new THREE.Vector2();
let currentTime = Date.now();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let blocker,  instructions;
let prevTime = performance.now();
let velocity, direction;
let deltax_change, deltaz_change;
let brutus, cain, casio, judas, mordred;

let doorLoaded, gargoylesLoaded, cthuluLoaded, icebergsLoaded, loading = false, fireLoaded, penguinLoaded;

var door_snd = new Audio("../sounds/creaky_door.mp3");
var penguin_snd = new Audio("../sounds/penguin.wav");
var wind_snd = new Audio("../sounds/wind.mp3");
wind_snd.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

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
        door.rotation.z += Math.PI;
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

function removeLoading(){
    let blocker = document.getElementById( 'loading' );
    let instructions = document.getElementById( 'loading_text' );
    blocker.style.display = 'none';
    instructions.style.display = '';
    loading = true;
    wind_snd.play();
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
    
    velocity = new THREE.Vector3();
    direction = new THREE.Vector3();

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(0, 55, -350);
    camera.rotation.y += Math.PI;
    var geometry = new THREE.SphereGeometry( 0.3, 32, 32 );
    var material = new THREE.MeshBasicMaterial( {color: 0x407294} );
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

    fireColorAnimator(spotLight).then(()=>{
        fireLoaded = true;
    });

    // var light = new THREE.AmbientLight( 0xffffff );
    // scene.add(light);

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
    initPointerLock(scene, camera);

    loadGLTFDoor(scene).then(()=>{
        doorLoaded = true;
    });
    loadObjCthulu(scene, 0, -250, -1200, 0).then((cthulu) =>{
        cthuluLoaded = true;    
    });
    loadObjIcebergsAndPhotos(scene).then(()=>{
        icebergsLoaded = true;
    });
    createGargoyles(scene).then(()=>{
        gargoylesLoaded = true;
    });
    loadObjPenguin(scene).then((penguin)=>{
        penguinLoaded = true;
        penguinObj = penguin;
    });
}
    
async function loadObjIcebergsAndPhotos(scene){
    let x, z, rotation;
    for(let i = 0; i < 30; i++){
        x = Math.floor(Math.random() * 5000) - 2500;
        z = Math.floor(Math.random() * 5000) - 2500;
        await loadObjIceberg(scene, x, 0, z);
    }
    x = Math.floor(Math.random() * 5000) - 2500;
    z = Math.floor(Math.random() * 5000) - 2500;
    rotation = Math.random() * Math.PI;
    brutus = await addPhotoElementPhong(scene, "../images/characters/ninethCircle/brutus.png", x, 75, z, rotation);
    x = Math.floor(Math.random() * 5000) - 2500;
    z = Math.floor(Math.random() * 5000) - 2500;
    rotation = Math.random() * Math.PI;
    cain = await addPhotoElementPhong(scene, "../images/characters/ninethCircle/cain.png", x, 75, z, rotation);
    x = Math.floor(Math.random() * 5000) - 2500;
    z = Math.floor(Math.random() * 5000) - 2500;
    rotation = Math.random() * Math.PI;
    casio = await addPhotoElementPhong(scene, "../images/characters/ninethCircle/casio.png", x, 75, z, rotation);
    x = Math.floor(Math.random() * 5000) - 2500;
    z = Math.floor(Math.random() * 5000) - 2500;
    rotation = Math.random() * Math.PI;
    judas = await addPhotoElementPhong(scene, "../images/characters/ninethCircle/judas.png", x, 75, z, rotation);
    x = Math.floor(Math.random() * 5000) - 2500;
    z = Math.floor(Math.random() * 5000) - 2500;
    rotation = Math.random() * Math.PI;
    mordred = await addPhotoElementPhong(scene, "../images/characters/ninethCircle/mordred.png", x, 75, z, rotation);
}

async function createGargoyles(scene){
    await loadObjGargoyle(scene, -2700, 0, -2700, Math.PI/4);
    for(let i = -2200; i < 2700; i += 500){
        await loadObjGargoyle(scene, i, 0, -2700, 0);
    }
    await loadObjGargoyle(scene, 2700, 0, -2700, -Math.PI/4);


    await loadObjGargoyle(scene, -2700, 0, 2700, Math.PI - Math.PI/4);
    for(let i = -2200; i < 2700; i += 500){
        await loadObjGargoyle(scene, i, 0, 2700, Math.PI);
    }
    await loadObjGargoyle(scene, 2700, 0, 2700, Math.PI + Math.PI/4);

    for(let i = -2200; i < 2700; i += 500){
        await loadObjGargoyle(scene, -2700, 0, i, Math.PI - Math.PI/2);
    }

    for(let i = -2200; i < 2700; i += 500){
        await loadObjGargoyle(scene, 2700, 0, i, Math.PI + Math.PI/2);
    }

}

function animate() {
    KF.update();
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );
    animate();

    if(!loading && doorLoaded && gargoylesLoaded && cthuluLoaded && icebergsLoaded && fireLoaded && penguinLoaded)
        removeLoading();
    
    // COMENTAR FUNCIÓN PARA ORBIT
    if (!screen_locked && controls.isLocked === true && loading) 
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
        } else {
            if(camera.position.x < -2800){
                console.log("atorado en -x")
                camera.position.x += 100;
            } else if(camera.position.x > 2800){
                console.log("atorado en +x")
                camera.position.x -= 100;
            } else if(camera.position.z < -700){
                console.log("atorado en -z")
                camera.position.z += 100;
            } else if(camera.position.z > 2800){
                console.log("atorado en z")
                camera.position.z -= 100;
            }
        }

        prevTime = time;
    }

    // Update the camera controller
    // orbitControls.update();
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
    if(screen_locked)
        return;
    let intersects = raycaster.intersectObject( penguinObj, true );
    if(intersects.length > 0){
        penguin_snd.currentTime=0;
        penguin_snd.play();
    }
    intersects = raycaster.intersectObject( brutus, true );
    if(intersects.length > 0){
        window.open('https://es.wikipedia.org/wiki/Marco_Junio_Bruto', '_blank');
    }
    intersects = raycaster.intersectObject( cain, true );
    if(intersects.length > 0){
        window.open('https://es.wikipedia.org/wiki/Ca%C3%ADn', '_blank');
    }
    intersects = raycaster.intersectObject( casio, true );
    if(intersects.length > 0){
        window.open('https://es.wikipedia.org/wiki/Cayo_Casio_Longino', '_blank');
    }
    intersects = raycaster.intersectObject( judas, true );
    if(intersects.length > 0){
        window.open('https://es.wikipedia.org/wiki/Judas_Iscariote', '_blank');
    }
    intersects = raycaster.intersectObject( mordred, true );
    if(intersects.length > 0){
        window.open('https://es.wikipedia.org/wiki/Mordred', '_blank');
    }
    intersects = raycaster.intersectObject( door, true );
    if(intersects.length > 0){
        console.log("intersects", intersects[0].distance);
        if(intersects[0].distance < 800){
            door_snd.currentTime=0;
            door_snd.play();
            door_snd.onended = function() {
                window.location = '../finalScene/finalScene.html'
            };
        }
    }
}