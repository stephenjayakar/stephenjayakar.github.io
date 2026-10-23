// Click-to-enlarge preview for images in post and page content.
const dialog = document.getElementById("lightbox");
const preview = dialog.querySelector(".lightbox__image");

// Prefer the widest srcset candidate so the preview is sharper than the
// inline rendition, which is sized for the content column.
function largestSource(img) {
  const candidates = (img.getAttribute("srcset") || "")
    .split(",")
    .map((entry) => entry.trim().split(/\s+/))
    .filter(([url]) => url)
    .map(([url, descriptor]) => ({ url, width: parseInt(descriptor, 10) || 0 }));
  if (candidates.length === 0) {
    return img.currentSrc || img.src;
  }
  return candidates.reduce((a, b) => (b.width > a.width ? b : a)).url;
}

function enlargeable(target) {
  return (
    target instanceof HTMLImageElement &&
    target.closest(".post-content, .post-header, .content-section") &&
    !target.closest("a, .lightbox")
  );
}

document.addEventListener("click", (event) => {
  const img = event.target;
  if (!enlargeable(img)) {
    return;
  }
  preview.src = largestSource(img);
  preview.alt = img.alt;
  // Inline style rather than a class: PurgeCSS drops classes that only JS adds.
  document.documentElement.style.overflow = "hidden";
  dialog.showModal();
});

// Any click inside the open preview (image or backdrop) closes it; Escape is
// handled natively by <dialog>.
dialog.addEventListener("click", () => dialog.close());
dialog.addEventListener("close", () => {
  document.documentElement.style.removeProperty("overflow");
  preview.removeAttribute("src");
});
