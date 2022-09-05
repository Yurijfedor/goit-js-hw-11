import getPictures from './request-pixaby';

const refs = {
  formEl: document.querySelector('.search-form'),
};
const searchQuery = refs.formEl.elements.searchQuery;

refs.formEl.addEventListener('submit', evt => {
  evt.preventDefault();
  const searchQueryValue = searchQuery.value;
  const options = new URLSearchParams({
    q: `${searchQueryValue}`,
    image_type: 'photo',
    orientation: 'horizontal',
    safesearch: 'true',
  });

  getPictures(options);
});
