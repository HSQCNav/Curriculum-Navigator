(() => {
  'use strict';

  const DATA = window.HSQ_RECOMMENDATION_DATA;
  const STORAGE_KEY = 'hsq-curriculum-options-form-v1';
  const ACCENTS = ['#349f48', '#a6499a', '#f89521', '#e87cae', '#6b7f24', '#5577a8'];

  // Supplementary curriculum details transcribed from the supplied QLInformation workbook.
  // Recommendation selection remains entirely controlled by HSQ_RECOMMENDATION_DATA.
  const CURRICULUM_INFORMATION = [
  {
    "Curriculum Option": "Short Course Literacy",
    "Category": "Foundational Skills",
    "Description": "Accredited QCAA literacy learning.",
    "Teaching Notes": "Categorised at a 'Preparatory ' course, and provides 1 QCE Point upon completion. Only avilable for students who are in semester 2 of grade 10 or older. "
  },
  {
    "Curriculum Option": "Short Course Numeracy",
    "Category": "Foundational Skills",
    "Description": "Accredited QCAA numeracy learning.",
    "Teaching Notes": "Categorised at a 'Preparatory ' course, and provides 1 QCE Point upon completion. Only avilable for students who are in semester 2 of grade 10 or older. "
  },
  {
    "Curriculum Option": "Certificate I in Active Volunteering",
    "Category": "VET",
    "Description": "Nationally recognised VET course comprising of 5 units, and requiring 20 hours of volunteering.",
    "Teaching Notes": "Categorised at a 'Preparatory ' course, and provides 2 QCE Points upon completion"
  },
  {
    "Curriculum Option": "Short Course Careers",
    "Category": "Pathways Exploration",
    "Description": "Accredited QCAA career focused learning, including understanding preferences and opportunities.",
    "Teaching Notes": "Categorised at a 'Preparatory ' course, and provides 1 QCE Point upon completion. Only avilable for students who are in semester 2 of grade 10 or older. "
  },
  {
    "Curriculum Option": "SELF program",
    "Category": "Personal Growth",
    "Description": "A life skills course aimed at providing a solid foundation in self-awareness to promote well-being.",
    "Teaching Notes": "Categorised at a 'Preparatory ' course, and provides 1 QCE Point upon completion"
  },
  {
    "Curriculum Option": "QCAA Academic Integrity Course",
    "Category": "QCE Required Course",
    "Description": "An online course to help students avoid academic misconduct",
    "Teaching Notes": "A mandatory course for all students completing their QCE"
  },
  {
    "Curriculum Option": "STILE modules- Career & employment/ Adult life",
    "Category": "Pathways Exploration",
    "Description": "A non-accredited course to intruce key career realated concepts",
    "Teaching Notes": "No QCE points are attached to this course"
  },
  {
    "Curriculum Option": "Certificate in General Education for Adults",
    "Category": "Foundational Skills",
    "Description": "Provides foundational literacy and numeracy skills",
    "Teaching Notes": "Categorised at a 'Preparatory ' course, and provides 3 QCE Point upon completion"
  },
  {
    "Curriculum Option": "HSQ Curriculum Maths",
    "Category": "Australian Curriculum",
    "Description": "A different unit each term based on the HSQ Curriculum Plan",
    "Teaching Notes": ""
  },
  {
    "Curriculum Option": "HSQ Curriculum English",
    "Category": "Australian Curriculum",
    "Description": "A different unit each term based on the HSQ Curriculum Plan",
    "Teaching Notes": ""
  }
];

  const normaliseOption = value => String(value || '').trim().replace(/\s+/g, ' ').toLocaleLowerCase('en-AU');
  const curriculumInformationByOption = new Map(
    CURRICULUM_INFORMATION.map(row => [normaliseOption(row['Curriculum Option']), row])
  );
  const getCurriculumInformation = item => curriculumInformationByOption.get(normaliseOption(item.title)) || null;

  const refs = {
    openDrawer: document.getElementById('openDrawer'),
    closeDrawer: document.getElementById('closeDrawer'),
    drawer: document.getElementById('appDrawer'),
    overlay: document.getElementById('drawerOverlay'),
    drawerLinks: [...document.querySelectorAll('.drawer-link')],
    viewPanels: [...document.querySelectorAll('[data-view-panel]')],
    mainContent: document.getElementById('mainContent'),
    form: document.getElementById('studentForm'),
    year: document.getElementById('yearLevel'),
    stay: document.getElementById('lengthOfStay'),
    literacy: document.getElementById('literacyLevel'),
    numeracy: document.getElementById('numeracyLevel'),
    formError: document.getElementById('formError'),
    reset: document.getElementById('resetForm'),
    results: document.getElementById('resultsSection'),
    resultsTitle: document.getElementById('resultsTitle'),
    resultsLead: document.getElementById('resultsLead'),
    selectionSummary: document.getElementById('selectionSummary'),
    grid: document.getElementById('recommendationGrid'),
    empty: document.getElementById('noRecommendations'),
    copy: document.getElementById('copySummary'),
    print: document.getElementById('printResults'),
    toast: document.getElementById('toast'),
    aboutCombinationCount: document.getElementById('aboutCombinationCount'),
    aboutSourceRows: document.getElementById('aboutSourceRows'),
  };

  let lastFocused = null;
  let currentResult = null;
  let toastTimer = null;

function svgUse(id) {
const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
svg.setAttribute('aria-hidden', 'true');
 
const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
use.setAttribute('href', `#${id}`);
 
svg.appendChild(use);
return svg;
}
  function populateSelect(select, items) {
    for (const value of items) {
      const option = document.createElement('option');
      option.value = value;
      option.textContent = value;
      select.appendChild(option);
    }
  }

  function initData() {
    if (!DATA || !DATA.options || !DATA.matrix) {
      refs.formError.hidden = false;
      refs.formError.textContent = 'Recommendation data could not be loaded. Check that data/recommendations-data.js is present.';
      refs.form.querySelector('button[type="submit"]').disabled = true;
      return false;
    }

    populateSelect(refs.year, DATA.options.yearLevels);
    populateSelect(refs.stay, DATA.options.lengthsOfStay);
    populateSelect(refs.literacy, DATA.options.learningLevels);
    populateSelect(refs.numeracy, DATA.options.learningLevels);

    refs.aboutCombinationCount.textContent = String(DATA.metadata.combinationCount || 216);
    refs.aboutSourceRows.textContent = String(DATA.metadata.sourceRows || 660);
    restoreForm();
    return true;
  }

  function openDrawer() {
    lastFocused = document.activeElement;
    refs.drawer.classList.add('is-open');
    refs.drawer.setAttribute('aria-hidden', 'false');
    refs.overlay.hidden = false;
    refs.openDrawer.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    window.setTimeout(() => refs.closeDrawer.focus(), 20);
  }

  function closeDrawer() {
    refs.drawer.classList.remove('is-open');
    refs.drawer.setAttribute('aria-hidden', 'true');
    refs.overlay.hidden = true;
    refs.openDrawer.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  function showView(name) {
    refs.viewPanels.forEach(panel => {
      const active = panel.dataset.viewPanel === name;
      panel.hidden = !active;
      panel.classList.toggle('is-active', active);
    });
    refs.drawerLinks.forEach(link => link.classList.toggle('is-active', link.dataset.view === name));
    closeDrawer();
    refs.mainContent.focus({ preventScroll: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function saveForm() {
    const state = {
year: refs.year.value,
stay: refs.stay.value,
literacy: refs.literacy.value,
numeracy: refs.numeracy.value,
};
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (_) { /* optional */ }
  }

  function restoreForm() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const state = JSON.parse(raw);
      refs.year.value = state.year || '';
refs.stay.value = state.stay || '';
refs.literacy.value = state.literacy || '';
refs.numeracy.value = state.numeracy || '';
    } catch (_) { /* ignore malformed local storage */ }
  }

  function clearResults() {
    currentResult = null;
    refs.results.hidden = true;
    refs.grid.replaceChildren();
    refs.selectionSummary.replaceChildren();
    refs.empty.hidden = true;
  }

  function resetForm() {
    refs.form.reset();
    refs.formError.hidden = true;
    refs.formError.textContent = '';
    clearResults();
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) { /* optional */ }
refs.year.focus();
  }

  function validateForm() {
    const missing = [];
    if (!refs.year.value) missing.push('Year level');
    if (!refs.stay.value) missing.push('Length of stay');
    if (!refs.literacy.value) missing.push('Literacy level');
    if (!refs.numeracy.value) missing.push('Numeracy level');

   

    if (missing.length) {
      refs.formError.textContent = `Please complete: ${missing.join(', ')}.`;
      refs.formError.hidden = false;
      const firstMissing = [refs.year, refs.stay, refs.literacy, refs.numeracy].find(el => !el.value);
      if (firstMissing) firstMissing.focus();
      return false;
    }

    refs.formError.hidden = true;
    refs.formError.textContent = '';
    return true;
  }

  function matrixKey(profile) {
    return [profile.year, profile.stay, profile.literacy, profile.numeracy].join('||');
  }

  function profileFromForm() {
    return {
     year: refs.year.value,
      stay: refs.stay.value,
      literacy: refs.literacy.value,
      numeracy: refs.numeracy.value,
    };
  }

  function summaryChip(label, value) {
    const chip = document.createElement('span');
    chip.className = 'summary-chip';
    const strong = document.createElement('strong');
    strong.textContent = `${label}: `;
    chip.append(strong, document.createTextNode(value));
    return chip;
  }

  function iconId(name) {
    const allowed = new Set(['book', 'book-open', 'calculator', 'briefcase', 'heart', 'shield-check', 'compass', 'award', 'graduation-cap', 'sparkles']);
    return `i-${allowed.has(name) ? name : 'sparkles'}`;
  }

  function recommendationCard(item, index) {
    const card = document.createElement('article');
    card.className = 'recommendation-card';
    card.style.setProperty('--card-accent', ACCENTS[index % ACCENTS.length]);

    const top = document.createElement('div');
    top.className = 'recommendation-card__top';

    const icon = document.createElement('div');
    icon.className = 'recommendation-card__icon';
    icon.appendChild(svgUse(iconId(item.icon)));

    const category = document.createElement('span');
    category.className = 'recommendation-card__category';
    category.textContent = item.category || 'Curriculum option';
    top.append(icon, category);

    const title = document.createElement('h3');
    title.textContent = item.title;
    const description = document.createElement('p');
    description.textContent = item.description || 'This option is identified in the HSQ source matrix for this combination.';

    // Add supporting details only when the recommendation title matches a
    // Curriculum Option in QLInformation. Unmatched recommendations render as before.
    const curriculumInfo = getCurriculumInformation(item);
    const detailSections = [];
    if (curriculumInfo) {
      [
        ['Category', curriculumInfo['Category']],
        ['Description', curriculumInfo['Description']],
        ['Teaching Notes', curriculumInfo['Teaching Notes']]
      ].forEach(([label, value]) => {
        if (!String(value || '').trim()) return;
        const section = document.createElement('section');
        section.className = 'recommendation-card__detail';
        const heading = document.createElement('h4');
        heading.textContent = label;
        const text = document.createElement('p');
        text.textContent = String(value).trim();
        section.append(heading, text);
        detailSections.push(section);
      });
    }

    const footer = document.createElement('div');
    footer.className = 'recommendation-card__footer';
    if (item.link) {
      const link = document.createElement('a');
      link.className = 'process-link';
      link.href = item.link;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.append(document.createTextNode('Open process / resource'), svgUse('i-external'));
      footer.appendChild(link);
    } else {
      const noLink = document.createElement('span');
      noLink.className = 'no-link';
      noLink.textContent = 'No process link is entered in the source matrix.';
      footer.appendChild(noLink);
    }

    card.append(top, title, description, ...detailSections, footer);
    return card;
  }

  function renderResults(profile, recommendations) {
    currentResult = { profile, recommendations };
    refs.results.hidden = false;
    refs.grid.replaceChildren();
    refs.selectionSummary.replaceChildren();

    const count = recommendations.length;
    refs.resultsTitle.textContent = count === 1 ? '1 recommended option' : `${count} recommended options`;
    refs.resultsLead.textContent = count
      ? 'These are the curriculum options entered in the source matrix for this exact combination.'
      : 'The source combination exists, but no curriculum option is entered against it.';

    
    refs.selectionSummary.append(
      summaryChip('Year', profile.year),
      summaryChip('Stay', profile.stay),
      summaryChip('Literacy', profile.literacy),
      summaryChip('Numeracy', profile.numeracy),
    );

    if (count) {
      refs.empty.hidden = true;
      recommendations.forEach((item, index) => refs.grid.appendChild(recommendationCard(item, index)));
    } else {
      refs.empty.hidden = false;
    }

    window.setTimeout(() => refs.results.scrollIntoView({ behavior: 'smooth', block: 'start' }), 20);
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;
    const profile = profileFromForm();
    saveForm();
    const recommendations = DATA.matrix[matrixKey(profile)] || [];
    renderResults(profile, recommendations);
  }

  function buildPlainTextSummary() {
    if (!currentResult) return '';
    const { profile, recommendations } = currentResult;
    const lines = [
      'HSQ Curriculum Options – Student Summary',
      '----------------------------------------',
    ];
    
    lines.push(
      `Year level: ${profile.year}`,
      `Length of stay: ${profile.stay}`,
      `Literacy level: ${profile.literacy}`,
      `Numeracy level: ${profile.numeracy}`,
      '',
      'Recommended curriculum options:',
    );
    if (!recommendations.length) {
      lines.push('- No curriculum option is entered in the source matrix for this exact combination.');
    } else {
      recommendations.forEach(item => {
        lines.push(`- ${item.title}${item.link ? ` — ${item.link}` : ''}`);
      });
    }
    lines.push('', 'Note: Apply professional judgement and current HSQ processes when deciding what is appropriate for an individual student.');
    return lines.join('\n');
  }

  async function copySummary() {
    const text = buildPlainTextSummary();
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      showToast('Summary copied to clipboard');
    } catch (_) {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      document.execCommand('copy');
      area.remove();
      showToast('Summary copied to clipboard');
    }
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    refs.toast.textContent = message;
    refs.toast.hidden = false;
    toastTimer = window.setTimeout(() => { refs.toast.hidden = true; }, 2200);
  }

  function registerEvents() {
    refs.openDrawer.addEventListener('click', openDrawer);
    refs.closeDrawer.addEventListener('click', closeDrawer);
    refs.overlay.addEventListener('click', closeDrawer);
    refs.drawerLinks.forEach(link => link.addEventListener('click', () => showView(link.dataset.view)));
    refs.form.addEventListener('submit', handleSubmit);
    refs.reset.addEventListener('click', resetForm);
    refs.copy.addEventListener('click', copySummary);
    refs.print.addEventListener('click', () => window.print());
    [refs.year, refs.stay, refs.literacy, refs.numeracy].forEach(el => el.addEventListener('change', saveForm));

    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && refs.drawer.classList.contains('is-open')) closeDrawer();
      if (event.key === 'Tab' && refs.drawer.classList.contains('is-open')) {
        const focusables = [...refs.drawer.querySelectorAll('button, a[href]')].filter(el => !el.disabled);
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    });
  }

  function registerServiceWorker() {
    if ('serviceWorker' in navigator && location.protocol !== 'file:') {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js').catch(() => {
          // The app still works without offline/PWA support.
        });
      });
    }
  }

  registerEvents();
  initData();
  registerServiceWorker();
})();
