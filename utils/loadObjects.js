async function loadObjTree(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let tree = await objPromiseLoader.load('../models/arbol/Tree.obj');

        let texture = new THREE.TextureLoader().load("../models/arbol/DB2X2_L01.png");
        let texture_2 = new THREE.TextureLoader().load("../models/arbol/bark_0004.jpg");
        let normalMap = new THREE.TextureLoader().load("../models/arbol/DB2X2_L02_NRM.png");
        let specularMap = new THREE.TextureLoader().load("../models/arbol/DB2X2_L02.png");
        texture_2.wrapS = texture_2.wrapT = THREE.RepeatWrapping;
        texture_2.repeat.set(2, 2);
        tree.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                if(child.name == "g2"){
                    child.material.map = texture;
                    child.material.normalMap = normalMap;
                    child.material.specularMap = specularMap;
                } else {
                    child.material.map = texture_2;
                }
            }
        });
        tree.scale.set(50, 50, 50);
        tree.position.z = z;
        tree.position.x = x;
        tree.position.y = y;
        tree.castShadow = false;
        tree.receiveShadow = true;
        scene.add(tree);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjTorch(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let torch = await objPromiseLoader.load('../models/torch/torch.obj');
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
        let light = await loadObjFire(scene, x, 53, z);
        scene.add(torch);
        await fireColorAnimator(light);
        return torch;
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjFire(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let fire = await objPromiseLoader.load('../models/fire/fire.obj');
        let texture = new THREE.TextureLoader().load("../models/fire/color_emissive.png");
        let normalMap = new THREE.TextureLoader().load("../models/fire/normal.png");
        let specularMap = new THREE.TextureLoader().load("../models/fire/ambient_occlusion.png");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        fire.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                // child.material.map = texture;
                // child.material.normalMap = normalMap;
                // child.material.specularMap = specularMap;
                child.material.emissive.setHex( 0xd43e07 );
            }
        });
        fire.scale.set(2, 2, 2);
        fire.position.z = z;
        fire.position.x = x;
        fire.position.y = y;
        

        let light = new THREE.PointLight( 0xfe4c00, 2.5, 0);
        light.position.set(x, y+10, z);

        scene.add(light);
        scene.add(fire);
        return light;
    }
    catch (err) {
        return onError(err);
    }
}

