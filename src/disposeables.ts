


export class Disposables{
    private disposers:{[k:string]:Function} = {};

    set(key:string):void;
    set(key:string, disposer:()=>void):void;
    set(key:string, disposer?:()=>void){
        if (typeof this.disposers[key] === 'function'){
            this.disposers[key]();
        }
        if (typeof disposer === 'function'){
            this.disposers[key] = disposer;
        } else {
            delete this.disposers[key];
        }
    }

    dispose(){
        Object.keys(this.disposers).forEach(k => this.disposers.hasOwnProperty(k) && this.set(k));
    }
}
