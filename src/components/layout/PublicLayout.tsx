import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';
import styles from './PublicLayout.module.css';
import { RouteMetadata } from '../RouteMetadata';
import { ConnectionBanner } from '../ConnectionBanner';

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className={styles.layout}>
      <RouteMetadata />
      <Navbar />
      <ConnectionBanner />
      <main className={styles.mainContent}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
