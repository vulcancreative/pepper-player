import jr from './jr';

let serverDelta = 0;
let timeSynced = false;

const now = () => {
  const localTime = Date.now();
  return localTime - serverDelta;
}

const init = (dateStr) => {
  const t = jr.def(dateStr) ? new Date(dateStr) : new Date();
  const d = (Date.now() - now());
  return timeSynced ? new Date(t.getTime() - d) : t;
}

const parse = (dateStr) => {
  return init(dateStr);
}

const sync = (serverTime) => {
  serverDelta = 0;
  // console.log(`local time : ${now()}`);

  serverDelta = now() - serverTime;
  // console.log(`server time : ${now()}`);

  timeSynced = true;
}

const synced = () => {
  return timeSynced;
}

export default { init, now, parse, sync, synced }
