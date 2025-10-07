const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const promotionService = require('./src/services/promotionService');
const participantService = require('./src/services/participantService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await promotionService.listPromotions();
    res.json({ promotions });
  } catch (error) {
    res.status(500).json({ message: 'Não foi possível listar as promoções.', details: error.message });
  }
});

app.post('/api/promotions', async (req, res) => {
  try {
    const promotion = await promotionService.createPromotion(req.body);
    res.status(201).json({ promotion });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.get('/api/promotions/:id', async (req, res) => {
  try {
    const promotion = await promotionService.getPromotion(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promoção não encontrada.' });
    }
    res.json({ promotion });
  } catch (error) {
    res.status(500).json({ message: 'Não foi possível carregar a promoção.', details: error.message });
  }
});

app.get('/api/promotions/:id/participants', async (req, res) => {
  try {
    const promotion = await promotionService.getPromotion(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promoção não encontrada.' });
    }

    const participants = await participantService.fetchParticipantsForPromotion(promotion);
    res.json({ participants });
  } catch (error) {
    res.status(500).json({ message: 'Não foi possível carregar participantes.', details: error.message });
  }
});

app.post('/api/promotions/:id/draw', async (req, res) => {
  try {
    const promotion = await promotionService.getPromotion(req.params.id);
    if (!promotion) {
      return res.status(404).json({ message: 'Promoção não encontrada.' });
    }

    const winnersCount = Number(req.body.winnersCount || promotion.winnersCount || 1);
    if (Number.isNaN(winnersCount) || winnersCount < 1) {
      return res.status(400).json({ message: 'Quantidade de vencedores inválida.' });
    }

    const participants = await participantService.fetchParticipantsForPromotion(promotion);
    if (!participants.length) {
      return res.status(400).json({ message: 'Nenhum participante elegível foi encontrado.' });
    }

    const winners = participantService.drawWinners(participants, winnersCount);
    res.json({ winners, totalParticipants: participants.length });
  } catch (error) {
    res.status(500).json({ message: 'Não foi possível realizar o sorteio.', details: error.message });
  }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
