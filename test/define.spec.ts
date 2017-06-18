import {expect} from 'chai';
import {spy, Lambda, Reaction, isObservableObject, extras} from 'mobx';
import * as sinon from 'sinon';
import {config, extendOProto} from '../src';
import {Class, MobxObj} from "../src/object-structure";

type Child = { foo: number, bar: number };

describe('observable3', () => {
    let Child: Class<Child>;
    let child: Child;

    beforeEach(() => {
        class Parent {
            foo: number
        }
        extendOProto(Parent, 'foo');

        class _Child extends Parent {
            bar: number
        }
        Child = _Child;
        extendOProto(Child, 'bar');
        child = new Child();
    });

    it('preserves constructor', () => {
        class Foo {
            foo = 6;
            constructor(spy: Function) {
                spy(this);
            }
        }
        extendOProto(Foo, 'foo');

        const mySpy = sinon.spy();
        const inst = new Foo(mySpy);
        expect(inst.foo).to.eql(6);
        expect(mySpy).to.have.callCount(1);
        expect(mySpy).to.have.been.calledWith(inst);

    });
    it('each instance tracked separately', () => {
        let reaction =  new Reaction('obj', () => {
        });
        const child2 = new Child();
        reaction.track(() => {
            child.foo;
            child2.foo;
        });
        expect(reaction.observing.length).to.eql(2);
        reaction.dispose();
    });
    const trackingActionsContract = () => {
        let reaction: Reaction;

        beforeEach(() => {
            reaction = new Reaction('obj', () => {
            });
            expect(reaction.observing.length).to.eql(0);
        });
        afterEach(() => {
            reaction.dispose();
        });

        function assertReaction() {
            if (config.observable) {
                expect(reaction.observing.length).to.not.eql(0);
            } else {
                expect(reaction.observing.length).to.eql(0);
            }
        }

        it('own field read', () => {
            reaction.track(() => {
                child.bar;
            });
            assertReaction();
        });
        it('inherited field read', () => {
            reaction.track(() => {
                child.foo;
            });
            assertReaction();
        });

    };
    describe('tracks', trackingActionsContract);
    describe('(when config.observable is false) does not track', () => {
        before(() => {
            config.observable = false;
        });
        after(() => {
            config.observable = true;
        });
        trackingActionsContract();
    });
    describe('triggers mobx reaction on changes to', () => {
        let fooSpy: sinon.SinonSpy, fooReaction: Reaction, barSpy: sinon.SinonSpy, barReaction: Reaction;
        beforeEach(() => {
            fooSpy = sinon.spy();
            fooReaction = new Reaction('foo', fooSpy);
            fooReaction.track(() => child.foo);
            barSpy = sinon.spy();
            barReaction = new Reaction('bar', barSpy);
            barReaction.track(() => child.bar);
        });
        afterEach(() => {
            fooReaction.dispose();
            barReaction.dispose();
        });
        it('own field assignment', () => {
            child.bar = 2;
            expect(barSpy).to.have.been.callCount(1);
            expect(fooSpy).to.have.been.callCount(0);
        });
        it('inherited field assignment', () => {
            child.foo = 2;
            expect(barSpy).to.have.been.callCount(0);
            expect(fooSpy).to.have.been.callCount(1);
        });
    });
    describe('does not trigger mobx reaction as a result of', () => {
        let objSpy: sinon.SinonSpy, reaction: Reaction;
        beforeEach(() => {
            objSpy = sinon.spy();
            reaction = new Reaction('obj', objSpy);
            reaction.track(() => child.foo + child.bar);
        });
        afterEach(() => {
            reaction.dispose();
        });

        it('setting field to NaN', () => {
            child.foo = NaN;
            expect(objSpy).to.have.been.callCount(1);
            child.foo = NaN;
            expect(objSpy).to.have.been.callCount(1);
        });
    });
    describe('reports to mobx spy and observer on', () => {
        let spyListener: (change: any) => void;
        let observeListener: (change: any) => void;
        let spyDestroy: Lambda;

        function expectMobxReported(expected: { [k: string]: any }) {
            const eventMatcher = (change: { [k: string]: any }) => Object.keys(expected).every(k => change[k] === expected[k]);
            expect(spyListener).to.have.not.callCount(0);
            expect(spyListener).to.have.been.calledWith(sinon.match(eventMatcher));
        }

        beforeEach(() => {
            observeListener = sinon.spy();
            spyListener = sinon.spy();
            spyDestroy = spy(spyListener);
        });
        afterEach(() => {
            spyDestroy();
        });
        it('own field assignment', () => {
            child.bar = 2;
            expectMobxReported({
                type: 'update',
                oldValue: undefined,
                newValue: 2,
                name: 'bar'
            });
        });
        it('inherited field assignment', () => {
            child.foo = 2;
            expectMobxReported({
                type: 'update',
                oldValue: undefined,
                newValue: 2,
                name: 'foo'
            });
        });
    });

    describe('satisfies mobx-react-devtools contract', () => {
        function mChild(): MobxObj<Child> {
            return child as any;
        }

        it('has a recognised administrator object', () => {
            expect(extras.getAdministration(child)).to.be.ok;
        });

        it('satisfies mobx.isObservableObject()', () => {
            expect(isObservableObject(child)).to.eql(true);
        });

        it('provides a meaningful result to getDebugName()', () => {
            expect(extras.getDebugName(child)).to.eql(mChild().getName());
        });

        it('has meaningful $mobx.name (otherwise constructor.name is used)', () => {
            expect(mChild().$mobx.name).to.eql(mChild().getName());
        });

        it('shows on reaction\'s getDependencyTree()', () => {
            const name = 'obj';
            const reaction = new Reaction(name, () => {
            });
            try {
                reaction.track(() => {
                    child.foo;
                });
                expect(extras.getDependencyTree(reaction)).to.eql({
                    name,
                    dependencies: [{name: `[${mChild().getName()}].foo`}]
                })
            } finally {
                reaction.dispose();
            }
        });
    });
});

