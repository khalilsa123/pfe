import { Component, OnInit, ViewChild, ElementRef, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Modal } from 'bootstrap';
import { ComptageService } from '../../../services/comptage.service';
import { AuthentificationnServiceService } from '../../../services/authentificationn.service';
import { ResultService } from '../../../services/result.service';
import { Comptage } from '../../../models/comptage.model';
import { User } from '../../../models/user.model';
import { StatisticsDashboardComponent } from '../statistics-dashboard/statistics-dashboard.component';
import { ExportDashboardComponent } from '../export-dashboard/export-dashboard.component';
import * as XLSX from 'xlsx';

// Interface pour représenter un résultat de comptage
interface ComptageSummary {
  operatorId: number;
  operatorName: string;
  poids: number;
  date: Date;
  numComptage: number;
  iteration?: number;
}

interface ComptageResult {
  reference: string;  // Format original ref$qte$lot$sous
  lot: string;
  sousLot: string;
  comptage1?: ComptageSummary;
  comptage2?: ComptageSummary;
  comptage3?: ComptageSummary;
  status: 'valid' | 'invalid' | 'needsThird' | 'validWithThird' | 'incomplete';
  difference?: number;  // Différence en pourcentage entre comptage1 et comptage2
  poidsFinal?: number;
  lastUpdate: Date;
}

@Component({
  selector: 'app-resultat-comptage',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    StatisticsDashboardComponent,
   // ExportDashboardComponent
  ],
  templateUrl: './resultat-comptage.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./resultat-comptage.component.scss']
})
export class ResultatComptageComponent implements OnInit {
  @ViewChild('statisticsModal') statisticsModal!: ElementRef;
  @ViewChild('exportModal') exportModal!: ElementRef;
  @ViewChild('previewModal') previewModal!: ElementRef;
  
  user?: User;
  isAdmin = false;
  canDoThirdCount = false;
  comptages: Comptage[] = [];
  comptageResults: ComptageResult[] = [];
  filteredResults: ComptageResult[] = [];
  previewResults: any[] = []; // For preview table
  
  // Filters and sorting
  searchTerm = '';
  sortAscending = false;
  currentStatusFilter: 'all' | 'valid' | 'invalid' | 'needsThird' = 'all';
  
  // Export options for the Imprimer button
  includeOperatorNames = true; // Default to true
  selectedExportType: string | null = null; // To track the export type for preview
  
  // Menu variables from OperatorDashboardComponent
  showProfile = false;
  showUsersMenu = false;
  showInventoryManagement = false;
  showSessionInventaire = false;
  showCreateSessionForm = false;
  showCountingDropdown = false;
  showAllCounting = false;
  showCountingType1 = false;
  showCountingType2 = false;
  showCountingType3 = false;
  activeButton: 'inventory' | 'session-inventaire' | 'counting' | 'users' | 'results' | null = 'results';
  currentUsersRole?: 'OPERATEUR' | 'SUPERVISEUR';
  users: User[] = [];
  
  // Modal references
  private statsModal?: Modal;
  private expModal?: Modal;
  private prevModal?: Modal;

  // Cache for operators
  private operatorsCache: Map<number, User | undefined> = new Map();

  constructor(
    private comptageService: ComptageService,
    private authService: AuthentificationnServiceService,
    private resultService: ResultService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getCurrentUser() || undefined;
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Définir les permissions
    this.isAdmin = this.user.role === 'ADMIN';
    this.canDoThirdCount = this.user.role === 'SUPERVISEUR' || this.user.role === 'ADMIN';
    
    // Charger les données
    this.loadComptages();
  }
  
  ngAfterViewInit(): void {
    // Initialiser les modals Bootstrap
    if (this.statisticsModal) {
      this.statsModal = new Modal(this.statisticsModal.nativeElement);
    }
    if (this.exportModal) {
      this.expModal = new Modal(this.exportModal.nativeElement);
    }
    if (this.previewModal) {
      this.prevModal = new Modal(this.previewModal.nativeElement);
    }
  }

