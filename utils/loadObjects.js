
let tree_helper;
async function loadObjTree(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let tree;
        if(!tree_helper)
            tree_helper = await objPromiseLoader.load('../models/arbol/Tree.obj');
        tree = tree_helper.clone()
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

let torch_helper;
async function loadObjTorch(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let torch;
        if(!torch_helper)
            torch_helper = await objPromiseLoader.load('../models/torch/torch.obj');
        torch = torch_helper.clone();
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
        return cthulu
    }
    catch (err) {
        return onError(err);
    }
}

let gargoyle_helper;
async function loadObjGargoyle(scene, x, y, z, rotation_y)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let gargoyle;
        if(!gargoyle_helper)
            gargoyle_helper = await objPromiseLoader.load('../models/gargoyle/Gargoyle.obj');
        gargoyle = gargoyle_helper.clone();
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

let iceberg_loader;
async function loadObjIceberg(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let torch;
        if(!iceberg_loader)
            iceberg_loader = await objPromiseLoader.load('../models/iceberg/Mountain.obj');
        torch = iceberg_loader.clone();
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

let monster_helper;
async function loadObjMonster(scene, x, y, z, rotation)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let monster;
        if(!monster_helper)
            monster_helper = await objPromiseLoader.load('../models/Librarian/Librarian.obj');
        monster = monster_helper.clone();
        let texture = new THREE.TextureLoader().load("../models/Librarian/tex/act_bibliotekar.jpg");
        let normalMap = new THREE.TextureLoader().load("../models/Librarian/tex/act_bibliotekar norm.jpg");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        monster.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
            }
        });
        monster.scale.set(2, 2, 2);
        monster.position.z = z;
        monster.position.x = x;
        monster.position.y = y;
        monster.rotation.y += rotation;
        monster.castShadow = false;
        monster.receiveShadow = true;
        scene.add(monster);
    }
    catch (err) {
        return onError(err);
    }
}

let rock_monster_helper;
async function loadObjRockMoster(scene, x, y, z, rotation)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let rock_monster;
        if(!rock_monster_helper)
            rock_monster_helper = await objPromiseLoader.load('../models/rock_monster/Stone.obj');
        rock_monster = rock_monster_helper.clone();
        let texture = new THREE.TextureLoader().load("../models/rock_monster/diffuso.tif");
        let normalMap = new THREE.TextureLoader().load("../models/rock_monster/normal.png");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        rock_monster.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
                child.material.normalMap = normalMap;
            }
        });
        rock_monster.scale.set(100, 100, 100);
        rock_monster.position.z = z;
        rock_monster.position.x = x;
        rock_monster.position.y = y;
        rock_monster.rotation.y += rotation;
        rock_monster.castShadow = false;
        rock_monster.receiveShadow = true;
        scene.add(rock_monster);
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjGong(scene, x, y, z)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let gong = await objPromiseLoader.load('../models/gong/gong.obj');
        let texture = new THREE.TextureLoader().load("../models/gong/Gong_v01.jpg");
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        gong.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.castShadow = true;
                child.receiveShadow = true;
                child.material.map = texture;
            }
        });
        gong.scale.set(0.25, 0.25, 0.25);
        gong.position.z = z;
        gong.position.x = x;
        gong.position.y = y;
        gong.rotation.x -= Math.PI/2;
        gong.rotation.z -= Math.PI;
        gong.castShadow = false;
        gong.receiveShadow = true;
        scene.add(gong);
        return gong;
    }
    catch (err) {
        return onError(err);
    }
}

async function loadObjCerberus(scene, x, y, z, rotation_x, rotation_y)
{
    const objPromiseLoader = promisifyLoader(new THREE.OBJLoader());

    try {
        let cerberus = await objPromiseLoader.load('../models/cerberus/cerberus.obj');
        let texture = new THREE.TextureLoader().load("../models/cerberus/model/m18.jpg");
        cerberus.traverse(function (child) {
            if (child instanceof THREE.Mesh) {
                child.material.map = texture;
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
        cerberus.scale.set(2, 2, 2);
        cerberus.position.z = z;
        cerberus.position.x = x;
        cerberus.position.y = y;
        cerberus.rotation.x += rotation_x;
        cerberus.rotation.z += rotation_y;
        cerberus.castShadow = false;
        cerberus.receiveShadow = true;
        scene.add(cerberus);
        return cerberus
    }
    catch (err) {
        return onError(err);
    }
}