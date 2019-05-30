UPDATE comments SET depth = COALESCE(jsonb_array_length("parentIds"), 0);

