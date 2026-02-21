import { FormControl, FormGroup, Validators } from '@angular/forms';

/**
 * Interface comum para dados de lead capturados em modais
 */
export interface LeadFormData {
  nome: string;
  sobrenome?: string;
  telefone: string;
  email?: string;
  observacao?: string;
}

/**
 * Interface para eventos de ação de modais
 */
export interface ModalActionEvent {
  action: 'whatsapp' | 'ligar' | 'criar-lead';
  value?: LeadFormData;
  agendarAgora?: boolean;
}

/**
 * Helper para funcionalidades compartilhadas entre modais de lead
 */
export class ModalLeadHelper {
  /**
   * Cria um FormGroup padrão para captura de lead
   * @param includeOptionalFields Se true, inclui campos opcionais como observação e agendarAgora
   */
  static createLeadForm(includeOptionalFields = false): FormGroup {
    if (includeOptionalFields) {
      return new FormGroup({
        nome: new FormControl('', Validators.required),
        sobrenome: new FormControl('', Validators.required),
        telefone: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        observacao: new FormControl(''),
        agendarAgora: new FormControl<boolean>(true),
      });
    }

    return new FormGroup({
      nome: new FormControl('', Validators.required),
      sobrenome: new FormControl('', Validators.required),
      telefone: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  /**
   * Valida e marca todos os campos do formulário como touched
   * @returns true se o formulário é válido
   */
  static validateAndMarkTouched(form: FormGroup): boolean {
    if (form.invalid) {
      form.markAllAsTouched();
      return false;
    }
    return true;
  }

  /**
   * Reseta o formulário para o estado inicial
   */
  static resetForm(form: FormGroup): void {
    form.reset();
  }

  /**
   * Extrai dados do formulário separando campos opcionais
   */
  static extractFormData(formValue: any): { leadData: LeadFormData; agendarAgora?: boolean } {
    const { agendarAgora, ...leadData } = formValue;
    return {
      leadData,
      agendarAgora: agendarAgora !== undefined ? !!agendarAgora : undefined
    };
  }
}
