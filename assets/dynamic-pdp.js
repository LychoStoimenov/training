const destination = document.querySelector('.js-dynamic-product');
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

btn.addEventListener('click', function () {
  const value = input.value;
  const isId = onlyNumbers(value);
  let incorrectValue = 'handle';

  let searchParam = `handle: "${value}"`;

  if (isId) {
    incorrectValue = 'ID';
    searchParam = `id: "gid://shopify/Product/${value}"`;
  }

  fetch(`//${window.location.host}/api/2022-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': 'be68f875893107e3d878cf57a0a7abdd',
      'Content-Type': 'application/graphql',
    },
    body: `query {
      product(${searchParam}) {
        id,
        title,
        description,
        images(first: 5) {
          edges {
            node {
              originalSrc
            }
          }
        },
        variants(first: 10) {
          edges {
            node {
              id,
              price,
              quantityAvailable,
              compareAtPrice,
              title
            }
          }
        }
      }
    }`,
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data.data.product);
      const product = data.data.product;

      if (product != null) {
        error.style.display = 'none';
        const defaultVariant = product.variants.edges[0].node;
        const variants = product.variants.edges;
        const images = product.images.edges;

        let imagesItemsHTML = ``;
        let imagesThumbsItemsHTML = ``;
        let imagesHTML = ``;
        let optionsHTML = ``;
        let variantsHTML = ``;
        let titleHTML = '';
        let descriptionHTML = '';
        let defaultPriceHTML = '';

        variants.forEach((el) => {
          const variant = el.node;
          let priceOutput = '';

          if (variant.compareAtPrice == null) {
            priceOutput = `
              <span>${variant.price} BGN</span>
            `;
          } else {
            priceOutput = `
              <del>${variant.compareAtPrice} BGN</del>
              <ins>${variant.price} BGN</ins>
            `;
          }

          const option = `
            <option value="${variant.id.split('Variant/')[1]}" data-inventory="${variant.quantityAvailable}" data-price="${priceOutput}">
              ${variant.title}
            </option>
          `;

          optionsHTML = optionsHTML + option;
        });

        images.forEach((el) => {
          const imgSrc = el.node.originalSrc;

          const imageHTML = `
            <div class="product__image swiper-slide">
              <div class="product__image-inner">
                <img src="${imgSrc}" alt="Image">
              </div>
            </div>
          `;

          imagesItemsHTML = imagesItemsHTML + imageHTML;
          imagesThumbsItemsHTML = imagesThumbsItemsHTML + imageHTML;
        });

        //variants
        variantsHTML = `
          <div class="product__variants">
            <select name="variants" id="variants">
              ${optionsHTML}
            </select>
          </div>
        `;

        //images
        imagesHTML = `
          <div class="product__images">
            <div class="slider-main-images">
              <div class="swiper">
                <div class="swiper-wrapper">
                  ${imagesItemsHTML}
                </div>
              </div>
            </div>

            <div class="slider-thumbs-images">
              <div class="swiper">
                <div class="swiper-wrapper">
                  ${imagesThumbsItemsHTML}
                </div>
              </div>
            </div>
          </div>
        `;

        //title
        if (product.title != null) {
          titleHTML = `
            <h2 class="product__title">
              ${product.title}
            </h2>
          `;
        }

        //description
        if (product.description != null) {
          descriptionHTML = `
            <div class="product__description">
              ${product.description}
            </div>
          `;
        }

        //price / comparePrice
        if (defaultVariant.compareAtPrice == null) {
          defaultPriceHTML = `
            <div class="product__price">
              <span>${defaultVariant.price} BGN</span>
            </div>
          `;
        } else {
          defaultPriceHTML = `
            <div class="product__price">
              <del>${defaultVariant.compareAtPrice} BGN</del>
              <ins>${defaultVariant.price} BGN</ins>
            </div>
          `;
        }

        const source = `
          <div class="product__inner">
            ${imagesHTML}
            <div class="product__content">
              <div class="product__content-inner">
                ${titleHTML}
                ${defaultPriceHTML}
                ${descriptionHTML}
                <div class="product__actions">
                  ${variantsHTML}
                  <button class="product__btn btn">
                    Add to Cart
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;

        destination.innerHTML = source;

        const mainSliderContainer = destination.querySelector('.slider-main-images');
        const mainSlider = mainSliderContainer.querySelector('.swiper');
        const thumbsSliderContainer = destination.querySelector('.slider-thumbs-images');
        const thumbsSlider = thumbsSliderContainer.querySelector('.swiper');

        const myThumsSlider = new Swiper(thumbsSlider, {
          slidesPerView: 3,
          slideToClickedSlide: true,
          spaceBetween: 25,
        });

        const myMainSlider = new Swiper(mainSlider, {
          thumbs: {
            swiper: myThumsSlider,
          },
        });

        const selectVariants = destination.querySelector('select');
        const priceDestination = destination.querySelector('.product__price');
        const addToCart = destination.querySelector('.product__btn');

        selectVariants.addEventListener('change', function () {
          const selectedValue = this.value;

          selectVariants.querySelectorAll('option').forEach((option) => {
            if (option.value == selectedValue) {
              const changedPrice = option.dataset.price;
              priceDestination.innerHTML = changedPrice;
            }
          });
        });

        addToCart.addEventListener('click', function () {
          // console.log(123);
          // fetch(`//${window.location.host}/api/2022-04/graphql.json`, {
          //   method: 'POST',
          //   headers: {
          //     'X-Shopify-Storefront-Access-Token': 'be68f875893107e3d878cf57a0a7abdd',
          //     'Content-Type': 'application/graphql',
          //   },
          //   body: `mutation {
          //   cartCreate(
          //     input: {
          //       lines: [
          //         {
          //           quantity: 1
          //           merchandiseId: "gid://shopify/ProductVariant/42557848944797"
          //         }
          //       ]
          //       attributes: { key: "cart_attribute", value: "This is a cart attribute" }
          //     }
          //   ) {
          //     cart {
          //       id
          //       createdAt
          //       updatedAt
          //       lines(first: 10) {
          //         edges {
          //           node {
          //             id
          //             merchandise {
          //               ... on ProductVariant {
          //                 id
          //               }
          //             }
          //           }
          //         }
          //       }
          //       attributes {
          //         key
          //         value
          //       }
          //     }
          //   }
          // }
          // `,
          // })
          //   .then((res) => {
          //     return res.json();
          //   })
          //   .then((data) => {
          //     console.log(data);
          //     const cartID = data.data.cartCreate.cart.id;
          //     fetch(`//${window.location.host}/api/2022-04/graphql.json`, {
          //       method: 'POST',
          //       headers: {
          //         'X-Shopify-Storefront-Access-Token': 'be68f875893107e3d878cf57a0a7abdd',
          //         'Content-Type': 'application/graphql',
          //       },
          //       body: `query checkoutURL {
          //         cart(id: "${cartID}") {
          //           checkoutUrl
          //         }
          //       }
          //     `,
          //     });
          //   });
        });
      } else {
        error.style.display = 'block';
        error.textContent = `Incorrect ${incorrectValue}`;
        destination.innerHTML = '';
      }
    });
});
