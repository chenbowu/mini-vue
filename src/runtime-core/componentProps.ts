import { shallowReadonly } from "../reactivity/reactive";

export function initProps(instance: any, rowProps: any) {
    instance.props = rowProps || {};
}