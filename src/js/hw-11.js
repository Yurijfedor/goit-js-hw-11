// import fetchPictures from './request-pixaby';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import PixabayApiService from './pixabay-service';

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryContainerEl: document.querySelector('.gallery_container'),
  buttonLoadMoreEl: document.querySelector('.load-more'),
};

const pixabayApiService = new PixabayApiService();

refs.formEl.addEventListener('submit', renderGallery);

function createGallery(evt) {
  evt.preventDefault();
  onClearGallery();
  pixabayApiService.query = evt.currentTarget.elements.searchQuery.value;

  pixabayApiService
    .fetchPictures()
    .then(res => {
      if (res.length === 0) {
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      }
      const markupGallery = createTemplate(res);
      console.log(markupGallery);
      // refs.galleryContainerEl.insertAdjacentHTML('beforeend', markupGallery);
      // renderGallery(markupGallery);
    })
    .catch(error => console.log(error));
}

refs.buttonLoadMoreEl.addEventListener('click', onLoadMore);

function createTemplate(collectionOfImages) {
  let markup = '';
  collectionOfImages.forEach(
    ({
      webformatURL,
      largeImageURL,
      tags,
      likes,
      views,
      comments,
      downloads,
    }) => {
      const template = `<div class="photo-card">
  <img src="${webformatURL}" alt="${tags}" loading="lazy" />
  <div class="info">
    <p class="info-item">
      <b>Likes: ${likes}</b>
    </p>
    <p class="info-item">
      <b>Views: ${views}</b>
    </p>
    <p class="info-item">
      <b>Comments: ${comments}</b>
    </p>
    <p class="info-item">
      <b>Downloads: ${downloads}</b>
    </p>
  </div>
</div>`;
      markup += template;
    }
  );
  return markup;
}

function renderGallery(markup) {
  refs.galleryContainerEl.insertAdjacentHTML('beforeend', markup);
}

function onLoadMore() {}

function onClearGallery() {
  refs.galleryContainerEl.innerHTML = '';
}
