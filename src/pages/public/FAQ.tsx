import { useState } from 'react';
import { PublicLayout } from '../../components/layout';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import styles from './Public.module.css';

interface FAQItem {
  q: string;
  a: string;
}

const faqs: FAQItem[] = [
  {
    q: '¿Qué es BioGuard y cómo estima el riesgo metabólico?',
    a: 'BioGuard registra las señales que el wearable y sus APIs públicas ponen a disposición, las conserva en el móvil y permite consultar el histórico sincronizado. No es un dispositivo de medición clínica directa ni sustituye el diagnóstico profesional.',
  },
  {
    q: '¿BioGuard reemplaza a un glucómetro tradicional?',
    a: 'No. BioGuard no realiza mediciones directas de glucosa en sangre ni reemplaza a glucómetros ni sensores CGM (monitores continuos de glucosa). El sistema funciona de manera preventiva para advertir patrones metabólicos de riesgo de manera pasiva.',
  },
  {
    q: '¿Qué es el modo Guardián Nocturno?',
    a: 'Es un flujo de alerta preventiva basado en las señales disponibles. Su funcionamiento depende de permisos, batería, conexión local y configuración de notificaciones, por lo que no sustituye a los servicios de emergencia.',
  },
  {
    q: '¿Cómo viajan los datos desde el reloj hasta la Web?',
    a: 'El reloj entrega las lecturas al móvil mediante Bluetooth. El móvil las guarda localmente y, cuando tiene Internet, sincroniza los registros pendientes con el backend. La Web consulta ese histórico autorizado; no se conecta directamente al wearable.',
  },
  {
    q: '¿Qué formas de pago soporta la plataforma?',
    a: 'La Web solicita al backend una sesión de pago alojada por el procesador configurado. Los medios disponibles y el precio final se confirman en esa sesión; BioGuard no captura números de tarjeta en sus propios formularios.',
  },
  {
    q: '¿Qué pasa con mis datos de localización GPS?',
    a: 'La ubicación solo debe consultarse por usuarios autorizados y a través del backend. Su disponibilidad depende de permisos y del plan contratado; BioGuard evita afirmar cifrado de extremo a extremo cuando ese control no puede verificarse desde el navegador.',
  },
];

export default function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <PublicLayout>
      <div className={styles.content}>
        <div className={styles.heroSection}>
          <div className={styles.heroIcon}><HelpCircle size={28} /></div>
          <h1>Preguntas Frecuentes</h1>
          <p>Encuentra respuestas rápidas sobre cómo usar la plataforma, compatibilidad de dispositivos y seguridad.</p>
        </div>

        <div className={styles.faqList}>
          {faqs.map((faq, i) => (
            <div key={faq.q} className={`${styles.faqItem} ${openIndex === i ? styles.faqOpen : ''}`}>
              <button
                type="button"
                className={styles.faqQuestion}
                onClick={() => toggle(i)}
                aria-expanded={openIndex === i}
                aria-controls={`faq-answer-${i}`}
              >
                <span>{faq.q}</span>
                {openIndex === i ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </button>
              {openIndex === i && <div id={`faq-answer-${i}`} className={styles.faqAnswer}>{faq.a}</div>}
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
