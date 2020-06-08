let renderer = null, 
scene = null, 
camera = null;

let floorUrl = "../images/solid_magma.png";
let door, death, boat, boatAnimations = {}, boatTorch, boatTorchAnimation, fire, light;
let penguinObj, raycaster, mesh, uniforms;
let boat_death_torch_animator = new KF.KeyFrameAnimator;
let mouse = new THREE.Vector2();

let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;
let canJump = false;
let blocker,  instructions;
let prevTime = performance.now();
let velocity, direction;


var door_snd = new Audio("../sounds/creaky_door.mp3");
let currentTime = Date.now();
let duration = 20;
let created = false;
let euclides, homero, penthesileia, socrates, virgilio;

let boatLoaded, deathLoaded, doorLoaded, loading = false, torchesLoaded;
let boat_moved = false, finished = false;

var waves_snd = new Audio("../sounds/waves.wav");
waves_snd.addEventListener('ended', function() {
    this.currentTime = 0;
    this.play();
}, false);

function removeLoading(){
    let blocker = document.getElementById( 'loading' );
    let instructions = document.getElementById( 'loading_text' );
    blocker.style.display = 'none';
    instructions.style.display = '';
    loading = true;
    waves_snd.play();
    createBoatAnimator();
}

function createBoatAnimator(){
    boat_death_torch_animator.init({ 
        interps:
            [{ 
                keys:[0, 1], 
                values:[
                    {x: -2850, z: -2850},
                    {x: -670, z: -670},
                ],
                target:death.position
            },
            { 
                keys:[0, 1], 
                values:[
                    {x: -2800, z: -2800},
                    {x: -620, z: -620},
                ],
                target:boat.position
            },
            { 
                keys:[0, 1], 
                values:[
                    {x: -2800, z: -2800},
                    {x: -620, z: -620},
                ],
                target:camera.position
            }
        ],
        duration: duration * 1000,
    });
    created = true;
    boat_death_torch_animator.start();
    boat_moved = true;
}

