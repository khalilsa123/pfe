import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { OperatorService } from '../../services/operator.service';
import { ComptageService } from '../../services/comptage.service';
import { AuthentificationnServiceService } from '../../services/authentificationn.service';
import { Comptage } from '../../models/comptage.model';
import { User } from '../../models/user.model';

// Interface étendue pour les comptages avec info opérateur
interface ComptageWithOperator extends Comptage {
  operatorId?: string;
  operatorName?: string;
}

@Component({
  selector: 'app-operator-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './operator-dashboard.component.html',
  styleUrls: ['./operator-dashboard.component.scss']
})
export class OperatorDashboardComponent implements OnInit {
  user?: User;
  showProfile = false;
  showUsersMenu = false;
  showInventoryManagement = false;
  
  // Propriété pour gérer le menu déroulant
  showCountingDropdown = false;
  
  // Propriétés pour les différentes listes de comptage
  showAllCounting = false;
  showCountingType1 = false;
  showCountingType2 = false;
  showCountingType3 = false;
  
  // Propriété pour gérer l'ordre de tri
  sortAscending = false;
  
  // Pour gérer l'état actif des boutons
  activeButton: 'inventory' | 'counting' | 'users' | null = null;
  
  currentUsersRole?: 'OPERATEUR' | 'SUPERVISEUR';
  users: User[] = [];
  comptages: Comptage[] = [];
  allComptages: ComptageWithOperator[] = []; // Tous les comptages du système
  filteredComptages: ComptageWithOperator[] = []; // Pour l'affichage filtré
  newComptage: Partial<Comptage> = {};
  editing = false;

  constructor(
    private authSrv: AuthentificationnServiceService,
    private opSrv: OperatorService,
    private comptageService: ComptageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.user = this.authSrv.getCurrentUser()!;
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    // On ne charge pas les comptages au démarrage
  }

  // Obtenir les initiales pour l'avatar
  getUserInitials(): string {
    if (!this.user) return '';
    return (
      (this.user.firstname?.charAt(0) || '') + 
      (this.user.lastname?.charAt(0) || '')
    ).toUpperCase();
  }

  // Basculer l'ordre de tri
  toggleSortOrder(): void {
    this.sortAscending = !this.sortAscending;
    this.applySort();
  }
  
  // Appliquer le tri
  private applySort(): void {
    this.filteredComptages.sort((a, b) => {
      const dateA = new Date(a.timestamp!).getTime();
      const dateB = new Date(b.timestamp!).getTime();
      
      return this.sortAscending ? dateA - dateB : dateB - dateA;
    });
  }

  // Basculer l'affichage du menu déroulant des comptages
  toggleCountingDropdown(): void {
    if (this.activeButton === 'counting' && this.showCountingDropdown) {
      // Si déjà actif, on ferme le menu et réinitialise l'état actif
      this.showCountingDropdown = false;
      this.closeAllCountingPanels();
      this.activeButton = null;
    } else {
      // Sinon, on active le menu des comptages
      this.showCountingDropdown = true;
      this.hideAllPanels('counting');
      this.activeButton = 'counting';
    }
  }
  
  // Fermer tous les panneaux de comptage
  private closeAllCountingPanels(): void {
    this.showAllCounting = false;
    this.showCountingType1 = false;
    this.showCountingType2 = false;
    this.showCountingType3 = false;
  }

  // Afficher/masquer le panneau d'inventaire
  toggleInventoryManagement(): void {
    if (this.activeButton === 'inventory') {
      // Si déjà actif, on ferme simplement
      this.showInventoryManagement = false;
      this.activeButton = null;
    } else {
      // Sinon, on l'active et désactive les autres
      this.showInventoryManagement = true;
      this.hideAllPanels('inventory');
      this.activeButton = 'inventory';
      
      // Charger les données
      this.loadComptages();
    }
  }

  // Afficher la liste de comptages selon le type
  showCountingList(type: 'all' | 1 | 2 | 3): void {
    // Masquer tous les panneaux sauf le menu des comptages
    this.hideAllPanels('counting');
    
    // Réinitialiser tous les états des comptages
    this.closeAllCountingPanels();
    
    // Afficher seulement le panneau demandé
    if (type === 'all') {
      this.showAllCounting = true;
    } else if (type === 1) {
      this.showCountingType1 = true;
    } else if (type === 2) {
      this.showCountingType2 = true;
    } else if (type === 3) {
      this.showCountingType3 = true;
    }
    
    // Charger les données
    this.loadComptagesByType(type);
  }
  
  // Obtenir le titre pour la liste de comptages
  getCountingListTitle(): string {
    if (this.showAllCounting) return 'Liste de tous les comptages';
    if (this.showCountingType1) return 'Liste des comptages numéro 1';
    if (this.showCountingType2) return 'Liste des comptages numéro 2';
    if (this.showCountingType3) return 'Liste des comptages numéro 3';
    return '';
  }
  
