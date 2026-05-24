/**
 * messageStore.js
 *
 * Stores messages in server RAM only.
 * Structure:
 *   dmMessages:    Map<roomId, Message[]>
 *   groupMessages: Map<groupId, Message[]>
 *   userRooms:     Map<userId, Set<roomId>>   -- tracks which rooms a user participates in
 */

const dmMessages = new Map();     // key = sorted userId1_userId2
const groupMessages = new Map();  // key = groupId
const userRooms = new Map();      // key = userId, value = Set of roomIds

function getDMRoomId(userId1, userId2) {
  return [userId1, userId2].sort().join('_');
}

function addDMMessage(userId1, userId2, message) {
  const roomId = getDMRoomId(userId1, userId2);
  if (!dmMessages.has(roomId)) dmMessages.set(roomId, []);
  dmMessages.get(roomId).push(message);

  // Track room for each user
  [userId1, userId2].forEach(uid => {
    if (!userRooms.has(uid)) userRooms.set(uid, new Set());
    userRooms.get(uid).add('dm:' + roomId);
  });
}

function getDMMessages(userId1, userId2) {
  return dmMessages.get(getDMRoomId(userId1, userId2)) || [];
}

function addGroupMessage(groupId, message) {
  if (!groupMessages.has(groupId)) groupMessages.set(groupId, []);
  groupMessages.get(groupId).push(message);
}

function getGroupMessages(groupId) {
  return groupMessages.get(groupId) || [];
}

/**
 * Called on user disconnect.
 * Deletes only DM messages where that user is a participant.
 * Group messages are NOT touched — only the user's own view is lost.
 */
function flushUserMessages(userId) {
  const rooms = userRooms.get(userId);
  if (!rooms) return;
  rooms.forEach(key => {
    if (key.startsWith('dm:')) {
      const roomId = key.slice(3);
      dmMessages.delete(roomId);
    }
    // Group messages are kept — other members still see them
  });
  userRooms.delete(userId);
}

module.exports = {
  getDMRoomId,
  addDMMessage,
  getDMMessages,
  addGroupMessage,
  getGroupMessages,
  flushUserMessages,
};