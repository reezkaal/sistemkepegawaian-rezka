import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import type { LeaveTypeSummaryItem } from '@/types/dashboard'

interface LeaveTypeChartProps {
  data: LeaveTypeSummaryItem[]
}

export default function LeaveTypeChart({ data }: LeaveTypeChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rekap Cuti Berdasarkan Jenis</CardTitle>
        <CardDescription>Jumlah pegawai yang mengambil cuti per jenis (data contoh)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="jenisCuti"
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={{ stroke: 'hsl(var(--border))' }}
              />
              <YAxis
                allowDecimals={false}
                tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                width={36}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))' }}
                contentStyle={{
                  borderRadius: 8,
                  border: '1px solid hsl(var(--border))',
                  backgroundColor: 'hsl(var(--card))',
                  color: 'hsl(var(--foreground))',
                  fontSize: 12,
                }}
                labelStyle={{ color: 'hsl(var(--foreground))', fontWeight: 600 }}
                formatter={(value: number) => [`${value} pegawai`, 'Jumlah']}
              />
              <Bar
                dataKey="jumlah"
                name="Jumlah Pegawai"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function LeaveTypeChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rekap Cuti Berdasarkan Jenis</CardTitle>
        <CardDescription>Jumlah pegawai yang mengambil cuti per jenis (data contoh)</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-72 w-full animate-pulse rounded-md bg-accent" aria-hidden="true" />
      </CardContent>
    </Card>
  )
}