  // Masquer tous les panneaux sauf celui spécifié
  private hideAllPanels(exceptPanel: 'inventory' | 'counting' | 'users'): void {
    if (exceptPanel !== 'inventory') this.showInventoryManagement = false;
    if (exceptPanel !== 'counting') {
      // Ne pas fermer le menu déroulant des comptages
      // mais fermer les panneaux d'affichage
      this.closeAllCountingPanels();
    }
    if (exceptPanel !== 'users') this.showUsersMenu = false;
  }

  // -- UTILISATEURS --
  loadUsers(role: 'OPERATEUR' | 'SUPERVISEUR'): void {
    // Si on clique sur le même rôle déjà actif, on ferme le panneau
    if (this.activeButton === 'users' && this.currentUsersRole === role) {
      this.showUsersMenu = false;
      this.activeButton = null;
      return;
    }
    
    this.currentUsersRole = role;
    this.hideAllPanels('users');
    this.showUsersMenu = true;
    this.activeButton = 'users';
    
    this.authSrv.getUsersByRole(role).subscribe({
      next: list => this.users = list,
      error: (err: any) => console.error('Erreur chargement utilisateurs', err)
    });
  }

  goToRegister(role: 'OPERATEUR' | 'SUPERVISEUR'): void {
    this.router.navigate(['/register'], { queryParams: { role } });
  }

  canChangePassword(u: User): boolean {
    if (!this.user) return false;
    return u.role === 'OPERATEUR'
      ? (this.user.role === 'SUPERVISEUR' || this.user.role === 'ADMIN')
      : this.user.role === 'ADMIN';
  }

  changePassword(u: User): void {
    const pwd = prompt(`Nouveau mot de passe pour ${u.username}`, '');
    if (!pwd) return;
    this.authSrv.updatePassword(u.id!, { password: pwd }).subscribe({
      next: () => alert('Mot de passe mis à jour'),
      error: (err: any) => console.error('Erreur mise à jour pwd', err)
    });
  }

  canDeleteUser(u: User): boolean {
    if (!this.user) return false;
    return u.role === 'OPERATEUR'
      ? (this.user.role === 'SUPERVISEUR' || this.user.role === 'ADMIN')
      : this.user.role === 'ADMIN';
  }

  deleteUser(u: User): void {
    if (!confirm(`Supprimer ${u.username} ?`)) return;
    this.authSrv.deleteUser(u.id!).subscribe({
      next: () => this.loadUsers(this.currentUsersRole!),
      error: (err: any) => console.error('Erreur suppression utilisateur', err)
    });
  }

  logout(): void {
    this.authSrv.logout();
    this.router.navigate(['/login']);
  }

  // -- COMPTAGES --
  // Charger les comptages pour l'inventaire de l'utilisateur courant
  private loadComptages(): void {
    this.comptageService.getAllComptages().subscribe({
      next: (data: Comptage[]) => {
      this.comptages = data.sort((a: Comptage, b: Comptage) =>
        +new Date(b.timestamp!) - +new Date(a.timestamp!)
      );
      },
      error: (err: unknown) => console.error('Erreur chargement comptages', err)
    });
  }
  
  // Chargement des utilisateurs pour associer les noms d'opérateurs aux comptages
  private loadOperateurNames(comptages: Comptage[]): void {
    this.authSrv.getUsersByRole('OPERATEUR').subscribe({
      next: (operateurs: User[]) => {
        const operateursMap = new Map<number, User>();
        
        // Construire un map pour un accès rapide par ID
        operateurs.forEach(op => {
          if (op.id) {
            operateursMap.set(op.id, op);
          }
        });
        
        // Associer les infos d'opérateurs aux comptages
        this.allComptages = comptages.map(c => {
          const comptageWithOp: ComptageWithOperator = {...c};
          
          if (c.operateurId) {
            const operateur = operateursMap.get(c.operateurId);
            comptageWithOp.operatorId = c.operateurId.toString();
            comptageWithOp.operatorName = operateur ? 
              `${operateur.firstname} ${operateur.lastname}` : 
              `Opérateur #${c.operateurId}`;
          } else {
            comptageWithOp.operatorName = 'Inconnu';
          }
          
          return comptageWithOp;
        });
        
        // Trier par date décroissante (par défaut)
        this.allComptages.sort((a, b) => 
          +new Date(b.timestamp!) - +new Date(a.timestamp!)
        );
        
        // Appliquer les filtres actuels
        this.applyComptageFilter();
      },
      error: (err: any) => console.error('Erreur chargement opérateurs', err)
    });
  }
  
  // Filtrer les comptages selon le type sélectionné
  private applyComptageFilter(): void {
    if (this.showAllCounting) {
      this.filteredComptages = [...this.allComptages];
    } else if (this.showCountingType1) {
      this.filteredComptages = this.allComptages.filter(c => c.numComptage === 1);
    } else if (this.showCountingType2) {
      this.filteredComptages = this.allComptages.filter(c => c.numComptage === 2);
    } else if (this.showCountingType3) {
      this.filteredComptages = this.allComptages.filter(c => c.numComptage === 3);
    }
    
    // Appliquer le tri actuel
    this.applySort();
  }
  
