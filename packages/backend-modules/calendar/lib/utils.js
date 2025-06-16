"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringify = stringify;
exports.parse = parse;
exports.isKeyValid = isKeyValid;
exports.createEvaluateSlot = createEvaluateSlot;
const dayjs_1 = __importDefault(require("dayjs"));
const backend_modules_base64u_1 = require("@orbiting/backend-modules-base64u");
function stringify(object) {
    const { userId, calendarSlug, key } = object;
    const id = [
        userId && `userId:${userId}`,
        `calendarSlug:${calendarSlug}`,
        key && `key:${key}`,
    ]
        .filter(Boolean)
        .join('/');
    return (0, backend_modules_base64u_1.encode)(id);
}
function toObject(curr, part) {
    const [name, value] = part.split(':');
    return {
        ...curr,
        [name]: value,
    };
}
function parse(id) {
    return (0, backend_modules_base64u_1.decode)(id).split('/').reduce(toObject, { calendarSlug: '' });
}
function isKeyValid(key) {
    // YYYY-MM-DD
    if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) {
        return false;
    }
    // parseable?
    if (!(0, dayjs_1.default)(key).isValid()) {
        return false;
    }
    return true;
}
function createEvaluateSlot({ calendar, slots, users, user, }) {
    return function evaluateSlot({ date, key }) {
        const today = (0, dayjs_1.default)().startOf('day');
        const isInFuture = !today.isAfter(date);
        const isOnAllowedWeekday = calendar.limitWeekdays.includes(date.day());
        const keySlots = slots.filter((slot) => slot.key === key);
        const isSlotAvailable = keySlots.filter((slot) => slot.userId !== user.id).length <
            calendar.limitSlotsPerKey;
        const userHasBooked = !!keySlots.find((slot) => slot.userId === user.id);
        return {
            id: stringify({ userId: user.id, calendarSlug: calendar.slug, key }),
            key,
            userCanBook: isInFuture && isOnAllowedWeekday && isSlotAvailable && !userHasBooked,
            userHasBooked,
            userCanCancel: isInFuture && userHasBooked,
            users: users.filter((user) => keySlots.map((slot) => slot.userId).includes(user.id)),
        };
    };
}
