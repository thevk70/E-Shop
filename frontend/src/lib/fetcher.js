import { httpRequest } from "../lib/http-request";

export const fetcher = async (url) => {
  try {
    const { data } = await httpRequest.get(url);
    return data;
  } catch (err) {
    throw err;
  }
};
