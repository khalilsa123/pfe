import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ComptageService } from '../../../services/comptage.service';
import { AuthentificationnServiceService } from '../../../services/authentificationn.service';
import { StockService } from '../../../services/stock.service';
import { Comptage } from '../../../models/comptage.model';
import { User } from '../../../models/user.model';
import { Stock } from '../../../models/stock.model';
import * as XLSX from 'xlsx';

@Component({
  selector: 'app-statistics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './statistics-dashboard.component.html',
  styleUrls: ['./statistics-dashboard.component.scss']
})
export class StatisticsDashboardComponent implements OnInit {
  user?: User;
  comptages: Comptage[] = [];
  stocks: Stock[] = [];

  // Statistiques globales
  totalStockItems = 0;
  totalStockWeight = 0;
  pendingReferences = 0;

  // Statistiques par comptages
  comptage1Count = 0;
  comptage2Count = 0;
  comptage3Count = 0;

  // Nouveaux compteurs Cosse vs Fil par tour
  cosseComptage1Count = 0;
  filComptage1Count   = 0;
  cosseComptage2Count = 0;
  filComptage2Count   = 0;
  cosseComptage3Count = 0;
  filComptage3Count   = 0;

  // Statistiques de progression
  completionPercentage = 0;
  validatedPercentage = 0;
  invalidPercentage = 0;

  // Statistiques de l'utilisateur
  userComptage1Count = 0;
  userComptage2Count = 0;
  userComptage3Count = 0;
  userTotalCount = 0;
  userCompletionPercentage = 0;

  // Représentation unique des références
  uniqueReferences = new Set<string>();
  processedReferences = new Set<string>();
  validatedReferences = new Set<string>();

  isLoading = true;

  constructor(
    private comptageService: ComptageService,
    private authService: AuthentificationnServiceService,
    private stockService: StockService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser() ?? undefined;
    if (!this.user) {
      this.isLoading = false;
      return;
    }
    this.loadData();
  }

  private loadData(): void {
    this.stockService.getAll().subscribe({
      next: (stocks: Stock[]) => {
        this.stocks = stocks;
        this.totalStockItems = stocks.length;
        this.totalStockWeight = stocks.reduce((sum, s) => sum + (s.quantiteTotale || 0), 0);

        // **Utiliser parseReference pour générer les mêmes clés que pour les comptages**
        this.uniqueReferences.clear();
        stocks.forEach(s => {
          if (!s.reference) return;
          const { ref, lot, sousLot } = this.parseReference(s.reference);
          const key = `${ref}$${lot}$${sousLot}`;
          this.uniqueReferences.add(key);
        });

        this.loadComptages();
      },
      error: err => {
        console.error('Erreur chargement stocks', err);
        this.isLoading = false;
      }
    });
  }

