import axios from 'axios';

const BASE_URL = 'https://pixabay.com/api/';
const API_KEY = '29711161-732b17ef7029dbffa0827fda9';
async function fetchPictures(searchParams) {
  try {
    const response = await axios.get(
      `${BASE_URL}?key=${API_KEY}&${searchParams}`
    );
    // const pictures = response.data.hits;
    return response;
  } catch (error) {
    console.log(error.message);
  }
}
export default fetchPictures;
