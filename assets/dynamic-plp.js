const destination = document.querySelector('.js-dynamic-collection-content');
let cursor = '';
let nextPage = false;
let searchParam;

const btnFilter = document.querySelector('.js-filter-price');
const minField = document.querySelector('.js-filter-min-price');
const maxField = document.querySelector('.js-filter-max-price');

const gridBtn = document.querySelector('.js-grid-view');
const listBtn = document.querySelector('.js-list-view');
const views = document.querySelector('.collection__filters');
const loadMore = document.querySelector('.js-add-more-items');
const loadMoreFiltered = document.querySelector('.js-add-more-filtered-items');
const showFilters = document.querySelector('.collection__filter-btn');

showFilters.addEventListener('click', function () {
  document.querySelector('.filter-price').classList.toggle('is-active');
});

gridBtn.addEventListener('click', function () {
  this.classList.add('is-active');
  listBtn.classList.remove('is-active');
  destination.classList.remove('has-list-view');
});

listBtn.addEventListener('click', function () {
  this.classList.add('is-active');
  gridBtn.classList.remove('is-active');
  destination.classList.add('has-list-view');
});

const input = document.querySelector('.js-find-pdp');
const btn = document.querySelector('.js-find-pdp-btn');
const error = document.querySelector('.js-find-pdp-error');

function onlyNumbers(str) {
  return /^[0-9.,]+$/.test(str);
}

input.addEventListener('keyup', function () {
  const val = this.value;

  if (val != '') {
    btn.classList.add('is-active');
  } else {
    btn.classList.remove('is-active');
  }
});