async function loadGLTFBoat(scene, x, y, z, rotation)
{
    let gltfLoader = new THREE.GLTFLoader();
    let loader = promisifyLoader(gltfLoader);

    try
    {
        resultGLTF = await loader.load("../models/wooden_boat/boat.gltf");
        resultGLTF.scene.children[0].name = "boat";
        boat = resultGLTF.scene.children[0];
        boat.scale.set(25, 25, 25);
        boat.position.y = y;
        boat.position.z = z;
        boat.position.x = x;
        boat.rotation.z += rotation;
        boat.traverse(child =>{
            if(child.isMesh)
            {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        resultGLTF.animations.forEach(element => {
            boatAnimations[element.name] = new THREE.AnimationMixer( scene ).clipAction(element, boat);
            boatAnimations[element.name].play();
        });
        boat.castShadow = true;
        boat.receiveShadow = true;
        scene.add(boat);
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
    extra_finish = false;
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true, delta: true} );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Turn on shadows
    renderer.shadowMap.enabled = true;
    // Options are THREE.BasicShadowMap, THREE.PCFShadowMap, PCFSoftShadowMap
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    
    // Create a new Three.js scene
    scene = new THREE.Scene();
    // Adding Milky Way Background
    scene.background = new THREE.TextureLoader().load("../images/far_volcan.jpg");

    // Add a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 1, 10000 );
    camera.position.set(-2800, 100, -2800);
    camera.rotation.y -= Math.PI;
    var geometry = new THREE.SphereGeometry( 0.3, 32, 32 );
    var material_2 = new THREE.MeshBasicMaterial( {color: 0x407294} );
    var sphere = new THREE.Mesh( geometry, material_2 );
    camera.add(sphere);
    sphere.position.set( 0, 0, -30 );
    scene.add(camera);

    velocity = new THREE.Vector3();
    direction = new THREE.Vector3();

    // orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

    // var light = new THREE.AmbientLight( 0xffffff );
    // scene.add(light);

    // Create a texture map
    let map = new THREE.TextureLoader().load(floorUrl);
    map.wrapS = map.wrapT = THREE.RepeatWrapping;

    let color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(6000, 6000, 100, 100);
    let texture = new THREE.TextureLoader().load("../images/water_texture.jpg");
    let noiseMap = new THREE.TextureLoader().load("../images/noisy-texture.png");
    uniforms = 
        {
            time: { type: "f", value: 0.2 },
            noiseTexture: { type: "t", value: noiseMap },
            glowTexture: { type: "t", value: texture }
        };
    uniforms.noiseTexture.value.wrapS = uniforms.noiseTexture.value.wrapT = THREE.RepeatWrapping;
    uniforms.glowTexture.value.wrapS = uniforms.glowTexture.value.wrapT = THREE.RepeatWrapping;

    let material = new THREE.ShaderMaterial({
        uniforms: uniforms,
        vertexShader: document.getElementById( 'vertexShader' ).textContent,
        fragmentShader: document.getElementById( 'fragmentShader' ).textContent,
        transparent:true,
        side:THREE.DoubleSide
    } );

    mesh = new THREE.Mesh(geometry, material);

    mesh.rotation.x = -Math.PI / 2;
    mesh.rotation.z = -Math.PI/2;
    mesh.position.y = -4.02;
    
    // Add the mesh to our group
    scene.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    let mesh_2 = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, transparent: true}));

    mesh_2.rotation.x = -Math.PI / 2;
    mesh_2.rotation.z = -Math.PI;
    mesh_2.position.y = -2;

    // Add the mesh to our group
    scene.add( mesh_2 );

    window.addEventListener( 'resize', onWindowResize);
    document.addEventListener('mousedown', onDocumentMouseDown);
    document.addEventListener( 'keydown', onKeyDown, false );
    document.addEventListener( 'keyup', onKeyUp, false );
    raycaster = new THREE.Raycaster();
    initPointerLock(scene, camera);

    loadGLTFBoat(scene, -2800, 0, -2800, Math.PI+Math.PI/4).then(()=>{
        boatLoaded = true;
    });
    loadObjDeath(scene, -2850, 0, -2850, Math.PI/4).then(()=>{
        deathLoaded = true;
    });
    loadGLTFDoor(scene).then(()=>{
        doorLoaded = true;
    });
    createTorchsAndPhotos(scene).then(()=>{
        torchesLoaded = true;
    });
}

async function createTorchsAndPhotos(scene){
    await loadObjTorch(scene, 2500, -2, 1250);
    await loadObjTorch(scene, 1250, -2, 1250);
    await loadObjTorch(scene, 0, -2, 1250);
    await loadObjTorch(scene, -1250, -2, 1250);
    await loadObjTorch(scene, -2500, -2, 1250);

    euclides = await addPhotoElement(scene, "../images/characters/firstCircle/euclides.png", 2500, 100, 1875, Math.PI);
    homero = await addPhotoElement(scene, "../images/characters/firstCircle/homero.png", 1250, 100, 1875, Math.PI);
    penthesileia = await addPhotoElement(scene, "../images/characters/firstCircle/penthesileia.png", 0, 100, 1875, Math.PI);
    socrates = await addPhotoElement(scene, "../images/characters/firstCircle/socrates.png", -1250, 100, 1875, Math.PI);
    virgilio = await addPhotoElement(scene, "../images/characters/firstCircle/virgilio.png", -2500, 100, 1875, Math.PI);

    await loadObjTorch(scene, 2500, -2, 2500);
    await loadObjTorch(scene, 1250, -2, 2500);
    await loadObjTorch(scene, 0, -2, 2500);
    await loadObjTorch(scene, -1250, -2, 2500);
    await loadObjTorch(scene, -2500, -2, 2500);
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;

    if(!loading && boatLoaded && deathLoaded && doorLoaded && torchesLoaded)
        removeLoading();

    if(boatAnimations && boatAnimations["0movement"] && boat_death_torch_animator && boat_death_torch_animator.running){
        boatAnimations["0movement"].getMixer().update(deltat * 0.001);
    }
    if(!finished && boat_moved && !boat_death_torch_animator.running){
        console.log("acabo");
        finished = true; 
        extra_finish = true;
    }
    let fract = deltat / duration;
    uniforms.time.value += fract;

    KF.update();
}

