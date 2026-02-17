# Sistema de Agendamento - Documentação

## 📋 Visão Geral

Sistema completo de agendamento de avaliações com verificação de disponibilidade em tempo real.

## 🎯 Funcionalidades

### Frontend
- ✅ Seleção de data com calendário
- ✅ Exibição de horários disponíveis em grid
- ✅ Indicação visual de horários ocupados
- ✅ Validação em tempo real
- ✅ Interface responsiva

### Backend (a implementar)
- ✅ Endpoint de consulta de horários disponíveis
- ✅ Endpoint de criação de agendamentos
- ✅ Verificação de conflitos de horário
- ✅ Listagem e cancelamento de agendamentos

## 🚀 Como Usar

### 1. No seu componente que usa o modal:

```typescript
import { Component } from '@angular/core';
import { ModalAgendarAvaliacaoComponent } from './modal-agendar-avaliacao.component';
import { AgendamentoService } from '@shared/service';

@Component({
  selector: 'app-minha-pagina',
  standalone: true,
  imports: [ModalAgendarAvaliacaoComponent],
  template: `
    <button (click)="abrirModal()">Agendar Avaliação</button>
    
    <app-modal-agendar-avaliacao
      [visible]="modalVisivel"
      [leadId]="leadSelecionado?.id"
      (close)="fecharModal()"
      (confirmarAgendamento)="onConfirmarAgendamento($event)"
    />
  `
})
export class MinhaPaginaComponent {
  modalVisivel = false;
  leadSelecionado: any;

  constructor(private agendamentoService: AgendamentoService) {}

  abrirModal() {
    this.modalVisivel = true;
  }

  fecharModal() {
    this.modalVisivel = false;
  }

  onConfirmarAgendamento(evento: { data: string; hora: string; observacao?: string }) {
    const agendamento = {
      leadId: this.leadSelecionado.id,
      data: evento.data,
      hora: evento.hora,
      observacao: evento.observacao
    };

    this.agendamentoService.criarAgendamento(agendamento).subscribe({
      next: (resultado) => {
        console.log('✅ Agendamento criado:', resultado);
        alert('Avaliação agendada com sucesso!');
        this.fecharModal();
      },
      error: (erro) => {
        console.error('❌ Erro ao agendar:', erro);
        alert(erro.error?.erro || 'Erro ao agendar avaliação');
      }
    });
  }
}
```

### 2. Estrutura de Dados

#### Request - Criar Agendamento
```typescript
{
  leadId?: number;
  pacienteId?: number;
  data: string;      // "2026-02-14"
  hora: string;      // "14:00"
  observacao?: string;
}
```

#### Response - Horários Disponíveis
```typescript
[
  {
    time: "08:00",
    available: true
  },
  {
    time: "09:00",
    available: false  // Ocupado
  },
  ...
]
```

## 🎨 Customização

### Alterar horários de funcionamento

Edite o método `gerarHorariosPadrao()` em [modal-agendar-avaliacao.component.ts](src/app/features/agenda/components/modal-agendar-avaliacao/modal-agendar-avaliacao.component.ts#L58-L64):

```typescript
gerarHorariosPadrao(): void {
  // Personalize seus horários aqui
  const horarios = ['07:00', '08:00', '09:00', '10:00', '11:00', 
                    '14:00', '15:00', '16:00', '17:00', '18:00'];
  this.horariosDisponiveis = horarios.map(time => ({
    time,
    available: true
  }));
}
```

### Alterar cores e estilos

Edite [modal-agendar-avaliacao.component.scss](src/app/features/agenda/components/modal-agendar-avaliacao/modal-agendar-avaliacao.component.scss):

```scss
.horario-btn {
  &.selected {
    background-color: #3f51b5; // Sua cor aqui
    border-color: #3f51b5;
  }
}
```

## 🔧 Backend - Endpoints Necessários

### GET `/api/agendamentos/disponibilidade?data=2026-02-14`

Retorna horários disponíveis para a data.

**Response:**
```json
[
  { "time": "08:00", "available": true },
  { "time": "09:00", "available": false },
  { "time": "10:00", "available": true }
]
```

### POST `/api/agendamentos`

Cria novo agendamento.

**Request:**
```json
{
  "leadId": 123,
  "data": "2026-02-14",
  "hora": "14:00",
  "observacao": "Primeira avaliação"
}
```

**Response:**
```json
{
  "id": 456,
  "leadId": 123,
  "data": "2026-02-14",
  "hora": "14:00",
  "status": "agendado"
}
```

### DELETE `/api/agendamentos/:id`

Cancela agendamento.

**Response:** `204 No Content`

## 📊 Estrutura do Banco de Dados

```sql
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
```

## 🐛 Tratamento de Erros

O sistema possui fallback automático. Se o backend não retornar horários, ele gera horários padrão:

```typescript
error: (erro) => {
  console.error('Erro ao buscar horários:', erro);
  this.carregandoHorarios = false;
  // Gera horários padrão automaticamente
  this.gerarHorariosPadrao();
}
```

## 📱 Visual do Modal

1. **Usuário seleciona a data** → Modal exibe loading
2. **Sistema busca horários disponíveis** no backend
3. **Grid de horários aparece**:
   - Verde: Disponível (clicável)
   - Cinza: Ocupado (desabilitado)
   - Azul: Selecionado
4. **Usuário clica em horário** → Botão "Agendar" fica habilitado
5. **Confirma agendamento** → Envia para backend

## ⚠️ Observações Importantes

1. **Data mínima**: Modal não permite selecionar datas passadas
2. **Validação**: Botão "Agendar" só fica ativo com data + horário selecionados
3. **Conflitos**: Backend deve validar se horário ainda está disponível antes de salvar
4. **Feedback**: Sempre mostre mensagem de sucesso/erro ao usuário

## 🔗 Arquivos Importantes

- [AgendamentoService](src/app/shared/service/agendamento.service.ts) - Serviço HTTP
- [ModalComponent](src/app/features/agenda/components/modal-agendar-avaliacao/modal-agendar-avaliacao.component.ts) - Lógica do modal
- [ModalHTML](src/app/features/agenda/components/modal-agendar-avaliacao/modal-agendar-avaliacao.component.html) - Template
- [ModalStyles](src/app/features/agenda/components/modal-agendar-avaliacao/modal-agendar-avaliacao.component.scss) - Estilos
- [Backend Exemplo](BACKEND-AGENDAMENTO-EXEMPLO.js) - Referência de implementação

## 💡 Próximos Passos

1. Implementar os endpoints no backend (veja `BACKEND-AGENDAMENTO-EXEMPLO.js`)
2. Criar tabela `agendamentos` no banco de dados
3. Testar o fluxo completo
4. Adicionar notificações (email/SMS)
5. Implementar lembretes de agendamento

---

**Desenvolvido com ❤️ para Portal Fisio**
