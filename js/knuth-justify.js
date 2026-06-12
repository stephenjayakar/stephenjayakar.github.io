import { layoutWithLines, prepareWithSegments } from "/vendor/pretext/layout.js";

const PATH_PREFIX = "/posts/";
const PARAGRAPH_SELECTOR = "article.post .post-content p";
const MIN_TEXT_LENGTH = 80;
const TWO_COLUMN_MIN_VIEWPORT = 1500;
const preparedParagraphs = new WeakMap();
const splitStates = new WeakMap();

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim();
}

function parseLineHeightPx(computedStyle) {
  const fontSizePx = parseFloat(computedStyle.fontSize) || 16;
  if (computedStyle.lineHeight === "normal") {
    return fontSizePx * 1.2;
  }
  return parseFloat(computedStyle.lineHeight) || fontSizePx * 1.2;
}

function isEligible(paragraph) {
  if (preparedParagraphs.has(paragraph)) {
    return true;
  }

  // Prototype limitation: only plain text paragraphs for now.
  return paragraph.childElementCount === 0;
}

function getPreparedParagraph(paragraph) {
  const cached = preparedParagraphs.get(paragraph);
  if (cached) {
    return cached;
  }

  const text = normalizeText(paragraph.textContent || "");
  if (text.length < MIN_TEXT_LENGTH) {
    return null;
  }

  const computedStyle = window.getComputedStyle(paragraph);
  const font = computedStyle.font;
  const lineHeightPx = parseLineHeightPx(computedStyle);
  const prepared = prepareWithSegments(text, font);
  const data = { prepared, lineHeightPx };
  preparedParagraphs.set(paragraph, data);
  return data;
}

function renderParagraph(paragraph) {
  const preparedData = getPreparedParagraph(paragraph);
  if (!preparedData) {
    return;
  }

  const width = paragraph.clientWidth;
  if (width <= 0) {
    return;
  }

  const { lines } = layoutWithLines(preparedData.prepared, width, preparedData.lineHeightPx);
  if (!lines.length) {
    return;
  }

  paragraph.classList.add("knuth-justified");
  paragraph.textContent = "";

  lines.forEach((line, index) => {
    const lineElement = document.createElement("span");
    lineElement.className = "knuth-line";
    lineElement.textContent = line.text;

    const isLastLine = index === lines.length - 1;
    const spaceCount = (line.text.match(/ /g) || []).length;
    if (!isLastLine && spaceCount > 0 && width > line.width) {
      const extraPerSpace = (width - line.width) / spaceCount;
      lineElement.style.wordSpacing = `${extraPerSpace}px`;
    }

    paragraph.appendChild(lineElement);
  });
}

function rerender() {
  if (!window.location.pathname.startsWith(PATH_PREFIX)) {
    return;
  }

  const paragraphs = document.querySelectorAll(PARAGRAPH_SELECTOR);
  paragraphs.forEach((paragraph) => {
    if (!isEligible(paragraph)) {
      return;
    }
    renderParagraph(paragraph);
  });
}

function findMediaCandidate(postContent) {
  const children = Array.from(postContent.children);
  for (const child of children) {
    if (child.tagName === "FIGURE" || child.tagName === "IMG") {
      return child;
    }
    if (
      child.tagName === "P" &&
      child.children.length === 1 &&
      child.firstElementChild &&
      child.firstElementChild.tagName === "IMG"
    ) {
      return child;
    }
  }
  return null;
}

function shouldEnableSplitLayout(postContent) {
  if (!postContent) {
    return false;
  }
  if (window.innerWidth < TWO_COLUMN_MIN_VIEWPORT) {
    return false;
  }
  return true;
}

function applySplitLayout(postContent) {
  if (splitStates.has(postContent) || !shouldEnableSplitLayout(postContent)) {
    return;
  }

  const mediaCandidate = findMediaCandidate(postContent);
  if (!mediaCandidate) {
    return;
  }

  const originalChildren = Array.from(postContent.childNodes);
  const layout = document.createElement("div");
  const textColumn = document.createElement("div");
  const mediaColumn = document.createElement("div");

  layout.className = "post-content-layout";
  textColumn.className = "post-content-layout__text";
  mediaColumn.className = "post-content-layout__media";

  for (const node of originalChildren) {
    if (node === mediaCandidate) {
      mediaColumn.appendChild(node);
    } else {
      textColumn.appendChild(node);
    }
  }

  layout.appendChild(textColumn);
  layout.appendChild(mediaColumn);

  postContent.textContent = "";
  postContent.appendChild(layout);
  postContent.classList.add("post-content-split-active");

  splitStates.set(postContent, { originalChildren });
}

function removeSplitLayout(postContent) {
  const state = splitStates.get(postContent);
  if (!state) {
    return;
  }

  postContent.textContent = "";
  for (const node of state.originalChildren) {
    postContent.appendChild(node);
  }

  postContent.classList.remove("post-content-split-active");
  splitStates.delete(postContent);
}

function updateSplitLayouts() {
  if (!window.location.pathname.startsWith(PATH_PREFIX)) {
    return;
  }

  const postContents = document.querySelectorAll("article.post .post-content");
  postContents.forEach((postContent) => {
    if (shouldEnableSplitLayout(postContent)) {
      applySplitLayout(postContent);
    } else {
      removeSplitLayout(postContent);
    }
  });
}

function debounce(fn, delayMs) {
  let timeoutId;
  return (...args) => {
    window.clearTimeout(timeoutId);
    timeoutId = window.setTimeout(() => fn(...args), delayMs);
  };
}

document.addEventListener("DOMContentLoaded", () => {
  const rerenderAll = () => {
    updateSplitLayouts();
    rerender();
  };

  rerenderAll();
  window.addEventListener("resize", debounce(rerenderAll, 150));
});
