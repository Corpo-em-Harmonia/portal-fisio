/**
 * BACKEND - Exemplo de implementação dos endpoints de agendamento
 * 
 * Este arquivo mostra como implementar a API no backend (Node.js/Express)
 * Adapte conforme seu framework (Spring Boot, Django, etc.)
 */

// Exemplo com Node.js/Express

// ==========================================
// ENDPOINT: GET /api/agendamentos/disponibilidade?data=2026-02-14
// ==========================================
/**
 * Retorna horários disponíveis para uma data específica
 */
app.get('/api/agendamentos/disponibilidade', async (req, res) => {
  try {
    const { data } = req.query; // "2026-02-14"

    // 1. Definir horários de funcionamento
    const horariosTrabalho = [
      '08:00', '09:00', '10:00', '11:00', 
      '13:00', '14:00', '15:00', '16:00', '17:00'
    ];

    // 2. Buscar agendamentos já existentes para essa data
    const agendamentosExistentes = await db.query(
      'SELECT hora FROM agendamentos WHERE data = ? AND status != ?',
      [data, 'cancelado']
    );

    // 3. Extrair horários ocupados
    const horariosOcupados = agendamentosExistentes.map(a => a.hora);

    // 4. Marcar disponibilidade de cada horário
    const horariosDisponiveis = horariosTrabalho.map(hora => ({
      time: hora,
      available: !horariosOcupados.includes(hora)
    }));

    res.json(horariosDisponiveis);
  } catch (erro) {
    console.error('Erro ao buscar horários:', erro);
    res.status(500).json({ erro: 'Erro ao buscar horários disponíveis' });
  }
});

// ==========================================
// ENDPOINT: POST /api/agendamentos
// ==========================================
/**
 * Cria um novo agendamento
 */
app.post('/api/agendamentos', async (req, res) => {
  try {
    const { leadId, pacienteId, data, hora, observacao } = req.body;

    // 1. Validar dados obrigatórios
    if (!data || !hora) {
      return res.status(400).json({ erro: 'Data e hora são obrigatórios' });
    }

    // 2. Verificar se o horário ainda está disponível
    const horarioOcupado = await db.query(
      'SELECT id FROM agendamentos WHERE data = ? AND hora = ? AND status != ?',
      [data, hora, 'cancelado']
    );

    if (horarioOcupado.length > 0) {
      return res.status(409).json({ erro: 'Horário já está ocupado' });
    }

    // 3. Criar o agendamento
    const resultado = await db.query(
      `INSERT INTO agendamentos (lead_id, paciente_id, data, hora, observacao, status, created_at)
       VALUES (?, ?, ?, ?, ?, 'agendado', NOW())`,
      [leadId, pacienteId, data, hora, observacao]
    );

    const novoAgendamento = {
      id: resultado.insertId,
      leadId,
      pacienteId,
      data,
      hora,
      observacao,
      status: 'agendado'
    };

    res.status(201).json(novoAgendamento);
  } catch (erro) {
    console.error('Erro ao criar agendamento:', erro);
    res.status(500).json({ erro: 'Erro ao criar agendamento' });
  }
});

// ==========================================
// ENDPOINT: GET /api/agendamentos
// ==========================================
/**
 * Lista todos os agendamentos
 */
app.get('/api/agendamentos', async (req, res) => {
  try {
    const { status, dataInicio, dataFim } = req.query;

    let query = 'SELECT * FROM agendamentos WHERE 1=1';
    const parametros = [];

    if (status) {
      query += ' AND status = ?';
      parametros.push(status);
    }

    if (dataInicio) {
      query += ' AND data >= ?';
      parametros.push(dataInicio);
    }

    if (dataFim) {
      query += ' AND data <= ?';
      parametros.push(dataFim);
    }

    query += ' ORDER BY data, hora';

    const agendamentos = await db.query(query, parametros);
    res.json(agendamentos);
  } catch (erro) {
    console.error('Erro ao listar agendamentos:', erro);
    res.status(500).json({ erro: 'Erro ao listar agendamentos' });
  }
});

// ==========================================
// ENDPOINT: DELETE /api/agendamentos/:id
// ==========================================
/**
 * Cancela um agendamento
 */
app.delete('/api/agendamentos/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Opção 1: Soft delete (marca como cancelado)
    await db.query(
      'UPDATE agendamentos SET status = ?, updated_at = NOW() WHERE id = ?',
      ['cancelado', id]
    );

    // Opção 2: Hard delete (remove do banco)
    // await db.query('DELETE FROM agendamentos WHERE id = ?', [id]);

    res.status(204).send();
  } catch (erro) {
    console.error('Erro ao cancelar agendamento:', erro);
    res.status(500).json({ erro: 'Erro ao cancelar agendamento' });
  }
});

// ==========================================
// ESTRUTURA DA TABELA (SQL)
// ==========================================
/*
CREATE TABLE agendamentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  lead_id INT,
  paciente_id INT,
  data DATE NOT NULL,
  hora TIME NOT NULL,
  observacao TEXT,
  status ENUM('agendado', 'realizado', 'cancelado') DEFAULT 'agendado',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  INDEX idx_data_hora (data, hora),
  INDEX idx_status (status),
  FOREIGN KEY (lead_id) REFERENCES leads(id),
  FOREIGN KEY (paciente_id) REFERENCES pacientes(id)
);
*/

// ==========================================
// EXEMPLO DE USO NO FRONTEND
// ==========================================
/*
// No componente que usa o modal:
import { AgendamentoService } from './shared/service/agendamento.service';

export class MinhaPage {
  constructor(private agendamentoService: AgendamentoService) {}

  onConfirmarAgendamento(evento: { data: string; hora: string; observacao?: string }) {
    const agendamento = {
      leadId: this.leadSelecionado.id,
      data: evento.data,
      hora: evento.hora,
      observacao: evento.observacao
    };

    this.agendamentoService.criarAgendamento(agendamento).subscribe({
      next: (resultado) => {
        console.log('Agendamento criado:', resultado);
        alert('Avaliação agendada com sucesso!');
        this.carregarAgendamentos();
      },
      error: (erro) => {
        console.error('Erro:', erro);
        alert('Erro ao agendar avaliação');
      }
    });
  }
}
*/
