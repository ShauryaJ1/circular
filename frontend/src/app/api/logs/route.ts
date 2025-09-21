import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    const logs = await prisma.log.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: 50 // Limit to 50 most recent logs
    })

    // Transform the data to match the frontend interface
    const transformedLogs = logs.map(log => ({
      id: log.id,
      message: log.issueText || 'No message available',
      timestamp: new Date(log.timestamp || log.createdAt), // Ensure valid Date object
      tags: Array.isArray(log.tags) ? log.tags : [], // Match updated string[] type
      solution: log.solutionText ? {
        id: log.id + '_solution',
        issueText: log.issueText || 'No issue description',
        solutionText: log.solutionText,
        createdAt: new Date(log.createdAt), // Ensure valid Date object
        tags: Array.isArray(log.tags) ? log.tags : []
      } : null
    }))

    return NextResponse.json(transformedLogs)
  } catch (error) {
    console.error('Failed to fetch logs:', error)
    
    // Check if it's a database connection error
    if (error.message?.includes('connect') || error.message?.includes('ECONNREFUSED')) {
      return NextResponse.json({ 
        error: 'Database not available. Please set up Supabase locally or configure DATABASE_URL.',
        logs: [] 
      }, { status: 200 }) // Return 200 with empty data instead of 500
    }
    
    return NextResponse.json({ error: 'Failed to fetch logs', logs: [] }, { status: 200 })
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json()
    const { issueText, solutionText, tags } = data

    if (!issueText) {
      return NextResponse.json({ error: 'Issue text is required' }, { status: 400 })
    }

    const newLog = await prisma.log.create({
      data: {
        issueText,
        solutionText: solutionText || null,
        tags: tags || [],
        timestamp: new Date(),
        metadata: {
          source: 'frontend-api',
          createdAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json(newLog, { status: 201 })
  } catch (error) {
    console.error('Failed to create log:', error)
    return NextResponse.json({ error: 'Failed to create log' }, { status: 500 })
  }
}
