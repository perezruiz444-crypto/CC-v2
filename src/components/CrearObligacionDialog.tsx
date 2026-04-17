import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface CrearObligacionDialogProps {
  isOpen: boolean
  onClose: () => void
  onCreated: () => Promise<void>
  empresaId: string
}

const PERIODICIDADES = [
  { value: 'mensual', label: 'Mensual' },
  { value: 'bimestral', label: 'Bimestral' },
  { value: 'trimestral', label: 'Trimestral' },
  { value: 'anual', label: 'Anual' },
]

export function CrearObligacionDialog({
  isOpen,
  onClose,
  onCreated,
  empresaId,
}: CrearObligacionDialogProps) {
  const [nombre, setNombre] = useState('')
  const [periodicidad, setPeriodicidad] = useState('mensual')
  const [descripcion, setDescripcion] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleCrear = async () => {
    setError(null)

    if (!nombre.trim()) {
      setError('El nombre de la obligación es requerido')
      return
    }

    if (nombre.trim().length < 3) {
      setError('El nombre debe tener al menos 3 caracteres')
      return
    }

    setLoading(true)
    try {
      // Llamar hook para crear la obligación
      // (El hook se implementará en useObligaciones.ts)
      const response = await fetch('/api/obligaciones/crear', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: nombre.trim(),
          periodicidad,
          descripcion: descripcion.trim() || null,
          empresaId,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al crear obligación')
      }

      // Llamar callback
      await onCreated()

      // Resetear form
      setNombre('')
      setPeriodicidad('mensual')
      setDescripcion('')
      onClose()
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setNombre('')
      setPeriodicidad('mensual')
      setDescripcion('')
      setError(null)
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Crear Obligación Interna</DialogTitle>
          <DialogDescription>
            Crea una obligación personalizada para esta empresa. Se generarán automáticamente los vencimientos.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="nombre">Nombre de la obligación *</Label>
            <Input
              id="nombre"
              placeholder="Ej. Reporte de Inventario, Auditoría Interna"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              disabled={loading}
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="periodicidad">Periodicidad *</Label>
            <Select value={periodicidad} onValueChange={setPeriodicidad} disabled={loading}>
              <SelectTrigger id="periodicidad">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PERIODICIDADES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              placeholder="Notas, requisitos, o detalles adicionales..."
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              disabled={loading}
              rows={4}
            />
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleCrear}
            loading={loading}
            disabled={loading || !nombre.trim()}
          >
            Crear Obligación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
