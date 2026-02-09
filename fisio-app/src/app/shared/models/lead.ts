export interface Lead {

    id?: number;
    nome: string;
    sobrenome: string;
    email: string;
    telefone?: string;
    motivo: string;
    criadoEm: string;
    status: 'novo' | 'aguardando_avaliacao' | 'em_tratamento' | 'finalizado';
}