  private loadComptages(): void {
    this.comptageService.getAllComptages().subscribe({
      next: (c: Comptage[]) => {
        this.comptages = c;
        this.processComptageData();
        this.isLoading = false;
      },
      error: err => {
        console.error('Erreur chargement comptages', err);
        this.isLoading = false;
      }
    });
  }
  private processComptageData(): void {
    // Réinitialisation
    this.comptage1Count = this.comptage2Count = this.comptage3Count = 0;
    this.cosseComptage1Count = this.filComptage1Count =
    this.cosseComptage2Count = this.filComptage2Count =
    this.cosseComptage3Count = this.filComptage3Count = 0;
    this.userComptage1Count = this.userComptage2Count = this.userComptage3Count = this.userTotalCount = 0;
    this.processedReferences.clear();
    this.validatedReferences.clear();

    const comptagesByRef = new Map<string, Comptage[]>();

    this.comptages.forEach(comptage => {
      if (!comptage.reference) return;

      const parts = comptage.reference.split(/[$#]/);
      if (parts.length < 4) return;

      const ref     = parts[0];
      const lot     = parts[2];
      const sousLot = parts[3];
      const refKey  = `${ref}$${lot}$${sousLot}`;

      if (!comptagesByRef.has(refKey)) {
        comptagesByRef.set(refKey, []);
      }
      comptagesByRef.get(refKey)!.push(comptage);

      // Gestion des comptages par type
      switch (comptage.numComptage) {
        case 1:
          this.comptage1Count++;
          if (comptage.typeMatiere?.trim() === 'Cosse') this.cosseComptage1Count++;
          else if (comptage.typeMatiere?.trim() === 'Fil') this.filComptage1Count++;
          if (comptage.operateurId === this.user?.id) this.userComptage1Count++;
          break;
        case 2:
          this.comptage2Count++;
          if (comptage.typeMatiere?.trim() === 'Cosse') this.cosseComptage2Count++;
          else if (comptage.typeMatiere?.trim() === 'Fil') this.filComptage2Count++;
          if (comptage.operateurId === this.user?.id) this.userComptage2Count++;
          break;
        case 3:
          this.comptage3Count++;
          if (comptage.typeMatiere?.trim() === 'Cosse') this.cosseComptage3Count++;
          else if (comptage.typeMatiere?.trim() === 'Fil') this.filComptage3Count++;
          if (comptage.operateurId === this.user?.id) this.userComptage3Count++;
          break;
      }

      if (comptage.operateurId === this.user?.id) {
        this.userTotalCount++;
      }
    });

    // Validation des références
    comptagesByRef.forEach((list, refKey) => {
      this.processedReferences.add(refKey);
      const c1 = list.find(x => x.numComptage === 1);
      const c2 = list.find(x => x.numComptage === 2);
      const c3 = list.find(x => x.numComptage === 3);

      if (c1 && c2) {
        const diffPct = Math.abs(c1.poids - c2.poids) / Math.max(c1.poids, c2.poids) * 100;
        if (diffPct < 5 || !!c3) {
          this.validatedReferences.add(refKey);
        }
      }
    });

    // Calcul des pourcentages
    const totalRefs = this.uniqueReferences.size;
    const doneRefs  = this.processedReferences.size;
    const valRefs   = this.validatedReferences.size;

    this.pendingReferences = doneRefs - valRefs;
    this.completionPercentage = totalRefs ? doneRefs  / totalRefs * 100 : 0;
    this.validatedPercentage  = totalRefs ? valRefs   / totalRefs * 100 : 0;
    this.invalidPercentage    = totalRefs ? this.pendingReferences / totalRefs * 100 : 0;

    // Progression utilisateur (2 comptages max par article)
    this.userCompletionPercentage = this.totalStockItems
      ? this.userTotalCount / (this.totalStockItems * 2) * 100
      : 0;
  }

  /** Reprend le parsing pour conserver la même logique */
  private parseReference(fullReference: string): {
    ref: string;
    qte: number;
    lot: string;
    sousLot: string;
  } {
    const parts = fullReference.split(/[$#]/);
    return {
      ref:     parts[0]          || '',
      qte:     Number(parts[1]) || 0,
      lot:     parts[2]          || '',
      sousLot: parts[3]          || ''
    };
  }

  exportToExcel(): void {
    const data = [
      {
        Section: 'Informations Utilisateur',
        Nom: `${this.user?.firstname} ${this.user?.lastname}`,
        Rôle: this.user?.role,
        '1er Comptages': this.userComptage1Count,
        '2e Comptages': this.userComptage2Count,
        '3e Comptages': this.userComptage3Count,
        'Total Comptages': this.userTotalCount,
        'Progression (%)': this.userCompletionPercentage.toFixed(0)
      },
      {
        Section: 'Statistiques Globales',
        'Total Articles': this.totalStockItems,
        'Poids Total (g)': this.totalStockWeight,
        'Articles Validés': this.validatedReferences.size,
        'Articles En Attente': this.pendingReferences
      },
      {
        Section: 'Avancement Global',
        'Comptés (%)': this.completionPercentage.toFixed(0),
        'Validés (%)': this.validatedPercentage.toFixed(0),
        'En Attente (%)': this.invalidPercentage.toFixed(0),
        'Non Comptés (%)': (100 - this.completionPercentage).toFixed(0)
      },
      {
        Section: 'Répartition des Comptages',
        '1er Comptage': this.comptage1Count,
        '2e Comptage': this.comptage2Count,
        '3e Comptage': this.comptage3Count
      }
    ];

    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Statistiques');

    // Personnaliser les largeurs des colonnes
    ws['!cols'] = [
      { wch: 20 }, // Section
      { wch: 20 }, // Nom, Total Articles, etc.
      { wch: 15 }, // Rôle
      { wch: 15 }, // 1er Comptages
      { wch: 15 }, // 2e Comptages
      { wch: 15 }, // 3e Comptages
      { wch: 15 }, // Total Comptages
      { wch: 15 }  // Progression
    ];

    XLSX.writeFile(wb, 'Statistiques_OneTech.xlsx');
  }
}