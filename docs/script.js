const detail = document.getElementById('arch-detail');
const nodes = document.querySelectorAll('.arch-node');

nodes.forEach((node) => {
  node.addEventListener('click', () => {
    nodes.forEach((n) => n.removeAttribute('aria-current'));
    node.setAttribute('aria-current', 'true');
    detail.textContent = node.dataset.detail;
  });
});

const search = document.getElementById('resource-search');
const cards = [...document.querySelectorAll('.resource-card')];

search.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  cards.forEach((card) => {
    const haystack = `${card.textContent} ${card.dataset.tags || ''}`.toLowerCase();
    card.classList.toggle('hidden', query && !haystack.includes(query));
  });
});
