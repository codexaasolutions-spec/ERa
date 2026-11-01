import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { env } from '../config/env.js';
export async function hash(p) {
    return bcrypt.hash(p, 12);
}
export async function compare(p, h) {
    return bcrypt.compare(p, h);
}
export function sign(id, role, tokenVersion = 0, options) {
    const payload = {
        id,
        role,
        tokenVersion,
        ...(options?.impersonatedBy
            ? { impersonatedBy: options.impersonatedBy }
            : {})
    };
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: options?.expiresIn || '7d'
    });
}
export function verify(t) {
    return jwt.verify(t, env.JWT_SECRET);
}
