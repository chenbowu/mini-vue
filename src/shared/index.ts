export const extend = Object.assign

export const EMPTY_OBJ = {}

export const isObject = (val) => {
  return val !== null && val instanceof Object
}

export const isString = val => typeof val === 'string'

export const hasChanged = (val, newValue) => {
  return !Object.is(val, newValue)
}

export const isOn = (key: string) => /^on[A-Z]/.test(key)

export const hasOwn = (obj: Object, key: string | symbol) => Object.prototype.hasOwnProperty.call(obj, key)

export const camelize = (str: string) => {
  return str.replace(/-(\w)/g, (_, c) => {
    return c ? c.toLocaleUpperCase() : ''
  })
}

const capitalize = (str: string) => {
  return str.charAt(0).toLocaleUpperCase() + str.slice(1)
}

export const toHandlerKey = (str: string) => {
  return str ? `on${capitalize(str)}` : ''
}
