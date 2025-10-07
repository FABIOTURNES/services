const fs = require('fs/promises');
const path = require('path');
const { v4: uuid } = require('uuid');

const STORAGE_PATH = path.join(__dirname, '../../data/promotions.json');

async function readPromotions() {
  try {
    const content = await fs.readFile(STORAGE_PATH, 'utf-8');
    return JSON.parse(content || '[]');
  } catch (error) {
    if (error.code === 'ENOENT') {
      await fs.writeFile(STORAGE_PATH, '[]', 'utf-8');
      return [];
    }
    throw error;
  }
}

async function savePromotions(promotions) {
  await fs.writeFile(STORAGE_PATH, JSON.stringify(promotions, null, 2), 'utf-8');
}

function normalizePromotionInput(data) {
  const requiredFields = ['platform', 'postIdentifier'];
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`O campo "${field}" é obrigatório.`);
    }
  }

  const allowedPlatforms = ['instagram', 'facebook', 'tiktok'];
  if (!allowedPlatforms.includes(data.platform)) {
    throw new Error('Plataforma inválida. Selecione Instagram, Facebook ou TikTok.');
  }

  const normalized = {
    id: data.id || uuid(),
    name: data.name?.trim() || `Promoção ${new Date().toLocaleDateString('pt-BR')}`,
    platform: data.platform,
    postIdentifier: data.postIdentifier.trim(),
    includeLikes: Boolean(data.includeLikes),
    includeComments: Boolean(data.includeComments),
    winnersCount: Number(data.winnersCount) > 0 ? Number(data.winnersCount) : 1,
    createdAt: data.createdAt || new Date().toISOString()
  };

  if (!normalized.includeLikes && !normalized.includeComments) {
    throw new Error('Selecione ao menos curtidas ou comentários para participar.');
  }

  return normalized;
}

async function createPromotion(data) {
  const normalized = normalizePromotionInput(data);
  const promotions = await readPromotions();
  promotions.push(normalized);
  await savePromotions(promotions);
  return normalized;
}

async function getPromotion(id) {
  const promotions = await readPromotions();
  return promotions.find((item) => item.id === id);
}

async function listPromotions() {
  return readPromotions();
}

module.exports = {
  createPromotion,
  getPromotion,
  listPromotions
};
