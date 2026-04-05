import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  preview?: string;
}

@Component({
  selector: 'app-avaliacao-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MatSnackBarModule],
  templateUrl: './avaliacao-form.html',
  styleUrls: ['./avaliacao-form.scss']
})
export class AvaliacaoForm implements OnInit {
  avaliacaoForm!: FormGroup;
  pacienteNome: string = '';
  uploadedFiles: UploadedFile[] = [];

  condutaOptions = [
    'Cinesioterapia',
    'Eletroterapia',
    'Termoterapia',
    'Hidroterapia',
    'Terapia Manual',
    'RPG',
    'Pilates Terapêutico'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.pacienteNome = this.route.snapshot.queryParams['nome'] || 'Paciente';

    this.avaliacaoForm = this.fb.group({
      leadId: [''],
      avaliacaoId: [`AV-${Date.now()}`],
      medico: ['', Validators.required],
      hda: ['', Validators.required],
      hpp: [''],
      medicamentos: [''],
      cirurgia: [''],
      comorbidades: [''],
      testesRealizados: this.fb.array([this.fb.control('', Validators.required)]),
      goniometria: this.fb.array([this.createGoniometriaGroup()]),
      diagnostico: ['', Validators.required],
      condutaTerapeutica: this.fb.array([]),
      prognostico: ['', Validators.required],
      observacoes: ['']
    });
  }

  get testesRealizados(): FormArray {
    return this.avaliacaoForm.get('testesRealizados') as FormArray;
  }

  get goniometria(): FormArray {
    return this.avaliacaoForm.get('goniometria') as FormArray;
  }

  get condutaTerapeutica(): FormArray {
    return this.avaliacaoForm.get('condutaTerapeutica') as FormArray;
  }

  createGoniometriaGroup(): FormGroup {
    return this.fb.group({
      articulacao: [''],
      movimentoAvaliado: [''],
      graus: ['']
    });
  }

  addTeste(): void {
    this.testesRealizados.push(this.fb.control(''));
  }

  removeTeste(index: number): void {
    if (this.testesRealizados.length > 1) {
      this.testesRealizados.removeAt(index);
    }
  }

  addGoniometria(): void {
    this.goniometria.push(this.createGoniometriaGroup());
  }

  removeGoniometria(index: number): void {
    if (this.goniometria.length > 1) {
      this.goniometria.removeAt(index);
    }
  }

  onCondutaChange(event: Event): void {
    const checkbox = event.target as HTMLInputElement;
    const value = checkbox.value;

    if (checkbox.checked) {
      this.condutaTerapeutica.push(this.fb.control(value));
    } else {
      const index = this.condutaTerapeutica.controls.findIndex(
        ctrl => ctrl.value === value
      );
      if (index >= 0) {
        this.condutaTerapeutica.removeAt(index);
      }
    }
  }

  onFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      Array.from(input.files).forEach(file => {
        const fileData: UploadedFile = {
          name: file.name,
          size: file.size,
          type: file.type
        };

        if (file.type.startsWith('image/')) {
          const reader = new FileReader();
          reader.onload = (e: ProgressEvent<FileReader>) => {
            fileData.preview = e.target?.result as string;
          };
          reader.readAsDataURL(file);
        }

        this.uploadedFiles.push(fileData);
      });
    }
  }

  removeFile(index: number): void {
    this.uploadedFiles.splice(index, 1);
  }

  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  }

  onBack(): void {
    this.router.navigate(['/']);
  }

  onSubmit(): void {
    if (this.avaliacaoForm.valid) {
      const formValue = this.avaliacaoForm.value;
      
      const dataToSubmit = {
        lead_Id: formValue.leadId,
        medico: formValue.medico,
        avaliacaoId: formValue.avaliacaoId,
        hda: formValue.hda,
        hpp: formValue.hpp,
        diagnostico: formValue.diagnostico,
        testesRealizados: formValue.testesRealizados.filter((t: string) => t.trim() !== '').join(' | '),
        goniometria: formValue.goniometria.map((g: any) => 
          `${g.articulacao} - ${g.movimentoAvaliado}: ${g.graus}°`
        ).join(' | '),
        condutaTerapeutica: formValue.condutaTerapeutica.join(', '),
        prognostico: formValue.prognostico,
        comorbidades: formValue.comorbidades,
        medicamentos: formValue.medicamentos,
        cirurgia: formValue.cirurgia,
        observacoes: formValue.observacoes
      };

      // TODO: implementar chamada ao serviço para salvar
      // this.avaliacaoService.salvar(dataToSubmit).subscribe(...)
      
      this.snackBar.open('Avaliação salva com sucesso!', 'Fechar', {
        duration: 4000,
        panelClass: ['success-snackbar']
      });
      this.router.navigate(['/']);
    } else {
      this.snackBar.open('Por favor, preencha todos os campos obrigatórios', 'Fechar', {
        duration: 4000,
        panelClass: ['error-snackbar']
      });
      this.markFormGroupTouched(this.avaliacaoForm);
    }
  }

  private markFormGroupTouched(formGroup: FormGroup | FormArray): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup || control instanceof FormArray) {
        this.markFormGroupTouched(control);
      }
    });
  }
}
