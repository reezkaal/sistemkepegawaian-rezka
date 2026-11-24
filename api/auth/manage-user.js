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
        var supabaseUrl, serviceRoleKey, anonKey, authHeader, callerToken, supabaseAnon, _a, callerUser, authError, supabaseAdmin, _b, callerProfile, callerProfileErr, callerRole, _c, action, userId, nama, nip, role, newPassword, _d, targetProfile, targetProfileErr, targetRole, _e, validRoles, updateProfileErr, resetErr, deleteErr, err_1;
        return __generator(this, function (_f) {
            switch (_f.label) {
                case 0:
                    if (req.method !== 'POST') {
                        res.status(405).json({ error: 'Method Not Allowed' });
                        return [2 /*return*/];
                    }
                    supabaseUrl = process.env.VITE_SUPABASE_URL;
                    serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
                    anonKey = process.env.VITE_SUPABASE_ANON_KEY;
                    if (!supabaseUrl || !serviceRoleKey || !anonKey) {
                        console.error('[api/auth/manage-user] Supabase environment variables not configured.');
                        res.status(503).json({ error: 'Service tidak tersedia. Konfigurasi server belum lengkap.' });
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
                    _a = _f.sent(), callerUser = _a.data.user, authError = _a.error;
                    if (authError || !callerUser) {
                        res.status(401).json({ error: 'Sesi login tidak valid atau sudah kedaluwarsa.' });
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
                    _b = _f.sent(), callerProfile = _b.data, callerProfileErr = _b.error;
                    if (callerProfileErr || !callerProfile) {
                        res.status(403).json({ error: 'Profil pemanggil tidak ditemukan.' });
                        return [2 /*return*/];
                    }
                    callerRole = callerProfile.role;
                    if (callerRole !== 'superadmin' && callerRole !== 'admin') {
                        res.status(403).json({ error: 'Anda tidak memiliki hak akses untuk aksi ini.' });
                        return [2 /*return*/];
                    }
                    _c = req.body, action = _c.action, userId = _c.userId, nama = _c.nama, nip = _c.nip, role = _c.role, newPassword = _c.newPassword;
                    if (!action || !userId) {
                        res.status(400).json({ error: 'Parameter action dan userId wajib diisi.' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabaseAdmin
                            .from('profiles')
                            .select('role, nama')
                            .eq('id', userId)
                            .single()];
                case 3:
                    _d = _f.sent(), targetProfile = _d.data, targetProfileErr = _d.error;
                    if (targetProfileErr || !targetProfile) {
                        res.status(404).json({ error: 'Pengguna target tidak ditemukan.' });
                        return [2 /*return*/];
                    }
                    targetRole = targetProfile.role;
                    // 4. Pembatasan Hak Akses: Admin tidak boleh mengubah/mereset/menghapus Superadmin
                    if (callerRole === 'admin' && targetRole === 'superadmin') {
                        res.status(403).json({ error: 'Admin tidak memiliki izin untuk mengelola akun Superadmin.' });
                        return [2 /*return*/];
                    }
                    // Admin tidak boleh menaikkan role target menjadi superadmin
                    if (callerRole === 'admin' && role === 'superadmin') {
                        res.status(403).json({ error: 'Admin tidak dapat menetapkan role Superadmin.' });
                        return [2 /*return*/];
                    }
                    _f.label = 4;
                case 4:
                    _f.trys.push([4, 14, , 15]);
                    _e = action;
                    switch (_e) {
                        case 'update': return [3 /*break*/, 5];
                        case 'reset-password': return [3 /*break*/, 8];
                        case 'delete': return [3 /*break*/, 10];
                    }
                    return [3 /*break*/, 12];
                case 5:
                    if (!nama || !role) {
                        res.status(400).json({ error: 'Nama dan role wajib diisi.' });
                        return [2 /*return*/];
                    }
                    validRoles = ['superadmin', 'admin', 'user'];
                    if (!validRoles.includes(role)) {
                        res.status(400).json({ error: 'Role tidak valid.' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabaseAdmin
                            .from('profiles')
                            .update({
                            nama: nama.trim(),
                            nip: (nip === null || nip === void 0 ? void 0 : nip.trim()) || null,
                            role: role,
                            updated_at: new Date().toISOString(),
                        })
                            .eq('id', userId)];
                case 6:
                    updateProfileErr = (_f.sent()).error;
                    if (updateProfileErr) {
                        res.status(400).json({ error: updateProfileErr.message });
                        return [2 /*return*/];
                    }
                    // Update user_metadata di auth.users agar sinkron
                    return [4 /*yield*/, supabaseAdmin.auth.admin.updateUserById(userId, {
                            user_metadata: {
                                nama: nama.trim(),
                                nip: (nip === null || nip === void 0 ? void 0 : nip.trim()) || '',
                                role: role,
                            },
                        })];
                case 7:
                    // Update user_metadata di auth.users agar sinkron
                    _f.sent();
                    res.status(200).json({ success: true, message: 'Data pengguna berhasil diperbarui.' });
                    return [2 /*return*/];
                case 8:
                    if (!newPassword || newPassword.length < 6) {
                        res.status(400).json({ error: 'Password baru minimal 6 karakter.' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabaseAdmin.auth.admin.updateUserById(userId, {
                            password: newPassword,
                        })];
                case 9:
                    resetErr = (_f.sent()).error;
                    if (resetErr) {
                        res.status(400).json({ error: resetErr.message });
                        return [2 /*return*/];
                    }
                    res.status(200).json({ success: true, message: 'Password pengguna berhasil direset.' });
                    return [2 /*return*/];
                case 10:
                    // Cegah menghapus akun sendiri
                    if (userId === callerUser.id) {
                        res.status(400).json({ error: 'Anda tidak dapat menghapus akun Anda sendiri.' });
                        return [2 /*return*/];
                    }
                    return [4 /*yield*/, supabaseAdmin.auth.admin.deleteUser(userId)];
                case 11:
                    deleteErr = (_f.sent()).error;
                    if (deleteErr) {
                        res.status(400).json({ error: deleteErr.message });
                        return [2 /*return*/];
                    }
                    res.status(200).json({ success: true, message: 'Akun pengguna berhasil dihapus.' });
                    return [2 /*return*/];
                case 12:
                    res.status(400).json({ error: 'Aksi tidak dikenali.' });
                    return [2 /*return*/];
                case 13: return [3 /*break*/, 15];
                case 14:
                    err_1 = _f.sent();
                    console.error('[api/auth/manage-user] Error:', err_1);
                    res.status(500).json({ error: 'Terjadi kesalahan sistem internal.' });
                    return [3 /*break*/, 15];
                case 15: return [2 /*return*/];
            }
        });
    });
}
