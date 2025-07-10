"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
// import { getRecommendedGoal } from '@/app/actions'; // <-- LÍNEA ELIMINADA
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

const GOAL_OPTIONS = [10000, 25000, 50000, 75000];

const recommendationFormSchema = z.object({
  prompt: z.string().min(10, { message: "Por favor describe tu meta en al menos 10 caracteres." }),
});

type GoalModalProps = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  currentGoal: number;
  onSetGoal: (goal: number) => void;
};

export function GoalModal({ isOpen, onOpenChange, currentGoal, onSetGoal }: GoalModalProps) {
  const [selectedGoal, setSelectedGoal] = useState<number>(currentGoal);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof recommendationFormSchema>>({
    resolver: zodResolver(recommendationFormSchema),
    defaultValues: {
      prompt: "",
    },
  });
  
  const handleSave = () => {
    onSetGoal(selectedGoal);
    onOpenChange(false);
    toast({
      title: "¡Meta Actualizada!",
      description: `Tu nueva meta de ahorro es ${selectedGoal.toLocaleString()}.`,
    });
  };

  // ===> ESTA ES LA FUNCIÓN QUE SE MODIFICÓ <===
  async function onSubmit(values: z.infer<typeof recommendationFormSchema>) {
    setIsLoading(true);
    try {
      // 1. Hacemos la llamada a nuestra nueva API usando fetch
      const response = await fetch('/api/recommend-goal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt: values.prompt }),
      });

      // 2. Manejamos el caso en que la API devuelva un error (ej. 400 o 500)
      if (!response.ok) {
        throw new Error(`Error de red: ${response.status}`);
      }

      // 3. Convertimos la respuesta exitosa a JSON
      const result = await response.json();

      // 4. Procesamos el resultado como antes
      if (result && result.recommendedGoal) {
        setSelectedGoal(result.recommendedGoal);
        toast({
          title: "¡Recomendación Lista!",
          description: `Te recomendamos una meta de ${result.recommendedGoal.toLocaleString()}.`,
        });
      } else {
        throw new Error("La respuesta de la API no tuvo el formato esperado.");
      }
    } catch (error) {
      console.error("Error en onSubmit:", error);
      toast({
        variant: "destructive",
        title: "¡Oh no! Algo salió mal.",
        description: "Hubo un problema con tu solicitud. Revisa tu conexión a internet.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        {/* ... El resto de tu JSX se queda exactamente igual ... */}
        <DialogHeader>
          <DialogTitle>Establece tu Meta de Ahorro</DialogTitle>
          <DialogDescription>
            Elige una meta predefinida u obtén una recomendación por IA.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <RadioGroup
            value={String(selectedGoal)}
            onValueChange={(value) => setSelectedGoal(Number(value))}
            className="grid grid-cols-2 gap-4"
          >
            {GOAL_OPTIONS.map((option) => (
              <div key={option}>
                <RadioGroupItem value={String(option)} id={`r${option}`} className="peer sr-only" />
                <Label
                  htmlFor={`r${option}`}
                  className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                >
                  {option.toLocaleString()}
                </Label>
              </div>
            ))}
          </RadioGroup>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                O obtén una recomendación
              </span>
            </div>
          </div>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>¿Para qué estás ahorrando?</FormLabel>
                    <FormControl>
                      <Input placeholder="Ej. Una nueva PC para gaming" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Recomendar una Meta
              </Button>
            </form>
          </Form>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleSave}>Guardar cambios</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}