function batchDOMOperations(t) {
  requestAnimationFrame(() => {
    requestAnimationFrame(t);
  });
}
window.addEventListener("beforeunload", function () {
  window.amenitiesCarousel && window.amenitiesCarousel.stopAutoSlide(),
    window.galleryCarousel && window.galleryCarousel.stopAutoSlide(),
    window.floorPlanCarousel && window.floorPlanCarousel.stopAutoSlide(),
    window.carouselTimeouts &&
      (window.carouselTimeouts.forEach((t) => clearTimeout(t)),
      (window.carouselTimeouts = []));
}),
  window.addEventListener("pageshow", function (t) {
    t.persisted &&
      (window.amenitiesCarousel && window.amenitiesCarousel.startAutoSlide(),
      window.galleryCarousel && window.galleryCarousel.startAutoSlide(),
      window.floorPlanCarousel && window.floorPlanCarousel.startAutoSlide());
  });
// window.addEventListener("unload", function () {});
const burgerMenu = document.getElementById("burgerMenu"),
  headerNav = document.getElementById("headerNav");
burgerMenu.addEventListener("click", function (t) {
  t.stopPropagation(),
    batchDOMOperations(() => {
      burgerMenu.classList.toggle("active"),
        headerNav.classList.toggle("active"),
        (document.body.style.overflow = headerNav.classList.contains("active")
          ? "hidden"
          : "auto");
    });
}),
  document.querySelectorAll(".headerLink").forEach((t) => {
    t.addEventListener("click", function () {
      batchDOMOperations(() => {
        burgerMenu.classList.remove("active"),
          headerNav.classList.remove("active"),
          (document.body.style.overflow = "auto");
      });
    });
  }),
  document.addEventListener("click", function (t) {
    !headerNav.contains(t.target) &&
      !burgerMenu.contains(t.target) &&
      headerNav.classList.contains("active") &&
      batchDOMOperations(() => {
        burgerMenu.classList.remove("active"),
          headerNav.classList.remove("active"),
          (document.body.style.overflow = "auto");
      });
  }),
  window.addEventListener("resize", function () {
    window.innerWidth > 1024 &&
      headerNav.classList.contains("active") &&
      batchDOMOperations(() => {
        burgerMenu.classList.remove("active"),
          headerNav.classList.remove("active"),
          (document.body.style.overflow = "auto");
      });
  }),
  document.addEventListener("DOMContentLoaded", function () {
    // initBannerCarousel();
    window.amenitiesCarousel = new AmenitiesCarousel();
    let t = document.querySelector(".amenitiesSection");
    if (t) {
      let e = new IntersectionObserver(
        (t) => {
          t.forEach((t) => {
            batchDOMOperations(() => {
              t.isIntersecting
                ? t.target.classList.add("is-visible")
                : t.target.classList.remove("is-visible");
            });
          });
        },
        { root: null, rootMargin: "0px", threshold: 0.2 }
      );
      e.observe(t);
    }
    let i = document.querySelector(".priceSection");
    if (i) {
      let s = new IntersectionObserver(
        (t) => {
          t.forEach((t) => {
            batchDOMOperations(() => {
              t.isIntersecting
                ? t.target.classList.add("is-visible")
                : t.target.classList.remove("is-visible");
            });
          });
        },
        { root: null, rootMargin: "0px", threshold: 0.2 }
      );
      s.observe(i);
    }
    let l = document.querySelector(".gallerySection");
    if (l) {
      let n = new IntersectionObserver(
        (t) => {
          t.forEach((t) => {
            batchDOMOperations(() => {
              t.isIntersecting
                ? t.target.classList.add("is-visible")
                : t.target.classList.remove("is-visible");
            });
          });
        },
        { root: null, rootMargin: "0px", threshold: 0.1 }
      );
      n.observe(l);
    }
    let o = document.querySelector(".floorPlanSection");
    if (o) {
      let r = new IntersectionObserver(
        (t) => {
          t.forEach((t) => {
            batchDOMOperations(() => {
              t.isIntersecting
                ? t.target.classList.add("is-visible")
                : t.target.classList.remove("is-visible");
            });
          });
        },
        { root: null, rootMargin: "0px", threshold: 0.2 }
      );
      r.observe(o);
    }
  });
