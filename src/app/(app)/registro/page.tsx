import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function RegisterMatchPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Registrar partido</h1>
        <p className="text-sm text-muted-foreground">
          Completa el resultado y envía el link a las cuatro personas para confirmar.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Resultado</CardTitle>
          <CardDescription>Indica formato y sets disputados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="turn-link">Turno vinculado</Label>
            <Input id="turn-link" placeholder="padelapp.app/t/abc123" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="team-a">Equipo A</Label>
              <Input id="team-a" placeholder="Ej: Juan & Lucas" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="team-b">Equipo B</Label>
              <Input id="team-b" placeholder="Ej: María & Sofía" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="format">Formato</Label>
            <select id="format" className="h-10 rounded-full border border-input bg-background px-4 text-sm">
              <option>Mejor de 3 sets</option>
              <option>Mejor de 2 sets</option>
              <option>Set a 9 games</option>
              <option>Tiempo límite</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="score">Resultado</Label>
            <Input id="score" placeholder="6-4, 3-6, [10-7]" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas para tus rivales</Label>
            <Textarea
              id="notes"
              placeholder="Gracias por el partido. Confirmen cuando reciban la notificación."
            />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full rounded-full" size="lg">
        Generar link de confirmación
      </Button>
    </div>
  );
}
