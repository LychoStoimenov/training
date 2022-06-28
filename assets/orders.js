function setCookie(c_name, value, exdays) {
  var c_value = escape(value);
  if (exdays) {
    var exdate = new Date();
    exdate.setDate(exdate.getDate() + exdays);
    c_value += '; expires=' + exdate.toUTCString();
  }
  document.cookie = c_name + '=' + c_value + '; path=/';
}

function getCookie(c_name) {
  var i,
    x,
    y,
    cookies = document.cookie.split(';');

  for (i = 0; i < cookies.length; i++) {
    x = cookies[i].substr(0, cookies[i].indexOf('='));
    y = cookies[i].substr(cookies[i].indexOf('=') + 1);
    x = x.replace(/^\s+|\s+$/g, '');

    if (x === c_name) {
      return unescape(y);
    }
  }
}

function deleteCookie(c_name) {
  document.cookie = `cookiename=${c_name} ; expires = Thu, 01 Jan 1970 00:00:00 GMT`;
}

if (document.querySelector('.js-btn-login') != null) {
  document.querySelector('.js-btn-login').addEventListener('click', function () {
    const form = this.closest('form');
    const passField = form.querySelector('.js-field-pass');
    const emailField = form.querySelector('.js-field-email');

    setCookie('accessTokenEmail', emailField.value, 30);
    setCookie('accessTokenPass', passField.value, 30);
  });
}

