
// global three
var renderer;
var scene;
var camera;
var spotLight;
// calcule vitesse rotation
var minV = 5000;
var maxV = 1500;
var deltaV = minV - maxV;
// global Forms
var sizePlane = 200;
var cubeSize = 2;
var locate;
//interaction
var mouseX;
var mouseZ;
var timer;
var mouseState;
var maxR = Math.PI/3;
//display
var spotLightY = 400;
var nbr_lines = 15;
var nbr_columns = 15;
var nbr_cubes = nbr_lines*nbr_columns;
var margin = 7;
var planeY = -50;
var startPosX = -((nbr_lines*margin)/2 - margin/2);
var startPosZ = -((nbr_columns*margin)/2-margin/2);
// temp tab
var cubes = [];
var tweens = [];



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
    spotLight.intensity = 2;
    spotLight.angle = Math.PI;
    spotLight.position.set(0, spotLightY, 0);
    spotLight.angle = Math.PI/2;
    spotLight.shadowCameraNear = 10;
    spotLight.shadowDarkness = 1;
    spotLight.shadowMapWidth = 3000;
    spotLight.shadowMapHeight = 3000;
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
        color: 0x000000,
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
    var cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    var cubeMaterial = new THREE.MeshLambertMaterial({
        wireframe: true,
        color: 'white'
    });

    for( i=0 ; i<nbr_cubes; i++)
    {
        //creating cubes
        cubes[i] = new THREE.Mesh(cubeGeometry, cubeMaterial);
        cubes[i].castShadow = true;
        cubes[i].transparent = true;

        cubes[i].position.x= ((i % nbr_columns) * margin) + startPosX;
        cubes[i].position.z= (Math.floor(i/nbr_columns) * margin) + startPosZ;
    }

    ////EXTRA
    control = new function(){
        this.camX = 0;
        this.camY = 60;
        this.camZ = 0;
    };
    addControlStat(control);

    setupSound();
    loadSound("BargainHealers.ogg");


    ////ADDING
    scene.add(plane);
    scene.add(locate);
    scene.add(spotLight);
    scene.add(ambientLight);
    for( i=0 ; i<nbr_cubes; i++)
    {
        scene.add(cubes[i]);
    }


    document.body.appendChild(renderer.domElement);

    render();
}

window.addEventListener('mousemove', function(event){
    // Test l'état de la souris
    if(mouseState)
    {
        // fonction qui va balancer les tweens qui vont remettre les cubes à leur état de repos
        toNormal();
        mouseState = false;
    }

    // Permet de détecter si la souric ne bouge pas pendant plus d'une seconde
    // A chaque fois que la souris bouge, un timer est lancé, et l'ancien est nettoyé
    // followMouse est la fonction permettant de balancé un tween en direction de la souris
    clearTimeout(timer);
    timer = setTimeout(followMouse, 1000, event);

});

//RENDERER de base
function render() {
    camera.position.x = control.camX;
    camera.position.y = control.camY;
    camera.position.z = control.camZ;
    camera.lookAt(scene.position);

    var array =  new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(array);
    var average = getAverageVolume(array);

    spotLight.position.y = spotLightY - (average *2);
    console.log(spotLight.position.y)

    TWEEN.update();
    stats.update();

    requestAnimationFrame(render);
    renderer.render(scene, camera);
}


// Balance le tween pour que chaque cube retourne à l'état de repos
function toNormal(){
    for( i=0 ; i<nbr_cubes; i++)
    {
        // Si le tween est déjà défini et tourne, on le stop
        if(tweens[i]) tweens[i].stop();
        // Permet de stocker les valeurs du tween
        currentRotX = cubes[i].rotation.x;
        currentRotZ = cubes[i].rotation.z;
        // TWEEN ne gère ni les tableaux de tween, ni les tableaux d'objets cibles

        //On délègue la création des tween à customTweenNormal, et l'affectation de la rotation à updateTween
        // On récupère le tween de manière à pouvoir le stopper comme il len faut lorsque la souris se stope
        tweens[i] = customTweenNormal(currentRotX, currentRotZ, i);
    }
}

