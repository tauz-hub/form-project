interface Question {
  id: string;
  label: string;
  type: string;
}

export const generateQuestions = (headerRow: string[]): Question[] => {
  return headerRow.map((column, index) => ({
    id: `question_${index}`,
    label: column.trim(),
    type: 'text', // Pode ser ajustado para outro tipo, como 'number', 'textarea', etc., com base no conteúdo
  }));
};

export const downloadJSON = (
  data: Record<string, string>,
  filename: string
) => {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
