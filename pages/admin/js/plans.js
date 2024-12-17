export const PLANS = {
    basic: {
      id: 'basic',
      name: 'Plan Básico',
      subtitle: 'Ideal para cuando tenés una sola llave',
      price: 1000,
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
          name: 'Descuento en Carcasas (en nuestra red)',
          value: 'HASTA 20%'
        },
        {
          name: 'Descuento en Llaves Codificadas (en nuestra red)',
          value: 'HASTA 20%'
        },
        {
          name: '1 Llave de Emergencia por Año',
          value: 'GRATIS',
          description: 'Llave y mecanizado, no incluye programación'
        },
        {
          name: 'Precio Especial en la Programación de la Llave de Emergencia',
          value: 'HASTA 20%'
        }
      ]
    }
  };
  
  export function getPlan(planId) {
    return PLANS[planId];
  }
  
  export function getAllPlans() {
    return Object.values(PLANS);
  }
  
  export function formatPlanPrice(price) {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(price);
  }
  
  export function renderPlanCard(plan) {
    return `
      <div class="plan-card ${plan.id}">
        <h3>${plan.name}</h3>
        <p class="plan-subtitle">${plan.subtitle}</p>
        <div class="plan-price">
          ${formatPlanPrice(plan.price)}
          <span class="plan-price-period">/mes</span>
        </div>
        <ul class="plan-features">
          ${plan.features.map(feature => `
            <li>
              <span class="feature-name">${feature.name}</span>
              <span class="feature-value">${feature.value}</span>
              ${feature.description ? `
                <span class="feature-description">${feature.description}</span>
              ` : ''}
            </li>
          `).join('')}
        </ul>
      </div>
    `;
  }