/**
 * HRIS PPSDMPU — Google Apps Script Web App
 *
 * Endpoint:
 *   GET ?resource=all       → { employees: RemoteEmployeeRow[], leave: RemoteLeaveYearRow[] }
 *   GET ?resource=employees  → RemoteEmployeeRow[]   (backward-compat)
 *   GET ?resource=leave      → RemoteLeaveYearRow[]  (backward-compat)
 *
 * Deploy sebagai Web App:
 *   - Execute as: Me
 *   - Who has access: Anyone
 *
 * Lihat docs/google-apps-script.md untuk panduan deploy lengkap.
 *
 * DATA MINIMIZATION (keamanan):
 * Script ini HANYA mengembalikan field yang dibutuhkan oleh type Employee,
 * LeaveRecord, dan LeaveYearValue di aplikasi frontend. Seluruh kolom
 * spreadsheet lain tidak dikirim ke client.
 *
 * CATATAN KOLOM (0-indexed, berdasarkan baris ke-6 sheet DUK):
 *   0=NO | 1=PEGAWAI | 2=NIP | 3=TMT Gol | 4=GOL | 5=Pendidikan(angkat)
 *   6=TMT Angkat | 7=TMT Jabatan | 8=JABATAN | 9=KLS JABATAN | 10=ESELON
 *   11=STATUS | 12=SATKER | 13=BIDANG/BAGIAN | 14=SUB BAGIAN
 *   15=NO.ABSENSI | 16=JK | 17=TEMPAT LAHIR | 18=TTL | 19=AGAMA
 *   20=Depan(gelar) | 21=Belakang | 22=Tingkat(pendidikan) | 23=Thn Lulus
 *   24=Institusi | 25=Jurusan | 26=ALAMAT | 27=EMAIL PRIBADI | 28=EMAIL DINAS
 *   29=ID BKN | 30=KERPEG | 31,32=(kosong) | 33=NIK | 34=NO HP
 *   35=NAMA REK | 36=NO REK | 37=BANK | 38=NPWP | 39-44=(kosong)
 *   45-47=N-2/N-1/N 2024 | 48-50=2025 | 51-53=2026 | 54-56=2027
 *   57-59=2028 | 60-62=2029 | 63-65=2030 | 66-68=2031 | 69-71=2032 | 72-74=2033
 */

// === Konfigurasi ===

var SPREADSHEET_ID = '1Xjan2kKN0gpOXAb_cALqT6Eb1frv79NfS7LBh1WIk7o';
var SHEET_NAME = 'DUK';

/**
 * Baris data pertama (1-indexed). Sheet DUK memiliki 7 baris header:
 *   Baris 1-5 = sub-header dan label grup kolom
 *   Baris 6   = header kolom utama (NO, PEGAWAI, NIP, ...)
 *   Baris 7   = nomor kolom (1, 2, 3, ...)
 *   Baris 8+  = data pegawai
 */
var DATA_START_ROW = 8;

/** Tahun-tahun yang dibaca untuk nilai cuti (sesuai blok kolom di DUK). */
var LEAVE_YEARS = [2024, 2025, 2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033];

/** Indeks kolom 0-based untuk N-2 tahun pertama (2024). */
var LEAVE_COL_START = 45;

/**
 * Kolom terakhir (1-indexed) yang dibutuhkan employees: kolom 39 (NPWP, 0-based=38).
 * Tidak perlu baca kolom 40–75+ untuk endpoint employees.
 */
var EMPLOYEES_LAST_COL = 39;

/**
 * Kolom terakhir (1-indexed) yang dibutuhkan leave: kolom 75 (0-based=74,
 * yaitu N tahun 2033 = LEAVE_COL_START + 9*3 + 2 = 45+29 = 74, 1-indexed=75).
 */
var LEAVE_LAST_COL = 75;

// === Entry Point ===

function doGet(e) {
  var resource = e && e.parameter && e.parameter.resource;

  try {
    var data;
    if (resource === 'all') {
      data = getAllData_();
    } else if (resource === 'employees') {
      data = getEmployees_();
    } else if (resource === 'leave') {
      data = getLeaveRecords_();
    } else {
      return errorResponse_('Parameter ?resource= tidak valid. Gunakan "all", "employees", atau "leave".');
    }
    return jsonResponse_(data);
  } catch (err) {
    return errorResponse_('Gagal memproses permintaan: ' + err.message);
  }
}

// === All Resource (baca spreadsheet 1x, return keduanya) ===

/**
 * Baca spreadsheet SEKALI hingga kolom LEAVE_LAST_COL, proses employees dan
 * leave dari data yang sama. Ini yang dipakai oleh remoteDataSource.ts untuk
 * menghindari 2 round-trip HTTP ke GAS.
 */
function getAllData_() {
  var rows = getDataRowsUpTo_(LEAVE_LAST_COL);
  return {
    employees: buildEmployees_(rows),
    leave: buildLeaveRecords_(rows)
  };
}

// === Employee Resource ===

function getEmployees_() {
  var rows = getDataRowsUpTo_(EMPLOYEES_LAST_COL);
  return buildEmployees_(rows);
}

