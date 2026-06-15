import { pool } from "../server.js";

export const deleteUserWordStatus = async ({
  userId,
  wordId,
  source,
  client = pool,
}) => {
  const normalizedUserId = Number(userId);
  const normalizedWordId = Number(wordId);
  const normalizedSource = source === "private" ? "private" : source === "public" ? "public" : null;

  if (!Number.isInteger(normalizedUserId) || normalizedUserId <= 0) {
    throw new Error("არასწორი userId");
  }

  if (!Number.isInteger(normalizedWordId) || normalizedWordId <= 0) {
    throw new Error("არასწორი wordId");
  }

  if (!normalizedSource) {
    throw new Error("source უნდა იყოს public ან private");
  }

  const result = await client.query(
    `DELETE FROM user_word_status
     WHERE user_id = $1
       AND word_id = $2
       AND source = $3`,
    [normalizedUserId, normalizedWordId, normalizedSource],
  );

  return {
    deleted: result.rowCount > 0,
    rowCount: result.rowCount,
  };
};