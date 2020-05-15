function fireColorAnimator(light){
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
        duration: 10*1000,
    });
    light_animator.start();
    return light_animator;
}