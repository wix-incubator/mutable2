export {default as config} from './config';
export * from './define';
export * from './disposeables';
import {ifndef} from 'ifndef';




declare const module: {exports:any};
module.exports = ifndef('mutable', module.exports);
