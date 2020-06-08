async function fireColorAnimator(light){
    let light_animator = new KF.KeyFrameAnimator;
    light_animator.init({
        interps:
        [{
            keys:[0, 0.5, 1], 
            values:[
                {r: 0.83, g: 0.24, b: 0.027},
                {r: 1, g: 0.55, b: 0},
                {r: 0.83, g: 0.24, b: 0.027},
            ],
            target:light.color
        }],
        loop: true,
        duration: 5*1000,
    });
    light_animator.start();
    return light_animator;
}

async function moveTorchAnimator(light, torch){
    let torch_animator = new KF.KeyFrameAnimator;
    torch_animator.init({
        interps:
        [{
            keys:[0, 0.5, 1], 
            values:[
                {y: -2},
                {y: 15},
                {y: -2},
            ],
            target:torch.position
        },
        {
            keys:[0, 0.5, 1], 
            values:[
                {y: 53},
                {y: 53+15},
                {y: 53},
            ],
            target:light.position
        }],
        loop: true,
        duration: 20*1000,
    });
    torch_animator.start();
    return torch_animator;
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

animations_tween_type = [
    TWEEN.Easing.Linear.None,
    TWEEN.Easing.Quadratic.In,
    TWEEN.Easing.Quadratic.Out,
    TWEEN.Easing.Quadratic.InOut,
    TWEEN.Easing.Cubic.In,
    TWEEN.Easing.Cubic.Out,
    TWEEN.Easing.Cubic.InOut,
    TWEEN.Easing.Quartic.In,
    TWEEN.Easing.Quartic.Out,
    TWEEN.Easing.Quartic.InOut,
    TWEEN.Easing.Quintic.In,
    TWEEN.Easing.Quintic.Out,
    TWEEN.Easing.Quintic.InOut,
    TWEEN.Easing.Sinusoidal.In,
    TWEEN.Easing.Sinusoidal.Out,
    TWEEN.Easing.Sinusoidal.InOut,
    TWEEN.Easing.Exponential.In,
    TWEEN.Easing.Exponential.Out,
    TWEEN.Easing.Exponential.InOut,
    TWEEN.Easing.Circular.In,
    TWEEN.Easing.Circular.Out,
    TWEEN.Easing.Circular.InOut,
    TWEEN.Easing.Elastic.In,
    TWEEN.Easing.Elastic.Out,
    TWEEN.Easing.Elastic.InOut,
    TWEEN.Easing.Back.In,
    TWEEN.Easing.Back.Out,
    TWEEN.Easing.Back.InOut,
    TWEEN.Easing.Bounce.InOut,
    TWEEN.Easing.Bounce.In,
    TWEEN.Easing.Bounce.Out,
];

async function moveMonsterAnimator(monster, rotation){
    let item = animations_tween_type[Math.floor(Math.random() * animations_tween_type.length)];
    let torch_animator = new KF.KeyFrameAnimator;
    torch_animator.init({
        interps:
        [{
            keys:[0, 0.25, 0.5, 0.75, 1], 
            values:[
                {y: rotation},
                {y: rotation + Math.PI/4},
                {y: rotation},
                {y: rotation - Math.PI/4},
                {y: rotation},
            ],
            target:monster.rotation
        }],
        loop: true,
        duration: 30*1000,
        easing:item,
    });
    torch_animator.start();
    return torch_animator;
}

async function movePenguin(penguinObj){
    let timeKeysPosition = [];
    let accu = 0.0;
    for(let i = 0; i < 104; i++){
        timeKeysPosition.push(accu);
        accu += 1/104;
    }

    penguinAnimator = new KF.KeyFrameAnimator;
    penguinAnimator.init({ 
        interps:
            [{ 
                keys:[0, 0.25, 0.5, 0.75, 1.0], 
                values:[
                    {z: 0},
                    {z: -Math.PI/12},
                    {z: 0},
                    {z: Math.PI/12}, 
                    {z: 0},
                ],
                target:penguinObj.rotation
            }],
        loop: true,
        duration: 3 * 1000
    });
    penguinAnimator.start();

    lemniscateCoordinates.reverse();

    penguinAnimator2 = new KF.KeyFrameAnimator;
    penguinAnimator2.init({ 
        interps:
            [
            { 
                keys:timeKeysPosition, 
                values:lemniscateCoordinates,
                target:penguinObj.position
            },
            { 
                keys:timeKeysPosition, 
                values:lemniscateRotation,
                target:penguinObj.rotation
            }
            ],
        loop: true,
        duration: 120 * 1000      // 60 * 1000
    });
    penguinAnimator2.start();
}

async function moveCard(card, y_position, rotation){
    let item = animations_tween_type[Math.floor(Math.random() * animations_tween_type.length)];
    let card_animator = new KF.KeyFrameAnimator;
    card_animator.init({
        interps:
        [{
            keys:[0, 0.5, 1], 
            values:[
                {y: y_position},
                {y: y_position+30},
                {y: y_position},
            ],
            target:card.position
        },
        {
            keys:[0, 0.25, 0.5, 0.75, 1], 
            values:[
                {y: rotation},
                {y: rotation + Math.PI/4},
                {y: rotation},
                {y: rotation - Math.PI/4},
                {y: rotation},
            ],
            target:card.rotation
        }],
        loop: true,
        duration: 30*1000,
        easing:item,
    });
    card_animator.start();
    return card_animator;
}