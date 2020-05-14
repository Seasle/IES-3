export const normalize = (min, max, value) => {
    return (value - min) / (max - min);
};

export const lerp = (min, max, value) => {
    return (1 - value) * min + value * max;
};

export const map = (minSource, maxSource, minTarget, maxTarget, value) => {
    return lerp(minTarget, maxTarget, normalize(minSource, maxSource, value));
};

export const clamp = (min, max, value) => {
    return Math.max(min, Math.min(value, max));
};

export const random = (min, max) => {
    return Math.floor(Math.random() * (max - min + 1) + min);
}