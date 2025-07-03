import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
const prisma = new PrismaClient()

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const id = Number(params.id)
  await prisma.appointment.update({ where: { id }, data: { status: "confirmed" } })
  return NextResponse.json({ ok: true })
}