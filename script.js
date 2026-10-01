/* ==========================================================================
   HealthCare Plus - minimal vanilla JavaScript
   1. Sticky header shadow     4. Department -> doctor options
   2. Mobile navigation        5. Appointment form handling
   3. Active link on scroll    6. Footer year + image fallback
   ========================================================================== */
(() => {
  'use strict';

  const $ = (selector, scope = document) => scope.querySelector(selector);
  const $$ = (selector, scope = document) => [...scope.querySelectorAll(selector)];

  /* 1. Sticky header shadow ------------------------------------------------ */
  const header = $('#site-header');
  const updateHeader = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  /* 2. Mobile navigation --------------------------------------------------- */
  const menuToggle = $('#menu-toggle');
  const mobileMenu = $('#mobile-menu');
  const iconOpen = $('#icon-open');
  const iconClose = $('#icon-close');

  const setMenu = (open) => {
    mobileMenu.classList.toggle('hidden', !open);
    iconOpen.classList.toggle('hidden', open);
    iconClose.classList.toggle('hidden', !open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };

  menuToggle.addEventListener('click', () => {
    setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  // Close after choosing a link
  mobileMenu.addEventListener('click', (event) => {
    if (event.target.closest('a')) setMenu(false);
  });

  // Close with Escape and return focus to the toggle
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      menuToggle.focus();
    }
  });

  // Reset when the viewport grows to desktop size
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (event) => {
    if (event.matches) setMenu(false);
  });

  /* 3. Highlight the nav link for the section in view ---------------------- */
  const navLinks = $$('[data-nav]');
  const sectionIds = [...new Set(navLinks.map((link) => link.getAttribute('href').slice(1)))];
  const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((link) => {
            const isActive = link.getAttribute('href') === `#${entry.target.id}`;
            if (isActive) link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
          });
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );
    sections.forEach((section) => observer.observe(section));
  }

  /* 4. Department -> doctor options ---------------------------------------- */
  // Edit this object to change who appears for each department.
  const doctorsByDepartment = {
    'General Consultation': ['Dr. Daniel Reyes', 'Dr. Hannah Brooks'],
    'Cardiology': ['Dr. Amelia Hart', 'Dr. Samuel Whitaker'],
    'Dental Care': ['Dr. Lena Okafor', 'Dr. Tomas Varga'],
    'Pediatrics': ['Dr. Priya Nair', 'Dr. Oliver Grant'],
    'Dermatology': ['Dr. Marcus Chen', 'Dr. Sofia Alvarez']
  };

  const department = $('#department');
  const doctor = $('#doctor');

  const fillDoctors = () => {
    const names = doctorsByDepartment[department.value] || [];
    doctor.innerHTML = '';
    doctor.add(new Option('Select doctor', '', true, true));
    doctor.options[0].disabled = true;
    doctor.add(new Option('Any available doctor', 'Any available doctor'));
    names.forEach((name) => doctor.add(new Option(name, name)));
    doctor.disabled = false;
  };
  department.addEventListener('change', fillDoctors);

  /* 5. Appointment form ---------------------------------------------------- */
  const form = $('#appointment-form');
  const status = $('#form-status');
  const dateInput = $('#date');

  // Prevent choosing a date in the past (uses local time, not UTC)
  const today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  dateInput.min = today.toISOString().split('T')[0];

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    // Demo only: connect this to your backend or form service (e.g. fetch POST).
    const firstName = $('#name').value.trim().split(' ')[0];
    status.textContent = `Thank you, ${firstName}. Your request has been received and we will confirm your appointment within one business day.`;
    status.classList.remove('hidden');

    form.reset();
    doctor.innerHTML = '<option value="" selected disabled>Choose a department first</option>';
    doctor.disabled = true;
  });

  /* 6. Footer year + broken-image fallback --------------------------------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();

  const placeholder =
    'data:image/svg+xml,' +
    encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 300'>" +
        "<rect width='400' height='300' fill='#E7F5F3'/>" +
        "<path d='M200 115v70M165 150h70' stroke='#0F766E' stroke-width='12' stroke-linecap='round'/>" +
        '</svg>'
    );

  const useFallback = (img) => {
    if (img.dataset.fallback) return;
    img.dataset.fallback = 'true';
    img.src = placeholder;
  };

  // 'error' doesn't bubble, so listen in the capture phase
  document.addEventListener('error', (event) => {
    if (event.target instanceof HTMLImageElement) useFallback(event.target);
  }, true);

  // Catch images that failed before this script ran
  $$('img').forEach((img) => {
    if (img.complete && img.naturalWidth === 0) useFallback(img);
  });
})();