function initBannerCarousel() {
  const slidesContainer = document.getElementById("bannerSlides");
  if (!slidesContainer) return;
  const slides = Array.from(slidesContainer.querySelectorAll(".bannerSlide"));
  if (!slides.length) return;
  const dotsContainer = document.getElementById("bannerDots");
  const prevBtn = document.getElementById("bannerPrev");
  const nextBtn = document.getElementById("bannerNext");
  const totalSlides = slides.length;
  let currentIndex = slides.findIndex((slide) =>
    slide.classList.contains("is-active")
  );
  currentIndex = currentIndex >= 0 ? currentIndex : 0;
  slides.forEach((slide, idx) =>
    slide.classList.toggle("is-active", idx === currentIndex)
  );
  const dots = [];
  if (dotsContainer) {
    dotsContainer.innerHTML = "";
    dotsContainer.classList.remove("has-multiple");
    if (totalSlides > 1) {
      slides.forEach((_, index) => {
        const dot = document.createElement("button");
        dot.type = "button";
        dot.className = "bannerDot" + (index === currentIndex ? " active" : "");
        dot.setAttribute("aria-label", `Go to slide ${index + 1}`);
        dot.addEventListener("click", () => {
          if (index === currentIndex) return;
          showSlide(index);
          restartAuto();
        });
        dotsContainer.appendChild(dot);
        dots.push(dot);
      });
      dotsContainer.classList.add("has-multiple");
    }
  }
  if (prevBtn) prevBtn.style.display = totalSlides > 1 ? "" : "none";
  if (nextBtn) nextBtn.style.display = totalSlides > 1 ? "" : "none";
  function showSlide(targetIndex) {
    if (targetIndex === currentIndex) return;
    const nextIndex = (targetIndex + totalSlides) % totalSlides;
    slides[currentIndex].classList.remove("is-active");
    slides[nextIndex].classList.add("is-active");
    if (dots.length) {
      dots[currentIndex].classList.remove("active");
      dots[nextIndex].classList.add("active");
    }
    currentIndex = nextIndex;
  }
  let autoTimer = null;
  const autoDelay = 6e3;
  window.carouselTimeouts = window.carouselTimeouts || [];
  function scheduleAuto() {
    if (totalSlides <= 1) return;
    cancelAuto();
    autoTimer = setTimeout(() => {
      showSlide(currentIndex + 1);
      scheduleAuto();
    }, autoDelay);
    window.carouselTimeouts.push(autoTimer);
  }
  function cancelAuto() {
    if (autoTimer) {
      clearTimeout(autoTimer);
      autoTimer = null;
    }
  }
  function restartAuto() {
    cancelAuto();
    scheduleAuto();
  }
  if (prevBtn) {
    prevBtn.addEventListener("click", (event) => {
      event.preventDefault();
      showSlide(currentIndex - 1);
      restartAuto();
    });
  }
  if (nextBtn) {
    nextBtn.addEventListener("click", (event) => {
      event.preventDefault();
      showSlide(currentIndex + 1);
      restartAuto();
    });
  }
  const hoverTargets = [
    slidesContainer,
    prevBtn,
    nextBtn,
    dotsContainer,
  ].filter(Boolean);
  hoverTargets.forEach((target) => {
    target.addEventListener("mouseenter", cancelAuto);
    target.addEventListener("mouseleave", scheduleAuto);
    target.addEventListener("touchstart", cancelAuto, { passive: true });
    target.addEventListener("touchend", scheduleAuto, { passive: true });
  });
  scheduleAuto();
}

// Map dropdown functionality
const mapLength = document.querySelectorAll(".map-dropdown").length;
document.querySelectorAll(".map-dropdown-btn").forEach((btn, index) => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();
    if (btn.classList.contains("active")) {
      btn.classList.remove("active");
      document
        .querySelectorAll(".map-dropdown-content")
        [index].classList.remove("active");
      document.querySelectorAll(".map-arrow")[index].classList.remove("active");
      return;
    }

    // Close all other dropdowns
    for (let i = 0; i < mapLength; i++) {
      document
        .querySelectorAll(".map-dropdown-btn")
        [i].classList.remove("active");
      document
        .querySelectorAll(".map-dropdown-content")
        [i].classList.remove("active");
      document.querySelectorAll(".map-arrow")[i].classList.remove("active");
    }

    // Open current dropdown
    btn.classList.add("active");
    document
      .querySelectorAll(".map-dropdown-content")
      [index].classList.add("active");
    document.querySelectorAll(".map-arrow")[index].classList.add("active");
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const popupOverlay = document.querySelector("#quotePopup .quotePopupOverlay");
  const popupCloseButton = document.querySelector(
    "#quotePopup .quotePopupClose"
  );

  if (popupOverlay) {
    popupOverlay.addEventListener("click", closeQuotePopup);
  }

  if (popupCloseButton) {
    popupCloseButton.addEventListener("click", closeQuotePopup);
  }
});

