export function initSlots(instance, children) {
    const slots = {};
    for (let key in children) {
        const value = children[key];
        slots[key] = Array.isArray(value) ? value : [value]
    }
    instance.slots = slots;
}