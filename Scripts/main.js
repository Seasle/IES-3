/********************************
 * Imports
 ********************************/

import { map, random } from './utils.js';

/********************************
 * Variables
 ********************************/

const canvas = document.querySelector('canvas');
const context = canvas.getContext('2d');
const points = [];
const mouse = {};
let dragging = false;

/********************************
 * Tensorflow
 ********************************/
const variables = {};
const learningRate = 0.2;
const optimizer = tf.train.adam(learningRate);

const loss = (prediction, label) => prediction.sub(label).square().mean();

const predict = (x) => {
    const xs = tf.tensor1d(x);
    // y = ax^3 + bx^2 + cx + d
    const ys = xs.pow(tf.scalar(3)).mul(variables.a)
        .add(xs.square().mul(variables.b))
        .add(xs.mul(variables.c))
        .add(variables.d);

    return ys;
};

/********************************
 * Functions
 ********************************/

const draw = () => {
    if (dragging) {
        points.push({
            x: map(0, canvas.width, 0, 1, mouse.x),
            y: map(0, canvas.height, 1, 0, mouse.y)
        });
    } else {
        tf.tidy(() => {
            if (points.length > 0) {
                optimizer.minimize(() => loss(
                    predict(points.map(point => point.x)),
                    tf.tensor1d(points.map(point => point.y))
                ));
            }
        });
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 0.2)';
    for (const point of points) {
        context.beginPath();
        context.arc(
            point.x * canvas.width,
            canvas.height - point.y * canvas.height,
            5,
            0,
            Math.PI * 2
        );
        context.closePath();
        context.fill();
    }

    const curveX = [];
    for (let x = -1; x <= 1; x += 0.025) {
        curveX.push(x);
    }

    const ys = tf.tidy(() => predict(curveX));
    const curveY = ys.dataSync();
    ys.dispose();

    const shape = new Path2D();
    for (let index = 0; index < curveX.length; index++) {
        const x = curveX[index] * canvas.width;
        const y = canvas.height - curveY[index] * canvas.height;

        if (index === 0) {
            shape.moveTo(x, y);
        } else {
            shape.lineTo(x, y);
        }
    }
    context.stroke(shape);

    requestAnimationFrame(draw);
};

const init = () => {
    variables.a = tf.variable(tf.scalar(random(-1, 1)));
    variables.b = tf.variable(tf.scalar(random(-1, 1)));
    variables.c = tf.variable(tf.scalar(random(-1, 1)));
    variables.d = tf.variable(tf.scalar(random(-1, 1)));

    canvas.addEventListener('mousemove', event => {
        [mouse.x, mouse.y] = [event.offsetX, event.offsetY];
    });

    canvas.addEventListener('mousedown', () => {
        dragging = true;
    });

    canvas.addEventListener('mouseup', () => {
        dragging = false;
    });

    [canvas.width, canvas.height] = [600, 600];

    requestAnimationFrame(draw);
};

/********************************
 * Events
 ********************************/

window.addEventListener('load', init);