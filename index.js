'use strict';
const getEmails = require('get-emails');
const got = require('got');

module.exports = user => {
	if (typeof user !== 'string') {
		throw new TypeError(`Expected a string, got ${typeof user}`);
	}

	return got(`https://instagram.com/${user}`, { json: false })
		.then(res => {

			let m = /<script type="text\/javascript">window\._sharedData \=(.+)\;<\/script>/g.exec(res.body);
			let __a = JSON.parse(m[1]);
			res = {
				body: {
					graphql: __a.entry_data.ProfilePage[0].graphql
				}
			};

			return {
				description: res.body.graphql.user.biography || '',
				email: getEmails(res.body.graphql.user.biography || '')[0] || '',
				followers: res.body.graphql.user.edge_followed_by.count,
				following: res.body.graphql.user.edge_follow.count,
				fullName: res.body.graphql.user.full_name || '',
				id: res.body.graphql.user.id,
				posts: res.body.graphql.user.edge_owner_to_timeline_media.count,
				url: `http://instagram.com/${user}`,
				username: res.body.graphql.user.username,
				website: res.body.graphql.user.external_url || ''
			};
		})
		.catch(err => {
			if (err.statusCode === 404) {
				err.message = `User "${user}" not found`;
			}

			throw err;
		});
};