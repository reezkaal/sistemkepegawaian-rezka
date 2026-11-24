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
import { createClient } from '@supabase/supabase-js';
export default function handler(req, res) {
    return __awaiter(this, void 0, void 0, function () {
        var supabaseUrl, serviceRoleKey, anonKey, authHeader, callerToken, supabaseAnon, _a, callerUser, authError, supabaseAdmin, _b, callerProfile, profileError, callerRole, _c, email, password, nama, nip, role, validRoles, _d, newUser, createError, updateError, err_1;
        return __generator(this, function (_e) {
            switch (_e.label) {
                case 0:
                    // Hanya terima POST
                    if (req.method !== 'POST') {
                        res.status(405).json({ error: 'Method Not Allowed' });
                        return [2 /*return*/];
                    }
                    supabaseUrl = process.env.VITE_SUPABASE_URL;
                    serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                    anonKey = process.env.VITE_SUPABASE_ANON_KEY;
                    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
                        console.error('[api/auth/create-user] Missing Supabase environment variables.');
                        res.status(503).json({ error: 'Service tidak tersedia. Konfigurasi Supabase belum lengkap.' });
                        return [2 /*return*/];
                    }
                    authHeader = req.headers.authorization;
                    if (!(authHeader === null || authHeader === void 0 ? void 0 : authHeader.startsWith('Bearer '))) {
                        res.status(401).json({ error: 'Token autentikasi tidak ditemukan.' });
                        return [2 /*return*/];
                    }
                    callerToken = authHeader.slice(7);
                    supabaseAnon = createClient(supabaseUrl, anonKey, {
                        auth: { persistSession: false, autoRefreshToken: false },
                    });
                    return [4 /*yield*/, supabaseAnon.auth.getUser(callerToken)];
                case 1:
                    _a = _e.sent(), callerUser = _a.data.user, authError = _a.error;
                    if (authError || !callerUser) {
                        res.status(401).json({ error: 'Token tidak valid atau sudah expired.' });
                        return [2 /*return*/];
                    }
                    supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
                        auth: { persistSession: false, autoRefreshToken: false },
                    });
                    return [4 /*yield*/, supabaseAdmin
                            .from('profiles')
                            .select('role')
                            .eq('id', callerUser.id)
                            .single()];
                case 2:
                    _b = _e.sent(), callerProfile = _b.data, profileError = _b.error;
                    if (profileError || !callerProfile) {
                        res.status(403).json({ error: 'Profil pengguna tidak ditemukan.' });
                        return [2 /*return*/];
                    }
                    callerRole = callerProfile.role;
                    // 3. Hanya superadmin dan admin yang boleh membuat user
                    if (callerRole !== 'superadmin' && callerRole !== 'admin') {
                        res.status(403).json({ error: 'Anda tidak memiliki izin untuk membuat pengguna.' });
                        return [2 /*return*/];
                    }
                    _c = req.body, email = _c.email, password = _c.password, nama = _c.nama, nip = _c.nip, role = _c.role;
                    if (!email || !password || !nama || !role) {
                        res.status(400).json({ error: 'Field email, password, nama, dan role wajib diisi.' });
                        return [2 /*return*/];
                    }
                    if (password.length < 6) {
                        res.status(400).json({ error: 'Password minimal 6 karakter.' });
                        return [2 /*return*/];
                    }
                    validRoles = ['superadmin', 'admin', 'user'];
                    if (!validRoles.includes(role)) {
                        res.status(400).json({ error: 'Role tidak valid. Pilih: superadmin, admin, atau user.' });
                        return [2 /*return*/];
                    }
                    // 5. Admin tidak boleh membuat superadmin
                    if (callerRole === 'admin' && role === 'superadmin') {
                        res.status(403).json({ error: 'Admin tidak dapat membuat akun Superadmin.' });
                        return [2 /*return*/];
                    }
                    _e.label = 3;
                case 3:
                    _e.trys.push([3, 6, , 7]);
                    return [4 /*yield*/, supabaseAdmin.auth.admin.createUser({
                            email: email,
                            password: password,
                            email_confirm: true,
                            user_metadata: { nama: nama, nip: nip || '', role: role },
                        })];
                case 4:
                    _d = _e.sent(), newUser = _d.data, createError = _d.error;
                    if (createError) {
                        // Handle duplicate email
                        if (createError.message.includes('already been registered') || createError.message.includes('already exists')) {
                            res.status(409).json({ error: 'Email sudah terdaftar.' });
                            return [2 /*return*/];
                        }
                        console.error('[api/auth/create-user] Create error:', createError.message);
                        res.status(400).json({ error: createError.message });
                        return [2 /*return*/];
                    }
                    if (!newUser.user) {
                        res.status(500).json({ error: 'Gagal membuat pengguna.' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabaseAdmin
                            .from('profiles')
                            .update({ role: role, nama: nama, nip: nip || null })
                            .eq('id', newUser.user.id)];
                case 5:
                    updateError = (_e.sent()).error;
                    if (updateError) {
                        console.error('[api/auth/create-user] Profile update error:', updateError.message);
                        // User sudah dibuat di auth.users, profile akan punya default dari trigger
                    }
                    res.status(201).json({
                        id: newUser.user.id,
                        email: newUser.user.email,
                        nama: nama,
                        nip: nip || null,
                        role: role,
                    });
                    return [3 /*break*/, 7];
                case 6:
                    err_1 = _e.sent();
                    console.error('[api/auth/create-user] Unexpected error:', err_1 instanceof Error ? err_1.message : 'unknown');
                    res.status(500).json({ error: 'Terjadi kesalahan internal.' });
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    });
}
