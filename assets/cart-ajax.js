// CART API --- ADD
const initAddToCart = (id, quantity) => {
  const config = {
    items: [
      {
        id,
        quantity,
      },
    ],
  };

  fetch('/cart/add.js', {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify(config),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      if (data.description) {
        console.log(data.description);
      } else {
        console.log(data);
      }
    });
};

// CART API --- REMOVE
const initRemoveCartItem = (id, quantity) => {
  let updates = {};
  updates[id] = quantity;

  fetch(`/cart/update.js`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ updates }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
    });
};

// CART API --- UPDATE
const initCartUpdate = (id, quantity) => {
  let updates = {};
  updates[id] = quantity;

  fetch(`/cart/update.js`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({ updates }),
  })
    .then((res) => {
      return res.json();
    })
    .then((data) => {
      console.log(data);
    });
};

// Actions

const myProduct = document.querySelector('.js-product-id');
const myProductQty = document.querySelector('.js-qty-field');

if (document.querySelector('.js-btn-add') != null) {
  document.querySelector('.js-btn-add').addEventListener('click', function () {
    const myId = myProduct.value;
    const myQty = myProductQty.value;

    initAddToCart(myId, myQty);
  });

  document.querySelector('.js-btn-remove').addEventListener('click', function () {
    const myId = myProduct.value;
    initRemoveCartItem(myId, 0);
  });
  // qty

  function qtyAction(btn, action) {
    if (action == 'plus') {
      const input = btn.previousElementSibling;
      input.value++;
    } else {
      const input = btn.nextElementSibling;
      if (input.value > 0) {
        input.value--;
      }
    }
  }

  document.querySelectorAll('.qty').forEach((qty) => {
    qty.querySelectorAll('.qty__btn').forEach((button) => {
      button.addEventListener('click', function () {
        const act = this.dataset.action;
        qtyAction(this, act);
      });
    });
  });

  const getProduct = (productHandle) => {
    fetch(`/products/${productHandle}.js`, {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'GET',
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        console.log(data);
        const title = data.title;
        const description = data.description;
        const imageUrl = data.images[0];
        const priceA = data.price / 100.0;
        const price = priceA.toFixed(2);

        const myHtml = `
          <div class="product-simple">
            <h2 class="product__title">
              ${title}
            </h2>
            <div class="product__image">
              <img src="${imageUrl}" alt="Img">
            </div>
            <div class="product__price">
              <span>
                ${price} BGN
              </span>
            </div>
            <div class="product__descripion">
              ${description}
            </div>
          </div>
        `;

        document.querySelector('.js-product-show').innerHTML = myHtml;
      });
  };

  document.querySelector('.js-form-product').addEventListener('submit', function (e) {
    e.preventDefault();

    const myHandle = this.querySelector('input').value;

    getProduct(myHandle);
  });
}

const productEngraving = document.querySelector('.product-alt');

if (productEngraving != null) {
  let newConfig = {};
  let newItems = [];
  let props = {};

  const pdId = productEngraving.querySelector('.js-product-id').value;
  const pdQty = productEngraving.querySelector('.js-product-quantity').value;
  const engId = productEngraving.querySelector('.js-product-engraving-id').value;

  const testId = 40543276957853;
  const testQty = 1;

  document.querySelector('.js-add-test').addEventListener('click', function () {
    const engQty = productEngraving.querySelector('.js-engraving-message').value.replaceAll(' ', '').length;

    props = {};

    props[`Engraving`] = productEngraving.querySelector('.js-engraving-message').value;

    newItems.push({
      id: pdId,
      quantity: pdQty,
      properties: props,
    });

    newItems.push({
      id: engId,
      quantity: engQty,
      properties: {
        Engraving: productEngraving.querySelector('.js-engraving-message').value,
        Visibility: 'hidden',
      },
    });

    newConfig = {
      items: newItems,
    };

    fetch('/cart/add.js', {
      headers: {
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(newConfig),
    })
      .then((res) => {
        return res.json();
      })
      .then((data) => {
        if (data.description) {
          console.log(data.description);
        } else {
          console.log(data);
        }
      });
  });
}

document.querySelectorAll('.js-test').forEach((btn) => {
  btn.addEventListener('click', function () {
    const item = this.closest('tr');
    const itemEngravingText = item.dataset.engraving;

    const itemsToRemove = document.querySelectorAll(`[data-engraving="${itemEngravingText}"]`);

    let updates = {};

    itemsToRemove.forEach((itemToRemove) => {
      const idToRemove = itemToRemove.dataset.id;

      console.log(idToRemove);

      updates[idToRemove] = 0;

      setTimeout(function () {
        fetch(`/cart/update.js`, {
          headers: {
            'Content-Type': 'application/json',
          },
          method: 'POST',
          body: JSON.stringify({ updates }),
        })
          .then((res) => {
            return res.json();
          })
          .then((data) => {
            console.log(data);
          });
      }, 500);
    });
  });
});
