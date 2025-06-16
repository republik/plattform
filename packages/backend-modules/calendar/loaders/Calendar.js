"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const backend_modules_dataloader_1 = __importDefault(require("@orbiting/backend-modules-dataloader"));
exports.default = module.exports = function (context) {
    const calendars = context.pgdb.public.calendars;
    const cache = context.scope === 'request';
    return {
        bySlug: (0, backend_modules_dataloader_1.default)((slugs) => calendars.find({ slug: slugs }), { cache }, (key, rows) => rows.find((row) => row.slug === key)),
    };
};
