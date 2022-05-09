export const extend = Object.assign;

export const isObject = (val) => {
    return val !== null && val instanceof Object;
}

export const hasChanged = (val, newValue) => {
    return !Object.is(val, newValue);
}

export const isOn = (key: string) => /^on[A-Z]/.test(key);

export const hasOwn = (obj: Object, key: string | symbol) => obj.hasOwnProperty(key);