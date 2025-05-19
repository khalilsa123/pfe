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
  reference: string; // Format original ref$qte$lot$sous
  lot: string;
  sousLot: string;
  typeMatiere?: string;
  comptage1?: ComptageSummary;
  comptage2?: ComptageSummary;
  comptage3?: ComptageSummary;
  status: 'valid' | 'needsThird' | 'validWithThird' | 'incomplete'; // Statuts simplifiés
  difference?: number; // Différence en pourcentage entre comptage1 et comptage2
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

  // Pagination properties
  itemsPerPage = 10; // Nombre d'éléments par page
  currentPage = 1;   // Page courante
  totalPages = 1;    // Nombre total de pages
  paginatedResults: ComptageResult[] = []; // Résultats de la page courante
  pageSizeOptions = [5, 10, 20, 50]; // Options pour le nombre d'éléments par page

  // Nouvelles propriétés pour la sélection d'opérateur
  selectedResultForThirdCount: ComptageResult | null = null;
  showOperatorsList = false;
  availableOperators: User[] = [];

  // Filters and sorting
  searchTerm = '';
  sortAscending = false;
  currentStatusFilter: 'all' | 'valid' | 'needsThird' = 'all';

  // Export options for the Imprimer button
  includeOperatorNames = true; // Default to true
  includeCoseMatiere = true;
  includeFileMatiere = true;
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

  // Expose Math for template
  Math = Math;

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

  parseReference(fullReference: string): { ref: string; qte: string; lot: string; sousLot: string } {
    if (!fullReference) {
      return { ref: '', qte: '', lot: '', sousLot: '' };
    }

    // Essayer d'abord avec le séparateur $
    let parts = fullReference.split('$');

    // S'il n'y a pas assez de parties, essayer avec #
    if (parts.length < 2) {
      parts = fullReference.split('#');
    }

    return {
      ref: parts[0] || '',
      qte: parts[1] || '0',
      lot: parts.length > 2 ? parts[2] : '000',
      sousLot: parts.length > 3 ? parts[3] : '001'
    };
  }

  processComptageData(): void {
    // Vérifier si nous avons des comptages à traiter
    if (!this.comptages || this.comptages.length === 0) {
      console.log('Aucun comptage à traiter');
      this.comptageResults = [];
      this.filteredResults = [];
      this.paginatedResults = [];
      return;
    }

    console.log(`Traitement de ${this.comptages.length} comptages`);

    // Grouper les comptages par référence
    const comptageGroups = new Map<string, Comptage[]>();

    this.comptages.forEach(comptage => {
      if (!comptage.reference) {
        console.log(`Ignoré : comptage avec référence vide`);
        return;
      }

      // Analyser la référence pour extraire ref, lot et sousLot
      const parseResult = this.parseReference(comptage.reference);
      const ref = parseResult.ref;
      const lot = parseResult.lot || '000';
      const sousLot = parseResult.sousLot || '001';

      // Utiliser un séparateur cohérent dans la clé de groupe
      const groupKey = `${ref}$${lot}$${sousLot}`;

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
      const reference = comptages[0].reference;
      const parts = this.parseReference(reference);
      const lot = parts.lot || '';
      const sousLot = parts.sousLot || '';
      const typeMatiere = comptages[0].typeMatiere || 'Non spécifié';

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
      let status: 'valid' | 'needsThird' | 'validWithThird' = 'needsThird'; // Par défaut besoin d'un 3e comptage
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
        // Comptage incomplet - Besoin d'un 3e comptage
        status = 'needsThird';
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
        typeMatiere,
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
    console.log(`Traitement terminé : ${this.comptageResults.length} résultats générés`);
  }

  private findOperator(operatorId: number): User | undefined {
    if (!this.operatorsCache.has(operatorId)) {
      this.operatorsCache.set(operatorId, undefined);
    }
    return this.operatorsCache.get(operatorId);
  }

  getComptageTypeName(numComptage: number): string {
    switch (numComptage) {
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

  // Méthodes de filtrage, tri et pagination
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
      switch (this.currentStatusFilter) {
        case 'valid':
          results = results.filter(r => r.status === 'valid' || r.status === 'validWithThird');
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

    // Réinitialiser à la première page quand les filtres changent
    this.currentPage = 1;
    this.updatePagination();
  }

  updatePagination(): void {
    this.totalPages = Math.ceil(this.filteredResults.length / this.itemsPerPage);
    if (this.totalPages === 0) this.totalPages = 1;

    this.paginateResults();
  }

  paginateResults(): void {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = Math.min(startIndex + this.itemsPerPage, this.filteredResults.length);

    this.paginatedResults = this.filteredResults.slice(startIndex, endIndex);
  }

  goToPage(page: number): void {
    if (page < 1) page = 1;
    if (page > this.totalPages) page = this.totalPages;

    this.currentPage = page;
    this.paginateResults();
  }

  prevPage(): void {
    this.goToPage(this.currentPage - 1);
  }

  nextPage(): void {
    this.goToPage(this.currentPage + 1);
  }

  changePageSize(size: number): void {
    this.itemsPerPage = size;
    this.currentPage = 1; // Retour à la première page
    this.updatePagination();
  }

  getPaginationArray(): (number | string)[] {
    const pages: (number | string)[] = [];

    if (this.totalPages <= 7) {
      // Si moins de 7 pages, afficher toutes les pages
      for (let i = 1; i <= this.totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Sinon, afficher les premières pages, des points de suspension et les dernières pages
      pages.push(1);

      if (this.currentPage > 3) {
        pages.push('...');
      }

      // Pages autour de la page actuelle
      const start = Math.max(2, this.currentPage - 1);
      const end = Math.min(this.totalPages - 1, this.currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (this.currentPage < this.totalPages - 2) {
        pages.push('...');
      }

      pages.push(this.totalPages);
    }

    return pages;
  }

  filterByStatus(status: 'all' | 'valid' | 'needsThird'): void {
    this.currentStatusFilter = status;
    this.applyFilters();
  }

  toggleSortOrder(): void {
    this.sortAscending = !this.sortAscending;
    this.applyFilters();
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'valid':
        return 'status-valid';
      case 'validWithThird':
        return 'status-valid-third';
      case 'needsThird':
      default:
        return 'status-needs-third';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'valid':
        return 'Valide';
      case 'validWithThird':
        return 'Validé (3e comptage)';
      case 'needsThird':
      default:
        return 'Besoin 3e comptage';
    }
  }

  doThirdCount(result: ComptageResult): void {
    this.selectedResultForThirdCount = result;
    this.showOperatorsList = true;

    // Charger la liste des opérateurs
    this.authService.getUsersByRole('OPERATEUR').subscribe({
      next: (users) => {
        this.availableOperators = users;
      },
      error: (err) => {
        console.error('Erreur lors du chargement des opérateurs:', err);
        this.showOperatorsList = false;
      }
    });
  }

  assignOperatorForThirdCount(operatorId: number): void {
    if (!this.selectedResultForThirdCount) return;

    // Naviguer vers la page de comptage avec les informations pré-remplies
    this.router.navigate(['/operator-dashboard'], {
      queryParams: {
        reference: this.selectedResultForThirdCount.reference,
        numComptage: 3,
        operatorId: operatorId
      }
    });

    this.showOperatorsList = false;
    this.selectedResultForThirdCount = null;
  }

  validateFinalCount(result: ComptageResult): void {
    console.log('Validation du comptage final pour', result.reference);
    // Implémenter la logique réelle selon votre API
  }

  showStatistics(): void {
    this.statsModal?.show();
  }

  showPreview(exportType: string): void {
    this.selectedExportType = exportType;
    this.previewResults = this.preparePreviewData(exportType);
    this.prevModal?.show();
  }

  preparePreviewData(exportType: string): any[] {
    let resultsToPreview = [...this.comptageResults];
    const previewData: any[] = [];

    // Filtrage selon le type d'export
    switch (exportType) {
      case 'valid':
        resultsToPreview = resultsToPreview.filter(r => r.status === 'valid' || r.status === 'validWithThird');
        break;
      case 'needsThird':
        resultsToPreview = resultsToPreview.filter(r => r.status === 'needsThird');
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

    // Filtrer par type de matière selon les options cochées
    resultsToPreview = resultsToPreview.filter(result => {
      const mat = (result.typeMatiere || '').trim().toLowerCase();

// 2) Filtrage par type
if (mat === 'cosse') {
  return this.includeCoseMatiere;
}
if (mat === 'fil') {
  return this.includeFileMatiere;
}
// Tout autre reste toujours inclus
return true;
    });

    // Prépare les données pour l'aperçu selon le type d'export
    if (exportType === 'comptage1') {
      resultsToPreview.forEach(result => {
        previewData.push({
          type: 'Premier Comptage',
          reference: this.extractReference(result.reference),
          lot: result.lot,
          sousLot: result.sousLot,
          typeMatiere: result.typeMatiere || 'Non spécifié',
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
          typeMatiere: result.typeMatiere || 'Non spécifié',
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
          typeMatiere: result.typeMatiere || 'Non spécifié',
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
          typeMatiere: result.typeMatiere || 'Non spécifié',
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
            typeMatiere: result.typeMatiere || 'Non spécifié',
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
            typeMatiere: result.typeMatiere || 'Non spécifié',
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
            typeMatiere: result.typeMatiere || 'Non spécifié',
            poids: result.comptage3.poids,
            operator: this.includeOperatorNames ? result.comptage3.operatorName : result.comptage3.operatorId,
            date: result.comptage3.date.toLocaleString(),
            status: this.getStatusText(result.status)
          });
        }
        if (!result.comptage1 && (result.status === 'needsThird')) {
          previewData.push({
            type: 'Résultat Final',
            reference: this.extractReference(result.reference),
            lot: result.lot,
            sousLot: result.sousLot,
            typeMatiere: result.typeMatiere || 'Non spécifié',
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
exportToExcel(): void {
  if (!this.selectedExportType) return;

  let data: any[] = [];
  let filename = 'Resultats_Comptage';
  let sheetName = 'Résultats';

  // 1) On duplique la liste brute
  let resultsToExport = [...this.comptageResults];

  // 2) Filtrage par type de matière : Cosse / Fil
  resultsToExport = resultsToExport.filter(result => {
    const mat = (result.typeMatiere || '').trim().toLowerCase();
    if (mat === 'cosse') {
      return this.includeCoseMatiere;
    }
    if (mat === 'fil') {
      return this.includeFileMatiere;
    }
    // tout autre type de matière est toujours inclus
    return true;
  });

  // 3) Filtrage selon le type de rapport
  switch (this.selectedExportType) {
    case 'valid':
      resultsToExport = resultsToExport.filter(r => r.status === 'valid' || r.status === 'validWithThird');
      filename += '_Valides';
      sheetName = 'Validés';
      break;
    case 'needsThird':
      resultsToExport = resultsToExport.filter(r => r.status === 'needsThird');
      filename += '_Besoin3eComptage';
      sheetName = 'Besoin 3e Comptage';
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

  // 4) On ajoute un suffixe si un seul type de matière est inclus
  if (this.includeCoseMatiere && !this.includeFileMatiere) {
    filename += '_CoseOnly';
  } else if (!this.includeCoseMatiere && this.includeFileMatiere) {
    filename += '_FileOnly';
  }

  // 5) Construction des données selon le type de rapport
  if (this.selectedExportType === 'comptage1') {
    data = resultsToExport.map(r => ({
      Référence: this.extractReference(r.reference),
      Lot: r.lot,
      'Sous-lot': r.sousLot,
      'Type de matière': r.typeMatiere || 'Non spécifié',
      'Poids Comptage 1 (g)': r.comptage1?.poids ?? '-',
      'Opérateur Comptage 1': this.includeOperatorNames
        ? r.comptage1?.operatorName ?? '-'
        : r.comptage1?.operatorId ?? '-',
      'Date Comptage 1': r.comptage1?.date.toLocaleString() ?? '-'
    }));
  } else if (this.selectedExportType === 'comptage2') {
    data = resultsToExport.map(r => ({
      Référence: this.extractReference(r.reference),
      Lot: r.lot,
      'Sous-lot': r.sousLot,
      'Type de matière': r.typeMatiere || 'Non spécifié',
      'Poids Comptage 2 (g)': r.comptage2?.poids ?? '-',
      'Opérateur Comptage 2': this.includeOperatorNames
        ? r.comptage2?.operatorName ?? '-'
        : r.comptage2?.operatorId ?? '-',
      'Date Comptage 2': r.comptage2?.date.toLocaleString() ?? '-'
    }));
  } else if (this.selectedExportType === 'comptage3') {
    data = resultsToExport.map(r => ({
      Référence: this.extractReference(r.reference),
      Lot: r.lot,
      'Sous-lot': r.sousLot,
      'Type de matière': r.typeMatiere || 'Non spécifié',
      'Poids Comptage 3 (g)': r.comptage3?.poids ?? '-',
      'Opérateur Comptage 3': this.includeOperatorNames
        ? r.comptage3?.operatorName ?? '-'
        : r.comptage3?.operatorId ?? '-',
      'Date Comptage 3': r.comptage3?.date.toLocaleString() ?? '-'
    }));
  } else if (this.selectedExportType === 'comptageFinal') {
    data = resultsToExport.map(r => ({
      Référence: this.extractReference(r.reference),
      Lot: r.lot,
      'Sous-lot': r.sousLot,
      'Type de matière': r.typeMatiere || 'Non spécifié',
      'Poids Final (g)': r.poidsFinal ?? '-',
      'Dernière Mise à Jour': r.lastUpdate.toLocaleString()
    }));
  } else {
    // export « Complet »
    data = resultsToExport.flatMap(r => {
      const rows: any[] = [];
      if (r.comptage1) {
        rows.push({
          'Type de comptage': 'Premier Comptage',
          Référence: this.extractReference(r.reference),
          Lot: r.lot,
          'Sous-lot': r.sousLot,
          'Type de matière': r.typeMatiere || 'Non spécifié',
          'Poids (g)': r.comptage1.poids,
          Opérateur: this.includeOperatorNames
            ? r.comptage1.operatorName
            : r.comptage1.operatorId,
          'Poids Final (g)': r.poidsFinal ?? '-',
          Date: r.comptage1.date.toLocaleString(),
          Statut: this.getStatusText(r.status)
        });
      }
      if (r.comptage2) {
        rows.push({
          'Type de comptage': 'Deuxième Comptage',
          /* … idem … */
        });
      }
      if (r.comptage3) {
        rows.push({
          'Type de comptage': 'Troisième Comptage',
          /* … idem … */
        });
      }
      if (!r.comptage1 && r.status === 'needsThird') {
        rows.push({
          'Type de comptage': 'Résultat Final',
          /* … idem … */
        });
      }
      return rows;
    });
  }

  // 6) On crée et on écrit le fichier Excel
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);

  // (Optionnel) Ajustement des colonnes selon selectedExportType…

  XLSX.writeFile(wb, `${filename}.xlsx`);
  this.prevModal?.hide();
}

}