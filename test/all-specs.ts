import './setup';

declare const require:any;
declare const module:{exports:any};

const ReqContext:any = require.context('./', true, /\.spec\.js$/);
ReqContext.keys().forEach(ReqContext);
