"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const backend_modules_dataloader_1 = __importDefault(require("@orbiting/backend-modules-dataloader"));
exports.default = module.exports = function (context) {
    const calendarSlots = context.pgdb.public.calendarSlots;
    const cache = context.scope === 'request';
    return {
        byKeyObj: (0, backend_modules_dataloader_1.default)(async (keyObjs) => calendarSlots.find({
            or: keyObjs.map((keyObj) => ({
                and: keyObj,
            })),
        }, {
            // return latest row per user per per key
            fields: ['DISTINCT ON ("key", "userId") *'],
            orderBy: { key: 'asc', userId: 'asc', createdAt: 'desc' },
        }), { cache, many: true }),
    };
};
