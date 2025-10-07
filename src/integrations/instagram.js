const fetch = require('node-fetch');

async function fetchFromInstagram(endpoint, accessToken) {
  const url = new URL(`https://graph.facebook.com/v17.0/${endpoint}`);
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url.href);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro ao consultar Instagram: ${response.status} ${errorBody}`);
  }
  return response.json();
}

async function fetchEngagement(postIdentifier, { includeLikes, includeComments }) {
  const accessToken = process.env.INSTAGRAM_ACCESS_TOKEN;

  if (!accessToken) {
    return buildSimulatedResponse({ includeLikes, includeComments, platform: 'Instagram' });
  }

  try {
    const fields = [];
    if (includeLikes) {
      fields.push('like_count');
    }
    if (includeComments) {
      fields.push('comments{username,text,id,user{id,username}}');
    }
    const endpoint = `${postIdentifier}?fields=${encodeURIComponent(fields.join(','))}`;
    const data = await fetchFromInstagram(endpoint, accessToken);

    const likes = [];
    if (includeLikes) {
      const likesEndpoint = `${postIdentifier}/likes?fields=id,username`; // requer permissões avançadas.
      try {
        const likesResponse = await fetchFromInstagram(likesEndpoint, accessToken);
        likes.push(...(likesResponse.data || []));
      } catch (error) {
        console.warn(error.message);
      }
    }

    const comments = [];
    if (includeComments) {
      const commentsData = data.comments?.data || [];
      comments.push(...commentsData.map((comment) => ({
        id: comment.id,
        text: comment.text,
        username: comment.username,
        user: comment.user
      })));
    }

    return { likes, comments };
  } catch (error) {
    console.warn(error.message);
    return buildSimulatedResponse({ includeLikes, includeComments, platform: 'Instagram' });
  }
}

function buildSimulatedResponse({ includeLikes, includeComments, platform }) {
  const likes = includeLikes
    ? [
        { id: `${platform}-like-1`, name: 'Maria Santos' },
        { id: `${platform}-like-2`, name: 'João Pereira' }
      ]
    : [];

  const comments = includeComments
    ? [
        {
          id: `${platform}-comment-1`,
          username: 'influencer_fan',
          text: 'Quero muito ganhar!',
          user: { id: `${platform}-comment-1`, username: 'influencer_fan' }
        },
        {
          id: `${platform}-comment-2`,
          username: 'seguidora123',
          text: 'Participando! 💖',
          user: { id: `${platform}-comment-2`, username: 'seguidora123' }
        }
      ]
    : [];

  return { likes, comments, simulated: true };
}

module.exports = {
  fetchEngagement
};
