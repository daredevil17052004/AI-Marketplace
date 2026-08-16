INSERT INTO agents (id, name, description, system_prompt, input_schema, credit_cost, created_by, is_active)
VALUES (
  gen_random_uuid(),
  'Text Summariser',
  'Summarises any text into 3 bullet points',
  'Summarise the following text into exactly 3 concise bullet points.',
  '{"fields": [{"name": "text", "type": "string", "required": true}]}',
  1,
  (SELECT id FROM users LIMIT 1),
  true
);

INSERT INTO credits_ledger (id, user_id, amount, reason)
VALUES (
  gen_random_uuid(),
  (SELECT id FROM users LIMIT 1),
  100,
  'signup_bonus'
);