async function loadGLTFDoor(scene, x, y, z)
{
    let gltfLoader = new THREE.GLTFLoader();
    let loader = promisifyLoader(gltfLoader);

    try
    {
        let resultDoor = await loader.load("../models/hell_gate/scene.gltf");
        resultDoor.scene.children[0].name = "wolf";
        let door = resultDoor.scene.children[0];
        door.scale.set(180, 180, 180);
        door.rotation.z += Math.PI;
        door.position.z = z;
        door.position.y = y;
        door.position.x = x;
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

async function loadGLTFWolf(scene)
{
    let gltfLoader = new THREE.GLTFLoader();
    let loader = promisifyLoader(gltfLoader);

    try
    {
        let resultGLTF = await loader.load("../models/wolf/scene.gltf");
        resultGLTF.scene.children[0].name = "wolf";
        let wolf = resultGLTF.scene.children[0];
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

async function loadObjBear(scene, x, y, z, rotation_z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let bear = await objPromiseLoader.load('../models/bear/Bear.obj');
        let texture = new THREE.TextureLoader().load("../models/bear/UV_Bear.png");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        bear.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                console.log(child);
            }
        });
        bear.scale.set(5, 5, 5);
        bear.position.z = z;
        bear.position.x = x;
        bear.position.y = y;
        bear.rotation.y -= rotation_z;
        scene.add(bear);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjCthulu(scene, x, y, z, rotation_z)
{   
    console.log("Cargando");
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let cthulu = await objPromiseLoader.load('../models/cthulhu/cthulu.obj');
        let texture = new THREE.TextureLoader().load("../images/reptile_skin.jpg");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        cthulu.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
            }
        });
        cthulu.scale.set(50000, 50000, 50000);
        cthulu.position.z = z;
        cthulu.position.x = x;
        cthulu.position.y = y;
        cthulu.rotation.y -= rotation_z;
        scene.add(cthulu);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjGargoyle(scene, x, y, z, rotation_y)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let gargoyle = await objPromiseLoader.load('../models/gargoyle/Gargoyle.obj');
        let texture = new THREE.TextureLoader().load("../images/stone_texture.jpg"); // Ponerlo bien
        let normalMap = new THREE.TextureLoader().load("../models/gargoyle/Gargoyle_normals.jpg");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        gargoyle.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
            }
        });
        gargoyle.scale.set(5, 5, 5);
        gargoyle.position.z = z;
        gargoyle.position.x = x;
        gargoyle.position.y = y;
        gargoyle.rotation.y += rotation_y;
        gargoyle.castShadow = false;
        gargoyle.receiveShadow = true;
        scene.add(gargoyle);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjIceberg(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let torch = await objPromiseLoader.load('../models/iceberg/Mountain.obj');
        let texture = new THREE.TextureLoader().load("../images/ice.jpg");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        torch.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
            }
        });
        torch.scale.set(20, 20, 20);
        torch.position.z = z;
        torch.position.x = x;
        torch.position.y = y;
        torch.castShadow = false;
        torch.receiveShadow = true;
        scene.add(torch);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjMoster(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let torch = await objPromiseLoader.load('../models/Librarian/Librarian.obj');
        let texture = new THREE.TextureLoader().load("../models/Librarian/tex/act_bibliotekar.jpg");
        let normalMap = new THREE.TextureLoader().load("../models/Librarian/tex/act_bibliotekar norm.jpg");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        console.log(torch);
        torch.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
            }
        });
        torch.scale.set(2, 2, 2);
        torch.position.z = z;
        torch.position.x = x;
        torch.position.y = y;
        torch.castShadow = false;
        torch.receiveShadow = true;
        scene.add(torch);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjRockMoster(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let torch = await objPromiseLoader.load('../models/rock_monster/Stone.obj');
        let texture = new THREE.TextureLoader().load("../models/rock_monster/diffuso.tif");
        let normalMap = new THREE.TextureLoader().load("../models/rock_monster/normal.png");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        console.log(torch);
        torch.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
            }
        });
        torch.scale.set(20, 20, 20);
        torch.position.z = z;
        torch.position.x = x;
        torch.position.y = y;
        torch.castShadow = false;
        torch.receiveShadow = true;
        scene.add(torch);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjGong(scene, x, y, z, rotation)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let torch = await objPromiseLoader.load('../models/gong/gong.obj');
        let texture = new THREE.TextureLoader().load("../models/gong/Gong_v01.jpg");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        torch.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
            }
        });
        torch.scale.set(2, 2, 2);
        torch.position.z = z;
        torch.position.x = x;
        torch.position.y = y;
        torch.rotation.x -= rotation;
        torch.castShadow = false;
        torch.receiveShadow = true;
        scene.add(torch);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjCerberus(scene, x, y, z, rotation_x, rotation_y)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let godzilla = await objPromiseLoader.load('../models/cerberus/cerberus.obj');
        let texture = new THREE.TextureLoader().load("../models/cerberus/model/m18.jpg");
        // let godzilla = await objPromiseLoader.load('../models/cerberus/triangular/cerberus.obj');
        // let texture = new THREE.TextureLoader().load("../models/cerberus/model/m18.jpg");
        // let normalMap = new THREE.TextureLoader().load("../models/gargoyle/Gargoyle_normals.jpg");
        // texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        console.log(godzilla);
        godzilla.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                // if(child.type != "LineSegments"){
                    child.material.map = texture;
                    child.castShadow = true;
                    child.receiveShadow = true;
                // }
            }
        });
        godzilla.scale.set(2, 2, 2);
        // godzilla.scale.set(20, 20, 20);
        godzilla.position.z = z;
        godzilla.position.x = x;
        godzilla.position.y = y;
        godzilla.rotation.x += rotation_x;
        godzilla.rotation.z += rotation_y;
        godzilla.castShadow = false;
        godzilla.receiveShadow = true;
        scene.add(godzilla);
    }
    catch (err) {
        return onError(err);
    }
}