"use strict";

const carlist = [
    "fordgt90",
    "koenigsegg",
    "laferrari",
    "zonda",
    "car1",
    "car2",
    "car3",
    "car4",
    "car5",
    "car6"
];
const controls = {};
const actions = {};
for (let car of carlist) {
    controls[car] = {};
    controls[car].moveForward = false;
    controls[car].moveBackward = false;
    controls[car].moveLeft = false;
    controls[car].moveRight = false;
}
const carData = {
    "fordgt90": {
        "body_url": "obj/fordBody.json",
        "wheel_url": "",
        "engineForce": 600
    },
    "koenigsegg": {
        "body_url": "obj/koenigsegg/koenigsegg_body.json",
        "wheel_url": "",
        "rotation": Math.PI,
        "bodyOffsetHeight": 0,
        "scale": 1.5,
        "massVehicle": 1100,
        "wheelAxisPositionBack": -1.7,
        "wheelWidthBack": .0,
        "wheelAxisFrontPosition": 1.5,
        "wheelWidthFront": .0,
        "wheelRadiusBack": .4,

        "engineForce": 600
    },
    "camaro": {
        "body_url": "obj/camaro/camaro_body.json",
        "wheel_url": "",
        "rotation": 0,
        "bodyOffsetHeight": 0.5,
        "scale": 1.0,
        "massVehicle": 1700,
        "wheelAxisPositionBack": -1.7,
        "wheelWidthBack": -0.1,
        "wheelAxisFrontPosition": 1.9,
        "wheelWidthFront": -0.1,
        "wheelRadiusBack": 0.4,
        "engineForce": 600
    },
    "zonda": {
        "body_url": "obj/zonda/zonda_body.json",
        "wheel_url": "",
        "bodyOffsetHeight": 0.5,
        "rotation": 0,
        "scale": 1.0,
        "massVehicle": 1200,
        "wheelAxisPositionBack": -2.05,
        "wheelWidthBack": 0.1,
        "wheelAxisFrontPosition": 1.7,
        "wheelWidthFront": 0.1,
        "wheelRadiusBack": 0.4,
        "engineForce": 600
    },
    "laferrari": {
        "body_url": "obj/laferrari/laferrari_body.json",
        "wheel_url": "",
        "bodyOffsetHeight": 0,
        "rotation": Math.PI,
        "scale": 1.5,
        "massVehicle": 1200,
        "wheelAxisPositionBack": -2.05,
        "wheelWidthBack": 0.1,
        "wheelAxisFrontPosition": 1.7,
        "wheelWidthFront": 0.1,
        "wheelRadiusBack": 0.4,
        "engineForce": 600
    },
    "veyron": {
        name: "Bugatti Veyron",
        "body_url": "obj/veyron/veyron_body.json",
        scale: 5.5,
        direction: 0.0,
        "bodyOffsetHeight": 0,
        "rotation": Math.PI,
        "massVehicle": 1200,
        "wheelAxisPositionBack": -2.05,
        "wheelWidthBack": 0.1,
        "wheelAxisFrontPosition": 1.7,
        "wheelWidthFront": 0.1,
        "wheelRadiusBack": 0.4,
        "engineForce": 600,
        init_rotation: [0, 0, 0],
		scale: 5.5,
		init_material: 4,
        body_materials: [2],
        materials: null
    },
    "veneno": {
        "body_url": "obj/veneno/veneno_body.json",
        "wheel_url": "",
        "bodyOffsetHeight": 0,
        "rotation": 0,
        "scale": 0.9,
        "massVehicle": 1200,
        "wheelAxisPositionBack": -1.0,
        "wheelWidthBack": 0.1,
        "wheelAxisFrontPosition": -1.7,
        "wheelWidthFront": 0.1,
        "wheelRadiusBack": 0.4,
        "engineForce": 600
      }
};
let camera;
let bodyGeom = {};
let bodyMat = {};
let wMat = {};
let wGeom = {};
const carObj = [];

const terrainWidth = 512;
const terrainDepth = 512;

