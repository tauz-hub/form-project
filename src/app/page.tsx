'use client';

import { downloadJSON } from '@/utils/function';
import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  Button,
  Box,
  Alert,
} from '@mui/material';

interface Question {
  id: string;
  label: string;
  type: string;
}

export default function DynamicFormWithSubmit() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [users, setUsers] = useState<[]>([]);
  const [selectedUser, setSelectedUser] = useState<string>('');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean | null>(null);
  const [canSubmit, setCanSubmit] = useState<boolean>(false);

  useEffect(() => {
    // Busca perguntas e dados da API
    fetch('/api/getCandidates')
      .then((res) => res.json())
      .then(({ questions, data }) => {
        setQuestions(questions);
        setUsers(data); // Usuários são as linhas da planilha
      })
      .catch((err) => console.error('Erro ao carregar perguntas:', err));
  }, []);

  // Atualizar respostas ao selecionar um usuário
  const handleUserSelect = (event: React.ChangeEvent<{ value: unknown }>) => {
    const userIndex = parseInt(event.target.value as string, 10);
    setSelectedUser(event.target.value as string);

    // Preencher respostas com base no usuário selecionado
    if (!isNaN(userIndex) && users[userIndex]) {
      const user = users[userIndex];
      const prefilledAnswers: Record<string, string> = {};
      questions.forEach((question, index) => {
        prefilledAnswers[question.id] = user[index] || ''; // Auto-preencher
      });
      setAnswers(prefilledAnswers);
      setStatusMessage("");
    }
  };

  const handleChange = (id: string, value: string) => {
    const updatedAnswers = { ...answers, [id]: value };
    setAnswers(updatedAnswers);

    // Verificar se todas as perguntas foram respondidas
    const allAnswered = questions.every((question) => !!updatedAnswers[question.id]);
    setCanSubmit(allAnswered);
  };
  const saveToLocalStorage = () => {
    const existingData = JSON.parse(localStorage.getItem('formResponses') || '[]');
    const newData = [...existingData, answers];
    localStorage.setItem('formResponses', JSON.stringify(newData));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    saveToLocalStorage();
    try {
      if (!canSubmit) {
        setStatusMessage('Por favor, responda todas as perguntas antes de enviar.');
        setIsSuccess(false);
        return;
      }

      setCanSubmit(false);

      // Envia os dados para a rota submiter
      const response = await fetch('/api/submitForm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answers),
      });

      if (response.ok) {
        setIsSuccess(true);
        setStatusMessage('Formulário enviado com sucesso!');
        setAnswers({}); // Limpa o formulário
        setSelectedUser(''); // Reseta o select
        setCanSubmit(false);
      } else {
        const errorData = await response.json();
        setIsSuccess(false);
        setStatusMessage(`Erro ao enviar formulário: ${errorData.error}`);
        setCanSubmit(true);
        downloadJSON(answers, 'formulario-erro.json');
      }
    } catch (error) {
      console.error('Erro ao enviar formulário:', error);
      setIsSuccess(false);
      setStatusMessage(
        'Erro ao enviar o formulário. Baixe o arquivo com as respostas.'
      );
      setCanSubmit(true);
      downloadJSON(answers, `${answers.question_1}_formulario-erro.json`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h3" align="center" gutterBottom>
        Formulário Entrevista Formare
      </Typography>
      <Typography variant="h5" align="center" gutterBottom>
        Instruções:
        <br /> Selecione o candidato logo abaixo.
        <br /> Se o candidato não responder alguma pergunta ou se ela não for aplicável, deixe a resposta com um espaço em branco.
        <br /> Confirme com o candidato se o endereço está correto.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <FormControl fullWidth>
          <InputLabel id="user-select-label">Selecione o Candidato</InputLabel>
          <Select
            label="Selecione o Candidato"
            labelId="user-select-label"
            value={selectedUser}
            onChange={(e) => handleUserSelect(e)}
          >
            <MenuItem value="">
              <em>Selecione...</em>
            </MenuItem>
            {users.map((user, index) => (
              <MenuItem key={index} value={index}>
                {user[1]}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      <form onSubmit={(e) => handleSubmit(e)}>
        {questions.map((question) => (
          <Box key={question.id} sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {question.label} *
            </Typography>
            <TextField
              required={true}
              fullWidth
              aria-label={question.label}
              value={answers[question.id] || ''}
              onChange={(e) => handleChange(question.id, e.target.value)}
            />
          </Box>
        ))}

        {statusMessage && (
          <Alert severity={isSuccess ? 'success' : 'error'} sx={{ mb: 3 }}>
            {statusMessage}
          </Alert>
        )}

        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={!canSubmit}
          fullWidth
        >
          Enviar
        </Button>
      </form>
    </Container>
  );
}
