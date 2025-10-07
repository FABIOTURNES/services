const integrations = require('../integrations');

async function fetchParticipantsForPromotion(promotion) {
  const integration = integrations[promotion.platform];
  if (!integration) {
    throw new Error(`Integração não suportada para a plataforma ${promotion.platform}.`);
  }

  const { includeLikes, includeComments, postIdentifier } = promotion;
  const response = await integration.fetchEngagement(postIdentifier, { includeLikes, includeComments });

  const participantsMap = new Map();

  if (includeLikes && Array.isArray(response.likes)) {
    response.likes.forEach((like) => {
      if (like?.id) {
        participantsMap.set(like.id, {
          id: like.id,
          name: like.name || like.username || 'Participante sem nome',
          source: 'Curtida'
        });
      }
    });
  }

  if (includeComments && Array.isArray(response.comments)) {
    response.comments.forEach((comment) => {
      if (comment?.id || comment?.user?.id) {
        const participantId = comment.id || comment.user.id;
        const name = comment.username || comment.user?.username || comment.user?.name || 'Participante sem nome';
        const existing = participantsMap.get(participantId);
        participantsMap.set(participantId, {
          id: participantId,
          name,
          source: existing ? `${existing.source} + Comentário` : 'Comentário',
          comment: comment.text || comment.message
        });
      }
    });
  }

  return Array.from(participantsMap.values());
}

function drawWinners(participants, winnersCount) {
  const pool = [...participants];
  const winners = [];

  while (pool.length && winners.length < winnersCount) {
    const index = Math.floor(Math.random() * pool.length);
    winners.push(pool.splice(index, 1)[0]);
  }

  return winners;
}

module.exports = {
  fetchParticipantsForPromotion,
  drawWinners
};