const carload = (name, callback) => {
    bodyGeom[name] = null;
    bodyMat[name] = null;

    wMat[name] = null;
    wGeom[name] = null;

    //let wheelMesh = null;

    const done = () => {
        if (bodyGeom[name] != null && wGeom[name] != null) {
            callback();
        } else {
            console.log("undone..");
        }
    };

    const jsonloader = new THREE.JSONLoader();
    jsonloader.load(`obj/${name}/${name}_rw.json`, (wheelGeom, wheelMats) => {
        wheelGeom.computeFaceNormals();
        wheelGeom.computeVertexNormals();
        wheelGeom.computeBoundingBox();
        const bb = wheelGeom.boundingBox;
        const wheelOffset = new THREE.Vector3();
        wheelOffset.addVectors(bb.min, bb.max);
        wheelOffset.multiplyScalar(0.5);
        wheelGeom.center();
        wMat[name] = wheelMats;
        wGeom[name] = wheelGeom;
        done();
    });
    jsonloader.load(`obj/${name}/${name}_body.json`, (geometry, materials) => {
        //const mat = new THREE.MeshFaceMaterial(materials);
        //mat.side = THREE.DoubleSide;
        for (let m of materials) {
            m.side = THREE.DoubleSide;
        }
        bodyGeom[name] = geometry;
        bodyMat[name] = materials;

        geometry.sortFacesByMaterialIndex();
        geometry.computeFaceNormals();
        geometry.computeVertexNormals();
        done();
    });

};

let gCarname2 = "car3";

