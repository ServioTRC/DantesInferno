async function fireColorAnimator(light){
    let light_animator = new KF.KeyFrameAnimator;
    light_animator.init({
        interps:
        [{
            keys:[0, 0.33, 0.5, 1], 
            values:[
                {r: 0.4067, g: 0.1176, b: 0.01323},
                {r: 0.49, g: 0.385, b: 0},
                {r: 0.4067, g: 0.1176, b: 0.01323},
                {r: 0.4067, g: 0.1176, b: 0.01323},
            ],
            target:light.color
        }],
        loop: true,
        duration: 5*1000,
    });
    light_animator.start();
    return light_animator;
}

async function movingBelowAnimator(gong){
    let gong_animator = new KF.KeyFrameAnimator;
    gong_animator.init({
        interps:
        [{
            keys:[0, 1], 
            values:[
                {y: 0.0},
                {y: -200}
            ],
            target:gong.position
        }],
        duration: 2*1000,
    });
    return gong_animator;
}

async function movingForwardAnimator(cerberus){
    let cerberus_animator = new KF.KeyFrameAnimator;
    cerberus_animator.init({
        interps:
        [{
            keys:[0, 0.1, 0.9, 1], 
            values:[
                {x: 2500, y: 0, z: 2000},
                {x: 2700, y: 0, z: 2000},
                {x: 2700, y: 0, z: -2000},
                {x: 2700, y: -300, z: -2000}
            ],
            target:cerberus.position
        }],
        duration: 10*1000,
    });
    return cerberus_animator;
}