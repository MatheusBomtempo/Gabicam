const db = require('../database/config');

const authMiddleware = async (req, res, next) => {
  try {
    const matricula = req.headers.matricula;

    if (!matricula) {
      return res.status(401).json({ error: 'Matrícula não fornecida' });
    }

    const [users] = await db.query('SELECT * FROM usuarios WHERE matricula = ?', [matricula]);
    const user = users[0];

    if (!user) {
      return res.status(401).json({ error: 'Usuário não encontrado' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = authMiddleware; 