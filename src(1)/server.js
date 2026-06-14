"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("./lib/error-capture");
var error_capture_1 = require("./lib/error-capture");
var error_page_1 = require("./lib/error-page");
var serverEntryPromise;
function getServerEntry() {
    return __awaiter(this, void 0, Promise, function () {
        return __generator(this, function (_a) {
            if (!serverEntryPromise) {
                serverEntryPromise = Promise.resolve().then(function () { return require("@tanstack/react-start/server-entry"); }).then(function (m) { var _a; return ((_a = m.default) !== null && _a !== void 0 ? _a : m); });
            }
            return [2 /*return*/, serverEntryPromise];
        });
    });
}
// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
function normalizeCatastrophicSsrResponse(response) {
    var _a, _b;
    return __awaiter(this, void 0, Promise, function () {
        var contentType, body;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    if (response.status < 500)
                        return [2 /*return*/, response];
                    contentType = (_a = response.headers.get("content-type")) !== null && _a !== void 0 ? _a : "";
                    if (!contentType.includes("application/json"))
                        return [2 /*return*/, response];
                    return [4 /*yield*/, response.clone().text()];
                case 1:
                    body = _c.sent();
                    if (!body.includes('"unhandled":true') || !body.includes('"message":"HTTPError"')) {
                        return [2 /*return*/, response];
                    }
                    console.error((_b = (0, error_capture_1.consumeLastCapturedError)()) !== null && _b !== void 0 ? _b : new Error("h3 swallowed SSR error: ".concat(body)));
                    return [2 /*return*/, new Response((0, error_page_1.renderErrorPage)(), {
                            status: 500,
                            headers: { "content-type": "text/html; charset=utf-8" },
                        })];
            }
        });
    });
}
exports.default = {
    fetch: function (request, env, ctx) {
        return __awaiter(this, void 0, void 0, function () {
            var handler, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("DATABASE_URL exists?", !!process.env.DATABASE_URL);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, getServerEntry()];
                    case 2:
                        handler = _a.sent();
                        return [4 /*yield*/, handler.fetch(request, env, ctx)];
                    case 3:
                        response = _a.sent();
                        return [4 /*yield*/, normalizeCatastrophicSsrResponse(response)];
                    case 4: return [2 /*return*/, _a.sent()];
                    case 5:
                        error_1 = _a.sent();
                        console.error(error_1);
                        return [2 /*return*/, new Response((0, error_page_1.renderErrorPage)(), {
                                status: 500,
                                headers: { "content-type": "text/html; charset=utf-8" },
                            })];
                    case 6: return [2 /*return*/];
                }
            });
        });
    },
};
