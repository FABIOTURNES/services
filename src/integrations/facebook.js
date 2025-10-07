const fetch = require('node-fetch');

async function fetchFromFacebook(endpoint, accessToken) {
  const url = new URL(`https://graph.facebook.com/v17.0/${endpoint}`);
  url.searchParams.set('access_token', accessToken);

  const response = await fetch(url.href);
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`Erro ao consultar Facebook: ${response.status} ${errorBody}`);
  }
  return response.json();
}

async function fetchEngagement(postIdentifier, { includeLikes, includeComments }) {
  const accessToken = process.env.FACEBOOK_ACCESS_TOKEN;

  if (!accessToken) {
    return buildSimulatedResponse({ includeLikes, includeComments, platform: 'Facebook' });
  }

  try {
    const likes = [];
    if (includeLikes) {
      const likesEndpoint = `${postIdentifier}/likes?fields=id,name`; // requer pages_read_engagement.
      try {
        const likesResponse = await fetchFromFacebook(likesEndpoint, accessToken);
        likes.push(...(likesResponse.data || []));
      } catch (error) {
        console.warn(error.message);
      }
    }

    const comments = [];
    if (includeComments) {
      const commentsEndpoint = `${postIdentifier}/comments?fields=id,from,message`;
      try {
        const commentsResponse = await fetchFromFacebook(commentsEndpoint, accessToken);
        comments.push(...(commentsResponse.data || []).map((comment) => ({
          id: comment.from?.id ? `${comment.id}-${comment.from.id}` : comment.id,
          text: comment.message,
          user: { id: comment.from?.id, name: comment.from?.name }
        })));
      } catch (error) {
        console.warn(error.message);
      }
    }

    return { likes, comments };
  } catch (error) {
    console.warn(error.message);
    return buildSimulatedResponse({ includeLikes, includeComments, platform: 'Facebook' });
  }
}

function buildSimulatedResponse({ includeLikes, includeComments, platform }) {
  const likes = includeLikes
    ? [
        { id: `${platform}-like-1`, name: 'Carla Ferreira' },
        { id: `${platform}-like-2`, name: 'Pedro Lima' }
      ]
    : [];

  const comments = includeComments
    ? [
        {
          id: `${platform}-comment-1`,
          text: 'Comentando para participar! 🎉',
          user: { id: `${platform}-user-1`, name: 'Paula Costa' }
        },
        {
          id: `${platform}-comment-2`,
          text: 'Boa sorte a todos!',
          user: { id: `${platform}-user-2`, name: 'Rafael Nunes' }
        }
      ]
    : [];

  return { likes, comments, simulated: true };
}

module.exports = {
  fetchEngagement
};