function run() 
{
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );
    animate();

    if (!screen_locked && controls.isLocked === true && finished) 
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
            && camera.position.z + deltaz_change * 3 > -700 && camera.position.z + deltaz_change * 3 < 2800){
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
    // let euclides, homero, penthesileia, socrates, virgilio;
    let intersects = raycaster.intersectObject( homero, true );
    if(intersects.length > 0){
        window.open('https://es.wikipedia.org/wiki/Homero', '_blank');
    }
    intersects = raycaster.intersectObject( penthesileia, true );
    if(intersects.length > 0){
        window.open('https://es.wikipedia.org/wiki/Pentesilea', '_blank');
    }
    intersects = raycaster.intersectObject( socrates, true );
    if(intersects.length > 0){
        window.open('https://es.wikipedia.org/wiki/S%C3%B3crates', '_blank');
    }
    intersects = raycaster.intersectObject( virgilio, true );
    if(intersects.length > 0){
        window.open('https://es.wikipedia.org/wiki/Virgilio', '_blank');
    }
    intersects = raycaster.intersectObject( euclides, true );
    console.log(intersects);
    if(intersects.length > 0){
        window.open('https://es.wikipedia.org/wiki/Euclides', '_blank');
    } else{
        intersects = raycaster.intersectObject( door, true );
        console.log(intersects);
        if(intersects.length > 0){
            console.log("intersects", intersects[0].distance);
            if(intersects[0].distance < 800){
                door_snd.currentTime=0;
                door_snd.play();
                door_snd.onended = function() {
                    window.location = '../cerberusScene/cerberusScene.html'
                };
            }
        }
    }
    
}

async function loadObjDeath(scene, x, y, z, rotation)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        death = await objPromiseLoader.load('../models/death/death.obj');

        let texture = new THREE.TextureLoader().load("../models/death/texture/texture.dds");
        death.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
            }
        });
        death.scale.set(0.5, 0.5, 0.5);
        death.position.z = z;
        death.position.x = x;
        death.position.y = y;
        death.rotation.y += rotation;
        death.castShadow = false;
        death.receiveShadow = true;
        scene.add(death);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjTorchMoving(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        torch = await objPromiseLoader.load('../models/torch/torch.obj');
        let texture = new THREE.TextureLoader().load("../models/torch/color.png");
        let normalMap = new THREE.TextureLoader().load("../models/torch/normal.png");
        let specularMap = new THREE.TextureLoader().load("../models/torch/specular.png");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        torch.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
                child.material.specularMap = specularMap;
            }
        });
        torch.scale.set(2, 2, 2);
        torch.position.z = z;
        torch.position.x = x;
        torch.position.y = y;
        torch.castShadow = false;
        torch.receiveShadow = true;
        await loadObjFireMobile(scene, x, 53, z);
        scene.add(torch);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjFireMobile(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        fire = await objPromiseLoader.load('../models/fire/fire.obj');
        let texture = new THREE.TextureLoader().load("../models/fire/color_emissive.png");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        fire.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.emissive.setHex( 0xd43e07 );
            }
        });
        fire.scale.set(2, 2, 2);
        fire.position.z = z;
        fire.position.x = x;
        fire.position.y = y;
        

        light = new THREE.PointLight( 0xfe4c00, 2.5, 0);
        light.position.set(x, y+10, z);

        scene.add(light);
        scene.add(fire);
    }
    catch (err) {
        return onError(err);
    }
}