function buildEmployees_(rows) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];

    var nip = toString_(r[2]);
    if (!nip) continue;

    var nama = toString_(r[1]);
    if (!nama) continue;

    result.push({
      // Identitas utama
      nama:    nama,
      nip:     nip,

      // Kepegawaian
      tmtGolongan:            toDateString_(r[3]),
      golongan:               toString_(r[4]),
      pendidikanPengangkatan: toString_(r[5]),
      tmtPengangkatan:        toDateString_(r[6]),
      tmtJabatan:             toDateString_(r[7]),
      jabatan:                toString_(r[8]),
      kelasJabatan:           toString_(r[9]),
      eselon:                 toString_(r[10]),
      status:                 toString_(r[11]),
      satker:                 toString_(r[12]),
      bidangBagian:           toString_(r[13]),
      subBagian:              toString_(r[14]),
      nomorAbsensi:           toString_(r[15]),

      // Data Pribadi
      jenisKelamin:           toJK_(r[16]),
      tempatLahir:            toString_(r[17]),
      tanggalLahir:           toISODate_(r[18]),
      agama:                  toString_(r[19]),
      gelarDepan:             toString_(r[20]),
      gelarBelakang:          toString_(r[21]),

      // Pendidikan
      tingkatPendidikan:      toString_(r[22]),
      tahunLulus:             toString_(r[23]),
      institusiPendidikan:    toString_(r[24]),
      jurusan:                toString_(r[25]),

      // Kontak & Administrasi
      alamat:                 toString_(r[26]),
      emailPribadi:           toString_(r[27]),
      emailDinas:             toString_(r[28]),
      idBkn:                  toString_(r[29]),
      kerpeg:                 toString_(r[30]),
      // r[31] dan r[32] = kosong, dilewati
      nik:                    toString_(r[33]),
      noHp:                   toString_(r[34]),
      namaRekening:           toString_(r[35]),
      noRekening:             toString_(r[36]),
      bank:                   toString_(r[37]),
      npwp:                   toString_(r[38])

      // statusAktif tidak ada di spreadsheet.
      // Client remoteDataSource.ts akan men-default-kannya true.
    });
  }

  return result;
}

// === Leave Resource ===

function getLeaveRecords_() {
  var rows = getDataRowsUpTo_(LEAVE_LAST_COL);
  return buildLeaveRecords_(rows);
}

function buildLeaveRecords_(rows) {
  var result = [];

  for (var i = 0; i < rows.length; i++) {
    var r = rows[i];

    var nip = toString_(r[2]);
    if (!nip) continue;

    var nama = toString_(r[1]);
    if (!nama) continue;

    var unitKerja = toString_(r[13]);

    for (var t = 0; t < LEAVE_YEARS.length; t++) {
      var tahun   = LEAVE_YEARS[t];
      var baseCol = LEAVE_COL_START + (t * 3);

      // Pastikan kolom ada (rows pendek tidak akan punya indeks ini)
      var nMinus2 = r.length > baseCol     ? toNumber_(r[baseCol])     : undefined;
      var nMinus1 = r.length > baseCol + 1 ? toNumber_(r[baseCol + 1]) : undefined;
      var n       = r.length > baseCol + 2 ? toNumber_(r[baseCol + 2]) : undefined;

      // Lewati tahun yang seluruh nilainya kosong
      if (nMinus2 === undefined && nMinus1 === undefined && n === undefined) {
        continue;
      }

      result.push({
        nip:      nip,
        nama:     nama,
        unitKerja: unitKerja,
        tahun:    tahun,
        nMinus2:  nMinus2,
        nMinus1:  nMinus1,
        n:        n
      });
    }
  }

  return result;
}

// === Helper: Sheet Access ===

/**
 * Baca data dari baris DATA_START_ROW hingga lastRow, dengan jumlah kolom
 * dibatasi hingga lastCol (1-indexed). Ini menghindari pembacaan seluruh
 * kolom spreadsheet yang tidak diperlukan.
 *
 * @param {number} lastCol - Kolom terakhir yang perlu dibaca (1-indexed).
 */
function getDataRowsUpTo_(lastCol) {
  var ss    = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    throw new Error('Sheet "' + SHEET_NAME + '" tidak ditemukan di spreadsheet.');
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < DATA_START_ROW) {
    return [];
  }

  var numRows = lastRow - DATA_START_ROW + 1;
  // Batasi kolom: tidak lebih dari lastCol dan tidak lebih dari kolom yang ada
  var actualLastCol = Math.min(lastCol, sheet.getLastColumn());
  var numCols = actualLastCol;

  return sheet.getRange(DATA_START_ROW, 1, numRows, numCols).getValues();
}

// === Helper: Konversi Nilai ===

function toString_(value) {
  if (value === null || value === undefined || value === '') return undefined;
  var s = String(value).trim();
  return s === '' ? undefined : s;
}

function toNumber_(value) {
  if (value === null || value === undefined || value === '') return undefined;
  var n = Number(value);
  return isNaN(n) ? undefined : n;
}

function toJK_(value) {
  var s = toString_(value);
  if (s === 'L' || s === 'P') return s;
  return undefined;
}

/**
 * Mengkonversi tanggal ke format ISO YYYY-MM-DD.
 * Menangani:
 * - Date object (dari Apps Script saat kolom berformat Date di Sheets)
 * - String "DD/MM/YYYY" (saat kolom diformat sebagai teks)
 */
function toISODate_(value) {
  if (value === null || value === undefined || value === '') return undefined;

  if (value instanceof Date) {
    if (isNaN(value.getTime())) return undefined;
    var y = value.getFullYear();
    var m = String(value.getMonth() + 1).padStart(2, '0');
    var d = String(value.getDate()).padStart(2, '0');
    return y + '-' + m + '-' + d;
  }

  var s = String(value).trim();
  if (!s) return undefined;

  var parts = s.split('/');
  if (parts.length === 3) {
    var day   = parts[0].padStart(2, '0');
    var month = parts[1].padStart(2, '0');
    var year  = parts[2];
    if (year && month && day) {
      return year + '-' + month + '-' + day;
    }
  }

  return undefined;
}

function toDateString_(value) {
  return toISODate_(value);
}

// === Helper: HTTP Response ===

function jsonResponse_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

function errorResponse_(message) {
  var payload = { error: true, message: message };
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
