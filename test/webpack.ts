import './setup';

declare const require:any;
declare const module:{exports:any};

const ReqContext:any = require.context('./', true, /(?!\.nodejs\.spec\.js)(?=\.spec\.js)$/); // ignore .nodeJs specs
ReqContext.keys().forEach(ReqContext);
