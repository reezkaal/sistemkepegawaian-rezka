import { LogOut } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface LogoutDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}

/**
 * Modal konfirmasi Logout (brief redesign § 10). Warna merah HANYA
 * dipakai pada tombol destructive ("Ya, Logout"), sesuai § 11.
 */
export default function LogoutDialog({ open, onOpenChange, onConfirm }: LogoutDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <LogOut className="h-5 w-5" aria-hidden="true" />
          </div>
          <DialogTitle>Apakah Anda yakin ingin logout?</DialogTitle>
          <DialogDescription>Anda akan keluar dari sesi saat ini.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm}>
            Ya, Logout
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
