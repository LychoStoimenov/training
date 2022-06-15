const popups = document.querySelectorAll('.js-popup');

popups.forEach((popup) => {
  const closeBtns = popup.querySelectorAll('.js-popup-close');

  closeBtns.forEach((closeBtn) => {
    closeBtn.addEventListener('click', function () {
      popup.classList.remove('is-active');
    });
  });
});

if (document.querySelector('.js-popup-home') != null) {
  if (sessionStorage.getItem('home-popup')) {
    setTimeout(function () {
      document.querySelector('.js-popup-home').classList.add('is-active');
    }, 10000);
  }

  sessionStorage.setItem('home-popup', 'will show');
}
