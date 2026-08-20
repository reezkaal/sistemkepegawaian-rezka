/**
 * CHECKPOINT A2 — Komponen section card untuk halaman Detail Pegawai.
 *
 * Semua data berasal dari type `Employee` yang sudah diperluas di A2.
 * Field yang undefined/kosong ditampilkan sebagai "-" sesuai aturan A2.
 * Tidak ada data yang dikarang — hanya menampilkan apa yang ada di Employee.
 */

import type { Employee } from '@/types/employee'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTanggal } from '@/lib/utils'

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Tampilkan nilai string; jika kosong/undefined tampilkan "-". */
function val(v: string | undefined | null): string {
  if (v === undefined || v === null) return '-'
  const trimmed = v.trim()
  return trimmed === '' ? '-' : trimmed
}

/** Format tanggal ISO atau tampilkan "-" jika kosong. */
function fmtDate(v: string | undefined): string {
  if (!v) return '-'
  const trimmed = v.trim()
  if (trimmed === '') return '-'
  return formatTanggal(trimmed)
}

// ─── DetailRow ────────────────────────────────────────────────────────────────

interface DetailRowProps {
  label: string
  value: string
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <div className="grid grid-cols-1 gap-1.5 py-2.5 sm:grid-cols-3 sm:items-center sm:gap-4">
      <dt className="text-sm font-medium text-muted-foreground">{label}</dt>
      {/* Field read-only: latar slate ringan + border, agar batas nilai
          jelas terlihat sebagai field (bukan teks polos) — brief § 7. */}
      <dd className="rounded-md border border-border/70 bg-muted/50 px-3 py-2 text-sm text-foreground sm:col-span-2">
        {value}
      </dd>
    </div>
  )
}

// ─── Section: Data Kepegawaian ────────────────────────────────────────────────

export function SectionDataKepegawaian({ employee }: { employee: Employee }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Kepegawaian</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          <DetailRow label="Golongan"            value={val(employee.golongan)} />
          <DetailRow label="TMT Golongan"        value={fmtDate(employee.tmtGolongan)} />
          <DetailRow label="TMT Pengangkatan"    value={fmtDate(employee.tmtPengangkatan)} />
          <DetailRow label="TMT Jabatan"         value={fmtDate(employee.tmtJabatan)} />
          <DetailRow
            label="Pend. saat Pengangkatan"
            value={val(employee.pendidikanPengangkatan)}
          />
          <DetailRow label="Kelas Jabatan"       value={val(employee.kelasJabatan)} />
          <DetailRow label="Eselon"              value={val(employee.eselon)} />
          <DetailRow label="Status Kepegawaian"  value={val(employee.statusKepegawaian)} />
          <DetailRow label="Satker"              value={val(employee.satuanKerja)} />
          <DetailRow label="Bidang/Bagian"       value={val(employee.bidangBagian)} />
          <DetailRow label="Sub Bagian"          value={val(employee.subBagian)} />
          <DetailRow label="Nomor Absensi"       value={val(employee.nomorAbsensi)} />
        </dl>
      </CardContent>
    </Card>
  )
}

// ─── Section: Data Pendidikan ─────────────────────────────────────────────────

export function SectionDataPendidikan({ employee }: { employee: Employee }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Pendidikan</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          <DetailRow label="Pendidikan Terakhir" value={val(employee.tingkatPendidikan ?? employee.pendidikanTerakhir)} />
          <DetailRow label="Tahun Lulus"         value={val(employee.tahunLulus)} />
          <DetailRow label="Institusi"           value={val(employee.institusiPendidikan)} />
          <DetailRow label="Jurusan"             value={val(employee.jurusan)} />
        </dl>
      </CardContent>
    </Card>
  )
}

// ─── Section: Data Pribadi ────────────────────────────────────────────────────

function formatJenisKelamin(jk: Employee['jenisKelamin']): string {
  if (jk === 'L') return 'Laki-laki'
  if (jk === 'P') return 'Perempuan'
  return '-'
}

export function SectionDataPribadi({ employee }: { employee: Employee }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Pribadi</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          <DetailRow label="Jenis Kelamin"  value={formatJenisKelamin(employee.jenisKelamin)} />
          <DetailRow label="Tempat Lahir"   value={val(employee.tempatLahir)} />
          <DetailRow label="Tanggal Lahir"  value={fmtDate(employee.tanggalLahir)} />
          <DetailRow label="Agama"          value={val(employee.agama)} />
          <DetailRow label="Gelar Depan"    value={val(employee.gelarDepan)} />
          <DetailRow label="Gelar Belakang" value={val(employee.gelarBelakang)} />
          <DetailRow label="NIK"            value={val(employee.nik)} />
          <DetailRow label="Alamat"         value={val(employee.alamat)} />
        </dl>
      </CardContent>
    </Card>
  )
}

// ─── Section: Data Kontak & Administratif ────────────────────────────────────

export function SectionDataKontakAdministratif({ employee }: { employee: Employee }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Kontak &amp; Administratif</CardTitle>
      </CardHeader>
      <CardContent>
        <dl className="divide-y divide-border">
          <DetailRow label="Email Pribadi"   value={val(employee.emailPribadi)} />
          <DetailRow label="Email Dinas"     value={val(employee.emailDinas)} />
          <DetailRow label="ID BKN"          value={val(employee.idBkn)} />
          <DetailRow label="KERPEG"          value={val(employee.kerpeg)} />
          <DetailRow label="No. HP"          value={val(employee.noHp)} />
          <DetailRow label="Nama Rekening"   value={val(employee.namaRekening)} />
          <DetailRow label="No. Rekening"    value={val(employee.noRekening)} />
          <DetailRow label="Bank"            value={val(employee.bank)} />
          <DetailRow label="NPWP"            value={val(employee.npwp)} />
        </dl>
      </CardContent>
    </Card>
  )
}
