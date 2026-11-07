(function () {
  var mounts = document.querySelectorAll("[data-gallery]");
  if (!mounts.length) {
    return;
  }

  var INSTAGRAM = "https://www.instagram.com/potteryrakugirl/";
  var activePieces = [];
  var activeIndex = 0;
  var returnFocus = null;
  var dialog = null;

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[char];
    });
  }

  function assetPath(url) {
    var value = String(url || "").trim();
    if (!value || /^(?:javascript|data):/i.test(value) || value.indexOf("//") === 0) {
      return "";
    }
    if (/^https?:\/\//i.test(value)) {
      return value;
    }
    return value.replace(/^\/+/, "");
  }

  function rewriteSrcset(srcset) {
    return String(srcset || "")
      .split(",")
      .map(function (part) {
        var bits = part.trim().split(/\s+/);
        if (!bits[0]) {
          return "";
        }
        bits[0] = assetPath(bits[0]);
        return bits.filter(Boolean).join(" ");
      })
      .filter(Boolean)
      .join(", ");
  }

  function pictureHtml(piece, eager) {
    var image = assetPath(piece.image);
    var sources = Array.isArray(piece.sources) ? piece.sources : [];
    var sourceHtml = sources
      .map(function (source) {
        var srcset = rewriteSrcset(source.srcset || source.src);
        if (!srcset) {
          return "";
        }
        return (
          "<source srcset=\"" + escapeHtml(srcset) + "\"" +
          (source.type ? " type=\"" + escapeHtml(source.type) + "\"" : "") +
          (source.media ? " media=\"" + escapeHtml(source.media) + "\"" : "") +
          ">"
        );
      })
      .join("");
    var sizes = piece.sizes || "(min-width: 980px) 30vw, (min-width: 640px) 46vw, 100vw";
    return (
      "<picture>" + sourceHtml +
      "<img src=\"" + escapeHtml(image) + "\" alt=\"" + escapeHtml(piece.alt || piece.title) + "\"" +
      " width=\"" + escapeHtml(piece.width || 800) + "\" height=\"" + escapeHtml(piece.height || 1000) + "\"" +
      " sizes=\"" + escapeHtml(sizes) + "\" loading=\"" + (eager ? "eager" : "lazy") + "\" decoding=\"async\">" +
      "</picture>"
    );
  }

  function sortedPieces(data) {
    var seen = new Set();
    return (Array.isArray(data.pieces) ? data.pieces : [])
      .filter(function (piece) {
        if (!piece || !piece.id || !piece.title || !piece.category || !assetPath(piece.image) || seen.has(piece.id)) {
          return false;
        }
        seen.add(piece.id);
        return true;
      })
      .sort(function (a, b) {
        return (Number(a.order) || 0) - (Number(b.order) || 0) || String(a.title).localeCompare(String(b.title));
      });
  }

  function categoriesFor(data, pieces) {
    var categories = Array.isArray(data.categories) ? data.categories.slice() : [];
    pieces.forEach(function (piece) {
      if (categories.indexOf(piece.category) === -1) {
        categories.push(piece.category);
      }
    });
    return categories;
  }

  function countLabel(items, category) {
    var count = items.length;
    var scope = category && category !== "All" ? " in " + category : "";
    var placeholderCount = items.filter(function (piece) {
      return piece.placeholder === true;
    }).length;
    if (!count) {
      return "No pieces" + scope + " yet.";
    }
    if (placeholderCount === count) {
      return count + " temporary " + (count === 1 ? "placeholder" : "placeholders") + scope + ". These are not the artist's work.";
    }
    return "Showing " + count + " " + (count === 1 ? "piece" : "pieces") + scope + ".";
  }

  function ensureDialog() {
    if (dialog) {
      return dialog;
    }
    dialog = document.createElement("dialog");
    dialog.className = "lightbox";
    dialog.setAttribute("aria-labelledby", "lightbox-title");
    dialog.innerHTML =
      "<div class=\"lightbox-layout\">" +
      "<div class=\"lightbox-media\" data-lightbox-media></div>" +
      "<div class=\"lightbox-panel\">" +
      "<button type=\"button\" class=\"lightbox-close\" data-lightbox-close>Close</button>" +
      "<p class=\"eyebrow\" data-lightbox-category></p>" +
      "<h2 id=\"lightbox-title\" data-lightbox-title></h2>" +
      "<p data-lightbox-description hidden></p>" +
      "<p class=\"piece-note\" data-lightbox-note hidden></p>" +
      "<p data-lightbox-inquiry></p>" +
      "<p class=\"lightbox-count\" data-lightbox-count></p>" +
      "<div class=\"lightbox-nav\">" +
      "<button type=\"button\" data-lightbox-prev>Previous</button>" +
      "<button type=\"button\" data-lightbox-next>Next</button>" +
      "</div></div></div>";
    document.body.appendChild(dialog);

    dialog.querySelector("[data-lightbox-close]").addEventListener("click", function () {
      dialog.close();
    });
    dialog.querySelector("[data-lightbox-prev]").addEventListener("click", function () {
      showPiece(activeIndex - 1);
    });
    dialog.querySelector("[data-lightbox-next]").addEventListener("click", function () {
      showPiece(activeIndex + 1);
    });
    dialog.addEventListener("click", function (event) {
      if (event.target === dialog) {
        dialog.close();
      }
    });
    dialog.addEventListener("close", function () {
      if (returnFocus) {
        returnFocus.focus();
      }
    });
    dialog.addEventListener("keydown", function (event) {
      if (event.key === "ArrowRight") {
        event.preventDefault();
        showPiece(activeIndex + 1);
      }
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        showPiece(activeIndex - 1);
      }
    });
    return dialog;
  }

  function showPiece(index) {
    var count = activePieces.length;
    if (!count) {
      return;
    }
    activeIndex = (index + count) % count;
    var piece = activePieces[activeIndex];
    var box = ensureDialog();
    box.querySelector("[data-lightbox-media]").innerHTML = pictureHtml(piece, true);
    box.querySelector("[data-lightbox-category]").textContent = piece.category;
    box.querySelector("[data-lightbox-title]").textContent = piece.title;
    var description = box.querySelector("[data-lightbox-description]");
    description.hidden = !piece.description;
    description.textContent = piece.description || "";
    var note = box.querySelector("[data-lightbox-note]");
    note.hidden = !piece.availabilityNote;
    note.textContent = piece.availabilityNote || "";
    var inquiry = box.querySelector("[data-lightbox-inquiry]");
    if (piece.placeholder !== true && piece.inquiry !== false) {
      inquiry.innerHTML = "<a class=\"text-link\" href=\"" + INSTAGRAM + "\">Ask About This Piece on Instagram</a>";
    } else {
      inquiry.textContent = "";
    }
    box.querySelector("[data-lightbox-count]").textContent = "Image " + (activeIndex + 1) + " of " + count;
  }

  function openPiece(pieces, index, trigger) {
    activePieces = pieces;
    returnFocus = trigger;
    showPiece(index);
    var box = ensureDialog();
    if (typeof box.showModal !== "function") {
      trigger.focus();
      return;
    }
    if (!box.open) {
      box.showModal();
    }
    box.querySelector("[data-lightbox-close]").focus();
  }

  function renderGrid(grid, pieces, offset) {
    if (!pieces.length) {
      grid.innerHTML = "";
      return;
    }
    grid.innerHTML = pieces
      .map(function (piece, index) {
        var flag = piece.placeholder === true ? "<span class=\"piece-flag\">Placeholder</span>" : "";
        return (
          "<li class=\"piece\">" +
          "<button type=\"button\" class=\"piece-open\" data-index=\"" + (offset + index) + "\" aria-haspopup=\"dialog\" aria-label=\"Open image: " + escapeHtml(piece.title) + "\">" +
          pictureHtml(piece, false) + flag +
          "</button>" +
          "<div class=\"piece-copy\">" +
          "<p class=\"piece-category\">" + escapeHtml(piece.category) + "</p>" +
          "<h3>" + escapeHtml(piece.title) + "</h3>" +
          "</div></li>"
        );
      })
      .join("");
  }

  function renderMount(mount, data, pieces) {
    var mode = mount.getAttribute("data-gallery");
    var selected = "All";
    var source = pieces;
    if (mode === "featured") {
      var featured = pieces.filter(function (piece) {
        return piece.featured === true;
      });
      source = featured.length ? featured : pieces.slice(0, 3);
    }

    mount.innerHTML =
      (source.some(function (piece) { return piece.placeholder === true; })
        ? "<p class=\"placeholder-note\">Temporary placeholders. Not pottery by Stephanne Martin.</p>"
        : "") +
      (mode === "all"
        ? "<div class=\"gallery-tools\"><div class=\"filters\" role=\"group\" aria-label=\"Filter pottery by category\"></div><p class=\"gallery-count\" aria-live=\"polite\"></p></div>"
        : "") +
      "<ul class=\"gallery-grid\"></ul>" +
      "<p class=\"gallery-empty\" hidden>No pieces in this category yet.</p>";

    var grid = mount.querySelector(".gallery-grid");
    var empty = mount.querySelector(".gallery-empty");
    var filters = mount.querySelector(".filters");
    var count = mount.querySelector(".gallery-count");

    function visiblePieces() {
      if (selected === "All") {
        return source;
      }
      return source.filter(function (piece) {
        return piece.category === selected;
      });
    }

    function paint() {
      var items = visiblePieces();
      renderGrid(grid, items, 0);
      empty.hidden = items.length > 0;
      if (count) {
        count.textContent = countLabel(items, selected);
      }
      grid.querySelectorAll(".piece-open").forEach(function (button) {
        button.addEventListener("click", function () {
          openPiece(items, Number(button.getAttribute("data-index")), button);
        });
      });
    }

    if (filters) {
      var categories = ["All"].concat(categoriesFor(data, source));
      filters.innerHTML = categories
        .map(function (category) {
          return "<button type=\"button\" class=\"filter\" aria-pressed=\"" + (category === selected ? "true" : "false") + "\">" + escapeHtml(category) + "</button>";
        })
        .join("");
      filters.addEventListener("click", function (event) {
        var button = event.target.closest("button");
        if (!button || !filters.contains(button)) {
          return;
        }
        selected = button.textContent;
        filters.querySelectorAll("button").forEach(function (item) {
          item.setAttribute("aria-pressed", item === button ? "true" : "false");
        });
        if (dialog && dialog.open) {
          dialog.close();
        }
        paint();
      });
      filters.addEventListener("keydown", function (event) {
        var buttons = Array.prototype.slice.call(filters.querySelectorAll("button"));
        var current = buttons.indexOf(document.activeElement);
        if (current < 0) {
          return;
        }
        var next = null;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") {
          next = buttons[(current + 1) % buttons.length];
        } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
          next = buttons[(current - 1 + buttons.length) % buttons.length];
        } else if (event.key === "Home") {
          next = buttons[0];
        } else if (event.key === "End") {
          next = buttons[buttons.length - 1];
        }
        if (next) {
          event.preventDefault();
          next.focus();
        }
      });
    }

    paint();
  }

  fetch(new URL("data/gallery.json", window.location.href))
    .then(function (response) {
      if (!response.ok) {
        throw new Error("Gallery data could not be loaded.");
      }
      return response.json();
    })
    .then(function (data) {
      var pieces = sortedPieces(data);
      mounts.forEach(function (mount) {
        renderMount(mount, data, pieces);
      });
    })
    .catch(function () {
      mounts.forEach(function (mount) {
        mount.innerHTML = "<p class=\"gallery-status\" role=\"alert\">The gallery could not be loaded. Start a local web server from the project folder, then refresh this page.</p>";
      });
    });
})();
