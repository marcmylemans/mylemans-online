// assets/js/main.js
(async function () {
  // -----------------------------
  // 1) Load header/footer partials
  // -----------------------------
  async function loadPartials() {
    const includeEls = document.querySelectorAll("[data-include]");
    if (!includeEls.length) return;

    const jobs = Array.from(includeEls).map(async (el) => {
      const name = el.getAttribute("data-include");
      if (!name) return;

      try {
        // Adjust path if your partials live elsewhere
        const res = await fetch(`/partials/${name}.html`);
        if (!res.ok) {
          throw new Error(`Failed to load partial "${name}": ${res.status}`);
        }
        const html = await res.text();
        // Replace the placeholder with real markup
        el.outerHTML = html;
      } catch (err) {
        console.error("Include error:", err);
      }
    });

    await Promise.all(jobs);
  }

    /****************************************************
   * FOURTHWALL CONFIG
   ****************************************************/
  const FW_SHOP_URL = "https://shop.mylemans.online";
  const FW_STOREFRONT_TOKEN = "ptkn_3d579261-dbce-41fd-a853-dc0f4d9c8b71"; // <- SET THIS
  const FW_COLLECTION_SLUG = "all"; // or another public collection handle

  /****************************************************
   * CATEGORY HELPERS
   ****************************************************/
  function escapeHtml(str) {
    if (typeof str !== "string") return "";
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function cleanDescription(html) {
    if (!html) return "";

    let text = html.replace(/<[^>]+>/g, " ");
    text = text.replace(/\s+/g, " ").trim();

    text = text
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&quot;/gi, '"')
      .replace(/&#39;|&apos;/gi, "'")
      .replace(/&#34;/gi, '"')
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">");

    return text;
  }

  function determineCategory(product) {
    const tags = (product.tags || []).map((t) => String(t).toLowerCase());
    const title = (product.name || "").toLowerCase();

    const hasTag = (...candidates) =>
      tags.some((t) => candidates.includes(t)) ||
      candidates.some((c) => title.includes(c));

    if (hasTag("docs", "documentation", "template", "checklist"))
      return "docs";
    if (hasTag("script", "scripts", "automation", "powershell"))
      return "scripts";
    if (hasTag("stl", "3d", "3d-print", "3d print")) return "stl";
    if (hasTag("merch", "shirt", "hoodie", "apparel")) return "merch";

    return "all";
  }

  /****************************************************
   * FILTER UI
   ****************************************************/
  function setupProductFilters() {
    const grid = document.getElementById("fw-products-grid");
    if (!grid) return;

    const buttons = document.querySelectorAll(".filter-btn");
    const cards = grid.querySelectorAll(".card");

    if (!buttons.length || !cards.length) return;

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const filter = btn.dataset.filter || "all";

        buttons.forEach((b) =>
          b.classList.toggle("active", b === btn)
        );

        cards.forEach((card) => {
          const cat = card.dataset.category || "all";
          card.style.display =
            filter === "all" || filter === cat ? "" : "none";
        });
      });
    });

    // Mark "All" as active by default
    const allBtn = document.querySelector('.filter-btn[data-filter="all"]');
    if (allBtn) allBtn.classList.add("active");
  }

  /****************************************************
   * AUTO PRODUCT CATALOG (Storefront API)
   * Renders into #fw-products-grid
   ****************************************************/
  async function loadFourthwallProducts() {
    const grid = document.getElementById("fw-products-grid");
    if (!grid) return;

    grid.innerHTML = "<p>Loading products…</p>";

    if (!FW_STOREFRONT_TOKEN || FW_STOREFRONT_TOKEN.includes("YOUR_")) {
      grid.innerHTML =
        '<p>Storefront token not configured yet. Set it in <code>main.js</code>.</p>';
      return;
    }

    try {
      const url =
        `https://storefront-api.fourthwall.com/v1/collections/` +
        `${encodeURIComponent(FW_COLLECTION_SLUG)}/products` +
        `?storefront_token=${encodeURIComponent(FW_STOREFRONT_TOKEN)}`;

      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch products");

      const data = await res.json();
      const products = data.results || [];

      if (!Array.isArray(products) || products.length === 0) {
        grid.innerHTML = "<p>No products found in this collection.</p>";
        return;
      }

      const cardsHtml = products
        .map((product) => {
          const title = product.name || "Untitled product";

          const descriptionRaw = cleanDescription(
            product.description ||
              "Digital product from Mylemans Online."
          );
          const description =
            descriptionRaw.length > 150
              ? descriptionRaw.slice(0, 150) + "…"
              : descriptionRaw;

          const image =
            product.images &&
            product.images[0] &&
            (product.images[0].transformedUrl ||
              product.images[0].url);

          const firstVariant =
            product.variants && product.variants[0]
              ? product.variants[0]
              : null;
          let price = "";
          if (firstVariant && firstVariant.unitPrice) {
            const value = firstVariant.unitPrice.value;
            const currency = firstVariant.unitPrice.currency;
            price = `${value} ${currency}`;
          }

          const slug = product.slug || "";
          const productUrl =
            product.url || `${FW_SHOP_URL}/product/${slug}`;

          const category = determineCategory(product);

          return `
            <article class="card merch-card"
                     data-category="${escapeHtml(category)}">
              ${
                image
                  ? `<img src="${image}" alt="${escapeHtml(
                      title
                    )}" class="merch-image" loading="lazy">`
                  : ""
              }
              <h3>${escapeHtml(title)}</h3>
              <p class="card-description">${escapeHtml(description)}</p>
              ${
                price
                  ? `<p class="merch-price">${escapeHtml(price)}</p>`
                  : ""
              }
              <a href="${productUrl}?utm_source=site&utm_medium=catalog"
                 class="btn btn-secondary"
                 target="_blank"
                 rel="noreferrer">
                View on Fourthwall
              </a>
            </article>
          `;
        })
        .join("");

      grid.innerHTML = cardsHtml;
      setupProductFilters();
    } catch (err) {
      console.error(err);
      grid.innerHTML = `
        <p>
          Could not load products right now. You can still
          visit the store on
          <a href="${FW_SHOP_URL}" target="_blank" rel="noreferrer">
            Fourthwall
          </a>.
        </p>
      `;
    }
  }

  /****************************************************
   * OPTIONAL: SIMPLE MERCH GRID (if you ever add
   * #fw-merch-grid somewhere else)
   ****************************************************/
  async function loadFourthwallMerchGrid() {
    const grid = document.getElementById("fw-merch-grid");
    if (!grid) return;

    grid.innerHTML = "<p>Loading merch…</p>";

    try {
      const res = await fetch(`${FW_SHOP_URL}/collections/all.json`);
      if (!res.ok) throw new Error("Failed to fetch merch");

      const data = await res.json();
      const products = data.products || [];

      if (!Array.isArray(products) || products.length === 0) {
        grid.innerHTML = "<p>No merch available right now.</p>";
        return;
      }

      grid.innerHTML = products
        .slice(0, 6)
        .map((prod) => {
          const title = prod.title || "Unnamed product";
          const image =
            (prod.images &&
              prod.images[0] &&
              (prod.images[0].src || prod.images[0].url)) ||
            "";
          const price =
            prod.price ||
            (prod.variants &&
              prod.variants[0] &&
              prod.variants[0].price) ||
            "";
          const url =
            FW_SHOP_URL +
            (prod.url ||
              `/products/${prod.handle || prod.slug || ""}`);

          return `
            <article class="card merch-card">
              ${
                image
                  ? `<img src="${image}" alt="${escapeHtml(
                      title
                    )}" class="merch-image" loading="lazy">`
                  : ""
              }
              <h3>${escapeHtml(title)}</h3>
              ${
                price
                  ? `<p class="merch-price">${escapeHtml(price)}</p>`
                  : ""
              }
              <a href="${url}?utm_source=site&utm_medium=merch_section"
                 class="btn btn-secondary"
                 target="_blank"
                 rel="noreferrer">
                View product
              </a>
            </article>
          `;
        })
        .join("");
    } catch (err) {
      console.error(err);
      grid.innerHTML = `
        <p>
          Unable to load merch right now.
          You can still visit the full store on
          <a href="${FW_SHOP_URL}" target="_blank" rel="noreferrer">
            Fourthwall
          </a>.
        </p>
      `;
    }
  }


/* Blog cards are rendered by Jekyll at build time (see index.html). */

  let fourthwallProductsLoaded = false;
  let fourthwallMerchLoaded = false;

  function initFourthwallProducts() {
    const productsGridEl = document.getElementById("fw-products-grid");
    if (!productsGridEl || fourthwallProductsLoaded) return;
    fourthwallProductsLoaded = true;
    loadFourthwallProducts();
  }

  function initFourthwallMerchGrid() {
    const merchGridEl = document.getElementById("fw-merch-grid");
    if (!merchGridEl || fourthwallMerchLoaded) return;
    fourthwallMerchLoaded = true;
    loadFourthwallMerchGrid();
  }

  // -----------------------------
  // 4) Main site init
  // -----------------------------
  function initSite() {
    const root = document.documentElement;

    // === Theme handling ===
    const themeToggle = document.querySelector(".theme-toggle");

    function getPreferredTheme() {
      const stored = window.localStorage.getItem("theme");
      if (stored === "light" || stored === "dark") return stored;

      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
      ) {
        return "dark";
      }
      return "light";
    }

    function setTheme(theme) {
      root.setAttribute("data-theme", theme);
      window.localStorage.setItem("theme", theme);
    }

    function toggleTheme() {
      const current = root.getAttribute("data-theme") || "light";
      setTheme(current === "light" ? "dark" : "light");
    }

    setTheme(getPreferredTheme());

    if (themeToggle) {
      themeToggle.addEventListener("click", toggleTheme);
    }

    // React to system scheme if user hasn't chosen manually
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    if (mq && mq.addEventListener) {
      mq.addEventListener("change", (event) => {
        const stored = window.localStorage.getItem("theme");
        if (!stored) {
          setTheme(event.matches ? "dark" : "light");
        }
      });
    }

    // === Mobile nav ===
    const navToggle = document.querySelector(".nav-toggle");
    const navClose = document.querySelector(".nav-close");
    const body = document.body;

    if (navToggle) {
      navToggle.addEventListener("click", () => {
        const isOpen = body.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
      });
    }

    if (navClose) {
      navClose.addEventListener("click", () => {
        body.classList.remove("nav-open");
        navToggle.setAttribute("aria-expanded", "false");
      });
    }

    // === Dynamic year ===
    const yearSpan = document.getElementById("year");
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }

    // === Newsletter (sends via Resend) ===
    function initNewsletter() {
      const form = document.getElementById("newsletter-form");
      if (!form) return;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailInput = form.querySelector("input[type='email']");
        const email = emailInput ? emailInput.value.trim() : "";
        if (!email) return;

        const button = form.querySelector("button[type='submit']");
        const originalText = button.textContent;
        button.textContent = "Subscribing…";
        button.disabled = true;

        try {
          var res = await fetch("/api/subscribe", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email }),
          });

          if (!res.ok) {
            var data = await res.json().catch(function () { return {}; });
            throw new Error(data.error || "Something went wrong.");
          }

          var card = form.closest(".newsletter-card");
          if (card) {
            var formEl = card.querySelector(".newsletter-form-inline");
            if (formEl) {
              formEl.outerHTML =
                '<div class="newsletter-success">' +
                  '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
                  ' Subscribed. Confirmation on its way.' +
                '</div>';
            }
          }
        } catch (err) {
          button.textContent = originalText;
          button.disabled = false;
          var old = form.querySelector(".newsletter-error");
          if (old) old.remove();
          var msg = document.createElement("p");
          msg.className = "newsletter-error";
          msg.style.cssText = "color:#ef4444;font-size:0.82rem;margin-top:0.5rem;text-align:center;";
          msg.textContent = err.message || "Something went wrong. Try again.";
          form.appendChild(msg);
          setTimeout(function () { msg.remove(); }, 4000);
        }
      });
    }

    // === SafeTunnel email capture (sends via Resend) ===
    function initSafeTunnelForm() {
      const form = document.getElementById("safetunnel-form");
      if (!form) return;

      form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const emailInput = form.querySelector("input[type='email']");
        const email = emailInput ? emailInput.value.trim() : "";
        if (!email) return;

        const button = form.querySelector("button[type='submit']");
        const originalText = button.textContent;
        button.textContent = "Sending…";
        button.disabled = true;

        try {
          const res = await fetch("/api/notify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });

          if (!res.ok) {
            const data = await res.json().catch(() => ({}));
            throw new Error(data.error || "Something went wrong.");
          }

          const cta = form.closest(".safetunnel-cta");
          if (cta) {
            cta.innerHTML =
              '<div class="safetunnel-success">' +
                '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>' +
                '<div>' +
                  '<p class="safetunnel-success-title">You’re on the list.</p>' +
                  '<p class="safetunnel-success-detail">I’ll send one email to <strong>' + email + '</strong> when SafeTunnel opens.</p>' +
                '</div>' +
              '</div>';
          }
        } catch (err) {
          button.textContent = originalText;
          button.disabled = false;
          var old = form.querySelector(".safetunnel-error");
          if (old) old.remove();
          var msg = document.createElement("p");
          msg.className = "safetunnel-error";
          msg.textContent = err.message || "Something went wrong. Try again.";
          form.appendChild(msg);
          setTimeout(function () { msg.remove(); }, 4000);
        }
      });
    }

    initNewsletter();
    initSafeTunnelForm();


  // === Collapsible category pills (blog index, phone width) ===
  document.querySelectorAll(".pill-row-collapsible .pill-more").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var row = btn.closest(".pill-row-collapsible");
      var open = row.classList.toggle("is-open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.textContent = open ? "Less" : "More";
    });
  });

  // === YouTube facades: thumbnail + play button, player only on click ===
  function ytFacadeFrom(id, title) {
    var wrap = document.createElement("div");
    wrap.className = "yt-facade";
    wrap.setAttribute("data-yt-id", id);
    wrap.innerHTML =
      '<img src="https://i.ytimg.com/vi/' + id + '/maxresdefault.jpg" alt="" loading="lazy" onerror="this.onerror=null;this.src=\'https://i.ytimg.com/vi/' + id + '/hqdefault.jpg\'">' +
      '<button type="button" class="yt-facade-play" aria-label="Play video"><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg></button>' +
      (title ? '<span class="yt-facade-title"></span>' : "");
    if (title) wrap.querySelector(".yt-facade-title").textContent = title;
    return wrap;
  }
  function activateFacade(el) {
    var id = el.getAttribute("data-yt-id");
    if (!id) return;
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + id + "?autoplay=1&rel=0";
    f.title = el.getAttribute("data-yt-title") || "YouTube video";
    f.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    f.allowFullscreen = true;
    el.innerHTML = "";
    el.appendChild(f);
  }
  // Replace embedded iframes inside posts with facades
  document.querySelectorAll('.post-content iframe[src*="youtube.com/embed/"], .post-content iframe[src*="youtube-nocookie.com/embed/"]').forEach(function (fr) {
    var m = fr.src.match(/embed\/([\w-]{11})/);
    if (!m) return;
    var fac = ytFacadeFrom(m[1], fr.title && fr.title !== "YouTube video player" ? fr.title : "");
    var parent = fr.parentNode;
    if (parent && (parent.classList.contains("videoWrapper") || parent.classList.contains("youtube-wrap"))) {
      parent.parentNode.replaceChild(fac, parent);
    } else {
      parent.replaceChild(fac, fr);
    }
  });
  document.addEventListener("click", function (e) {
    var play = e.target.closest(".yt-facade-play");
    if (play) activateFacade(play.closest(".yt-facade"));
  });

    // === Fourthwall products ===
    initFourthwallProducts();
    initFourthwallMerchGrid();
  }

  // -----------------------------
  // 5) Run everything
  // -----------------------------
  // Links into Labs carry the current theme; Labs reads ?theme= once and stores it.
  document.addEventListener("click", (evt) => {
    const a = evt.target.closest('a[href^="https://labs.mylemans.online"]');
    if (!a) return;
    try {
      const u = new URL(a.href);
      const t = document.documentElement.getAttribute("data-theme");
      if (t === "dark" || t === "light") { u.searchParams.set("theme", t); a.href = u.toString(); }
    } catch (e) { /* ignore */ }
  });

  document.addEventListener("DOMContentLoaded", async () => {
    // First inject header / footer partials
    await loadPartials();
    // Then wire everything up
    initSite();
    initCookieConsent();
  });

  // ---- Google Analytics with cookie consent ---- //
  const GA_MEASUREMENT_ID = "G-NKK7TC3YZ7";
  const COOKIE_CONSENT_KEY = "cookieConsent";
  const COOKIE_CONSENT_ACCEPTED = "accepted";

  // Google AdSense, loaded only after cookie consent and only when the
  // layout exposed window.MO_ADSENSE (adsense.enabled in _config.yml).
  function loadAds() {
    var cfg = window.MO_ADSENSE;
    if (!cfg || !cfg.client || window.adsLoaded) return;
    window.adsLoaded = true;
    var s = document.createElement("script");
    s.async = true;
    s.crossOrigin = "anonymous";
    s.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + encodeURIComponent(cfg.client);
    s.onload = function () {
      var slots = document.querySelectorAll("ins.adsbygoogle");
      for (var i = 0; i < slots.length; i++) {
        try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
      }
    };
    document.head.appendChild(s);
  }

  function loadAnalytics() {
    loadAds();
    // Prevent double-loading
    if (window.gtagLoaded) return;
    window.gtagLoaded = true;

    // Load GA script
    const gaScript = document.createElement("script");
    gaScript.async = true;
    gaScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
    gaScript.onload = () => {
      window.dataLayer = window.dataLayer || [];
      function gtag(){ dataLayer.push(arguments); }
      window.gtag = gtag;

      gtag("js", new Date());
      gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });
    };
    document.head.appendChild(gaScript);
  }

  function initCookieConsent() {
    const banner = document.getElementById("cookie-banner");
    const acceptBtn = document.getElementById("cookie-accept");
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
    const hasConsent = consent === COOKIE_CONSENT_ACCEPTED;

    // Read consent and load analytics once if already accepted.
    if (hasConsent) {
      loadAnalytics();
    }

    // Show / hide banner based on consent state.
    if (banner) {
      banner.style.display = hasConsent ? "none" : "flex";
    }

    // Set consent on accept and conditionally load analytics once.
    if (acceptBtn) {
      acceptBtn.addEventListener("click", () => {
        localStorage.setItem(COOKIE_CONSENT_KEY, COOKIE_CONSENT_ACCEPTED);
        loadAnalytics();
        if (banner) {
          banner.style.display = "none";
        }
      }, { once: true });
    }
  }
})();
