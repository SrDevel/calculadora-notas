'use client';

import { useState } from 'react';
import { Calculator, GraduationCap, Percent, Target } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

// Actualizar la interfaz Grade
interface Grade {
  value: number | string;
  weight: number | string;
}

export default function Home() {
  const [gradingSystem, setGradingSystem] = useState('0-5');
  const [grades, setGrades] = useState<Grade[]>([{ value: '', weight: '' }]);
  const [targetGrade, setTargetGrade] = useState(3);
  const [isOpen, setIsOpen] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const systems = {
    '0-5': { min: 0, max: 5, passing: 3 },
    '0-10': { min: 0, max: 10, passing: 6 },
    '0-100': { min: 0, max: 100, passing: 60 },
  };

  const calculateAverage = () => {
    const totalWeight = grades.reduce((sum, grade) => sum + Number(grade.weight), 0);
    const weightedSum = grades.reduce(
      (sum, grade) => sum + Number(grade.value) * (Number(grade.weight) / 100),
      0
    );
    return totalWeight === 0 ? 0 : weightedSum;
  };

  const calculateNeededGrade = () => {
    const currentTotal = grades.reduce(
      (sum, grade) => sum + Number(grade.value) * (Number(grade.weight) / 100),
      0
    );
    const remainingWeight =
      100 - grades.reduce((sum, grade) => sum + Number(grade.weight), 0);

    if (remainingWeight <= 0) return null;

    const system = systems[gradingSystem as keyof typeof systems];
    const needed =
      ((targetGrade - currentTotal) * 100) / remainingWeight;

    return Math.min(Math.max(needed, system.min), system.max);
  };

  // Actualizar la función addGrade
  const addGrade = () => {
    if (grades.length >= 10) {
      toast.error('Máximo 10 notas permitidas');
      return;
    }
    setGrades([...grades, { value: '', weight: '' }]);
  };

  // Modificar updateGrade para manejar valores vacíos
  const updateGrade = (index: number, field: keyof Grade, value: string | number) => {
    const newGrades = [...grades];
    const system = systems[gradingSystem as keyof typeof systems];

    if (typeof value === 'string') {
      // Permitir valor vacío
      if (value === '') {
        newGrades[index] = {
          ...newGrades[index],
          [field]: ''
        };
        setGrades(newGrades);
        return;
      }

      // Reemplazar coma con punto y limpiar entrada
      const cleanValue = value.replace(',', '.');

      // Validar formato numérico (permitir puntos)
      if (!/^\d*\.?\d*$/.test(cleanValue)) {
        return;
      }

      const numberValue = Number(cleanValue);

      // Validar número
      if (isNaN(numberValue)) {
        return;
      }

      // Aplicar validaciones
      if (field === 'value') {
        if (numberValue < system.min || numberValue > system.max) {
          toast.error(`La nota debe estar entre ${system.min} y ${system.max}`);
          return;
        }
      }

      if (field === 'weight') {
        if (numberValue < 0 || numberValue > 100) {
          toast.error('El porcentaje debe estar entre 0 y 100');
          return;
        }

        const currentTotal = grades.reduce((sum, g, i) => 
          sum + (i === index ? 0 : Number(g.weight) || 0), 0);
        
        if (currentTotal + numberValue > 100) {
          toast.error('La suma de porcentajes no puede exceder 100%');
          return;
        }
      }

      newGrades[index] = {
        ...newGrades[index],
        [field]: cleanValue // Almacenar como cadena para mantener entrada decimal
      };
    }
    
    setGrades(newGrades);
  };

  const removeGrade = (index: number) => {
    setGrades(grades.filter((_, i) => i !== index));
  };

  // Función para calcular nota final
  const calculateFinalGrade = () => {
    const totalWeight = grades.reduce((sum, grade) => sum + Number(grade.weight), 0);
    if (totalWeight !== 100) return null;

    return grades.reduce((sum, grade) => {
      return sum + (Number(grade.value) * (Number(grade.weight) / 100));
    }, 0);
  }

  const getGradeStatus = () => {
    const finalGrade = calculateFinalGrade();
    if (!finalGrade) return null;
    const diff = finalGrade - targetGrade;
    return {
      finalGrade: finalGrade.toFixed(2),
      diff: Math.abs(Number(diff.toFixed(2))),
      passed: diff >= 0
    };
  }

  const calcular = () => {
    const totalNotas = grades.reduce((sum, grade) => sum + Number(grade.weight), 0);
    if (totalNotas >= 100) {
      setIsOpen(true);
    }
  };

  // Función para calcular estadísticas
  const calculateStats = () => {
    const average = calculateAverage();
    const totalWeight = grades.reduce((sum, grade) => sum + Number(grade.weight), 0);
    const highest = Math.max(...grades.map(g => Number(g.value) || 0));
    const lowest = Math.min(...grades.map(g => Number(g.value) || 0));
    const passing = systems[gradingSystem as keyof typeof systems].passing;

    return { average, totalWeight, highest, lowest, passing };
  };

  return (
    <main className="min-h-screen w-full bg-gradient-to-br from-primary/5 via-background to-secondary/10">
      {/* Efecto de luz ambiental superior */}
      <div className="absolute top-0 left-1/4 w-1/2 h-1/3 bg-primary/20 blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 py-8 relative">
        <div className="max-w-4xl mx-auto space-y-8">
          {/* Header con animación mejorada */}
          <div className="text-center space-y-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 blur-3xl" />
            <GraduationCap className="mx-auto h-16 w-16 text-primary animate-bounce" />
            <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary/80 to-accent animate-fade-in relative">
              NotaSmart
            </h1>
          </div>

          {/* Tarjeta principal con efecto glass mejorado */}
          <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] transition-all duration-300 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/20">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5" />
            <div className="relative p-6 space-y-6">
              {/* Controles superiores */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grading-system" className="text-foreground/80">Sistema de Calificación</Label>
                  <Select
                    value={gradingSystem}
                    onValueChange={(value) => {
                      setGradingSystem(value);
                      setGrades(grades.map(g => ({ ...g, value: 0 })));
                      setTargetGrade(systems[value as keyof typeof systems].passing);
                    }}
                  >
                    <SelectTrigger id="grading-system" className="bg-background/40 backdrop-blur-sm border-primary/10 focus:ring-2 focus:ring-primary/20 hover:bg-background/60 transition-colors">
                      <SelectValue placeholder="Selecciona el sistema" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-5">0 a 5</SelectItem>
                      <SelectItem value="0-10">0 a 10</SelectItem>
                      <SelectItem value="0-100">0 a 100</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="target-grade" className="text-foreground/80">Nota Objetivo</Label>
                  <Input
                    id="target-grade"
                    type="number"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(Number(e.target.value))}
                    min={systems[gradingSystem as keyof typeof systems].min}
                    max={systems[gradingSystem as keyof typeof systems].max}
                    step="0.1"
                    className="bg-background/40 backdrop-blur-sm border-primary/10 focus:ring-2 focus:ring-primary/20 hover:bg-background/60 transition-colors"
                  />
                </div>
              </div>

              {/* Lista de notas */}
              <div className="space-y-4">
                {grades.map((grade, index) => (
                  <div
                    key={index}
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-[2fr_2fr_auto] gap-4 items-end animate-in fade-in slide-in-from-left duration-300"
                  >
                    <div>
                      <Label htmlFor={`grade-${index}`} className="text-foreground/80">Nota {index + 1}</Label>
                      <Input
                        id={`grade-${index}`}
                        type="text" // Cambiado de number a text
                        inputMode="decimal"
                        value={grade.value === 0 ? '' : grade.value}
                        onChange={(e) =>
                          updateGrade(index, 'value', e.target.value)
                        }
                        min={systems[gradingSystem as keyof typeof systems].min}
                        max={systems[gradingSystem as keyof typeof systems].max}
                        step="0.1"
                        className="bg-background/40 backdrop-blur-sm border-primary/10 focus:ring-2 focus:ring-primary/20 hover:bg-background/60 transition-colors"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`weight-${index}`} className="text-foreground/80">Porcentaje (%)</Label>
                      <Input
                        id={`weight-${index}`}
                        type="text" // Cambiado de number a text
                        value={grade.weight}
                        onChange={(e) =>
                          updateGrade(index, 'weight', e.target.value)
                        }
                        placeholder="0"
                        className="bg-background/40 backdrop-blur-sm border-primary/10 focus:ring-2 focus:ring-primary/20 hover:bg-background/60 transition-colors"
                      />
                    </div>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeGrade(index)}
                      className="mb-0.5 hover:scale-105 transition-transform bg-destructive/90 hover:bg-destructive"
                    >
                      ✕
                    </Button>
                  </div>
                ))}
                <div className="space-y-4 mt-4">
                  <Button
                    onClick={addGrade}
                    disabled={grades.reduce((sum, grade) => sum + Number(grade.weight), 0) >= 100}
                    className="w-full bg-primary/80 hover:bg-primary transition-colors"
                  >
                    Agregar Nota
                    <GraduationCap className="w-4 h-4 ml-2" />
                  </Button>

                  <Button
                    onClick={() => setIsOpen(true)}
                    className="w-full bg-secondary/80 hover:bg-secondary transition-colors"
                  >
                    Calcular Resultado
                    <Calculator className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Tarjetas de estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Promedio Actual */}
            <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-xl transition-all duration-300 hover:scale-105 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <div className="flex items-center gap-4">
                  <Calculator className="h-8 w-8 text-primary animate-pulse" />
                  <div>
                    <h3 className="font-semibold text-foreground/80">Promedio Actual</h3>
                    <p className="text-2xl font-bold text-primary">
                      {calculateAverage().toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Nota Necesaria */}
            <Card className="relative overflow-hidden border border-accent/10 bg-background/60 backdrop-blur-xl transition-all duration-300 hover:scale-105 group">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-accent/5 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <div className="flex items-center gap-4">
                  <Target className="h-8 w-8 text-accent animate-pulse" />
                  <div>
                    <h3 className="font-semibold text-foreground/80">Nota Necesaria</h3>
                    <div className="flex flex-col">
                      <p className="text-lg font-bold text-accent truncate">
                        {(() => {
                          const totalWeight = grades.reduce((sum, grade) => sum + Number(grade.weight), 0);
                          if (totalWeight === 100) {
                            const status = getGradeStatus();
                            if (status) {
                              return status.passed ? (
                                <span className="text-green-500">¡Aprobado! {status.finalGrade}</span>
                              ) : (
                                <>
                                  <span className="text-accent">Necesitas {status.diff.toFixed(2)}</span>
                                  <span className="text-sm text-foreground/60 ml-1">para aprobar</span>
                                </>
                              );
                            }
                          }
                          return (
                            <>
                              <span>{calculateNeededGrade()?.toFixed(2) ?? 'N/A'}</span>
                              <span className="text-sm text-foreground/60 ml-1">nota requerida</span>
                            </>
                          );
                        })()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Peso Restante */}
            <Card className="relative overflow-hidden border border-primary/10 bg-background/60 backdrop-blur-xl transition-all duration-300 hover:scale-105 group">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 opacity-50 group-hover:opacity-100 transition-opacity" />
              <div className="relative p-6">
                <div className="flex items-center gap-4">
                  <Percent className="h-8 w-8 text-primary animate-pulse" />
                  <div>
                    <h3 className="font-semibold text-foreground/80">Porcentaje Restante</h3>
                    <p className="text-2xl font-bold text-primary">
                      {(100 - grades.reduce((sum, grade) => sum + Number(grade.weight), 0)).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Modal mejorado */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent
            aria-description='Resultados Finales'
            className="sm:max-w-[425px] bg-background/95 backdrop-blur-lg border border-primary/20">
            <DialogHeader className="space-y-2">
              <DialogTitle className="text-2xl font-bold text-primary animate-fade-in">
                Resultados Finales
              </DialogTitle>
              <DialogDescription className="text-foreground/70">
                Resumen de tu desempeño académico
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid gap-4">
                <div className="animate-slide-up-fade [animation-delay:100ms]">
                  <Card className="p-4 transition-all hover:shadow-lg hover:border-primary/30">
                    <div className="flex items-center gap-3">
                      <Target className="h-5 w-5 text-primary animate-pulse" />
                      <div>
                        <p className="text-sm font-medium text-foreground/70">Promedio Final</p>
                        <p className="text-2xl font-bold text-primary">
                          {calculateStats().average.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </Card>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="animate-slide-up-fade [animation-delay:200ms]">
                    <Card className="p-4 transition-all hover:shadow-lg hover:border-primary/30">
                      <p className="text-sm font-medium text-foreground/70">Nota más alta</p>
                      <p className="text-xl font-bold text-primary">{calculateStats().highest.toFixed(2)}</p>
                    </Card>
                  </div>
                  <div className="animate-slide-up-fade [animation-delay:300ms]">
                    <Card className="p-4 transition-all hover:shadow-lg hover:border-primary/30">
                      <p className="text-sm font-medium text-foreground/70">Nota más baja</p>
                      <p className="text-xl font-bold text-primary">{calculateStats().lowest.toFixed(2)}</p>
                    </Card>
                  </div>
                </div>

                <div className="animate-slide-up-fade [animation-delay:400ms]">
                  <Card className="p-4 transition-all hover:shadow-lg hover:border-primary/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground/70">Estado</p>
                        <p className="text-xl font-bold">
                          {calculateStats().average >= calculateStats().passing ? (
                            <span className="text-green-500">Aprobado</span>
                          ) : (
                            <span className="text-red-500">Reprobado</span>
                          )}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-foreground/70">Nota mínima</p>
                        <p className="text-xl font-bold text-primary">{calculateStats().passing}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </main>
  );
}