function initialLoad(search, err) {
  fetch(`//${window.location.host}/api/2022-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': 'be68f875893107e3d878cf57a0a7abdd',
      'Content-Type': 'application/graphql',
    },
    body: `query {
      collection(${search}) {
        id,
        title,
        products(first: 2) {
          edges {
            cursor,
            node {
              handle,
              title,
              images(first: 2) {
                edges {
                  node {
                    originalSrc
                  }
                }
              },
              priceRange {
                minVariantPrice {
                  amount,
                  currencyCode
                },
                maxVariantPrice {
                  amount
                },
              },
              variants(first: 10) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          },
          pageInfo {
            hasNextPage,
            hasPreviousPage,
            endCursor
          }
        }
      }
    }`,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);

      const collection = data.data.collection;

      if (collection != null) {
        views.classList.add('is-active');
        error.style.display = 'none';
        const pageInfo = collection.products.pageInfo;

        let productItemsHTML = ``;

        const collectionTitleHTML = `
          <h2 class="collection__title">
            ${collection.title}
          </h2>
        `;

        collection.products.edges.forEach((el) => {
          const product = el.node;

          const imagesLength = product.images.edges.length;
          const variantsLength = product.variants.edges.length;
          const minPrice = product.priceRange.minVariantPrice;

          let classHover = '';
          let productItemImages = '';
          if (imagesLength > 1) {
            classHover = 'has-image-hover';

            productItemImages = `
              <div class="product__image-inner">
                <img src="${product.images.edges[0].node.originalSrc}" alt="Image">
              </div>
              <div class="product__image-inner">
                <img src="${product.images.edges[1].node.originalSrc}" alt="Image">
              </div>
            `;
          } else {
            classHover = '';
            productItemImages = `
              <div class="product__image-inner">
                <img src="${product.images.edges[0].node.originalSrc}" alt="Image">
              </div>
            `;
          }

          const productURL = `/products/${product.handle}`;

          let priceHTML = '';
          if (variantsLength == 1) {
            priceHTML = `
              <div class="product__price">
                <span>${minPrice.amount} ${minPrice.currencyCode}</span>
              </div>
            `;
          } else {
            priceHTML = `
              <div class="product__price">
                <ins>as low as:</ins> <span>${minPrice.amount} ${minPrice.currencyCode}</span>
              </div>
            `;
          }

          const productItemHTML = `
            <div class="collection__item">
              <div class="product-grid-item">
                <div class="product__inner">
                  <a href="${productURL}" class="product__image ${classHover}">
                    ${productItemImages}
                  </a>
                  <div class="product__content">
                    <h3 class="product__title">
                      <a href="${productURL}">${product.title}</a>
                    </h3>
                    ${priceHTML}
                  </div>
                </div>
              </div>
            </div>
          `;

          productItemsHTML = productItemsHTML + productItemHTML;
        });

        const source = `
          <div class="collection__inner">
            <header class="collection__head">
              ${collectionTitleHTML}
            </header>
            <div class="collection__body">
              <div class="collection__items">
                ${productItemsHTML}
              </div>
            </div>
          </div>
        `;

        destination.innerHTML = source;
        nextPage = pageInfo.hasNextPage;
        if (pageInfo.hasNextPage) {
          cursor = pageInfo.endCursor;
          loadMore.classList.remove('is-hidden');
        } else {
          loadMore.classList.add('is-hidden');
        }
      } else {
        views.classList.remove('is-active');
        error.style.display = 'block';
        error.textContent = `Incorrect ${err}`;
        destination.innerHTML = '';
      }
    });
}

btn.addEventListener('click', function () {
  const value = input.value;
  const isId = onlyNumbers(value);
  let incorrectValue = 'handle';

  document.querySelector('.filter-price').classList.remove('is-active');

  minField.value = '';
  maxField.value = '';
  loadMoreFiltered.classList.add('is-hidden');

  searchParam = `handle: "${value}"`;

  if (isId) {
    incorrectValue = 'ID';
    searchParam = `id: "gid://shopify/Collection/${value}"`;
  }

  initialLoad(searchParam, incorrectValue);
});

loadMore.addEventListener('click', function () {
  console.log(nextPage);
  fetch(`//${window.location.host}/api/2022-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': 'be68f875893107e3d878cf57a0a7abdd',
      'Content-Type': 'application/graphql',
    },
    body: `query {
      collection(${searchParam}) {
        id,
        title,
        products(first: 1, after: "${cursor}") {
          edges {
            cursor,
            node {
              handle,
              title,
              images(first: 2) {
                edges {
                  node {
                    originalSrc
                  }
                }
              },
              priceRange {
                minVariantPrice {
                  amount,
                  currencyCode
                },
                maxVariantPrice {
                  amount
                },
              },
              variants(first: 10) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          },
          pageInfo {
            hasNextPage,
            hasPreviousPage,
            endCursor
          }
        }
      }
    }`,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);

      const collection = data.data.collection;
      const pageInfo = collection.products.pageInfo;

      nextPage = pageInfo.hasNextPage;
      if (pageInfo.hasNextPage) {
        cursor = pageInfo.endCursor;
      }

      let productItemsHTML = ``;

      const collectionTitleHTML = `
        <h2 class="collection__title">
          ${collection.title}
        </h2>
      `;

      collection.products.edges.forEach((el) => {
        const product = el.node;

        const imagesLength = product.images.edges.length;
        const variantsLength = product.variants.edges.length;
        const minPrice = product.priceRange.minVariantPrice;

        let classHover = '';
        let productItemImages = '';
        if (imagesLength > 1) {
          classHover = 'has-image-hover';

          productItemImages = `
            <div class="product__image-inner">
              <img src="${product.images.edges[0].node.originalSrc}" alt="Image">
            </div>
            <div class="product__image-inner">
              <img src="${product.images.edges[1].node.originalSrc}" alt="Image">
            </div>
          `;
        } else {
          classHover = '';
          productItemImages = `
            <div class="product__image-inner">
              <img src="${product.images.edges[0].node.originalSrc}" alt="Image">
            </div>
          `;
        }

        const productURL = `/products/${product.handle}`;

        let priceHTML = '';
        if (variantsLength == 1) {
          priceHTML = `
            <div class="product__price">
              <span>${minPrice.amount} ${minPrice.currencyCode}</span>
            </div>
          `;
        } else {
          priceHTML = `
            <div class="product__price">
              <ins>as low as</ins> <span>${minPrice.amount} ${minPrice.currencyCode}</span>
            </div>
          `;
        }

        const productItemHTML = `
          <div class="collection__item">
            <div class="product-grid-item">
              <div class="product__inner">
                <a href="${productURL}" class="product__image ${classHover}">
                  ${productItemImages}
                </a>
                <div class="product__content">
                  <h3 class="product__title">
                    <a href="${productURL}">${product.title}</a>
                  </h3>
                  ${priceHTML}
                </div>
              </div>
            </div>
          </div>
        `;

        productItemsHTML = productItemsHTML + productItemHTML;
      });

      const newDestination = destination.querySelector('.collection__items');

      newDestination.innerHTML = newDestination.innerHTML + productItemsHTML;

      if (!nextPage) {
        loadMore.classList.add('is-hidden');
      }
    });
});

