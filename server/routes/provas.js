const express = require('express');
const router = express.Router();
const db = require('../database/config');
const authMiddleware = require('../middleware/auth');

// Middleware de autenticação para todas as rotas
router.use(authMiddleware);

// Rota para criar uma nova prova
router.post('/criar-prova', async (req, res) => {
  try {
    const { nome, gabarito } = req.body;
    const usuarioId = req.user.id;

    console.log('Recebendo requisição para criar prova:', {
      nome,
      usuarioId,
      gabarito: gabarito ? 'presente' : 'ausente'
    });

    // Validar dados obrigatórios
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome da prova é obrigatório' });
    }

    // Inserir a prova no banco de dados
    const [insertResult] = await db.query(
      'INSERT INTO provas (usuario_id, nome, gabarito, data_criacao) VALUES (?, ?, ?, NOW())',
      [usuarioId, nome.trim(), gabarito ? JSON.stringify(gabarito) : null]
    );

    const novaProva = {
      id: insertResult.insertId,
      usuario_id: usuarioId,
      nome: nome.trim(),
      gabarito: gabarito,
      data_criacao: new Date().toISOString()
    };

    console.log('Prova criada com sucesso:', novaProva);
    res.status(201).json({ 
      message: 'Prova criada com sucesso',
      prova: novaProva
    });
  } catch (error) {
    console.error('Erro ao criar prova:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota para atualizar o gabarito de uma prova
router.put('/atualizar-gabarito/:provaId', async (req, res) => {
  try {
    const { provaId } = req.params;
    const { nome, gabarito } = req.body;
    const usuarioId = req.user.id;

    console.log('Recebendo requisição para atualizar gabarito:', {
      provaId,
      usuarioId,
      nome,
      gabarito: gabarito ? 'presente' : 'ausente'
    });

    // Validar dados obrigatórios
    if (!nome || nome.trim() === '') {
      return res.status(400).json({ error: 'Nome da prova é obrigatório' });
    }

    if (!gabarito || !Array.isArray(gabarito) || gabarito.length === 0) {
      return res.status(400).json({ error: 'Gabarito é obrigatório e deve ser um array' });
    }

    // Verificar se a prova existe e pertence ao usuário
    const [provas] = await db.query(
      'SELECT id FROM provas WHERE id = ? AND usuario_id = ?',
      [provaId, usuarioId]
    );

    if (provas.length === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    // Atualizar a prova com o gabarito
    await db.query(
      'UPDATE provas SET nome = ?, gabarito = ? WHERE id = ? AND usuario_id = ?',
      [nome.trim(), JSON.stringify(gabarito), provaId, usuarioId]
    );

    console.log('Gabarito atualizado com sucesso para a prova:', provaId);
    res.json({ 
      message: 'Gabarito atualizado com sucesso',
      prova: {
        id: provaId,
        nome: nome.trim(),
        gabarito: gabarito
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar gabarito:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota para deletar uma prova
router.delete('/deletar-prova/:provaId', async (req, res) => {
  try {
    const { provaId } = req.params;
    const usuarioId = req.user.id;

    console.log('Recebendo requisição para deletar prova:', {
      provaId,
      usuarioId
    });

    // Verificar se a prova existe e pertence ao usuário
    const [provas] = await db.query(
      'SELECT id FROM provas WHERE id = ? AND usuario_id = ?',
      [provaId, usuarioId]
    );

    if (provas.length === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    // Deletar a prova do banco de dados
    await db.query(
      'DELETE FROM provas WHERE id = ? AND usuario_id = ?',
      [provaId, usuarioId]
    );

    console.log('Prova deletada com sucesso:', provaId);
    res.json({ 
      message: 'Prova deletada com sucesso',
      provaId: provaId
    });
  } catch (error) {
    console.error('Erro ao deletar prova:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota para salvar os resultados de uma pasta de provas
router.post('/salvar-resultados', async (req, res) => {
  try {
    const { provaId, resultados } = req.body;
    const usuarioId = req.user.id;

    console.log('Recebendo requisição para salvar resultados:', {
      provaId,
      usuarioId,
      quantidadeResultados: resultados.length
    });

    // Verificar se a prova existe e pertence ao usuário
    const [provas] = await db.query(
      'SELECT id FROM provas WHERE id = ? AND usuario_id = ?',
      [provaId, usuarioId]
    );

    if (provas.length === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    // Deletar todos os registros antigos da prova na tabela imagens_provas
    await db.query(
      'DELETE FROM imagens_provas WHERE prova_id = ? AND usuario_id = ?',
      [provaId, usuarioId]
    );

    console.log('Registros antigos deletados para a prova:', provaId);

    // Inserir os novos resultados na tabela imagens_provas
    for (const resultado of resultados) {
      try {
        const [insertResult] = await db.query(
          `INSERT INTO imagens_provas 
          (prova_id, usuario_id, nome_aluno, data_criacao, status, acertos, total_questoes, nota)
          VALUES (?, ?, ?, NOW(), 'corrigido', ?, ?, ?)`,
          [
            provaId,
            usuarioId,
            resultado.nomeAluno,
            resultado.acertos,
            resultado.total,
            resultado.nota
          ]
        );

        console.log('Resultado salvo com sucesso:', {
          id: insertResult.insertId,
          nomeAluno: resultado.nomeAluno
        });
      } catch (insertError) {
        console.error('Erro ao inserir resultado individual:', {
          erro: insertError.message,
          resultado
        });
        throw insertError;
      }
    }

    console.log('Todos os resultados foram salvos com sucesso');
    res.status(201).json({ 
      message: 'Resultados salvos com sucesso',
      quantidadeSalvos: resultados.length
    });
  } catch (error) {
    console.error('Erro ao salvar resultados:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

// Rota para buscar a data do último salvamento de uma prova
router.get('/ultimo-salvamento/:provaId', async (req, res) => {
  try {
    const { provaId } = req.params;
    const usuarioId = req.user.id;

    console.log('Buscando último salvamento para prova:', {
      provaId,
      usuarioId
    });

    // Verificar se a prova existe e pertence ao usuário
    const [provas] = await db.query(
      'SELECT id FROM provas WHERE id = ? AND usuario_id = ?',
      [provaId, usuarioId]
    );

    if (provas.length === 0) {
      return res.status(404).json({ error: 'Prova não encontrada' });
    }

    // Buscar o registro mais recente da tabela imagens_provas para esta prova
    const [resultados] = await db.query(
      'SELECT data_criacao FROM imagens_provas WHERE prova_id = ? AND usuario_id = ? ORDER BY data_criacao DESC LIMIT 1',
      [provaId, usuarioId]
    );

    if (resultados.length === 0) {
      return res.json({ ultimoSalvamento: null });
    }

    console.log('Último salvamento encontrado:', resultados[0].data_criacao);
    res.json({ 
      ultimoSalvamento: resultados[0].data_criacao
    });
  } catch (error) {
    console.error('Erro ao buscar último salvamento:', error);
    res.status(500).json({ 
      error: 'Erro interno do servidor',
      details: error.message 
    });
  }
});

module.exports = router; 