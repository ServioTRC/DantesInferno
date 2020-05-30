function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

let screen_locked = true;

function initPointerLock(scene, camera)
{
    blocker = document.getElementById( 'blocker' );
    instructions = document.getElementById( 'instructions' );

    controls = new THREE.PointerLockControls( camera, document.body );

    controls.addEventListener( 'lock', function () {
        instructions.style.display = 'none';
        blocker.style.display = 'none';
        screen_locked = false;
    } );
    
    controls.addEventListener( 'unlock', function () {
        blocker.style.display = 'block';
        instructions.style.display = '';
        screen_locked = true;
    } );

    instructions.addEventListener( 'click', function () {
        controls.lock();
    }, false );

    scene.add( controls.getObject() );
}

function onKeyDown ( event )
{
    if(!screen_locked){
        switch ( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = true;
                break;
    
            case 37: // left
            case 65: // a
                moveLeft = true; 
                break;
    
            case 40: // down
            case 83: // s
                moveBackward = true;
                break;
    
            case 39: // right
            case 68: // d
                moveRight = true;
                break;
        }
    }
}

function onKeyUp( event ) {

    if(!screen_locked){
        switch( event.keyCode ) {

            case 38: // up
            case 87: // w
                moveForward = false;
                break;
    
            case 37: // left
            case 65: // a
                moveLeft = false;
                break;
    
            case 40: // down
            case 83: // s
                moveBackward = false;
                break;
    
            case 39: // right
            case 68: // d
                moveRight = false;
                break;
    
        }
    }
}