if (getCookie('accessTokenEmail') && getCookie('accessTokenPass')) {
  var email = getCookie('accessTokenEmail');
  var password = getCookie('accessTokenPass');

  function createToken(customerEmail, customerPassword) {
    const query = `mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
        customerAccessTokenCreate(input: $input) {
            customerUserErrors {
              code
              field
              message
            }
            customerAccessToken {
              accessToken
              expiresAt
            }
        }
    }`;

    fetch(`//${window.location.host}/api/2022-04/graphql.json`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'X-Shopify-Storefront-Access-Token': 'be68f875893107e3d878cf57a0a7abdd',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
        variables: {
          input: {
            email: email,
            password: password,
          },
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        const myToken = data.data.customerAccessTokenCreate.customerAccessToken.accessToken;

        // SHOW UNFULFILLED ORDERS - START
        fetch(`//${window.location.host}/api/2022-04/graphql.json`, {
          method: 'POST',
          headers: {
            'X-Shopify-Storefront-Access-Token': 'be68f875893107e3d878cf57a0a7abdd',
            'Content-Type': 'application/graphql',
          },
          body: `query {
            customer(customerAccessToken: "${myToken}") {
              id,
              orders(first: 50) {
                edges {
                  node {
                    fulfillmentStatus
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
            const allOrders = data.data.customer.orders.edges;
            const ordersLength = allOrders.length;
            let unfulfilled = 0;

            allOrders.forEach((ord) => {
              const orderStatus = ord.node.fulfillmentStatus;

              if (orderStatus == 'UNFULFILLED') {
                unfulfilled++;
              }
            });

            if (ordersLength == 0) {
              document.querySelector('.js-orders-text').textContent = "You don't have any orders yet";
            } else {
              if (ordersLength > unfulfilled && unfulfilled != 0) {
                document.querySelector('.js-orders-text').textContent = `You have ${unfulfilled} incomplete orders`;
              } else if (unfulfilled == 0) {
                document.querySelector('.js-orders-text').textContent = 'All of your orders were completed';
              }
            }
          });
        // SHOW UNFULFILLED ORDERS - END

        if (document.querySelector('.section-order-status') != null) {
          document.querySelector('.js-find-order').addEventListener('click', function () {
            document.querySelector('.section-order-status tbody').innerHTML = '';

            const orderID = document.querySelector('.js-order-id').value;

            fetch(`//${window.location.host}/api/2022-04/graphql.json`, {
              method: 'POST',
              headers: {
                'X-Shopify-Storefront-Access-Token': 'be68f875893107e3d878cf57a0a7abdd',
                'Content-Type': 'application/graphql',
              },
              body: `query {
                customer(customerAccessToken: "${myToken}") {
                  id,
                  firstName,
                  lastName,
                  orders(first: 50, query:"id:${orderID}") {
                    edges {
                      node {
                        id,
                        orderNumber,
                        fulfillmentStatus,
                        currentSubtotalPrice {
                          amount,
                          currencyCode
                        },
                        originalTotalPrice {
                          amount,
                          currencyCode
                        },
                        shippingAddress {
                          address1,
                          address2,
                          city,
                          country,
                          name,
                          zip
                        },
                        lineItems(first: 5) {
                          edges {
                            node {
                              title,
                              quantity,
                              variant {
                                sku,
                                priceV2 {
                                  amount,
                                  currencyCode
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }`,
            })
              .then((res) => {
                return res.json();
              })
              .then((dat) => {
                const customer = dat.data.customer;
                const ordersLength = customer.orders.edges.length;

                if (ordersLength > 0) {
                  document.querySelector('.section-order-status').classList.add('has-order');
                  document.querySelector('.section-order-status').classList.remove('has-no-order');
                  const order = customer.orders.edges[0].node;

                  const infoHtml = `
                    <div class="box-info">
                      <h3>Cusotmer:</h3>
                      <p>
                        First Name: ${customer.firstName}
                      </p>
                      <p>
                        Last Name: ${customer.lastName}
                      </p>
                      <p>
                        Customer ID: ${customer.id.split('Customer/')[1]}
                      </p>
                    </div>
                    <div class="box-info">
                      <h3>Order:</h3>
                      <p>
                        Order Number: #${order.orderNumber}
                      </p>
                      <p>
                        Order ID: ${order.id.split('Order/')[1].split('?')[0]}
                      </p>
                      <p>
                        STATUS: ${order.fulfillmentStatus}
                      </p>
                    </div>
                  `;

                  const billingHtml = `
                    <div class="box-info">
                      <h3>Billing</h3>

                      <p>
                        Full name: ${order.shippingAddress.name}
                      </p>
                      <p>
                        Country: ${order.shippingAddress.country}
                      </p>
                      <p>
                        City ${order.shippingAddress.city}
                      </p>
                      <p>
                        Address: ${order.shippingAddress.address1}
                      </p>
                      <p>
                        Zip: ${order.shippingAddress.zip}
                      </p>
                    </div>
                  `;

                  const lineItems = order.lineItems.edges;

                  document.querySelector('.section__customer-info').innerHTML = infoHtml;
                  document.querySelector('.section__customer-billing').innerHTML = billingHtml;

                  lineItems.forEach((lineItem) => {
                    const item = lineItem.node;

                    const itemHtml = `
                      <td>
                        ${item.quantity}
                      </td>
                      <td>
                        ${item.title}
                      </td>
                      <td>
                        ${item.variant.sku}
                      </td>
                      <td>
                        ${item.variant.priceV2.amount} ${item.variant.priceV2.currencyCode}
                      </td>
                    `;

                    document.querySelector('.section-order-status tbody').innerHTML =
                      document.querySelector('.section-order-status tbody').innerHTML + itemHtml;
                  });

                  const htmlTotal = `
                    <td></td>
                    <td></td>
                    <td>
                      Discounts: <br>
                      ${order.originalTotalPrice.amount - order.currentSubtotalPrice.amount} ${order.currentSubtotalPrice.currencyCode}
                    </td>
                    <td>
                      TOTAL: <br>
                      ${order.currentSubtotalPrice.amount} ${order.currentSubtotalPrice.currencyCode}
                    </td>
                  `;

                  document.querySelector('.section-order-status tfoot').innerHTML = htmlTotal;
                } else {
                  document.querySelector('.section-order-status').classList.add('has-no-order');
                  document.querySelector('.section-order-status').classList.remove('has-order');
                }
              });
          });
        }
      });

    // const Http = new XMLHttpRequest();
    // const url = `//${window.location.host}/api/2022-04/graphql.json`;
    // Http.open('POST', url);
    // Http.setRequestHeader('Accept', 'application/json');
    // Http.setRequestHeader('Content-Type', 'application/json');

    // // This access token is safe to include client-side
    // Http.setRequestHeader('X-Shopify-Storefront-Access-Token', 'be68f875893107e3d878cf57a0a7abdd');

    // // Set the body
    // // https://graphql.org/learn/serving-over-http/
    // var requestBody = {
    //   query: query,
    //   variables: {
    //     input: {
    //       email: email,
    //       password: password,
    //     },
    //   },
    // };

    // const myData = JSON.stringify(requestBody);

    // Http.send(myData);
  }

  createToken(email, password);
}

var array_one = ['a', 'b', 'c', 'd'];
var array_two = ['z', 'x', 'y', 'a', 'c'];
let matches = 0;
array_one.forEach(function (item) {
  var isPresent = array_two.indexOf(item);
  if (isPresent !== -1) {
    matches++;
    console.log(item);
  }
});

console.log(matches);
