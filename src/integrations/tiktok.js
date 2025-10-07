const fetch = require('node-fetch');

async function fetchFromTikTok(endpoint, accessToken, body) {
  const url = `https://open.tiktokapis.com${endpoint}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro ao consultar TikTok: ${response.status} ${errorBody}`);
  }
  return response.json();
}

async function fetchEngagement(postIdentifier, { includeLikes, includeComments }) {
  const accessToken = process.env.TIKTOK_ACCESS_TOKEN;

  if (!accessToken) {
    return buildSimulatedResponse({ includeLikes, includeComments, platform: 'TikTok' });
  }

  try {
    const participants = { likes: [], comments: [] };

    if (includeLikes) {
      try {
        const likesResponse = await fetchFromTikTok(
          '/v2/research/video/like/list/',
          accessToken,
          {
            video_id: postIdentifier,
            max_count: 200
          }
        );
        const likes = likesResponse.data?.records || [];
        participants.likes.push(...likes.map((like) => ({
          id: like.user?.id || like.user?.open_id,
          name: like.user?.display_name || like.user?.username
        })));
      } catch (error) {
        console.warn(error.message);
      }
    }

    if (includeComments) {
      try {
        const commentsResponse = await fetchFromTikTok(
          '/v2/research/video/comment/list/',
          accessToken,
          {
            video_id: postIdentifier,
            max_count: 200
          }
        );
        const comments = commentsResponse.data?.records || [];
        participants.comments.push(
          ...comments.map((comment) => ({
            id: comment.comment_id,
            text: comment.text,
            user: {
              id: comment.user?.id || comment.user?.open_id,
              username: comment.user?.username,
              display_name: comment.user?.display_name
            }
          }))
        );
      } catch (error) {
        console.warn(error.message);
      }
    }

    return participants;
  } catch (error) {
    console.warn(error.message);
    return buildSimulatedResponse({ includeLikes, includeComments, platform: 'TikTok' });
  }
}

function buildSimulatedResponse({ includeLikes, includeComments, platform }) {
  const likes = includeLikes
    ? [
        { id: `${platform}-like-1`, name: 'tiktoklover' },
        { id: `${platform}-like-2`, name: 'dance_star' }
      ]
    : [];

  const comments = includeComments
    ? [
        {
          id: `${platform}-comment-1`,
          text: 'Vim pelo sorteio! 🤩',
          user: { id: `${platform}-user-1`, username: 'foryoufan' }
        },
        {
          id: `${platform}-comment-2`,
          text: 'Já estou participando!',
          user: { id: `${platform}-user-2`, username: 'viralqueen' }
        }
      ]
    : [];

  return { likes, comments, simulated: true };
}

module.exports = {
  fetchEngagement
};
