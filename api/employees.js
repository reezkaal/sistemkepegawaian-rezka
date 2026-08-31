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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
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
/**
 * GET /api/employees
 *
 * Server-side proxy ke Google Apps Script.
 * GOOGLE_APPS_SCRIPT_URL dibaca dari environment variable server-side
 * (Vercel dashboard) - tidak pernah dikirim ke browser.
 *
 * Tidak ada URL GAS yang bocor ke response atau log production.
 */
var TIMEOUT_MS = 60000;
export default function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var gasUrl, targetUrl, controller, timeout, upstream, data, _a, err_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (req.method !== 'GET') {
                        res.status(405).json({ error: 'Method Not Allowed' });
                        return [2 /*return*/];
                    }
                    gasUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
                    if (!gasUrl) {
                        // Log server-side saja, tidak bocor ke response
                        console.error('[api/employees] GOOGLE_APPS_SCRIPT_URL belum dikonfigurasi.');
                        res.status(503).json({ error: 'Service tidak tersedia. Hubungi administrator.' });
                        return [2 /*return*/];
                    }
                    targetUrl = "".concat(gasUrl, "?resource=employees");
                    controller = new AbortController();
                    timeout = setTimeout(function () { return controller.abort(); }, TIMEOUT_MS);
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, 7, , 8]);
                    return [4 /*yield*/, fetch(targetUrl, { signal: controller.signal })];
                case 2:
                    upstream = _b.sent();
                    clearTimeout(timeout);
                    if (!upstream.ok) {
                        console.error("[api/employees] GAS mengembalikan HTTP ".concat(upstream.status, "."));
                        res.status(502).json({ error: 'Gagal mengambil data dari sumber. Coba beberapa saat lagi.' });
                        return [2 /*return*/];
                    }
                    data = void 0;
                    _b.label = 3;
                case 3:
                    _b.trys.push([3, 5, , 6]);
                    return [4 /*yield*/, upstream.json()];
                case 4:
                    data = _b.sent();
                    return [3 /*break*/, 6];
                case 5:
                    _a = _b.sent();
                    console.error('[api/employees] Response dari GAS bukan JSON valid.');
                    res.status(502).json({ error: 'Format response tidak valid dari sumber data.' });
                    return [2 /*return*/];
                case 6:
                    res.setHeader('Content-Type', 'application/json');
                    res.status(200).json(data);
                    return [3 /*break*/, 8];
                case 7:
                    err_1 = _b.sent();
                    clearTimeout(timeout);
                    if (err_1 instanceof Error && err_1.name === 'AbortError') {
                        console.error('[api/employees] Request ke GAS timeout setelah', TIMEOUT_MS, 'ms.');
                        res.status(504).json({ error: 'Sumber data tidak merespons tepat waktu. Coba lagi.' });
                    }
                    else {
                        console.error('[api/employees] Fetch error:', err_1 instanceof Error ? err_1.message : 'unknown');
                        res.status(502).json({ error: 'Gagal menghubungi sumber data.' });
                    }
                    return [3 /*break*/, 8];
                case 8: return [2 /*return*/];
            }
        });
    });
}
