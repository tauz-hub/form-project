import { NextResponse } from 'next/server';
import { appendToSheet } from '@/utils/googleSheets';

const range = 'Respostas Entrevistadores I!A1:ZZ10000';

const spreadsheetId =
  process.env.GOOGLE_SHEET_ID || '1sPc2Qs5nMxwqjQfqzSefrwUGKsl2tZ4UxtxbIvooPnI';

export async function POST(request: Request) {
  const body = await request.json();
  console.log(body);

  await appendToSheet(spreadsheetId, range, [Object.values(body)]);
  return NextResponse.json({ message: 'Formulário enviado!' });
}
