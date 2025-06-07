import { isDevelopment, isTest } from '../../constants';

class DataFetcher {
  baseUrl: string;
  baseOptions: RequestInit;

  constructor(baseUrl: string, options?: RequestInit) {
    this.baseUrl = baseUrl;
    this.baseOptions = {
      method: 'GET',
      ...(options || {}),
    };
  }

  handleErrorResponse(response: Response) {
    throw new Error('HTTP Error! Status:' + response.status);
  }

  async fetch(fetchUrl: string, queryParams?: string) {
    const url = new URL(this.baseUrl + fetchUrl);

    if (queryParams) {
      url.search = queryParams;
    }

    try {
      const response = await fetch(url, this.baseOptions);

      if (!response.ok) {
        this.handleErrorResponse(response);
      }

      return await response.json();
    } catch (error) {
      if (isDevelopment && !isTest) {
        console.error(`Error fetching remote data from: ${url}`, error);
      }

      return error;
    }
  }
}

export default DataFetcher;
