import { SystemSetting } from '../models/index.js';
export async function maintenanceGuard(req, res, next) {
    try {
        const setting = await SystemSetting.findOne({ key: 'maintenanceMode' }).lean();
        const enabled = setting?.value === true || String(setting?.value).toLowerCase() === 'true';
        if (!enabled)
            return next();
        if (req.user?.role === 'ADMIN')
            return next();
        return res.status(503).json({ message: 'The platform is temporarily under maintenance. Please try again later.' });
    }
    catch (error) {
        return next(error);
    }
}
