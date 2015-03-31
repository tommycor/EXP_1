
// global variables
var renderer;
var scene;
var camera;
var spotLight;


function init() {

    // create a scene, that will hold all our elements such as objects, cameras and lights.
    scene = new THREE.Scene();

    // create a camera, which defines where we're looking at.
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    // create a render, sets the background color and the size
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;

    // create the ground plane
    var planeGeometry = new THREE.PlaneGeometry(80, 100, 15, 15);
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0xcccccc});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;

    // rotate and position the plane
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = -50;
    plane.position.z = 0;

    // add the plane to the scene
    scene.add(plane);

    // create a cube
    var cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    var cubeMaterial = new THREE.MeshLambertMaterial({
        wireframe: true,
        color: 'white'
    });
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.z = 6;

    cube.castShadow = true;

    // add the cube to the scene
    scene.add(cube);

    // position and point the camera to the center of the scene
    camera.position.x = 0;
    camera.position.y = 30;
    camera.position.z = 0;
    camera.lookAt(scene.position);

    
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 1;
    spotLight.angle = Math.PI;
    spotLight.position.set(0, 30, 0);
    spotLight.shadowCameraNear = 10;
    spotLight.shadowCameraFar = 150;
    spotLight.castShadow = true;

    scene.add(spotLight);




    control = new function() {
        this.camX = 0;
        this.camY = 30;
        this.camZ = 0;
        this.spotY = 30;
    };


    addControlStat(control);


    document.body.appendChild(renderer.domElement);

    render();
}


function render() {
    camera.position.x = control.camX;
    camera.position.y = control.camY;
    camera.position.z = control.camZ;
    spotLight.position.y = control.spotY;
    camera.lookAt(scene.position);


    stats.update();

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}



function addControlStat(controlObject) {
    var gui = new dat.GUI();
    gui.add(controlObject, 'camX', -50, 50);
    gui.add(controlObject, 'camY', -50, 50);
    gui.add(controlObject, 'camZ', -50, 50);
    gui.add(controlObject, 'spotY', 0, 50);

    stats = new Stats();
    stats.setMode(0);

    stats.domElement.style.position = 'absolute';
    stats.domElement.style.left = '0px';
    stats.domElement.style.top = '0px';

    document.body.appendChild( stats.domElement );
}



function handleResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}


window.onload = init;
window.addEventListener('resize', handleResize, false);
