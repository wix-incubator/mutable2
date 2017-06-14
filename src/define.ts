import {BaseAtom, observable, extras} from 'mobx';
import {__extends} from "tslib";
import config from './config';

export type DeepPartial<T> = {
    [P in keyof T]?:DeepPartial<T[P]> | null;
    };

export interface ObjectAdministrator<T> {
    name: string;
    atoms: {readonly [ P in keyof T]?: BaseAtom };
}

export type MobxObj<T> = T & {
    /** @internal */
    $mobx: ObjectAdministrator<T>;
    getName(): string;
};

export type MutableObj<T> = MobxObj<T> & {
    __value__: T;
};

class MutableObjectAdministrator<T> implements ObjectAdministrator<T> {
    atoms: { [ P in keyof T]?: BaseAtom } = {};

    constructor(public name: string) {
    }
}
(MutableObjectAdministrator.prototype as any)["isMobXObservableObjectAdministration"] = true;

export type Constructor<T> = new(...args: any[]) => T;

export interface Class<T> extends Constructor<T> {
    /** @internal */
    prototype: T;
    new(value?: DeepPartial<T>): T;
}

const symbolNameRegExp = /^(?:[\$A-Z_a-z])(?:[\$0-9A-Z_a-z])*$/;

function symbolFilter(name: string) {
    return symbolNameRegExp.test(name);
}

function safeSymbol(name: string): string {
    return symbolNameRegExp.test(name) ? name : 'Type';
}

function getName(this: object) {
    return this.constructor.name;
}

export function inherit<R extends Constructor<T>, T extends object>(name: string, fields: Array<keyof T>, Base: R): R {
    const Type = new Function('parent', 'Admin', 'Atom', `return function ${name}() {    
    this && (this.__value__ = this.__value__ || {});
    this && (this.$mobx = this.$mobx || new Admin(this.constructor.name));
    ${fields.filter(symbolFilter).map((key: string) => `this.$mobx.atoms['${key}'] = new Atom('['+this.constructor.name+'].${key}');`)}
    const _this = parent.apply(this, arguments);
    return _this;
    };`)(Base, MutableObjectAdministrator, BaseAtom) as any;
    __extends(Type, Base);
    (Type as any).__proto__ = Object.create(Base); // inherit static properties of parent's prototype
    (Type as any).prototype.getName = getName;
    return Type;
}

export function shouldAssign(a: any, b: any) {
    return b !== undefined && a !== b && !(Number.isNaN(a) && Number.isNaN(b));
}
export function fieldAttribute(fieldName: string) {
    return {
        get: function (this: MutableObj<any>) {
            if (config.observable) {
                this.$mobx.atoms[fieldName].reportObserved();
            }
            return this.__value__[fieldName];
        },
        set: function (this: MutableObj<any>, newValue: any) {
            if (shouldAssign(this.__value__[fieldName], newValue)) {
                const notifySpy = extras.isSpyEnabled();
                if (config.observable && notifySpy) {
                    extras.spyReportStart({
                        type: "update",
                        object: this,
                        name: fieldName,
                        newValue,
                        oldValue: this.__value__[fieldName]
                    });
                }
                this.__value__[fieldName] = newValue;
                if (config.observable) {
                    this.$mobx.atoms[fieldName].reportChanged();
                    if (notifySpy)
                        extras.spyReportEnd();
                }
            }
        },
        enumerable: true,
        configurable: false
    };
}

export function defineClass<T = object>(fields: Array<keyof T>): ClassDecorator;
export function defineClass<T extends object>(fields: Array<keyof T>): ClassDecorator {
    return function actualDecorator(Base: Constructor<T>): Class<T> {
        const name = safeSymbol(Base.name);
        const type = inherit<typeof Base, T>(name, fields, Base);
        for (let x = 0; x < fields.length; x++) {
            const key = fields[x];
            Object.defineProperty(type.prototype, key, fieldAttribute(key));
        }
        return type as any;
    }
}
