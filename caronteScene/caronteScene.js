let renderer = null, 
scene = null, 
camera = null;

let floorUrl = "../images/solid_magma.png";
let door, death, boat, boatAnimations = {}, boatTorch, boatTorchAnimation, fire, light;
let penguinObj, raycaster, mesh, uniforms;
let boat_death_torch_animator = new KF.KeyFrameAnimator;
let mouse = new THREE.Vector2();

let currentTime = Date.now();
let duration = 5000;
let created = false;

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
                    {x: -2750, z: -2750},
                    {x: -570, z: -570},
                ],
                target:torch.position
            },
            { 
                keys:[0, 1], 
                values:[
                    {x: -2800, z: -2800},
                    {x: -620, z: -620},
                ],
                target:camera.position
            },
            { 
                keys:[0, 1], 
                values:[
                    {x: -2750, z: -2750},
                    {x: -570, z: -570},
                ],
                target:fire.position
            },
            { 
                keys:[0, 1], 
                values:[
                    {x: -2750, z: -2750},
                    {x: -570, z: -570},
                ],
                target:light.position
            }],
        duration: 1 * 1000,
    });
    created = true;
    boat_death_torch_animator.start();
    console.log("creado");
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
    camera.position.set(0, 100, -350);
    scene.add(camera);

    orbitControls = new THREE.OrbitControls(camera, renderer.domElement);

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
    raycaster = new THREE.Raycaster();

    // loadGLTFBoat(scene, -2800, 0, -2800, Math.PI+Math.PI/4);
    loadObjTorchMoving(scene, -2750, -2, -2750);
    // loadObjDeath(scene, -2850, 0, -2850, Math.PI/4);
    // loadGLTFDoor(scene);
    createTorchs(scene);
}

function createTorchs(scene){
    loadObjTorch(scene, 2500, -2, 1250);
    loadObjTorch(scene, 1250, -2, 1250);
    loadObjTorch(scene, 0, -2, 1250);
    loadObjTorch(scene, -1250, -2, 1250);
    loadObjTorch(scene, -2500, -2, 1250);

    // loadObjTorch(scene, 2500, -2, 2500);
    // loadObjTorch(scene, 1250, -2, 2500);
    // loadObjTorch(scene, 0, -2, 2500);
    // loadObjTorch(scene, -1250, -2, 2500);
    // loadObjTorch(scene, -2500, -2, 2500);

    // loadObjTorch(scene, 2500, -2, 0);
    // loadObjTorch(scene, 1250, -2, 0);
    // loadObjTorch(scene, 0, -2, 0);
    // loadObjTorch(scene, -1250, -2, 0);
    // loadObjTorch(scene, -2500, -2, 0);
}

function animate() {
    let now = Date.now();
    let deltat = now - currentTime;
    currentTime = now;
    //&& boat_death_torch_animator && boat_death_torch_animator.running
    if(boatAnimations && boatAnimations["0movement"] ){
        boatAnimations["0movement"].getMixer().update(deltat * 0.001);
    }
    let fract = deltat / duration;
    uniforms.time.value += fract;

    if(!created && boat && death && torch){
        createBoatAnimator();
    }
    if(created){
        KF.update();
    }
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
        // if(intersects[0].distance < 800)
        //     window.location = '../finalScene/finalScene.html'
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

//TODO
//Agregar controles y fotos
//Agregar seguimiento de la cámara