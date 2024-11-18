import { google, sheets_v4 } from 'googleapis';
import { JWT } from 'google-auth-library';

const auth = new google.auth.GoogleAuth({
  keyFile: 'E:/Desktop/form-project/src/utils/google.json',
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

export const getSheetDataAndQuestions = async (
  spreadsheetId: string,
  range: string
) => {
  const client = (await auth.getClient()) as JWT;

  const sheets = google.sheets({ version: 'v4', auth: client });

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });
  const rows = response.data.values;

  if (!rows || rows.length === 0) {
    throw new Error('A planilha está vazia ou os dados não foram encontrados.');
  }

  const headerRow = rows[0]; // Primeira linha (colunas/títulos)
  const dataRows = rows.slice(1); // Demais linhas (dados)

  // Gerar perguntas a partir das colunas
  const questions = headerRow.map((column, index) => ({
    id: `question_${index}`,
    label: column.trim(),
    type: 'text',
  }));

  return { questions, data: dataRows };
};

export const appendToSheet = async (
  spreadsheetId: string,
  range: string,
  values: any[]
) => {
  try {
    const sheets = google.sheets({ version: 'v4', auth });

    // Requisição para adicionar os dados
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: 'USER_ENTERED', // Os dados serão adicionados no formato "cru"
      requestBody: {
        values, // Array de valores a serem adicionados
      },
    });

    console.log('Dados adicionados com sucesso:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao adicionar dados à planilha:', error);
  }
};