// Close popup on Escape key
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeQuotePopup();
  }
});

class FloorPlanCarousel {
  constructor() {
    this.container = document.getElementById("masterPlan");
    (this.slides = document.getElementById("floorPlanSlides")),
      (this.indicators = document.getElementById("floorPlanIndicators")),
      (this.currentSlide = 0),
      (this.totalSlides = 3),
      (this.isMobile = window.innerWidth <= 1024),
      (this.autoSlideInterval = null),
      (this.autoSlideDelay = 4e3),
      this.init();
  }
  init() {
    this.isMobile &&
      (this.createIndicators(),
      this.setupEventListeners(),
      this.startAutoSlide());
  }
  createIndicators() {
    if (this.indicators) {
      this.indicators.innerHTML = "";
      for (let t = 0; t < this.totalSlides; t++) {
        let e = document.createElement("div");
        (e.className = `floorPlanDot ${0 === t ? "active" : ""}`),
          (e.onclick = () => this.currentSlide(t));
        this.indicators.appendChild(e);
      }
    }
  }
  setupEventListeners() {
    let startx = 0;
    this.container &&
      this.container.addEventListener("touchstart", (e) => {
        startx = e.touches[0].clientX;
      });
    this.container &&
      this.container.addEventListener("touchend", (e) => {
        let endx = e.changedTouches[0].clientX;
        if (startx > endx + 50) {
          this.nextSlide();
        } else if (startx < endx - 50) {
          this.changeSlide(-1);
        }
      });
    this.updateIndicators();
    let t = document.querySelector(".floorPlanCarousel");
    t &&
      (t.addEventListener("mouseenter", () => this.stopAutoSlide()),
      t.addEventListener("mouseleave", () => this.startAutoSlide()),
      t.addEventListener("touchstart", () => this.stopAutoSlide()),
      t.addEventListener("touchend", () => this.startAutoSlide()));
  }
  updateIndicators() {
    if (this.indicators) {
      let t = this.indicators.querySelectorAll(".floorPlanDot");
      t.forEach((t, e) => {
        batchDOMOperations(() => {
          t.classList.toggle("active", e === this.currentSlide);
        });
      });
    }
  }
  changeSlide(t) {
    this.isMobile &&
      ((this.currentSlide += t),
      this.currentSlide < 0
        ? (this.currentSlide = this.totalSlides - 1)
        : this.currentSlide >= this.totalSlides && (this.currentSlide = 0),
      this.updateSlidePosition(),
      this.updateIndicators());
  }
  currentSlide(t) {
    this.isMobile &&
      ((this.currentSlide = t),
      this.updateSlidePosition(),
      this.updateIndicators());
  }
  updateSlidePosition() {
    if (this.slides) {
      let t = -(33.333 * this.currentSlide);
      batchDOMOperations(() => {
        this.slides.style.transform = `translateX(${t}%)`;
      });
    }
  }
  handleResize() {
    (this.isMobile = window.innerWidth <= 768),
      this.isMobile
        ? (this.createIndicators(),
          this.updateSlidePosition(),
          this.startAutoSlide())
        : this.stopAutoSlide();
  }
  startAutoSlide() {
    this.isMobile &&
      (this.stopAutoSlide(),
      (this.autoSlideInterval = setInterval(() => {
        this.nextSlide();
      }, this.autoSlideDelay)));
  }
  stopAutoSlide() {
    this.autoSlideInterval &&
      (clearInterval(this.autoSlideInterval), (this.autoSlideInterval = null));
  }
  nextSlide() {
    this.isMobile &&
      ((this.currentSlide = (this.currentSlide + 1) % this.totalSlides),
      this.updateSlidePosition(),
      this.updateIndicators());
  }
}
// let floorPlanCarousel;
// function changeSlide(t) {
//     floorPlanCarousel &&
//         (floorPlanCarousel.changeSlide(t), floorPlanCarousel.isMobile && floorPlanCarousel.startAutoSlide());
// }
// function currentSlide(t) {
//     floorPlanCarousel &&
//         (floorPlanCarousel.currentSlide(t), floorPlanCarousel.isMobile && floorPlanCarousel.startAutoSlide());
// }
document.addEventListener("DOMContentLoaded", function () {
  (window.floorPlanCarousel = new FloorPlanCarousel()),
    window.addEventListener("resize", () => {
      window.floorPlanCarousel && window.floorPlanCarousel.handleResize();
    }),
    window.innerWidth <= 768 &&
      window.floorPlanCarousel &&
      window.floorPlanCarousel.updateSlidePosition(),
    (window.galleryCarousel = new GalleryCarousel());
});
class AmenitiesCarousel {
  constructor() {
    (this.container = document.getElementById("amenities")),
      (this.track = document.getElementById("amenitiesTrack")),
      (this.slides = document.querySelectorAll(".amenitiesSlide")),
      (this.prevBtn = document.getElementById("amenitiesPrev")),
      (this.nextBtn = document.getElementById("amenitiesNext")),
      (this.lightbox = document.getElementById("amenitiesLightbox")),
      (this.lightboxImage = document.getElementById("amenitiesLightboxImage")),
      (this.lightboxTitle = document.getElementById("amenitiesLightboxTitle")),
      (this.lightboxCounter = document.getElementById(
        "amenitiesLightboxCounter"
      )),
      (this.lightboxClose = document.getElementById("amenitiesLightboxClose")),
      (this.lightboxPrevBtn = document.getElementById("amenitiesLightboxPrev")),
      (this.lightboxNextBtn = document.getElementById("amenitiesLightboxNext")),
      (this.totalSlides = this.slides.length),
      (this.currentSlide = this.totalSlides),
      (this.autoSlideInterval = null),
      (this.autoSlideDelay = 5e3),
      (this.lightboxCurrentSlide = 0),
      (this.isTransitioning = !1),
      this.init();
  }
  init() {
    this.cloneSlides(),
      (this.slides = document.querySelectorAll(".amenitiesSlide")),
      this.setupEventListeners(),
      this.updateSlidePosition(!1),
      this.startAutoSlide();
  }
  cloneSlides() {
    let t = window.innerWidth >= 1025,
      e = t ? 3 : 1;
    for (let i = this.totalSlides - 1; i >= this.totalSlides - e; i--) {
      let s = this.slides[i].cloneNode(!0);
      s.classList.add("clone"),
        this.track.insertBefore(s, this.track.firstChild);
    }
    for (let l = 0; l < e; l++) {
      let n = this.slides[l].cloneNode(!0);
      n.classList.add("clone"), this.track.appendChild(n);
    }
  }
  setupEventListeners() {
    let startx = 0;
    this.prevBtn &&
      this.prevBtn.addEventListener("click", () => this.previousSlide()),
      this.nextBtn &&
        this.nextBtn.addEventListener("click", () => this.nextSlide()),
      this.lightboxClose &&
        this.lightboxClose.addEventListener("click", () =>
          this.closeLightbox()
        ),
      this.lightboxPrevBtn &&
        this.lightboxPrevBtn.addEventListener("click", () =>
          this.lightboxPrevious()
        ),
      this.lightboxNextBtn &&
        this.lightboxNextBtn.addEventListener("click", () =>
          this.lightboxNext()
        ),
      this.slides.forEach((t, e) => {
        t.addEventListener("click", () => this.openLightboxFromSlide(e));
      }),
      this.container &&
        this.container.addEventListener("touchstart", (e) => {
          startx = e.touches[0].clientX;
        });
    this.container &&
      this.container.addEventListener("touchend", (e) => {
        let endx = e.changedTouches[0].clientX;
        if (startx > endx + 50) {
          this.nextSlide();
        } else if (startx < endx - 50) {
          this.previousSlide();
        }
      });

    this.lightbox &&
      this.lightbox.addEventListener("touchstart", (e) => {
        startx = e.touches[0].clientX;
      });
    this.lightbox &&
      this.lightbox.addEventListener("touchend", (e) => {
        let endx = e.changedTouches[0].clientX;
        if (startx > endx + 50) {
          this.lightboxNext();
        } else if (startx < endx - 50) {
          this.lightboxPrevious();
        }
      });
    this.lightbox &&
      this.lightbox.addEventListener("click", (t) => {
        t.target === this.lightbox && this.closeLightbox();
      }),
      document.addEventListener("keydown", (t) => {
        if (this.lightbox && this.lightbox.classList.contains("active"))
          switch (t.key) {
            case "Escape":
              this.closeLightbox();
              break;
            case "ArrowLeft":
              this.lightboxPrevious();
              break;
            case "ArrowRight":
              this.lightboxNext();
          }
      });
    let t = document.querySelector(".amenitiesCarousel");
    t &&
      (t.addEventListener("mouseenter", () => this.stopAutoSlide()),
      t.addEventListener("mouseleave", () => this.startAutoSlide())),
      this.track &&
        this.track.addEventListener("transitionend", () =>
          this.handleTransitionEnd()
        ),
      window.addEventListener("resize", () => {
        this.handleResize();
      });
  }
  updateSlidePosition(t = !0) {
    let e = window.innerWidth >= 1025;
    if (this.track) {
      if ((t || (this.track.style.transition = "none"), e)) {
        let i = -(33.87 * this.currentSlide);
        this.track.style.transform = `translateX(${i}%)`;
      } else {
        let s = -(100 * this.currentSlide);
        this.track.style.transform = `translateX(${s}%)`;
      }
      t || (this.track.offsetHeight, (this.track.style.transition = ""));
    }
  }
  nextSlide() {
    this.isTransitioning ||
      ((this.isTransitioning = !0),
      this.currentSlide++,
      this.updateSlidePosition(!0));
  }
  previousSlide() {
    this.isTransitioning ||
      ((this.isTransitioning = !0),
      this.currentSlide--,
      this.updateSlidePosition(!0));
  }
  handleTransitionEnd() {
    this.isTransitioning = !1;
    let t = window.innerWidth >= 1025,
      e = t ? 3 : 1;
    this.currentSlide >= this.totalSlides + e &&
      ((this.currentSlide = e), this.updateSlidePosition(!1)),
      this.currentSlide < e &&
        ((this.currentSlide = this.totalSlides + e - 1),
        this.updateSlidePosition(!1));
  }
  handleResize() {
    let t = window.innerWidth >= 1025;
    (this.currentSlide = t ? 3 : 1), this.updateSlidePosition(!1);
  }
  startAutoSlide() {
    this.stopAutoSlide(),
      (this.autoSlideInterval = setInterval(() => {
        this.nextSlide();
      }, this.autoSlideDelay));
  }
  stopAutoSlide() {
    this.autoSlideInterval &&
      (clearInterval(this.autoSlideInterval), (this.autoSlideInterval = null));
  }
  openLightboxFromSlide(t) {
    let e = window.innerWidth >= 1025,
      i = e ? 3 : 1,
      s;
    (s =
      t < i
        ? this.totalSlides - (i - t)
        : t >= this.totalSlides + i
        ? t - this.totalSlides - i
        : t - i),
      this.openLightbox(s);
  }
  openLightbox(t) {
    this.lightboxCurrentSlide = t;
    let e = document.querySelectorAll(".amenitiesSlide:not(.clone)"),
      i = e[t],
      s = i.querySelector(".amenitiesImage"),
      l = i.querySelector(".amenitiesTextOverlay").textContent;
    this.lightboxImage &&
      ((this.lightboxImage.src = s.src), (this.lightboxImage.alt = s.alt)),
      this.lightboxTitle && (this.lightboxTitle.textContent = l),
      this.lightboxCounter &&
        (this.lightboxCounter.textContent = `${t + 1} / ${this.totalSlides}`),
      this.lightbox && this.lightbox.classList.add("active");
  }
  closeLightbox() {
    this.lightbox && this.lightbox.classList.remove("active");
  }
  lightboxNext() {
    (this.lightboxCurrentSlide =
      (this.lightboxCurrentSlide + 1) % this.totalSlides),
      this.updateLightboxContent();
  }
  lightboxPrevious() {
    (this.lightboxCurrentSlide =
      0 === this.lightboxCurrentSlide
        ? this.totalSlides - 1
        : this.lightboxCurrentSlide - 1),
      this.updateLightboxContent();
  }
  updateLightboxContent() {
    let t = document.querySelectorAll(".amenitiesSlide:not(.clone)"),
      e = t[this.lightboxCurrentSlide],
      i = e.querySelector(".amenitiesImage"),
      s = e.querySelector(".amenitiesTextOverlay").textContent;
    this.lightboxImage &&
      ((this.lightboxImage.src = i.src), (this.lightboxImage.alt = i.alt)),
      this.lightboxTitle && (this.lightboxTitle.textContent = s),
      this.lightboxCounter &&
        (this.lightboxCounter.textContent = `${
          this.lightboxCurrentSlide + 1
        } / ${this.totalSlides}`);
  }
}
document.querySelectorAll(".readMoreLink").forEach((t, e) => {
  let i = document.querySelectorAll(".clampText")[e],
    s = !1;
  t.addEventListener("click", (e) => {
    e.preventDefault(),
      (s = !s),
      (i.style.webkitLineClamp = s ? "unset" : "6"),
      (t.textContent = s ? " Read Less" : " Read More");
  });
}),
  document.addEventListener("DOMContentLoaded", () => {
    let t = document.getElementById("quotePopup"),
      e = document.getElementById("quoteTitle"),
      i = document.querySelectorAll(
        ".floorPlanCta , .tourColumn , .requestButton, .galleryDownloadBtn, .amenitiesDownloadBtn, .overviewBrochureButton, .overviewRequestBrochureButton, .price-card, .price-get-details, .price-floor-plan, .floorPlanCard, .floorPlanButton, .map-cta, .sidedownloadBtn, .bannerVideoOverlay, .bannerOverlayBtn"
      );
    function s() {
      t.style.display = "none";
    }
    i.forEach((i) => {
      i.addEventListener("click", () => {
        i.classList.contains("requestButton") ||
        i.classList.contains("tourColumn")
          ? (e.innerHTML = "Request Virtual Tour")
          : i.classList.contains("galleryDownloadBtn")
          ? (e.innerHTML = "Download Gallery")
          : i.classList.contains("amenitiesDownloadBtn")
          ? (e.innerHTML = "Download Amenities")
          : i.classList.contains("overviewBrochureButton") ||
            i.classList.contains("overviewRequestBrochureButton") ||
            i.classList.contains("sidedownloadBtn")
          ? (e.innerHTML = "Request Brochure")
          : i.classList.contains("bannerOverlayBtn") ||
            i.classList.contains("bannerVideoOverlay")
          ? (e.innerHTML = "Request Full Video")
          : i.classList.contains("price-card") ||
            i.classList.contains("price-get-details") ||
            i.classList.contains("price-floor-plan")
          ? (e.innerHTML = "Get Price Details")
          : i.classList.contains("map-cta")
          ? (e.innerHTML = "Request Location Details")
          : i.classList.contains("floorPlanButton") ||
            i.classList.contains("floorPlanCard")
          ? (e.innerHTML = "View Plan")
          : i.classList.contains("floorPlanCta") &&
            (e.innerHTML = "Download Floor Plan"),
          (t.style.display = "flex");
      });
    }),
      setTimeout(() => {
        (e.innerHTML = "Enquiry Now"), (t.style.display = "flex");
      }, 9e3);
  });
