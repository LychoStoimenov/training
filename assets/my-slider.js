const sliders = document.querySelectorAll('.slider-default');

sliders.forEach((slider) => {
  const initSlider = slider.querySelector('.swiper');
  const dots = slider.querySelector('.swiper-pagination');

  const mySwiper = new Swiper(initSlider, {
    loop: true,
    pagination: {
      el: dots,
      clickable: true,
    },
  });
});

const slidersVideo = document.querySelectorAll('.slider-image-video');

slidersVideo.forEach((slider) => {
  const initSlider = slider.querySelector('.swiper');
  const dots = slider.querySelector('.swiper-pagination');

  const mySwiper = new Swiper(initSlider, {
    // loop: true,
    pagination: {
      el: dots,
      clickable: true,
    },
  });
});
