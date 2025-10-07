const form = document.getElementById('promotion-form');
const promotionList = document.getElementById('promotion-list');
const feedback = document.getElementById('promotion-feedback');
const yearElement = document.getElementById('year');

yearElement.textContent = new Date().getFullYear();

async function fetchPromotions() {
  try {
    const response = await fetch('/api/promotions');
    const data = await response.json();
    renderPromotions(data.promotions || []);
  } catch (error) {
    console.error(error);
    promotionList.innerHTML = '<li>Não foi possível carregar as promoções.</li>';
  }
}

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  feedback.textContent = '';

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());
  payload.includeLikes = formData.get('includeLikes') === 'on';
  payload.includeComments = formData.get('includeComments') === 'on';

  try {
    const response = await fetch('/api/promotions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao salvar a promoção.');
    }

    feedback.textContent = 'Promoção salva com sucesso!';
    feedback.style.color = '#22c55e';
    form.reset();
    document.getElementById('winners-count').value = 1;
    await fetchPromotions();
  } catch (error) {
    feedback.textContent = error.message;
    feedback.style.color = '#ef4444';
  }
});

function renderPromotions(promotions) {
  if (!promotions.length) {
    promotionList.innerHTML = '<li>Nenhum sorteio cadastrado ainda.</li>';
    return;
  }

  promotionList.innerHTML = '';

  promotions
    .slice()
    .reverse()
    .forEach((promotion) => {
      const item = document.createElement('li');
      item.className = 'promotion-item';
      item.innerHTML = `
        <header>
          <div>
            <h4>${promotion.name}</h4>
            <p class="muted">${formatPlatform(promotion.platform)} &bull; Publicação: ${promotion.postIdentifier}</p>
          </div>
          <span class="tag">${promotion.includeLikes ? 'Curtidas' : ''}${
        promotion.includeLikes && promotion.includeComments ? ' + ' : ''
      }${promotion.includeComments ? 'Comentários' : ''}</span>
        </header>
        <div class="promotion-actions">
          <button class="btn primary" data-action="draw" data-id="${promotion.id}">Sortear vencedor</button>
          <button class="btn ghost" data-action="participants" data-id="${promotion.id}">Ver participantes</button>
        </div>
        <div class="participant-list" hidden>
          <strong>Participantes elegíveis</strong>
          <p class="muted">A lista é atualizada diretamente das redes sociais</p>
          <ul></ul>
        </div>
      `;

      promotionList.appendChild(item);
    });
}

promotionList.addEventListener('click', async (event) => {
  const button = event.target.closest('button');
  if (!button) return;

  const promotionId = button.dataset.id;
  const action = button.dataset.action;

  if (action === 'participants') {
    await loadParticipants(button, promotionId);
  }

  if (action === 'draw') {
    await drawWinners(button, promotionId);
  }
});

async function loadParticipants(button, promotionId) {
  const container = button.closest('.promotion-item').querySelector('.participant-list');
  const list = container.querySelector('ul');
  list.innerHTML = '<li>Carregando participantes...</li>';
  container.hidden = false;
  const existingSummary = container.querySelector('.muted.summary');
  if (existingSummary) {
    existingSummary.remove();
  }

  try {
    const response = await fetch(`/api/promotions/${promotionId}/participants`);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao buscar participantes.');
    }

    if (!data.participants.length) {
      list.innerHTML = '<li>Nenhum participante elegível encontrado.</li>';
      return;
    }

    list.innerHTML = '';
    data.participants.forEach((participant) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${participant.name || participant.id}</span>
        <span>${participant.source || ''}</span>
      `;
      list.appendChild(li);
    });
  } catch (error) {
    list.innerHTML = `<li>${error.message}</li>`;
  }
}

async function drawWinners(button, promotionId) {
  button.disabled = true;
  const originalText = button.textContent;
  button.textContent = 'Sorteando...';

  try {
    const response = await fetch(`/api/promotions/${promotionId}/draw`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Erro ao sortear.');
    }

    const container = button.closest('.promotion-item').querySelector('.participant-list');
    container.hidden = false;
    const list = container.querySelector('ul');
    list.innerHTML = '';

    data.winners.forEach((winner) => {
      const li = document.createElement('li');
      li.innerHTML = `
        <span>${winner.name || winner.id}</span>
        <span>Vencedor</span>
      `;
      list.appendChild(li);
    });

    const existingSummary = container.querySelector('.muted.summary');
    if (existingSummary) {
      existingSummary.remove();
    }

    const summary = document.createElement('p');
    summary.className = 'muted summary';
    summary.textContent = `Total de participantes elegíveis: ${data.totalParticipants}`;
    container.prepend(summary);
  } catch (error) {
    alert(error.message);
  } finally {
    button.disabled = false;
    button.textContent = originalText;
  }
}

function formatPlatform(platform) {
  switch (platform) {
    case 'instagram':
      return 'Instagram';
    case 'facebook':
      return 'Facebook';
    case 'tiktok':
      return 'TikTok';
    default:
      return platform;
  }
}

fetchPromotions();