class GalleryCarousel {
  constructor() {
    this.container = document.getElementById("gallery");
    this.track = document.getElementById("galleryTrack");
    this.prevBtn = document.getElementById("galleryPrev");
    this.nextBtn = document.getElementById("galleryNext");
    this.slides = document.querySelectorAll(".gallerySlide");
    this.lightbox = document.getElementById("galleryLightbox");
    this.totalSlides = this.slides.length;
    this.isDesktop = window.innerWidth >= 1025;
    this.currentIndex = this.totalSlides; // carousel index (includes clones)
    this.autoSlideInterval = null;
    this.autoSlideDelay = 5000;
    this.isTransitioning = false;

    // lightbox state
    this.lightboxIndex = 0;
    this.boundLightboxKeyboard = this.handleLightboxKeyboard.bind(this);
    this.lightboxInitialized = false;

    this.init();
  }

  init() {
    if (this.track && this.slides.length > 0) {
      this.cloneSlides();
      this.slides = document.querySelectorAll(".gallerySlide");
      this.setupEventListeners();
      this.updateSlidePosition(false);
      if (!this.isDesktop) this.startAutoSlide();
    }
  }

  cloneSlides() {
    const isDesktop = window.innerWidth >= 1025;
    const cloneCount = isDesktop ? 3 : 1;

    // prepend clones
    for (
      let i = this.totalSlides - 1;
      i >= this.totalSlides - cloneCount;
      i--
    ) {
      const clone = this.slides[i].cloneNode(true);
      clone.classList.add("clone");
      this.track.insertBefore(clone, this.track.firstChild);
    }

    // append clones
    for (let i = 0; i < cloneCount; i++) {
      const clone = this.slides[i].cloneNode(true);
      clone.classList.add("clone");
      this.track.appendChild(clone);
    }
  }

