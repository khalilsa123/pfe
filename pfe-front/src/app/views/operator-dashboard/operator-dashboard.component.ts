import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { OperatorService } from '../../services/operator.service';
import { ComptageService } from '../../services/comptage.service';
import { AuthentificationnServiceService } from '../../services/authentificationn.service';
import { Comptage } from '../../models/comptage.model';
import { User } from '../../models/user.model';
import { HttpClient } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

// Interface for SessionInventaire
interface SessionInventaire {
  id?: number;
  nomSession: string;
  dateDebut: string;
  dateFin: string;
  commentaire?: string;
  comptages?: Comptage[];
}

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
  showSessionInventaire = false;
  showCreateSessionForm = false;
  showCountingDropdown = false;
  showAllCounting = false;
  showCountingType1 = false;
  showCountingType2 = false;
  showCountingType3 = false;
  
  sortAscending = false;
  
  activeButton: 'inventory' | 'session-inventaire' | 'counting' | 'users' | 'results' | null = null;
  
  currentUsersRole?: 'OPERATEUR' | 'SUPERVISEUR';
  users: User[] = [];
  comptages: Comptage[] = [];
  userComptages: Comptage[] = [];
  allComptages: ComptageWithOperator[] = [];
  filteredComptages: ComptageWithOperator[] = [];
  sessions: SessionInventaire[] = [];
  newSession: Partial<SessionInventaire> = {};
  selectedSession: SessionInventaire | null = null;
  sessionComptages: ComptageWithOperator[] = [];
  newComptage: Partial<Comptage> = {};
  editing = false;
  selectedUserId: number | null = null;

  private apiUrl = 'http://localhost:8080/api/session-inventaire'; // Adjust to your backend URL

  constructor(
    private authSrv: AuthentificationnServiceService,
    private opSrv: OperatorService,
    private comptageService: ComptageService,
    private router: Router,
    private route: ActivatedRoute,
    private http: HttpClient,
    private snackBar: MatSnackBar
  ) {
    // Add click handler to close dropdown when clicking outside
    document.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.btn-group')) {
        this.selectedUserId = null;
      }
    });
  }

  ngOnInit(): void {
    this.user = this.authSrv.getCurrentUser() || undefined;
    if (!this.user) {
      this.router.navigate(['/login']);
      return;
    }
    
    // Initialize counting with user's default type
    if (this.user.role === 'OPERATEUR' && this.user.defaultComptageType) {
      this.newComptage.numComptage = this.user.defaultComptageType;
    } else {
      this.newComptage.numComptage = 1; // Default value if no type assigned
    }
    
    if (this.user.role === 'ADMIN') {
      this.loadSessions();
    }

    // Check URL parameters
    this.route.queryParams.subscribe(params => {
      if (params['reference']) {
        this.newComptage.reference = params['reference'];
      }
      
      if (params['numComptage']) {
        this.newComptage.numComptage = +params['numComptage'];
      }
      
      // If parameters were provided, automatically open inventory section
      if (params['reference'] || params['numComptage']) {
        this.showInventoryManagement = true;
        this.hideAllPanels('inventory');
        this.activeButton = 'inventory';
      }
    });
  }

  getUserInitials(): string {
    if (!this.user) return '';
    return (
      (this.user.firstname?.charAt(0) || '') + 
      (this.user.lastname?.charAt(0) || '')
    ).toUpperCase();
  }

  // Parse the reference string into its components
  parseReference(fullReference: string): { ref: string; qte: string; lot: string; sousLot: string } {
    if (!fullReference) {
      return { ref: '', qte: '', lot: '', sousLot: '' };
    }
    const parts = fullReference.split('$');
    return {
      ref: parts[0] || '',
      qte: parts[1] || '',
      lot: parts[2] || '',
      sousLot: parts[3] || ''
    };
  }

  getComptageTypeName(numComptage: number): string {
    switch(numComptage) {
      case 1: return 'Premier Comptage';
      case 2: return 'Deuxième Comptage';
      case 3: return 'Troisième Comptage';
      default: return `Comptage ${numComptage}`;
    }
  }

  toggleSortOrder(): void {
    this.sortAscending = !this.sortAscending;
    this.applySort();
  }
  
  private applySort(): void {
    this.filteredComptages.sort((a, b) => {
      const dateA = new Date(a.timestamp!).getTime();
      const dateB = new Date(b.timestamp!).getTime();
      return this.sortAscending ? dateA - dateB : dateB - dateA;
    });
  }

  toggleCountingDropdown(): void {
    if (this.activeButton === 'counting' && this.showCountingDropdown) {
      this.showCountingDropdown = false;
      this.closeAllCountingPanels();
      this.activeButton = null;
    } else {
      this.showCountingDropdown = true;
      this.hideAllPanels('counting');
      this.activeButton = 'counting';
    }
  }
  
  private closeAllCountingPanels(): void {
    this.showAllCounting = false;
    this.showCountingType1 = false;
    this.showCountingType2 = false;
    this.showCountingType3 = false;
  }

  toggleInventoryManagement(): void {
    if (this.activeButton === 'inventory') {
      this.showInventoryManagement = false;
      this.activeButton = null;
    } else {
      this.showInventoryManagement = true;
      this.hideAllPanels('inventory');
      this.activeButton = 'inventory';
      this.loadComptages();
    }
  }

  toggleSessionInventaire(): void {
    if (this.activeButton === 'session-inventaire') {
      this.showSessionInventaire = false;
      this.showCreateSessionForm = false;
      this.selectedSession = null;
      this.sessionComptages = [];
      this.activeButton = null;
    } else {
      this.showSessionInventaire = true;
      this.hideAllPanels('session-inventaire');
      this.activeButton = 'session-inventaire';
      this.loadSessions();
    }
  }

  toggleCreateSessionForm(): void {
    this.showCreateSessionForm = !this.showCreateSessionForm;
    if (!this.showCreateSessionForm) {
      this.newSession = {};
    }
  }

  loadSessions(): void {
    this.http.get<SessionInventaire[]>(this.apiUrl).subscribe({
      next: (data) => {
        this.sessions = data;
      },
      error: (err) => {
        console.error('Erreur chargement sessions', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  createSession(): void {
    if (!this.newSession.nomSession || !this.newSession.dateDebut || !this.newSession.dateFin) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }
    this.http.post<SessionInventaire>(this.apiUrl, this.newSession).subscribe({
      next: (session) => {
        this.sessions.push(session);
        this.newSession = {};
        this.showCreateSessionForm = false;
        alert('Session créée avec succès');
      },
      error: (err) => {
        console.error('Erreur création session', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
        alert('Erreur lors de la création de la session');
      }
    });
  }

  viewSessionComptages(session: SessionInventaire): void {
    this.selectedSession = session;
    this.http.get<SessionInventaire>(`${this.apiUrl}/${session.id}`).subscribe({
      next: (data) => {
        this.sessionComptages = (data.comptages || []).map(c => {
          const comptageWithOp: ComptageWithOperator = { ...c };
          if (c.operateurId) {
            this.authSrv.getUsersByRole('OPERATEUR').subscribe({
              next: (operateurs: User[]) => {
                const operateur = operateurs.find(op => op.id === c.operateurId);
                comptageWithOp.operatorName = operateur ? 
                  `${operateur.firstname} ${operateur.lastname}` : 
                  `Opérateur #${c.operateurId}`;
              }
            });
          }
          return comptageWithOp;
        });
      },
      error: (err) => {
        console.error('Erreur chargement comptages de session', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  populateSession(sessionId: number | undefined): void {
    if (!sessionId) return;
    this.http.post<SessionInventaire>(`${this.apiUrl}/${sessionId}/populate`, {}).subscribe({
      next: (session) => {
        const index = this.sessions.findIndex(s => s.id === session.id);
        if (index !== -1) {
          this.sessions[index] = session;
        }
        alert('Session peuplée avec succès');
      },
      error: (err) => {
        console.error('Erreur peuplement session', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['//login']);
        }
        alert('Erreur lors du peuplement de la session');
      }
    });
  }

  deleteSession(sessionId: number | undefined): void {
    if (!sessionId || !confirm('Supprimer cette session ?')) return;
    this.http.delete(`${this.apiUrl}/${sessionId}`).subscribe({
      next: () => {
        this.sessions = this.sessions.filter(s => s.id !== sessionId);
        if (this.selectedSession?.id === sessionId) {
          this.selectedSession = null;
          this.sessionComptages = [];
        }
        alert('Session supprimée avec succès');
      },
      error: (err) => {
        console.error('Erreur suppression session', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
        alert('Erreur lors de la suppression de la session');
      }
    });
  }

  showCountingList(type: 'all' | 1 | 2 | 3): void {
    this.hideAllPanels('counting');
    this.closeAllCountingPanels();
    
    if (type === 'all') {
      this.showAllCounting = true;
    } else if (type === 1) {
      this.showCountingType1 = true;
    } else if (type === 2) {
      this.showCountingType2 = true;
    } else if (type === 3) {
      this.showCountingType3 = true;
    }
    
    this.loadComptagesByType(type);
  }
  
  getCountingListTitle(): string {
    if (this.showAllCounting) return 'Liste de tous les comptages';
    if (this.showCountingType1) return 'Liste des premiers comptages';
    if (this.showCountingType2) return 'Liste des deuxièmes comptages';
    if (this.showCountingType3) return 'Liste des troisièmes comptages';
    return '';
  }
  
  private hideAllPanels(exceptPanel: 'inventory' | 'session-inventaire' | 'counting' | 'users' | 'results'): void {
    if (exceptPanel !== 'inventory') this.showInventoryManagement = false;
    if (exceptPanel !== 'session-inventaire') {
      this.showSessionInventaire = false;
      this.showCreateSessionForm = false;
      this.selectedSession = null;
      this.sessionComptages = [];
    }
    if (exceptPanel !== 'counting') {
      this.closeAllCountingPanels();
    }
    if (exceptPanel !== 'users') this.showUsersMenu = false;
  }

  loadUsers(role: 'OPERATEUR' | 'SUPERVISEUR'): void {
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
      error: (err: any) => {
        console.error('Erreur chargement utilisateurs', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
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
      error: (err: any) => {
        console.error('Erreur mise à jour pwd', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
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
      error: (err: any) => {
        console.error('Erreur suppression utilisateur', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }

  logout(): void {
    this.authSrv.logout();
    this.router.navigate(['/login']);
  }

  private loadComptages(): void {
    this.comptageService.getAllComptages().subscribe({
      next: (data: Comptage[]) => {
        this.comptages = data.sort((a: Comptage, b: Comptage) =>
          +new Date(b.timestamp!) - +new Date(a.timestamp!)
        );
        this.userComptages = this.comptages.filter(
          c => c.operateurId === this.user?.id
        );
      },
      error: (err: any) => {
        console.error('Erreur chargement comptages', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }
  
  private loadOperateurNames(comptages: Comptage[]): void {
    this.authSrv.getUsersByRole('OPERATEUR').subscribe({
      next: (operateurs: User[]) => {
        const operateursMap = new Map<number, User>();
        operateurs.forEach(op => {
          if (op.id) {
            operateursMap.set(op.id, op);
          }
        });
        
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
        
        this.allComptages.sort((a, b) => 
          +new Date(b.timestamp!) - +new Date(a.timestamp!)
        );
        this.applyComptageFilter();
      },
      error: (err: any) => {
        console.error('Erreur chargement opérateurs', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        }
      }
    });
  }
  
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
    this.applySort();
  }

  goToResultsPage(): void {
    this.activeButton = 'results';
    this.hideAllPanels('results');
    this.router.navigate(['/resultats-comptage']);
  }
  
  private loadComptagesByType(type: 'all' | 1 | 2 | 3): void {
    const isAdmin = this.user?.role === 'ADMIN';
    const isSupervisor = this.user?.role === 'SUPERVISEUR';
    
    if (isAdmin || isSupervisor) {
      if (type === 'all') {
        this.comptageService.getAllComptages().subscribe({
          next: (data: Comptage[]) => this.loadOperateurNames(data),
          error: (err: any) => {
            console.error('Erreur chargement comptages', err);
            if (err.status === 401) {
              this.authSrv.logout();
              this.router.navigate(['/login']);
            }
          }
        });
      } else {
        this.comptageService.getAllComptages().subscribe({
          next: (data: Comptage[]) => {
            const filteredData = data.filter(c => c.numComptage === type);
            this.loadOperateurNames(filteredData);
          },
          error: (err: any) => {
            console.error('Erreur chargement comptages', err);
            if (err.status === 401) {
              this.authSrv.logout();
              this.router.navigate(['/login']);
            }
          }
        });
      }
    } else {
      this.comptageService.getAllComptages().subscribe({
        next: (data: Comptage[]) => {
          const userComptages = data.filter(c => c.operateurId === this.user?.id);
          const comptagesWithOperator: ComptageWithOperator[] = userComptages.map(c => ({
            ...c,
            operatorId: this.user?.id?.toString(),
            operatorName: `${this.user?.firstname} ${this.user?.lastname}`
          }));
          
          comptagesWithOperator.sort((a, b) => 
            +new Date(b.timestamp!) - +new Date(a.timestamp!)
          );
          
          this.allComptages = comptagesWithOperator;
          
          if (type === 'all') {
            this.filteredComptages = [...this.allComptages];
          } else {
            this.filteredComptages = this.allComptages.filter(c => c.numComptage === type);
          }
          
          this.applySort();
        },
        error: (err: any) => {
          console.error('Erreur chargement comptages', err);
          if (err.status === 401) {
            this.authSrv.logout();
            this.router.navigate(['/login']);
          }
        }
      });
    }
  }

  onSubmit(): void {
    // Validate reference format
    const referenceParts = this.parseReference(this.newComptage.reference || '');
    if (!referenceParts.ref || !referenceParts.qte || !referenceParts.lot || !referenceParts.sousLot) {
      alert('La référence doit être au format ref$qte$lot$sous_lot');
      return;
    }

    // Prepare the comptage object
    const comptage: Comptage = {
      ...this.newComptage,
      reference: this.newComptage.reference || '',
      quantiteTotale: parseInt(referenceParts.qte) || 0,
      numLot: referenceParts.lot,
      numSousLot: referenceParts.sousLot,
      poids: this.newComptage.poids || 0,
      numComptage: this.newComptage.numComptage || 1,
      emplacement: this.newComptage.emplacement,
      operateurId: this.user!.id!,
      timestamp: new Date().toISOString()
    } as Comptage;

    if (this.editing) {
      // UPDATE
      this.comptageService.updateComptage(this.newComptage.id!, comptage).subscribe({
        next: () => {
          this.editing = false;
          this.newComptage = {};
          this.loadComptages();
        },
        error: (err: any) => {
          console.error('Erreur mise à jour', err);
          if (err.status === 401) {
            this.authSrv.logout();
            this.router.navigate(['/login']);
            alert('Session expirée, veuillez vous reconnecter');
          } else {
            alert('Erreur lors de la mise à jour du comptage');
          }
        }
      });
    } else {
      // CREATE
      this.comptageService.addComptage(this.user!.id!, comptage).subscribe({
        next: () => {
          this.newComptage = {};
          this.loadComptages();
        },
        error: (err: any) => {
          console.error('Erreur création', err);
          if (err.status === 401) {
            this.authSrv.logout();
            this.router.navigate(['/login']);
            alert('Session expirée, veuillez vous reconnecter');
          } else {
            alert('Erreur lors de l\'ajout du comptage');
          }
        }
      });
    }
  }

  editComptage(c: Comptage): void {
    this.editing = true;
    this.newComptage = { ...c };
  }

  delete(c: Comptage): void {
    if (!c.id) return;
    if (!confirm('Supprimer ce comptage ?')) return;
    this.comptageService.deleteComptage(this.user!.id!, c.id!).subscribe({
      next: () => {
        this.loadComptages();
      },
      error: (err: any) => {
        console.error('Erreur suppression', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['//login']);
        } else {
          alert('Erreur lors de la suppression du comptage');
        }
      }
    });
  }

  toggleComptageDropdown(userId: number): void {
    // Close dropdown if clicking the same button again
    if (this.selectedUserId === userId) {
      this.selectedUserId = null;
    } else {
      this.selectedUserId = userId;
    }
  }

  assignComptageType(user: User, comptageType: number | null): void {
    if (!user.id) return;
    
    this.authSrv.updateUserDefaultComptageType(user.id, comptageType || 0).subscribe({
      next: () => {
        // Update user in local list
        user.defaultComptageType = comptageType || undefined;
        this.selectedUserId = null; // Close the dropdown
        this.snackBar.open(
          `Type de comptage ${comptageType || 'aucun'} affecté à ${user.firstname} ${user.lastname}`,
          'Fermer',
          { duration: 3000 }
        );
      },
      error: (err) => {
        console.error('Erreur lors de l\'affectation du type de comptage:', err);
        if (err.status === 401) {
          this.authSrv.logout();
          this.router.navigate(['/login']);
        } else {
          this.snackBar.open(
            'Erreur lors de l\'affectation du type de comptage',
            'Fermer',
            { duration: 3000 }
          );
        }
      }
    });
  }
}