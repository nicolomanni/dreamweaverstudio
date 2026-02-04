import { beginLoading, endLoading } from './loading';

export async function request(input: RequestInfo, init?: RequestInit): Promise<Response> {
  beginLoading();
  try {
    return await fetch(input, init);
  } finally {
    endLoading();
  }
}
