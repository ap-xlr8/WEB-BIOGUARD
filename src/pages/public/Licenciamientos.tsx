import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Check } from 'lucide-react';
import { Logo } from '../../components/ui/Logo';
import { Button, LoadingSpinner, EmptyState } from '../../components/ui';
import { PublicLayout } from '../../components/layout';
import { planService } from '../../services';
import { PlanResponse } from '../../types';
import { ROUTES } from '../../constants';
import styles from './Licenciamientos.module.css';

export default function LicenciamientosPage() {
  const navigate = useNavigate();
  const [plans, setPlans] = useState<PlanResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanResponse | null>(null);

  useEffect(() => {
    planService
      .listar()
      .then((data) => {
        setPlans(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError('No fue posible consultar los planes vigentes. Intenta nuevamente.');
        setPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const getDisplayPrice = (plan: PlanResponse) => plan.nombre === 'Gratis' ? 0 : plan.precio;

  const handleContinue = () => {
    if (!selectedPlan) return;
    navigate(ROUTES.CHECKOUT, { state: { plan: selectedPlan } });
  };

  return (
    <PublicLayout>
      <div className={styles.licenciamientosContainer}>
        <div className={styles.hero}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16 }}>
            <Logo size={48} showText={false} />
          </div>
          <h1 className={styles.heroTitle}>
            Planes de BioGuard
          </h1>
          <p className={styles.heroText}>
            Consulta los precios, límites y funciones publicados por el servicio de planes. No mostramos precios de respaldo ni información estimada.
          </p>
        </div>

        <p className={styles.chooseTitle}>Elige tu nivel de protección</p>

        {loading && <LoadingSpinner />}

        {error && <div className={styles.errorBox}>{error}</div>}

        {!loading && plans.length === 0 && (
          <EmptyState title="No hay planes disponibles" description="Intenta de nuevo más tarde." />
        )}

        {!loading && plans.length > 0 && (
          <>
            <div className={styles.plansGrid}>
              {plans.map((plan, idx) => {
                const price = getDisplayPrice(plan);
                const isRecommended = idx === 2;
                return (
                  <div
                    key={plan.id}
                    className={`${styles.planCard} ${
                      selectedPlan?.id === plan.id ? styles.planCardSelected : ''
                    } ${isRecommended ? styles.planCardRecommended : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan(plan)}
                  >
                    {isRecommended && (
                      <div className={styles.recommendedBadge}>Recomendado</div>
                    )}
                    <div className={styles.planCategory}>
                      {plan.nombre === 'Gratis' ? 'Básico' : plan.nombre === 'Familiar' ? 'Familiar' : 'Profesional'}
                    </div>
                    <div className={styles.planName}>{plan.nombre}</div>
                    <div className={styles.planPrice}>
                      <span className={styles.planAmount}>
                        {price === 0 ? 'Gratis' : `$${price}`}
                      </span>
                      {price > 0 && (
                        <span className={styles.planPeriod}>
                          /mes
                        </span>
                      )}
                    </div>
                    <ul className={styles.planFeatures}>
                      <li className={styles.planFeature}>
                        <Check className={styles.planFeatureIcon} size={16} />
                        {plan.limitePacientes} paciente{plan.limitePacientes !== 1 ? 's' : ''}
                      </li>
                      <li className={styles.planFeature}>
                        <Check className={styles.planFeatureIcon} size={16} />
                        {plan.limiteCuidadores} cuidadores
                      </li>
                      <li className={styles.planFeature}>
                        <Check className={styles.planFeatureIcon} size={16} />
                        Historial {plan.diasHistorial} días
                      </li>
                      {plan.gpsContinuo && (
                        <li className={styles.planFeature}>
                          <Check className={styles.planFeatureIcon} size={16} />
                          GPS continuo
                        </li>
                      )}
                      {plan.aiConsole && (
                        <li className={styles.planFeature}>
                          <Check className={styles.planFeatureIcon} size={16} />
                          Consola IA
                        </li>
                      )}
                      <li className={styles.planFeature}>
                        <Check className={styles.planFeatureIcon} size={16} />
                        Alertas inteligentes
                      </li>
                    </ul>
                  </div>
                );
              })}
            </div>

            {selectedPlan && (
              <div className={`${styles.summary} animate-slide-up`}>
                <div className={styles.summaryInfo}>
                  <span className={styles.summaryLabel}>Plan seleccionado</span>
                  <span className={styles.summaryPlan}>{selectedPlan.nombre}</span>
                </div>
                <div className={styles.summaryPrice}>
                  {getDisplayPrice(selectedPlan) === 0
                    ? 'Gratis'
                    : `$${getDisplayPrice(selectedPlan)}/mes`}
                </div>
                <Button
                  size="lg"
                  onClick={handleContinue}
                  disabled={!selectedPlan}
                >
                  Continuar al pago
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </PublicLayout>
  );
}
