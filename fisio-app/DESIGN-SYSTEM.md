# 🎨 Design System - Fisioterapia Thaís Cunha

Sistema de design unificado para garantir consistência visual em todo o portal.

## 📁 Estrutura

```
src/styles/
├── _variables.scss    # Todas as variáveis (cores, espaçamentos, etc)
├── _mixins.scss       # Mixins reutilizáveis
└── styles.scss        # Arquivo principal (importa variables e mixins)
```

## 🎨 Paleta de Cores

### Cores Primárias (Roxo)
```scss
$purple-primary: #9333ea   // Cor principal
$purple-dark: #7e22ce      // Hover/Active
$purple-darker: #6b21a8    // Texto escuro
$purple-light: #f3e8ff     // Fundos suaves
$purple-lighter: #faf5ff   // Hover suave
$purple-border: #e9d5ff    // Bordas
$purple-medium: #d8b4fe    // Médio
```

### Cores Secundárias
- **Azul:** `$blue`, `$blue-light`, `$blue-dark`
- **Verde:** `$green`, `$green-light`, `$green-dark`
- **Laranja:** `$orange`, `$orange-light`, `$orange-dark`
- **Vermelho:** `$red`, `$red-light`, `$red-dark`

### Escala de Cinzas
```scss
$gray-50 até $gray-900
```

## 📏 Espaçamentos

### Sistema 4pt Base
```scss
$space-1: 0.25rem  // 4px
$space-2: 0.5rem   // 8px
$space-3: 0.75rem  // 12px
$space-4: 1rem     // 16px
$space-6: 1.5rem   // 24px
$space-8: 2rem     // 32px
```

### Espaçamentos Responsivos
```scss
$spacing-xs: clamp(8px, 1.5vw, 12px)
$spacing-sm: clamp(12px, 2vw, 16px)
$spacing-md: clamp(16px, 2.5vw, 24px)
$spacing-lg: clamp(24px, 3vw, 32px)
$spacing-xl: clamp(32px, 4vw, 48px)
```

## 🔤 Tipografia

### Família de Fontes
```scss
$font-family-base: system-ui, -apple-system, ...
```

### Tamanhos Responsivos
```scss
$font-xs:  clamp(11px, 1vw, 12px)
$font-sm:  clamp(13px, 1.2vw, 14px)
$font-base: clamp(14px, 1.3vw, 16px)
$font-lg:  clamp(16px, 1.5vw, 18px)
$font-xl:  clamp(18px, 2vw, 20px)
$font-2xl: clamp(22px, 2.5vw, 24px)
$font-3xl: clamp(28px, 3.5vw, 32px)
$font-4xl: clamp(32px, 4vw, 40px)
```

### Pesos
```scss
$font-normal: 400
$font-medium: 500
$font-semibold: 600
$font-bold: 700
```

## 🔘 Botões (Mixins)

### Uso
```scss
.meu-botao {
  @include button-primary;
}

.meu-botao-outline {
  @include button-outline;
}

.meu-botao-secundario {
  @include button-secondary;
}
```

## 🎴 Cards

### Card Base
```scss
.meu-card {
  @include card-base;
  @include card-hover; // Adiciona efeito hover
}
```

## 📱 Breakpoints Responsivos

```scss
@include respond-to(xs)  // < 380px
@include respond-to(sm)  // < 640px
@include respond-to(md)  // < 768px
@include respond-to(lg)  // < 1024px
@include respond-to(xl)  // < 1280px
```

### Exemplo
```scss
.elemento {
  width: 100%;
  
  @include respond-to(md) {
    width: 50%;
  }
}
```

## 🎭 Sombras

```scss
$shadow-xs:  // Muito suave
$shadow-sm:  // Suave
$shadow-md:  // Média
$shadow-lg:  // Grande
$shadow-xl:  // Muito grande

// Sombras coloridas
$shadow-purple
$shadow-purple-md
$shadow-purple-lg
```

## 🔲 Bordas

```scss
$radius-xs: 0.25rem  // 4px
$radius-sm: 0.5rem   // 8px
$radius-md: 0.75rem  // 12px
$radius-lg: 1rem     // 16px
$radius-xl: 1.25rem  // 20px
$radius-full: 9999px // Totalmente arredondado
```

## 📦 Como Usar

### 1. Em Componentes Angular

```scss
// No topo do seu arquivo .scss
@import '../../../styles/variables';
@import '../../../styles/mixins';

.meu-componente {
  background: $purple-light;
  padding: $space-6;
  border-radius: $radius-lg;
  box-shadow: $shadow-md;
  
  button {
    @include button-primary;
  }
}
```

### 2. Ajuste o caminho conforme a profundidade

```scss
// Para arquivos em src/app/features/admin/pages/
@import '../../../../../styles/variables';
@import '../../../../../styles/mixins';

// Para arquivos em src/app/features/home/
@import '../../../../styles/variables';
@import '../../../../styles/mixins';
```

## ✨ Mixins Úteis

### Flexbox
```scss
@include flex-center;     // Centraliza
@include flex-between;    // Space-between
@include flex-column;     // Coluna
```

### Input
```scss
@include input-base;      // Estilo padrão de input
```

### Texto
```scss
@include text-truncate;   // Trunca com ...
@include line-clamp(3);   // Limita a 3 linhas
@include gradient-text;   // Texto gradiente
```

### Scrollbar Customizada
```scss
.lista {
  @include custom-scrollbar;
}
```

### Container
```scss
.secao {
  @include container;  // Max-width + padding responsivo + centralizado
}
```

## 🎯 Boas Práticas

1. **Sempre use variáveis** ao invés de valores fixos
   ```scss
   // ❌ Ruim
   color: #9333ea;
   padding: 24px;
   
   // ✅ Bom
   color: $purple-primary;
   padding: $space-6;
   ```

2. **Use mixins para padrões repetidos**
   ```scss
   // ❌ Ruim
   .botao1 {
     background: #9333ea;
     color: white;
     padding: 12px 20px;
     /* ... */
   }
   
   // ✅ Bom
   .botao1 {
     @include button-primary;
   }
   ```

3. **Prefira espaçamentos responsivos**
   ```scss
   // ❌ Ruim
   padding: 24px;
   
   // ✅ Bom
   padding: $spacing-md;
   ```

4. **Use respond-to para media queries**
   ```scss
   // ❌ Ruim
   @media (max-width: 768px) { }
   
   // ✅ Bom
   @include respond-to(md) { }
   ```

## 🔄 Migração de Código Existente

Para migrar código antigo:

1. Substitua cores fixas por variáveis
2. Substitua padding/margin fixos por variáveis de espaçamento
3. Use mixins de botões ao invés de estilos manuais
4. Use respond-to ao invés de media queries diretas

## 📋 Checklist de Consistência

- [ ] Usa variáveis de cores do design system
- [ ] Usa variáveis de espaçamento (não valores fixos)
- [ ] Usa variáveis de tipografia
- [ ] Usa mixins de botões
- [ ] Usa mixins de cards
- [ ] Usa respond-to para responsividade
- [ ] Usa transições padrão
- [ ] Usa sombras padrão
- [ ] Usa raios de borda padrão

---

**Mantido por:** Equipe de Desenvolvimento
**Última atualização:** Janeiro 2026