// Balance le tween pour que chaque cube se tourne vers la souris
function followMouse(event){
    mouseState = true;

    // On détecte la position de la souris
    var vector = new THREE.Vector3( ( event.clientX / window.innerWidth ) * 2 - 1, - ( event.clientY / window.innerHeight ) * 2 + 1, 0.5 );
    vector.unproject(camera);
    // On balance le raycaster en fonction de la souris
    var raycaster = new THREE.Raycaster(camera.position,vector.sub(camera.position).normalize() );
    // On regarde les intersections entre le plan locate (invisible et au niveau des cubes) et le raycaster
    var intersect = raycaster.intersectObject( locate );

    mouseX = intersect[0].point.x;
    mouseZ = intersect[0].point.z;

    //  on boucle pour balancer le tween à chaque cube
    for( i=0 ; i<nbr_cubes; i++)
    {
        // Si le tween est déjà défini et tourne, on le stop
        if(tweens[i]) tweens[i].stop();


        //DistanceAxeX = (Xa - Xb)
        var distX = cubes[i].position.x - mouseX;
        var distZ = cubes[i].position.z - mouseZ;

        //Distance = racine((Xa - Xb)² + (Ya - Yb)²)
        var dist = Math.sqrt(distX*distX + distZ*distZ);
        // Paye ta formule relou mais qui marche
        var timeRotate = deltaV * (4/sizePlane) * dist + maxV;
        // Sinus
        var rotZ = maxR * (distX/dist);
        // Cosinus
        var rotX = -maxR * (distZ/dist);
        // On factorise ça de manière à ce que les plus proche tournent plus que les lointains
        rotZ = dist*((rotZ/4-rotZ)/(sizePlane/4)) + rotZ;
        rotX = dist*((rotX/4-rotX)/(sizePlane/4)) + rotX;

        // customTweenFollow s'occupe de créer un tween à chaque fois qu'elle est appelé, avec en argument ce qu'il faut
        // On récupère le tween de manière à pouvoir le stopper comme il len faut lorsque la souris rebouge
        tweens[i] = customTweenFollow(rotZ, rotX, cubes[i].rotation.x, cubes[i].rotation.z, timeRotate, i);
    }
}

// customTweenFollow s'occupe de créer un tween à chaque fois qu'elle est appelé
// Ses arguments permettent de prendre en compte les variation de temps et tutti cuanti
function customTweenFollow(rotZ, rotX, currentRotX, currentRotZ, duration, index){
    // On va utiliser current values pour envoyer les variation de valeurs à updateTween
    var currentValues = {x: null, z: null};

    var tween = new TWEEN.Tween({x : currentRotX, z: currentRotZ})
            .to({x : rotX, z: rotZ}, duration)
            .onUpdate(function(){
                currentValues.x = this.x;
                currentValues.z = this.z;
                // Puisque tween ne gère pas les tableaux, on va déléguer l'update à updateTween
                // Les arguments sont les valeurs à affecter, et l'index du cube à modifier
                updateTween(currentValues, index);
            })
            .easing(TWEEN.Easing.Circular.In)
            .start();
    return tween;
}

// customTweenFollow s'occupe de créer un tween à chaque fois qu'elle est appelé
// Il possède des paramètres custom pour le retours à la normal du tween
function customTweenNormal(currentRotX, currentRotZ, index){
    // On va utiliser current values pour envoyer les variation de valeurs à updateTween
    var currentValues = {x: null, z: null};

    var tween = new TWEEN.Tween({x : currentRotX, z: currentRotZ})
            .to({x : 0, z: 0}, 500)
            .onUpdate(function(){
                currentValues.x = this.x;
                currentValues.z = this.z;
                // Puisque tween ne gère pas les tableaux, on va déléguer l'update à updateTween
                // Les arguments sont les valeurs à affecter, et l'index du cube à modifier
                updateTween(currentValues, index);
            })
            .easing(TWEEN.Easing.Elastic.Out)
            .start();
    return tween;

}

// Update la rotation vien le onUpdate de Tween
function updateTween(values, index){
    cubes[index].rotation.x = values.x;
    cubes[index].rotation.z = values.z;
}


var context;
var sourceNode;
var analyser;

function setupSound() {
    if (! window.AudioContext) {
        if (! window.webkitAudioContext) {
            alert('no audiocontext found');
        }
        window.AudioContext = window.webkitAudioContext;
    }
    context = new AudioContext();

    // setup a analyzer
    analyser = context.createAnalyser();
    analyser.smoothingTimeConstant = 0.4;
    analyser.fftSize = 1024;

    // create a buffer source node
    sourceNode = context.createBufferSource();
    var splitter = context.createChannelSplitter();

    // connect the source to the analyser and the splitter
    sourceNode.connect(analyser);

    // connect one of the outputs from the splitter to
    // the analyser
    // splitter.connect(analyser,0);

    // and connect to destination
    sourceNode.connect(context.destination);

    context = new AudioContext();
}


function getAverageVolume(array) {
    var values = 0;
    var average;

    var length = array.length;

    // get all the frequency amplitudes
    for (var i = 0; i < length; i++) {
        values += array[i];
    }

    average = values / length;
    return average;
}

function playSound(buffer) {
    sourceNode.buffer = buffer;
    sourceNode.start(0);
}

// load the specified sound
function loadSound(url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    // When loaded decode the data
    request.onload = function() {

        // decode the data
        context.decodeAudioData(request.response, function(buffer) {
            // when the audio is decoded play the sound
            playSound(buffer);
        }, onError);
    };
    request.send();
}

function onError(e) {
    console.log(e);
}


function addControlStat(controlObject) {
    var gui = new dat.GUI();
    gui.add(controlObject, 'camX', -50, 50);
    gui.add(controlObject, 'camY', 0, 200);
    gui.add(controlObject, 'camZ', -50, 50);

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