  // Menu methods from OperatorDashboardComponent
  getUserInitials(): string {
    if (!this.user) return '';
    return (
      (this.user.firstname?.charAt(0) || '') + 
      (this.user.lastname?.charAt(0) || '')
    ).toUpperCase();
  }

  toggleInventoryManagement(): void {
    this.router.navigate(['/operator-dashboard']);
  }

  toggleSessionInventaire(): void {
    this.router.navigate(['/operator-dashboard'], { queryParams: { view: 'session-inventaire' } });
  }

  toggleCountingDropdown(): void {
    if (this.activeButton === 'counting' && this.showCountingDropdown) {
      this.showCountingDropdown = false;
      this.closeAllCountingPanels();
      this.activeButton = null;
    } else {
      this.showCountingDropdown = true;
      this.activeButton = 'counting';
    }
  }
  
  private closeAllCountingPanels(): void {
    this.showAllCounting = false;
    this.showCountingType1 = false;
    this.showCountingType2 = false;
    this.showCountingType3 = false;
  }
  
  showCountingList(type: 'all' | 1 | 2 | 3): void {
    this.router.navigate(['/operator-dashboard'], { 
      queryParams: { view: 'counting', type: type } 
    });
  }
  
  goToResultsPage(): void {
    // Already on results page
  }
  
  loadUsers(role: 'OPERATEUR' | 'SUPERVISEUR'): void {
    this.router.navigate(['/operator-dashboard'], { 
      queryParams: { view: 'users', role: role } 
    });
  }
  
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  // Extraction de référence de la chaîne complète
  extractReference(fullReference: string): string {
    if (!fullReference) return '';
    // Séparer par $ et prendre la première partie
    const parts = fullReference.split('$');
    return parts[0] || fullReference;
  }

