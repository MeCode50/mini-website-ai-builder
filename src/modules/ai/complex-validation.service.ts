import { Injectable, Logger } from '@nestjs/common';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  score: number;
  suggestions: string[];
}

export interface ComponentValidation {
  hasProps: boolean;
  hasState: boolean;
  hasEffects: boolean;
  hasErrorHandling: boolean;
  hasAccessibility: boolean;
  isResponsive: boolean;
}

@Injectable()
export class ComplexValidationService {
  private readonly logger = new Logger(ComplexValidationService.name);

  validateComplexWebsite(content: any, complexity: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    let score = 0;

    // Basic structure validation
    const basicValidation = this.validateBasicStructure(content);
    errors.push(...basicValidation.errors);
    warnings.push(...basicValidation.warnings);
    score += basicValidation.score;

    // Component validation
    const componentValidation = this.validateComponents(content, complexity);
    errors.push(...componentValidation.errors);
    warnings.push(...componentValidation.warnings);
    score += componentValidation.score;

    // Feature-specific validation
    const featureValidation = this.validateFeatures(content, complexity);
    errors.push(...featureValidation.errors);
    warnings.push(...featureValidation.warnings);
    score += featureValidation.score;

    // Code quality validation
    const qualityValidation = this.validateCodeQuality(content);
    errors.push(...qualityValidation.errors);
    warnings.push(...qualityValidation.warnings);
    score += qualityValidation.score;

    // Generate suggestions based on complexity
    suggestions.push(...this.generateSuggestions(complexity, errors, warnings));

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      score,
      suggestions
    };
  }

  private validateBasicStructure(content: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    if (!content.nextjsContent) {
      errors.push('Missing nextjsContent');
      return { isValid: false, errors, warnings, score: 0, suggestions: [] };
    }

    const { nextjsContent } = content;

    // Check main page
    if (!nextjsContent['page.tsx']) {
      errors.push('Missing main page.tsx');
    } else {
      score += 10;
      if (nextjsContent['page.tsx'].length < 100) {
        warnings.push('Main page content seems too short');
      }
    }

    // Check layout
    if (!nextjsContent['layout.tsx']) {
      errors.push('Missing layout.tsx');
    } else {
      score += 10;
    }

    // Check CSS
    if (!nextjsContent['globals.css']) {
      errors.push('Missing globals.css');
    } else {
      score += 5;
    }

    // Check components
    if (!nextjsContent.components || Object.keys(nextjsContent.components).length === 0) {
      errors.push('Missing components');
    } else {
      score += 15;
      const componentCount = Object.keys(nextjsContent.components).length;
      if (componentCount < 3) {
        warnings.push('Consider adding more components for better structure');
      }
    }

    return { isValid: errors.length === 0, errors, warnings, score, suggestions: [] };
  }

  private validateComponents(content: any, complexity: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    const { nextjsContent } = content;

    if (!nextjsContent.components) {
      return { isValid: false, errors, warnings, score: 0, suggestions: [] };
    }

    const components = nextjsContent.components;
    const componentNames = Object.keys(components);

    // Validate each component
    for (const [name, code] of Object.entries(components)) {
      const componentValidation = this.validateSingleComponent(name, code as string);
      
      if (!componentValidation.hasProps && complexity.level === 'complex') {
        warnings.push(`Component ${name} should have proper TypeScript props`);
      }
      
      if (!componentValidation.hasState && complexity.features.includes('interactive')) {
        warnings.push(`Component ${name} might need state management`);
      }
      
      if (!componentValidation.hasAccessibility) {
        warnings.push(`Component ${name} should include accessibility features`);
      }
      
      if (!componentValidation.isResponsive) {
        warnings.push(`Component ${name} should be responsive`);
      }

      score += componentValidation.hasProps ? 5 : 0;
      score += componentValidation.hasState ? 5 : 0;
      score += componentValidation.hasEffects ? 5 : 0;
      score += componentValidation.hasErrorHandling ? 5 : 0;
      score += componentValidation.hasAccessibility ? 5 : 0;
      score += componentValidation.isResponsive ? 5 : 0;
    }

    // Check for required components based on complexity
    if (complexity.level === 'complex') {
      const requiredComponents = ['Header', 'Footer'];
      for (const required of requiredComponents) {
        if (!componentNames.some(name => name.includes(required))) {
          errors.push(`Missing required component: ${required}`);
        }
      }
    }

    return { isValid: errors.length === 0, errors, warnings, score, suggestions: [] };
  }

  private validateSingleComponent(name: string, code: string): ComponentValidation {
    return {
      hasProps: this.hasTypeScriptProps(code),
      hasState: this.hasStateManagement(code),
      hasEffects: this.hasUseEffect(code),
      hasErrorHandling: this.hasErrorHandling(code),
      hasAccessibility: this.hasAccessibilityFeatures(code),
      isResponsive: this.isResponsive(code)
    };
  }

  private hasTypeScriptProps(code: string): boolean {
    return code.includes('interface') || code.includes('type ') || code.includes(': {') || code.includes('Props');
  }

  private hasStateManagement(code: string): boolean {
    return code.includes('useState') || code.includes('useReducer') || code.includes('setState');
  }

  private hasUseEffect(code: string): boolean {
    return code.includes('useEffect') || code.includes('componentDidMount') || code.includes('componentDidUpdate');
  }

  private hasErrorHandling(code: string): boolean {
    return code.includes('try') || code.includes('catch') || code.includes('Error') || code.includes('error');
  }

  private hasAccessibilityFeatures(code: string): boolean {
    return code.includes('aria-') || code.includes('role=') || code.includes('alt=') || code.includes('tabIndex');
  }

  private isResponsive(code: string): boolean {
    return code.includes('sm:') || code.includes('md:') || code.includes('lg:') || code.includes('xl:') || 
           code.includes('@media') || code.includes('responsive');
  }

  private validateFeatures(content: any, complexity: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    const { nextjsContent } = content;

    // E-commerce validation
    if (complexity.features.includes('ecommerce')) {
      const ecommerceValidation = this.validateEcommerceFeatures(nextjsContent);
      errors.push(...ecommerceValidation.errors);
      warnings.push(...ecommerceValidation.warnings);
      score += ecommerceValidation.score;
    }

    // Interactive features validation
    if (complexity.features.includes('carousel') || complexity.features.includes('slider')) {
      const interactiveValidation = this.validateInteractiveFeatures(nextjsContent);
      errors.push(...interactiveValidation.errors);
      warnings.push(...interactiveValidation.warnings);
      score += interactiveValidation.score;
    }

    // Authentication validation
    if (complexity.features.includes('authentication')) {
      const authValidation = this.validateAuthenticationFeatures(nextjsContent);
      errors.push(...authValidation.errors);
      warnings.push(...authValidation.warnings);
      score += authValidation.score;
    }

    return { isValid: errors.length === 0, errors, warnings, score, suggestions: [] };
  }

  private validateEcommerceFeatures(content: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    const hasProductCard = this.hasComponent(content, 'ProductCard') || this.hasComponent(content, 'Product');
    const hasCart = this.hasComponent(content, 'Cart') || this.hasComponent(content, 'ShoppingCart');
    const hasCheckout = this.hasComponent(content, 'Checkout') || this.hasComponent(content, 'Payment');

    if (!hasProductCard) {
      errors.push('Missing product display component for e-commerce');
    } else {
      score += 10;
    }

    if (!hasCart) {
      errors.push('Missing shopping cart component for e-commerce');
    } else {
      score += 10;
    }

    if (!hasCheckout) {
      warnings.push('Consider adding checkout component for complete e-commerce flow');
    } else {
      score += 10;
    }

    return { isValid: errors.length === 0, errors, warnings, score, suggestions: [] };
  }

  private validateInteractiveFeatures(content: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    const hasCarousel = this.hasComponent(content, 'Carousel') || this.hasComponent(content, 'Slider');
    const hasModal = this.hasComponent(content, 'Modal') || this.hasComponent(content, 'Dialog');

    if (!hasCarousel) {
      errors.push('Missing carousel/slider component');
    } else {
      score += 10;
    }

    if (!hasModal) {
      warnings.push('Consider adding modal component for better UX');
    } else {
      score += 5;
    }

    return { isValid: errors.length === 0, errors, warnings, score, suggestions: [] };
  }

  private validateAuthenticationFeatures(content: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    const hasLogin = this.hasComponent(content, 'Login') || this.hasComponent(content, 'SignIn');
    const hasRegister = this.hasComponent(content, 'Register') || this.hasComponent(content, 'SignUp');

    if (!hasLogin) {
      errors.push('Missing login component for authentication');
    } else {
      score += 10;
    }

    if (!hasRegister) {
      warnings.push('Consider adding registration component');
    } else {
      score += 5;
    }

    return { isValid: errors.length === 0, errors, warnings, score, suggestions: [] };
  }

  private hasComponent(content: any, componentName: string): boolean {
    if (!content.components) return false;
    
    const componentNames = Object.keys(content.components);
    return componentNames.some(name => 
      name.toLowerCase().includes(componentName.toLowerCase())
    );
  }

  private validateCodeQuality(content: any): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let score = 0;

    const { nextjsContent } = content;

    // Check for TypeScript usage
    const hasTypeScript = this.hasTypeScriptUsage(nextjsContent);
    if (hasTypeScript) {
      score += 10;
    } else {
      warnings.push('Consider using TypeScript for better type safety');
    }

    // Check for modern React patterns
    const hasModernPatterns = this.hasModernReactPatterns(nextjsContent);
    if (hasModernPatterns) {
      score += 10;
    } else {
      warnings.push('Consider using modern React patterns (hooks, functional components)');
    }

    // Check for performance optimizations
    const hasOptimizations = this.hasPerformanceOptimizations(nextjsContent);
    if (hasOptimizations) {
      score += 5;
    } else {
      warnings.push('Consider adding performance optimizations (memo, useCallback)');
    }

    return { isValid: errors.length === 0, errors, warnings, score, suggestions: [] };
  }

  private hasTypeScriptUsage(content: any): boolean {
    const allContent = JSON.stringify(content);
    return allContent.includes('interface') || allContent.includes('type ') || allContent.includes(': ');
  }

  private hasModernReactPatterns(content: any): boolean {
    const allContent = JSON.stringify(content);
    return allContent.includes('useState') || allContent.includes('useEffect') || 
           allContent.includes('const ') || allContent.includes('=>');
  }

  private hasPerformanceOptimizations(content: any): boolean {
    const allContent = JSON.stringify(content);
    return allContent.includes('React.memo') || allContent.includes('useCallback') || 
           allContent.includes('useMemo') || allContent.includes('lazy');
  }

  private generateSuggestions(complexity: any, errors: string[], warnings: string[]): string[] {
    const suggestions: string[] = [];

    if (complexity.level === 'complex') {
      suggestions.push('For complex websites, consider breaking down into smaller, focused components');
      suggestions.push('Implement proper state management with Context API or Redux');
      suggestions.push('Add comprehensive error boundaries for better error handling');
    }

    if (complexity.features.includes('ecommerce')) {
      suggestions.push('Add product filtering and search functionality');
      suggestions.push('Implement shopping cart persistence with localStorage');
      suggestions.push('Add user authentication for personalized experience');
    }

    if (complexity.features.includes('responsive')) {
      suggestions.push('Test on multiple device sizes and orientations');
      suggestions.push('Use CSS Grid and Flexbox for complex layouts');
      suggestions.push('Implement touch-friendly interactions for mobile');
    }

    if (errors.length > 0) {
      suggestions.push('Review the validation errors and ensure all required components are present');
    }

    if (warnings.length > 0) {
      suggestions.push('Address the warnings to improve code quality and user experience');
    }

    return suggestions;
  }
}
