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
