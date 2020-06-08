async function addPhotoElement(scene, image, x, y, z, rotation)
{
    let texture = new THREE.TextureLoader().load(image);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    let color = 0xffffff;

    var geometry = new THREE.PlaneGeometry( 150, 150, 32 );
    let mesh = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({
        color:color,
        map:texture,
        refractionRatio: 0,
        reflectivity: 0,
        side:THREE.DoubleSide
    }));
    mesh.position.set(x, y, z);
    mesh.rotation.y += rotation;
    await scene.add( mesh );
    await moveCard(mesh, y, rotation);
    return mesh;
}

async function addPhotoElementPhong(scene, image, x, y, z, rotation)
{
    let texture = new THREE.TextureLoader().load(image);
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1, 1);

    let color = 0xffffff;

    var geometry = new THREE.PlaneGeometry( 150, 150, 32 );
    let mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        color:color,
        map:texture,
        shininess: 0,
        refractionRatio: 0,
        reflectivity: 0,
        side:THREE.DoubleSide
    }));
    mesh.position.set(x, y, z);
    mesh.rotation.y += rotation;
    await scene.add( mesh );
    await moveCard(mesh, y, rotation);
    return mesh;
}