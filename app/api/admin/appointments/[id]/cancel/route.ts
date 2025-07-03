import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export async function POST(req: NextRequest, context: { params: { id: string } }) {
  const id = Number(context.params.id)
  const { feedback } = await req.json()
  await prisma.appointment.update({
    where: { id },
    data: { status: "cancelled", feedback },
  });
  return NextResponse.json({ ok: true })
}