import { Subject } from './chinchilla/subject';
import { NoCookies } from './chinchilla/config';
import { NoCache } from './chinchilla/cache';
declare let chch: (objectsOrApp: any, model?: any) => Subject;
export { NoCache, NoCookies };
export default chch;
