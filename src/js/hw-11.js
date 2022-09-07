// import fetchPictures from './request-pixaby';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import PixabayApiService from './pixabay-service';

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryContainerEl: document.querySelector('.gallery_container'),
  buttonLoadMoreEl: document.querySelector('.load-more'),
};
const pixabayApiService = new PixabayApiService();

refs.formEl.addEventListener('submit', createGallery);
refs.buttonLoadMoreEl.addEventListener('click', onLoadMore);

function createGallery(evt) {
  evt.preventDefault();

  pixabayApiService.query = evt.currentTarget.elements.searchQuery.value;

  pixabayApiService.resetPage();
  pixabayApiService
    .fetchPictures()
    .then(respponse => {
      console.log(respponse.data.hits);
      onClearGallery();

      const collectionOfImages = respponse.data.hits;
      if (collectionOfImages.length === 0) {
        onHideBtnLoadMore();
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        renderGallery(createTemplate(collectionOfImages));

        const numberOfLastPage = Math.ceil(
          respponse.data.totalHits / pixabayApiService.per_page
        );
        if (pixabayApiService.page - 1 === numberOfLastPage) {
          onHideBtnLoadMore();
          return Notify.info(
            'Sorry, there are no images matching your search query. Please try again.'
          );
        }
        onshowBtnLoadMore();
      }
    })
    .catch(error => console.log(error));
}

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

function onLoadMore() {
  pixabayApiService.fetchPictures().then(res => {
    renderGallery(createTemplate(res.data.hits));
  });
}

function onClearGallery() {
  refs.galleryContainerEl.innerHTML = '';
}

function onshowBtnLoadMore() {
  if (refs.buttonLoadMoreEl.classList.contains('hidden')) {
    refs.buttonLoadMoreEl.classList.remove('hidden');
  }
  return;
}

function onHideBtnLoadMore() {
  refs.buttonLoadMoreEl.classList.add('hidden');
}
