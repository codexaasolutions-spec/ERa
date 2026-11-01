export const validate = (schema) => (req, res, next) => { const r = schema.safeParse(req.body); if (!r.success)
    return res.status(400).json({ message: 'Validation failed', errors: r.error.flatten() }); req.body = r.data; next(); };
