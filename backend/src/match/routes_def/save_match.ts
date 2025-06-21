import { FastifyReply, FastifyRequest } from 'fastify';
import { Matches } from '../../db_models/matches_model';
import { User } from '../../db_models/user_model';
import { UserMatch } from '../../db_models/user_match_model';
import { CreateMatchRequest } from '../../interfaces';

export async function SaveMatch(request: FastifyRequest<{ Body: CreateMatchRequest}>, reply: FastifyReply) {
const { Players, game_duration } = request.body as CreateMatchRequest;
if (!Players || Players.length === 0) {
return reply.code(400).send({ error: 'Players are required' });
}
if (!game_duration) {
return reply.code(400).send({ error: 'Game duration is required' });
}
// if (Players.length < 2) {
// return reply.code(400).send({ error: 'At least two Players are required' });
// }
try {
	console.log('Saving match with data');
const match = await Matches.create({ game_duration: game_duration });
if (!match) {
return reply.code(400).send({ error: 'Failed to create match' });
}
console.log('Match created with ID:', match.match_id);

for (let i = 0; i < Players.length; i++) {
const player = Players[i];
let winnerCheck = false;
if (!player.username || player.score === undefined || player.is_winner === undefined) {
return reply.code(400).send({ error: 'Invalid player data' });
}
if (player.score < 0) {
return reply.code(400).send({ error: 'Player score cannot be negative' });
}
if (player.is_winner && !winnerCheck) {
winnerCheck = true;
}
else if (player.is_winner && winnerCheck) {
return reply.code(400).send({ error: 'Only one player can be marked as winner' });
}
}
console.log('All player data is valid');
for (let i = 0; i < Players.length; i++) {
const player = Players[i];
console.log(`Processing player: ${player.username} with score: ${player.score} and winner status: ${player.is_winner}`);
const user = await User.findOne({ where: { username: player.username } });

if (!user) {
return reply.code(404).send({ error: `User with ID ${player.username} not found` });
}
console.log(`Found user: ${user.username} with ID: ${user.user_id}`);
user.number_of_matches += 1;
if (player.is_winner) {
user.number_of_win += 1;
} else {
user.number_of_lose += 1;
}

const updatedUser = await user.save();
if (!updatedUser) {
return reply.code(400).send({ error: 'Failed to update user stats' });
}

const userMatch = await UserMatch.create({
match_id: match.match_id,
user_id: user.user_id,
winner: player.is_winner,
user_score: player.score
});
if (!userMatch) {
return reply.code(400).send({ error: 'Failed to save user match data' });
}
console.log(`User match saved for user: ${user.username} with match ID: ${match.match_id}`);
}
return reply.code(201).send({
message: 'Match saved successfully',
match_id: match.match_id,
});
}
catch (error) {
console.error('Error saving match:', error);
return reply.code(500).send({ error: 'Internal server error' });
}
}