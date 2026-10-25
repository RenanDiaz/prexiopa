import styles from '../App.module.css';
import { Link } from '../router';

// F8 — Exportar a CSV (CA8.1): dos descargas manuales; en el teléfono se guardan en Archivos.
export function Export() {
  return (
    <>
      <h2 className={styles.subtitle}>Exportar</h2>
      <p>Descarga todas tus compras y sus líneas en CSV y guárdalas en Archivos.</p>
      <p className={styles.muted}>
        Úsalo para el detalle de lo comprado, no para sumar tu gasto del mes: estas compras también salen en los
        cargos de tu tarjeta.
      </p>
      <div className={styles.actions}>
        <a className={styles.primary} href="/api/export/compras.csv" download>
          Compras
        </a>
        <a className={styles.button} href="/api/export/lineas.csv" download>
          Líneas
        </a>
      </div>
      <div className={styles.secondaryLinks}>
        <Link href="/">Volver</Link>
      </div>
    </>
  );
}
