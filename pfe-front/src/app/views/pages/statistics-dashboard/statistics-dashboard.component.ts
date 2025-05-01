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
        this.totalStockWeight = stocks.reduce((total, stock) => total + (stock.quantiteTotale || 0), 0);

        stocks.forEach(stock => {
          if (stock.reference) {
            this.uniqueReferences.add(stock.reference);
          }
        });

        this.loadComptages();
      },
      error: (err: unknown) => {
        console.error('Erreur lors du chargement des stocks', err);
        this.isLoading = false;
      }
    });
  }

  private loadComptages(): void {
    this.comptageService.getAllComptages().subscribe({
      next: (comptages: Comptage[]) => {
        this.comptages = comptages;
        this.processComptageData();
        this.isLoading = false;
      },
      error: (err: unknown) => {
        console.error('Erreur lors du chargement des comptages', err);
        this.isLoading = false;
      }
    });
  }

  private processComptageData(): void {
    // Réinitialiser les compteurs
    this.comptage1Count = 0;
    this.comptage2Count = 0;
    this.comptage3Count = 0;
    this.userComptage1Count = 0;
    this.userComptage2Count = 0;
    this.userComptage3Count = 0;
    this.userTotalCount = 0;
    this.processedReferences.clear();
    this.validatedReferences.clear();

    const comptagesByRef = new Map<string, Comptage[]>();

    this.comptages.forEach(comptage => {
      if (!comptage.reference) return;

      const parts = comptage.reference.split('$');
      if (parts.length < 4) return;

      const ref = parts[0];
      const lot = parts[2];
      const sousLot = parts[3];
      const refKey = `${ref}$${lot}$${sousLot}`;

      if (!comptagesByRef.has(refKey)) {
        comptagesByRef.set(refKey, []);
      }
      comptagesByRef.get(refKey)!.push(comptage);

      if (comptage.numComptage === 1) {
        this.comptage1Count++;
        if (comptage.operateurId === this.user?.id) {
          this.userComptage1Count++;
        }
      } else if (comptage.numComptage === 2) {
        this.comptage2Count++;
        if (comptage.operateurId === this.user?.id) {
          this.userComptage2Count++;
        }
      } else if (comptage.numComptage === 3) {
        this.comptage3Count++;
        if (comptage.operateurId === this.user?.id) {
          this.userComptage3Count++;
        }
      }

      if (comptage.operateurId === this.user?.id) {
        this.userTotalCount++;
      }
    });

    comptagesByRef.forEach((comps, refKey) => {
      this.processedReferences.add(refKey);

      const comptage1 = comps.find(c => c.numComptage === 1);
      const comptage2 = comps.find(c => c.numComptage === 2);
      const comptage3 = comps.find(c => c.numComptage === 3);

      if (comptage1 && comptage2) {
        const poids1 = comptage1.poids || 0;
        const poids2 = comptage2.poids || 0;
        const maxPoids = Math.max(poids1, poids2);
        const difference = maxPoids === 0 ? 0 : Math.abs(poids1 - poids2) / maxPoids * 100;

        if (difference < 5 || comptage3) {
          this.validatedReferences.add(refKey);
        }
      }
    });

    this.pendingReferences = this.processedReferences.size - this.validatedReferences.size;
    this.invalidPercentage = this.uniqueReferences.size > 0 ? (this.pendingReferences / this.uniqueReferences.size) * 100 : 0;

    if (this.uniqueReferences.size > 0) {
      this.completionPercentage = (this.processedReferences.size / this.uniqueReferences.size) * 100;
      this.validatedPercentage = (this.validatedReferences.size / this.uniqueReferences.size) * 100;
    }

    if (this.totalStockItems > 0) {
      this.userCompletionPercentage = (this.userTotalCount / (this.totalStockItems * 2)) * 100;
    }
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