  // Charger tous les comptages du système ou filtrés par type
  private loadComptagesByType(type: 'all' | 1 | 2 | 3): void {
    // Déterminer si l'utilisateur courant a accès à tous les comptages
    const isAdmin = this.user?.role === 'ADMIN';
    const isSupervisor = this.user?.role === 'SUPERVISEUR';
    
    if (isAdmin || isSupervisor) {
      // Admin ou Superviseur: accès à tous les comptages
      if (type === 'all') {
        this.comptageService.getAllComptages().subscribe({
          next: (data: Comptage[]) => this.loadOperateurNames(data),
          error: (err: any) => console.error('Erreur chargement comptages', err)
        });
      } else {
        this.comptageService.getAllComptages().subscribe({
          next: (data: Comptage[]) => {
            const filteredData = data.filter(c => c.numComptage === type);
            this.loadOperateurNames(filteredData);
          },
          error: (err: any) => console.error('Erreur chargement comptages', err)
        });
      }
    } else {
      // Opérateur: accès seulement à ses propres comptages
      this.comptageService.getAllComptages().subscribe({
        next: (data: Comptage[]) => {
          const comptagesWithOperator: ComptageWithOperator[] = data.map(c => ({
            ...c,
            operatorId: this.user?.id?.toString(),
            operatorName: `${this.user?.firstname} ${this.user?.lastname}`
          }));
          
          comptagesWithOperator.sort((a, b) => 
            +new Date(b.timestamp!) - +new Date(a.timestamp!)
          );
          
          this.allComptages = comptagesWithOperator;
          
          // Appliquer le filtre de type
          if (type === 'all') {
            this.filteredComptages = [...this.allComptages];
          } else {
            this.filteredComptages = this.allComptages.filter(c => c.numComptage === type);
          }
          
          // Appliquer le tri actuel
          this.applySort();
        },
        error: (err: any) => console.error('Erreur chargement comptages', err)
      });
    }
  }

  /** Ajout ou mise à jour */
  onSubmit(): void {
    // Si référence est fournie, on tente de remplir automatiquement les autres champs
    if (this.newComptage.reference && !this.editing) {
      // Support multiple formats: REF-LOT-SOUSLOT-QTE ou REF$LOT$SOUSLOT$QTE
      let refParts: string[] = [];
      
      if (this.newComptage.reference.includes('-')) {
        refParts = this.newComptage.reference.split('-');
      } else if (this.newComptage.reference.includes('$')) {
        refParts = this.newComptage.reference.split('$');
      }
      
      if (refParts.length >= 2) {
        // Gestion des différents cas selon le nombre de parties
        if (refParts.length >= 4) {
          // Format complet: REF$QTE$LOT$SOUSLOT
          this.newComptage.quantiteTotale = parseInt(refParts[1], 10) || 1;
          this.newComptage.numLot = refParts[2] || '00001';
          this.newComptage.numSousLot = refParts[3] || '0000';
        } else if (refParts.length === 3) {
          // Format partiel: REF$QTE$LOT (sans sous-lot)
          this.newComptage.quantiteTotale = parseInt(refParts[1], 10) || 1;
          this.newComptage.numLot = refParts[2] || '00001';
          this.newComptage.numSousLot = '0000'; // Valeur par défaut
        } else {
          // Format minimal: REF$QTE (sans lot ni sous-lot)
          this.newComptage.quantiteTotale = parseInt(refParts[1], 10) || 1;
          this.newComptage.numLot = '00001'; // Valeur par défaut
          this.newComptage.numSousLot = '0000'; // Valeur par défaut
        }
      } else {
        // Juste la référence, utiliser les valeurs par défaut
        this.newComptage.numLot = '00001';
        this.newComptage.numSousLot = '0000';
        this.newComptage.quantiteTotale = 1;
      }
    }

    if (this.editing) {
      // UPDATE
      this.comptageService.updateComptage(this.newComptage.id!, this.newComptage as Comptage).subscribe({
        next: () => {
          this.editing = false;
          this.newComptage = {};
          this.loadComptages();
        },
        error: (err: any) => console.error('Erreur mise à jour', err)
      });
    } else {
      // CREATE
      this.comptageService.addComptage(this.user!.id!, this.newComptage as Comptage).subscribe({
        next: () => {
          this.newComptage = {};
          this.loadComptages();
        },
        error: (err: any) => console.error('Erreur création', err)
      });
    }
  }

  /** Prépare l'édition */
  editComptage(c: Comptage): void {
    this.editing = true;
    this.newComptage = { ...c };
  }

  /** Suppression  */
  delete(c: Comptage): void {
    if (!c.id) return;
    if (!confirm('Supprimer ce comptage ?')) return;
    this.comptageService.deleteComptage(this.user!.id!, c.id!).subscribe({
      next: () => this.loadComptages(),
      error: (err: any) => console.error('Erreur suppression', err)
    });
  }
}