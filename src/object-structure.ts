import {BaseAtom} from "mobx";


export type DeepPartial<T> = {
    [P in keyof T]?:DeepPartial<T[P]> | null;
    };

export type Constructor<T> = new(...args: any[]) => T;

export interface Class<T> extends Constructor<T> {
    /** @internal */
    prototype: T;
    new(value?: DeepPartial<T>): T;
}
export interface ObjectAdministrator<T> {
    name: string;
    atoms: {[ P in keyof T]?: BaseAtom };
}

export type MobxObj<T> = T & {
    /** @internal */
    $mobx: ObjectAdministrator<T>;
    getName(): string;
};

export type MutableObj<T> = MobxObj<T> & {
    __value__: T;
};

export class MutableObjectAdministrator<T> implements ObjectAdministrator<T> {
    atoms: { [ P in keyof T]?: BaseAtom } = {};

    constructor(public name: string) {
    }
}
(MutableObjectAdministrator.prototype as any)["isMobXObservableObjectAdministration"] = true;
