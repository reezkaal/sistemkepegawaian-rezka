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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// https://vitejs.dev/config/
export default defineConfig(function (_a) {
    var mode = _a.mode;
    // loadEnv dengan prefix '' membaca SEMUA env var (termasuk tanpa VITE_).
    // Ini berjalan di Node.js saat konfigurasi, BUKAN di browser — aman.
    var env = loadEnv(mode, process.cwd(), '');
    var gasUrl = env.GOOGLE_APPS_SCRIPT_URL;
    var supabaseUrl = env.VITE_SUPABASE_URL;
    var serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;
    var supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;
    /**
     * Dev-only plugin: intercept /api/employees dan /api/leave di Vite dev
     * server menggunakan Node.js fetch() yang mengikuti redirect (302) secara
     * server-side. Browser hanya menerima JSON final — tidak pernah melihat
     * 302 atau URL script.google.com/googleusercontent.com.
     *
     * Tidak ada efek pada production build — `apply: 'serve'` membatasi
     * plugin hanya aktif saat `npm run dev`.
     *
     * Jika GOOGLE_APPS_SCRIPT_URL tidak diisi, plugin tidak aktif dan
     * frontend fallback ke VITE_DATA_SOURCE=mock seperti biasa.
     */
    var devApiPlugin = {
        name: 'dev-api-proxy',
        apply: 'serve',
        configureServer: function (server) {
            var _this = this;
            if (!gasUrl)
                return;
            var TIMEOUT_MS = 45000;
            function proxyToGas(resource) {
                return __awaiter(this, void 0, void 0, function () {
                    var controller, timeout, upstream, data, err_1, isAbort;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                controller = new AbortController();
                                timeout = setTimeout(function () { return controller.abort(); }, TIMEOUT_MS);
                                _a.label = 1;
                            case 1:
                                _a.trys.push([1, 4, , 5]);
                                return [4 /*yield*/, fetch("".concat(gasUrl, "?resource=").concat(resource), {
                                        signal: controller.signal,
                                    })];
                            case 2:
                                upstream = _a.sent();
                                clearTimeout(timeout);
                                if (!upstream.ok) {
                                    return [2 /*return*/, {
                                            status: 502,
                                            body: JSON.stringify({ error: "Upstream HTTP ".concat(upstream.status) }),
                                        }];
                                }
                                return [4 /*yield*/, upstream.json()];
                            case 3:
                                data = _a.sent();
                                return [2 /*return*/, { status: 200, body: JSON.stringify(data) }];
                            case 4:
                                err_1 = _a.sent();
                                clearTimeout(timeout);
                                isAbort = err_1 instanceof Error && err_1.name === 'AbortError';
                                return [2 /*return*/, {
                                        status: isAbort ? 504 : 502,
                                        body: JSON.stringify({ error: isAbort ? 'Upstream timeout' : 'Proxy error' }),
                                    }];
                            case 5: return [2 /*return*/];
                        }
                    });
                });
            }
            function verifyDevCaller(authHeader) {
                return __awaiter(this, void 0, void 0, function () {
                    var token, createClient, anonClient, _a, user, error, profileClient, profile;
                    var _b;
                    return __generator(this, function (_c) {
                        switch (_c.label) {
                            case 0:
                                if (!supabaseUrl || !supabaseAnonKey) {
                                    return [2 /*return*/, { ok: true, role: 'superadmin', nip: null }];
                                }
                                if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
                                    return [2 /*return*/, { ok: false, status: 401, body: JSON.stringify({ error: 'Token autentikasi tidak ditemukan.' }) }];
                                }
                                token = authHeader.slice(7).trim();
                                return [4 /*yield*/, import('@supabase/supabase-js')];
                            case 1:
                                createClient = (_c.sent()).createClient;
                                anonClient = createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: false } });
                                return [4 /*yield*/, anonClient.auth.getUser(token)];
                            case 2:
                                _a = _c.sent(), user = _a.data.user, error = _a.error;
                                if (error || !user) {
                                    return [2 /*return*/, { ok: false, status: 401, body: JSON.stringify({ error: 'Token tidak valid atau kedaluwarsa.' }) }];
                                }
                                profileClient = serviceRoleKey
                                    ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
                                    : createClient(supabaseUrl, supabaseAnonKey, { global: { headers: { Authorization: "Bearer ".concat(token) } }, auth: { persistSession: false } });
                                return [4 /*yield*/, profileClient.from('profiles').select('role, nip').eq('id', user.id).single()];
                            case 3:
                                profile = (_c.sent()).data;
                                if (!profile) {
                                    return [2 /*return*/, { ok: false, status: 403, body: JSON.stringify({ error: 'Profil pengguna tidak ditemukan.' }) }];
                                }
                                return [2 /*return*/, { ok: true, role: profile.role, nip: (_b = profile.nip) !== null && _b !== void 0 ? _b : null }];
                        }
                    });
                });
            }
            server.middlewares.use('/api/employees', function (req, res, next) {
                verifyDevCaller(req.headers.authorization)
                    .then(function (auth) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, status, body, parsed, filtered;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!auth.ok) {
                                    res.statusCode = auth.status;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(auth.body);
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, proxyToGas('employees')];
                            case 1:
                                _a = _b.sent(), status = _a.status, body = _a.body;
                                if (status === 200 && auth.role === 'user') {
                                    try {
                                        parsed = JSON.parse(body);
                                        if (Array.isArray(parsed)) {
                                            filtered = parsed.map(function (row) {
                                                return auth.nip && row.nip === auth.nip
                                                    ? row
                                                    : {
                                                        nama: '(Terbatas)',
                                                        nip: '',
                                                        golongan: row.golongan,
                                                        status: row.status,
                                                        satker: row.satker,
                                                        bidangBagian: row.bidangBagian,
                                                        jenisKelamin: row.jenisKelamin,
                                                        tanggalLahir: row.tanggalLahir,
                                                        tingkatPendidikan: row.tingkatPendidikan,
                                                    };
                                            });
                                            res.statusCode = 200;
                                            res.setHeader('Content-Type', 'application/json');
                                            res.end(JSON.stringify(filtered));
                                            return [2 /*return*/];
                                        }
                                    }
                                    catch ( /* fallback ke body asli */_c) { /* fallback ke body asli */ }
                                }
                                res.statusCode = status;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(body);
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .catch(next);
            });
            server.middlewares.use('/api/leave', function (req, res, next) {
                verifyDevCaller(req.headers.authorization)
                    .then(function (auth) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, status, body;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!auth.ok) {
                                    res.statusCode = auth.status;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(auth.body);
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, proxyToGas('leave')];
                            case 1:
                                _a = _b.sent(), status = _a.status, body = _a.body;
                                res.statusCode = status;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(body);
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .catch(next);
            });
            server.middlewares.use('/api/persuratan', function (req, res, next) {
                verifyDevCaller(req.headers.authorization)
                    .then(function (auth) { return __awaiter(_this, void 0, void 0, function () {
                    var _a, status, body;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!auth.ok) {
                                    res.statusCode = auth.status;
                                    res.setHeader('Content-Type', 'application/json');
                                    res.end(auth.body);
                                    return [2 /*return*/];
                                }
                                return [4 /*yield*/, proxyToGas('persuratan')];
                            case 1:
                                _a = _b.sent(), status = _a.status, body = _a.body;
                                res.statusCode = status;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(body);
                                return [2 /*return*/];
                        }
                    });
                }); })
                    .catch(next);
            });
            // Dev proxy untuk /api/auth/create-user
            server.middlewares.use('/api/auth/create-user', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                var chunks, chunk, e_1_1, body, authHeader, createClient, callerToken, supabaseAnon, _a, callerUser, authErr, supaAdmin, profile, callerRole, email, password, nama, nip, role, _b, newUser, createErr, status_1, err_2;
                var _c, req_1, req_1_1;
                var _d, e_1, _e, _f;
                return __generator(this, function (_g) {
                    switch (_g.label) {
                        case 0:
                            if (req.method !== 'POST') {
                                res.statusCode = 405;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Method Not Allowed' }));
                                return [2 /*return*/];
                            }
                            if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
                                res.statusCode = 503;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({
                                    error: 'SUPABASE_SERVICE_ROLE_KEY belum diisi di file .env. Buka dashboard Supabase -> Project Settings -> API, salin kunci service_role, simpan di file .env, lalu restart dev server.',
                                }));
                                return [2 /*return*/];
                            }
                            _g.label = 1;
                        case 1:
                            _g.trys.push([1, 20, , 21]);
                            chunks = [];
                            _g.label = 2;
                        case 2:
                            _g.trys.push([2, 7, 8, 13]);
                            _c = true, req_1 = __asyncValues(req);
                            _g.label = 3;
                        case 3: return [4 /*yield*/, req_1.next()];
                        case 4:
                            if (!(req_1_1 = _g.sent(), _d = req_1_1.done, !_d)) return [3 /*break*/, 6];
                            _f = req_1_1.value;
                            _c = false;
                            chunk = _f;
                            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                            _g.label = 5;
                        case 5:
                            _c = true;
                            return [3 /*break*/, 3];
                        case 6: return [3 /*break*/, 13];
                        case 7:
                            e_1_1 = _g.sent();
                            e_1 = { error: e_1_1 };
                            return [3 /*break*/, 13];
                        case 8:
                            _g.trys.push([8, , 11, 12]);
                            if (!(!_c && !_d && (_e = req_1.return))) return [3 /*break*/, 10];
                            return [4 /*yield*/, _e.call(req_1)];
                        case 9:
                            _g.sent();
                            _g.label = 10;
                        case 10: return [3 /*break*/, 12];
                        case 11:
                            if (e_1) throw e_1.error;
                            return [7 /*endfinally*/];
                        case 12: return [7 /*endfinally*/];
                        case 13:
                            body = JSON.parse(Buffer.concat(chunks).toString());
                            authHeader = req.headers.authorization;
                            if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
                                res.statusCode = 401;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Token autentikasi tidak ditemukan.' }));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, import('@supabase/supabase-js')];
                        case 14:
                            createClient = (_g.sent()).createClient;
                            callerToken = authHeader.slice(7);
                            supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
                                auth: { persistSession: false, autoRefreshToken: false },
                            });
                            return [4 /*yield*/, supabaseAnon.auth.getUser(callerToken)];
                        case 15:
                            _a = _g.sent(), callerUser = _a.data.user, authErr = _a.error;
                            if (authErr || !callerUser) {
                                res.statusCode = 401;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Token tidak valid.' }));
                                return [2 /*return*/];
                            }
                            supaAdmin = createClient(supabaseUrl, serviceRoleKey, {
                                auth: { persistSession: false, autoRefreshToken: false },
                            });
                            return [4 /*yield*/, supaAdmin.from('profiles').select('role').eq('id', callerUser.id).single()];
                        case 16:
                            profile = (_g.sent()).data;
                            callerRole = profile === null || profile === void 0 ? void 0 : profile.role;
                            if (callerRole !== 'superadmin' && callerRole !== 'admin') {
                                res.statusCode = 403;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Tidak memiliki izin.' }));
                                return [2 /*return*/];
                            }
                            email = body.email, password = body.password, nama = body.nama, nip = body.nip, role = body.role;
                            if (!email || !password || !nama || !role) {
                                res.statusCode = 400;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Field wajib tidak lengkap.' }));
                                return [2 /*return*/];
                            }
                            if (callerRole === 'admin' && role === 'superadmin') {
                                res.statusCode = 403;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Admin tidak dapat membuat Superadmin.' }));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, supaAdmin.auth.admin.createUser({
                                    email: email,
                                    password: password,
                                    email_confirm: true,
                                    user_metadata: { nama: nama, nip: nip || '', role: role },
                                })];
                        case 17:
                            _b = _g.sent(), newUser = _b.data, createErr = _b.error;
                            if (createErr) {
                                status_1 = createErr.message.includes('already') ? 409 : 400;
                                res.statusCode = status_1;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: createErr.message }));
                                return [2 /*return*/];
                            }
                            if (!newUser.user) return [3 /*break*/, 19];
                            return [4 /*yield*/, supaAdmin.from('profiles').update({ role: role, nama: nama, nip: nip || null }).eq('id', newUser.user.id)];
                        case 18:
                            _g.sent();
                            _g.label = 19;
                        case 19:
                            res.statusCode = 201;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({
                                id: newUser.user.id,
                                email: newUser.user.email,
                                nama: nama,
                                nip: nip || null,
                                role: role,
                            }));
                            return [3 /*break*/, 21];
                        case 20:
                            err_2 = _g.sent();
                            next(err_2);
                            return [3 /*break*/, 21];
                        case 21: return [2 /*return*/];
                    }
                });
            }); });
            // Dev proxy untuk /api/auth/manage-user
            server.middlewares.use('/api/auth/manage-user', function (req, res, next) { return __awaiter(_this, void 0, void 0, function () {
                var chunks, chunk, e_2_1, body, authHeader, createClient, callerToken, supabaseAnon, _a, callerUser, authErr, supaAdmin, profile, callerRole, action, userId, nama, nip, role, newPassword, targetProfile, targetRole, resetErr, delErr, err_3;
                var _b, req_2, req_2_1;
                var _c, e_2, _d, _e;
                return __generator(this, function (_f) {
                    switch (_f.label) {
                        case 0:
                            if (req.method !== 'POST') {
                                res.statusCode = 405;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Method Not Allowed' }));
                                return [2 /*return*/];
                            }
                            if (!supabaseUrl || !serviceRoleKey || !supabaseAnonKey) {
                                res.statusCode = 503;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({
                                    error: 'SUPABASE_SERVICE_ROLE_KEY belum diisi di file .env. Buka dashboard Supabase -> Project Settings -> API, salin kunci service_role, simpan di file .env, lalu restart dev server.',
                                }));
                                return [2 /*return*/];
                            }
                            _f.label = 1;
                        case 1:
                            _f.trys.push([1, 25, , 26]);
                            chunks = [];
                            _f.label = 2;
                        case 2:
                            _f.trys.push([2, 7, 8, 13]);
                            _b = true, req_2 = __asyncValues(req);
                            _f.label = 3;
                        case 3: return [4 /*yield*/, req_2.next()];
                        case 4:
                            if (!(req_2_1 = _f.sent(), _c = req_2_1.done, !_c)) return [3 /*break*/, 6];
                            _e = req_2_1.value;
                            _b = false;
                            chunk = _e;
                            chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
                            _f.label = 5;
                        case 5:
                            _b = true;
                            return [3 /*break*/, 3];
                        case 6: return [3 /*break*/, 13];
                        case 7:
                            e_2_1 = _f.sent();
                            e_2 = { error: e_2_1 };
                            return [3 /*break*/, 13];
                        case 8:
                            _f.trys.push([8, , 11, 12]);
                            if (!(!_b && !_c && (_d = req_2.return))) return [3 /*break*/, 10];
                            return [4 /*yield*/, _d.call(req_2)];
                        case 9:
                            _f.sent();
                            _f.label = 10;
                        case 10: return [3 /*break*/, 12];
                        case 11:
                            if (e_2) throw e_2.error;
                            return [7 /*endfinally*/];
                        case 12: return [7 /*endfinally*/];
                        case 13:
                            body = JSON.parse(Buffer.concat(chunks).toString());
                            authHeader = req.headers.authorization;
                            if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
                                res.statusCode = 401;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Token autentikasi tidak ditemukan.' }));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, import('@supabase/supabase-js')];
                        case 14:
                            createClient = (_f.sent()).createClient;
                            callerToken = authHeader.slice(7);
                            supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
                                auth: { persistSession: false, autoRefreshToken: false },
                            });
                            return [4 /*yield*/, supabaseAnon.auth.getUser(callerToken)];
                        case 15:
                            _a = _f.sent(), callerUser = _a.data.user, authErr = _a.error;
                            if (authErr || !callerUser) {
                                res.statusCode = 401;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Token tidak valid.' }));
                                return [2 /*return*/];
                            }
                            supaAdmin = createClient(supabaseUrl, serviceRoleKey, {
                                auth: { persistSession: false, autoRefreshToken: false },
                            });
                            return [4 /*yield*/, supaAdmin.from('profiles').select('role').eq('id', callerUser.id).single()];
                        case 16:
                            profile = (_f.sent()).data;
                            callerRole = profile === null || profile === void 0 ? void 0 : profile.role;
                            if (callerRole !== 'superadmin' && callerRole !== 'admin') {
                                res.statusCode = 403;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Tidak memiliki izin.' }));
                                return [2 /*return*/];
                            }
                            action = body.action, userId = body.userId, nama = body.nama, nip = body.nip, role = body.role, newPassword = body.newPassword;
                            if (!action || !userId) {
                                res.statusCode = 400;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Parameter tidak lengkap.' }));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, supaAdmin.from('profiles').select('role').eq('id', userId).single()];
                        case 17:
                            targetProfile = (_f.sent()).data;
                            targetRole = targetProfile === null || targetProfile === void 0 ? void 0 : targetProfile.role;
                            if (callerRole === 'admin' && targetRole === 'superadmin') {
                                res.statusCode = 403;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Admin tidak dapat mengelola Superadmin.' }));
                                return [2 /*return*/];
                            }
                            if (!(action === 'update')) return [3 /*break*/, 20];
                            if (callerRole === 'admin' && role === 'superadmin') {
                                res.statusCode = 403;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Admin tidak dapat menetapkan role Superadmin.' }));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, supaAdmin.from('profiles').update({
                                    nama: nama === null || nama === void 0 ? void 0 : nama.trim(),
                                    nip: (nip === null || nip === void 0 ? void 0 : nip.trim()) || null,
                                    role: role,
                                    updated_at: new Date().toISOString(),
                                }).eq('id', userId)];
                        case 18:
                            _f.sent();
                            return [4 /*yield*/, supaAdmin.auth.admin.updateUserById(userId, {
                                    user_metadata: { nama: nama === null || nama === void 0 ? void 0 : nama.trim(), nip: (nip === null || nip === void 0 ? void 0 : nip.trim()) || '', role: role },
                                })];
                        case 19:
                            _f.sent();
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true }));
                            return [2 /*return*/];
                        case 20:
                            if (!(action === 'reset-password')) return [3 /*break*/, 22];
                            if (!newPassword || newPassword.length < 6) {
                                res.statusCode = 400;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Password minimal 6 karakter.' }));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, supaAdmin.auth.admin.updateUserById(userId, { password: newPassword })];
                        case 21:
                            resetErr = (_f.sent()).error;
                            if (resetErr) {
                                res.statusCode = 400;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: resetErr.message }));
                                return [2 /*return*/];
                            }
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true }));
                            return [2 /*return*/];
                        case 22:
                            if (!(action === 'delete')) return [3 /*break*/, 24];
                            if (userId === callerUser.id) {
                                res.statusCode = 400;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: 'Tidak dapat menghapus akun sendiri.' }));
                                return [2 /*return*/];
                            }
                            return [4 /*yield*/, supaAdmin.auth.admin.deleteUser(userId)];
                        case 23:
                            delErr = (_f.sent()).error;
                            if (delErr) {
                                res.statusCode = 400;
                                res.setHeader('Content-Type', 'application/json');
                                res.end(JSON.stringify({ error: delErr.message }));
                                return [2 /*return*/];
                            }
                            res.statusCode = 200;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ success: true }));
                            return [2 /*return*/];
                        case 24:
                            res.statusCode = 400;
                            res.setHeader('Content-Type', 'application/json');
                            res.end(JSON.stringify({ error: 'Aksi tidak valid.' }));
                            return [3 /*break*/, 26];
                        case 25:
                            err_3 = _f.sent();
                            next(err_3);
                            return [3 /*break*/, 26];
                        case 26: return [2 /*return*/];
                    }
                });
            }); });
        },
    };
    return {
        plugins: [react(), devApiPlugin],
        resolve: {
            alias: {
                '@': path.resolve(__dirname, './src'),
            },
        },
        server: {
            port: 5173,
        },
    };
});
