// import fetchPictures from './request-pixaby';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import PixabayApiService from './pixabay-service';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

const refs = {
  formEl: document.querySelector('.search-form'),
  galleryContainerEl: document.querySelector('.gallery'),
  loaderEl: document.querySelector('.lds-ellipsis'),
  // buttonLoadMoreEl: document.querySelector('.load-more'),
};

const pixabayApiService = new PixabayApiService();
const simpleLightbox = new SimpleLightbox('.gallery > a');

refs.formEl.addEventListener('submit', createGallery);
// window.addEventListener('scroll', throttle(infinityScroll, 1000));

function createGallery(evt) {
  evt.preventDefault();

  clearLastMessage();
  onHideLoader();

  pixabayApiService.query = evt.currentTarget.elements.searchQuery.value;
  pixabayApiService.resetPage();

  pixabayApiService
    .fetchPictures()
    .then(response => {
      onClearGallery();

      const collectionOfImages = response.data.hits;
      if (collectionOfImages.length === 0) {
        onHideLoader();
        return Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else if (response.data.totalHits > 0 && response.data.totalHits <= 40) {
        console.log('Hallo');
        Notify.success(`We only found ${response.data.totalHits} images.`);
        renderGallery(createTemplate(collectionOfImages));
        simpleLightbox.refresh();
        initialScroll();
        onHideLoader();
        renderLastMessage();
      } else {
        Notify.success(`Hooray! We found ${response.data.totalHits} images.`);
        renderGallery(createTemplate(collectionOfImages));
        simpleLightbox.refresh();
        initialScroll();

        if (!isLastpage(response)) {
          window.addEventListener(
            'scroll',
            throttle(() => {
              const wievPortHeight = window.innerHeight;
              const bodyHeight = refs.galleryContainerEl.offsetHeight;
              const currentPosition = window.pageYOffset;
              const endOfPage = wievPortHeight + currentPosition >= bodyHeight;

              if (endOfPage && !isLastpage(response)) {
                onLoadMore();
              }
              return;
            }, 1000)
          );
          onshowLoader();
          return;
        } else {
          onHideLoader();
          renderLastMessage();
          return;
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
  <img class=gallery__img src="${webformatURL}" width='300' alt="${tags}" loading="lazy" /></div>
  <div class="info">
    <p class="info-item"><span class="parameter">
      Likes:</span> ${likes}
    </p>
    <p class="info-item"><span class="parameter">
      Views:</span> ${views}
    </p>
    <p class="info-item"><span class="parameter">
      Comments:</span> ${comments}
    </p>
    <p class="info-item"><span class="parameter">
      Downloads:</span> ${downloads}
    </p>
  
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
  pixabayApiService.incrementPage();
  pixabayApiService.fetchPictures().then(response => {
    renderGallery(createTemplate(response.data.hits));
    initialScroll();
    simpleLightbox.refresh();

    if (isLastpage(response)) {
      onHideLoader();
      renderLastMessage();
    } else {
      onshowLoader();
    }
  });
}

function onClearGallery() {
  refs.galleryContainerEl.innerHTML = '';
}

function onshowLoader() {
  if (refs.loaderEl.classList.contains('hidden')) {
    refs.loaderEl.classList.remove('hidden');
  }
  return;
}

function onHideLoader() {
  if (!refs.loaderEl.classList.contains('hidden')) {
    refs.loaderEl.classList.add('hidden');
  }
}

function isLastpage(response) {
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

// async function infinityScroll() {
//   const wievPortHeight = window.innerHeight;
//   const bodyHeight = refs.galleryContainerEl.offsetHeight;
//   const currentPosition = window.pageYOffset;
//   const endOfPage = wievPortHeight + currentPosition >= bodyHeight;
//   const jsjrb = window.scrollY;

//   console.log(jsjrb);
//   console.log(wievPortHeight);
//   console.log(bodyHeight);
//   console.log(currentPosition);
//   console.log(endOfPage);
//   if (endOfPage) {
//     await onLoadMore();
//   }
// }
