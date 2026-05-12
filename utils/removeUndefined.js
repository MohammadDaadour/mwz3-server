"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeUndefinedFields = removeUndefinedFields;
function removeUndefinedFields(dto) {
    return Object.fromEntries(Object.entries(dto).filter(([_, value]) => value !== undefined));
}
//# sourceMappingURL=removeUndefined.js.map