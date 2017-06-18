import Benchmark = require('benchmark');
import {observable} from "mobx";
import {extendOProto} from "../src";
import {expect} from 'chai';

declare const console: any;

enum Operations {
    MUTABLE_CLASS_INIT = 'mutable class init',
    MOBX_CLASS_INIT = 'mobx class init',
    MUTABLE_INSTANTIATION = 'create object from mutable class',
    MOBX_INSTANTIATION = 'create object from mobx class',
    MUTABLE_INSTATNTIATION_AND_INIT = 'create object and init data from mutable class',
    MOBX_INSTATNTIATION_AND_INIT = 'create object and init data from mobx class',
    MOBX_OBJECT = 'mobx object',
    MOBX_BOX = 'mobx box'
}

describe('benchmark', () => {
    let benchmarks: { [k: string]: Benchmark } = {};

    before('measure timings', function () {
        this.timeout(10 * 60 * 1000);
        let toWrap: object = {foo: 0, bar: 0};

        function resetToWrap() {
            toWrap = {foo: 0, bar: 0};
        }
        function initMutableClass() {
            class Parent {
                foo: number
            }
            extendOProto(Parent, 'foo');
            class Child extends Parent {
                bar: number
            }
            extendOProto(Child, 'bar');
            return Child;
        }
        function initMobxClass() {
            class Parent {
                @observable foo: number = 0;
            }
            class Child extends Parent {
                @observable bar: number = 0;
            }
            return Child;
        }
        function instantiate(ctor:{new():any}, init:boolean){
            return ()=> {
                const obj = new ctor();
                if (init) {
                    obj.foo = 6;
                    obj.bar = 6;
                }
            }
        }
        resetToWrap();
        const MutableObj = initMutableClass();
        const MobxObj = initMobxClass();

        const suite = new Benchmark.Suite('object and class creation')
            .add(Operations.MUTABLE_CLASS_INIT, initMutableClass, {minSamples: 200})
            .add(Operations.MUTABLE_INSTANTIATION, instantiate(MutableObj, false), {minSamples: 200})
            .add(Operations.MUTABLE_INSTATNTIATION_AND_INIT, instantiate(MutableObj, true), {minSamples: 200})
            .add(Operations.MOBX_CLASS_INIT, initMobxClass, {minSamples: 200})
            .add(Operations.MOBX_INSTANTIATION, instantiate(MobxObj, false), {minSamples: 200})
            .add(Operations.MOBX_INSTATNTIATION_AND_INIT, instantiate(MobxObj, true), {minSamples: 200})
            .add(Operations.MOBX_OBJECT, function () {
                observable.object(toWrap)
            }, {
                minSamples: 200,
                onCycle(){
                    resetToWrap();
                }
            })
            .add(Operations.MOBX_BOX, function () {
                observable.box(toWrap)
            }, {
                minSamples: 200,
                onCycle(){
                    resetToWrap();
                }
            })
            .run();
        suite.forEach((bm: Benchmark) => benchmarks[(bm as any).name] = bm);

        console.log(Object.keys(benchmarks)
            .map((a) => benchmarks[a].toString())
            .join('\n'));//`${a.name}(${a.hz} ops/sec)`));

    });

    function getOpsPerSec(op: Operations): number {
        return benchmarks[op].hz;
    }

    const GRACE_FACTOR = 1.5;
    const MAGNITUDE_FACTOR = 10;

    it('class init is not too slower than mobx', ()=>{
        expect(getOpsPerSec(Operations.MUTABLE_CLASS_INIT))
            .to.be.greaterThan(getOpsPerSec(Operations.MOBX_CLASS_INIT) / GRACE_FACTOR);
    });

    it('instantiation is an order of magnitude more than mobx', ()=>{
        expect(getOpsPerSec(Operations.MUTABLE_INSTANTIATION))
            .to.be.greaterThan(getOpsPerSec(Operations.MOBX_INSTANTIATION) * MAGNITUDE_FACTOR);
    });

    it('instantiation and init is more than mobx', ()=>{
        expect(getOpsPerSec(Operations.MUTABLE_INSTATNTIATION_AND_INIT))
            .to.be.greaterThan(getOpsPerSec(Operations.MOBX_INSTATNTIATION_AND_INIT) * GRACE_FACTOR);
    });
});
