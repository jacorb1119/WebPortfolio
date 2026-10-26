const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".site-nav");

menuButton.addEventListener("click", () => {
  const isExpanded = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isExpanded));
  menuButton.setAttribute("aria-label", isExpanded ? "Open navigation" : "Close navigation");
  navigation.classList.toggle("is-open", !isExpanded);
});

navigation.addEventListener("click", (event) => {
  if (event.target.closest("a")) {
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Open navigation");
    navigation.classList.remove("is-open");
  }
});

document.querySelector("#current-year").textContent = new Date().getFullYear();

const galleryPhotos = {
  ugv: [
    {
      src: "photos/495264810_692553827007089_6402064943678701197_n.jpg",
      alt: "Side view of the completed UGV with its sensors and wiring",
    },
    {
      src: "photos/495267843_581486934618579_3616272906677684190_n.jpg",
      alt: "Front view of the UGV showing its gas sensors and camera",
    },
    {
      src: "photos/462547700_1087752496211045_5865639978520752930_n.jpg",
      alt: "Rendered model of the four-wheel UGV",
    },
  ],
  "rent-manager": [
    {
      src: "rentManager%20Photos/Screenshot%202026-10-26%20173838.png",
      alt: "Rent Manager properties dashboard showing two rental properties",
    },
    {
      src: "rentManager%20Photos/Screenshot%202026-10-26%20173911.png",
      alt: "Rent Manager tenant list with lease periods, status, and balances",
    },
  ],
};

document.querySelectorAll("[data-gallery]").forEach((projectGallery) => {
  const photos = galleryPhotos[projectGallery.dataset.gallery];
  if (!photos) return;

  const galleryImage = projectGallery.querySelector("[data-gallery-image]");
  const galleryCount = projectGallery.querySelector("[data-gallery-count]");
  let currentPhoto = 0;

  projectGallery.addEventListener("click", (event) => {
    const button = event.target.closest("[data-gallery-step]");
    if (!button) return;

    currentPhoto = (currentPhoto + Number(button.dataset.galleryStep) + photos.length) % photos.length;
    galleryImage.src = photos[currentPhoto].src;
    galleryImage.alt = photos[currentPhoto].alt;
    galleryCount.textContent = `${currentPhoto + 1} / ${photos.length}`;
  });
});