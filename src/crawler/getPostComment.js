const moment = require('moment');
const FB = require('fb');

const fb = new FB.Facebook();
fb.options({ Promise: Promise });

module.exports = async (post_id, since, limit) => {
  let data = [];

  let run = true;
  let after = undefined;
  limit = limit || 500;

  if (since) {
    since = moment(since).unix();
  }

  while (run) {
    let commentResponse;
    try {
      commentResponse = await FB.api(`${post_id}/comments`, {
        fields: ['id', 'parent.fields(id)', 'message', 'from', 'created_time'],
        access_token: process.env.FACEBOOK_ACCESS_TOKEN,
        order: 'reverse_chronological',
        filter: 'stream',
        after,
        since,
        limit
      });
    } catch (error) {
      console.log(`==== ERROR GET COMMENT FROM API ${error}`);
    }

    // check no response data
    if (run && (!commentResponse || !commentResponse.data || commentResponse.data.length === 0)) {
      run = false;
    } else {
      data = data.concat(commentResponse.data);
    }

    // check no paging
    if (run && (!commentResponse.paging || !commentResponse.paging.cursors)) {
      run = false;
    }

    if (run) {
      after = commentResponse.paging.cursors.after;
    }
  }

  return data;
};
