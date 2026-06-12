import pool from '../db.js';

// Confirms a plan exists AND belongs to the current user.
// Returns the plan row, or null if not found / not theirs.
async function findOwnedPlan(planId, userId) {
  const [rows] = await pool.query(
    'SELECT * FROM plans WHERE id = ? AND user_id = ?',
    [planId, userId]
  );
  return rows[0] || null;
}

// GET /api/plans  -> all of the user's plans (newest first)
export async function listPlans(req, res, next) {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM plans WHERE user_id = ? ORDER BY visit_date DESC, id DESC',
      [req.user.id]
    );
    res.json({ plans: rows });
  } catch (err) {
    next(err);
  }
}

// GET /api/plans/:id  -> one plan with its items
export async function getPlan(req, res, next) {
  try {
    const plan = await findOwnedPlan(req.params.id, req.user.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const [items] = await pool.query(
      'SELECT * FROM plan_items WHERE plan_id = ? ORDER BY id',
      [plan.id]
    );
    res.json({ plan: { ...plan, items } });
  } catch (err) {
    next(err);
  }
}

// POST /api/plans  -> create a plan, optionally with starting items
export async function createPlan(req, res, next) {
  const conn = await pool.getConnection();
  try {
    const { title, park, visit_date, bound_film, notes, items } = req.body;

    await conn.beginTransaction();

    const [result] = await conn.query(
      'INSERT INTO plans (user_id, title, park, visit_date, bound_film, notes) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, title, park, visit_date, bound_film || null, notes || null]
    );
    const planId = result.insertId;

    if (Array.isArray(items) && items.length > 0) {
      for (const it of items) {
        await conn.query(
          'INSERT INTO plan_items (plan_id, event_title, event_time, event_type, location) VALUES (?, ?, ?, ?, ?)',
          [planId, it.event_title, it.event_time || null, it.event_type || null, it.location || null]
        );
      }
    }

    await conn.commit();
    res.status(201).json({ id: planId });
  } catch (err) {
    await conn.rollback();
    next(err);
  } finally {
    conn.release();
  }
}

// PUT /api/plans/:id  -> update a plan's editable fields
export async function updatePlan(req, res, next) {
  try {
    const plan = await findOwnedPlan(req.params.id, req.user.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const { title, bound_film, notes, visit_date } = req.body;
    await pool.query(
      'UPDATE plans SET title = ?, bound_film = ?, notes = ?, visit_date = ? WHERE id = ?',
      [
        title ?? plan.title,
        bound_film ?? plan.bound_film,
        notes ?? plan.notes,
        visit_date ?? plan.visit_date,
        plan.id
      ]
    );
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/plans/:id  -> delete a plan (items cascade away)
export async function deletePlan(req, res, next) {
  try {
    const plan = await findOwnedPlan(req.params.id, req.user.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    await pool.query('DELETE FROM plans WHERE id = ?', [plan.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}

// POST /api/plans/:id/items  -> add one show to a plan
export async function addItem(req, res, next) {
  try {
    const plan = await findOwnedPlan(req.params.id, req.user.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    const { event_title, event_time, event_type, location } = req.body;
    const [result] = await pool.query(
      'INSERT INTO plan_items (plan_id, event_title, event_time, event_type, location) VALUES (?, ?, ?, ?, ?)',
      [plan.id, event_title, event_time || null, event_type || null, location || null]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    next(err);
  }
}

// DELETE /api/plans/:id/items/:itemId  -> remove one show from a plan
export async function deleteItem(req, res, next) {
  try {
    const plan = await findOwnedPlan(req.params.id, req.user.id);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });

    await pool.query('DELETE FROM plan_items WHERE id = ? AND plan_id = ?', [
      req.params.itemId,
      plan.id
    ]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
}
