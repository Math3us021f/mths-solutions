// === MAIN.JS - VERSÃO CORRIGIDA E ROBUSTA ===

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

  const prefersReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // =========================
  // DOWNLOAD ROBUSTO DE ARQUIVOS
  // =========================
  function setupDownloadHandlers() {
    document.querySelectorAll('a[data-download="true"]').forEach(link => {
      link.addEventListener('click', handleDownload);
    });
  }

  async function handleDownload(e) {
    const link = e.currentTarget;
    const href = link.getAttribute('href');
    const filename = link.getAttribute('download') || 'Matheus_Antonio.pdf';

    // Verificar se é PDF
    if (!href || !href.endsWith('.pdf')) {
      return; // Deixar comportamento padrão
    }

    // Em file:// o fetch é bloqueado pela origem opaca: usar download nativo
    if (location.protocol === 'file:') {
      return;
    }

    e.preventDefault();

    // Declarado fora do try para estar disponível no catch também
    const originalText = link.textContent;

    try {
      // Mostrar feedback ao usuário
      link.textContent = '⏳ Baixando...';
      link.setAttribute('aria-disabled', 'true');
      link.style.pointerEvents = 'none';

      // Fazer fetch do arquivo
      const response = await fetch(href);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Converter para Blob
      const blob = await response.blob();

      // Verificar se é realmente um PDF
      if (blob.type !== 'application/pdf') {
        console.warn('Aviso: Arquivo pode não ser um PDF válido');
      }

      // Criar URL do Blob
      const blobUrl = URL.createObjectURL(blob);

      // Criar elemento <a> temporário para download
      const downloadLink = document.createElement('a');
      downloadLink.href = blobUrl;
      downloadLink.download = filename;
      downloadLink.style.display = 'none';

      // Adicionar ao DOM, clicar e remover
      document.body.appendChild(downloadLink);
      downloadLink.click();

      // Limpeza
      setTimeout(() => {
        downloadLink.remove();

        // Restaurar estado do botão
        link.textContent = originalText;
        link.removeAttribute('aria-disabled');
        link.style.pointerEvents = '';

        showToast('✅ Currículo baixado com sucesso!');
      }, 100);

      // Revogar só depois que o download iniciou (Safari aborta se for cedo)
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);

    } catch (error) {
      console.error('Erro ao baixar arquivo:', error);

      // Restaurar estado do botão em caso de erro
      link.textContent = originalText;
      link.removeAttribute('aria-disabled');
      link.style.pointerEvents = '';

      // Mostrar mensagem de erro
      if (error instanceof TypeError) {
        showToast('⚠️ Erro de conexão. Tente novamente.');
      } else if (error.message.includes('HTTP error')) {
        showToast('⚠️ Arquivo não encontrado (404).');
      } else {
        showToast('⚠️ Erro ao baixar o arquivo. Tente novamente.');
      }
    }
  }

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
  function closeMenu(returnFocus = true) {

    navLinks.classList.remove("active");
    btnMenu.classList.remove("open");

    btnMenu.setAttribute("aria-expanded", "false");

    menuOpen = false;

    if (returnFocus) btnMenu.focus();

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
          closeMenu(false);
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
      closeMenu(false);
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

        if (!targetId || targetId === "#") return;

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
          behavior: prefersReducedMotion ? "auto" : "smooth"
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
      link.removeAttribute("aria-current");
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
          link.setAttribute("aria-current", "true");
        }

      }

    });

  }

  if (sections.length > 0) {

    updateActiveLink();

    let activeLinkScheduled = false;

    window.addEventListener(
      "scroll",
      () => {

        if (activeLinkScheduled) return;

        activeLinkScheduled = true;

        requestAnimationFrame(() => {
          activeLinkScheduled = false;
          updateActiveLink();
        });

      },
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
  // RECONCILIAR MENU AO REDIMENSIONAR
  // =========================
  window.addEventListener(
    "resize",
    () => {

      if (menuOpen && window.innerWidth > 768) {
        closeMenu(false);
      }

    },
    { passive: true }
  );

  // =========================
  // TOAST
  // =========================
  function showToast(message) {

    const toast =
      document.createElement("div");

    toast.className = "toast";
    toast.setAttribute("role", "status");
    toast.setAttribute("aria-live", "polite");
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
  // INICIALIZAR HANDLERS DE DOWNLOAD
  // =========================
  setupDownloadHandlers();

});
