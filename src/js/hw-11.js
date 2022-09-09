// import fetchPictures from './request-pixaby';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import PixabayApiService from './pixabay-service';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryContainerEl: document.querySelector('.gallery'),
  buttonLoadMoreEl: document.querySelector('.load-more'),
};

const pixabayApiService = new PixabayApiService();
const simpleLightbox = new SimpleLightbox('.gallery > a');

refs.formEl.addEventListener('submit', createGallery);
window.addEventListener('scroll', throttle(infinityScroll, 1000));

function createGallery(evt) {
  evt.preventDefault();
  clearLastMessage();
  pixabayApiService.query = evt.currentTarget.elements.searchQuery.value;
  pixabayApiService.resetPage();
  pixabayApiService
    .fetchPictures()
    .then(response => {
      onClearGallery();
      const collectionOfImages = response.data.hits;
      if (collectionOfImages.length === 0) {
        onHideBtnLoadMore();
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else {
        Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
        renderGallery(createTemplate(collectionOfImages));
        simpleLightbox.refresh();
        initialScroll();

        if (!checkIsLastpage(response)) {
          return onshowBtnLoadMore();
        } else {
          onHideBtnLoadMore();
          renderLastMessage();
        }
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
      const template = `<a href="${largeImageURL}"><div class="photo-card">
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
</div></a>`;
      markup += template;
    }
  );
  return markup;
}

function renderGallery(markup) {
  refs.galleryContainerEl.insertAdjacentHTML('beforeend', markup);
}

function onLoadMore() {
  pixabayApiService.fetchPictures().then(response => {
    renderGallery(createTemplate(response.data.hits));
    initialScroll();
    simpleLightbox.refresh();

    if (!checkIsLastpage(response)) {
      return onshowBtnLoadMore();
    } else {
      onHideBtnLoadMore();
      renderLastMessage();
    }
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

function checkIsLastpage(response) {
  const numberOfLastPage = Math.ceil(
    response.data.totalHits / pixabayApiService.per_page
  );
  return pixabayApiService.page - 1 === numberOfLastPage;
}

function renderLastMessage() {
  const message = document.createElement('b');
  message.textContent =
    "We're sorry, but you've reached the end of search results.";
  message.classList.add('last-message');
  refs.galleryContainerEl.after(message);
}

function clearLastMessage() {
  const lastEl = document.querySelector('.last-message');
  if (lastEl) {
    lastEl.remove();
  }
  return;
}

function initialScroll() {
  const { height: cardHeight } =
    refs.galleryContainerEl.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}

function infinityScroll() {
  const wievPortHeight = window.innerHeight;
  const bodyHeight = document.body.offsetHeight;
  const currentPosition = window.pageYOffset;
  const endOfPage = wievPortHeight + currentPosition >= bodyHeight;
  if (endOfPage) {
    onLoadMore();
  }
}
