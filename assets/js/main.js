// === MAIN.JS ===

document.addEventListener("DOMContentLoaded", () => {

  const btnMenu = document.getElementById("btnMenu");
  const navLinks = document.getElementById("navLinks");
  const header = document.getElementById("site-header");

  // Elementos obrigatórios do layout
  if (!btnMenu || !navLinks || !header) return;

  const navLinksDesktop =
    document.querySelectorAll("#navLinks .nav-link");

  function getHeaderOffset() {
    return header.offsetHeight;
  }

  const focusableSelector =
    'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

  let menuOpen = false;

  // =========================
  // ABRIR MENU
  // =========================
  function openMenu() {

    navLinks.classList.add("active");
    btnMenu.classList.add("open");

    btnMenu.setAttribute("aria-expanded", "true");

    menuOpen = true;

    const first =
      navLinks.querySelector(focusableSelector);

    if (first) first.focus();

  }

  // =========================
  // FECHAR MENU
  // =========================
  function closeMenu() {

    navLinks.classList.remove("active");
    btnMenu.classList.remove("open");

    btnMenu.setAttribute("aria-expanded", "false");

    menuOpen = false;

    btnMenu.focus();

  }

  // =========================
  // BOTÃO MENU
  // =========================
  btnMenu.addEventListener("click", () => {

    if (menuOpen) {
      closeMenu();
    } else {
      openMenu();
    }

  });

  // =========================
  // FECHAR MENU AO CLICAR EM LINK
  // =========================
  document
    .querySelectorAll("#navLinks .nav-link")
    .forEach(link => {

      link.addEventListener("click", () => {

        if (window.innerWidth <= 768) {
          closeMenu();
        }

      });

    });

  // =========================
  // FECHAR MENU AO CLICAR FORA
  // =========================
  document.addEventListener("click", (e) => {

    if (!menuOpen) return;

    if (
      !navLinks.contains(e.target) &&
      !btnMenu.contains(e.target)
    ) {
      closeMenu();
    }

  });

  // =========================
  // CONTROLE DE TECLADO
  // =========================
  document.addEventListener("keydown", (e) => {

    if (!menuOpen) return;

    if (e.key === "Escape") {
      closeMenu();
    }

    if (e.key === "Tab") {

      const focusable = Array.from(
        navLinks.querySelectorAll(focusableSelector)
      ).filter(el => el.offsetParent !== null);

      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (
        e.shiftKey &&
        document.activeElement === first
      ) {

        e.preventDefault();
        last.focus();

      } else if (
        !e.shiftKey &&
        document.activeElement === last
      ) {

        e.preventDefault();
        first.focus();

      }

    }

  });

  // =========================
  // ROLAGEM SUAVE
  // =========================
  document
    .querySelectorAll('a[href^="#"]')
    .forEach(link => {

      link.addEventListener("click", e => {

        const targetId =
          link.getAttribute("href");

        const target =
          document.querySelector(targetId);

        if (!target) return;

        e.preventDefault();

        const targetPosition =
          target.getBoundingClientRect().top +
          window.pageYOffset;

        const offsetPosition =
          targetPosition - getHeaderOffset();

        window.scrollTo({
          top: offsetPosition,
          behavior: "smooth"
        });

      });

    });

  // =========================
  // LINK ATIVO NO MENU
  // =========================
  const sections =
    document.querySelectorAll("main section[id]");

  function updateActiveLink() {

    const scrollPos =
      window.scrollY +
      getHeaderOffset() +
      20;

    navLinksDesktop.forEach(link => {
      link.classList.remove("active");
    });

    sections.forEach(section => {

      const top = section.offsetTop;
      const bottom =
        top + section.offsetHeight;

      const link =
        document.querySelector(
          `.nav-link[href="#${section.id}"]`
        );

      if (
        scrollPos >= top &&
        scrollPos < bottom
      ) {

        if (link) {
          link.classList.add("active");
        }

      }

    });

  }

  if (sections.length > 0) {

    updateActiveLink();

    window.addEventListener(
      "scroll",
      updateActiveLink,
      { passive: true }
    );

  }

  // =========================
  // SOMBRA NO HEADER
  // =========================
  function setHeaderShadow() {

    if (window.scrollY > 8) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }

  }

  setHeaderShadow();

  window.addEventListener(
    "scroll",
    setHeaderShadow,
    { passive: true }
  );

  // =========================
  // TOAST
  // =========================
  function showToast(message) {

    const toast =
      document.createElement("div");

    toast.className = "toast";
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
      toast.classList.add("visible");
    }, 10);

    setTimeout(() => {

      toast.classList.remove("visible");

      setTimeout(() => {
        toast.remove();
      }, 300);

    }, 2200);

  }

  // =========================
  // COPIAR E-MAIL
  // =========================
  document
    .querySelectorAll('a[href^="mailto:"]')
    .forEach(link => {

      link.addEventListener(
        "click",
        async () => {

          const href =
            link.getAttribute("href");

          if (!href) return;

          const email =
            href.replace(/^mailto:/i, "");

          if (!navigator.clipboard) return;

          try {

            await navigator.clipboard.writeText(email);

            showToast(
              "E-mail copiado para a área de transferência"
            );

          } catch {

            showToast(
              "Não foi possível copiar o e-mail"
            );

          }

        }
      );

    });

});