import type { NextApiRequest } from 'next';
import { NextApiResponseServerIO } from 'types/next';
import { IgApiClient } from 'instagram-private-api';

const ig = new IgApiClient();

export default function handler(
    req: NextApiRequest,
    res: NextApiResponseServerIO
) {
    switch (req.method) {
        case 'POST':
            return unfollower();
        default:
            return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    async function unfollower() {
        const { username, password } = req.body;

        let error = false;
        ig.state.generateDevice(username);

        (async () => {
            const auth: any = await ig.account.login(username, password)
                .catch(err => {
                    error = true;
                    res?.socket?.server?.io?.emit('loggedInError', err.message.split('; ')[1] || 'Unknown error.');
                });
            if (!error) {
                res?.socket?.server?.io?.emit('loggedIn', `Successfully logged in as ${auth.username}!`);
                const followersFeed = ig.feed.accountFollowers(auth.pk);
                const followingFeed = ig.feed.accountFollowing(auth.pk);
                const followers = [
                    ...await followersFeed.items()
                ];
                const following = [
                    ...await followingFeed.items()
                ];
                if (!following.length) {
                    error = true;
                    res?.socket?.server?.io?.emit('error', 'Sorry. You have no one to unfollow.');
                }
                if (!error) {
                    const users = new Set(followers.map(({ username }) => username));
                    const notFollowingYou = following.filter(({ username }) => !users.has(username));
                    if (!notFollowingYou.length) {
                        error = true;
                        res?.socket?.server?.io?.emit('error', 'Everyone you followed has followed you back.');
                    }
                    if (!error) {
                        let failedUnfollow = '';
                        for (const user of notFollowingYou) {
                            try {
                                await ig.friendship.destroy(user.pk);
                                res?.socket?.server?.io?.emit('unfollow', `Unfollowed ${user.username}`);
                            } catch {
                                failedUnfollow += `${user.username}\n`;
                                res?.socket?.server?.io?.emit('unfollowError', `Did not unfollow ${user.username}`);
                            }
                        }
                        if (failedUnfollow) {
                            res?.socket?.server?.io?.emit('doneError', `Done with some issues...\nUsers who could not be unfollowed:\n${failedUnfollow}`);
                        } else {
                            res?.socket?.server?.io?.emit('done', `Done without issues!`);
                        }
                    }
                }
                await ig.account.logout();
            }
        })();
    }
}

export const config = {
    api: {
        externalResolver: true
    }
};