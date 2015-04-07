
// global variables
var renderer;
var scene;
var camera;
var spotLight;
var planeY = -50;
var minV = 5000;
var maxV = 1500;
var deltaV = minV - maxV;
var maxR = Math.PI/3;
var cube;
var sizePlane = 180;
var rotX;
var rotZ;
var timeRotate;
var mouseX;
var mouseZ;
var tween;
var locate;
var timer;
var mouseState;
var nbr_lines = 10;
var nbr_colomns = 10;


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

    ////PLANES
    var planeGeometry = new THREE.PlaneBufferGeometry(sizePlane, sizePlane, 15, 15);
    var planeMaterial = new THREE.MeshLambertMaterial({color: 0x333333});
    var plane = new THREE.Mesh(planeGeometry, planeMaterial);
    plane.receiveShadow = true;
    plane.rotation.x = -0.5 * Math.PI;
    plane.position.x = 0;
    plane.position.y = planeY;
    plane.position.z = 0;

    var locateGeometry = new THREE.PlaneBufferGeometry(sizePlane, sizePlane);
    var locateMaterial = new THREE.MeshLambertMaterial({
        color: 0xFF0000,
        transparent : true,
        opacity: 0
    });
    locate = new THREE.Mesh(planeGeometry, locateMaterial);
    locate.name = "locate";
    locate.rotation.x = -0.5 * Math.PI;
    locate.position.x = 0;
    locate.position.y = 0;
    locate.position.z = 0;

    ////CUBES
    var cubeGeometry = new THREE.BoxGeometry(2, 2, 2);
    var cubeMaterial = new THREE.MeshLambertMaterial({
        wireframe: true,
        color: 'white'
    });
    cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
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
    scene.add(locate);
    scene.add(spotLight);
    scene.add(ambientLight);
    scene.add(cube);


    document.body.appendChild(renderer.domElement);

    render();

    function posMouse(event){

    }
}

    
    

window.addEventListener('mousemove', function(event){
    if(mouseState)
    {
        toNormal();
        mouseState = false;
    }
    clearTimeout(timer);
    timer = setTimeout(followMouse, 1000, event);

});


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
    gui.add(controlObject, 'camY', 0, 200);
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


function toNormal(){

    if(tween) tween.stop();    
    tween = new TWEEN.Tween({x : cube.rotation.x, z: cube.rotation.z})
        .to({x : 0, z: 0}, 300)
        .onUpdate(function(){
            cube.rotation.x = this.x;
            cube.rotation.z = this.z;
        })
        .easing(TWEEN.Easing.Elastic.Out)
        .start();
}

function followMouse(event){
    mouseState = true;

    var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
    vector.unproject(camera);

    var raycaster = new THREE.Raycaster(camera.position,vector.sub(camera.position).normalize() );
    var intersect = raycaster.intersectObject( locate );

    mouseX = intersect[0].point.x;
    mouseZ = intersect[0].point.z;

    //DistanceAxeX = (Xa - Xb)
    var distX = cube.position.x - mouseX;
    var distZ = cube.position.z - mouseZ;

    //Distance = racine((Xa - Xb)² + (Ya - Yb)²)
    var dist = Math.sqrt(distX*distX + distZ*distZ);

    timeRotate = deltaV * (4/sizePlane) * dist + maxV;

    rotZ = maxR * (distX/dist);
    rotX = -maxR * (distZ/dist);

    rotZ = dist*((rotZ/4-rotZ)/(sizePlane/4)) + rotZ;
    rotX = dist*((rotX/4-rotX)/(sizePlane/4)) + rotX;
    
    console.log("rotZ : " + rotZ);
    console.log("rotX : " + rotX);

    tween = new TWEEN.Tween({x : cube.rotation.x, z: cube.rotation.z})
        .to({x : rotX, z: rotZ}, timeRotate)
        .onUpdate(function(){
            cube.rotation.x = this.x;
            cube.rotation.z = this.z;

        })
        .easing(TWEEN.Easing.Circular.In)
        .start();
}




window.onload = init;
window.addEventListener('resize', handleResize, false);