// FILTER BY PRICE

let minFilter = '0';
let maxFilter = '10000';

btnFilter.addEventListener('click', function () {
  document.querySelector('.filter-price').classList.remove('is-active');

  if (minField.value != '') {
    minFilter = minField.value.toString();
  } else {
    minFilter = '0';
  }

  if (maxField.value != '') {
    maxFilter = maxField.value.toString();
  } else {
    maxFilter = '10000';
  }

  loadMore.classList.add('is-hidden');

  console.log(minFilter);
  console.log(maxFilter);

  fetch(`//${window.location.host}/api/2022-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': 'be68f875893107e3d878cf57a0a7abdd',
      'Content-Type': 'application/graphql',
    },
    body: `query myCollectionWithProducts {
        collection(${searchParam}) {
          id,
          title,
          products(first: 2, filters: { price: { min: ${minFilter}, max: ${maxFilter} }} ) {
            edges {
              cursor,
              node {
                handle,
                title,
                images(first: 2) {
                  edges {
                    node {
                      originalSrc
                    }
                  }
                },
                priceRange {
                  minVariantPrice {
                    amount,
                    currencyCode
                  },
                  maxVariantPrice {
                    amount
                  },
                },
                variants(first: 10) {
                  edges {
                    node {
                      id
                    }
                  }
                }
              }
            },
            pageInfo {
              hasNextPage,
              hasPreviousPage,
              endCursor
            }
          }
        }
      }`,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);

      const collection = data.data.collection;

      if (collection != null) {
        // views.classList.add('is-active');
        // error.style.display = 'none';
        const pageInfo = collection.products.pageInfo;

        let productItemsHTML = ``;

        const collectionTitleHTML = `
            <h2 class="collection__title">
              ${collection.title}
            </h2>
          `;

        collection.products.edges.forEach((el) => {
          const product = el.node;

          const imagesLength = product.images.edges.length;
          const variantsLength = product.variants.edges.length;
          const minPrice = product.priceRange.minVariantPrice;

          let classHover = '';
          let productItemImages = '';
          if (imagesLength > 1) {
            classHover = 'has-image-hover';

            productItemImages = `
                <div class="product__image-inner">
                  <img src="${product.images.edges[0].node.originalSrc}" alt="Image">
                </div>
                <div class="product__image-inner">
                  <img src="${product.images.edges[1].node.originalSrc}" alt="Image">
                </div>
              `;
          } else {
            classHover = '';
            productItemImages = `
                <div class="product__image-inner">
                  <img src="${product.images.edges[0].node.originalSrc}" alt="Image">
                </div>
              `;
          }

          const productURL = `/products/${product.handle}`;

          let priceHTML = '';
          if (variantsLength == 1) {
            priceHTML = `
                <div class="product__price">
                  <span>${minPrice.amount} ${minPrice.currencyCode}</span>
                </div>
              `;
          } else {
            priceHTML = `
                <div class="product__price">
                  <ins>as low as:</ins> <span>${minPrice.amount} ${minPrice.currencyCode}</span>
                </div>
              `;
          }

          const productItemHTML = `
              <div class="collection__item">
                <div class="product-grid-item">
                  <div class="product__inner">
                    <a href="${productURL}" class="product__image ${classHover}">
                      ${productItemImages}
                    </a>
                    <div class="product__content">
                      <h3 class="product__title">
                        <a href="${productURL}">${product.title}</a>
                      </h3>
                      ${priceHTML}
                    </div>
                  </div>
                </div>
              </div>
            `;

          productItemsHTML = productItemsHTML + productItemHTML;
        });

        const source = `
            <div class="collection__inner">
              <header class="collection__head">
                ${collectionTitleHTML}
              </header>
              <div class="collection__body">
                <div class="collection__items">
                  ${productItemsHTML}
                </div>
              </div>
            </div>
          `;

        // console.log(source);

        destination.innerHTML = source;
        nextPage = pageInfo.hasNextPage;
        console.log(nextPage);

        if (pageInfo.hasNextPage) {
          cursor = pageInfo.endCursor;
          loadMoreFiltered.classList.remove('is-hidden');
        } else {
          loadMoreFiltered.classList.add('is-hidden');
        }
      }
    });
});

// Load More Filtered
loadMoreFiltered.addEventListener('click', function () {
  console.log(nextPage);

  if (minField.value != '') {
    minFilter = minField.value.toString();
  } else {
    minFilter = '0';
  }

  if (maxField.value != '') {
    maxFilter = maxField.value.toString();
  } else {
    maxFilter = '10000';
  }

  fetch(`//${window.location.host}/api/2022-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': 'be68f875893107e3d878cf57a0a7abdd',
      'Content-Type': 'application/graphql',
    },
    body: `query {
      collection(${searchParam}) {
        id,
        title,
        products(first: 1, after: "${cursor}", filters: { price: { min: ${minFilter}, max: ${maxFilter} }}) {
          edges {
            cursor,
            node {
              handle,
              title,
              images(first: 2) {
                edges {
                  node {
                    originalSrc
                  }
                }
              },
              priceRange {
                minVariantPrice {
                  amount,
                  currencyCode
                },
                maxVariantPrice {
                  amount
                },
              },
              variants(first: 10) {
                edges {
                  node {
                    id
                  }
                }
              }
            }
          },
          pageInfo {
            hasNextPage,
            hasPreviousPage,
            endCursor
          }
        }
      }
    }`,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);

      const collection = data.data.collection;
      const pageInfo = collection.products.pageInfo;

      nextPage = pageInfo.hasNextPage;
      if (pageInfo.hasNextPage) {
        cursor = pageInfo.endCursor;
      }

      let productItemsHTML = ``;

      const collectionTitleHTML = `
        <h2 class="collection__title">
          ${collection.title}
        </h2>
      `;

      collection.products.edges.forEach((el) => {
        const product = el.node;

        const imagesLength = product.images.edges.length;
        const variantsLength = product.variants.edges.length;
        const minPrice = product.priceRange.minVariantPrice;

        let classHover = '';
        let productItemImages = '';
        if (imagesLength > 1) {
          classHover = 'has-image-hover';

          productItemImages = `
            <div class="product__image-inner">
              <img src="${product.images.edges[0].node.originalSrc}" alt="Image">
            </div>
            <div class="product__image-inner">
              <img src="${product.images.edges[1].node.originalSrc}" alt="Image">
            </div>
          `;
        } else {
          classHover = '';
          productItemImages = `
            <div class="product__image-inner">
              <img src="${product.images.edges[0].node.originalSrc}" alt="Image">
            </div>
          `;
        }

        const productURL = `/products/${product.handle}`;

        let priceHTML = '';
        if (variantsLength == 1) {
          priceHTML = `
            <div class="product__price">
              <span>${minPrice.amount} ${minPrice.currencyCode}</span>
            </div>
          `;
        } else {
          priceHTML = `
            <div class="product__price">
              <ins>as low as</ins> <span>${minPrice.amount} ${minPrice.currencyCode}</span>
            </div>
          `;
        }

        const productItemHTML = `
          <div class="collection__item">
            <div class="product-grid-item">
              <div class="product__inner">
                <a href="${productURL}" class="product__image ${classHover}">
                  ${productItemImages}
                </a>
                <div class="product__content">
                  <h3 class="product__title">
                    <a href="${productURL}">${product.title}</a>
                  </h3>
                  ${priceHTML}
                </div>
              </div>
            </div>
          </div>
        `;

        productItemsHTML = productItemsHTML + productItemHTML;
      });

      const newDestination = destination.querySelector('.collection__items');

      newDestination.innerHTML = newDestination.innerHTML + productItemsHTML;

      if (!nextPage) {
        loadMoreFiltered.classList.add('is-hidden');
      }
    });
});