  loadComptages(): void {
    this.comptageService.getAllComptages().subscribe({
      next: raw => {
        this.comptages = raw;
        this.processComptageData();
      },
      error: err => {
        console.error('Erreur chargement comptages:', err);
        if (err.status === 401) {
          this.authService.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }
  
  processComptageData(): void {
    // Grouper les comptages par référence (ref$lot$sous)
    const comptageGroups = new Map<string, Comptage[]>();
    
    this.comptages.forEach(comptage => {
      // Format de référence original: ref$qte$lot$sous
      const parts = comptage.reference.split('$');
      if (parts.length < 4) return;
      
      // Créer une clé composite ref$lot$sous pour le groupement
      const ref = parts[0];
      const lot = parts[2];
      const sousLot = parts[3];
      const groupKey = `${ref}${lot}${sousLot}`;
      
      if (!comptageGroups.has(groupKey)) {
        comptageGroups.set(groupKey, []);
      }
      
      comptageGroups.get(groupKey)!.push(comptage);
    });
    
    // Créer les résultats de comptage
    this.comptageResults = [];
    
    comptageGroups.forEach((comptages, groupKey) => {
      // Trier par numComptage pour faciliter le traitement
      comptages.sort((a, b) => a.numComptage - b.numComptage);
      
      // Extraire les informations de référence
      const parts = comptages[0].reference.split('$');
      const reference = comptages[0].reference;
      const lot = parts[2] || '';
      const sousLot = parts[3] || '';
      
      // Préparer les données de chaque comptage
      const comptage1 = comptages.find(c => c.numComptage === 1);
      const comptage2 = comptages.find(c => c.numComptage === 2);
      const comptage3 = comptages.find(c => c.numComptage === 3);
      
      let comp1Summary: ComptageSummary | undefined;
      let comp2Summary: ComptageSummary | undefined;
      let comp3Summary: ComptageSummary | undefined;
      
      // Trouver les informations d'opérateur pour chaque comptage
      if (comptage1) {
        const operator = this.findOperator(comptage1.operateurId!);
        comp1Summary = {
          operatorId: comptage1.operateurId!,
          operatorName: operator ? `${operator.firstname} ${operator.lastname}` : `Opérateur #${comptage1.operateurId}`,
          poids: comptage1.poids,
          date: new Date(comptage1.timestamp!),
          numComptage: comptage1.numComptage,
          iteration: comptage1.iteration
        };
      }
      
      if (comptage2) {
        const operator = this.findOperator(comptage2.operateurId!);
        comp2Summary = {
          operatorId: comptage2.operateurId!,
          operatorName: operator ? `${operator.firstname} ${operator.lastname}` : `Opérateur #${comptage2.operateurId}`,
          poids: comptage2.poids,
          date: new Date(comptage2.timestamp!),
          numComptage: comptage2.numComptage,
          iteration: comptage2.iteration
        };
      }
      
      if (comptage3) {
        const operator = this.findOperator(comptage3.operateurId!);
        comp3Summary = {
          operatorId: comptage3.operateurId!,
          operatorName: operator ? `${operator.firstname} ${operator.lastname}` : `Opérateur #${comptage3.operateurId}`,
          poids: comptage3.poids,
          date: new Date(comptage3.timestamp!),
          numComptage: comptage3.numComptage,
          iteration: comptage3.iteration
        };
      }
      
      // Calculer le statut et la différence
      let status: 'valid' | 'invalid' | 'needsThird' | 'validWithThird' | 'incomplete' = 'incomplete';
      let difference: number | undefined;
      let poidsFinal: number | undefined;
      
      // Si les deux premiers comptages existent
      if (comp1Summary && comp2Summary) {
        const poids1 = comp1Summary.poids;
        const poids2 = comp2Summary.poids;
        const maxPoids = Math.max(poids1, poids2);
        
        // Calcul de la différence en pourcentage
        difference = maxPoids === 0 ? 0 : Math.abs(poids1 - poids2) / maxPoids * 100;
        
        if (difference < 5) {
          // Moins de 5% de différence => valide
          status = 'valid';
          poidsFinal = Math.min(poids1, poids2);
        } else {
          // Plus de 5% de différence
          if (comp3Summary) {
            // Si 3ème comptage existe => valide avec le 3ème
            status = 'validWithThird';
            poidsFinal = comp3Summary.poids;
          } else {
            // Sinon => besoin d'un 3ème comptage
            status = 'needsThird';
          }
        }
      } else {
        // Comptage incomplet (manque comptage1 ou comptage2)
        status = 'incomplete';
      }
      
      // Trouver la date de dernière mise à jour
      const dates = [
        comp1Summary?.date, 
        comp2Summary?.date, 
        comp3Summary?.date
      ].filter(d => d !== undefined) as Date[];
      
      const lastUpdate = dates.length > 0 
        ? new Date(Math.max(...dates.map(d => d.getTime())))
        : new Date();
      
      // Créer l'objet résultat
      const result: ComptageResult = {
        reference,
        lot,
        sousLot,
        comptage1: comp1Summary,
        comptage2: comp2Summary,
        comptage3: comp3Summary,
        status,
        difference,
        poidsFinal,
        lastUpdate
      };
      
      this.comptageResults.push(result);
    });
    
    // Appliquer les filtres initiaux
    this.applyFilters();
  }
  
  // Méthode pour trouver un opérateur dans le cache
  private findOperator(operatorId: number): User | undefined {
    if (!this.operatorsCache.has(operatorId)) {
      // Si l'opérateur n'est pas dans le cache, on le met à undefined
      // Dans une version future, on pourrait implémenter un chargement à la demande
      this.operatorsCache.set(operatorId, undefined);
    }
    return this.operatorsCache.get(operatorId);
  }

  getComptageTypeName(numComptage: number): string {
    switch(numComptage) {
      case 1:
        return 'Premier comptage';
      case 2:
        return 'Deuxième comptage';
      case 3:
        return 'Troisième comptage';
      default:
        return `Comptage ${numComptage}`;
    }
  }

  // Méthodes de filtrage et tri
  applyFilters(): void {
    let results = [...this.comptageResults];
    
    // Filtre par recherche
    if (this.searchTerm) {
      const searchTermLower = this.searchTerm.toLowerCase();
      results = results.filter(result => 
        result.reference.toLowerCase().includes(searchTermLower) ||
        result.lot.toLowerCase().includes(searchTermLower) ||
        result.sousLot.toLowerCase().includes(searchTermLower)
      );
    }
    
    // Filtre par statut
    if (this.currentStatusFilter !== 'all') {
      switch(this.currentStatusFilter) {
        case 'valid':
          results = results.filter(r => r.status === 'valid' || r.status === 'validWithThird');
          break;
        case 'invalid':
          results = results.filter(r => r.status === 'incomplete');
          break;
        case 'needsThird':
          results = results.filter(r => r.status === 'needsThird');
          break;
      }
    }
    
    // Tri par date
    results.sort((a, b) => {
      const dateA = a.lastUpdate.getTime();
      const dateB = b.lastUpdate.getTime();
      return this.sortAscending ? dateA - dateB : dateB - dateA;
    });
    
    this.filteredResults = results;
  }
  
  filterByStatus(status: 'all' | 'valid' | 'invalid' | 'needsThird'): void {
    this.currentStatusFilter = status;
    this.applyFilters();
  }
  
  toggleSortOrder(): void {
    this.sortAscending = !this.sortAscending;
    this.applyFilters();
  }
  
  // Méthodes pour les classes et textes de statut
  getStatusClass(status: string): string {
    switch(status) {
      case 'valid':
        return 'status-valid';
      case 'validWithThird':
        return 'status-valid-third';
      case 'needsThird':
        return 'status-needs-third';
      case 'incomplete':
        return 'status-incomplete';
      case 'invalid':
        return 'status-invalid';
      default:
        return '';
    }
  }
  
  getStatusText(status: string): string {
    switch(status) {
      case 'valid':
        return 'Valide';
      case 'validWithThird':
        return 'Validé (3e comptage)';
      case 'needsThird':
        return 'Besoin 3e comptage';
      case 'incomplete':
        return 'Incomplet';
      case 'invalid':
        return 'Invalide';
      default:
        return status;
    }
  }
  
  // Actions sur les comptages
  doThirdCount(result: ComptageResult): void {
    // Naviguer vers la page de comptage avec les informations pré-remplies
    this.router.navigate(['/operator-dashboard'], { 
      queryParams: { 
        reference: result.reference,
        numComptage: 3
      }
    });
  }
  
  validateFinalCount(result: ComptageResult): void {
    // Valider le comptage final (fonctionnalité pour les administrateurs)
    console.log('Validation du comptage final pour', result.reference);
    // Implémenter la logique réelle selon votre API
  }
  
  // Méthodes pour afficher les modaux
  showStatistics(): void {
    this.statsModal?.show();
  }
  
  showPreview(exportType: string): void {
    this.selectedExportType = exportType;
    this.previewResults = this.preparePreviewData(exportType);
    this.prevModal?.show();
  }

  // Prepare data for preview based on export type
  preparePreviewData(exportType: string): any[] {
    let resultsToPreview = [...this.comptageResults];
    const previewData: any[] = [];

    switch (exportType) {
      case 'valid':
        resultsToPreview = resultsToPreview.filter(r => r.status === 'valid' || r.status === 'validWithThird');
        break;
      case 'invalid':
        resultsToPreview = resultsToPreview.filter(r => r.status === 'incomplete');
        break;
      case 'needsThird':
        resultsToPreview = resultsToPreview.filter(r => r.status === 'needsThird');
        break;
      case 'incomplete':
        resultsToPreview = resultsToPreview.filter(r => r.status === 'incomplete');
        break;
      case 'comptage1':
        resultsToPreview = resultsToPreview.filter(r => !!r.comptage1);
        break;
      case 'comptage2':
        resultsToPreview = resultsToPreview.filter(r => !!r.comptage2);
        break;
      case 'comptage3':
        resultsToPreview = resultsToPreview.filter(r => !!r.comptage3);
        break;
      case 'comptageFinal':
        resultsToPreview = resultsToPreview.filter(r => r.status === 'valid' || r.status === 'validWithThird');
        break;
      case 'all':
      default:
        break;
    }

    if (exportType === 'comptage1') {
      resultsToPreview.forEach(result => {
        previewData.push({
          type: 'Premier Comptage',
          reference: this.extractReference(result.reference),
          lot: result.lot,
          sousLot: result.sousLot,
          poids: result.comptage1?.poids || '-',
          operator: this.includeOperatorNames ? (result.comptage1?.operatorName || '-') : (result.comptage1?.operatorId || '-'),
          date: result.comptage1?.date.toLocaleString() || '-'
        });
      });
    } else if (exportType === 'comptage2') {
      resultsToPreview.forEach(result => {
        previewData.push({
          type: 'Deuxième Comptage',
          reference: this.extractReference(result.reference),
          lot: result.lot,
          sousLot: result.sousLot,
          poids: result.comptage2?.poids || '-',
          operator: this.includeOperatorNames ? (result.comptage2?.operatorName || '-') : (result.comptage2?.operatorId || '-'),
          date: result.comptage2?.date.toLocaleString() || '-'
        });
      });
    } else if (exportType === 'comptage3') {
      resultsToPreview.forEach(result => {
        previewData.push({
          type: 'Troisième Comptage',
          reference: this.extractReference(result.reference),
          lot: result.lot,
          sousLot: result.sousLot,
          poids: result.comptage3?.poids || '-',
          operator: this.includeOperatorNames ? (result.comptage3?.operatorName || '-') : (result.comptage3?.operatorId || '-'),
          date: result.comptage3?.date.toLocaleString() || '-'
        });
      });
    } else if (exportType === 'comptageFinal') {
      resultsToPreview.forEach(result => {
        previewData.push({
          type: 'Résultat Final',
          reference: this.extractReference(result.reference),
          lot: result.lot,
          sousLot: result.sousLot,
          poids: result.poidsFinal || '-',
          operator: '-',
          date: result.lastUpdate.toLocaleString()
        });
      });
    } else {
      resultsToPreview.forEach(result => {
        if (result.comptage1) {
          previewData.push({
            type: 'Premier Comptage',
            reference: this.extractReference(result.reference),
            lot: result.lot,
            sousLot: result.sousLot,
            poids: result.comptage1.poids,
            operator: this.includeOperatorNames ? result.comptage1.operatorName : result.comptage1.operatorId,
            date: result.comptage1.date.toLocaleString(),
            status: this.getStatusText(result.status)
          });
        }
        if (result.comptage2) {
          previewData.push({
            type: 'Deuxième Comptage',
            reference: this.extractReference(result.reference),
            lot: result.lot,
            sousLot: result.sousLot,
            poids: result.comptage2.poids,
            operator: this.includeOperatorNames ? result.comptage2.operatorName : result.comptage2.operatorId,
            date: result.comptage2.date.toLocaleString(),
            status: this.getStatusText(result.status)
          });
        }
        if (result.comptage3) {
          previewData.push({
            type: 'Troisième Comptage',
            reference: this.extractReference(result.reference),
            lot: result.lot,
            sousLot: result.sousLot,
            poids: result.comptage3.poids,
            operator: this.includeOperatorNames ? result.comptage3.operatorName : result.comptage3.operatorId,
            date: result.comptage3.date.toLocaleString(),
            status: this.getStatusText(result.status)
          });
        }
        if (!result.comptage1 && (result.status === 'incomplete')) {
          previewData.push({
            type: 'Résultat Final',
            reference: this.extractReference(result.reference),
            lot: result.lot,
            sousLot: result.sousLot,
            poids: '-',
            operator: '-',
            date: result.lastUpdate.toLocaleString(),
            status: this.getStatusText(result.status)
          });
        }
      });
    }

    return previewData;
  }

  // Export to Excel after preview
  exportToExcel(): void {
    if (!this.selectedExportType) return;

    let data: any[] = [];
    let filename = 'Resultats_Comptage';
    let sheetName = 'Résultats';

    // Use the same filtered data as the preview
    let resultsToExport = [...this.comptageResults];
    switch (this.selectedExportType) {
      case 'valid':
        resultsToExport = resultsToExport.filter(r => r.status === 'valid' || r.status === 'validWithThird');
        filename += '_Valides';
        sheetName = 'Validés';
        break;
      case 'invalid':
        resultsToExport = resultsToExport.filter(r => r.status === 'incomplete');
        filename += '_Invalides';
        sheetName = 'Invalides';
        break;
      case 'needsThird':
        resultsToExport = resultsToExport.filter(r => r.status === 'needsThird');
        filename += '_Besoin3eComptage';
        sheetName = 'Besoin 3e Comptage';
        break;
      case 'incomplete':
        resultsToExport = resultsToExport.filter(r => r.status === 'incomplete');
        filename += '_Incomplets';
        sheetName = 'Incomplets';
        break;
      case 'comptage1':
        resultsToExport = resultsToExport.filter(r => !!r.comptage1);
        filename += '_Comptage1';
        sheetName = 'Comptage 1';
        break;
      case 'comptage2':
        resultsToExport = resultsToExport.filter(r => !!r.comptage2);
        filename += '_Comptage2';
        sheetName = 'Comptage 2';
        break;
      case 'comptage3':
        resultsToExport = resultsToExport.filter(r => !!r.comptage3);
        filename += '_Comptage3';
        sheetName = 'Comptage 3';
        break;
      case 'comptageFinal':
        resultsToExport = resultsToExport.filter(r => r.status === 'valid' || r.status === 'validWithThird');
        filename += '_ComptageFinal';
        sheetName = 'Comptage Final';
        break;
      case 'all':
      default:
        filename += '_Complet';
        break;
    }

    // Prepare data for export
    if (this.selectedExportType === 'comptage1') {
      data = resultsToExport.map(result => ({
        Référence: this.extractReference(result.reference),
        Lot: result.lot,
        'Sous-lot': result.sousLot,
        'Poids Comptage 1 (g)': result.comptage1?.poids || '-',
        'Opérateur Comptage 1': this.includeOperatorNames ? (result.comptage1?.operatorName || '-') : (result.comptage1?.operatorId || '-'),
        'Date Comptage 1': result.comptage1?.date.toLocaleString() || '-'
      }));
    } else if (this.selectedExportType === 'comptage2') {
      data = resultsToExport.map(result => ({
        Référence: this.extractReference(result.reference),
        Lot: result.lot,
        'Sous-lot': result.sousLot,
        'Poids Comptage 2 (g)': result.comptage2?.poids || '-',
        'Opérateur Comptage 2': this.includeOperatorNames ? (result.comptage2?.operatorName || '-') : (result.comptage2?.operatorId || '-'),
        'Date Comptage 2': result.comptage2?.date.toLocaleString() || '-'
      }));
    } else if (this.selectedExportType === 'comptage3') {
      data = resultsToExport.map(result => ({
        Référence: this.extractReference(result.reference),
        Lot: result.lot,
        'Sous-lot': result.sousLot,
        'Poids Comptage 3 (g)': result.comptage3?.poids || '-',
        'Opérateur Comptage 3': this.includeOperatorNames ? (result.comptage3?.operatorName || '-') : (result.comptage3?.operatorId || '-'),
        'Date Comptage 3': result.comptage3?.date.toLocaleString() || '-'
      }));
    } else if (this.selectedExportType === 'comptageFinal') {
      data = resultsToExport.map(result => ({
        Référence: this.extractReference(result.reference),
        Lot: result.lot,
        'Sous-lot': result.sousLot,
        'Poids Final (g)': result.poidsFinal || '-',
        'Dernière Mise à Jour': result.lastUpdate.toLocaleString()
      }));
    } else {
      data = resultsToExport.flatMap(result => {
        const rows: any[] = [];
        if (result.comptage1) {
          rows.push({
            'Type de comptage': 'Premier Comptage',
            Référence: this.extractReference(result.reference),
            Lot: result.lot,
            'Sous-lot': result.sousLot,
            'Poids (g)': result.comptage1.poids,
            Opérateur: this.includeOperatorNames ? result.comptage1.operatorName : result.comptage1.operatorId,
            'Poids Final (g)': result.poidsFinal || '-',
            Date: result.comptage1.date.toLocaleString(),
            Statut: this.getStatusText(result.status)
          });
        }
        if (result.comptage2) {
          rows.push({
            'Type de comptage': 'Deuxième Comptage',
            Référence: this.extractReference(result.reference),
            Lot: result.lot,
            'Sous-lot': result.sousLot,
            'Poids (g)': result.comptage2.poids,
            Opérateur: this.includeOperatorNames ? result.comptage2.operatorName : result.comptage2.operatorId,
            'Poids Final (g)': result.poidsFinal || '-',
            Date: result.comptage2.date.toLocaleString(),
            Statut: this.getStatusText(result.status)
          });
        }
        if (result.comptage3) {
          rows.push({
            'Type de comptage': 'Troisième Comptage',
            Référence: this.extractReference(result.reference),
            Lot: result.lot,
            'Sous-lot': result.sousLot,
            'Poids (g)': result.comptage3.poids,
            Opérateur: this.includeOperatorNames ? result.comptage3.operatorName : result.comptage3.operatorId,
            'Poids Final (g)': result.poidsFinal || '-',
            Date: result.comptage3.date.toLocaleString(),
            Statut: this.getStatusText(result.status)
          });
        }
        if (!result.comptage1 && (result.status === 'incomplete')) {
          rows.push({
            'Type de comptage': 'Résultat Final',
            Référence: this.extractReference(result.reference),
            Lot: result.lot,
            'Sous-lot': result.sousLot,
            'Poids (g)': '-',
            Opérateur: '-',
            'Poids Final (g)': '-',
            Date: result.lastUpdate.toLocaleString(),
            Statut: this.getStatusText(result.status)
          });
        }
        return rows;
      });
    }

    // Generate Excel file
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(data);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, sheetName);

    // Set column widths
    if (this.selectedExportType === 'comptage1') {
      ws['!cols'] = [
        { wch: 15 }, // Référence
        { wch: 10 }, // Lot
        { wch: 10 }, // Sous-lot
        { wch: 20 }, // Poids Comptage 1
        { wch: this.includeOperatorNames ? 20 : 15 }, // Opérateur Comptage 1
        { wch: 25 }  // Date Comptage 1
      ];
    } else if (this.selectedExportType === 'comptage2') {
      ws['!cols'] = [
        { wch: 15 }, // Référence
        { wch: 10 }, // Lot
        { wch: 10 }, // Sous-lot
        { wch: 20 }, // Poids Comptage 2
        { wch: this.includeOperatorNames ? 20 : 15 }, // Opérateur Comptage 2
        { wch: 25 }  // Date Comptage 2
      ];
    } else if (this.selectedExportType === 'comptage3') {
      ws['!cols'] = [
        { wch: 15 }, // Référence
        { wch: 10 }, // Lot
        { wch: 10 }, // Sous-lot
        { wch: 20 }, // Poids Comptage 3
        { wch: this.includeOperatorNames ? 20 : 15 }, // Opérateur Comptage 3
        { wch: 25 }  // Date Comptage 3
      ];
    } else if (this.selectedExportType === 'comptageFinal') {
      ws['!cols'] = [
        { wch: 15 }, // Référence
        { wch: 10 }, // Lot
        { wch: 10 }, // Sous-lot
        { wch: 20 }, // Poids Final
        { wch: 25 }  // Dernière Mise à Jour
      ];
    } else {
      ws['!cols'] = [
        { wch: 20 }, // Type de comptage
        { wch: 15 }, // Référence
        { wch: 10 }, // Lot
        { wch: 10 }, // Sous-lot
        { wch: 15 }, // Poids (g)
        { wch: this.includeOperatorNames ? 20 : 15 }, // Opérateur
        { wch: 15 }, // Poids Final (g)
        { wch: 25 }, // Date
        { wch: 20 }  // Statut
      ];
    }

    XLSX.writeFile(wb, `${filename}.xlsx`);
    this.prevModal?.hide();
  }
}