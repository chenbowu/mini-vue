export const extend = Object.assign;

export const isObject = (val) => {
    return val !== null && val instanceof Object;
}

export const hasChanged = (val, newValue) => {
    return !Object.is(val, newValue);
}