const ammain = () => {
    let heightData = null;
    let ammoHeightData = null;
    const terrainHalfWidth = terrainWidth / 2;
    const terrainHalfDepth = terrainDepth / 2;
    const terrainMaxHeight = 18;
    const terrainMinHeight = -10;
    const terrainWidthExtents = 5000;
    const terrainDepthExtents = 5000;
    // Detects webgl

    // - Global variables -
    const DISABLE_DEACTIVATION = 4;
    const ZERO_QUATERNION = new THREE.Quaternion(0, 0, 0, 1);

    // Graphics variables
    let container, stats, speedometer;
    let scene, renderer;
    let camera2, renderer2;
    var terrainMesh, texture;
    const clock = new THREE.Clock();
    let materialDynamic, materialStatic, materialInteractive;

    // Physics variables
    let collisionConfiguration;
    var dispatcher;
    var broadphase;
    var solver;
    var physicsWorld;

    const syncList = [];
    let time = 0;
    const objectTimePeriod = 3;
    const timeNextSpawn = time + objectTimePeriod;
    const maxNumObjects = 30;
    let gCarname = "car4";

    // Keybord actions

    const keysActions = {
        "KeyW": 'acceleration',
        "KeyS": 'braking',
        "KeyA": 'left',
        "KeyD": 'right'
    };
    const carKind = {
        "car1": "koenigsegg",
        "car2": "koenigsegg",
        "car3": "camaro",
        "car4": "zonda",
        "car5": "laferrari",
        "car6": "veneno"
    };
    const cars = ["car1", "car2", "car3", "car4", "car5","car6"];
    for (let car of cars) {
        actions[car] = {};
    }
    //console.dir(actions);
    const campos = new THREE.Vector3(0, 1.4, -6);

    // - Functions -
    const initGraphics = () => {

        container = document.getElementById('container');
        speedometer = document.getElementById('speedometer');

        scene = new THREE.Scene();

        camera = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight / 2), 0.2,
            2000);
        camera2 = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight / 2), 0.2,
            2000);

        renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer.setClearColor(0xbfd1e5);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setSize(window.innerWidth, window.innerHeight / 2);

        renderer2 = new THREE.WebGLRenderer({
            antialias: true
        });
        renderer2.setClearColor(0xbfd1e5);
        renderer2.setPixelRatio(window.devicePixelRatio);
        renderer2.setSize(window.innerWidth, window.innerHeight / 2);

        const ambientLight = new THREE.AmbientLight(0x404040);
        scene.add(ambientLight);

        const dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.position.set(10, 10, 5);
        scene.add(dirLight);

        materialDynamic = new THREE.MeshPhongMaterial({
            color: 0xfca400
        });
        materialStatic = new THREE.MeshPhongMaterial({
            color: 0x999999
        });
        materialInteractive = new THREE.MeshPhongMaterial({
            color: 0x990000
        });

        container.innerHTML = "";

        container.appendChild(renderer.domElement);
        //container.appendChild(renderer2.domElement);

        stats = new Stats();
        stats.domElement.style.position = 'absolute';
        stats.domElement.style.top = '0px';
        container.appendChild(stats.domElement);

        window.addEventListener('resize', onWindowResize, false);
        window.addEventListener('keydown', keydown);
        window.addEventListener('keyup', keyup);
    };

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / (window.innerHeight / 2);
        camera.updateProjectionMatrix();

        camera2.aspect = window.innerWidth / (window.innerHeight / 2);
        camera2.updateProjectionMatrix();

        renderer.setSize(window.innerWidth, (window.innerHeight / 2));
        renderer2.setSize(window.innerWidth, (window.innerHeight / 2));
    };

    //onst campos = new THREE.Vector3(0, 1.4, -6);
    const vec2 = new THREE.Vector3();
    const tick = () => {
        requestAnimationFrame(tick);
        const dt = clock.getDelta();

        let idx = 0;
        for (const car of cars) {
            if (car == gCarname) {
                campos.set(0, 2, -6.5);
                const q = carObj[idx].chassisMesh.getWorldQuaternion();
                campos.applyQuaternion(q);
                campos.add(carObj[idx].chassisMesh.position);
                camera.position.copy(campos);
                camera.lookAt(carObj[idx].chassisMesh.position);
                //console.log(camera.position);
            }
            idx++;
        }
        renderer.render(scene, camera);
        //renderer2.render(scene, camera2);
        time += dt;
        stats.update();
    };

    const keyup = (e) => {
        if (keysActions[e.code]) {
            actions[gCarname][keysActions[e.code]] = false;
            //console.log(actions[gCarname])
            if (keysActions[e.code] === "acceleration") {
                gFmove = false;
            }
            if (keysActions[e.code] === "braking") {
                gBmove = false;
            }

            if (keysActions[e.code] === "left") {
                gLmove = false;
            }
            if (keysActions[e.code] === "right") {
                gRmove = false;
            }
            release(gCarname);
            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    const keydown = (e) => {
        //console.log("e.code", e.code);
        if (keysActions[e.code]) {
            //console.log(gCarname,keysActions[e.code]);
            actions[gCarname][keysActions[e.code]] = true;
            //     "KeyW": 'acceleration',
            // "KeyS": 'braking',
            // "KeyA": 'left',
            // "KeyD": 'right'
            gCarname = document.getElementById("carsel").value;
            if (keysActions[e.code] === "acceleration") {
                gFmove = true;
                forwardMove(gCarname);
            }
            if (keysActions[e.code] === "braking") {
                gBmove = true;

                backwardMove(gCarname);
            }

            if (keysActions[e.code] === "left") {
                gLmove = true;

                leftMove(gCarname);
            }
            if (keysActions[e.code] === "right") {
                gRmove = true;

                rightMove(gCarname);
            }

            e.preventDefault();
            e.stopPropagation();
            return false;
        }
    };

    const createBox = (pos, quat, w, l, h, mass, friction) => {
        const material = mass > 0 ? materialDynamic : materialStatic;
        const shape = new THREE.BoxGeometry(w, l, h, 1, 1, 1);

        const mesh = new THREE.Mesh(shape, material);
        mesh.position.copy(pos);
        mesh.quaternion.copy(quat);
        scene.add(mesh);
    };

    const createWheelMesh = (name, width, index) => {
        //console.log(`createWheelMesh width = ${width}`)
        const wheel = new THREE.Mesh(wGeom[carKind[name]], wMat[carKind[name]]);
        if (index == 1 || index == 2) {
            wheel.rotation.y = Math.PI;
            wheel.position.x = wheel.position.x + width;
        } else {
            wheel.position.x = wheel.position.x - width;
        }

        wheel.scale.set(carData[carKind[name]].scale,
            carData[carKind[name]].scale,
            carData[carKind[name]].scale);

        const wheel2 = new THREE.Object3D();
        wheel2.add(wheel);
        scene.add(wheel2);
        return wheel2;
    };

    const createChassisMesh = (name, w, l, h) => {
        const mesh = new THREE.Mesh(bodyGeom[carKind[name]], bodyMat[carKind[name]]);
        mesh.rotation.y = carData[carKind[name]].rotation;
        mesh.scale.x = carData[carKind[name]].scale;
        mesh.scale.y = carData[carKind[name]].scale;
        mesh.scale.z = carData[carKind[name]].scale;
        mesh.position.y = carData[carKind[name]].bodyOffsetHeight;
        const root = new THREE.Object3D();
        root.add(mesh);
        scene.add(root);
        return root;
    };

    const createVehicle = (name, kind, pos, quat) => {
        console.log(`createVehicle kind=${kind}`);
        // Vehicle contants
        const carname = name;
        const carkind = kind;
        const chassisWidth = 1.8;
        const chassisHeight = .6;
        const chassisLength = 4;
        const massVehicle = carData[kind].massVehicle;

        const wheelAxisPositionBack = carData[kind].wheelAxisPositionBack;
        const wheelRadiusBack = carData[kind].wheelRadiusBack;
        const wheelWidthBack = carData[kind].wheelWidthBack;
        const wheelHalfTrackBack = 1.1;
        const wheelAxisHeightBack = 0.3;

        const wheelAxisFrontPosition = carData[kind].wheelAxisFrontPosition;
        const wheelHalfTrackFront = 1;
        const wheelAxisHeightFront = .3;
        const wheelRadiusFront = .35;
        const wheelWidthFront = carData[kind].wheelWidthFront;

        const friction = 1000;
        const suspensionStiffness = 20.0;
        const suspensionDamping = 2.3;
        const suspensionCompression = 4.4;
        const suspensionRestLength = 0.6;
        const rollInfluence = 0.0;

        const steeringIncrement = 0.04;
        const steeringClamp = 0.5;
        const maxEngineForce = 8000;
        const maxBreakingForce = 200;

        // Chassis
        const obj = {};
        obj.wheel = [];
        const chassisMesh = createChassisMesh(name, chassisWidth, chassisHeight, chassisLength);
        obj.chassisMesh = chassisMesh;
        chassisMesh.rotation.y = Math.PI;;
        // Raycast Vehicle
        let engineForce = 0;
        let vehicleSteering = 0;
        let breakingForce = 0;

        // Wheels
        const FRONT_LEFT = 0;
        const FRONT_RIGHT = 1;
        const BACK_LEFT = 2;
        const BACK_RIGHT = 3;
        const wheelMeshes = [];

        const addWheel = (name, isFront, pos, width, index) => {
            wheelMeshes[index] = createWheelMesh(name, width, index);
            obj.wheel.push(wheelMeshes[index]);
        }

        addWheel(name, true, wheelRadiusFront, wheelWidthFront, FRONT_LEFT);
        addWheel(name, true, wheelRadiusFront, wheelWidthFront, FRONT_RIGHT);
        addWheel(name, false, wheelRadiusBack, wheelWidthBack, BACK_LEFT);
        addWheel(name, false, wheelRadiusBack, wheelWidthBack, BACK_RIGHT);

        carObj.push(obj);
    };

    const createGround = () => {
        // Create the terrain body
        heightData = generateHeight(terrainWidth, terrainDepth, terrainMinHeight, terrainMaxHeight);
        const scaleX = terrainWidthExtents / (terrainWidth - 1);
        const scaleZ = terrainDepthExtents / (terrainDepth - 1);
        var geometry = new THREE.PlaneBufferGeometry(scaleX * terrainWidth, scaleZ * terrainDepth, terrainWidth - 1, terrainDepth - 1);
        geometry.rotateX(-Math.PI / 2);
        var vertices = geometry.attributes.position.array;
        for (var i = 0, j = 0, l = vertices.length; i < l; i++, j += 3) {
            // j + 1 because it is the y component that we modify
            vertices[j + 1] = heightData[i];
        }
        geometry.computeVertexNormals();
        var groundMaterial = new THREE.MeshPhongMaterial({
            color: 0xC7C7C7
        });
        const loader = new THREE.TextureLoader();
        loader.load(
            // resource URL
            'images/sotomap3.png',
            // Function when resource is loaded
            (texture) => {
                // do something with the texture
                const planeMaterial = new THREE.MeshBasicMaterial({
                    map: texture
                });
                terrainMesh = new THREE.Mesh(geometry, planeMaterial);
                scene.add(terrainMesh);
            },
            // Function called when download progresses
            (xhr) => {
                console.log((xhr.loaded / xhr.total * 100) + '% loaded');
            },
            // Function called when download errors
            (xhr) => {
                console.log('An error happened');
            }
        );
        //            const groundShape = createTerrainShape(heightData);
    };
    const createObjects = () => {
        //createBox(new THREE.Vector3(0, -0.5, 0), ZERO_QUATERNION, 750, 1, 750, 0, 2);
        createGround();

        const quaternion = new THREE.Quaternion(0, 0, 0, 1);
        quaternion.setFromAxisAngle(new THREE.Vector3(1, 0, 0), -Math.PI / 5);
        createBox(new THREE.Vector3(0, -1.5, 0), quaternion, 8, 4, 10, 0);

        const size = 0.85;
        const nw = 6;
        const nh = 5;
        for (let j = 0; j < nw; j++)
            for (let i = 0; i < nh; i++)
                createBox(new THREE.Vector3(size * j - (size * (nw - 1)) / 2, size * i, 10),
                    ZERO_QUATERNION, size, size, size, 10);

        createVehicle("car1", "koenigsegg", new THREE.Vector3(0, 4, -2000), ZERO_QUATERNION);
        createVehicle("car2", "koenigsegg", new THREE.Vector3(0, 4, -4000), ZERO_QUATERNION);
        createVehicle("car3", "camaro", new THREE.Vector3(0, 8, 800), ZERO_QUATERNION);
        createVehicle("car4", "zonda", new THREE.Vector3(0, 14, -1300), ZERO_QUATERNION);
        createVehicle("car5", "laferrari", new THREE.Vector3(0, 14, -100), ZERO_QUATERNION);
        createVehicle("car6", "veneno", new THREE.Vector3(0, 14, 0), ZERO_QUATERNION);
    };

    const generateHeight = (width, depth, minHeight, maxHeight) => {
        // Generates the height data (a sinus wave)
        const size = width * depth;
        const data = new Float32Array(size);
        const hRange = maxHeight - minHeight;
        const w2 = width / 2;
        const d2 = depth / 2;
        const phaseMult = 12;
        let p = 0;
        for (let j = 0; j < depth; j++) {
            for (let i = 0; i < width; i++) {
                const radius = Math.sqrt(
                    Math.pow((i - w2) / w2, 2.0) +
                    Math.pow((j - d2) / d2, 2.0));
                const height = (Math.sin(radius * phaseMult) + 1) * 0.5 * hRange + minHeight;
                data[p] = height;
                p++;
            }
        }
        return data;
    };

    // - Init -
    initGraphics();
    createObjects();
    tick();
};

const socket = io();
const myproc = () => {
    socket.emit('getObjs', "");
    setTimeout(myproc, 30);
};

socket.on('objpos', (obj) => {
    //console.log(obj);

    for (let i = 0; i <= obj.idx; i++) {
        const p = obj.position[i];
        const q = obj.quaternion[i];
        if (carObj[i]) {
            carObj[i].chassisMesh.position.set(p[0], p[1], p[2]);
            carObj[i].chassisMesh.quaternion.set(q[0], q[1], q[2], q[3]);
            for (let n = 0; n < 4; n++) {
                const wheel = carObj[i].wheel[n];
                const p = obj.wheel[i].position[n];
                const q = obj.wheel[i].quaternion[n];
                wheel.position.set(p[0], p[1], p[2]);
                wheel.quaternion.set(q[0], q[1], q[2], q[3]);
            }
        }
    }
});

myproc();

socket.on('camera', (msg) => {
    console.log("camera", msg.car);
    const carname = msg.car;
    gCarname2 = carname;
});
const car1load = (cb) => {
    carload("koenigsegg", cb);
};
const car2load = () => {
    carload("camaro", car3load);
};
const car3load = () => {
    carload("zonda", car4load);
};
const car4load = () => {
    carload("laferrari", car6load);
};

const car5load = () => {
    carloadBin("veyron", ammain);
};

const car6load = () => {
    carload("veneno", ammain);
};

let gRmove = false;
let gLmove = false;
let gFmove = false;
let gBmove = false;

const rightMove = (carname) => {
    const msg = {
        car: carname,
        moveRight: "true"
    };

    if (gRmove) {
        socket.emit('car', msg);
        setTimeout(() => {
            rightMove(carname);
        }, 10);
    } else {
        release(carname);
    }
};

const forwardMove = (carname) => {
    //console.log('forwardMove',carname);
    const msg = {
        car: carname,
        moveForward: "true"
    };

    if (gFmove) {
        socket.emit('car', msg);
        setTimeout(() => {
            forwardMove(carname);
        }, 10)
    } else {
        release(carname);
    }
};

function backwardMove(carname) {
    const msg = {
        car: carname,
        moveBackward: "true"
    };

    if (gBmove) {
        socket.emit('car', msg);
        setTimeout(() => {
            backwardMove(carname);
        }, 10)
    } else {
        release(carname);
    }
};

function leftMove(carname) {
    const msg = {
        car: carname,
        moveLeft: "true"
    };

    if (gLmove) {
        socket.emit('car', msg);
        setTimeout(() => {
            leftMove(carname);
        }, 10);
    } else {
        release(carname);
    }
}
const release = (carname) => {
    const msg = {
        car: carname,
        release: "true"
    };

    console.log('release', carname);
    socket.emit('car', msg);
};

const resetBtn = document.getElementById("resetBtn");
resetBtn.addEventListener('click', (e) => {
    console.log('reset btn clicked!');
    socket.emit('carRest', "");
}, false);

const rBtn = document.getElementById('right');
rBtn.addEventListener('touchstart', () => {
    const carname = document.getElementById("carsel").value;
    gRmove = true;
    rightMove(carname);
})
rBtn.addEventListener('touchend', () => {
    gRmove = false;
});
const lBtn = document.getElementById('left');
lBtn.addEventListener('touchstart', () => {
    const carname = document.getElementById("carsel").value;
    gLmove = true;
    leftMove(carname);
})
lBtn.addEventListener('touchend', () => {
    gLmove = false;
});
const fBtn = document.getElementById('forward');
fBtn.addEventListener('touchstart', () => {
    const carname = document.getElementById("carsel").value;
    gFmove = true;
    forwardMove(carname);
})
fBtn.addEventListener('touchend', () => {
    gFmove = false;
});
const bBtn = document.getElementById('backward');
bBtn.addEventListener('touchstart', () => {
    const carname = document.getElementById("carsel").value;
    gBmove = true;
    backwardMove(carname);
})
bBtn.addEventListener('touchend', () => {
    gBmove = false;
});

function forward() {
    //console.log("forward");
    const carname = document.getElementById("carsel").value;
    const msg = {
        car: carname,
        moveForward: "true"
    };
    socket.emit('car', msg);
}

function backward() {
    //console.log("backward");
    const carname = document.getElementById("carsel").value;
    const msg = {
        car: carname,
        moveBackward: "true"
    };
    socket.emit('car', msg);
}

function right() {
    //console.log("right");
    const carname = document.getElementById("carsel").value;
    const msg = {
        car: carname,
        moveRight: "true"
    };
    socket.emit('car', msg);
}

function left() {
    //console.log("left");
    const carname = document.getElementById("carsel").value;
    const msg = {
        car: carname,
        moveLeft: "true"
    };
    socket.emit('car', msg);
}

car1load(car2load);