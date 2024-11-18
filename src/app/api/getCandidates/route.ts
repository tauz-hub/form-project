import { NextResponse } from 'next/server';
import { getSheetDataAndQuestions } from '@/utils/googleSheets';

const spreadsheetId =
  process.env.GOOGLE_SHEET_ID || '1sPc2Qs5nMxwqjQfqzSefrwUGKsl2tZ4UxtxbIvooPnI';
const range = 'Questoes I!A1:ZZ10000';

export async function GET() {
  try {
    const { questions, data } = await getSheetDataAndQuestions(
      spreadsheetId,
      range
    );
    return NextResponse.json({ questions, data });
  } catch (error) {
    console.error('Erro ao buscar dados e perguntas:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados' },
      { status: 500 }
    );
  }
}
