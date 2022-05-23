
import { request } from 'umi';

export async function addRule(options?: { [key: string]: any }) {
    return request<API.RuleListItem>('/api/rule', {
      method: 'POST',
      ...(options || {}),
    });
  }

  interface Lengthwise {
    length: number;
}

function loggingIdentity<T extends Lengthwise>(arg: T): T {
    console.log(arg.length);  // Now we know it has a .length property, so no more error
    return arg;
}
loggingIdentity("9")