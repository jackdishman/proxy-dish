import { getUserByName } from '@/middleware/farcaster';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const name = searchParams.get('name');
    if (!name) {
        return new Response('Name is required', { status: 400 });
    }

    const response = await getUserByName(name);
    
    if (!response) {
        return new Response('User not found', { status: 404 });
    }

    return NextResponse.json(response);
}