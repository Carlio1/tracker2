// Contenido correcto para: src/app/api/recommend-goal/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { recommendGoal } from "@/ai/flows/recommend-goal";
import { z } from "zod";

const RecommendGoalInputSchema = z.object({
  prompt: z.string().min(10, { message: "La descripción debe tener al menos 10 caracteres." }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedInput = RecommendGoalInputSchema.safeParse(body);

    if (!validatedInput.success) {
      return NextResponse.json({ error: "Input inválido.", details: validatedInput.error.format() }, { status: 400 });
    }
    
    const result = await recommendGoal(validatedInput.data);
    return NextResponse.json(result);

  } catch (error) {
    console.error("Error en la API de recomendación:", error);
    return NextResponse.json({ error: "No se pudo obtener una recomendación de la IA." }, { status: 500 });
  }
}