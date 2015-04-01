
// global variables
var renderer;
var scene;
var camera;
var spotLight;
var planeY = -50;


var test = false;
var cube;


function init() {

    //// INIT
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);

    ////RENDERER
    renderer = new THREE.WebGLRenderer();
    renderer.setClearColor(0x000000, 1.0);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMapEnabled = true;

    ////CAMERA
    camera.position.x = 0;
    camera.position.y = 30;
    camera.position.z = 0;
    camera.lookAt(scene.position);

    ////LIGHTS
    spotLight = new THREE.SpotLight(0xffffff);
    spotLight.intensity = 1;
    spotLight.angle = Math.PI;
    spotLight.position.set(0, 30, 0);
    spotLight.shadowCameraNear = 10;
    spotLight.shadowCameraFar = 150;
    spotLight.castShadow = true;

    ambientLight = new THREE.AmbientLight(0x999999);
    ambientLight.name = "ambientLight";

    ////PLANE
    var planeGeometry = new THREE.PlaneBufferGeometry(80, 180, 15, 15);
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0x333333});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = planeY;
    plane.position.z = 0;

    ////CUBES
    var cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    var cubeMaterial = new THREE.MeshLambertMaterial({
        wireframe: true,
        color: 'white'
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
    cube.position.y = 5;
    cube.castShadow = true;
    cube.transparent = true;


    ////EXTRA
    control = new function(){
        this.camX = 0;
        this.camY = 30;
        this.camZ = 0;
        this.spotY = 30;
    };
    addControlStat(control);


    ////ADDING
    scene.add(plane);
    scene.add(spotLight);
    scene.add(ambientLight);
    scene.add(cube);


    document.body.appendChild(renderer.domElement);

    render();

    var rotation = { x : 0, z: 0 };
    var maxRotation = { x : Math.PI/2, z: Math.PI/2 };
    var previous = { x : 0, z: 0 };
    var tween = new TWEEN.Tween({x : 0, z: 0, previous : previous})
        .to({x : Math.PI/10, z: Math.PI/10}, 3000)
        .onUpdate(function(){
            cube.geometry.applyMatrix(new THREE.Matrix4().makeRotationX(this.x - this.previous.x));
            cube.geometry.applyMatrix(new THREE.Matrix4().makeRotationZ(this.z - this.previous.z));
            this.previous.x = this.x;
            this.previous.z = this.z;

        })
        //.easing(TWEEN.Easing.Elastic.InOut)
    


    window.addEventListener('click', function(){
        tween.start();
    });
}


function render() {
    camera.position.x = control.camX;
    camera.position.y = control.camY;
    camera.position.z = control.camZ;
    spotLight.position.y = control.spotY;
    camera.lookAt(scene.position);

    TWEEN.update();
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


var projector = new THREE.Projector();
window.addEventListener('click', function(event){
    event.preventDefault();

    var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
    projector.unprojectVector(vector,camera);

    var raycaster = new THREE.Raycaster(camera.position,vector.sub(camera.position).normalize() );
    var intersects = raycaster.intersectObjects( scene.children );

    if ( intersects.length > 0 ) {
        console.log(intersects[ 0 ].point);
    }
});



window.onload = init;
window.addEventListener('resize', handleResize, false);
