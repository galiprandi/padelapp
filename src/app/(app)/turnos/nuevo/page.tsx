import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { levelOptions } from "@/lib/mock-data";

export default function NewTurnPage() {
  return (
    <div className="flex flex-col gap-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold">Nuevo turno abierto</h1>
        <p className="text-sm text-muted-foreground">
          Configura cancha, nivel y cupos. Al guardar tendrás un link listo para compartir.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Detalles principales</CardTitle>
          <CardDescription>Información visible para quienes reciban el link.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="club" requiredIndicator="*">
              Club y cancha
            </Label>
            <Input id="club" placeholder="Padel City · Cancha 3" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Fecha</Label>
              <Input id="date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="time">Hora</Label>
              <Input id="time" type="time" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="duration">Duración</Label>
              <select id="duration" className="h-10 rounded-full border border-input bg-background px-4 text-sm">
                <option>60 minutos</option>
                <option>90 minutos</option>
                <option>120 minutos</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="players">Jugadores</Label>
              <select id="players" className="h-10 rounded-full border border-input bg-background px-4 text-sm">
                <option>4 jugadores</option>
                <option>6 jugadores</option>
                <option>8 jugadores</option>
                <option>10 jugadores</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="level">Nivel sugerido</Label>
            <select id="level" className="h-10 rounded-full border border-input bg-background px-4 text-sm">
              {levelOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notas opcionales</Label>
            <Textarea id="notes" placeholder="Traer pelotas nuevas. Punto de encuentro en recepción." />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full rounded-full" size="lg">
        Generar link compartible
      </Button>
    </div>
  );
}
