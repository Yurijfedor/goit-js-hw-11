import axios from 'axios';
export default class PixabayApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.per_page = 40;
  }

  async fetchPictures() {
    try {
      const BASE_URL = 'https://pixabay.com/api/';
      const API_KEY = '29711161-732b17ef7029dbffa0827fda9';
      const options = new URLSearchParams({
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'false',
        per_page: this.per_page,
        key: API_KEY,
        q: this.searchQuery,
        page: this.page,
      });

      const response = await axios.get(`${BASE_URL}?${options}`);
      this.incrementPage();
      console.log(response);
      return response;
    } catch (error) {
      console.log(error.message);
    }
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }

  incrementPage() {
    this.page += 1;
  }

  resetPage() {
    this.page = 1;
  }
}
