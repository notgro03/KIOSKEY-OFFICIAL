import { STORAGE_KEYS } from './config.js';
import { stateManager } from './state.js';
import { showSuccess, showError } from './ui.js';

class PlansManager {
  constructor() {
    this.plans = {
      basic: {
        id: 'basic',
        name: 'Plan Básico',
        subtitle: 'Ideal para cuando tenés una sola llave',
        price: 1000,
        paymentUrl: 'https://mpago.la/1ETsqk9',
        features: [
          {
            name: 'Guarda Virtual Llave',
            value: 'GRATIS',
            description: 'Solo se puede guardar 1 llave por usuario'
          },
          {
            name: 'Guarda del Transponder',
            value: 'PAGO',
            description: 'Siempre que el vehículo permita la guarda del chip'
          },
          {
            name: 'Derivación a Cerrajería de la Red Kioskeys',
            value: 'GRATIS'
          },
          {
            name: 'Descuento en Carcasas',
            value: 'HASTA 20%',
            description: 'En nuestra red'
          },
          {
            name: 'Descuento en Llaves Codificadas',
            value: 'HASTA 20%',
            description: 'En nuestra red'
          },
          {
            name: 'Llave de Emergencia por Año',
            value: '1 GRATIS',
            description: 'Llave y mecanizado, no incluye programación'
          },
          {
            name: 'Programación de Llave de Emergencia',
            value: 'HASTA 20%',
            description: 'Precio especial'
          }
        ]
      },
      family: {
        id: 'family',
        name: 'Plan Familiar',
        subtitle: 'Hasta 3 vehículos',
        price: 3000,
        paymentUrl: 'https://mpago.la/family',
        features: [
          {
            name: 'Guarda Virtual Llave',
            value: 'GRATIS',
            description: 'Hasta 3 vehículos'
          },
          {
            name: 'Guarda del Transponder',
            value: 'PAGO',
            description: 'Siempre que el vehículo permita la guarda del chip'
          },
          {
            name: 'Derivación a Cerrajería',
            value: 'GRATIS',
            description: 'Red nacional de cerrajeros'
          },
          {
            name: 'Descuento en Carcasas',
            value: 'HASTA 20%',
            description: 'En nuestra red'
          },
          {
            name: 'Descuento en Llaves Codificadas',
            value: 'HASTA 20%',
            description: 'En nuestra red'
          },
          {
            name: 'Llave de Emergencia por Año',
            value: '1 GRATIS',
            description: 'Llave y mecanizado, no incluye programación'
          },
          {
            name: 'Programación de Llave de Emergencia',
            value: 'HASTA 40%',
            description: 'Precio especial'
          },
          {
            name: 'Llaves Adicionales',
            value: 'HASTA 5',
            description: 'Cada llave adicional tiene un costo de $600'
          }
        ]
      },
      premium: {
        id: 'premium',
        name: 'Plan Premium',
        subtitle: 'Máximos beneficios y cobertura total',
        price: 10000,
        paymentUrl: 'https://mpago.la/premium',
        popular: true,
        features: [
          {
            name: 'Guarda Virtual Llave',
            value: 'GRATIS',
            description: 'Sin límite de llaves'
          },
          {
            name: 'Guarda del Transponder',
            value: 'GRATIS',
            description: 'Para todos los vehículos compatibles'
          },
          {
            name: 'Derivación a Cerrajería',
            value: 'GRATIS',
            description: 'Prioridad 24/7'
          },
          {
            name: 'Descuento en Carcasas',
            value: 'HASTA 30%',
            description: 'En nuestra red'
          },
          {
            name: 'Descuento en Llaves Codificadas',
            value: 'HASTA 30%',
            description: 'En nuestra red'
          },
          {
            name: 'Llave de Emergencia por Año',
            value: '1 GRATIS',
            description: 'Llave y mecanizado incluidos'
          },
          {
            name: 'Programación de Llave de Emergencia',
            value: 'GRATIS',
            description: 'Incluye programación completa'
          }
        ]
      },
      fleet: {
        id: 'fleet',
        name: 'Plan Flotas',
        subtitle: 'Solución integral para empresas',
        price: null,
        contactUrl: '/pages/contacto.html',
        features: [
          {
            name: 'Guarda Virtual Llaves',
            value: 'ILIMITADAS',
            description: 'Sin límite de vehículos'
          },
          {
            name: 'Guarda del Transponder',
            value: 'INCLUIDO',
            description: 'Para toda la flota'
          },
          {
            name: 'Panel de Administración',
            value: 'INCLUIDO',
            description: 'Gestión centralizada'
          },
          {
            name: 'Usuarios Adicionales',
            value: 'ILIMITADOS',
            description: 'Sin costo extra'
          },
          {
            name: 'Descuentos Especiales',
            value: 'PERSONALIZADOS',
            description: 'Según volumen de flota'
          },
          {
            name: 'Soporte Dedicado',
            value: '24/7',
            description: 'Atención prioritaria'
          },
          {
            name: 'API de Integración',
            value: 'INCLUIDA',
            description: 'Para sistemas propios'
          }
        ]
      }
    };
    this.loadPlans();
  }

  loadPlans() {
    const savedPlans = localStorage.getItem(STORAGE_KEYS.PLANS);
    if (savedPlans) {
      this.plans = JSON.parse(savedPlans);
    }
    return this.plans;
  }

  savePlans() {
    try {
      localStorage.setItem(STORAGE_KEYS.PLANS, JSON.stringify(this.plans));
      stateManager.updateState('plans', this.plans);
      return true;
    } catch (error) {
      console.error('Error saving plans:', error);
      return false;
    }
  }

  getPlan(planId) {
    return this.plans[planId];
  }

  getAllPlans() {
    return Object.values(this.plans);
  }

  updatePlan(planId, updates) {
    try {
      if (!this.plans[planId]) {
        throw new Error('Plan no encontrado');
      }

      this.plans[planId] = {
        ...this.plans[planId],
        ...updates
      };

      if (this.savePlans()) {
        showSuccess('Plan actualizado correctamente');
        return true;
      }
      throw new Error('Error al guardar los cambios');
    } catch (error) {
      showError(error.message || 'Error al actualizar el plan');
      return false;
    }
  }

  formatPrice(price) {
    if (!price) return 'Consultar';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }
}

export const plansManager = new PlansManager();