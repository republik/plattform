module.exports = async (discussion, _, context) => {
  const { pgdb } = context
  const result = await pgdb.query(
    `
    WITH data AS (
      SELECT
        c.id,
        CASE
          WHEN (coalesce(jsonb_array_length(c.tags), 0) > 0) THEN c.tags 
          WHEN (coalesce(jsonb_array_length(cr.tags), 0) > 0) THEN cr.tags 
          ELSE '[]'::jsonb
        END tags
      FROM comments c
      LEFT JOIN comments cr
      ON cr.id = (c."parentIds"->>0)::uuid
      WHERE c."discussionId" = :discussionId
    )
    
    SELECT value, COUNT(*) count
    FROM data d, jsonb_array_elements(d.tags) AS value
    GROUP BY 1 ;
  `,
    {
      discussionId: discussion.id,
    },
  )
  console.log(result)
  return result
}