  setupEventListeners() {
    const wrapper = document.querySelector(".galleryCarousel");

    // click handling
    if (wrapper) {
      wrapper.addEventListener("click", (e) => {
        if (e.target.id === "galleryPrev" || e.target.closest("#galleryPrev")) {
          e.preventDefault();
          e.stopPropagation();
          this.prevSlide();
        } else if (
          e.target.id === "galleryNext" ||
          e.target.closest("#galleryNext")
        ) {
          e.preventDefault();
          e.stopPropagation();
          this.nextSlide();
        }
      });
    }
    let startx = 0;
    this.container &&
      this.container.addEventListener("touchstart", (e) => {
        startx = e.touches[0].clientX;
      });
    this.container &&
      this.container.addEventListener("touchend", (e) => {
        let endx = e.changedTouches[0].clientX;
        if (startx > endx + 50) {
          this.nextSlide();
        } else if (startx < endx - 50) {
          this.prevSlide();
        }
      });
    this.lightbox &&
      this.lightbox.addEventListener("touchstart", (e) => {
        startx = e.touches[0].clientX;
      });
    this.lightbox &&
      this.lightbox.addEventListener("touchend", (e) => {
        let endx = e.changedTouches[0].clientX;
        if (startx > endx + 50) {
          this.lightboxNext();
        } else if (startx < endx - 50) {
          this.lightboxPrev();
        }
      });

    if (this.prevBtn) {
      this.prevBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.prevSlide();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        this.nextSlide();
      });
    }

    // slide click → lightbox
    this.slides.forEach((slide, index) => {
      slide.addEventListener("click", () => this.openLightboxFromSlide(index));
    });

    // hover pause
    if (this.track) {
      this.track.addEventListener("mouseenter", () => this.stopAutoSlide());
      this.track.addEventListener("mouseleave", () => this.startAutoSlide());
      this.track.addEventListener("transitionend", () =>
        this.handleTransitionEnd()
      );
    }

    window.addEventListener("resize", () => this.handleResize());
  }

  handleResize() {
    const wasDesktop = this.isDesktop;
    this.isDesktop = window.innerWidth >= 1025;

    if (wasDesktop !== this.isDesktop) {
      const e = this.isDesktop ? 3 : 1;
      this.currentIndex = e;
      this.updateSlidePosition(false);
      this.startAutoSlide();
    }
  }

  updateSlidePosition(withTransition = true) {
    if (!this.track) return;

    if (!withTransition) {
      this.track.style.transition = "none";
    }

    const translateValue = this.isDesktop
      ? -(33.87 * this.currentIndex)
      : -(100 * this.currentIndex);

    this.track.style.transform = `translateX(${translateValue}%)`;

    if (!withTransition) {
      this.track.offsetHeight; // force reflow
      this.track.style.transition = "";
    }
  }

  nextSlide() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentIndex++;
    this.updateSlidePosition(true);
    this.restartAutoSlide();
  }

  prevSlide() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentIndex--;
    this.updateSlidePosition(true);
    this.restartAutoSlide();
  }

  handleTransitionEnd() {
    this.isTransitioning = false;
    const isDesktop = window.innerWidth >= 1025;
    const cloneCount = isDesktop ? 3 : 1;

    if (this.currentIndex >= this.totalSlides + cloneCount) {
      this.currentIndex = cloneCount;
      this.updateSlidePosition(false);
    } else if (this.currentIndex < cloneCount) {
      this.currentIndex = this.totalSlides + cloneCount - 1;
      this.updateSlidePosition(false);
    }
  }

  startAutoSlide() {
    this.stopAutoSlide();
    this.autoSlideInterval = setInterval(
      () => this.nextSlide(),
      this.autoSlideDelay
    );
  }

  stopAutoSlide() {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  restartAutoSlide() {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  openLightboxFromSlide(index) {
    const isDesktop = window.innerWidth >= 1025;
    const cloneCount = isDesktop ? 3 : 1;
    let s;

    if (index < cloneCount) {
      s = this.totalSlides - (cloneCount - index);
    } else if (index >= this.totalSlides + cloneCount) {
      s = index - this.totalSlides - cloneCount;
    } else {
      s = index - cloneCount;
    }

    this.openLightbox(s);
  }

  openLightbox(index) {
    const lightbox = document.getElementById("galleryLightbox");
    const img = document.getElementById("galleryLightboxImage");
    const counter = document.getElementById("galleryLightboxCounter");
    const closeBtn = document.getElementById("galleryLightboxClose");
    const prevBtn = document.getElementById("galleryLightboxPrev");
    const nextBtn = document.getElementById("galleryLightboxNext");

    if (!lightbox || !img || !counter) return;

    this.lightboxIndex = index;
    this.updateLightboxContent();
    lightbox.classList.add("active");

    // add listeners only once
    if (!this.lightboxInitialized) {
      closeBtn &&
        closeBtn.addEventListener("click", () => this.closeLightbox());
      prevBtn && prevBtn.addEventListener("click", () => this.lightboxPrev());
      nextBtn && nextBtn.addEventListener("click", () => this.lightboxNext());
      lightbox.addEventListener("click", (e) => {
        if (e.target === lightbox) this.closeLightbox();
      });
      this.lightboxInitialized = true;
    }

    document.addEventListener("keydown", this.boundLightboxKeyboard);
  }

  updateLightboxContent() {
    const img = document.getElementById("galleryLightboxImage");
    const counter = document.getElementById("galleryLightboxCounter");
    if (!img || !counter) return;

    const slides = document.querySelectorAll(".gallerySlide:not(.clone)");
    if (this.lightboxIndex < 0 || this.lightboxIndex >= slides.length) {
      this.lightboxIndex = 0;
    }

    const slide = slides[this.lightboxIndex];
    const imageEl = slide.querySelector(".galleryImage");
    // const textEl = slide.querySelector(".galleryTextOverlay");

    if (imageEl) {
      img.src = imageEl.src;
      img.alt = imageEl.alt;
      counter.textContent = `${this.lightboxIndex + 1} / ${this.totalSlides}`;
    }
  }

  lightboxPrev() {
    this.lightboxIndex =
      this.lightboxIndex === 0 ? this.totalSlides - 1 : this.lightboxIndex - 1;
    this.updateLightboxContent();
  }

  lightboxNext() {
    this.lightboxIndex = (this.lightboxIndex + 1) % this.totalSlides;
    this.updateLightboxContent();
  }

  closeLightbox() {
    const lightbox = document.getElementById("galleryLightbox");
    if (lightbox) lightbox.classList.remove("active");
    document.removeEventListener("keydown", this.boundLightboxKeyboard);
  }

  handleLightboxKeyboard(e) {
    switch (e.key) {
      case "Escape":
        this.closeLightbox();
        break;
      case "ArrowLeft":
        this.lightboxPrev();
        break;
      case "ArrowRight":
        this.lightboxNext();
        break;
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".form-number").forEach((element) => {
    element.addEventListener("keydown", keyEventListener);
  });
  document.querySelectorAll(".form-name").forEach((element) => {
    element.addEventListener("keydown", keyNameEventListener);
  });
});
function keyNameEventListener(e) {
  if (!/^[A-Za-z ]$/.test(e.key) && e.key.length == 1) {
    e.preventDefault();
  }
}
function keyEventListener(e) {
  if (!/^[0-9]$/.test(e.key) && e.key.length == 1) {
    e.preventDefault();
  }
}

/* ----------Video JS ------------*/
const video = document.querySelector(".bannerPropertyVideo");

let playedSeconds = 0;
let lastTime = 0;
let isVerifiedPlayed = false;

if (video) {
  video.addEventListener("timeupdate", addBannerOverlay);

  function addBannerOverlay() {
    if (video.paused || video.seeking) return;

    const current = video.currentTime;
    const delta = current - lastTime;

    // iOS sometimes jumps time — ignore invalid jumps
    if (delta > 0 && delta < 1) {
      playedSeconds += delta;
    }

    lastTime = current;

    // Check if played between 8–10 seconds
    if (!isVerifiedPlayed && playedSeconds >= 8) {
      isVerifiedPlayed = true;
      document.querySelector(".bannerVideoOverlay")?.classList.add("Active");
      removeVideoEvent();
    }
  }
  function removeVideoEvent() {
    video.removeEventListener("timeupdate", addBannerOverlay);
  }
  video.addEventListener("pause", () => {
    lastTime = video.currentTime;
  });
}

/* ----------Brochure Download Handling------------*/
// var dl = {};
// const brochureStorageKey = "pendingBrochureDownload";
// const brochureFormFlag = "brochureDownloadRequested";
// document.querySelectorAll(".brochure-trigger").forEach(btn => {
//     btn.addEventListener("click", (e) => {
//         e.preventDefault();
//         dl = { file: "brochure.pdf", name: "brochure.pdf" };
//         sessionStorage.setItem(brochureStorageKey, JSON.stringify(dl));
//     });
// });

function closeQuotePopup() {
  document.getElementById("quotePopup").style.display = "none";
  document.body.style.overflow = "auto";
  // sessionStorage.removeItem(brochureStorageKey);
  // dl = {};
}
