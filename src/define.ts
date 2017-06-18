import {extras, BaseAtom} from 'mobx';
import config from "./config";
import {Class, MutableObj, MutableObjectAdministrator} from "./object-structure";

function getNameFromConstructor(this:object){
    return this.constructor.name;
}
function getNameUnknown(){
    return 'anonymous';
}
function defineMobxAdmin<T extends object>(ctx:MutableObj<T>) {
    if (typeof ctx.getName !== 'function'){
        if (ctx.constructor && typeof ctx.constructor.name === 'string'){
            ctx.getName = getNameFromConstructor;
        } else {
            // todo more ways to define a name
            ctx.getName = getNameUnknown;
        }
    }
    Object.defineProperty(ctx, '$mobx', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: new MutableObjectAdministrator(ctx.getName())
    });
    Object.defineProperty(ctx, '__value__', {
        enumerable: false,
        configurable: false,
        writable: false,
        value: {}
    });
}

function defineMobxValue<T extends object>(ctx:MutableObj<T>, name:keyof T) {
    ctx.$mobx.atoms[name] = new BaseAtom(`[${ctx.$mobx.name}].${name}`);
}

function checkAdmin<T extends object>(ctx:MutableObj<T>, name:keyof T){
    if(!ctx.$mobx){defineMobxAdmin(ctx)}
    if(!ctx.$mobx.atoms[name]){defineMobxValue(ctx, name)}
}

function getterAdmin<T extends object>(ctx:MutableObj<T>, name:keyof T){
    if (config.observable) {
        (ctx.$mobx.atoms[name] as BaseAtom).reportObserved();
    }
    return ctx.__value__[name];
}

function setterAdmin<T extends object>(ctx:MutableObj<T>, name:keyof T, newValue:any){
    const notifySpy = extras.isSpyEnabled();
    if (config.observable && notifySpy) {
        extras.spyReportStart({
            type: "update",
            object: ctx,
            name,
            newValue,
            oldValue: ctx.__value__[name]
        });
    }
    ctx.__value__[name] = newValue;
    if (config.observable) {
        (ctx.$mobx.atoms[name] as BaseAtom).reportChanged();
        if (notifySpy)
            extras.spyReportEnd();
    }
}

const prototypeAdminProperty = {
    enumerable: false,
    configurable: false,
    get(this:MutableObj<any>){
        defineMobxAdmin(this);
        return this.$mobx;
    },
    set(this:MutableObj<any>){
        defineMobxAdmin(this);
    }
};
const prototypeValueProperty = {
    enumerable: false,
    configurable: false,
    get(this:MutableObj<any>){
        defineMobxAdmin(this);
        return this.__value__;
    },
    set(this:MutableObj<any>, newValue:any){
        defineMobxAdmin(this);
        return this.__value__ = newValue;
    }
};

export function extendOProto<T extends object, V>(Class:Class<T>, name:keyof T){
    type UnsafeT = MutableObj<T>;
    let adminDescriptor = Object.getOwnPropertyDescriptor(Class.prototype, '$mobx');
    if (!adminDescriptor){
        // tricky: define initializer accessors in prototype for the internal structure
        // so that the object always looks like a mobx object (dev-tools etc.)
        Object.defineProperty(Class.prototype, '$mobx', prototypeAdminProperty);
        Object.defineProperty(Class.prototype, '__value__', prototypeValueProperty);
    }

    function get(this:UnsafeT){
        checkAdmin(this, name);
        return getterAdmin(this, name);
    }

    function set(this:UnsafeT, value:V){
        checkAdmin(this, name);
        return setterAdmin(this, name, value);
    }

    if (config.observable) {
        Object.defineProperty(Class.prototype, name, {
            get, set,
            enumerable: true,
            configurable: false
        });
    }
}
