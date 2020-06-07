let renderer = null, 
scene = null, 
camera = null;

function run() 
{
    // controls.update();
    requestAnimationFrame(function() { run(); });
    
    // Render the scene
    renderer.render( scene, camera );          
}

function createScene(canvas) 
{    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Adding Milky Way Background
    scene.background = new THREE.TextureLoader().load("../images/stars.jpg");

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 1, 4000 );
    scene.add(camera);

    window.addEventListener( 'resize', onWindowResize);
}

function changeToDoor(){
    window.location = '../doorScene/doorScene.html'
}
